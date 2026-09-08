<?php

namespace Tests\Feature\Orders;

use App\Domain\Identity\TenantOwnershipService;
use App\Domain\Tenancy\TenantContext;
use App\Domain\Tenancy\TenantContextStore;
use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderItemCustomizationMedia;
use App\Models\Tenant;
use App\Models\TenantDomain;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class OrderCustomizationMediaTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        app(TenantContextStore::class)->clear();
        parent::tearDown();
    }

    public function test_order_exposes_only_signed_customization_media_for_its_tenant(): void
    {
        Storage::fake('local');
        [$tenant, $owner] = $this->tenantWithOwner('Loja de mídia', 'loja-midia', 'midia.test', 'owner@midia.test');
        $this->setTenantContext($tenant, 'midia.test');

        $order = Order::query()->create(['subtotal' => 100, 'frete' => 10, 'desconto' => 0, 'total' => 110, 'status' => OrderStatus::PICKING, 'payment_method' => 'Pix', 'payment_installments' => 1]);
        $item = OrderItem::query()->create(['order_id' => $order->id, 'product_name' => 'Quadro personalizado', 'quantity' => 1, 'price' => 100, 'customization' => ['Mensagem' => 'Presente especial']]);
        $path = 'tenants/'.$tenant->uuid.'/private/orders/'.$order->id.'/customizations/arte.png';
        Storage::disk('local')->put($path, 'imagem-local-de-teste');
        OrderItemCustomizationMedia::query()->create(['order_item_id' => $item->id, 'original_name' => 'arte.png', 'storage_path' => $path, 'mime_type' => 'image/png', 'byte_size' => Storage::disk('local')->size($path)]);
        app(TenantContextStore::class)->clear();

        $this->withoutExceptionHandling();

        $response = $this->actingAs($owner, 'sanctum')->withServerVariables(['HTTP_HOST' => 'midia.test', 'SERVER_NAME' => 'midia.test'])->getJson('http://midia.test/api/admin/orders')->assertOk()->assertJsonPath('data.0.items.0.personalizacao.Mensagem', 'Presente especial');
        $media = $response->json('data.0.items.0.personalizacao.media.0');

        $this->assertSame('arte.png', $media['name']);
        $this->assertArrayNotHasKey('storage_path', $media);
        $this->assertStringContainsString('signature=', $media['preview_url']);
        $this->assertStringContainsString('signature=', $media['download_url']);

        $this->actingAs($owner, 'sanctum')->get($media['preview_url'])->assertOk()->assertHeader('content-disposition', 'inline; filename=arte.png');
        $this->actingAs($owner, 'sanctum')->get($media['download_url'])->assertOk()->assertHeader('content-disposition', 'attachment; filename=arte.png');
    }

    public function test_order_index_does_not_expose_customization_media_from_another_tenant(): void
    {
        [$tenantA, $ownerA] = $this->tenantWithOwner('Loja A', 'loja-a', 'loja-a.test', 'owner@loja-a.test');
        [$tenantB] = $this->tenantWithOwner('Loja B', 'loja-b', 'loja-b.test', 'owner@loja-b.test');
        $this->setTenantContext($tenantB, 'loja-b.test');
        $order = Order::query()->create(['subtotal' => 50, 'frete' => 0, 'desconto' => 0, 'total' => 50, 'status' => OrderStatus::AWAITING_PAYMENT, 'payment_installments' => 1]);
        $item = OrderItem::query()->create(['order_id' => $order->id, 'product_name' => 'Item exclusivo da loja B', 'quantity' => 1, 'price' => 50]);
        OrderItemCustomizationMedia::query()->create(['order_item_id' => $item->id, 'original_name' => 'sigiloso.png', 'storage_path' => 'tenants/'.$tenantB->uuid.'/private/orders/'.$order->id.'/customizations/sigiloso.png', 'mime_type' => 'image/png', 'byte_size' => 1]);
        app(TenantContextStore::class)->clear();

        $this->actingAs($ownerA, 'sanctum')->withServerVariables(['HTTP_HOST' => 'loja-a.test', 'SERVER_NAME' => 'loja-a.test'])->getJson('http://loja-a.test/api/admin/orders')->assertOk()->assertJsonCount(0, 'data');
    }

    private function tenantWithOwner(string $name, string $slug, string $domain, string $email): array
    {
        $tenant = Tenant::query()->create(['name' => $name, 'slug' => $slug, 'status' => Tenant::STATUS_ACTIVE]);
        TenantDomain::query()->create(['tenant_id' => $tenant->id, 'domain' => $domain, 'is_primary' => true, 'verified_at' => now()]);
        $owner = User::query()->create(['name' => 'Proprietário', 'email' => $email, 'email_verified_at' => now(), 'password' => Hash::make('SenhaForte123!'), 'role' => 'cliente', 'status' => 'ATIVO']);
        app(TenantOwnershipService::class)->assignInitialOwner($tenant, $owner);

        return [$tenant, $owner];
    }

    private function setTenantContext(Tenant $tenant, string $domain): void
    {
        app(TenantContextStore::class)->set(TenantContext::fromTenant($tenant, $domain));
    }
}
