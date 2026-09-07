<?php

namespace Tests\Feature\Storefront;

use App\Domain\Tenancy\TenantContextStore;
use App\Models\StorefrontCustomer;
use App\Models\Tenant;
use App\Models\TenantDomain;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CheckoutCustomerSessionTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_same_email_can_create_checkout_accounts_in_different_tenants(): void
    {
        $firstTenant = $this->createTenant('primeira-loja.test');
        $secondTenant = $this->createTenant('segunda-loja.test');
        $payload = [
            'name' => 'Pessoa Compradora',
            'email' => 'comprador@example.test',
            'password' => 'uma-senha-segura',
            'password_confirmation' => 'uma-senha-segura',
        ];

        $firstResponse = $this->withServerVariables([
            'HTTP_HOST' => 'primeira-loja.test',
            'SERVER_NAME' => 'primeira-loja.test',
        ])->postJson('http://primeira-loja.test/api/storefront/checkout/customer-session', $payload);

        $firstResponse
            ->assertCreated()
            ->assertJsonPath('data.customer.email', 'comprador@example.test');

        $this->assertNotEmpty($firstResponse->json('data.token'));
        $this->assertDatabaseHas('storefront_customers', [
            'tenant_id' => $firstTenant->id,
            'email' => 'comprador@example.test',
        ]);

        app(TenantContextStore::class)->clear();

        $secondResponse = $this->withServerVariables([
            'HTTP_HOST' => 'segunda-loja.test',
            'SERVER_NAME' => 'segunda-loja.test',
        ])->postJson('http://segunda-loja.test/api/storefront/checkout/customer-session', $payload);

        $secondResponse
            ->assertCreated()
            ->assertJsonPath('data.customer.email', 'comprador@example.test');

        $this->assertDatabaseHas('storefront_customers', [
            'tenant_id' => $secondTenant->id,
            'email' => 'comprador@example.test',
        ]);
        $this->assertSame(2, StorefrontCustomer::withoutGlobalScopes()->count());

        app(TenantContextStore::class)->clear();
        app(TenantContextStore::class)->setTenant($firstTenant, 'primeira-loja.test');

        $firstCustomer = StorefrontCustomer::query()
            ->where('email', 'comprador@example.test')
            ->firstOrFail();

        $this->assertTrue(Hash::check('uma-senha-segura', $firstCustomer->password));
    }

    public function test_an_existing_account_requires_its_password_in_the_same_tenant(): void
    {
        $this->createTenant('senha-loja.test');

        $this->withServerVariables([
            'HTTP_HOST' => 'senha-loja.test',
            'SERVER_NAME' => 'senha-loja.test',
        ])->postJson('http://senha-loja.test/api/storefront/checkout/customer-session', [
            'name' => 'Pessoa Compradora',
            'email' => 'comprador@example.test',
            'password' => 'uma-senha-segura',
            'password_confirmation' => 'uma-senha-segura',
        ])->assertCreated();

        app(TenantContextStore::class)->clear();

        $this->withServerVariables([
            'HTTP_HOST' => 'senha-loja.test',
            'SERVER_NAME' => 'senha-loja.test',
        ])->postJson('http://senha-loja.test/api/storefront/checkout/customer-session', [
            'name' => 'Outro Nome',
            'email' => 'comprador@example.test',
            'password' => 'senha-incorreta',
            'password_confirmation' => 'senha-incorreta',
        ])->assertStatus(422)
            ->assertJsonPath('code', 'CHECKOUT_ACCOUNT_NOT_AVAILABLE');

        app(TenantContextStore::class)->clear();
    }

    private function createTenant(string $domain): Tenant
    {
        $tenant = Tenant::query()->create([
            'name' => $domain,
            'slug' => str_replace('.test', '', $domain),
        ]);

        TenantDomain::query()->create([
            'tenant_id' => $tenant->id,
            'domain' => $domain,
            'is_primary' => true,
            'verified_at' => now(),
        ]);

        return $tenant;
    }
}
