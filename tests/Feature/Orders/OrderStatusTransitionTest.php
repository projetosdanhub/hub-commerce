<?php

namespace Tests\Feature\Orders;

use App\Domain\Identity\TenantOwnershipService;
use App\Domain\Tenancy\TenantContext;
use App\Domain\Tenancy\TenantContextStore;
use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Tenant;
use App\Models\TenantDomain;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class OrderStatusTransitionTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        app(TenantContextStore::class)->clear();

        parent::tearDown();
    }

    public function test_admin_can_only_apply_allowed_order_transitions(): void
    {
        [$tenant, $owner] = $this->tenantWithOwner(
            'Loja pedidos',
            'loja-pedidos',
            'pedidos.test',
            'owner@pedidos.test',
        );

        $order = $this->createOrder($tenant, OrderStatus::AWAITING_PAYMENT);

        $this->actingAs($owner, 'sanctum')
            ->withServerVariables(['HTTP_HOST' => 'pedidos.test', 'SERVER_NAME' => 'pedidos.test'])
            ->putJson("http://pedidos.test/api/admin/orders/{$order->id}/status", [
                'status' => OrderStatus::PICKING->value,
            ])
            ->assertOk();

        $this->setTenantContext($tenant, 'pedidos.test');
        $order->refresh();

        $this->assertSame(OrderStatus::PICKING, $order->status);
        $this->assertDatabaseHas('order_histories', [
            'tenant_id' => $tenant->id,
            'order_id' => $order->id,
        ]);

        app(TenantContextStore::class)->clear();

        $this->actingAs($owner, 'sanctum')
            ->withServerVariables(['HTTP_HOST' => 'pedidos.test', 'SERVER_NAME' => 'pedidos.test'])
            ->putJson("http://pedidos.test/api/admin/orders/{$order->id}/status", [
                'status' => OrderStatus::DELIVERED->value,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('status');

        $this->actingAs($owner, 'sanctum')
            ->withServerVariables(['HTTP_HOST' => 'pedidos.test', 'SERVER_NAME' => 'pedidos.test'])
            ->putJson("http://pedidos.test/api/admin/orders/{$order->id}/status", [
                'status' => 'STATUS_ARBITRARIO',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('status');

        $this->setTenantContext($tenant, 'pedidos.test');

        $this->assertSame(OrderStatus::PICKING, $order->fresh()->status);
        $this->assertDatabaseCount('order_histories', 1);
    }

    public function test_order_transition_endpoint_cannot_reach_another_tenant(): void
    {
        [$tenantA, $ownerA] = $this->tenantWithOwner(
            'Loja A',
            'pedidos-loja-a',
            'pedidos-a.test',
            'owner@pedidos-a.test',
        );
        [$tenantB] = $this->tenantWithOwner(
            'Loja B',
            'pedidos-loja-b',
            'pedidos-b.test',
            'owner@pedidos-b.test',
        );

        $foreignOrder = $this->createOrder($tenantB, OrderStatus::AWAITING_PAYMENT);

        $this->actingAs($ownerA, 'sanctum')
            ->withServerVariables(['HTTP_HOST' => 'pedidos-a.test', 'SERVER_NAME' => 'pedidos-a.test'])
            ->putJson("http://pedidos-a.test/api/admin/orders/{$foreignOrder->id}/status", [
                'status' => OrderStatus::PICKING->value,
            ])
            ->assertNotFound();

        app(TenantContextStore::class)->clear();
        $this->setTenantContext($tenantB, 'pedidos-b.test');

        $this->assertSame(OrderStatus::AWAITING_PAYMENT, $foreignOrder->fresh()->status);
        $this->assertDatabaseCount('order_histories', 0);
    }

    public function test_paid_order_cannot_be_cancelled_and_refund_requires_two_or_fewer_private_receipts(): void
    {
        [$tenant, $owner] = $this->tenantWithOwner(
            'Loja de reembolso',
            'reembolso',
            'reembolso.test',
            'owner@reembolso.test',
        );

        $paidOrder = $this->createOrder($tenant, OrderStatus::PICKING);

        $this->actingAs($owner, 'sanctum')
            ->withServerVariables(['HTTP_HOST' => 'reembolso.test', 'SERVER_NAME' => 'reembolso.test'])
            ->postJson("http://reembolso.test/api/admin/orders/{$paidOrder->id}/status-manual", [
                'acao' => 'CANCELAR',
                'motivo' => 'Pedido já foi pago.',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('status');

        $this->setTenantContext($tenant, 'reembolso.test');
        $refundOrder = Order::query()->create([
            'subtotal' => 100,
            'frete' => 10,
            'desconto' => 0,
            'total' => 110,
            'status' => OrderStatus::REFUND_REVIEW,
            'payment_installments' => 1,
        ]);
        app(TenantContextStore::class)->clear();
        Storage::fake('local');

        $this->actingAs($owner, 'sanctum')
            ->withServerVariables(['HTTP_HOST' => 'reembolso.test', 'SERVER_NAME' => 'reembolso.test'])
            ->post("http://reembolso.test/api/admin/orders/{$refundOrder->id}/status-manual", [
                'acao' => 'PROCESSAR_REEMBOLSO',
                'motivo' => 'Devolução confirmada.',
                'refund_method' => 'TRANSFERENCIA',
                'comprovantes' => [
                    UploadedFile::fake()->image('comprovante-1.png'),
                    UploadedFile::fake()->create('comprovante-2.pdf', 10, 'application/pdf'),
                ],
            ])
            ->assertOk();

        $this->setTenantContext($tenant, 'reembolso.test');
        $refundOrder->refresh();

        $this->assertSame(OrderStatus::REFUNDED, $refundOrder->status);
        $this->assertCount(2, $refundOrder->refund_receipts);
        foreach ($refundOrder->refund_receipts as $receipt) {
            Storage::disk('local')->assertExists($receipt);
        }
    }

    public function test_owner_preferences_for_order_metrics_are_isolated_by_tenant(): void
    {
        [$tenantA, $ownerA] = $this->tenantWithOwner(
            'Loja de métricas A',
            'metricas-a',
            'metricas-a.test',
            'owner@metricas-a.test',
        );
        [$tenantB, $ownerB] = $this->tenantWithOwner(
            'Loja de métricas B',
            'metricas-b',
            'metricas-b.test',
            'owner@metricas-b.test',
        );

        $payload = [
            'order' => ['refund-review', 'valid-revenue', 'awaiting-shipment', 'pix-confirmed'],
            'hidden' => ['pix-confirmed'],
        ];

        $this->actingAs($ownerA, 'sanctum')
            ->withServerVariables(['HTTP_HOST' => 'metricas-a.test', 'SERVER_NAME' => 'metricas-a.test'])
            ->putJson('http://metricas-a.test/api/admin/orders/metric-preferences', $payload)
            ->assertOk()
            ->assertExactJson($payload);

        app(TenantContextStore::class)->clear();

        $this->actingAs($ownerB, 'sanctum')
            ->withServerVariables(['HTTP_HOST' => 'metricas-b.test', 'SERVER_NAME' => 'metricas-b.test'])
            ->getJson('http://metricas-b.test/api/admin/orders/metric-preferences')
            ->assertOk()
            ->assertExactJson([
                'order' => ['valid-revenue', 'awaiting-shipment', 'pix-confirmed', 'refund-review'],
                'hidden' => [],
            ]);

        app(TenantContextStore::class)->clear();

        $this->setTenantContext($tenantA, 'metricas-a.test');

        $this->assertDatabaseHas('admin_metric_preferences', [
            'tenant_id' => $tenantA->id,
            'user_id' => $ownerA->id,
            'context' => 'orders',
        ]);
    }

    public function test_terminal_states_have_no_outgoing_transitions(): void
    {
        $this->assertSame([], OrderStatus::CANCELLED->allowedTransitions());
        $this->assertSame([], OrderStatus::REFUNDED->allowedTransitions());
        $this->assertFalse(OrderStatus::AWAITING_PAYMENT->canTransitionTo(OrderStatus::SHIPPED));
        $this->assertTrue(OrderStatus::AWAITING_PAYMENT->canTransitionTo(OrderStatus::CANCELLED));
        $this->assertFalse(OrderStatus::PICKING->canTransitionTo(OrderStatus::CANCELLED));
        $this->assertTrue(OrderStatus::READY_TO_SHIP->canTransitionTo(OrderStatus::SHIPPED));
    }

    private function createOrder(Tenant $tenant, OrderStatus $status): Order
    {
        $domain = $tenant->domains()->where('is_primary', true)->value('domain');
        $this->setTenantContext($tenant, $domain);

        $order = Order::query()->create([
            'subtotal' => 100,
            'frete' => 10,
            'desconto' => 0,
            'total' => 110,
            'status' => $status,
            'payment_installments' => 1,
        ]);

        app(TenantContextStore::class)->clear();

        return $order;
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
