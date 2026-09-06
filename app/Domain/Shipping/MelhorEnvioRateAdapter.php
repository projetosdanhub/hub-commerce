<?php

namespace App\Domain\Shipping;

use App\Models\MelhorEnvioSetting;
use DomainException;
use Illuminate\Support\Facades\Http;

final class MelhorEnvioRateAdapter
{
    /**
     * @param array{height: float|int|string, width: float|int|string, length: float|int|string, weight: float|int|string} $package
     * @return array<int, array{id: string, price: string, delivery_time: int}>
     */
    public function calculate(
        MelhorEnvioSetting $config,
        string $destinationPostalCode,
        array $package,
        string $insuranceValue,
    ): array {
        if ($config->access_token === null || $config->access_token === '') {
            throw new DomainException('Melhor Envio não conectado.');
        }

        $senderPostalCode = $config->sender_info['cep'] ?? null;

        if (! is_string($senderPostalCode) || $senderPostalCode === '') {
            throw new DomainException('Endereço da loja não configurado.');
        }

        $response = Http::withToken($config->access_token)
            ->acceptJson()
            ->withUserAgent('HUB Commerce (suporte@hubcommerce.com)')
            ->post($this->baseUrl($config).'/api/v2/me/shipment/calculate', [
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

        if (! $response->successful() || ! is_array($response->json())) {
            throw new DomainException('Não foi possível calcular o frete.');
        }

        return collect($response->json())
            ->filter(fn (mixed $rate): bool => is_array($rate) && ! isset($rate['error']))
            ->map(function (array $rate): array {
                $price = $rate['price'] ?? null;
                $deliveryTime = $rate['delivery_time'] ?? null;
                $serviceId = $rate['id'] ?? null;

                if (! is_numeric($price) || ! is_numeric($deliveryTime) || $serviceId === null) {
                    throw new DomainException('O provedor retornou uma cotação inválida.');
                }

                return [
                    'id' => (string) $serviceId,
                    'price' => number_format((float) $price, 2, '.', ''),
                    'delivery_time' => (int) $deliveryTime,
                ];
            })
            ->values()
            ->all();
    }

    private function baseUrl(MelhorEnvioSetting $config): string
    {
        return $config->environment === 'PRODUCTION'
            ? 'https://www.melhorenvio.com.br'
            : 'https://sandbox.melhorenvio.com.br';
    }

    private function postalCode(string $postalCode): string
    {
        return preg_replace('/\D/', '', $postalCode);
    }
}
