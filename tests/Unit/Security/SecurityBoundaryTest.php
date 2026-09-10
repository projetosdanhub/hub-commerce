<?php

namespace Tests\Unit\Security;

use App\Models\Order;
use App\Services\PaymentGatewayService;
use App\Support\Security\SensitiveData;
use PHPUnit\Framework\TestCase;

class SecurityBoundaryTest extends TestCase
{
    public function test_payment_service_rejects_raw_card_data(): void
    {
        $result = (new PaymentGatewayService())->processPayment(
            new Order(),
            ['numeroCartao' => '4111111111111111', 'cvv' => '123'],
            [],
            [],
        );

        $this->assertSame('error', $result['status']);
        $this->assertSame('RAW_CARD_DATA_REJECTED', $result['code']);
    }

    public function test_no_gateway_can_approve_a_simulated_payment(): void
    {
        $result = (new PaymentGatewayService())->processPayment(
            new Order(),
            ['metodo' => 'pix'],
            [],
            [],
        );

        $this->assertSame('error', $result['status']);
        $this->assertSame('PAYMENT_GATEWAY_NOT_AVAILABLE', $result['code']);
    }

    public function test_sensitive_values_are_removed_or_masked(): void
    {
        $payload = SensitiveData::sanitizeTrackingPayload([
            'password' => 'secret',
            'user' => [
                'em' => 'person@example.test',
                'ph' => '5511999999999',
            ],
        ]);

        $this->assertArrayNotHasKey('password', $payload);
        $this->assertMatchesRegularExpression('/^[a-f0-9]{64}$/', $payload['user']['em']);
        $this->assertStringNotContainsString('person@example.test', SensitiveData::redactText('E-mail: person@example.test'));
    }
}
