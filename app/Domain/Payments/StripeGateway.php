<?php

namespace App\Domain\Payments;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

final readonly class StripeGateway implements PaymentGateway
{
    public function __construct(
        private StripeGatewayConfiguration $configuration,
    ) {
    }

    public function key(): string
    {
        return 'stripe';
    }

    public function initiate(PaymentAuthorization $authorization): PaymentInitiation
    {
        $credentials = $this->configuration->credentialsFor($authorization->environment);

        try {
            $response = Http::acceptJson()
                ->asForm()
                ->withBasicAuth($credentials['secret_key'], '')
                ->withHeaders([
                    'Idempotency-Key' => $authorization->attemptReference,
                ])
                ->connectTimeout(3)
                ->timeout(10)
                ->post('https://api.stripe.com/v1/payment_intents', [
                    'amount' => $authorization->amountCents,
                    'currency' => strtolower($authorization->currency),
                    'payment_method' => $authorization->paymentMethodToken,
                    'confirm' => true,
                    'metadata' => [
                        'hub_payment_attempt_reference' => $authorization->attemptReference,
                        'hub_environment' => $authorization->environment,
                    ],
                ]);
        } catch (ConnectionException $exception) {
            throw new StripeGatewayUnavailableException('O Stripe está indisponível no momento.', previous: $exception);
        }

        if ($response->successful() === false) {
            throw new StripeGatewayUnavailableException('Não foi possível iniciar o pagamento pelo Stripe.');
        }

        $paymentIntentId = $response->json('id');

        if (!is_string($paymentIntentId) || str_starts_with($paymentIntentId, 'pi_') === false) {
            throw new StripeGatewayUnavailableException('O Stripe retornou uma resposta inválida.');
        }

        $customerActionUrl = $response->json('next_action.redirect_to_url.url');

        return new PaymentInitiation(
            $paymentIntentId,
            PaymentAttemptStatus::PENDING,
            is_string($customerActionUrl) ? $customerActionUrl : null,
        );
    }
}
