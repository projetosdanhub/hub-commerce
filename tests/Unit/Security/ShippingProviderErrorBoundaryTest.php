<?php

namespace Tests\Unit\Security;

use PHPUnit\Framework\TestCase;

class ShippingProviderErrorBoundaryTest extends TestCase
{
    public function test_shipping_provider_body_is_never_returned_by_the_shipment_flow(): void
    {
        $controller = file_get_contents(dirname(__DIR__, 3).'/app/Http/Controllers/Admin/OrderShipmentController.php');
        $service = file_get_contents(dirname(__DIR__, 3).'/app/Domain/Shipping/MelhorEnvioShipmentService.php');

        $this->assertIsString($controller);
        $this->assertIsString($service);
        $this->assertStringNotContainsString('$response->body()', $controller.$service);
        $this->assertStringContainsString("'SHIPMENT_ACTION_UNAVAILABLE'", $controller);
        $this->assertStringContainsString("'PROVIDER_REJECTED'", $service);
        $this->assertStringContainsString("'RECONCILIATION_REQUIRED'", $service);
    }
}
