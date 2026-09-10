<?php

namespace Tests\Feature\Storefront;

use App\Domain\Payments\PaymentAttemptStatus;
use App\Domain\Tenancy\TenantContext;
use App\Domain\Tenancy\TenantContextStore;
use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\PaymentAttempt;
use App\Models\StorefrontCustomer;
use App\Models\Tenant;
use App\Models\TenantDomain;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class CheckoutPaymentStatusTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        app(TenantContextStore::class)->clear();

        parent::tearDown();
    }

    public function test_checkout_customer_can_read_only_its_own_tenant_payment_status(): void
    {
        $tenantA = $this->tenant('Loja A', 'loja-a', 'loja-a.test');
        $tenantB = $this->tenant('Loja B', 'loja-b', 'loja-b.test');
        [$customer, $token, $ownOrder] = app(TenantContextStore::class)->run(
            TenantContext::fromTenant($tenantA, 'loja-a.test'),
            fn (): array => $this->customerWithOrder('compradora@loja-a.test', PaymentAttemptStatus::SUCCEEDED),
        );
        [, , $sameTenantOrder] = app(TenantContextStore::class)->run(
            TenantContext::fromTenant($tenantA, 'loja-a.test'),
            fn (): array => $this->customerWithOrder('outra@loja-a.test', PaymentAttemptStatus::PENDING),
        );
        [, , $otherTenantOrder] = app(TenantContextStore::class)->run(
            TenantContext::fromTenant($tenantB, 'loja-b.test'),
            fn (): array => $this->customerWithOrder('compradora@loja-b.test', PaymentAttemptStatus::PENDING),
        );

        app(TenantContextStore::class)->clear();
        $headers = ['Authorization' => 'Bearer '.$token];
        $server = ['HTTP_HOST' => 'loja-a.test', 'SERVER_NAME' => 'loja-a.test'];

        $this->withServerVariables($server)
            ->withHeaders($headers)
            ->getJson('http://loja-a.test/api/storefront/checkout/orders/'.$ownOrder->id.'/payment-status')
            ->assertOk()
            ->assertJsonPath('data.order_id', $ownOrder->id)
            ->assertJsonPath('data.order_status', OrderStatus::AWAITING_PAYMENT->value)
            ->assertJsonPath('data.payment_status', PaymentAttemptStatus::SUCCEEDED->value)
            ->assertHeader('Cache-Control', 'no-store, private');

        $this->withServerVariables($server)
            ->withHeaders($headers)
            ->getJson('http://loja-a.test/api/storefront/checkout/orders/'.$sameTenantOrder->id.'/payment-status')
            ->assertNotFound();

        $this->withServerVariables($server)
            ->withHeaders($headers)
            ->getJson('http://loja-a.test/api/storefront/checkout/orders/'.$otherTenantOrder->id.'/payment-status')
            ->assertNotFound();
    }

    private function tenant(string $name, string $slug, string $domain): Tenant
    {
        $tenant = Tenant::query()->create(['name' => $name, 'slug' => $slug]);
        TenantDomain::query()->create([
            'tenant_id' => $tenant->id,
            'domain' => $domain,
            'is_primary' => true,
            'verified_at' => now(),
        ]);

        return $tenant;
    }

    /**
     * @return array{0: StorefrontCustomer, 1: string, 2: Order}
     */
    private function customerWithOrder(string $email, PaymentAttemptStatus $paymentStatus): array
    {
        $customer = StorefrontCustomer::query()->create([
            'name' => 'Pessoa compradora',
            'email' => $email,
            'password' => 'senha-segura',
            'status' => 'ACTIVE',
        ]);
        $order = Order::query()->create([
            'storefront_customer_id' => $customer->id,
            'subtotal' => '20.00',
            'frete' => '5.00',
            'desconto' => '0.00',
            'total' => '25.00',
            'status' => OrderStatus::AWAITING_PAYMENT,
            'payment_gateway' => 'stripe',
            'payment_method' => 'CARD',
            'payment_installments' => 1,
            'installment_value' => '25.00',
            'gateway_fee' => '0.00',
        ]);
        PaymentAttempt::query()->create([
            'order_id' => $order->id,
            'gateway' => 'stripe',
            'environment' => 'SANDBOX',
            'payment_method' => 'CARD',
            'status' => $paymentStatus,
            'idempotency_key' => (string) Str::uuid(),
            'checkout_fingerprint' => hash('sha256', $email),
            'amount_cents' => 2500,
            'currency' => 'BRL',
            'initiated_at' => now(),
        ]);

        return [$customer, $customer->createToken('checkout-status', ['storefront.checkout'], now()->addHour())->plainTextToken, $order];
    }
}
