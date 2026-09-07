<?php

namespace App\Domain\Orders;

use InvalidArgumentException;

final readonly class CheckoutOrderCommand
{
    /**
     * @param  array<int, mixed>  $items
     * @param  array<string, mixed>  $address
     */
    public function __construct(
        public int $storefrontCustomerId,
        public array $items,
        public array $address,
        public string $shippingQuoteToken,
        public string $gateway,
        public string $environment,
        public string $paymentMethod,
        public string $idempotencyKey,
    ) {
        if ($this->storefrontCustomerId < 1 || $this->items === []) {
            throw new InvalidArgumentException('A solicitação de checkout é inválida.');
        }

        if (
            trim($this->shippingQuoteToken) === ''
            || trim($this->gateway) === ''
            || trim($this->paymentMethod) === ''
            || preg_match('/^[A-Z0-9_-]{8,128}$/', $this->idempotencyKey) !== 1
            || in_array($this->environment, ['SANDBOX', 'PRODUCTION'], true) === false
        ) {
            throw new InvalidArgumentException('A solicitação de checkout é inválida.');
        }
    }
}
