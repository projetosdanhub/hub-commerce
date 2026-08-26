<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NavigationMenu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Services\CacheFallbackService;

class NavigationMenuController extends Controller
{
    // Retorna o Menu ordenado para a tela
    public function index()
    {
        $menus = CacheFallbackService::remember('admin_navigation_menu', 60 * 24, function () {
            return NavigationMenu::orderBy('ordem', 'asc')->get();
        });
        
        return response()->json(['status' => 'success', 'data' => $menus]);
    }

    public function sync(Request $request)
    {
        $request->validate([
            'items.*.banner_file' => 'nullable|file|mimes:jpeg,png,webp|max:4096',
        ], [
            'items.*.banner_file.max' => 'A imagem do menu não pode ultrapassar 4MB.',
            'items.*.banner_file.mimes' => 'A imagem do menu deve ser JPG, PNG ou WEBP.',
        ]);

        $itemsInput = $request->input('items', []);
        $items = is_string($itemsInput) ? json_decode($itemsInput, true) : $itemsInput;
        $idsMantidos = [];

        foreach ($items as $index => $item) {
            // O React gera IDs como 17293819283 (Date.now) para links novos não salvos.
            // Se o ID for menor que 1 bilhão, sabemos que é um ID real do MySQL.
            $menuId = (isset($item['id']) && $item['id'] < 1000000000) ? $item['id'] : null;
            
            $dados = [
                'nome' => $item['nome'],
                'link' => $item['link'] ?? null,
                'categoria_vinculada' => $item['categoria_vinculada'] ?? null,
                'depth' => (int) $item['depth'],
                'ordem' => $index, // A posição no array do React dita a ordem real
                'parent_id' => isset($item['parent_id']) && $item['parent_id'] !== '' ? $item['parent_id'] : null,
                'ativo' => isset($item['ativo']) ? filter_var($item['ativo'], FILTER_VALIDATE_BOOLEAN) : true,
            ];

            // Processa o Upload do Banner Promocional, se houver arquivo físico novo
            if ($request->hasFile("items.{$index}.banner_file")) {
                $path = $request->file("items.{$index}.banner_file")->store('menus', 'public');
                $dados['banner'] = asset('storage/' . $path);
            } else {
                $dados['banner'] = $item['banner'] ?? null;
            }

            if ($menuId) {
                $menu = NavigationMenu::find($menuId);
                if ($menu) {
                    $menu->update($dados);
                    $idsMantidos[] = $menu->id;
                }
            } else {
                $novoMenu = NavigationMenu::create($dados);
                $idsMantidos[] = $novoMenu->id;
            }
        }

        // Deleta do Banco de Dados os links que o Lojista removeu na tela
        $menusParaDeletar = NavigationMenu::whereNotIn('id', $idsMantidos)->get();
        foreach ($menusParaDeletar as $menuDel) {
            if ($menuDel->banner) {
                $caminhoRelativo = str_replace(asset('storage/') . '/', '', $menuDel->banner);
                Storage::disk('public')->delete($caminhoRelativo);
            }
            $menuDel->delete();
        }

        CacheFallbackService::forget('admin_navigation_menu');
        CacheFallbackService::forget('storefront_navigation_menu_active');

        return response()->json(['status' => 'success', 'message' => 'Mega Menu sincronizado com sucesso!']);
    }
}