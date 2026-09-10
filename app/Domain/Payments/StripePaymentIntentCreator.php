<?php

namespace App\Domain\Payments;

use App\Models\PaymentAttempt;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

final readonly class StripePaymentIntentCreator
{
    public function __construct(
        private StripeGatewayConfiguration $configuration,
    ) {}

    /**
     * @return array{id: string, client_secret: string, publishable_key: string}
     */
    public function create(PaymentAttempt $attempt): array
    {
        $credentials = $this->configuration->credentialsFor($attempt->environment);

        if (! is_string($credentials['publishable_key']) || blank($credentials['publishable_key'])) {
            throw new StripeGatewayUnavailableException('A chave publicável do Stripe não está configurada para este ambiente.');
        }

        try {
            if ($attempt->gateway_payment_id === null && $attempt->initiated_at?->lt(now()->subHours(23))) {
                throw new StripeGatewayUnavailableException('A tentativa exige reconciliação antes de uma nova cobrança.');
            }
            $client = Http::acceptJson()
                ->asForm()
                ->withBasicAuth($credentials['secret_key'], '')
                ->withHeaders(['Idempotency-Key' => $attempt->idempotency_key])
                ->connectTimeout(3)
                ->timeout(10);
            $response = $attempt->gateway_payment_id !== null
                ? $client->get('https://api.stripe.com/v1/payment_intents/'.rawurlencode($attempt->gateway_payment_id))
                : $client->post('https://api.stripe.com/v1/payment_intents', [
                    'amount' => $attempt->amount_cents,
                    'currency' => strtolower($attempt->currency),
                    'payment_method_types' => ['card'],
                    'metadata' => [
                        'hub_payment_attempt_reference' => $attempt->idempotency_key,
                        'hub_order_id' => $attempt->order_id,
                        'hub_environment' => $attempt->environment,
                    ],
                ]);
        } catch (ConnectionException $exception) {
            throw new StripeGatewayUnavailableException('O Stripe está indisponível no momento.', previous: $exception);
        }

        $id = $response->json('id');
        $clientSecret = $response->json('client_secret');

        if (
            $response->successful() === false
            || ! is_string($id)
            || ! str_starts_with($id, 'pi_')
            || ! is_string($clientSecret)
            || blank($clientSecret)
            || $response->json('amount') !== $attempt->amount_cents
            || $response->json('currency') !== strtolower($attempt->currency)
            || $response->json('livemode') !== ($attempt->environment === StripeGatewayConfiguration::PRODUCTION)
            || ($attempt->gateway_payment_id !== null && $id !== $attempt->gateway_payment_id)
        ) {
            throw new StripeGatewayUnavailableException('Não foi possível iniciar o pagamento pelo Stripe.');
        }

        return [
            'id' => $id,
            'client_secret' => $clientSecret,
            'publishable_key' => $credentials['publishable_key'],
        ];
    }
}
