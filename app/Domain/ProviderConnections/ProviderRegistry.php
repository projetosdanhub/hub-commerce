<?php

namespace App\Domain\ProviderConnections;

final class ProviderRegistry
{
    public const SANDBOX = 'SANDBOX';

    public const PRODUCTION = 'PRODUCTION';

    /**
     * @return array<string, array{name: string, strategy: string, methods: array<int, string>}>
     */
    public function all(): array
    {
        return [
            'stripe' => ['name' => 'Stripe', 'strategy' => 'CONNECT', 'methods' => ['CARD', 'APPLE_PAY', 'GOOGLE_PAY']],
            'mercado_pago' => ['name' => 'Mercado Pago', 'strategy' => 'OAUTH', 'methods' => ['CARD', 'PIX', 'BOLETO']],
            'pagbank' => ['name' => 'PagBank', 'strategy' => 'OAUTH', 'methods' => ['CARD', 'PIX', 'BOLETO']],
            'pagarme' => ['name' => 'Pagar.me', 'strategy' => 'API_KEYS', 'methods' => ['CARD', 'PIX', 'BOLETO']],
        ];
    }

    /**
     * @return array{name: string, strategy: string, methods: array<int, string>}
     */
    public function require(string $provider): array
    {
        $provider = strtolower($provider);
        $definition = $this->all()[$provider] ?? null;

        if ($definition === null) {
            throw new \InvalidArgumentException('Provedor indisponível.');
        }

        return $definition;
    }
}
