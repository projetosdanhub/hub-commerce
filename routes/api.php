<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Importando os Controllers
use App\Http\Controllers\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TrackingCollectorController; // 🟢 IMPORTAÇÃO ATUALIZADA
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\AdminProductController;
use App\Http\Controllers\Admin\AppCenterController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\CarrierController; 
use App\Http\Controllers\Admin\ShippingPackageController;
use App\Http\Controllers\Admin\MelhorEnvioController;
use App\Http\Controllers\Admin\StorefrontController;
use App\Http\Controllers\Storefront\CheckoutAddressController;
use App\Http\Controllers\Storefront\CheckoutCustomerSessionController;
use App\Http\Controllers\Storefront\FreeShippingProgressController;
use App\Http\Controllers\Storefront\CheckoutSummaryController;
use App\Http\Controllers\Storefront\PostalCodeLookupController;
use App\Http\Controllers\Storefront\ShippingQuoteController;
use App\Http\Controllers\Storefront\StripeCheckoutController;
use App\Http\Controllers\Admin\TrackingController;
use App\Http\Controllers\Admin\NavigationMenuController;
use App\Http\Controllers\Identity\AuthorizationAuditController;
use App\Http\Controllers\Identity\EmailVerificationController;
use App\Http\Controllers\Identity\IdentityPasswordResetController;
use App\Http\Controllers\Identity\InvitationAcceptanceController;
use App\Http\Controllers\Identity\MfaController;
use App\Http\Controllers\Identity\PlatformTeamController;
use App\Http\Controllers\Identity\PlatformTenantOwnershipController;
use App\Http\Controllers\Identity\TenantTeamController;
use App\Http\Controllers\Identity\UserSessionController;
use App\Http\Controllers\Webhooks\StripeWebhookController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/webhooks/stripe/{tenant:slug}', [StripeWebhookController::class, 'handle'])->middleware('throttle:120,1');

// ==========================================
// ROTAS DE LOGIN (PÚBLICAS) E VALIDAÇÃO DE E-MAIL
// ==========================================
Route::post('/admin/login', [AuthController::class, 'login'])->middleware('throttle:6,1');

// Rota pública acionada quando o cliente clica no link do E-mail (Validar E-mail)
Route::get('/clientes/confirmar-email', [AdminCustomerController::class, 'confirmEmailUpdate']);

// Redefinição de senha: token hashado, expiração pelo broker e uso único.
Route::post('/clientes/esqueci-senha', [IdentityPasswordResetController::class, 'request'])->middleware('throttle:5,1');
Route::get('/clientes/redefinir-senha', [IdentityPasswordResetController::class, 'form'])->middleware('throttle:10,1');
Route::post('/clientes/processar-senha', [IdentityPasswordResetController::class, 'reset'])->middleware('throttle:5,1');

// A assinatura e o hash do e-mail tornam a verificação idempotente.
Route::get('/identity/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');

Route::middleware('auth:sanctum')->prefix('identity')->group(function (): void {
    Route::post('/tenant-invitations/accept', [InvitationAcceptanceController::class, 'acceptTenant'])->middleware('throttle:5,1');
    Route::post('/platform-invitations/accept', [InvitationAcceptanceController::class, 'acceptPlatform'])->middleware('throttle:5,1');

    Route::post('/email/verification-notification', [EmailVerificationController::class, 'send'])->middleware('throttle:1,1');

    // Um token temporário de matrícula MFA só pode acessar estas duas ações.
    Route::post('/mfa/enrollment', [MfaController::class, 'begin'])->middleware('throttle:5,1');
    Route::post('/mfa/enrollment/confirm', [MfaController::class, 'confirm'])->middleware('throttle:5,1');

    Route::get('/mfa', [MfaController::class, 'status']);
    Route::post('/mfa/recovery-codes', [MfaController::class, 'regenerateRecoveryCodes'])->middleware('throttle:5,1');
    Route::delete('/mfa', [MfaController::class, 'disable'])->middleware('throttle:5,1');

    Route::get('/sessions', [UserSessionController::class, 'index']);
    Route::delete('/sessions/{session}', [UserSessionController::class, 'revoke']);
    Route::post('/sessions/revoke-others', [UserSessionController::class, 'revokeOthers'])->middleware('throttle:5,1');
});

