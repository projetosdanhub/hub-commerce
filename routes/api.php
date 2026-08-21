<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Importando os Controllers
use App\Http\Controllers\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Api\CustomerController as ApiCustomerController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\CarrierController; // 🟢 NOVO: Importação do Controller de Transportadoras

use App\Http\Controllers\Admin\MelhorEnvioController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// ==========================================
// ROTAS DE LOGIN (PÚBLICAS) E VALIDAÇÃO DE E-MAIL
// ==========================================
Route::post('/admin/login', [AuthController::class, 'login']);

// 🟢 Rota pública acionada quando o cliente clica no link do E-mail (Validar E-mail)
Route::get('/clientes/confirmar-email', [AdminCustomerController::class, 'confirmEmailUpdate']);

// Redefinição de Senha via Link
Route::get('/clientes/redefinir-senha', [AdminCustomerController::class, 'showPasswordResetForm']);
Route::post('/clientes/processar-senha', [AdminCustomerController::class, 'processPasswordReset']);

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
        
        // ⚠️ IMPORTANTE: Rotas estáticas precisam vir ANTES das rotas com {id}
        Route::get('/metrics', [AdminCustomerController::class, 'getDashboardMetrics']);
        
        // Níveis VIP
        Route::get('/vip-levels', [AdminCustomerController::class, 'getVipLevels']);
        Route::post('/vip-levels', [AdminCustomerController::class, 'storeOrUpdateVipLevel']);
        Route::delete('/vip-levels/{id}', [AdminCustomerController::class, 'deleteVipLevel']);

        // Configurações
        Route::get('/settings', [AdminCustomerController::class, 'getSettings']);
        Route::put('/settings', [AdminCustomerController::class, 'updateSettings']);

        // ----------------------------------------------------
        // AÇÕES DE PERFIL DE CLIENTE (Usam o parâmetro {id})
        // ----------------------------------------------------
        Route::get('/{id}', [AdminCustomerController::class, 'show']);
        
        // 🟢 Edições Básicas
        Route::put('/{id}/basics', [AdminCustomerController::class, 'updateBasics']);
        Route::put('/{id}/phone', [AdminCustomerController::class, 'updatePhone']);
        Route::post('/{id}/sensitive-data', [AdminCustomerController::class, 'updateSensitiveData']);
        Route::put('/{id}/notes', [AdminCustomerController::class, 'updateNotes']);
        Route::put('/{id}/tags', [AdminCustomerController::class, 'syncTags']);
        Route::post('/{id}/status', [AdminCustomerController::class, 'toggleSuspension']);
        Route::post('/{id}/wallet-transaction', [AdminCustomerController::class, 'addWalletTransaction']);
        
        // 🟢 E-mail e Senha (Segurança)
        Route::post('/{id}/email-link', [AdminCustomerController::class, 'sendEmailUpdateLink']);
        Route::put('/{id}/force-email', [AdminCustomerController::class, 'forceEmailUpdate']);
        Route::post('/{id}/generate-temp-password', [AdminCustomerController::class, 'generateTempPassword']);
        Route::post('/{id}/password-link', [AdminCustomerController::class, 'sendPasswordResetLink']);
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
        Route::post('/{id}/cancel', [OrderController::class, 'cancelOrder']);
        
        // 🟢 Fluxo Manual de Atualização com Comprovantes e Transportadoras
        Route::post('/{id}/status-manual', [OrderController::class, 'updateStatusManual']);
    });

    // --- MÓDULO: TRANSPORTADORAS ---
    Route::prefix('carriers')->group(function () {
        Route::get('/', [CarrierController::class, 'index']);
        Route::post('/', [CarrierController::class, 'store']); // Salva e Edita (processando Logomarca)
        Route::delete('/{id}', [CarrierController::class, 'destroy']);
    });

    // --- MÓDULO: MELHOR ENVIO (Configurações API) ---
    Route::prefix('melhorenvio')->group(function () {
        Route::get('/settings', [MelhorEnvioController::class, 'getSettings']);
        Route::post('/settings', [MelhorEnvioController::class, 'saveCredentials']);
        Route::get('/auth-url', [MelhorEnvioController::class, 'getAuthUrl']);
        Route::post('/disconnect', [MelhorEnvioController::class, 'disconnect']);
    });
});