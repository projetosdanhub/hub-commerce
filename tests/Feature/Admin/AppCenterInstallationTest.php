<?php

namespace Tests\Feature\Admin;

use App\Domain\Tenancy\TenantContext;
use App\Domain\Tenancy\TenantContextStore;
use App\Http\Controllers\Admin\AppCenterController;
use App\Models\Tenant;
use App\Models\TenantAppInstallation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class AppCenterInstallationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $tenant = Tenant::query()->create([
            'name' => 'Loja de apps',
            'slug' => 'loja-de-apps',
        ]);

        app(TenantContextStore::class)->set(TenantContext::fromTenant($tenant, 'apps.test'));
    }

    protected function tearDown(): void
    {
        app(TenantContextStore::class)->clear();

        parent::tearDown();
    }

    public function test_it_requires_uninstalling_an_active_app_before_installing_a_competitor(): void
    {
        $controller = app(AppCenterController::class);

        $controller->install(Request::create('/admin/settings/apps/stripe/install', 'POST'), 'stripe');

        try {
            $controller->install(Request::create('/admin/settings/apps/mercado_pago/install', 'POST'), 'mercado_pago');
            $this->fail('A second gateway must not be installed while Stripe is active.');
        } catch (ValidationException $exception) {
            $this->assertSame(
                'Desinstale Stripe antes de instalar Mercado Pago nesta categoria.',
                $exception->errors()['app'][0],
            );
        }

        $controller->uninstall('stripe');
        $controller->install(Request::create('/admin/settings/apps/mercado_pago/install', 'POST'), 'mercado_pago');

        $this->assertDatabaseHas('tenant_app_installations', [
            'app_key' => 'stripe',
            'status' => 'UNINSTALLED',
        ]);
        $this->assertDatabaseHas('tenant_app_installations', [
            'app_key' => 'mercado_pago',
            'status' => 'INSTALLED',
        ]);
    }

    public function test_it_reports_the_installed_app_that_blocks_the_category(): void
    {
        TenantAppInstallation::query()->create([
            'app_key' => 'stripe',
            'status' => 'INSTALLED',
            'installed_at' => now(),
        ]);

        $response = app(AppCenterController::class)->index(Request::create('/admin/settings/apps', 'GET'));
        $catalog = collect(json_decode($response->getContent(), true, 512, JSON_THROW_ON_ERROR));
        $mercadoPago = $catalog->firstWhere('key', 'mercado_pago');

        $this->assertSame('stripe', $mercadoPago['blocked_by']['key']);
        $this->assertSame('Stripe', $mercadoPago['blocked_by']['name']);
    }
}
