<?php

namespace App\Domain\ProviderConnections;

use App\Models\ProviderAuthorizationState;
use Illuminate\Support\Arr;
use LogicException;

final readonly class ProviderAuthorizationUrlFactory
{
    public function __construct(private ProviderOAuthConfiguration $configuration) {}

    public function make(ProviderAuthorizationState $authorization, string $state): string
    {
        $installation = $authorization->installation;

        if ($installation === null || $installation->connection_strategy !== 'OAUTH') {
            throw new LogicException('A instalação não usa OAuth por redirecionamento.');
        }

        $parameters = match ($installation->provider) {
            'mercado_pago' => [
                'client_id' => $this->configuration->clientId($installation),
                'response_type' => 'code',
                'platform_id' => 'mp',
                'state' => $state,
                'redirect_uri' => $this->configuration->callbackUrl('mercado_pago'),
                'code_challenge' => $this->pkceChallenge($authorization),
                'code_challenge_method' => 'S256',
            ],
            'pagbank' => [
                'client_id' => $this->configuration->clientId($installation),
                'response_type' => 'code',
                'redirect_uri' => $this->configuration->callbackUrl('pagbank'),
                'scope' => implode(' ', [
                    'payments.read',
                    'payments.create',
                    'payments.refund',
                    'accounts.read',
                    'checkout.create',
                    'checkout.view',
                    'checkout.update',
                ]),
                'state' => $state,
            ],
            default => throw new LogicException('Não existe URL OAuth para este provedor.'),
        };

        return $this->configuration->authorizationUrl($installation).'?'.http_build_query(
            Arr::whereNotNull($parameters),
            '',
            '&',
            PHP_QUERY_RFC3986,
        );
    }

    private function pkceChallenge(ProviderAuthorizationState $authorization): string
    {
        $verifier = $authorization->pkce_verifier;

        if (! is_string($verifier) || blank($verifier)) {
            throw new LogicException('O verifier PKCE da autorização não está disponível.');
        }

        return rtrim(strtr(base64_encode(hash('sha256', $verifier, true)), '+/', '-_'), '=');
    }
}
