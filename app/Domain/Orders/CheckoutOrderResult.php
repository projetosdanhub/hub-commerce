<?php

namespace App\Domain\Orders;

use App\Models\Order;
use App\Models\PaymentAttempt;

final readonly class CheckoutOrderResult
{
    public function __construct(
        public Order $order,
        public PaymentAttempt $paymentAttempt,
        public bool $idempotent,
    ) {}
}
