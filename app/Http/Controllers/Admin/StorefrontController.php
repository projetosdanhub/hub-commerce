<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ProductStatus;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\StorefrontConfig;
use App\Models\NavigationMenu;
use App\Models\Categoria;
use App\Models\Produto;
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
                ['id' => 'fb-1', 'type' => 'BannerPrincipal', 'isVisible' => true, 'props' => ['titulo' => 'Grande Promoção']],
                ['id' => 'fb-2', 'type' => 'GradeCategorias', 'isVisible' => true, 'props' => ['titulo' => 'Departamentos']],
                ['id' => 'fb-3', 'type' => 'BannersPromocionais', 'isVisible' => true, 'props' => ['quantidade' => 2]],
            ];
            return response()->json(['status' => 'success', 'data' => $defaultLayout, 'active_menu_id' => null]);
        }

        return response()->json([
            'status' => 'success', 
            'data' => $config->layout_blocks,
            'active_menu_id' => $config->active_menu_id
        ]);
    }

    // Retorna o menu sincronizado para a loja pública (Apenas itens ativos)
    public function getMenu()
    {
        $config = StorefrontConfig::first();
        $activeMenuId = $config ? $config->active_menu_id : null;

        if (!$activeMenuId) {
            return response()->json(['status' => 'success', 'data' => []]);
        }

        $menus = CacheFallbackService::remember('storefront_navigation_menu_active_' . $activeMenuId, 60 * 24, function () use ($activeMenuId) {
            // Busca todos ordenados e só os ativos deste menu config
            $all = NavigationMenu::where('menu_config_id', $activeMenuId)
                ->where('ativo', true)
                ->orderBy('ordem', 'asc')
                ->get();
            
            // Filtra os filhos que têm pai inativo.
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

    // Retorna categorias ativas para a loja
    public function getCategories()
    {
        $categories = CacheFallbackService::remember('storefront_categories_active', 60 * 24, function () {
            return Categoria::query()
                ->where('ativo', true)
                ->where('status', Categoria::STATUS_ATIVO)
                ->orderBy('nome')
                ->get(['id', 'nome', 'slug', 'img']);
        });

        return response()->json(['status' => 'success', 'data' => $categories]);
    }

    // Retorna produtos para a loja (com paginação e filtros)
    public function getProducts(Request $request)
    {
        $query = Produto::query()
            ->with(['categoria', 'variacoes'])
            ->where('ativo', true)
            ->where('status_vitrine', ProductStatus::ACTIVE->value)
            ->where(function ($availability): void {
                $availability
                    ->where('controlar_estoque', false)
                    ->orWhere('quantidade_estoque', '>', 0)
                    ->orWhere('pre_venda', true);
            });

        if ($request->filled('category_id')) {
            $query->where('categoria_id', $request->integer('category_id'));
        }

        if ($request->boolean('is_featured')) {
            $query->where('destaque', true);
        }

        $searchTerm = trim((string) $request->query('q', ''));

        if ($searchTerm !== '') {
            $query->where('nome', 'like', '%' . $searchTerm . '%');
        }

        $products = $query->orderByDesc('created_at')->paginate(12);

        return response()->json(['status' => 'success', 'data' => $products]);
    }

    // Retorna um produto detalhado por ID ou slug
    public function getProduct($id)
    {
        $product = Produto::query()
            ->with(['categoria', 'variacoes'])
            ->where('ativo', true)
            ->where('status_vitrine', ProductStatus::ACTIVE->value)
            ->where(function ($query) use ($id): void {
                $query->where('id', $id)->orWhere('slug', $id);
            })
            ->first();

        if (! $product) {
            return response()->json(['status' => 'error', 'code' => 'REQUEST_FAILED', 'message' => 'Produto não encontrado'], 404);
        }

        return response()->json(['status' => 'success', 'data' => $product]);
    }

    // Salva a nova configuração da vitrine
    public function publishVitrine(Request $request)
    {
        $request->validate([
            'layout_blocks' => 'required|array',
            'active_menu_id' => 'nullable|exists:menu_configs,id'
        ]);

        $config = StorefrontConfig::firstOrCreate([]);
        $config->layout_blocks = $request->layout_blocks;
        
        if ($request->has('active_menu_id')) {
            $config->active_menu_id = $request->active_menu_id;
            CacheFallbackService::forget('storefront_navigation_menu_active_' . $request->active_menu_id);
        }
        
        $config->save();

        return response()->json([
            'status' => 'success', 
            'message' => 'Vitrine publicada com sucesso! A loja já está atualizada.'
        ]);
    }

}
