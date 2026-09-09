<?php

namespace Tests\Feature\Database;

use App\Domain\Tenancy\TenantContext;
use App\Domain\Tenancy\TenantContextStore;
use App\Models\Produto;
use App\Models\Tenant;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatabaseSeederDemoDataTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        app(TenantContextStore::class)->clear();
        parent::tearDown();
    }

    public function test_local_seed_creates_a_tenant_scoped_catalog_for_storefront_testing(): void
    {
        $this->seed(DatabaseSeeder::class);
        $tenant = Tenant::query()->where('slug', 'loja-inicial')->firstOrFail();
        app(TenantContextStore::class)->set(TenantContext::fromTenant($tenant, 'demo.hubcommerce.test'));

        $this->assertDatabaseCount('produtos', 4);
        $this->assertDatabaseHas('produtos', ['tenant_id' => $tenant->id, 'slug' => 'camiseta-basica-demo', 'personalizado' => false]);
        $this->assertDatabaseHas('produtos', ['tenant_id' => $tenant->id, 'slug' => 'moletom-personalizavel-demo', 'personalizado' => true]);
        $this->assertSame(2, Produto::query()->where('slug', 'moletom-personalizavel-demo')->firstOrFail()->variacoes()->count());
        app(TenantContextStore::class)->clear();

        $this->withServerVariables(['HTTP_HOST' => 'demo.hubcommerce.test', 'SERVER_NAME' => 'demo.hubcommerce.test'])->getJson('http://demo.hubcommerce.test/api/storefront/products')->assertOk()->assertJsonFragment(['slug' => 'camiseta-basica-demo'])->assertJsonFragment(['slug' => 'moletom-personalizavel-demo']);
    }
}
