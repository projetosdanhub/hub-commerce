<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Produto;
use App\Models\ProdutoAuditoria;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class AdminProductController extends Controller
{
    public function index()
    {
        $produtos = Produto::with(['categoria', 'variacoes'])->orderBy('id', 'desc')->get();
        
        $produtos->transform(function ($produto) {
            $produto->img = $produto->img ? asset($produto->img) : null;
            $produto->video = $produto->video ? asset($produto->video) : null;
            if ($produto->galeria && is_array($produto->galeria)) {
                $produto->galeria = array_map(function($g) { return asset($g); }, $produto->galeria);
            }
            if ($produto->variacoes) {
                $produto->variacoes->transform(function ($var) {
                    $var->img = $var->img ? asset($var->img) : null;
                    return $var;
                });
            }
            return $produto;
        });

        return response()->json(['status' => 'success', 'data' => $produtos]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nome' => 'required|string|max:255',
            'preco' => 'required|numeric',
            'img' => 'nullable|file|mimes:jpeg,png,webp|max:4096',
            'video' => 'nullable|file|mimes:mp4|max:12288',
            'galeria.*' => 'nullable|file|mimes:jpeg,png,webp|max:4096',
            'variaveis_json' => 'nullable|string',
        ], [
            'img.max' => 'A imagem principal não pode ultrapassar 4MB.',
            'img.mimes' => 'A imagem principal deve ser JPG, PNG ou WEBP.',
            'video.max' => 'O vídeo não pode ultrapassar 12MB.',
            'video.mimes' => 'O vídeo deve ser no formato MP4.',
            'galeria.*.max' => 'As imagens da galeria não podem ultrapassar 4MB.',
            'galeria.*.mimes' => 'As imagens da galeria devem ser JPG, PNG ou WEBP.',
        ]);

        $dados = $request->except(['img', 'galeria', 'video', 'variacoes', 'variaveis_json', 'galeria_urls', 'isNovo', 'cst', 'cfop', 'unidade', 'icmsPerc', 'ipiPerc', 'comp']);
        
        // Mapeamento de campos fiscais e logística
        if ($request->has('cst')) $dados['csosn'] = $request->cst;
        if ($request->has('cfop')) $dados['cfop_dentro'] = $request->cfop;
        if ($request->has('unidade')) $dados['unidade_medida'] = $request->unidade;
        if ($request->has('icmsPerc')) $dados['icms_perc'] = $request->icmsPerc;
        if ($request->has('ipiPerc')) $dados['ipi_perc'] = $request->ipiPerc;
        if ($request->has('comp')) $dados['comprimento'] = $request->comp;

        // Geração automática do Slug para SEO
        if (empty($dados['slug'])) {
            $dados['slug'] = Str::slug($dados['nome']);
        }

        $produto = Produto::find($request->id);
        
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
            if (isset($dados['preco']) && $dados['preco'] != $produto->preco) {
                $detalhes[] = "Preço alterado para R$ " . number_format($dados['preco'], 2, ',', '.');
            }
            if (isset($dados['estoque']) && $dados['estoque'] != $produto->estoque) {
                $detalhes[] = "Estoque alterado para " . $dados['estoque'];
            }
            if (isset($dados['status_vitrine']) && $dados['status_vitrine'] != $produto->status_vitrine) {
                $detalhes[] = "Status alterado para " . $dados['status_vitrine'];
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

        $produto->load('variacoes');
        $produto->img = $produto->img ? asset($produto->img) : null;
        $produto->video = $produto->video ? asset($produto->video) : null;
        if ($produto->galeria && is_array($produto->galeria)) {
            $produto->galeria = array_map(function($g) { return asset($g); }, $produto->galeria);
        }
        if ($produto->variacoes) {
            $produto->variacoes->transform(function ($var) {
                $var->img = $var->img ? asset($var->img) : null;
                return $var;
            });
        }

        return response()->json([
            'status' => 'success', 
            'message' => 'Produto salvo com sucesso no Hub!',
            'data' => $produto
        ]);
    }

    public function destroy($id)
    {
        $produto = Produto::findOrFail($id);
        // Em um sistema real com histórico de vendas, fazemos um Soft Delete (Inativar)
        $produto->update(['status_vitrine' => 'INATIVO', 'estoque' => 0]);
        
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