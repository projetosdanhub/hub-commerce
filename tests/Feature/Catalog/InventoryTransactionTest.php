<?php

namespace Tests\Feature\Catalog;

use App\Domain\Tenancy\TenantContext;
use App\Domain\Tenancy\TenantContextStore;
use App\Models\ProdutoVariacao;
use App\Models\Tenant;
use App\Services\Catalog\InventoryService;
use Exception;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class InventoryTransactionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        $tenant = Tenant::factory()->create();
        app(TenantContextStore::class)->set(new TenantContext(
            $tenant->id,
            $tenant->uuid,
            $tenant->slug
        ));
    }

    public function test_can_reserve_inventory_successfully(): void
    {
        $variacao = ProdutoVariacao::factory()->create(['estoque' => 10]);

        $service = new InventoryService();
        $transaction = $service->reserve($variacao->id, 2, 'order-123', 'App\Models\Order');

        $this->assertEquals(-2, $transaction->quantidade);
        $this->assertEquals('RESERVA', $transaction->tipo);
        $this->assertEquals('order-123', $transaction->reference_id);

        $variacao->refresh();
        $this->assertEquals(8, $variacao->estoque);
    }

    public function test_cannot_reserve_more_than_available_by_default(): void
    {
        $variacao = ProdutoVariacao::factory()->create(['estoque' => 5]);
        $service = new InventoryService();

        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Estoque insuficiente');

        $service->reserve($variacao->id, 10);
    }

    public function test_can_oversell_when_configured(): void
    {
        Config::set('hub.inventory.allow_overselling', true);

        $variacao = ProdutoVariacao::factory()->create(['estoque' => 5]);
        $service = new InventoryService();

        $transaction = $service->reserve($variacao->id, 10);

        $this->assertEquals(-10, $transaction->quantidade);
        
        $variacao->refresh();
        $this->assertEquals(-5, $variacao->estoque);
    }

    public function test_can_adjust_inventory_up(): void
    {
        $variacao = ProdutoVariacao::factory()->create(['estoque' => 10]);
        $service = new InventoryService();

        $transaction = $service->adjust($variacao->id, 5, 'AJUSTE');

        $this->assertEquals(5, $transaction->quantidade);
        $this->assertEquals('AJUSTE', $transaction->tipo);

        $variacao->refresh();
        $this->assertEquals(15, $variacao->estoque);
    }
}
