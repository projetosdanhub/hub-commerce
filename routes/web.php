<?php

use Illuminate\Support\Facades\Route;

// Essa rota diz ao Laravel: "Qualquer página que o usuário tentar acessar, 
// mande para a nossa view 'app', pois o React vai cuidar da navegação!"
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '.*');