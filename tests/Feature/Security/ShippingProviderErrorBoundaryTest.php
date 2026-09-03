<?php

namespace Tests\Feature\Security;

use App\Domain\Identity\TenantOwnershipService;
use App\Domain\Tenancy\TenantContext;
use App\Domain\Tenancy\TenantContextStore;
use App\Models\MelhorEnvioSetting;
use App\Models\Order;
use App\Models\OrderAddress;
use App\Models\OrderItem;
use App\Models\Tenant;
use App\Models\TenantDomain;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ShippingProviderErrorBoundaryTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        app(TenantContextStore::class)->clear();

        parent::tearDown();
    }

    public function test_shipping_provider_error_details_are_not_exposed_to_the_tenant_panel(): void
    {
        [$tenant, $owner] = $this->tenantWithOwner();

        $this->setTenantContext($tenant, 'shipping.test');

        $buyer = User::query()->create([
            'name' => 'Cliente de teste',
            'email' => 'cliente@shipping.test',
            'email_verified_at' => now(),
            'password' => Hash::make('SenhaForte123!'),
            'role' => 'cliente',
            'status' => 'ATIVO',
            'telefone' => '11999999999',
            'cpf' => '12345678909',
        ]);

        $order = Order::query()->create([
            'user_id' => $buyer->getKey(),
            'subtotal' => 100,
            'frete' => 10,
            'desconto' => 0,
            'total' => 110,
            'status' => 'SEPARADO',
            'payment_method' => 'Pix',
            'payment_installments' => 1,
        ]);

        OrderAddress::query()->create([
            'order_id' => $order->getKey(),
            'cep' => '01001000',
            'rua' => 'Praça da Sé',
            'num' => '1',
            'bairro' => 'Sé',
            'cidade' => 'São Paulo',
            'uf' => 'SP',
        ]);

        OrderItem::query()->create([
            'order_id' => $order->getKey(),
            'sku' => 'SKU-TESTE',
            'product_name' => 'Produto de teste',
            'quantity' => 1,
            'price' => 100,
        ]);

        MelhorEnvioSetting::query()->create([
            'access_token' => 'tenant-provider-token',
            'sender_info' => [
                'nome' => 'Loja de teste',
                'telefone' => '1133333333',
                'email' => 'remetente@shipping.test',
                'documento' => '12345678000199',
                'rua' => 'Rua da Loja',
                'numero' => '10',
                'bairro' => 'Centro',
                'cidade' => 'São Paulo',
                'uf' => 'SP',
                'cep' => '01001000',
            ],
        ]);

        app(TenantContextStore::class)->clear();

        Http::fake([
            'https://sandbox.melhorenvio.com.br/api/v2/me/cart' => Http::response([
                'message' => 'Detalhe confidencial retornado pelo fornecedor.',
                'provider_token' => 'provider-secret-token',
            ], 422),
        ]);

        $response = $this->actingAs($owner, 'sanctum')
            ->withServerVariables(['HTTP_HOST' => 'shipping.test', 'SERVER_NAME' => 'shipping.test'])
            ->postJson('http://shipping.test/api/admin/orders/'.$order->getKey().'/status-manual', [
                'acao' => 'DESPACHAR',
                'dispatch_type' => 'MELHORENVIO',
                'me_carrier_id' => 1,
                'doc_tipo' => 'DECLARACAO',
                'vol_altura' => 10,
                'vol_largura' => 10,
                'vol_comprimento' => 10,
                'vol_peso' => 1,
            ]);

        $response
            ->assertStatus(422)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('code', 'SHIPPING_PROVIDER_REJECTED')
            ->assertJsonPath('message', 'Não foi possível gerar a etiqueta com os dados informados. Revise o envio e tente novamente.');

        $this->assertStringNotContainsString('Detalhe confidencial retornado pelo fornecedor.', $response->getContent());
        $this->assertStringNotContainsString('provider-secret-token', $response->getContent());
    }

    /**
     * @return array{0: Tenant, 1: User}
     */
    private function tenantWithOwner(): array
    {
        $tenant = Tenant::query()->create([
            'name' => 'Loja de frete',
            'slug' => 'loja-frete',
            'status' => Tenant::STATUS_ACTIVE,
        ]);

        TenantDomain::query()->create([
            'tenant_id' => $tenant->getKey(),
            'domain' => 'shipping.test',
            'is_primary' => true,
            'verified_at' => now(),
        ]);

        $owner = User::query()->create([
            'name' => 'Proprietário da loja',
            'email' => 'owner@shipping.test',
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
