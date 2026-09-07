<?php

namespace App\Domain\Orders;

use App\Models\Produto;

final class CheckoutSummaryService
{
    public function __construct(
        private readonly CheckoutFingerprint $fingerprint,
        private readonly CheckoutPricingService $pricing,
        private readonly CheckoutShippingQuoteResolver $shippingQuotes,
        private readonly OrderFinancialSnapshotBuilder $snapshots,
    ) {
    }

    /**
     * @param  array<int, mixed>  $items
     * @param  array<string, mixed>  $address
     * @return array{items: array<int, array{product_id: int, name: string, quantity: int, unit_price_cents: int, line_total_cents: int}>, snapshot: array<string, mixed>, shipping: array{token: string, service_code: string, estimated_delivery_days: int|null}}
     */
    public function summarize(
        array $items,
        array $address,
        string $shippingQuoteToken,
    ): array {
        $priced = $this->pricing->priceItems($items);
        $quote = $this->shippingQuotes->resolve(
            $shippingQuoteToken,
            $this->fingerprint->cart($items),
            $this->fingerprint->destination($address),
        );
        $snapshot = $this->snapshots->build(
            $priced['product_subtotal_cents'],
            $quote->shipping_cents,
            [],
        );

        return [
            'items' => array_map(static function (array $item): array {
                /** @var Produto $product */
                $product = $item['product'];

                return [
                    'product_id' => (int) $product->getKey(),
                    'name' => $product->nome,
                    'quantity' => $item['quantity'],
                    'unit_price_cents' => $item['unit_price_cents'],
                    'line_total_cents' => $item['line_total_cents'],
                ];
            }, $priced['items']),
            'snapshot' => $snapshot,
            'shipping' => [
                'token' => $quote->token,
                'service_code' => $quote->service_code,
                'estimated_delivery_days' => $quote->estimated_delivery_days,
            ],
        ];
    }
}
