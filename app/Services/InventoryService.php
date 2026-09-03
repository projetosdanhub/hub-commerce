<?php

namespace App\Services;

use App\Models\Produto;
use App\Models\ProdutoVariacao;
use Illuminate\Support\Facades\DB;
use Exception;

class InventoryService
{
    /**
     * Deduz o estoque de um produto (ou variação) e contabiliza encomenda se não houver estoque suficiente (em pré-venda).
     * @param int $produtoId
     * @param int|null $variacaoId
     * @param int $quantidade
     * @return array
     * @throws Exception
     */
    public function deduceStock(int $produtoId, ?int $variacaoId, int $quantidade): array
    {
        return DB::transaction(function () use ($produtoId, $variacaoId, $quantidade) {
            $produto = Produto::lockForUpdate()->findOrFail($produtoId);
            
            // Se o produto não controla estoque, não fazemos nada.
            if (!$produto->controlar_estoque) {
                return ['status' => 'success', 'message' => 'Estoque não controlado.'];
            }

            $modelToUpdate = $variacaoId ? ProdutoVariacao::lockForUpdate()->findOrFail($variacaoId) : $produto;
            
            // NOTE: A tabela de ProdutoVariacao usa o campo 'estoque' ao invés de 'quantidade_estoque'
            $estoqueAtual = $variacaoId ? $modelToUpdate->estoque : $modelToUpdate->quantidade_estoque;
            
            // Se tiver estoque suficiente
            if ($estoqueAtual >= $quantidade) {
                if ($variacaoId) {
                    $modelToUpdate->estoque -= $quantidade;
                } else {
                    $modelToUpdate->quantidade_estoque -= $quantidade;
                }
                $modelToUpdate->save();
                return ['status' => 'success', 'message' => 'Estoque físico reduzido.'];
            }

            // Se não tiver estoque suficiente, verificamos pré-venda
            if (!$produto->pre_venda) {
                throw new Exception("Estoque insuficiente para o produto: {$produto->nome}");
            }

            // Tem algo em estoque, mas não o suficiente
            $faltante = $quantidade - $estoqueAtual;
            
            if ($variacaoId) {
                $modelToUpdate->estoque = 0;
            } else {
                $modelToUpdate->quantidade_estoque = 0;
            }
            
            $modelToUpdate->quantidade_encomendada += $faltante;
            $modelToUpdate->save();

            return [
                'status' => 'success', 
                'message' => "Estoque físico zerado. {$faltante} itens adicionados à encomenda."
            ];
        });
    }

    /**
     * Restitui o estoque de um produto ou variação.
     * Tenta primeiro reduzir as "encomendas pendentes", e o que sobrar volta pro estoque físico.
     * @param int $produtoId
     * @param int|null $variacaoId
     * @param int $quantidade
     * @return array
     */
    public function restoreStock(int $produtoId, ?int $variacaoId, int $quantidade): array
    {
        return DB::transaction(function () use ($produtoId, $variacaoId, $quantidade) {
            $produto = Produto::lockForUpdate()->findOrFail($produtoId);

            if (!$produto->controlar_estoque) {
                return ['status' => 'success', 'message' => 'Estoque não controlado.'];
            }

            $modelToUpdate = $variacaoId ? ProdutoVariacao::lockForUpdate()->findOrFail($variacaoId) : $produto;

            if ($modelToUpdate->quantidade_encomendada > 0) {
                if ($modelToUpdate->quantidade_encomendada >= $quantidade) {
                    // Cobre totalmente usando o montante de encomendas
                    $modelToUpdate->quantidade_encomendada -= $quantidade;
                } else {
                    // Sobra devolução além das encomendas (vai pro físico)
                    $sobraFisico = $quantidade - $modelToUpdate->quantidade_encomendada;
                    $modelToUpdate->quantidade_encomendada = 0;
                    
                    if ($variacaoId) {
                        $modelToUpdate->estoque += $sobraFisico;
                    } else {
                        $modelToUpdate->quantidade_estoque += $sobraFisico;
                    }
                }
            } else {
                // Sem encomendas, tudo vai pro físico
                if ($variacaoId) {
                    $modelToUpdate->estoque += $quantidade;
                } else {
                    $modelToUpdate->quantidade_estoque += $quantidade;
                }
            }

            $modelToUpdate->save();
            return ['status' => 'success', 'message' => 'Estoque / Encomendas restituídas com sucesso.'];
        });
    }
}
