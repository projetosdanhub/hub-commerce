<?php

namespace App\Domain\Tenancy;

use App\Domain\Identity\TenantOwnershipService;
use App\Domain\Identity\TenantRoleProvisioningService;
use App\Models\StorefrontConfig;
use App\Models\Tenant;
use App\Models\TenantDomain;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final class TenantOnboardingService
{
    public function create(
        string $name,
        string $slug,
        string $domain,
        string $timezone = 'America/Sao_Paulo',
        string $currency = 'BRL',
        ?User $owner = null,
        ?User $assignedBy = null,
    ): Tenant {
        return DB::transaction(function () use ($name, $slug, $domain, $timezone, $currency, $owner, $assignedBy): Tenant {
            $tenant = Tenant::query()->create([
                'name' => $name,
                'slug' => $slug,
                'timezone' => $timezone,
                'currency' => $currency,
                'status' => Tenant::STATUS_ACTIVE,
            ]);

            $tenantDomain = TenantDomain::query()->create([
                'tenant_id' => $tenant->getKey(),
                'domain' => $domain,
                'is_primary' => true,
            ]);

            app(TenantContextStore::class)->run(
                TenantContext::fromTenant($tenant, $tenantDomain->domain),
                fn () => StorefrontConfig::query()->firstOrCreate([], ['layout_blocks' => []]),
            );

            app(TenantRoleProvisioningService::class)->provisionSystemRoles($tenant);

            if ($owner !== null) {
                app(TenantOwnershipService::class)->assignInitialOwner($tenant, $owner, $assignedBy);
            }

            return $tenant;
        });
    }
}
