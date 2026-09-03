<?php

namespace Tests\Unit\Security;

use PHPUnit\Framework\TestCase;

class StorefrontSearchBoundaryTest extends TestCase
{
    public function test_storefront_header_uses_the_public_catalog_endpoint(): void
    {
        $header = file_get_contents(dirname(__DIR__, 3).'/resources/js/Modulos/Loja/Cabecalho.jsx');

        $this->assertIsString($header);
        $this->assertStringContainsString("import { storefrontApi } from '../../api';", $header);
        $this->assertStringContainsString("storefrontApi.get('/storefront/products'", $header);
        $this->assertStringNotContainsString("api.get('/admin/products')", $header);
    }

    public function test_storefront_client_never_registers_the_admin_token_interceptor(): void
    {
        $client = file_get_contents(dirname(__DIR__, 3).'/resources/js/api.js');

        $this->assertIsString($client);
        $this->assertStringContainsString('export const storefrontApi = axios.create(', $client);
        $this->assertStringNotContainsString('storefrontApi.interceptors', $client);
    }
}
