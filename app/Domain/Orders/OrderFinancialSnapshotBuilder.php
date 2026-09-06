<?php

namespace App\Domain\Orders;

use InvalidArgumentException;

final class OrderFinancialSnapshotBuilder
{
    public const VERSION = 1;

    /**
     * @param array<int, array{source: string, scope: string, amount_cents: int, reference?: string}> $benefits
     * @return array<string, mixed>
     */
    public function build(
        int $productSubtotalCents,
        int $shippingCents,
        array $benefits,
        string $currency = 'BRL',
    ): array {
        if ($productSubtotalCents < 0 || $shippingCents < 0) {
            throw new InvalidArgumentException('As bases financeiras não podem ser negativas.');
        }

        $bases = [
            'PRODUCT' => $productSubtotalCents,
            'SHIPPING' => $shippingCents,
        ];
        $remaining = $bases;
        $normalizedBenefits = [];

        usort($benefits, fn (array $left, array $right): int => $this->priority($left['source'] ?? '') <=> $this->priority($right['source'] ?? ''));

        foreach ($benefits as $benefit) {
            $source = strtoupper((string) ($benefit['source'] ?? ''));
            $scope = strtoupper((string) ($benefit['scope'] ?? ''));
            $amountCents = $benefit['amount_cents'] ?? null;

            if (! in_array($source, ['COUPON', 'VIP', 'STORE'], true) || ! array_key_exists($scope, $bases) || ! is_int($amountCents) || $amountCents < 0) {
                throw new InvalidArgumentException('Benefício financeiro inválido.');
            }

            if ($amountCents > $remaining[$scope]) {
                throw new InvalidArgumentException('O benefício excede a base elegível.');
            }

            $remaining[$scope] -= $amountCents;
            $normalizedBenefits[] = [
                'source' => $source,
                'scope' => $scope,
                'amount_cents' => $amountCents,
                'reference' => $benefit['reference'] ?? null,
            ];
        }

        return [
            'version' => self::VERSION,
            'currency' => $currency,
            'product_subtotal_cents' => $productSubtotalCents,
            'shipping_cents' => $shippingCents,
            'gross_total_cents' => $productSubtotalCents + $shippingCents,
            'benefits' => $normalizedBenefits,
            'product_total_cents' => $remaining['PRODUCT'],
            'shipping_total_cents' => $remaining['SHIPPING'],
            'net_total_cents' => $remaining['PRODUCT'] + $remaining['SHIPPING'],
        ];
    }

    private function priority(string $source): int
    {
        return match (strtoupper($source)) {
            'COUPON' => 0,
            'VIP' => 1,
            'STORE' => 2,
            default => 3,
        };
    }
}
