<?php

namespace Tests\Feature\Storefront;

use App\Domain\Orders\CheckoutFingerprint;
use App\Domain\Tenancy\TenantContext;
use App\Domain\Tenancy\TenantContextStore;
use App\Models\Categoria;
use App\Models\CheckoutShippingQuote;
use App\Models\Produto;
use App\Models\Tenant;
use App\Models\TenantDomain;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckoutSummaryTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;

    private Produto $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::query()->create([
            'name' => 'Loja checkout',
            'slug' => 'loja-checkout',
        ]);
        TenantDomain::query()->create([
            'tenant_id' => $this->tenant->id,
            'domain' => 'checkout.test',
            'is_primary' => true,
            'verified_at' => now(),
        ]);
        app(TenantContextStore::class)->set(TenantContext::fromTenant($this->tenant, 'checkout.test'));

        $category = Categoria::query()->create([
            'nome' => 'Categoria checkout',
            'slug' => 'categoria-checkout',
            'ativo' => true,
            'status' => Categoria::STATUS_ATIVO,
        ]);
        $this->product = Produto::query()->create([
            'categoria_id' => $category->id,
            'nome' => 'Produto com promoção real',
            'slug' => 'produto-promocao-real',
            'preco' => '100.00',
            'preco_promo' => '0.00',
            'quantidade_estoque' => 2,
            'ativo' => true,
            'status_vitrine' => 'ATIVO',
        ]);
    }

    protected function tearDown(): void
    {
        app(TenantContextStore::class)->clear();

        parent::tearDown();
    }

    public function test_summary_is_rebuilt_from_the_catalog_and_selected_shipping_quote(): void
    {
        $items = [['id' => $this->product->id, 'quantity' => 1]];
        $address = $this->address();
        $quote = $this->quoteFor($items, $address);

        $this->withServerVariables([
            'HTTP_HOST' => 'checkout.test',
            'SERVER_NAME' => 'checkout.test',
        ])->postJson('http://checkout.test/api/storefront/checkout/summary', [
            'items' => $items,
            'address' => $address,
            'shipping_quote_token' => $quote->token,
        ])->assertOk()
            ->assertJsonPath('data.items.0.product_id', $this->product->id)
            ->assertJsonPath('data.items.0.unit_price_cents', 0)
            ->assertJsonPath('data.snapshot.product_subtotal_cents', 0)
            ->assertJsonPath('data.snapshot.shipping_cents', 1290)
            ->assertJsonPath('data.snapshot.net_total_cents', 1290)
            ->assertJsonPath('data.shipping.token', $quote->token);
    }

    public function test_summary_rejects_a_quote_when_the_cart_changes(): void
    {
        $items = [['id' => $this->product->id, 'quantity' => 1]];
        $address = $this->address();
        $quote = $this->quoteFor($items, $address);

        $this->withServerVariables([
            'HTTP_HOST' => 'checkout.test',
            'SERVER_NAME' => 'checkout.test',
        ])->postJson('http://checkout.test/api/storefront/checkout/summary', [
            'items' => [['id' => $this->product->id, 'quantity' => 2]],
            'address' => $address,
            'shipping_quote_token' => $quote->token,
        ])->assertStatus(422)
            ->assertJsonPath('code', 'CHECKOUT_UNAVAILABLE');
    }

    /**
     * @return array<string, string>
     */
    private function address(): array
    {
        return [
            'cep' => '01001-000',
            'rua' => 'Praça da Sé',
            'numero' => '100',
            'bairro' => 'Sé',
            'cidade' => 'São Paulo',
            'uf' => 'SP',
        ];
    }

    /**
     * @param  array<int, array{id: int, quantity: int}>  $items
     * @param  array<string, string>  $address
     */
    private function quoteFor(array $items, array $address): CheckoutShippingQuote
    {
        $fingerprints = app(CheckoutFingerprint::class);

        return CheckoutShippingQuote::query()->create([
            'token' => 'a8d42e51-4c8b-4972-b08d-3db6a2ceda0d',
            'cart_fingerprint' => $fingerprints->cart($items),
            'destination_fingerprint' => $fingerprints->destination($address),
            'provider' => 'melhor_envio',
            'service_code' => '1',
            'shipping_cents' => 1290,
            'estimated_delivery_days' => 3,
            'expires_at' => CarbonImmutable::now()->addMinutes(15),
        ]);
    }
}
