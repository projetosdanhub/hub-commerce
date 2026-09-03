<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ProductStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveProductRequest;
use App\Http\Resources\Admin\AdminProductResource;
use Illuminate\Http\Request;
use App\Models\Produto;
use App\Models\ProdutoAuditoria;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class AdminProductController extends Controller
{
    public function index()
    {
        $produtos = Produto::query()
            ->with(['categoria', 'variacoes'])
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => AdminProductResource::collection($produtos),
        ]);
    }

    public function store(SaveProductRequest $request)
    {
        $dados = $request->productData();
        $status = $request->enum('status_vitrine', ProductStatus::class);

        $dados['status_vitrine'] = $status->value;
        $dados['ativo'] = $status->isVisibleInStorefront();
        $dados['descricao'] = $dados['descricao'] ?? '';

        // Geração automática do Slug para SEO
        if (empty($dados['slug'])) {
            $dados['slug'] = Str::slug($dados['nome']);
        }

        $produto = $request->filled('id')
            ? Produto::query()->findOrFail($request->integer('id'))
            : null;

        $original = $produto ? [
            'preco' => (string) $produto->preco,
            'quantidade_estoque' => (int) $produto->quantidade_estoque,
            'status_vitrine' => $produto->status_vitrine instanceof ProductStatus
                ? $produto->status_vitrine->value
                : (string) $produto->status_vitrine,
        ] : [];
        
        // Upload da Imagem Principal
        if ($request->hasFile('img')) {
            if ($produto && $produto->img) {
                $caminhoRelativo = str_replace('/storage/', '', $produto->img);
                Storage::disk('public')->delete($caminhoRelativo);
            }
            $path = $request->file('img')->store('produtos', 'public');
            $dados['img'] = '/storage/' . $path;
        }

        // Upload do Vídeo
        if ($request->hasFile('video')) {
            if ($produto && $produto->video) {
                $caminhoRelativo = str_replace('/storage/', '', $produto->video);
                Storage::disk('public')->delete($caminhoRelativo);
            }
            $path = $request->file('video')->store('produtos/videos', 'public');
            $dados['video'] = '/storage/' . $path;
        }

        // Upload da Galeria (Máx 10)
        $galeriaFinal = $request->input('galeria_urls', []);
        if ($request->hasFile('galeria')) {
            $files = $request->file('galeria');
            foreach ($files as $file) {
                if (count($galeriaFinal) >= 10) break;
                $path = $file->store('produtos/galeria', 'public');
                $galeriaFinal[] = '/storage/' . $path;
            }
        }
        $dados['galeria'] = $galeriaFinal;

        if ($produto) {
            $produto->update($dados);
            $acao = 'Atualização';
            $detalhes = [];

            if ($original['preco'] !== (string) $produto->preco) {
                $detalhes[] = "Preço alterado para R$ " . number_format((float) $produto->preco, 2, ',', '.');
            }

            if ($original['quantidade_estoque'] !== (int) $produto->quantidade_estoque) {
                $detalhes[] = "Estoque alterado para " . $produto->quantidade_estoque;
            }

            if ($original['status_vitrine'] !== $status->value) {
                $detalhes[] = "Status alterado para " . $status->value;
            }

            $detalhesStr = empty($detalhes) ? 'Produto atualizado.' : implode(' | ', $detalhes);
        } else {
            $produto = Produto::create($dados);
            $acao = 'Criação';
            $detalhesStr = 'Produto criado no sistema.';
        }

        // Salvar Auditoria
        ProdutoAuditoria::create([
            'produto_id' => $produto->id,
            'admin_id' => $request->user() ? $request->user()->id : null,
            'acao' => $acao,
            'entidade' => $produto->nome . ' (' . ($produto->sku_ref ?? 'S/SKU') . ')',
            'detalhes' => $detalhesStr,
        ]);

        // Sincronização de Variações
        if ($request->filled('variaveis_json')) {
            $variaveis = json_decode($request->variaveis_json, true);
            if (is_array($variaveis)) {
                $idsAtuais = [];
                foreach ($variaveis as $idx => $varData) {
                    $varId = $varData['id'] ?? null;
                    
                    $varUpdateData = [
                        'produto_id' => $produto->id,
                        'tipo' => $varData['tipo'] ?? '',
                        'nome' => $varData['nome'] ?? '',
                        'estoque' => $varData['estoque'] ?? 0,
                        'sku' => $varData['sku'] ?? '',
                    ];

                    $fileKey = "variaveis_img_{$idx}";
                    if ($request->hasFile($fileKey)) {
                        $path = $request->file($fileKey)->store('produtos/variacoes', 'public');
                        $varUpdateData['img'] = '/storage/' . $path;
                    } elseif (!empty($varData['img'])) {
                         $varUpdateData['img'] = $varData['img'];
                    } else {
                         $varUpdateData['img'] = null;
                    }

                    if ($varId && is_numeric($varId) && $produto->variacoes()->where('id', $varId)->exists()) {
                        $variacao = $produto->variacoes()->find($varId);
                        $variacao->update($varUpdateData);
                        $idsAtuais[] = $variacao->id;
                    } else {
                        $variacao = $produto->variacoes()->create($varUpdateData);
                        $idsAtuais[] = $variacao->id;
                    }
                }
                
                // Remover variações que não foram enviadas (Exclusão por omissão)
                $produto->variacoes()->whereNotIn('id', $idsAtuais)->delete();
            }
        }

        $produto->load(['categoria', 'variacoes']);

        return response()->json([
            'status' => 'success',
            'message' => 'Produto salvo com sucesso no Hub!',
            'data' => new AdminProductResource($produto),
        ]);
    }

    public function destroy($id)
    {
        $produto = Produto::findOrFail($id);
        // Em um sistema real com histórico de vendas, fazemos um Soft Delete (Inativar)
        $produto->update([
            'status_vitrine' => ProductStatus::INACTIVE->value,
            'ativo' => false,
            'quantidade_estoque' => 0,
        ]);
        
        // Salvar Auditoria
        ProdutoAuditoria::create([
            'produto_id' => $produto->id,
            'admin_id' => request()->user() ? request()->user()->id : null,
            'acao' => 'Exclusão',
            'entidade' => $produto->nome . ' (' . ($produto->sku_ref ?? 'S/SKU') . ')',
            'detalhes' => 'Produto inativado (soft delete) e estoque zerado.',
        ]);
        
        return response()->json(['status' => 'success', 'message' => 'Produto inativado e estoque zerado.']);
    }

    public function validateSkus(Request $request)
    {
        $request->validate([
            'skus' => 'required|array',
            'ignore_product_id' => 'nullable|integer',
        ]);

        $skus = $request->input('skus');
        $ignoreId = $request->input('ignore_product_id');

        $duplicados = [];

        foreach ($skus as $sku) {
            if (empty($sku)) continue;

            // Verificar na tabela de produtos
            $existsProduto = Produto::whereRaw("CONCAT(sku_ref, '-', sku_sufixo) = ?", [$sku])
                ->when($ignoreId, function($q) use ($ignoreId) {
                    return $q->where('id', '!=', $ignoreId);
                })->exists();

            if ($existsProduto) {
                $duplicados[] = $sku;
                continue;
            }
            
            // Verificar na tabela de variações
            $existsVariacao = \App\Models\ProdutoVariacao::where('sku', $sku)
                ->when($ignoreId, function($q) use ($ignoreId) {
                    return $q->where('produto_id', '!=', $ignoreId);
                })->exists();

            if ($existsVariacao) {
                $duplicados[] = $sku;
            }
        }

        return response()->json([
            'status' => 'success',
            'duplicados' => array_values(array_unique($duplicados))
        ]);
    }

    public function getAudits()
    {
        $logs = ProdutoAuditoria::with('admin:id,name,role')
                    ->orderBy('created_at', 'desc')
                    ->limit(200)
                    ->get();
        
        return response()->json(['status' => 'success', 'data' => $logs]);
    }
}