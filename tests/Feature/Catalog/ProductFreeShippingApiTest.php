<?php

namespace Tests\Feature\Catalog;

use App\Domain\Identity\TenantOwnershipService;
use App\Models\Tenant;
use App\Models\TenantDomain;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ProductFreeShippingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_owner_can_read_the_free_shipping_configuration(): void
    {
        $tenant = Tenant::query()->create([
            'name' => 'Loja Frete',
            'slug' => 'loja-frete',
            'status' => Tenant::STATUS_ACTIVE,
        ]);

        TenantDomain::query()->create([
            'tenant_id' => $tenant->getKey(),
            'domain' => 'loja-frete.test',
            'is_primary' => true,
            'verified_at' => now(),
        ]);

        $owner = User::query()->create([
            'name' => 'Proprietário da loja',
            'email' => 'owner@loja-frete.test',
            'email_verified_at' => now(),
            'password' => Hash::make('SenhaForte123!'),
            'role' => 'cliente',
            'status' => 'ATIVO',
        ]);

        app(TenantOwnershipService::class)->assignInitialOwner($tenant, $owner);

        $this->actingAs($owner, 'sanctum')
            ->withServerVariables(['HTTP_HOST' => 'loja-frete.test', 'SERVER_NAME' => 'loja-frete.test'])
            ->getJson('http://loja-frete.test/api/admin/products/free-shipping')
            ->assertOk()
            ->assertExactJson([
                'product_ids' => [],
                'minimum_order_cents' => null,
            ]);
    }
}
