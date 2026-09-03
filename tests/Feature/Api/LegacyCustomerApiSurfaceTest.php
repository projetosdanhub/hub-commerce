<?php

namespace Tests\Feature\Api;

use Tests\TestCase;

class LegacyCustomerApiSurfaceTest extends TestCase
{
    public function test_legacy_public_customers_endpoint_is_not_exposed(): void
    {
        $this->getJson('/api/customers')->assertNotFound();
    }

    public function test_unrouted_legacy_customer_controller_is_absent(): void
    {
        $this->assertFalse(class_exists('App\\Http\\Controllers\\Api\\CustomerController'));
    }
}
