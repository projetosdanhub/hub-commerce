<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Importando os Controllers
use App\Http\Controllers\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TrackingCollectorController; // 🟢 IMPORTAÇÃO ATUALIZADA
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\AdminProductController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\CarrierController; 
use App\Http\Controllers\Admin\ShippingPackageController;
use App\Http\Controllers\Admin\MelhorEnvioController;
use App\Http\Controllers\Admin\StorefrontController;
use App\Http\Controllers\Admin\TrackingController;
use App\Http\Controllers\Admin\NavigationMenuController;

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
Route::post('/admin/login', [AuthController::class, 'login'])->middleware('throttle:6,1');

// Rota pública acionada quando o cliente clica no link do E-mail (Validar E-mail)
Route::get('/clientes/confirmar-email', [AdminCustomerController::class, 'confirmEmailUpdate']);

// Redefinição de Senha via Link
Route::get('/clientes/redefinir-senha', [AdminCustomerController::class, 'showPasswordResetForm'])->middleware('throttle:10,1');
Route::post('/clientes/processar-senha', [AdminCustomerController::class, 'processPasswordReset'])->middleware('throttle:5,1');

// ==========================================
// ROTAS DO FRONT-END (VITRINE PÚBLICA / REACT)
// ==========================================
// 🟢 LEITURA PÚBLICA: O React carrega a vitrine e as configs do Pixel sem precisar de login
Route::get('/storefront', [StorefrontController::class, 'getVitrine']);
Route::get('/storefront/menu', [StorefrontController::class, 'getMenu']);
Route::get('/storefront/categories', [StorefrontController::class, 'getCategories']);
Route::get('/storefront/products', [StorefrontController::class, 'getProducts']);
Route::get('/storefront/products/{id}', [StorefrontController::class, 'getProduct']);
Route::post('/storefront/checkout', [StorefrontController::class, 'checkout'])->middleware('throttle:10,1');
Route::get('/tracking', [TrackingController::class, 'getPublicSettings'])->middleware('throttle:60,1');

// 🟢 INGESTÃO DE DADOS (DATA LAYER): Recebe os eventos de conversão da loja pública
Route::post('/tracking/collect', [TrackingCollectorController::class, 'collect'])->middleware('throttle:60,1');


