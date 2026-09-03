<?php

namespace Tests\Feature\Catalog;

use App\Domain\Tenancy\TenantContext;
use App\Domain\Tenancy\TenantContextStore;
use App\Models\Categoria;
use App\Models\Tenant;
use App\Models\TenantDomain;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class CategoryCanonicalizationTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        app(TenantContextStore::class)->clear();

        parent::tearDown();
    }

    public function test_storefront_uses_only_active_categories_from_the_resolved_tenant(): void
    {
        $tenantA = $this->tenant('Loja A', 'loja-a', 'loja-a.test');
        $tenantB = $this->tenant('Loja B', 'loja-b', 'loja-b.test');

        $this->setTenantContext($tenantA, 'loja-a.test');
        $active = Categoria::query()->create([
            'nome' => 'Calçados',
            'slug' => 'calcados',
            'descricao' => 'Categoria ativa.',
            'ativo' => true,
            'status' => Categoria::STATUS_ATIVO,
        ]);
        Categoria::query()->create([
            'nome' => 'Arquivada',
            'slug' => 'arquivada',
            'descricao' => 'Categoria inativa.',
            'ativo' => false,
            'status' => Categoria::STATUS_INATIVO,
        ]);

        $this->setTenantContext($tenantB, 'loja-b.test');
        Categoria::query()->create([
            'nome' => 'Categoria da Loja B',
            'slug' => 'categoria-loja-b',
            'descricao' => 'Não pode vazar para outra loja.',
            'ativo' => true,
            'status' => Categoria::STATUS_ATIVO,
        ]);

        app(TenantContextStore::class)->clear();

        $this->withServerVariables(['HTTP_HOST' => 'loja-a.test', 'SERVER_NAME' => 'loja-a.test'])
            ->getJson('http://loja-a.test/api/storefront/categories')
            ->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $active->id)
            ->assertJsonPath('data.0.slug', 'calcados')
            ->assertJsonMissingPath('data.0.tenant_id');

        $this->assertFalse(class_exists('App\\Models\\Category'));
        $this->assertFalse(Schema::hasTable('categories'));
    }

    private function tenant(string $name, string $slug, string $domain): Tenant
    {
        $tenant = Tenant::query()->create([
            'name' => $name,
            'slug' => $slug,
            'status' => Tenant::STATUS_ACTIVE,
        ]);

        TenantDomain::query()->create([
            'tenant_id' => $tenant->getKey(),
            'domain' => $domain,
            'is_primary' => true,
            'verified_at' => now(),
        ]);

        return $tenant;
    }

    private function setTenantContext(Tenant $tenant, string $domain): void
    {
        app(TenantContextStore::class)->set(TenantContext::fromTenant($tenant, $domain));
    }
}
