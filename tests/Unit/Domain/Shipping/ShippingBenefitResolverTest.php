<?php

namespace Tests\Unit\Domain\Shipping;

use App\Domain\Shipping\ShippingBenefitResolver;
use App\Domain\Tenancy\TenantContext;
use App\Domain\Tenancy\TenantContextStore;
use App\Models\Categoria;
use App\Models\Produto;
use App\Models\ShippingBenefitRule;
use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShippingBenefitResolverTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $tenant = Tenant::query()->create(['name' => 'Loja frete', 'slug' => 'loja-frete']);
        app(TenantContextStore::class)->set(TenantContext::fromTenant($tenant, 'frete.test'));
    }

    protected function tearDown(): void
    {
        app(TenantContextStore::class)->clear();

        parent::tearDown();
    }

    public function test_it_applies_free_shipping_only_when_all_cart_products_are_eligible(): void
    {
        $category = Categoria::query()->create(['nome' => 'Entrega', 'slug' => 'entrega', 'ativo' => true, 'status' => Categoria::STATUS_ATIVO]);
        $eligible = $this->product($category, true);
        $ineligible = $this->product($category, false);
        $resolver = app(ShippingBenefitResolver::class);

        $this->assertSame([[
            'source' => 'STORE',
            'scope' => 'SHIPPING',
            'amount_cents' => 1290,
            'reference' => 'product-free-shipping',
        ]], $resolver->benefitsFor([$this->priced($eligible)], 1290));

        $this->assertSame([], $resolver->benefitsFor([$this->priced($eligible), $this->priced($ineligible)], 1290));
    }

    public function test_it_uses_the_highest_priority_active_shipping_rule_without_overlapping_benefits(): void
    {
        $category = Categoria::query()->create(['nome' => 'Entrega', 'slug' => 'entrega', 'ativo' => true, 'status' => Categoria::STATUS_ATIVO]);
        $product = $this->product($category, false);

        ShippingBenefitRule::query()->create(['type' => ShippingBenefitRule::PERCENTAGE, 'percentage' => 25, 'priority' => 20, 'is_active' => true]);
        ShippingBenefitRule::query()->create(['type' => ShippingBenefitRule::FREE_FOR_ALL, 'priority' => 10, 'is_active' => true]);

        $benefits = app(ShippingBenefitResolver::class)->benefitsFor([$this->priced($product)], 1290);

        $this->assertCount(1, $benefits);
        $this->assertSame(1290, $benefits[0]['amount_cents']);
        $this->assertSame('SHIPPING', $benefits[0]['scope']);
    }

    private function product(Categoria $category, bool $freeShipping): Produto
    {
        return Produto::query()->create([
            'categoria_id' => $category->id,
            'nome' => $freeShipping ? 'Produto elegível' : 'Produto comum',
            'slug' => $freeShipping ? 'produto-elegivel' : 'produto-comum',
            'descricao' => '',
            'preco' => '100.00',
            'quantidade_estoque' => 5,
            'ativo' => true,
            'status_vitrine' => 'ATIVO',
            'frete_gratis' => $freeShipping,
        ]);
    }

    /**
     * @return array{product: Produto, quantity: int, unit_price_cents: int, line_total_cents: int}
     */
    private function priced(Produto $product): array
    {
        return ['product' => $product, 'quantity' => 1, 'unit_price_cents' => 10000, 'line_total_cents' => 10000];
    }
}
