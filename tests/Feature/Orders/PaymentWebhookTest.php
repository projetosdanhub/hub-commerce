<?php

namespace Tests\Feature\Orders;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentWebhookTest extends TestCase
{
    use RefreshDatabase;

    public function test_payment_webhook_idempotency_and_signature(): void
    {
        // QA-007 permanece pendente até a implementação do gateway de pagamento.
        $this->markTestSkipped('QA-007 depende da implementação do gateway de pagamento.');
    }
}
