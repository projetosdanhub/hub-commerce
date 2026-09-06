<?php

namespace Tests\Unit\Domain\Orders;

use App\Domain\Orders\CheckoutFingerprint;
use Tests\TestCase;

class CheckoutFingerprintTest extends TestCase
{
    public function test_it_generates_the_same_cart_fingerprint_regardless_of_item_order(): void
    {
        $fingerprint = new CheckoutFingerprint();

        $first = $fingerprint->cart([
            ['id' => 10, 'quantity' => 1],
            ['id' => 20, 'quantity' => 2],
        ]);
        $second = $fingerprint->cart([
            ['id' => 20, 'quantity' => 2],
            ['id' => 10, 'quantity' => 1],
        ]);

        $this->assertSame($first, $second);
    }

    public function test_it_does_not_store_a_delivery_address_in_the_destination_fingerprint(): void
    {
        $fingerprint = new CheckoutFingerprint();

        $result = $fingerprint->destination([
            'cep' => '01001-000',
            'rua' => 'Praça da Sé',
            'numero' => '100',
            'bairro' => 'Sé',
            'cidade' => 'São Paulo',
            'uf' => 'SP',
        ]);

        $this->assertMatchesRegularExpression('/^[a-f0-9]{64}$/', $result);
        $this->assertStringNotContainsString('Praça', $result);
    }
}