// ==========================================
// ROTAS DO FRONT-END (VITRINE PÚBLICA / REACT)
// ==========================================
// 🟢 LEITURA PÚBLICA: o domínio verificado resolve a loja antes de qualquer query.
Route::middleware('tenant')->group(function (): void {
Route::get('/storefront', [StorefrontController::class, 'getVitrine']);
Route::get('/storefront/menu', [StorefrontController::class, 'getMenu']);
Route::get('/storefront/categories', [StorefrontController::class, 'getCategories']);
Route::get('/storefront/products', [StorefrontController::class, 'getProducts']);
Route::get('/storefront/products/{id}', [StorefrontController::class, 'getProduct']);
Route::get('/storefront/postal-codes/{postalCode}', [PostalCodeLookupController::class, 'show'])->middleware('throttle:30,1');
Route::post('/storefront/shipping-quotes', [ShippingQuoteController::class, 'store'])->middleware('throttle:10,1');
Route::post('/storefront/free-shipping-progress', [FreeShippingProgressController::class, 'store'])->middleware('throttle:20,1');
Route::post('/storefront/checkout/customer-session', [CheckoutCustomerSessionController::class, 'store'])->middleware('throttle:5,1');
Route::post('/storefront/checkout/summary', [CheckoutSummaryController::class, 'store'])->middleware('throttle:10,1');
Route::middleware('auth:sanctum')->prefix('storefront/checkout')->group(function (): void {
    Route::get('/addresses', [CheckoutAddressController::class, 'index'])->middleware('throttle:30,1');
    Route::post('/addresses', [CheckoutAddressController::class, 'store'])->middleware('throttle:10,1');
    Route::post('/stripe/payment-intent', [StripeCheckoutController::class, 'store'])->middleware('throttle:5,1');
});
Route::get('/tracking', [TrackingController::class, 'getPublicSettings'])->middleware('throttle:60,1');

// 🟢 INGESTÃO DE DADOS (DATA LAYER): Recebe os eventos de conversão da loja pública
Route::post('/tracking/collect', [TrackingCollectorController::class, 'collect'])->middleware('throttle:60,1');
});


