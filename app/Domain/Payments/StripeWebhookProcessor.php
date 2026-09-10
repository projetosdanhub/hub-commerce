<?php

namespace App\Domain\Payments;

use App\Enums\OrderStatus;
use App\Models\PaymentAttempt;
use App\Models\StripeWebhookEvent;
use App\Services\OrderStatusTransitionService;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

final readonly class StripeWebhookProcessor
{
    public function __construct(
        private StripeGatewayConfiguration $configuration,
        private OrderStatusTransitionService $orderTransitions,
    ) {}

    public function process(string $payload, ?string $signature): bool
    {
        $event = json_decode($payload, true, flags: JSON_THROW_ON_ERROR);

        if (! is_array($event) || ! is_string($event['id'] ?? null) || ! is_string($event['type'] ?? null) || ! is_bool($event['livemode'] ?? null)) {
            throw new InvalidArgumentException('Evento Stripe inválido.');
        }

        $environment = ($event['livemode'] ?? false) === true
            ? StripeGatewayConfiguration::PRODUCTION
            : StripeGatewayConfiguration::SANDBOX;
        $credentials = $this->configuration->credentialsFor($environment);
        $this->assertSignature($payload, $signature, $credentials['webhook_secret']);

        return DB::transaction(function () use ($event, $payload, $environment): bool {
            $receipt = StripeWebhookEvent::query()->firstOrCreate(
                ['event_id' => $event['id']],
                [
                    'type' => $event['type'],
                    'environment' => $environment,
                    'payload_hash' => hash('sha256', $payload),
                    'received_at' => now(),
                ],
            );
            if (! $receipt->wasRecentlyCreated) {
                return false;
            }

            $paymentIntent = $event['data']['object'] ?? [];
            $paymentIntentId = is_array($paymentIntent) ? ($paymentIntent['id'] ?? null) : null;

            if (is_string($paymentIntentId)) {
                $attempt = PaymentAttempt::query()
                    ->where('gateway', 'stripe')
                    ->where('environment', $environment)
                    ->where('gateway_payment_id', $paymentIntentId)
                    ->lockForUpdate()
                    ->first();

                // O webhook pode chegar antes de a resposta HTTP do Stripe ser persistida.
                $reference = $paymentIntent['metadata']['hub_payment_attempt_reference'] ?? null;
                if ($attempt === null && is_string($reference)) {
                    $attempt = PaymentAttempt::query()
                        ->where('gateway', 'stripe')
                        ->where('environment', $environment)
                        ->where('idempotency_key', $reference)
                        ->whereNull('gateway_payment_id')
                        ->lockForUpdate()
                        ->first();
                }

                $status = $this->statusFor($event['type']);

                if ($attempt !== null && $status !== null) {
                    if (
                        ! is_int($paymentIntent['amount'] ?? null)
                        || $paymentIntent['amount'] !== $attempt->amount_cents
                        || ! is_string($paymentIntent['currency'] ?? null)
                        || strtoupper($paymentIntent['currency']) !== strtoupper($attempt->currency)
                        || ($status === PaymentAttemptStatus::SUCCEEDED
                            && ($paymentIntent['amount_received'] ?? null) !== $attempt->amount_cents)
                    ) {
                        throw new InvalidArgumentException('O valor ou a moeda do pagamento não corresponde à tentativa.');
                    }

                    // Um evento atrasado de falha/cancelamento nunca rebaixa uma cobrança paga.
                    if ($attempt->status === PaymentAttemptStatus::SUCCEEDED) {
                        $receipt->update(['processed_at' => now()]);

                        return true;
                    }

                    $attempt->update([
                        'gateway_payment_id' => $paymentIntentId,
                        'status' => $status,
                        'failure_code' => $status === PaymentAttemptStatus::FAILED ? ($paymentIntent['last_payment_error']['code'] ?? 'stripe_payment_failed') : null,
                        'processed_at' => now(),
                    ]);

                    if (
                        $status === PaymentAttemptStatus::SUCCEEDED
                        && $attempt->order !== null
                        && $attempt->order->status === OrderStatus::AWAITING_PAYMENT
                    ) {
                        $this->orderTransitions->transition(
                            $attempt->order,
                            OrderStatus::PICKING,
                            'Pagamento confirmado pelo webhook Stripe.',
                        );
                    }
                }
            }

            $receipt->update(['processed_at' => now()]);

            return true;
        });
    }

    private function assertSignature(string $payload, ?string $signature, ?string $secret): void
    {
        if (! is_string($signature) || ! is_string($secret) || blank($secret)) {
            throw new InvalidArgumentException('Assinatura do Stripe ausente.');
        }

        $timestamp = null;
        $signatures = [];
        foreach (explode(',', $signature) as $part) {
            [$key, $value] = array_pad(explode('=', trim($part), 2), 2, '');
            if ($key === 't') {
                $timestamp = $value;
            } elseif ($key === 'v1') {
                $signatures[] = $value;
            }
        }

        if (! ctype_digit((string) $timestamp) || abs(now()->timestamp - (int) $timestamp) > 300) {
            throw new InvalidArgumentException('Assinatura do Stripe inválida.');
        }

        $expected = hash_hmac('sha256', $timestamp.'.'.$payload, $secret);
        foreach ($signatures as $received) {
            if (hash_equals($expected, $received)) {
                return;
            }
        }

        throw new InvalidArgumentException('Assinatura do Stripe inválida.');
    }

    private function statusFor(string $eventType): ?PaymentAttemptStatus
    {
        return match ($eventType) {
            'payment_intent.succeeded' => PaymentAttemptStatus::SUCCEEDED,
            'payment_intent.payment_failed' => PaymentAttemptStatus::FAILED,
            'payment_intent.canceled' => PaymentAttemptStatus::CANCELLED,
            default => null,
        };
    }
}
