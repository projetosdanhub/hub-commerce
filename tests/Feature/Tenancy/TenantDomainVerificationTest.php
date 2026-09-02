<?php

namespace Tests\Feature\Tenancy;

use App\Domain\Tenancy\TenantDomainVerificationService;
use App\Models\Tenant;
use App\Models\TenantDomain;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantDomainVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_domain_requires_and_consumes_a_one_time_challenge(): void
    {
        $tenant = Tenant::query()->create(['name' => 'Loja verificada', 'slug' => 'loja-verificada']);
        $domain = TenantDomain::query()->create([
            'tenant_id' => $tenant->getKey(),
            'domain' => 'verificar.test',
            'is_primary' => true,
        ]);

        $service = app(TenantDomainVerificationService::class);
        $token = $service->issueChallenge($domain);

        $this->assertNotSame($token, $domain->fresh()->verification_token_hash);

        $service->verify($domain->fresh(), $token);

        $this->assertNotNull($domain->fresh()->verified_at);
        $this->assertNull($domain->fresh()->verification_token_hash);
    }

    public function test_domain_rejects_invalid_challenge(): void
    {
        $tenant = Tenant::query()->create(['name' => 'Loja inválida', 'slug' => 'loja-invalida']);
        $domain = TenantDomain::query()->create([
            'tenant_id' => $tenant->getKey(),
            'domain' => 'invalida.test',
        ]);

        app(TenantDomainVerificationService::class)->issueChallenge($domain);

        $this->expectException(\InvalidArgumentException::class);

        app(TenantDomainVerificationService::class)->verify($domain->fresh(), 'token-incorreto');
    }
}
