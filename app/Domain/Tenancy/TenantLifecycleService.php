<?php

namespace App\Domain\Tenancy;

use App\Models\Tenant;

final class TenantLifecycleService
{
    public function suspend(Tenant $tenant): void
    {
        $tenant->forceFill([
            'status' => Tenant::STATUS_SUSPENDED,
            'suspended_at' => now(),
        ])->save();
    }

    public function activate(Tenant $tenant): void
    {
        $tenant->forceFill([
            'status' => Tenant::STATUS_ACTIVE,
            'suspended_at' => null,
        ])->save();
    }
}
