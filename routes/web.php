<?php

use Illuminate\Support\Facades\Route;
// =========================================================================
// ROTA CATCH-ALL DO REACT (Deixe sempre no final do arquivo)
// =========================================================================

// Essa rota diz ao Laravel: "Qualquer página que o usuário tentar acessar, 
// mande para a nossa view 'app', pois o React vai cuidar da navegação visual."
// A SPA nunca deve capturar URLs de API inexistentes.
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '^(?!api(?:/|$)).*');