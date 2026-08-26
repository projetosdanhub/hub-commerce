<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\StorefrontConfig;
use App\Models\NavigationMenu;
use App\Services\CacheFallbackService;

class StorefrontController extends Controller
{
    // Retorna a vitrine atual
    public function getVitrine()
    {
        $config = StorefrontConfig::first();
        
        if (!$config) {
            // Layout padrão inicial caso a loja seja nova
            $defaultLayout = [
                ['id' => 'hero-1', 'type' => 'HeroBanner', 'isVisible' => true, 'props' => ['titulo' => 'Grande Promoção']],
                ['id' => 'cat-1', 'type' => 'CategoryGrid', 'isVisible' => true, 'props' => ['titulo' => 'Departamentos']],
                ['id' => 'promo-1', 'type' => 'PromoBanners', 'isVisible' => true, 'props' => ['quantidade' => 2]],
            ];
            return response()->json(['status' => 'success', 'data' => $defaultLayout]);
        }

        return response()->json(['status' => 'success', 'data' => $config->layout_blocks]);
    }

    // Retorna o menu sincronizado para a loja pública (Apenas itens ativos)
    public function getMenu()
    {
        $menus = CacheFallbackService::remember('storefront_navigation_menu_active', 60 * 24, function () {
            // Busca todos ordenados e só os ativos
            $all = NavigationMenu::where('ativo', true)->orderBy('ordem', 'asc')->get();
            
            // Mas precisamos filtrar os filhos que têm pai inativo. 
            // O where('ativo', true) tira os pais inativos, mas se o filho estiver ativo e o pai não (teoricamente possível se a flag for por item),
            // o ideal é só retornar quem tem parent_id nulo ou cujo parent_id está na lista de ativos.
            $activeIds = $all->pluck('id')->toArray();
            
            return $all->filter(function($item) use ($activeIds) {
                if ($item->parent_id) {
                    return in_array($item->parent_id, $activeIds);
                }
                return true;
            })->values();
        });

        return response()->json(['status' => 'success', 'data' => $menus]);
    }

    // Salva a nova configuração da vitrine
    public function publishVitrine(Request $request)
    {
        $request->validate([
            'layout_blocks' => 'required|array'
        ]);

        $config = StorefrontConfig::firstOrCreate(['id' => 1]);
        $config->layout_blocks = $request->layout_blocks;
        $config->save();

        return response()->json([
            'status' => 'success', 
            'message' => 'Vitrine publicada com sucesso! A loja já está atualizada.'
        ]);
    }
}