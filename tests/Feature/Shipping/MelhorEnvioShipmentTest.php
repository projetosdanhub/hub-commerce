<?php

namespace Tests\Feature\Shipping;

use App\Domain\Shipping\MelhorEnvioShipmentClient;
use App\Domain\Shipping\MelhorEnvioShipmentService;
use App\Domain\Shipping\ShipmentOperation;
use App\Domain\Shipping\ShipmentStatus;
use App\Domain\Tenancy\TenantContextStore;
use App\Enums\OrderStatus;
use App\Jobs\ProcessMelhorEnvioWebhook;
use App\Models\MelhorEnvioSetting;
use App\Models\Order;
use App\Models\OrderShipment;
use App\Models\ProviderConnectionCredential;
use App\Models\ProviderInstallation;
use App\Models\ProviderWebhookEvent;
use App\Models\Tenant;
use App\Models\User;
use DomainException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Tests\TestCase;

class MelhorEnvioShipmentTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;

    private Order $order;

    protected function setUp(): void
    {
        parent::setUp();
        Http::preventStrayRequests();
        $this->tenant = Tenant::query()->create(['name' => 'Loja envio', 'slug' => 'loja-envio']);
        app(TenantContextStore::class)->setTenant($this->tenant);
        config(['provider-connections.melhor_envio.user_agent' => 'Hub (teste@example.test)']);
        $installation = ProviderInstallation::query()->create([
            'tenant_id' => $this->tenant->id, 'provider' => 'melhor_envio', 'environment' => 'SANDBOX',
            'connection_strategy' => 'OAUTH', 'status' => 'CONNECTED',
        ]);
        ProviderConnectionCredential::query()->create([
            'provider_installation_id' => $installation->id, 'access_token' => 'test-oauth-token',
            'expires_at' => now()->addHour(),
        ]);
        MelhorEnvioSetting::query()->create([
            'environment' => 'SANDBOX', 'carriers_ativas' => [['id' => '1', 'ativo' => true]],
            'sender_info' => [
                'nome' => 'Remetente', 'email' => 'sender@example.test', 'telefone' => '11987654321',
                'documento' => '52998224725', 'cep' => '01001000', 'rua' => 'Rua Um', 'numero' => '10',
                'bairro' => 'Centro', 'cidade' => 'São Paulo', 'uf' => 'SP',
            ],
        ]);
        $user = User::factory()->create();
        $this->order = Order::query()->create([
            'user_id' => $user->id, 'subtotal' => '20.00', 'frete' => '5.00', 'desconto' => '0.00',
            'total' => '25.00', 'status' => OrderStatus::READY_TO_SHIP,
        ]);
        $this->order->items()->create(['sku' => 'ITEM', 'product_name' => 'Caneca', 'quantity' => 2, 'price' => '10.00']);
        $this->order->address()->create([
            'cep' => '01002000', 'rua' => 'Rua Dois', 'num' => '20', 'bairro' => 'Centro', 'cidade' => 'São Paulo', 'uf' => 'SP',
        ]);
    }

    protected function tearDown(): void
    {
        app(TenantContextStore::class)->clear();
        parent::tearDown();
    }

    public function test_creation_is_idempotent_encrypted_and_does_not_mark_an_order_shipped(): void
    {
        $reference = (string) Str::uuid();
        $this->fakeCreation(Http::response(['id' => $reference], 201));
        $service = app(MelhorEnvioShipmentService::class);
        $first = $service->create($this->order, $this->input());
        $second = $service->create($this->order, $this->input());
        $this->assertSame($first->id, $second->id);
        $this->assertSame($reference, $first->provider_reference);
        $this->assertSame(ShipmentStatus::PENDING, $first->status);
        $this->assertSame(OrderStatus::READY_TO_SHIP, $this->order->fresh()->status);
        $this->assertSame('20.00', $first->request_payload['options']['insurance_value']);
        $this->assertStringNotContainsString('52998224725', DB::table('order_shipments')->value('request_payload'));
        $this->assertArrayNotHasKey('request_payload', $first->toArray());
        Http::assertSentCount(2);
    }

    public function test_uncertain_creation_is_not_repeated_and_can_be_recovered_by_opaque_tag(): void
    {
        $this->fakeCreation(Http::failedConnection());
        $service = app(MelhorEnvioShipmentService::class);
        try {
            $service->create($this->order, $this->input());
            $this->fail('Timeout deve permanecer pendente.');
        } catch (DomainException) {
            $shipment = OrderShipment::query()->firstOrFail();
            $this->assertSame(ShipmentOperation::CREATE, $shipment->operation);
            $this->assertSame('RECONCILIATION_REQUIRED', $shipment->failure_code);
        }
        $service->create($this->order, $this->input());
        Http::assertSentCount(1); // A conexão que falhou não é registrada como requisição concluída.
        $reference = (string) Str::uuid();
        Http::fake([
            '*/api/v2/me/cart' => Http::response([['id' => $reference, 'tags' => [['tag' => $shipment->public_id]]]]),
            '*/shipment/tracking' => Http::response([$reference => ['status' => 'pending']]),
        ]);
        $recovered = $service->synchronize($shipment);
        $this->assertSame($reference, $recovered->provider_reference);
        $this->assertNull($recovered->operation);
    }

    public function test_purchase_waits_for_provider_confirmation_and_webhook_cannot_regress_delivery(): void
    {
        $reference = (string) Str::uuid();
        $this->fakeCreation(Http::response(['id' => $reference], 201));
        $service = app(MelhorEnvioShipmentService::class);
        $shipment = $service->create($this->order, $this->input());
        Http::fake([
            '*/shipment/checkout' => Http::response([], 200),
            '*/shipment/tracking' => Http::response([$reference => ['status' => 'released']]),
        ]);
        $shipment = $service->operate($shipment, ShipmentOperation::PURCHASE);
        $this->assertSame(ShipmentStatus::RELEASED, $shipment->status);
        $this->assertSame(OrderStatus::READY_TO_SHIP, $this->order->fresh()->status);
        $event = ProviderWebhookEvent::query()->create([
            'provider' => 'melhor_envio', 'event_name' => 'order.delivered', 'payload_hash' => hash('sha256', 'delivered'),
            'payload' => ['environment' => 'SANDBOX', 'data' => ['id' => $reference, 'status' => 'delivered', 'tracking' => 'AA123456789BR']], 'received_at' => now(),
        ]);
        app(TenantContextStore::class)->clear();
        (new ProcessMelhorEnvioWebhook($event->id))->handle();
        (new ProcessMelhorEnvioWebhook($event->id))->handle();
        app(TenantContextStore::class)->setTenant($this->tenant);
        $this->assertNotNull($event->fresh()->processed_at);
        $service->applyStatus($shipment, ShipmentStatus::PENDING);
        $this->assertSame(ShipmentStatus::DELIVERED, $shipment->fresh()->status);
        $this->assertSame(OrderStatus::DELIVERED, $this->order->fresh()->status);
        $this->assertSame('AA123456789BR', $this->order->fresh()->tracking_code);
    }

    public function test_cancellation_does_not_clear_local_state_after_provider_failure(): void
    {
        $this->fakeCreation(Http::response(['id' => (string) Str::uuid()], 201));
        $service = app(MelhorEnvioShipmentService::class);
        $shipment = $service->create($this->order, $this->input());
        Http::fake(['*/cart/*' => Http::response([], 500)]);
        try {
            $service->operate($shipment, ShipmentOperation::CANCEL, 'Pedido revisto');
            $this->fail('Falha do provedor não pode confirmar cancelamento.');
        } catch (DomainException) {
            $this->assertTrue($shipment->fresh()->active_slot);
            $this->assertSame(ShipmentOperation::CANCEL, $shipment->fresh()->operation);
        }
    }

    public function test_foreign_tenant_cannot_operate_a_shipment_even_with_an_in_memory_model(): void
    {
        $this->fakeCreation(Http::response(['id' => (string) Str::uuid()], 201));
        $shipment = app(MelhorEnvioShipmentService::class)->create($this->order, $this->input());
        app(TenantContextStore::class)->clear();
        app(TenantContextStore::class)->setTenant(Tenant::query()->create(['name' => 'Outra', 'slug' => 'outra']));
        $this->assertNull(OrderShipment::query()->find($shipment->id));
        $this->expectException(DomainException::class);
        app(MelhorEnvioShipmentClient::class)->request($shipment, 'POST', 'shipment/checkout');
    }

    private function fakeCreation(mixed $response): void
    {
        Http::fake([
            '*/shipment/calculate' => Http::response([['id' => 1, 'price' => '15.50', 'delivery_time' => 3]]),
            '*/api/v2/me/cart' => $response,
        ]);
    }

    private function input(): array
    {

        return [
            'me_carrier_id' => '1', 'vol_altura' => '10', 'vol_largura' => '15', 'vol_comprimento' => '20', 'vol_peso' => '0.5',
            'doc_tipo' => 'DECLARACAO', 'recipient_document' => '52998224725', 'recipient_phone' => '11987654321',
            'me_insurance_value' => '0.01',
        ];
    }
}
