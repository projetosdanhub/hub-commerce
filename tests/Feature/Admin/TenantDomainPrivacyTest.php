<?php

namespace Tests\Feature\Admin;

use App\Domain\Tenancy\TenantContext;
use App\Domain\Tenancy\TenantContextStore;
use App\Http\Controllers\Admin\TenantDomainController;
use App\Models\Tenant;
use App\Models\TenantDomain;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class TenantDomainPrivacyTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::query()->create([
            'name' => 'Loja de domínios',
            'slug' => 'loja-de-dominios',
        ]);
        app(TenantContextStore::class)->set(TenantContext::fromTenant($this->tenant, 'loja-de-dominios.test'));
    }

    protected function tearDown(): void
    {
        app(TenantContextStore::class)->clear();

        parent::tearDown();
    }

    public function test_it_exposes_only_custom_domains_owned_by_the_store(): void
    {
        TenantDomain::query()->create([
            'tenant_id' => $this->tenant->id,
            'domain' => 'loja.exemplo.com.br',
            'kind' => 'CUSTOM',
            'status' => 'PENDING_DNS',
        ]);
        foreach (['demo.hubcommerce.test', 'localhost', '127.0.0.1', 'teste.ngrok-free.dev'] as $host) {
            TenantDomain::query()->create([
                'tenant_id' => $this->tenant->id,
                'domain' => $host,
                'kind' => 'CUSTOM',
                'status' => 'PENDING_DNS',
            ]);
        }

        $response = app(TenantDomainController::class)->index();
        $payload = json_decode($response->getContent(), true, 512, JSON_THROW_ON_ERROR);

        $this->assertSame(['loja.exemplo.com.br'], array_column($payload['domains'], 'domain'));
        $this->assertSame('PLATFORM', $payload['platform_domain']['kind']);
    }

    public function test_it_rejects_internal_development_hosts_from_custom_domain_registration(): void
    {
        $controller = app(TenantDomainController::class);

        foreach (['localhost', '127.0.0.1', 'demo.hubcommerce.test', 'teste.ngrok-free.dev'] as $host) {
            try {
                $controller->store(Request::create('/admin/settings/domains', 'POST', ['domain' => $host]));
                $this->fail('Internal development host must not be registered as a custom domain.');
            } catch (ValidationException $exception) {
                $this->assertSame(
                    'Use um domínio público da sua marca. Endereços locais, de teste e túneis são exclusivos do ambiente técnico.',
                    $exception->errors()['domain'][0],
                );
            }
        }
    }
}