// ==========================================
// ROTAS DO HUB COMMERCE: ADMIN (PROTEGIDAS)
// ==========================================
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::middleware('tenant')->group(function (): void {
    
    // Identidade da loja: toda ação é autorizada por membership e permissão tenant-scoped.
    Route::prefix('identity')->group(function (): void {
        Route::get('/team/members', [TenantTeamController::class, 'members'])->middleware('tenant.permission:tenant.team.view');
        Route::get('/roles', [TenantTeamController::class, 'roles'])->middleware('tenant.permission:tenant.roles.view');
        Route::get('/permissions', [TenantTeamController::class, 'permissions'])->middleware('tenant.permission:tenant.roles.view');
        Route::post('/roles', [TenantTeamController::class, 'createRole'])->middleware('tenant.permission:tenant.roles.manage');
        Route::put('/roles/{role}', [TenantTeamController::class, 'updateRole'])->middleware('tenant.permission:tenant.roles.manage');
        Route::delete('/roles/{role}', [TenantTeamController::class, 'deleteRole'])->middleware('tenant.permission:tenant.roles.manage');

        Route::post('/team/invitations', [TenantTeamController::class, 'invite'])->middleware('tenant.permission:tenant.team.manage');
        Route::get('/team/invitations', [TenantTeamController::class, 'invitations'])->middleware('tenant.permission:tenant.team.view');
        Route::delete('/team/invitations/{invitation}', [TenantTeamController::class, 'revokeInvitation'])->middleware('tenant.permission:tenant.team.manage');
        Route::put('/team/members/{membership}/roles', [TenantTeamController::class, 'assignMemberRoles'])->middleware('tenant.permission:tenant.team.manage');
        Route::put('/team/members/{membership}/status', [TenantTeamController::class, 'updateMemberStatus'])->middleware('tenant.permission:tenant.team.manage');

        Route::get('/audit-logs', [AuthorizationAuditController::class, 'tenant'])->middleware('tenant.permission:tenant.audit.view');
    });

    // (A rota mock de /audit-logs foi removida, pois agora usamos /products/audits real)

    // --- MÓDULO: CRM DE CLIENTES ---
    Route::prefix('customers')->group(function () {
        Route::get('/', [AdminCustomerController::class, 'index'])->middleware('tenant.permission:tenant.customers.view');
        
        // Rotas estáticas precisam vir ANTES das rotas com {id}
        Route::get('/metrics', [AdminCustomerController::class, 'getDashboardMetrics'])->middleware('tenant.permission:tenant.customers.view');
        
        // Níveis VIP
        Route::get('/vip-levels', [AdminCustomerController::class, 'getVipLevels'])->middleware('tenant.permission:tenant.customers.view');
        Route::post('/vip-levels', [AdminCustomerController::class, 'storeOrUpdateVipLevel'])->middleware('tenant.permission:tenant.customers.manage');
        Route::delete('/vip-levels/{id}', [AdminCustomerController::class, 'deleteVipLevel'])->middleware('tenant.permission:tenant.customers.manage');

        // Configurações
        Route::get('/settings', [AdminCustomerController::class, 'getSettings'])->middleware('tenant.permission:tenant.customers.view');
        Route::put('/settings', [AdminCustomerController::class, 'updateSettings'])->middleware('tenant.permission:tenant.customers.manage');

        // AÇÕES DE PERFIL DE CLIENTE (Usam o parâmetro {id})
        Route::get('/{id}', [AdminCustomerController::class, 'show'])->middleware('tenant.permission:tenant.customers.view');
        Route::put('/{id}/basics', [AdminCustomerController::class, 'updateBasics'])->middleware('tenant.permission:tenant.customers.manage');
        Route::put('/{id}/phone', [AdminCustomerController::class, 'updatePhone'])->middleware('tenant.permission:tenant.customers.manage');
        Route::post('/{id}/sensitive-data', [AdminCustomerController::class, 'updateSensitiveData'])->middleware('tenant.permission:tenant.customers.manage');
        Route::put('/{id}/notes', [AdminCustomerController::class, 'updateNotes'])->middleware('tenant.permission:tenant.customers.manage');
        Route::put('/{id}/tags', [AdminCustomerController::class, 'syncTags'])->middleware('tenant.permission:tenant.customers.manage');
        Route::post('/{id}/status', [AdminCustomerController::class, 'toggleSuspension'])->middleware('tenant.permission:tenant.customers.manage');
        Route::post('/{id}/wallet-transaction', [AdminCustomerController::class, 'addWalletTransaction'])->middleware('tenant.permission:tenant.customers.manage');
        Route::post('/{id}/email-link', [AdminCustomerController::class, 'sendEmailUpdateLink'])->middleware('tenant.permission:tenant.customers.manage');
        Route::put('/{id}/force-email', [AdminCustomerController::class, 'forceEmailUpdate'])->middleware('tenant.permission:tenant.customers.manage');
        Route::post('/{id}/generate-temp-password', [AdminCustomerController::class, 'generateTempPassword'])->middleware('tenant.permission:tenant.customers.manage');
        Route::post('/{id}/password-link', [AdminCustomerController::class, 'sendPasswordResetLink'])->middleware('tenant.permission:tenant.customers.manage');
    });

    // --- MÓDULO: CATEGORIAS ---
    Route::prefix('categories')->group(function () {
        Route::get('/', [CategoryController::class, 'index'])->middleware('tenant.permission:tenant.catalog.view');
        Route::post('/', [CategoryController::class, 'store'])->middleware('tenant.permission:tenant.catalog.manage');
        Route::put('/{id}', [CategoryController::class, 'update'])->middleware('tenant.permission:tenant.catalog.manage');
        Route::delete('/{id}', [CategoryController::class, 'destroy'])->middleware('tenant.permission:tenant.catalog.manage');
    });
    // --- MÓDULO: MEGA MENU ---
    Route::prefix('menu')->group(function () {
        Route::get('/', [NavigationMenuController::class, 'getConfigs'])->middleware('tenant.permission:tenant.storefront.view');
        Route::post('/', [NavigationMenuController::class, 'storeConfig'])->middleware('tenant.permission:tenant.storefront.manage');
        Route::put('/{id}', [NavigationMenuController::class, 'updateConfig'])->middleware('tenant.permission:tenant.storefront.manage');
        Route::delete('/{id}', [NavigationMenuController::class, 'destroyConfig'])->middleware('tenant.permission:tenant.storefront.manage');
        Route::get('/{id}/items', [NavigationMenuController::class, 'getItems'])->middleware('tenant.permission:tenant.storefront.view');
        Route::post('/{id}/sync', [NavigationMenuController::class, 'syncItems'])->middleware('tenant.permission:tenant.storefront.manage');
    });
    // --- MÓDULO: PRODUTOS ---
    Route::prefix('products')->group(function () {
        Route::get('/free-shipping', [ProductFreeShippingController::class, 'show'])->middleware('tenant.permission:tenant.catalog.view');
        Route::put('/free-shipping', [ProductFreeShippingController::class, 'update'])->middleware('tenant.permission:tenant.catalog.manage');
        Route::get('/audits', [AdminProductController::class, 'getAudits'])->middleware('tenant.permission:tenant.catalog.view');
        Route::get('/', [AdminProductController::class, 'index'])->middleware('tenant.permission:tenant.catalog.view');
        Route::post('/validate-skus', [AdminProductController::class, 'validateSkus'])->middleware('tenant.permission:tenant.catalog.manage');
        Route::post('/', [AdminProductController::class, 'store'])->middleware('tenant.permission:tenant.catalog.manage');
        Route::delete('/{id}', [AdminProductController::class, 'destroy'])->middleware('tenant.permission:tenant.catalog.manage');
    });

    // --- MÓDULO: PEDIDOS ---
    Route::prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index'])->middleware('tenant.permission:tenant.orders.view');
        Route::get('/metrics', [OrderController::class, 'metrics'])->middleware('tenant.permission:tenant.orders.view');
        Route::get('/metric-preferences', [OrderController::class, 'metricPreferences'])->middleware('tenant.permission:tenant.orders.view');
        Route::put('/metric-preferences', [OrderController::class, 'updateMetricPreferences'])->middleware('tenant.permission:tenant.orders.view');
        Route::put('/{id}/status', [OrderController::class, 'updateStatus'])->middleware('tenant.permission:tenant.orders.manage');
        Route::post('/{id}/dispatch', [OrderController::class, 'dispatchOrder'])->middleware('tenant.permission:tenant.orders.manage');
        Route::post('/{id}/cancel', [OrderController::class, 'cancelOrder'])->middleware('tenant.permission:tenant.orders.manage');
        
        // Fluxo Manual e Integração Melhor Envio
        Route::post('/{id}/status-manual', [OrderController::class, 'updateStatusManual'])->middleware('tenant.permission:tenant.orders.manage');
        // Rota Oficial de Emissão Fiscal e Documentos
        Route::get('/{id}/preview-doc', [OrderController::class, 'previewDoc'])->middleware('tenant.permission:tenant.orders.view'); 
        Route::get('/{id}/refund-receipts/{receiptIndex}', [OrderController::class, 'refundReceipt'])
            ->middleware('tenant.permission:tenant.orders.view')
            ->name('admin.orders.refund-receipts.show');
        
        // Cancelar Etiqueta no Carrinho do Melhor Envio
        Route::post('/{id}/cancel-me-cart', [OrderController::class, 'cancelMelhorEnvioCart'])->middleware('tenant.permission:tenant.orders.manage');
    });
    

    // --- MÓDULO: TRANSPORTADORAS ---
    Route::prefix('carriers')->group(function () {
        Route::get('/audits', [CarrierController::class, 'getAudits'])->middleware('tenant.permission:tenant.shipping.view');
        Route::get('/', [CarrierController::class, 'index'])->middleware('tenant.permission:tenant.shipping.view');
        Route::post('/', [CarrierController::class, 'store'])->middleware('tenant.permission:tenant.shipping.manage'); 
        Route::post('/{id}/status', [CarrierController::class, 'updateStatus'])->middleware('tenant.permission:tenant.shipping.manage');
        Route::delete('/{id}', [CarrierController::class, 'destroy'])->middleware('tenant.permission:tenant.shipping.manage');
        
        Route::get('/{id}/orders', [CarrierController::class, 'getOrders'])->middleware('tenant.permission:tenant.shipping.view');
        Route::post('/orders/{orderId}/romaneio', [CarrierController::class, 'uploadRomaneio'])->middleware('tenant.permission:tenant.shipping.manage');
    });

    // --- MÓDULO: EMBALAGENS PADRÃO ---
    Route::prefix('shipping-packages')->group(function () {
        Route::get('/', [ShippingPackageController::class, 'index'])->middleware('tenant.permission:tenant.shipping.view');
        Route::post('/', [ShippingPackageController::class, 'store'])->middleware('tenant.permission:tenant.shipping.manage');
        Route::delete('/{id}', [ShippingPackageController::class, 'destroy'])->middleware('tenant.permission:tenant.shipping.manage');
    });

    // --- MÓDULO: MELHOR ENVIO ---
    Route::prefix('melhorenvio')->group(function () {
        Route::get('/settings', [MelhorEnvioController::class, 'getSettings'])->middleware('tenant.permission:tenant.shipping.view');
        Route::post('/verify-token', [MelhorEnvioController::class, 'verifyToken'])->middleware('tenant.permission:tenant.shipping.manage');
        Route::post('/carriers', [MelhorEnvioController::class, 'saveCarriers'])->middleware('tenant.permission:tenant.shipping.manage');
        Route::post('/sender', [MelhorEnvioController::class, 'saveSender'])->middleware('tenant.permission:tenant.shipping.manage');
        Route::post('/disconnect', [MelhorEnvioController::class, 'disconnect'])->middleware('tenant.permission:tenant.shipping.manage');
        Route::post('/calculate', [MelhorEnvioController::class, 'calculate'])->middleware('tenant.permission:tenant.shipping.manage'); 
    });

    // --- MÓDULO: RASTREAMENTO & PIXELS (ÁREA DO PAINEL) ---
    Route::prefix('tracking')->group(function () {
        Route::get('/settings', [TrackingController::class, 'getSettings'])->middleware('tenant.permission:tenant.tracking.view');
        Route::post('/settings', [TrackingController::class, 'updateSettings'])->middleware('tenant.permission:tenant.tracking.manage');
        
        Route::get('/dashboard', [TrackingController::class, 'getDashboardData'])->middleware('tenant.permission:tenant.tracking.view');
        
        Route::get('/triggers', [TrackingController::class, 'getTriggers'])->middleware('tenant.permission:tenant.tracking.view');
        Route::post('/triggers', [TrackingController::class, 'storeTrigger'])->middleware('tenant.permission:tenant.tracking.manage');
        Route::delete('/triggers/{id}', [TrackingController::class, 'deleteTrigger'])->middleware('tenant.permission:tenant.tracking.manage');
    });

    // --- MÓDULO: CONFIGURAÇÕES GERAIS (GATEWAYS E LOGÍSTICA) ---
    Route::prefix('settings')->group(function () {
        Route::get('/apps', [AppCenterController::class, 'index'])->middleware('tenant.permission:tenant.settings.view');
        Route::post('/apps/{app}/install', [AppCenterController::class, 'install'])->middleware('tenant.permission:tenant.settings.manage');
        Route::delete('/apps/{app}/install', [AppCenterController::class, 'uninstall'])->middleware('tenant.permission:tenant.settings.manage');
        Route::get('/stripe', [AppCenterController::class, 'stripe'])->middleware('tenant.permission:tenant.settings.view');
        Route::post('/stripe', [AppCenterController::class, 'saveStripe'])->middleware('tenant.permission:tenant.settings.manage');
        Route::get('/logistics', [AppCenterController::class, 'logistics'])->middleware('tenant.permission:tenant.settings.view');
        Route::post('/logistics', [AppCenterController::class, 'saveLogistics'])->middleware('tenant.permission:tenant.settings.manage');
        Route::get('/fiscal', [AppCenterController::class, 'fiscal'])->middleware('tenant.permission:tenant.settings.view');
        Route::post('/fiscal', [AppCenterController::class, 'saveFiscal'])->middleware('tenant.permission:tenant.settings.manage');
        Route::get('/{group}', [\App\Http\Controllers\Admin\GlobalSettingsController::class, 'getGroup'])->middleware('tenant.permission:tenant.settings.view');
        Route::post('/', [\App\Http\Controllers\Admin\GlobalSettingsController::class, 'setSetting'])->middleware('tenant.permission:tenant.settings.manage');
    });

    // --- MÓDULO: CONSTRUTOR DE VITRINE ---
    Route::post('/storefront/publish', [StorefrontController::class, 'publishVitrine'])->middleware('tenant.permission:tenant.storefront.manage');
    });
});

