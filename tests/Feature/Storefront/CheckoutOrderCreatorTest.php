<?php

namespace Tests\Feature\Storefront;

use App\Domain\Orders\CheckoutFingerprint;
use App\Domain\Orders\CheckoutOrderCommand;
use App\Domain\Orders\CheckoutOrderCreator;
use App\Domain\Tenancy\TenantContext;
use App\Domain\Tenancy\TenantContextStore;
use App\Models\Categoria;
use App\Models\CheckoutShippingQuote;
use App\Models\Order;
use App\Models\PaymentAttempt;
use App\Models\Produto;
use App\Models\StorefrontCustomer;
use App\Models\Tenant;
use Carbon\CarbonImmutable;
use DomainException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class CheckoutOrderCreatorTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;

    private Produto $product;

    private StorefrontCustomer $customer;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::query()->create([
            'name' => 'Loja checkout',
            'slug' => 'loja-checkout',
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
            'nome' => 'Produto do pedido',
            'slug' => 'produto-do-pedido',
            'descricao' => 'Produto para o pedido atômico.',
            'preco' => '100.00',
            'quantidade_estoque' => 2,
            'ativo' => true,
            'status_vitrine' => 'ATIVO',
            'sku_ref' => 'SKU-ATOMIC',
        ]);
        $this->customer = StorefrontCustomer::query()->create([
            'name' => 'Compradora',
            'email' => 'compradora@checkout.test',
            'password' => 'senha-segura',
            'status' => 'ACTIVE',
        ]);
    }

    protected function tearDown(): void
    {
        app(TenantContextStore::class)->clear();

        parent::tearDown();
    }

    public function test_it_persists_an_order_snapshot_and_pending_attempt_atomically(): void
    {
        $items = [['id' => $this->product->id, 'quantity' => 1]];
        $address = $this->address();
        $quote = $this->quoteFor($items, $address);
        $result = app(CheckoutOrderCreator::class)->create($this->command($items, $address, $quote->token));

        $this->assertFalse($result->idempotent);
        $this->assertSame(1, Order::query()->count());
        $this->assertSame(1, PaymentAttempt::query()->count());
        $this->assertSame(1, $result->order->items()->count());
        $this->assertSame('A_PAGAR', $result->order->status->value);
        $this->assertSame(11_290, $result->paymentAttempt->amount_cents);
        $this->assertSame('BRL', $result->paymentAttempt->currency);
        $this->assertNotNull($quote->fresh()->invalidated_at);
    }

    public function test_an_identical_retry_returns_the_same_order_without_duplication(): void
    {
        $items = [['id' => $this->product->id, 'quantity' => 1]];
        $address = $this->address();
        $quote = $this->quoteFor($items, $address);
        $command = $this->command($items, $address, $quote->token);

        $first = app(CheckoutOrderCreator::class)->create($command);
        $retry = app(CheckoutOrderCreator::class)->create($command);

        $this->assertFalse($first->idempotent);
        $this->assertTrue($retry->idempotent);
        $this->assertSame($first->order->getKey(), $retry->order->getKey());
        $this->assertSame(1, Order::query()->count());
        $this->assertSame(1, PaymentAttempt::query()->count());
    }

    public function test_an_idempotency_key_cannot_be_reused_for_a_different_checkout(): void
    {
        $items = [['id' => $this->product->id, 'quantity' => 1]];
        $address = $this->address();
        $quote = $this->quoteFor($items, $address);
        $command = $this->command($items, $address, $quote->token);

        app(CheckoutOrderCreator::class)->create($command);

        $this->expectException(DomainException::class);

        app(CheckoutOrderCreator::class)->create(new CheckoutOrderCommand(
            $this->customer->id,
            [['id' => $this->product->id, 'quantity' => 2]],
            $address,
            $quote->token,
            'stripe',
            'SANDBOX',
            'CARD',
            $command->idempotencyKey,
        ));
    }

    public function test_an_idempotency_key_cannot_be_reused_by_a_different_customer(): void
    {
        $items = [['id' => $this->product->id, 'quantity' => 1]];
        $address = $this->address();
        $quote = $this->quoteFor($items, $address);
        $command = $this->command($items, $address, $quote->token);

        app(CheckoutOrderCreator::class)->create($command);

        $anotherCustomer = StorefrontCustomer::query()->create([
            'name' => 'Outro comprador',
            'email' => 'outro@checkout.test',
            'password' => 'senha-segura',
            'status' => 'ACTIVE',
        ]);

        $this->expectException(DomainException::class);

        app(CheckoutOrderCreator::class)->create(new CheckoutOrderCommand(
            $anotherCustomer->id,
            $items,
            $address,
            $quote->token,
            'stripe',
            'SANDBOX',
            'CARD',
            $command->idempotencyKey,
        ));
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
            'token' => (string) Str::uuid(),
            'cart_fingerprint' => $fingerprints->cart($items),
            'destination_fingerprint' => $fingerprints->destination($address),
            'provider' => 'melhor_envio',
            'service_code' => '1',
            'shipping_cents' => 1290,
            'estimated_delivery_days' => 3,
            'expires_at' => CarbonImmutable::now()->addMinutes(15),
        ]);
    }

    /**
     * @param  array<int, array{id: int, quantity: int}>  $items
     * @param  array<string, string>  $address
     */
    private function command(array $items, array $address, string $quoteToken): CheckoutOrderCommand
    {
        return new CheckoutOrderCommand(
            $this->customer->id,
            $items,
            $address,
            $quoteToken,
            'stripe',
            'SANDBOX',
            'CARD',
            '4f79cde7-7b0a-43db-8fd5-d34c6b1c51f4',
        );
    }
}
