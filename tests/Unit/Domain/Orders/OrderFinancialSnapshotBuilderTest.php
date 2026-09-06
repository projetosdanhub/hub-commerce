<?php

namespace Tests\Unit\Domain\Orders;

use App\Domain\Orders\OrderFinancialSnapshotBuilder;
use InvalidArgumentException;
use Tests\TestCase;

class OrderFinancialSnapshotBuilderTest extends TestCase
{
    public function test_it_applies_coupon_before_vip_without_mixing_bases(): void
    {
        $snapshot = (new OrderFinancialSnapshotBuilder())->build(
            10_000,
            1_500,
            [
                ['source' => 'VIP', 'scope' => 'PRODUCT', 'amount_cents' => 7_000],
                ['source' => 'COUPON', 'scope' => 'PRODUCT', 'amount_cents' => 2_000, 'reference' => 'BEMVINDO'],
                ['source' => 'COUPON', 'scope' => 'SHIPPING', 'amount_cents' => 500, 'reference' => 'FRETE'],
            ],
        );

        $this->assertSame('COUPON', $snapshot['benefits'][0]['source']);
        $this->assertSame(1_000, $snapshot['product_total_cents']);
        $this->assertSame(1_000, $snapshot['shipping_total_cents']);
        $this->assertSame(2_000, $snapshot['net_total_cents']);
    }

    public function test_it_rejects_a_benefit_that_exceeds_its_own_base(): void
    {
        $this->expectException(InvalidArgumentException::class);

        (new OrderFinancialSnapshotBuilder())->build(
            1_000,
            500,
            [['source' => 'VIP', 'scope' => 'SHIPPING', 'amount_cents' => 501]],
        );
    }

    public function test_it_rejects_a_malformed_benefit_before_sorting(): void
    {
        $this->expectException(InvalidArgumentException::class);

        (new OrderFinancialSnapshotBuilder())->build(1_000, 500, ['beneficio-invalido']);
    }
}
