<?php

namespace App\Domain\Payments;

use App\Enums\OrderStatus;
use App\Models\PaymentAttempt;
use App\Models\StripeWebhookEvent;
use Illuminate\Database\QueryException;
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

        if (! is_array($event) || ! is_string($event['id'] ?? null) || ! is_string($event['type'] ?? null)) {
            throw new InvalidArgumentException('Evento Stripe inválido.');
        }

        $environment = ($event['livemode'] ?? false) === true
            ? StripeGatewayConfiguration::PRODUCTION
            : StripeGatewayConfiguration::SANDBOX;
        $credentials = $this->configuration->credentialsFor($environment);
        $this->assertSignature($payload, $signature, $credentials['webhook_secret']);

        return DB::transaction(function () use ($event, $payload, $environment): bool {
            try {
                $receipt = StripeWebhookEvent::query()->create([
                    'event_id' => $event['id'],
                    'type' => $event['type'],
                    'environment' => $environment,
                    'payload_hash' => hash('sha256', $payload),
                    'received_at' => now(),
                ]);
            } catch (QueryException) {
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

                $status = $this->statusFor($event['type']);

                if ($attempt !== null && $status !== null) {
                    $attempt->update([
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

        $parts = collect(explode(',', $signature))
            ->mapWithKeys(function (string $part): array {
                [$key, $value] = array_pad(explode('=', $part, 2), 2, null);

                return [trim((string) $key) => trim((string) $value)];
            });
        $timestamp = $parts->get('t');
        $receivedSignature = $parts->get('v1');

        if (! ctype_digit((string) $timestamp) || ! is_string($receivedSignature) || abs(now()->timestamp - (int) $timestamp) > 300) {
            throw new InvalidArgumentException('Assinatura do Stripe inválida.');
        }

        $expectedSignature = hash_hmac('sha256', $timestamp.'.'.$payload, $secret);

        if (! hash_equals($expectedSignature, $receivedSignature)) {
            throw new InvalidArgumentException('Assinatura do Stripe inválida.');
        }
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
