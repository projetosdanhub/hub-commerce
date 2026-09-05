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
use Tests\TestCase;

class OrderMetricsTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        app(TenantContextStore::class)->clear();

        parent::tearDown();
    }

    public function test_metrics_use_canonical_statuses_and_are_tenant_scoped(): void
    {
        [$tenantA, $ownerA] = $this->tenantWithOwner('Loja A', 'loja-a', 'loja-a.test', 'owner@loja-a.test');
        [$tenantB] = $this->tenantWithOwner('Loja B', 'loja-b', 'loja-b.test', 'owner@loja-b.test');

        $this->createOrder($tenantA, OrderStatus::AWAITING_PAYMENT, 'PIX', 100);
        $this->createOrder($tenantA, OrderStatus::PICKING, 'Pix parcelado', 200);
        $this->createOrder($tenantA, OrderStatus::REFUND_REVIEW, 'Cartão', 300);
        $this->createOrder($tenantA, OrderStatus::REFUNDED, 'Cartão', 400);
        $this->createOrder($tenantA, OrderStatus::CANCELLED, 'Boleto', 500);
        $this->createOrder($tenantB, OrderStatus::PICKING, 'PIX', 900);

        $this->actingAs($ownerA, 'sanctum')
            ->withServerVariables(['HTTP_HOST' => 'loja-a.test', 'SERVER_NAME' => 'loja-a.test'])
            ->getJson('http://loja-a.test/api/admin/orders/metrics')
            ->assertOk()
            ->assertJsonPath('totais', 5)
            ->assertJsonPath('aEnviar', 1)
            ->assertJsonPath('pixTotais', 2)
            ->assertJsonPath('pixPagos', 1)
            ->assertJsonPath('conversaoPix', 50.0)
            ->assertJsonPath('cancelados', 1)
            ->assertJsonPath('qtdReembolsados', 1)
            ->assertJsonPath('valorReembolsado', 400.0)
            ->assertJsonPath('emAnalise', 1)
            ->assertJsonPath('ltv', 600.0);
    }

    private function createOrder(Tenant $tenant, OrderStatus $status, ?string $paymentMethod, int $total): void
    {
        $domain = $tenant->domains()->where('is_primary', true)->value('domain');
        $this->setTenantContext($tenant, $domain);

        Order::query()->create([
            'subtotal' => $total,
            'frete' => 0,
            'desconto' => 0,
            'total' => $total,
            'status' => $status,
            'payment_method' => $paymentMethod,
            'payment_installments' => 1,
        ]);

        app(TenantContextStore::class)->clear();
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