// ==========================================
// ROTAS DO HUB COMMERCE: ADMIN (PROTEGIDAS)
// ==========================================
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // (A rota mock de /audit-logs foi removida, pois agora usamos /products/audits real)

    // --- MÓDULO: CRM DE CLIENTES ---
    Route::prefix('customers')->group(function () {
        Route::get('/', [AdminCustomerController::class, 'index']);
        
        // Rotas estáticas precisam vir ANTES das rotas com {id}
        Route::get('/metrics', [AdminCustomerController::class, 'getDashboardMetrics']);
        
        // Níveis VIP
        Route::get('/vip-levels', [AdminCustomerController::class, 'getVipLevels']);
        Route::post('/vip-levels', [AdminCustomerController::class, 'storeOrUpdateVipLevel']);
        Route::delete('/vip-levels/{id}', [AdminCustomerController::class, 'deleteVipLevel']);

        // Configurações
        Route::get('/settings', [AdminCustomerController::class, 'getSettings']);
        Route::put('/settings', [AdminCustomerController::class, 'updateSettings']);

        // AÇÕES DE PERFIL DE CLIENTE (Usam o parâmetro {id})
        Route::get('/{id}', [AdminCustomerController::class, 'show']);
        Route::put('/{id}/basics', [AdminCustomerController::class, 'updateBasics']);
        Route::put('/{id}/phone', [AdminCustomerController::class, 'updatePhone']);
        Route::post('/{id}/sensitive-data', [AdminCustomerController::class, 'updateSensitiveData']);
        Route::put('/{id}/notes', [AdminCustomerController::class, 'updateNotes']);
        Route::put('/{id}/tags', [AdminCustomerController::class, 'syncTags']);
        Route::post('/{id}/status', [AdminCustomerController::class, 'toggleSuspension']);
        Route::post('/{id}/wallet-transaction', [AdminCustomerController::class, 'addWalletTransaction']);
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
    // --- MÓDULO: MEGA MENU ---
    Route::prefix('menu')->group(function () {
        Route::get('/', [NavigationMenuController::class, 'getConfigs']);
        Route::post('/', [NavigationMenuController::class, 'storeConfig']);
        Route::put('/{id}', [NavigationMenuController::class, 'updateConfig']);
        Route::delete('/{id}', [NavigationMenuController::class, 'destroyConfig']);
        Route::get('/{id}/items', [NavigationMenuController::class, 'getItems']);
        Route::post('/{id}/sync', [NavigationMenuController::class, 'syncItems']);
    });
    // --- MÓDULO: PRODUTOS ---
    Route::prefix('products')->group(function () {
        Route::get('/audits', [AdminProductController::class, 'getAudits']);
        Route::get('/', [AdminProductController::class, 'index']);
        Route::post('/validate-skus', [AdminProductController::class, 'validateSkus']);
        Route::post('/', [AdminProductController::class, 'store']);
        Route::delete('/{id}', [AdminProductController::class, 'destroy']);
    });

    // --- MÓDULO: PEDIDOS ---
    Route::prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::put('/{id}/status', [OrderController::class, 'updateStatus']);
        Route::post('/{id}/dispatch', [OrderController::class, 'dispatchOrder']);
        Route::post('/{id}/cancel', [OrderController::class, 'cancelOrder']);
        
        // Fluxo Manual e Integração Melhor Envio
        Route::post('/{id}/status-manual', [OrderController::class, 'updateStatusManual']);
        // Rota Oficial de Emissão Fiscal e Documentos
        Route::get('/{id}/preview-doc', [OrderController::class, 'previewDoc']); 
        
        // Cancelar Etiqueta no Carrinho do Melhor Envio
        Route::post('/{id}/cancel-me-cart', [OrderController::class, 'cancelMelhorEnvioCart']);
    });
    

    // --- MÓDULO: TRANSPORTADORAS ---
    Route::prefix('carriers')->group(function () {
        Route::get('/audits', [CarrierController::class, 'getAudits']);
        Route::get('/', [CarrierController::class, 'index']);
        Route::post('/', [CarrierController::class, 'store']); 
        Route::post('/{id}/status', [CarrierController::class, 'updateStatus']);
        Route::delete('/{id}', [CarrierController::class, 'destroy']);
        
        Route::get('/{id}/orders', [CarrierController::class, 'getOrders']);
        Route::post('/orders/{orderId}/romaneio', [CarrierController::class, 'uploadRomaneio']);
    });

    // --- MÓDULO: EMBALAGENS PADRÃO ---
    Route::prefix('shipping-packages')->group(function () {
        Route::get('/', [ShippingPackageController::class, 'index']);
        Route::post('/', [ShippingPackageController::class, 'store']);
        Route::delete('/{id}', [ShippingPackageController::class, 'destroy']);
    });

    // --- MÓDULO: MELHOR ENVIO ---
    Route::prefix('melhorenvio')->group(function () {
        Route::get('/settings', [MelhorEnvioController::class, 'getSettings']);
        Route::post('/verify-token', [MelhorEnvioController::class, 'verifyToken']);
        Route::post('/carriers', [MelhorEnvioController::class, 'saveCarriers']);
        Route::post('/sender', [MelhorEnvioController::class, 'saveSender']);
        Route::post('/disconnect', [MelhorEnvioController::class, 'disconnect']);
        Route::post('/calculate', [MelhorEnvioController::class, 'calculate']); 
    });

    // --- MÓDULO: RASTREAMENTO & PIXELS (ÁREA DO PAINEL) ---
    Route::prefix('tracking')->group(function () {
        Route::get('/settings', [TrackingController::class, 'getSettings']);
        Route::post('/settings', [TrackingController::class, 'updateSettings']);
        
        Route::get('/dashboard', [TrackingController::class, 'getDashboardData']);
        
        Route::get('/triggers', [TrackingController::class, 'getTriggers']);
        Route::post('/triggers', [TrackingController::class, 'storeTrigger']);
        Route::delete('/triggers/{id}', [TrackingController::class, 'deleteTrigger']);
    });

    // --- MÓDULO: CONFIGURAÇÕES GERAIS (GATEWAYS E LOGÍSTICA) ---
    Route::prefix('settings')->group(function () {
        Route::get('/{group}', [\App\Http\Controllers\Admin\GlobalSettingsController::class, 'getGroup']);
        Route::post('/', [\App\Http\Controllers\Admin\GlobalSettingsController::class, 'setSetting']);
    });

    // --- MÓDULO: CONSTRUTOR DE VITRINE ---
    Route::post('/storefront/publish', [StorefrontController::class, 'publishVitrine']);
});

// URLs de curta duracao. Somente rotas administrativas autenticadas podem gera-las.
Route::middleware(['signed', 'throttle:30,1'])->prefix('secure-download')->group(function () {
    Route::get('/customers/{customer}/documents/{document}', [AdminCustomerController::class, 'downloadSensitiveDocument'])
        ->name('admin.customers.documents.download');
    Route::get('/carriers/{carrier}/documents/{type}', [CarrierController::class, 'downloadDocument'])
        ->name('admin.carriers.documents.download');
    Route::get('/orders/{order}/romaneio', [CarrierController::class, 'downloadRomaneio'])
        ->name('admin.orders.romaneio.download');
});
