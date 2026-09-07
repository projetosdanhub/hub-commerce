<?php

namespace Tests\Feature\Storefront;

use App\Domain\Shipping\ShippingBenefitRuleType;
use App\Domain\Tenancy\TenantContext;
use App\Domain\Tenancy\TenantContextStore;
use App\Models\Categoria;
use App\Models\Produto;
use App\Models\ShippingBenefitRule;
use App\Models\Tenant;
use App\Models\TenantDomain;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FreeShippingProgressTest extends TestCase
{
    use RefreshDatabase;

    private Produto $product;

    protected function setUp(): void
    {
        parent::setUp();

        $tenant = Tenant::query()->create(['name' => 'Loja frete', 'slug' => 'loja-frete']);
        TenantDomain::query()->create([
            'tenant_id' => $tenant->id,
            'domain' => 'frete.test',
            'is_primary' => true,
            'verified_at' => now(),
        ]);
        app(TenantContextStore::class)->set(TenantContext::fromTenant($tenant, 'frete.test'));

        $category = Categoria::query()->create([
            'nome' => 'Entrega',
            'slug' => 'entrega',
            'ativo' => true,
            'status' => Categoria::STATUS_ATIVO,
        ]);
        $this->product = Produto::query()->create([
            'categoria_id' => $category->id,
            'nome' => 'Produto de entrega',
            'slug' => 'produto-de-entrega',
            'descricao' => '',
            'preco' => '100.00',
            'quantidade_estoque' => 5,
            'ativo' => true,
            'status_vitrine' => 'ATIVO',
        ]);
    }

    protected function tearDown(): void
    {
        app(TenantContextStore::class)->clear();

        parent::tearDown();
    }

    public function test_it_returns_remaining_amount_from_server_pricing(): void
    {
        ShippingBenefitRule::query()->create([
            'type' => ShippingBenefitRuleType::FREE_ABOVE_SUBTOTAL,
            'minimum_order_cents' => 15000,
            'priority' => 50,
            'is_active' => true,
        ]);

        $this->requestProgress(1)
            ->assertOk()
            ->assertJsonPath('data.status', 'THRESHOLD_IN_PROGRESS')
            ->assertJsonPath('data.product_subtotal_cents', 10000)
            ->assertJsonPath('data.remaining_cents', 5000)
            ->assertJsonPath('data.progress_percent', 66);
    }

    public function test_it_unlocks_for_the_store_threshold_or_all_eligible_products(): void
    {
        ShippingBenefitRule::query()->create([
            'type' => ShippingBenefitRuleType::FREE_ABOVE_SUBTOTAL,
            'minimum_order_cents' => 15000,
            'priority' => 50,
            'is_active' => true,
        ]);

        $this->requestProgress(2)
            ->assertOk()
            ->assertJsonPath('data.status', 'THRESHOLD_REACHED')
            ->assertJsonPath('data.remaining_cents', 0)
            ->assertJsonPath('data.progress_percent', 100);

        $this->product->update(['frete_gratis' => true]);

        $this->requestProgress(1)
            ->assertOk()
            ->assertJsonPath('data.status', 'PRODUCTS_ELIGIBLE')
            ->assertJsonPath('data.remaining_cents', 0)
            ->assertJsonPath('data.progress_percent', 100);
    }

    private function requestProgress(int $quantity)
    {
        return $this->withServerVariables([
            'HTTP_HOST' => 'frete.test',
            'SERVER_NAME' => 'frete.test',
        ])->postJson('http://frete.test/api/storefront/free-shipping-progress', [
            'items' => [['id' => $this->product->id, 'quantity' => $quantity]],
        ]);
    }
}
