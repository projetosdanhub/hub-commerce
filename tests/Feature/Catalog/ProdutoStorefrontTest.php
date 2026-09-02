<?php

namespace Tests\Feature\Catalog;

use App\Domain\Tenancy\TenantContext;
use App\Domain\Tenancy\TenantContextStore;
use App\Models\Categoria;
use App\Models\Produto;
use App\Models\ProdutoVariacao;
use App\Models\Tenant;
use App\Models\TenantDomain;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProdutoStorefrontTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::query()->create([
            'name' => 'Loja catálogo',
            'slug' => 'loja-catalogo',
        ]);

        TenantDomain::query()->create([
            'tenant_id' => $this->tenant->getKey(),
            'domain' => 'catalogo.test',
            'is_primary' => true,
            'verified_at' => now(),
        ]);

        app(TenantContextStore::class)->set(TenantContext::fromTenant($this->tenant, 'catalogo.test'));
    }

    protected function tearDown(): void
    {
        app(TenantContextStore::class)->clear();

        parent::tearDown();
    }

    public function test_storefront_consulta_o_modelo_produto_canonico(): void
    {
        $categoria = Categoria::query()->create([
            'nome' => 'Camisetas',
            'slug' => 'camisetas',
            'descricao' => 'Camisetas da loja.',
            'ativo' => true,
            'status' => 'ATIVO',
        ]);

        $produto = Produto::query()->create([
            'categoria_id' => $categoria->id,
            'nome' => 'Camiseta destaque',
            'slug' => 'camiseta-destaque',
            'descricao' => 'Camiseta de algodão.',
            'preco' => '199.90',
            'preco_promo' => '149.90',
            'quantidade_estoque' => 4,
            'destaque' => true,
            'ativo' => true,
            'status_vitrine' => 'ATIVO',
        ]);

        ProdutoVariacao::query()->create([
            'produto_id' => $produto->id,
            'tipo' => 'Cor',
            'nome' => 'Azul',
            'sku' => 'CAMISETA-AZUL',
            'estoque' => 4,
        ]);

        $this->withServerVariables(['HTTP_HOST' => 'catalogo.test', 'SERVER_NAME' => 'catalogo.test'])
            ->getJson('/api/storefront/products?is_featured=1')
            ->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.data.0.id', $produto->id)
            ->assertJsonPath('data.data.0.categoria.id', $categoria->id)
            ->assertJsonPath('data.data.0.variacoes.0.sku', 'CAMISETA-AZUL');

        $this->withServerVariables(['HTTP_HOST' => 'catalogo.test', 'SERVER_NAME' => 'catalogo.test'])
            ->getJson('/api/storefront/products/' . $produto->slug)
            ->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.id', $produto->id)
            ->assertJsonPath('data.categoria.slug', $categoria->slug)
            ->assertJsonPath('data.variacoes.0.nome', 'Azul');

        $this->assertFalse(class_exists('App\\Models\\Product'));
    }
}
