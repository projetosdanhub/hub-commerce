<?php

namespace Tests\Unit\Security;

use PHPUnit\Framework\TestCase;

class ShippingProviderErrorBoundaryTest extends TestCase
{
    public function test_shipping_provider_body_is_never_returned_by_the_order_controller(): void
    {
        $source = file_get_contents(dirname(__DIR__, 3).'/app/Http/Controllers/Admin/OrderController.php');

        $this->assertIsString($source);
        $this->assertStringNotContainsString('$response->body()', $source);
        $this->assertStringContainsString("'SHIPPING_PROVIDER_REJECTED'", $source);
        $this->assertStringContainsString("'SHIPPING_PROVIDER_UNAVAILABLE'", $source);
        $this->assertStringContainsString("Log::warning('Melhor Envio recusou a geração de etiqueta.'", $source);
    }
}
