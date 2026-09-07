<?php

namespace App\Domain\Orders;

use App\Models\CheckoutShippingQuote;
use Carbon\CarbonImmutable;
use DomainException;
use Illuminate\Support\Str;

final class CheckoutShippingQuoteIssuer
{
    /**
     * @param  array<int, mixed>  $rates
     * @return array<int, CheckoutShippingQuote>
     */
    public function issue(
        string $cartFingerprint,
        string $destinationFingerprint,
        array $rates,
        CarbonImmutable $expiresAt,
    ): array {
        if ($expiresAt->lessThanOrEqualTo(CarbonImmutable::now())) {
            throw new DomainException('A expiração da cotação deve estar no futuro.');
        }

        return array_map(function (mixed $rate) use ($cartFingerprint, $destinationFingerprint, $expiresAt): CheckoutShippingQuote {
            if (is_array($rate) === false) {
                throw new DomainException('Taxa de frete inválida.');
            }

            $serviceCode = $rate['id'] ?? null;
            $price = $rate['price'] ?? null;
            $deliveryTime = $rate['delivery_time'] ?? null;

            if (is_string($serviceCode) === false || is_string($price) === false || is_int($deliveryTime) === false || $deliveryTime < 0) {
                throw new DomainException('Taxa de frete inválida.');
            }

            return CheckoutShippingQuote::query()->create([
                'token' => (string) Str::uuid(),
                'cart_fingerprint' => $cartFingerprint,
                'destination_fingerprint' => $destinationFingerprint,
                'provider' => 'melhor_envio',
                'service_code' => $serviceCode,
                'shipping_cents' => $this->toCents($price),
                'estimated_delivery_days' => $deliveryTime,
                'expires_at' => $expiresAt,
            ]);
        }, $rates);
    }

    private function toCents(string $amount): int
    {
        if (preg_match('/^\d+(?:\.\d{1,2})?$/', $amount) !== 1) {
            throw new DomainException('Valor de frete inválido.');
        }

        [$whole, $fraction = ''] = explode('.', $amount, 2);

        $fraction = str_pad($fraction, 2, '0', STR_PAD_RIGHT);

        return ((int) $whole * 100) + (int) $fraction;
    }
}
