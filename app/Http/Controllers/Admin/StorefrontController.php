<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\StorefrontConfig;

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