<?php

namespace Tests\Feature\Tenancy;

use App\Domain\Tenancy\TenantContext;
use App\Domain\Tenancy\TenantContextStore;
use App\Domain\Tenancy\TenantOnboardingService;
use App\Models\StorefrontConfig;
use App\Models\TenantDomain;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantOnboardingTest extends TestCase
{
    use RefreshDatabase;

    public function test_onboarding_creates_isolated_tenant_defaults(): void
    {
        $tenant = app(TenantOnboardingService::class)->create(
            name: 'Loja nova',
            slug: 'loja-nova',
            domain: 'nova-loja.test',
        );

        $domain = TenantDomain::query()->where('tenant_id', $tenant->getKey())->firstOrFail();

        $this->assertSame('nova-loja.test', $domain->domain);
        $this->assertFalse($domain->is_primary === false);
        $this->assertNull($domain->verified_at);

        app(TenantContextStore::class)->set(TenantContext::fromTenant($tenant, $domain->domain));

        $this->assertDatabaseHas('storefront_configs', [
            'tenant_id' => $tenant->getKey(),
        ]);
        $this->assertNotNull(StorefrontConfig::query()->first());

        app(TenantContextStore::class)->clear();
    }
}
