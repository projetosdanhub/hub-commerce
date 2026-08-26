<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MenuConfig;
use App\Models\NavigationMenu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Services\CacheFallbackService;

class NavigationMenuController extends Controller
{
    // GET /api/admin/menu
    public function getConfigs()
    {
        $configs = MenuConfig::orderBy('created_at', 'desc')->get();
        return response()->json(['status' => 'success', 'data' => $configs]);
    }

    // POST /api/admin/menu
    public function storeConfig(Request $request)
    {
        $request->validate(['nome' => 'required|string|max:255']);
        $config = MenuConfig::create(['nome' => $request->nome]);
        return response()->json(['status' => 'success', 'data' => $config, 'message' => 'Menu criado com sucesso.']);
    }

    // PUT /api/admin/menu/{id}
    public function updateConfig(Request $request, $id)
    {
        $request->validate(['nome' => 'required|string|max:255']);
        $config = MenuConfig::findOrFail($id);
        $config->update(['nome' => $request->nome]);
        return response()->json(['status' => 'success', 'message' => 'Menu renomeado com sucesso.']);
    }

    // DELETE /api/admin/menu/{id}
    public function destroyConfig($id)
    {
        $config = MenuConfig::findOrFail($id);
        
        // Remove imagens de banner associadas aos itens desse menu
        foreach ($config->items as $item) {
            if ($item->banner) {
                $caminhoRelativo = str_replace(asset('storage/') . '/', '', $item->banner);
                Storage::disk('public')->delete($caminhoRelativo);
            }
        }
        
        $config->delete(); // Cascade cuidará de deletar os items no DB, mas removemos as imgs acima
        CacheFallbackService::forget('storefront_navigation_menu_active');
        
        return response()->json(['status' => 'success', 'message' => 'Menu removido com sucesso.']);
    }

    // GET /api/admin/menu/{id}/items
    public function getItems($id)
    {
        $config = MenuConfig::findOrFail($id);
        $items = $config->items()->orderBy('ordem', 'asc')->get();
        return response()->json(['status' => 'success', 'data' => $items]);
    }

    // POST /api/admin/menu/{id}/sync
    public function syncItems(Request $request, $id)
    {
        $config = MenuConfig::findOrFail($id);

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
            $menuId = (isset($item['id']) && $item['id'] < 1000000000) ? $item['id'] : null;
            
            $dados = [
                'menu_config_id' => $config->id,
                'nome' => $item['nome'],
                'link' => $item['link'] ?? null,
                'categoria_vinculada' => $item['categoria_vinculada'] ?? null,
                'depth' => (int) $item['depth'],
                'ordem' => $index,
                'parent_id' => isset($item['parent_id']) && $item['parent_id'] !== '' ? $item['parent_id'] : null,
                'ativo' => isset($item['ativo']) ? filter_var($item['ativo'], FILTER_VALIDATE_BOOLEAN) : true,
            ];

            if ($request->hasFile("items.{$index}.banner_file")) {
                $path = $request->file("items.{$index}.banner_file")->store('menus', 'public');
                $dados['banner'] = asset('storage/' . $path);
            } else {
                $dados['banner'] = $item['banner'] ?? null;
            }

            if ($menuId) {
                $menu = NavigationMenu::where('id', $menuId)->where('menu_config_id', $config->id)->first();
                if ($menu) {
                    $menu->update($dados);
                    $idsMantidos[] = $menu->id;
                }
            } else {
                $novoMenu = NavigationMenu::create($dados);
                $idsMantidos[] = $novoMenu->id;
            }
        }

        // Deleta os links que foram removidos
        $menusParaDeletar = NavigationMenu::where('menu_config_id', $config->id)->whereNotIn('id', $idsMantidos)->get();
        foreach ($menusParaDeletar as $menuDel) {
            if ($menuDel->banner) {
                $caminhoRelativo = str_replace(asset('storage/') . '/', '', $menuDel->banner);
                Storage::disk('public')->delete($caminhoRelativo);
            }
            $menuDel->delete();
        }

        CacheFallbackService::forget('storefront_navigation_menu_active');

        return response()->json(['status' => 'success', 'message' => 'Itens do menu sincronizados com sucesso!']);
    }
}