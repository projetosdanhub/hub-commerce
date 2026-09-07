<?php

namespace App\Domain\Orders;

use App\Domain\Payments\PaymentAttemptStatus;
use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderAddress;
use App\Models\OrderItem;
use App\Models\PaymentAttempt;
use App\Models\StorefrontCustomer;
use DomainException;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

final class CheckoutOrderCreator
{
    public function __construct(
        private readonly CheckoutFingerprint $fingerprints,
        private readonly CheckoutPricingService $pricing,
        private readonly CheckoutShippingQuoteResolver $shippingQuotes,
        private readonly OrderFinancialSnapshotBuilder $snapshots,
    ) {}

    public function create(CheckoutOrderCommand $command): CheckoutOrderResult
    {
        $checkoutFingerprint = $this->checkoutFingerprint($command);

        try {
            return DB::transaction(function () use ($command, $checkoutFingerprint): CheckoutOrderResult {
                $existing = PaymentAttempt::query()
                    ->where('gateway', $command->gateway)
                    ->where('idempotency_key', $command->idempotencyKey)
                    ->lockForUpdate()
                    ->first();

                if ($existing !== null) {
                    return $this->existingResult($existing, $checkoutFingerprint);
                }

                $customer = StorefrontCustomer::query()
                    ->lockForUpdate()
                    ->find($command->storefrontCustomerId);

                if ($customer === null || $customer->isActive() === false) {
                    throw new DomainException('A conta de compra não está disponível.');
                }

                $priced = $this->pricing->priceItems($command->items, true);
                $quote = $this->shippingQuotes->resolve(
                    $command->shippingQuoteToken,
                    $this->fingerprints->cart($command->items),
                    $this->fingerprints->destination($command->address),
                    true,
                );
                $snapshot = $this->snapshots->build(
                    $priced['product_subtotal_cents'],
                    $quote->shipping_cents,
                    [],
                );

                $order = Order::query()->create([
                    'storefront_customer_id' => $customer->getKey(),
                    'carrier_id' => $quote->carrier_id,
                    'subtotal' => $this->decimal($snapshot['product_subtotal_cents']),
                    'frete' => $this->decimal($snapshot['shipping_cents']),
                    'desconto' => $this->decimal(
                        $snapshot['gross_total_cents'] - $snapshot['net_total_cents'],
                    ),
                    'total' => $this->decimal($snapshot['net_total_cents']),
                    'financial_snapshot' => $snapshot,
                    'financial_snapshot_version' => $snapshot['version'],
                    'status' => OrderStatus::AWAITING_PAYMENT,
                    'payment_gateway' => $command->gateway,
                    'payment_method' => $command->paymentMethod,
                    'payment_installments' => 1,
                    'installment_value' => $this->decimal($snapshot['net_total_cents']),
                    'gateway_fee' => '0.00',
                ]);

                foreach ($priced['items'] as $pricedItem) {
                    $product = $pricedItem['product'];

                    OrderItem::query()->create([
                        'order_id' => $order->getKey(),
                        'sku' => $product->sku_ref,
                        'product_name' => $product->nome,
                        'quantity' => $pricedItem['quantity'],
                        'price' => $this->decimal($pricedItem['unit_price_cents']),
                        'product_image' => $product->img,
                    ]);
                }

                OrderAddress::query()->create([
                    'order_id' => $order->getKey(),
                    'cep' => $command->address['cep'],
                    'rua' => $command->address['rua'],
                    'num' => $command->address['numero'],
                    'complemento' => $command->address['complemento'] ?? null,
                    'bairro' => $command->address['bairro'],
                    'cidade' => $command->address['cidade'],
                    'uf' => $command->address['uf'],
                ]);

                $attempt = PaymentAttempt::query()->create([
                    'order_id' => $order->getKey(),
                    'gateway' => $command->gateway,
                    'environment' => $command->environment,
                    'payment_method' => $command->paymentMethod,
                    'status' => PaymentAttemptStatus::PENDING,
                    'idempotency_key' => $command->idempotencyKey,
                    'checkout_fingerprint' => $checkoutFingerprint,
                    'amount_cents' => $snapshot['net_total_cents'],
                    'currency' => $snapshot['currency'],
                    'initiated_at' => now(),
                ]);

                $quote->forceFill(['invalidated_at' => now()])->save();

                return new CheckoutOrderResult($order, $attempt, false);
            }, 3);
        } catch (QueryException $exception) {
            $existing = PaymentAttempt::query()
                ->where('gateway', $command->gateway)
                ->where('idempotency_key', $command->idempotencyKey)
                ->first();

            if ($existing !== null) {
                return $this->existingResult($existing, $checkoutFingerprint);
            }

            throw $exception;
        }
    }

    private function existingResult(PaymentAttempt $attempt, string $checkoutFingerprint): CheckoutOrderResult
    {
        if (hash_equals($attempt->checkout_fingerprint, $checkoutFingerprint) === false) {
            throw new DomainException('A chave de idempotência já foi usada para outro checkout.');
        }

        $order = $attempt->order;

        if ($order === null) {
            throw new DomainException('A tentativa de pagamento está indisponível.');
        }

        return new CheckoutOrderResult($order, $attempt, true);
    }

    private function checkoutFingerprint(CheckoutOrderCommand $command): string
    {
        return hash('sha256', implode('|', [
            $this->fingerprints->cart($command->items),
            $this->fingerprints->destination($command->address),
            $command->shippingQuoteToken,
            $command->gateway,
            $command->environment,
            $command->paymentMethod,
        ]));
    }

    private function decimal(int $cents): string
    {
        return intdiv($cents, 100).'.'.str_pad((string) ($cents % 100), 2, '0', STR_PAD_LEFT);
    }
}
