<?php

namespace Tests\Feature\Catalog;

use App\Domain\Identity\TenantOwnershipService;
use App\Domain\Tenancy\TenantContext;
use App\Domain\Tenancy\TenantContextStore;
use App\Enums\ProductStatus;
use App\Models\Categoria;
use App\Models\Produto;
use App\Models\Tenant;
use App\Models\TenantDomain;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ProductContractTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        app(TenantContextStore::class)->clear();

        parent::tearDown();
    }

    public function test_admin_contract_normalizes_price_stock_and_status(): void
    {
        [$tenant, $owner] = $this->tenantWithOwner(
            'Loja contrato',
            'loja-contrato',
            'contrato.test',
            'owner@contrato.test'
        );

        $this->setTenantContext($tenant, 'contrato.test');

        $category = Categoria::query()->create([
            'nome' => 'Categoria contrato',
            'slug' => 'categoria-contrato',
            'descricao' => 'Categoria do teste.',
            'ativo' => true,
            'status' => Categoria::STATUS_ATIVO,
        ]);

        app(TenantContextStore::class)->clear();

        $response = $this->actingAs($owner, 'sanctum')
            ->withServerVariables(['HTTP_HOST' => 'contrato.test', 'SERVER_NAME' => 'contrato.test'])
            ->postJson('http://contrato.test/api/admin/products', [
                'categoria_id' => $category->id,
                'nome' => 'Produto canônico',
                'slug' => 'produto-canonico',
                'descricao' => 'Produto com contrato único.',
                'preco' => '100.00',
                'preco_promo' => '89.90',
                'quantidade_estoque' => 3,
                'status_vitrine' => ProductStatus::ACTIVE->value,
                'controlar_estoque' => true,
                'pre_venda' => false,
                'ficha_tecnica' => [
                    ['atributo' => 'Material', 'valor' => 'Algodão'],
                ],
            ])
            ->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.preco', '100.00')
            ->assertJsonPath('data.preco_promo', '89.90')
            ->assertJsonPath('data.quantidade_estoque', 3)
            ->assertJsonPath('data.status_vitrine', ProductStatus::ACTIVE->value)
            ->assertJsonPath('data.ativo', true)
            ->assertJsonPath('data.categoria.id', $category->id)
            ->assertJsonPath('data.ficha_tecnica.0.atributo', 'Material');

        $productId = $response->json('data.id');

        $this->assertDatabaseHas('produtos', [
            'id' => $productId,
            'tenant_id' => $tenant->id,
            'preco' => '100.00',
            'preco_promo' => '89.90',
            'quantidade_estoque' => 3,
            'status_vitrine' => ProductStatus::ACTIVE->value,
            'ativo' => true,
        ]);

        $this->actingAs($owner, 'sanctum')
            ->withServerVariables(['HTTP_HOST' => 'contrato.test', 'SERVER_NAME' => 'contrato.test'])
            ->deleteJson("http://contrato.test/api/admin/products/{$productId}")
            ->assertOk();

        $this->assertDatabaseHas('produtos', [
            'id' => $productId,
            'quantidade_estoque' => 0,
            'status_vitrine' => ProductStatus::INACTIVE->value,
            'ativo' => false,
        ]);
    }

    public function test_admin_rejects_invalid_price_stock_status_and_cross_tenant_category(): void
    {
        [$tenantA, $ownerA] = $this->tenantWithOwner(
            'Loja A',
            'produto-loja-a',
            'produto-a.test',
            'owner@produto-a.test'
        );
        [$tenantB] = $this->tenantWithOwner(
            'Loja B',
            'produto-loja-b',
            'produto-b.test',
            'owner@produto-b.test'
        );

        $this->setTenantContext($tenantB, 'produto-b.test');
        $foreignCategory = Categoria::query()->create([
            'nome' => 'Categoria da Loja B',
            'slug' => 'categoria-loja-b',
            'descricao' => 'Não pode ser usada pela Loja A.',
            'ativo' => true,
            'status' => Categoria::STATUS_ATIVO,
        ]);
        app(TenantContextStore::class)->clear();

        $this->actingAs($ownerA, 'sanctum')
            ->withServerVariables(['HTTP_HOST' => 'produto-a.test', 'SERVER_NAME' => 'produto-a.test'])
            ->postJson('http://produto-a.test/api/admin/products', [
                'categoria_id' => $foreignCategory->id,
                'nome' => 'Produto inválido',
                'preco' => '100.00',
                'preco_promo' => '120.00',
                'quantidade_estoque' => -1,
                'status_vitrine' => 'PUBLICADO',
                'controlar_estoque' => true,
                'pre_venda' => false,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'categoria_id',
                'preco_promo',
                'quantidade_estoque',
                'status_vitrine',
            ]);

        $this->assertDatabaseCount('produtos', 0);
    }

    public function test_zero_stock_pre_sale_remains_available_in_the_storefront(): void
    {
        [$tenant, $owner] = $this->tenantWithOwner(
            'Loja pré-venda',
            'loja-pre-venda',
            'pre-venda.test',
            'owner@pre-venda.test'
        );

        $this->setTenantContext($tenant, 'pre-venda.test');
        $category = Categoria::query()->create([
            'nome' => 'Lançamentos',
            'slug' => 'lancamentos',
            'descricao' => 'Produtos em pré-venda.',
            'ativo' => true,
            'status' => Categoria::STATUS_ATIVO,
        ]);
        app(TenantContextStore::class)->clear();

        $response = $this->actingAs($owner, 'sanctum')
            ->withServerVariables(['HTTP_HOST' => 'pre-venda.test', 'SERVER_NAME' => 'pre-venda.test'])
            ->postJson('http://pre-venda.test/api/admin/products', [
                'categoria_id' => $category->id,
                'nome' => 'Produto em pré-venda',
                'slug' => 'produto-pre-venda',
                'preco' => '199.90',
                'preco_promo' => null,
                'quantidade_estoque' => 0,
                'status_vitrine' => ProductStatus::ACTIVE->value,
                'controlar_estoque' => true,
                'pre_venda' => true,
            ])
            ->assertOk();

        $productId = $response->json('data.id');

        $this->withServerVariables(['HTTP_HOST' => 'pre-venda.test', 'SERVER_NAME' => 'pre-venda.test'])
            ->getJson('http://pre-venda.test/api/storefront/products')
            ->assertOk()
            ->assertJsonPath('data.data.0.id', $productId)
            ->assertJsonPath('data.data.0.quantidade_estoque', 0)
            ->assertJsonPath('data.data.0.pre_venda', true);
    }

    /**
     * @return array{0: Tenant, 1: User}
     */
    private function tenantWithOwner(string $name, string $slug, string $domain, string $email): array
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

        $owner = User::query()->create([
            'name' => 'Proprietário da loja',
            'email' => $email,
            'email_verified_at' => now(),
            'password' => Hash::make('SenhaForte123!'),
            'role' => 'cliente',
            'status' => 'ATIVO',
        ]);

        app(TenantOwnershipService::class)->assignInitialOwner($tenant, $owner);

        return [$tenant, $owner];
    }

    private function setTenantContext(Tenant $tenant, string $domain): void
    {
        app(TenantContextStore::class)->set(TenantContext::fromTenant($tenant, $domain));
    }
}
