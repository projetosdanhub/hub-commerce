<?php

namespace App\Domain\Shipping;

use App\Models\Produto;
use App\Models\ShippingBenefitRule;
use Carbon\CarbonImmutable;

final class ShippingBenefitResolver
{
    /**
     * @return array<int, array{source: string, scope: string, amount_cents: int, reference: string}>
     */
    public function benefitsFor(array $pricedItems, int $shippingCents): array
    {
        if ($shippingCents === 0 || $pricedItems === []) {
            return [];
        }

        $productIds = collect($pricedItems)->map(static fn (array $item): int => (int) $item['product']->getKey())->unique()->values();
        $subtotalCents = collect($pricedItems)->sum(static fn (array $item): int => $item['line_total_cents']);

        if ($this->allProductsHaveFreeShipping($pricedItems)) {
            return [$this->shippingBenefit($shippingCents, 'product-free-shipping')];
        }

        $rules = ShippingBenefitRule::query()
            ->where('is_active', true)
            ->where(static fn ($query) => $query->whereNull('starts_at')->orWhere('starts_at', '<=', CarbonImmutable::now()))
            ->where(static fn ($query) => $query->whereNull('ends_at')->orWhere('ends_at', '>', CarbonImmutable::now()))
            ->where(static fn ($query) => $query->whereNull('product_id')->orWhereIn('product_id', $productIds))
            ->orderBy('priority')->orderBy('id')->get();

        foreach ($rules as $rule) {
            if ($rule->type === ShippingBenefitRule::FREE_FOR_ALL) {
                return [$this->shippingBenefit($shippingCents, 'shipping-rule:'.$rule->getKey())];
            }

            if ($rule->type === ShippingBenefitRule::FREE_FOR_PRODUCT && $this->allProductsMatchRule($pricedItems, (int) $rule->product_id)) {
                return [$this->shippingBenefit($shippingCents, 'shipping-rule:'.$rule->getKey())];
            }

            if ($rule->type === ShippingBenefitRule::FREE_ABOVE_SUBTOTAL && $rule->minimum_order_cents !== null && $subtotalCents >= $rule->minimum_order_cents) {
                return [$this->shippingBenefit($shippingCents, 'shipping-rule:'.$rule->getKey())];
            }

            if ($rule->type === ShippingBenefitRule::PERCENTAGE && $rule->percentage !== null) {
                $discount = intdiv($shippingCents * $rule->percentage, 100);

                if ($discount > 0) {
                    return [$this->shippingBenefit($discount, 'shipping-rule:'.$rule->getKey())];
                }
            }
        }

        return [];
    }

    private function allProductsHaveFreeShipping(array $pricedItems): bool
    {
        foreach ($pricedItems as $item) {
            if ($item['product']->frete_gratis !== true) {
                return false;
            }
        }

        return true;
    }

    private function allProductsMatchRule(array $pricedItems, int $productId): bool
    {
        return $productId > 0 && collect($pricedItems)->every(static fn (array $item): bool => (int) $item['product']->getKey() === $productId);
    }

    /**
     * @return array{source: string, scope: string, amount_cents: int, reference: string}
     */
    private function shippingBenefit(int $amountCents, string $reference): array
    {
        return ['source' => 'STORE', 'scope' => 'SHIPPING', 'amount_cents' => $amountCents, 'reference' => $reference];
    }
}
