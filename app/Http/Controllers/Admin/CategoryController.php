<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use App\Services\CacheFallbackService;

class CategoryController extends Controller
{
    public function index()
    {
        $categorias = CacheFallbackService::remember('admin_categorias_all', 60 * 24, function () {
            // 🟢 Inteligência: Já busca as categorias contando quantos produtos existem dentro de cada uma!
            return Categoria::withCount('produtos as qtd_produtos')->orderBy('id', 'desc')->get();
        });

        return response()->json(['status' => 'success', 'data' => $categorias]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nome' => 'required|string',
            'img' => 'nullable|file|mimes:jpeg,png,webp|max:4096',
        ], [
            'img.max' => 'A imagem não pode ultrapassar 4MB.',
            'img.mimes' => 'A imagem deve ser JPG, PNG ou WEBP.',
        ]);

        $dados = $request->only(['nome', 'status', 'descricao']);
        $dados['slug'] = Str::slug($request->nome); // Gera a URL amigável

        $categoria = Categoria::find($request->id);

        // 🟢 Motor de Upload Físico (Salva a imagem no disco do servidor)
        if ($request->hasFile('img')) {
            // Se já tiver uma imagem antiga, deleta para não acumular lixo no servidor
            if ($categoria && $categoria->img) {
                $caminhoRelativo = str_replace(asset('storage/') . '/', '', $categoria->img);
                Storage::disk('public')->delete($caminhoRelativo);
            }
            // Salva a nova imagem e guarda o link público
            $path = $request->file('img')->store('categorias', 'public');
            $dados['img'] = asset('storage/' . $path);
        }

        $categoria = Categoria::updateOrCreate(
            ['id' => $request->id],
            $dados
        );

        // Puxa a contagem de produtos para devolver ao React atualizado
        $categoria->qtd_produtos = $categoria->produtos()->count();

        CacheFallbackService::forget('admin_categorias_all');

        return response()->json(['status' => 'success', 'data' => $categoria]);
    }

    public function destroy($id)
    {
        $categoria = Categoria::findOrFail($id);
        
        // Se a categoria tiver imagem, apaga do disco antes de deletar do banco
        if ($categoria->img) {
            $caminhoRelativo = str_replace(asset('storage/') . '/', '', $categoria->img);
            Storage::disk('public')->delete($caminhoRelativo);
        }
        
        $categoria->delete();

        CacheFallbackService::forget('admin_categorias_all');

        return response()->json(['status' => 'success']);
    }
}