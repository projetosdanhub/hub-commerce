<?php

namespace Tests\Feature\Tenancy;

use App\Domain\Tenancy\TenantContext;
use App\Domain\Tenancy\TenantContextStore;
use App\Models\Categoria;
use App\Models\Produto;
use App\Models\Tenant;
use App\Models\TenantDomain;
use App\Services\CacheFallbackService;
use Closure;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_storefront_never_returns_product_from_another_tenant(): void
    {
        [$tenantA, $tenantB] = $this->twoTenants();

        $productA = $this->inTenant($tenantA, function (): Produto {
            $category = Categoria::query()->create([
                'nome' => 'Categoria A',
                'slug' => 'categoria-a',
                'descricao' => 'A',
                'ativo' => true,
                'status' => 'ATIVO',
            ]);

            return Produto::query()->create([
                'categoria_id' => $category->getKey(),
                'nome' => 'Produto A',
                'slug' => 'produto-a',
                'descricao' => 'A',
                'preco' => 10,
                'quantidade_estoque' => 1,
                'ativo' => true,
                'status_vitrine' => 'ATIVO',
            ]);
        });

        $productB = $this->inTenant($tenantB, function (): Produto {
            $category = Categoria::query()->create([
                'nome' => 'Categoria B',
                'slug' => 'categoria-b',
                'descricao' => 'B',
                'ativo' => true,
                'status' => 'ATIVO',
            ]);

            return Produto::query()->create([
                'categoria_id' => $category->getKey(),
                'nome' => 'Produto B',
                'slug' => 'produto-b',
                'descricao' => 'B',
                'preco' => 20,
                'quantidade_estoque' => 1,
                'ativo' => true,
                'status_vitrine' => 'ATIVO',
            ]);
        });

        $this->withServerVariables(['HTTP_HOST' => 'loja-a.test', 'SERVER_NAME' => 'loja-a.test'])
            ->getJson('/api/storefront/products')
            ->assertOk()
            ->assertJsonPath('data.data.0.id', $productA->getKey())
            ->assertJsonMissingPath('data.data.0.id', $productB->getKey());

        $this->withServerVariables(['HTTP_HOST' => 'loja-a.test', 'SERVER_NAME' => 'loja-a.test'])
            ->getJson('/api/storefront/products/' . $productB->getKey())
            ->assertNotFound();
    }

    public function test_unverified_domain_is_not_resolved_and_suspended_tenant_cannot_operate(): void
    {
        [$tenantA, $tenantB] = $this->twoTenants();

        TenantDomain::query()->create([
            'tenant_id' => $tenantA->getKey(),
            'domain' => 'nao-verificado.test',
            'is_primary' => false,
        ]);

        $this->withServerVariables(['HTTP_HOST' => 'nao-verificado.test', 'SERVER_NAME' => 'nao-verificado.test'])
            ->getJson('/api/storefront/products')
            ->assertNotFound();

        $tenantB->forceFill(['status' => Tenant::STATUS_SUSPENDED])->save();

        $this->withServerVariables(['HTTP_HOST' => 'loja-b.test', 'SERVER_NAME' => 'loja-b.test'])
            ->getJson('/api/storefront/products')
            ->assertStatus(423);
    }

    public function test_cache_key_is_namespaced_by_tenant(): void
    {
        [$tenantA, $tenantB] = $this->twoTenants();

        $keyA = $this->inTenant($tenantA, fn (): string => CacheFallbackService::tenantKey('storefront'));
        $keyB = $this->inTenant($tenantB, fn (): string => CacheFallbackService::tenantKey('storefront'));

        $this->assertNotSame($keyA, $keyB);
        $this->assertStringContainsString((string) $tenantA->uuid, $keyA);
        $this->assertStringContainsString((string) $tenantB->uuid, $keyB);
    }

    private function twoTenants(): array
    {
        $tenantA = Tenant::query()->create(['name' => 'Loja A', 'slug' => 'loja-a']);
        $tenantB = Tenant::query()->create(['name' => 'Loja B', 'slug' => 'loja-b']);

        TenantDomain::query()->create([
            'tenant_id' => $tenantA->getKey(),
            'domain' => 'loja-a.test',
            'is_primary' => true,
            'verified_at' => now(),
        ]);
        TenantDomain::query()->create([
            'tenant_id' => $tenantB->getKey(),
            'domain' => 'loja-b.test',
            'is_primary' => true,
            'verified_at' => now(),
        ]);

        return [$tenantA, $tenantB];
    }

    private function inTenant(Tenant $tenant, Closure $callback): mixed
    {
        return app(TenantContextStore::class)->run(TenantContext::fromTenant($tenant), $callback);
    }
}
