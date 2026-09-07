<?php

namespace Tests\Feature\Storefront;

use App\Domain\Tenancy\TenantContextStore;
use App\Models\Tenant;
use App\Models\TenantDomain;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckoutAddressTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_checkout_customer_can_save_and_list_its_default_address(): void
    {
        $tenant = Tenant::query()->create([
            'name' => 'Loja de endereços',
            'slug' => 'loja-enderecos',
        ]);
        TenantDomain::query()->create([
            'tenant_id' => $tenant->id,
            'domain' => 'enderecos.test',
            'is_primary' => true,
            'verified_at' => now(),
        ]);
        $server = [
            'HTTP_HOST' => 'enderecos.test',
            'SERVER_NAME' => 'enderecos.test',
        ];
        $session = $this->withServerVariables($server)
            ->postJson('http://enderecos.test/api/storefront/checkout/customer-session', [
                'name' => 'Pessoa Compradora',
                'email' => 'comprador@example.test',
                'password' => 'uma-senha-segura',
                'password_confirmation' => 'uma-senha-segura',
            ])
            ->assertCreated();

        app(TenantContextStore::class)->clear();

        $token = $session->json('data.token');
        $headers = ['Authorization' => 'Bearer '.$token];
        $address = [
            'label' => 'Casa',
            'cep' => '01001-000',
            'rua' => 'Praça da Sé',
            'numero' => '100',
            'bairro' => 'Sé',
            'cidade' => 'São Paulo',
            'uf' => 'SP',
            'is_default' => true,
        ];

        $this->withServerVariables($server)
            ->withHeaders($headers)
            ->postJson('http://enderecos.test/api/storefront/checkout/addresses', $address)
            ->assertCreated()
            ->assertJsonPath('data.label', 'Casa')
            ->assertJsonPath('data.is_default', true);

        app(TenantContextStore::class)->clear();

        $this->withServerVariables($server)
            ->withHeaders($headers)
            ->getJson('http://enderecos.test/api/storefront/checkout/addresses')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.cep', '01001-000')
            ->assertJsonPath('data.0.is_default', true);
    }
}
