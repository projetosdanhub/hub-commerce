<?php

namespace App\Domain\Tenancy\Concerns;

use App\Domain\Tenancy\TenantContext;
use App\Domain\Tenancy\TenantContextStore;
use App\Models\Tenant;
use Closure;

trait InteractsWithTenant
{
    protected function runForTenant(int $tenantId, Closure $callback): mixed
    {
        $tenant = Tenant::query()->find($tenantId);

        if ($tenant === null || ! $tenant->isActive()) {
            throw new \RuntimeException('Job recusado: tenant ausente ou inativo.');
        }

        return app(TenantContextStore::class)->run(
            TenantContext::fromTenant($tenant),
            $callback,
        );
    }
}
