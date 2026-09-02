<?php

namespace App\Domain\Identity;

use App\Models\Permission;
use App\Models\Tenant;
use App\Models\TenantRole;
use Illuminate\Support\Facades\DB;

final class TenantRoleProvisioningService
{
    public function provisionSystemRoles(Tenant $tenant): TenantRole
    {
        return DB::transaction(function () use ($tenant): TenantRole {
            $adminRole = TenantRole::query()->firstOrCreate(
                [
                    'tenant_id' => $tenant->getKey(),
                    'key' => 'admin',
                ],
                [
                    'name' => 'Administrador',
                    'description' => 'Cargo administrativo padrão da loja.',
                    'is_system' => true,
                    'is_protected' => true,
                    'is_assignable' => true,
                ],
            );

            $permissionIds = Permission::query()
                ->where('scope', Permission::SCOPE_TENANT)
                ->where('is_delegable', true)
                ->pluck('id');

            $adminRole->permissions()->syncWithoutDetaching($permissionIds);

            return $adminRole;
        });
    }
}
