<?php

namespace App\Domain\Orders;

use App\Enums\ProductStatus;
use App\Models\Produto;
use DomainException;
use InvalidArgumentException;

final class CheckoutPricingService
{
    /**
     * @param array<int, array{id: int, quantity: int}> $requestedItems
     * @return array{product_subtotal_cents: int, items: array<int, array{product: Produto, quantity: int, unit_price_cents: int, line_total_cents: int}>}
     */
    public function priceItems(array $requestedItems): array
    {
        if ($requestedItems === []) {
            throw new InvalidArgumentException('O carrinho deve conter ao menos um item.');
        }

        $quantitiesByProductId = [];

        foreach ($requestedItems as $requestedItem) {
            $productId = $requestedItem['id'] ?? null;
            $quantity = $requestedItem['quantity'] ?? null;

            if (! is_int($productId) || $productId < 1 || ! is_int($quantity) || $quantity < 1) {
                throw new InvalidArgumentException('Item de checkout inválido.');
            }

            $quantitiesByProductId[$productId] = ($quantitiesByProductId[$productId] ?? 0) + $quantity;
        }

        $products = Produto::query()
            ->whereIn('id', array_keys($quantitiesByProductId))
            ->get()
            ->keyBy('id');

        if ($products->count() !== count($quantitiesByProductId)) {
            throw new DomainException('Um ou mais produtos não estão disponíveis.');
        }

        $items = [];
        $productSubtotalCents = 0;

        foreach ($quantitiesByProductId as $productId => $quantity) {
            /** @var Produto $product */
            $product = $products->get($productId);

            if (! $product->ativo || $product->status_vitrine !== ProductStatus::ACTIVE) {
                throw new DomainException('Um ou mais produtos não estão disponíveis.');
            }

            if ($product->controlar_estoque && ! $product->pre_venda && $product->quantidade_estoque < $quantity) {
                throw new DomainException('Estoque insuficiente para um ou mais produtos.');
            }

            $unitPriceCents = $this->toCents(
                $product->preco_promo !== null ? $product->preco_promo : $product->preco,
            );
            $lineTotalCents = $unitPriceCents * $quantity;
            $productSubtotalCents += $lineTotalCents;

            $items[] = [
                'product' => $product,
                'quantity' => $quantity,
                'unit_price_cents' => $unitPriceCents,
                'line_total_cents' => $lineTotalCents,
            ];
        }

        return [
            'product_subtotal_cents' => $productSubtotalCents,
            'items' => $items,
        ];
    }

    private function toCents(string|int|float $amount): int
    {
        $normalized = str_replace(',', '.', trim((string) $amount));

        if (! preg_match('/^\d+(?:\.\d{1,2})?$/', $normalized)) {
            throw new DomainException('Preço de produto inválido.');
        }

        [$whole, $fraction = ''] = explode('.', $normalized, 2);
        $fraction = str_pad($fraction, 2, '0');

        return ((int) $whole * 100) + (int) $fraction;
    }
}
