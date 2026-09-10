<?php

namespace App\Domain\Payments;

final readonly class PaymentInitiation
{
    public function __construct(
        public string $gatewayPaymentId,
        public PaymentAttemptStatus $status,
        public ?string $customerActionUrl = null,
    ) {}
}
