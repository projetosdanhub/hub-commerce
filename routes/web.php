<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\MelhorEnvioController;

// =========================================================================
// ROTAS DE CALLBACK & INTEGRAÇÕES (Obrigatório vir ANTES da rota React)
// =========================================================================

// Rota de Retorno (Callback) do OAuth2 do Melhor Envio
Route::get('/admin/melhorenvio/callback', [MelhorEnvioController::class, 'callback']);


// =========================================================================
// ROTA CATCH-ALL DO REACT (Deixe sempre no final do arquivo)
// =========================================================================

// Essa rota diz ao Laravel: "Qualquer página que o usuário tentar acessar, 
// mande para a nossa view 'app', pois o React vai cuidar da navegação visual."
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '.*');