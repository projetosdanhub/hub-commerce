<?php

namespace App\Services\Catalog;

use App\Models\InventoryTransaction;
use App\Models\ProdutoVariacao;
use App\Domain\Tenancy\TenantContextStore;
use Illuminate\Support\Facades\DB;
use Exception;

class InventoryService
{
    /**
     * Reserve inventory for an order (atomic)
     */
    public function reserve(int $variacaoId, int $quantidade, ?string $referenceId = null, ?string $referenceType = null): InventoryTransaction
    {
        if ($quantidade <= 0) {
            throw new Exception("A quantidade para reserva deve ser maior que zero.");
        }

        return DB::transaction(function () use ($variacaoId, $quantidade, $referenceId, $referenceType) {
            $variacao = ProdutoVariacao::where('id', $variacaoId)->lockForUpdate()->firstOrFail();
            
            $allowOverselling = config('hub.inventory.allow_overselling', false);

            if (!$allowOverselling && $variacao->estoque < $quantidade) {
                throw new Exception("Estoque insuficiente para a variação {$variacao->sku}. Disponível: {$variacao->estoque}");
            }

            $variacao->estoque -= $quantidade;
            $variacao->save();

            $tenantContext = app(TenantContextStore::class)->require();

            return InventoryTransaction::create([
                'tenant_id' => $tenantContext->tenantId,
                'produto_id' => $variacao->produto_id,
                'variacao_id' => $variacao->id,
                'quantidade' => -$quantidade,
                'tipo' => InventoryTransaction::TIPO_RESERVA,
                'reference_id' => $referenceId,
                'reference_type' => $referenceType,
            ]);
        });
    }

    /**
     * Restock inventory (e.g. cancelled order or manual adjustment)
     */
    public function adjust(int $variacaoId, int $quantidade, string $tipo, ?string $referenceId = null, ?string $referenceType = null): InventoryTransaction
    {
        return DB::transaction(function () use ($variacaoId, $quantidade, $tipo, $referenceId, $referenceType) {
            $variacao = ProdutoVariacao::where('id', $variacaoId)->lockForUpdate()->firstOrFail();
            
            $variacao->estoque += $quantidade;
            $variacao->save();

            $tenantContext = app(TenantContextStore::class)->require();

            return InventoryTransaction::create([
                'tenant_id' => $tenantContext->tenantId,
                'produto_id' => $variacao->produto_id,
                'variacao_id' => $variacao->id,
                'quantidade' => $quantidade,
                'tipo' => $tipo,
                'reference_id' => $referenceId,
                'reference_type' => $referenceType,
            ]);
        });
    }
}
