<?php

namespace Tests\Unit\Domain\Payments;

use App\Domain\Payments\PaymentAttemptStatus;
use App\Domain\Payments\PaymentAuthorization;
use InvalidArgumentException;
use Tests\TestCase;

class PaymentAuthorizationTest extends TestCase
{
    public function test_it_accepts_only_a_tokenized_positive_payment_attempt(): void
    {
        $authorization = new PaymentAuthorization(
            'payment-attempt-reference',
            12_500,
            'BRL',
            'provider-token',
            'SANDBOX',
        );

        $this->assertSame(12_500, $authorization->amountCents);
        $this->assertSame('BRL', $authorization->currency);
        $this->assertFalse(PaymentAttemptStatus::PENDING->isTerminal());
        $this->assertTrue(PaymentAttemptStatus::SUCCEEDED->isTerminal());
    }

    public function test_it_rejects_an_invalid_amount_or_currency(): void
    {
        $this->expectException(InvalidArgumentException::class);

        new PaymentAuthorization(
            'payment-attempt-reference',
            0,
            'R$',
            'provider-token',
        );
    }
}
