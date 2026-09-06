<?php

namespace Tests\Unit\Domain\Orders;

use App\Domain\Orders\CheckoutShippingQuoteIssuer;
use Carbon\CarbonImmutable;
use DomainException;
use Tests\TestCase;

class CheckoutShippingQuoteIssuerTest extends TestCase
{
    public function test_it_rejects_an_expired_quote_before_persistence(): void
    {
        $this->expectException(DomainException::class);

        (new CheckoutShippingQuoteIssuer)->issue(
            str_repeat('a', 64),
            str_repeat('b', 64),
            [['id' => '1', 'price' => '12.50', 'delivery_time' => 3]],
            CarbonImmutable::now()->subSecond(),
        );
    }
}
