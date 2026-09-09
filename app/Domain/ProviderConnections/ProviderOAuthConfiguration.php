<?php

namespace App\Domain\ProviderConnections;

use App\Models\ProviderInstallation;
use LogicException;

final class ProviderOAuthConfiguration
{
    public function isConfigured(ProviderInstallation $installation): bool
    {
        return match ($installation->provider) {
            'mercado_pago', 'pagbank' => filled($this->clientId($installation))
                && filled($this->clientSecret($installation)),
            'stripe' => filled(config('provider-connections.stripe.secret_key')),
            default => false,
        };
    }

    public function callbackUrl(string $provider): string
    {
        $baseUrl = rtrim((string) config('provider-connections.redirect_base_url'), '/');

        if (blank($baseUrl)) {
            throw new LogicException('A URL pública da plataforma precisa estar configurada antes de conectar provedores.');
        }

        return $baseUrl.'/api/oauth/'.$provider.'/callback';
    }

    public function clientId(ProviderInstallation $installation): string
    {
        return $this->requiredString($installation->provider.'.client_id');
    }

    public function clientSecret(ProviderInstallation $installation): string
    {
        return $this->requiredString($installation->provider.'.client_secret');
    }

    public function authorizationUrl(ProviderInstallation $installation): string
    {
        $environment = strtolower($installation->environment);

        return match ($installation->provider) {
            'mercado_pago' => $this->requiredString('mercado_pago.authorization_url'),
            'pagbank' => $this->requiredString('pagbank.'.$environment.'_authorization_url'),
            default => throw new LogicException('Este provedor não usa OAuth por redirecionamento.'),
        };
    }

    public function tokenUrl(ProviderInstallation $installation): string
    {
        $environment = strtolower($installation->environment);

        return match ($installation->provider) {
            'mercado_pago' => $this->requiredString('mercado_pago.token_url'),
            'pagbank' => $this->requiredString('pagbank.'.$environment.'_token_url'),
            default => throw new LogicException('Este provedor não usa troca OAuth por código.'),
        };
    }

    private function requiredString(string $key): string
    {
        $value = config('provider-connections.'.$key);

        if (! is_string($value) || blank($value)) {
            throw new LogicException('A configuração de plataforma necessária não está disponível.');
        }

        return $value;
    }
}
