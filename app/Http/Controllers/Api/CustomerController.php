<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CustomerController extends Controller
{
    /**
     * Retorna os dados do perfil do cliente autenticado na loja virtual.
     */
    public function profile(Request $request)
    {
        $user = $request->user();
        
        // Retorna o usuário logado com seus endereços e histórico de compras básico
        $user->load(['addresses', 'orders' => function($query) {
            $query->orderBy('created_at', 'desc')->take(10);
        }]);

        return response()->json([
            'status' => 'success',
            'data' => $user
        ]);
    }
}