// Administração da plataforma: não usa tenant do host nem o painel da loja.
Route::middleware(['auth:sanctum', 'identity'])->prefix('platform')->group(function (): void {
    Route::get('/team/members', [PlatformTeamController::class, 'members'])->middleware('platform.permission:platform.team.view');
    Route::get('/roles', [PlatformTeamController::class, 'roles'])->middleware('platform.permission:platform.roles.view');
    Route::get('/permissions', [PlatformTeamController::class, 'permissions'])->middleware('platform.permission:platform.roles.view');
    Route::post('/roles', [PlatformTeamController::class, 'createRole'])->middleware('platform.permission:platform.roles.manage');
    Route::put('/roles/{role}', [PlatformTeamController::class, 'updateRole'])->middleware('platform.permission:platform.roles.manage');
    Route::delete('/roles/{role}', [PlatformTeamController::class, 'deleteRole'])->middleware('platform.permission:platform.roles.manage');

    Route::post('/team/invitations', [PlatformTeamController::class, 'invite'])->middleware('platform.permission:platform.team.manage');
    Route::get('/team/invitations', [PlatformTeamController::class, 'invitations'])->middleware('platform.permission:platform.team.view');
    Route::delete('/team/invitations/{invitation}', [PlatformTeamController::class, 'revokeInvitation'])->middleware('platform.permission:platform.team.manage');
    Route::put('/team/members/{membership}/roles', [PlatformTeamController::class, 'assignMemberRoles'])->middleware('platform.permission:platform.team.manage');
    Route::put('/team/members/{membership}/status', [PlatformTeamController::class, 'updateMemberStatus'])->middleware('platform.permission:platform.team.manage');

    // A troca do owner é intencionalmente restrita à plataforma.
    Route::put('/tenants/{tenant}/owner', [PlatformTenantOwnershipController::class, 'transfer'])
        ->middleware('platform.permission:platform.tenants.manage');

    Route::get('/audit-logs', [AuthorizationAuditController::class, 'platform'])->middleware('platform.permission:platform.audit.view');
});

// URLs de curta duracao. Somente rotas administrativas autenticadas podem gera-las.
Route::middleware(['signed', 'throttle:30,1', 'tenant'])->prefix('secure-download')->group(function () {
    Route::get('/customers/{customer}/documents/{document}', [AdminCustomerController::class, 'downloadSensitiveDocument'])
        ->name('admin.customers.documents.download');
    Route::get('/carriers/{carrier}/documents/{type}', [CarrierController::class, 'downloadDocument'])
        ->name('admin.carriers.documents.download');
    Route::get('/orders/{order}/romaneio', [CarrierController::class, 'downloadRomaneio'])
        ->name('admin.orders.romaneio.download');
    Route::get('/orders/{order}/documents/{type}', [OrderController::class, 'document'])
        ->name('secure-download.orders.documents');
    Route::get('/orders/{order}/refund-receipts/{receiptIndex}', [OrderController::class, 'refundReceipt'])
        ->name('secure-download.orders.refund-receipts');
});
