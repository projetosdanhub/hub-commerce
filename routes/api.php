<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Importando os Controllers
use App\Http\Controllers\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Api\CustomerController as ApiCustomerController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\OrderController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// ==========================================
// ROTA DE LOGIN (PÚBLICA)
// ==========================================
Route::post('/admin/login', [AuthController::class, 'login']);

// ==========================================
// ROTAS DO FRONT-END (VITRINE / REACT)
// ==========================================
Route::get('/customers', [ApiCustomerController::class, 'index']);

// ==========================================
// ROTAS DO HUB COMMERCE: ADMIN (PROTEGIDAS)
// ==========================================
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    
    // --- MÓDULO: CRM DE CLIENTES ---
    Route::prefix('customers')->group(function () {
        Route::get('/', [AdminCustomerController::class, 'index']);
        Route::get('/metrics', [AdminCustomerController::class, 'getDashboardMetrics']);
        
        // Níveis VIP
        Route::get('/vip-levels', [AdminCustomerController::class, 'getVipLevels']);
        Route::post('/vip-levels', [AdminCustomerController::class, 'storeOrUpdateVipLevel']);
        Route::delete('/vip-levels/{id}', [AdminCustomerController::class, 'deleteVipLevel']);

        // Configurações
        Route::get('/settings', [AdminCustomerController::class, 'getSettings']);
        Route::put('/settings', [AdminCustomerController::class, 'updateSettings']);

        // Ações de Perfil de Cliente
        Route::get('/{id}', [AdminCustomerController::class, 'show']);
        Route::put('/{id}/phone', [AdminCustomerController::class, 'updatePhone']);
        Route::put('/{id}/email', [AdminCustomerController::class, 'updateEmail']);
        Route::post('/{id}/sensitive-data', [AdminCustomerController::class, 'updateSensitiveData']);
        Route::put('/{id}/notes', [AdminCustomerController::class, 'updateNotes']);
        Route::put('/{id}/tags', [AdminCustomerController::class, 'syncTags']);
        Route::post('/{id}/suspend', [AdminCustomerController::class, 'toggleSuspension']);
        Route::post('/{id}/generate-temp-password', [AdminCustomerController::class, 'generateTempPassword']);
        Route::post('/{id}/wallet-transaction', [AdminCustomerController::class, 'addWalletTransaction']);
    });

    // --- MÓDULO: CATEGORIAS ---
    Route::prefix('categories')->group(function () {
        Route::get('/', [CategoryController::class, 'index']);
        Route::post('/', [CategoryController::class, 'store']);
        Route::delete('/{id}', [CategoryController::class, 'destroy']);
    });

    // --- MÓDULO: PEDIDOS ---
    Route::prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::put('/{id}/status', [OrderController::class, 'updateStatus']);
        Route::post('/{id}/dispatch', [OrderController::class, 'dispatchOrder']);
        
        // Rota de Cancelamento e Reembolso (Usa POST para suportar upload de comprovante)
        Route::post('/{id}/cancel', [OrderController::class, 'cancelOrder']);
    });
});