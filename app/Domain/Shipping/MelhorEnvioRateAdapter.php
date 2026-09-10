<?php

namespace App\Domain\Shipping;

use App\Models\MelhorEnvioSetting;
use DomainException;
use Illuminate\Support\Facades\Http;

final class MelhorEnvioRateAdapter
{
    /**
     * @param  array{height: float|int|string, width: float|int|string, length: float|int|string, weight: float|int|string}  $package
     * @return array<int, array{id: string, price: string, delivery_time: int}>
     */
    public function calculate(
        MelhorEnvioSetting $config,
        string $destinationPostalCode,
        array $package,
        string $insuranceValue,
        ?string $accessToken = null,
        ?string $environment = null,
    ): array {
        $environment ??= $config->environment;
        if (! in_array($environment, ['SANDBOX', 'PRODUCTION'], true) || $environment !== $config->environment) {
            throw new DomainException('Ambiente de frete inválido.');
        }
        if (app()->environment('production') && $environment !== 'PRODUCTION') {
            throw new DomainException('Frete Sandbox não está disponível nesta implantação.');
        }
        $accessToken ??= $config->oauthAccessToken();

        if ($accessToken === null || $accessToken === '') {
            throw new DomainException('Melhor Envio não conectado.');
        }

        $senderInfo = $config->sender_info;

        if (is_array($senderInfo) === false) {
            throw new DomainException('Endereço da loja não configurado.');
        }

        $senderPostalCode = $senderInfo['cep'] ?? null;

        if (is_string($senderPostalCode) === false || $senderPostalCode === '') {
            throw new DomainException('Endereço da loja não configurado.');
        }

        foreach (['height', 'width', 'length', 'weight'] as $field) {
            if (! is_numeric($package[$field] ?? null) || ! is_finite((float) $package[$field]) || (float) $package[$field] <= 0) {
                throw new DomainException('Dimensões e peso precisam ser positivos.');
            }
        }
        if (preg_match('/^\d{1,9}(?:\.\d{1,2})?$/', $insuranceValue) !== 1) {
            throw new DomainException('Valor declarado inválido.');
        }

        try {
            $response = Http::withToken($accessToken)
            ->acceptJson()
            ->withUserAgent((string) config('provider-connections.melhor_envio.user_agent'))
            ->connectTimeout(3)
            ->timeout(10)
            ->post($this->baseUrl($config, $environment).'/api/v2/me/shipment/calculate', [
                'from' => ['postal_code' => $this->postalCode($senderPostalCode)],
                'to' => ['postal_code' => $this->postalCode($destinationPostalCode)],
                'package' => [
                    'height' => (float) $package['height'],
                    'width' => (float) $package['width'],
                    'length' => (float) $package['length'],
                    'weight' => (float) $package['weight'],
                ],
                'options' => [
                    'insurance_value' => (float) $insuranceValue,
                    'receipt' => false,
                    'own_hand' => false,
                ],
            ]);

        } catch (\Illuminate\Http\Client\ConnectionException) {
            throw new DomainException('O serviço de frete está temporariamente indisponível.');
        }

        $payload = $response->json();

        if ($response->successful() === false || is_array($payload) === false) {
            throw new DomainException('Não foi possível calcular o frete.');
        }

        $enabled = collect($config->carriers_ativas ?? [])
            ->filter(fn ($service): bool => is_array($service) && ($service['ativo'] ?? false) === true)
            ->map(fn ($service): string => (string) ($service['id'] ?? ''))
            ->all();

        return collect($payload)
            ->filter(fn (mixed $rate): bool => is_array($rate) && isset($rate['error']) === false)
            ->filter(fn (array $rate): bool => in_array((string) ($rate['id'] ?? ''), $enabled, true))
            ->map(function (mixed $rate): array {
                $price = $rate['price'] ?? null;
                $deliveryTime = $rate['delivery_time'] ?? null;
                $serviceId = $rate['id'] ?? null;

                if (preg_match('/^\d{1,9}(?:\.\d{1,2})?$/', (string) $price) !== 1 || filter_var($deliveryTime, FILTER_VALIDATE_INT) === false || (int) $deliveryTime < 0 || $serviceId === null) {
                    throw new DomainException('O provedor retornou uma cotação inválida.');
                }

                return [
                    'id' => (string) $serviceId,
                    'price' => explode('.', (string) $price)[0].'.'.str_pad(explode('.', (string) $price)[1] ?? '', 2, '0'),
                    'delivery_time' => (int) $deliveryTime,
                ];
            })
            ->values()
            ->all();
    }

    /** @return array<int, array{id: string, nome: string, ativo: bool}> */
    public function services(MelhorEnvioSetting $config): array
    {
        try {
            $response = Http::withToken($config->oauthAccessToken())
                ->acceptJson()
                ->withUserAgent((string) config('provider-connections.melhor_envio.user_agent'))
                ->connectTimeout(3)
                ->timeout(10)
                ->get($this->baseUrl($config).'/api/v2/me/shipment/services');
        } catch (\Illuminate\Http\Client\ConnectionException) {
            throw new DomainException('Não foi possível consultar os serviços do Melhor Envio.');
        }
        if (! $response->successful() || ! is_array($response->json())) {
            throw new DomainException('Não foi possível consultar os serviços do Melhor Envio.');
        }
        $enabled = collect($config->carriers_ativas ?? [])->keyBy('id');

        return collect($response->json())->map(function ($service) use ($enabled): array {
            if (! is_array($service) || ! isset($service['id']) || ! is_string($service['name'] ?? null)) {
                throw new DomainException('O catálogo de serviços retornado é inválido.');
            }
            $id = (string) $service['id'];
            $company = $service['company']['name'] ?? '';

            return [
                'id' => $id,
                'nome' => trim((is_string($company) ? $company : '').' '.$service['name']),
                'ativo' => ($enabled->get($id)['ativo'] ?? false) === true,
            ];
        })->values()->all();
    }

    private function baseUrl(MelhorEnvioSetting $config, ?string $environment = null): string
    {
        return ($environment ?? $config->environment) === 'PRODUCTION'
            ? 'https://www.melhorenvio.com.br'
            : 'https://sandbox.melhorenvio.com.br';
    }

    private function postalCode(string $postalCode): string
    {
        $normalized = preg_replace('/\D/', '', $postalCode);
        if (strlen($normalized) !== 8) {
            throw new DomainException('CEP inválido.');
        }

        return $normalized;
    }
}
