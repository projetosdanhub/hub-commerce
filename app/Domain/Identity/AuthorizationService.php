<?php

namespace App\Domain\Identity;

use App\Models\Permission;
use App\Models\PlatformMembership;
use App\Models\Tenant;
use App\Models\TenantMembership;
use App\Models\User;
use Illuminate\Support\Collection;

final class AuthorizationService
{
    public function platformMembership(User $user): ?PlatformMembership
    {
        return PlatformMembership::query()
            ->with(['roles.permissions'])
            ->where('user_id', $user->getKey())
            ->where('status', PlatformMembership::STATUS_ACTIVE)
            ->first();
    }

    public function tenantMembership(User $user, Tenant|int $tenant): ?TenantMembership
    {
        $tenantId = $tenant instanceof Tenant ? $tenant->getKey() : $tenant;

        return TenantMembership::query()
            ->with(['roles.permissions', 'ownership'])
            ->where('tenant_id', $tenantId)
            ->where('user_id', $user->getKey())
            ->where('status', TenantMembership::STATUS_ACTIVE)
            ->first();
    }

    public function isSuperadmin(User $user): bool
    {
        $membership = $this->platformMembership($user);

        return $membership !== null
            && $membership->roles->contains(fn ($role): bool => $role->isSuperadmin());
    }

    public function allowsPlatform(User $user, string $permissionKey): bool
    {
        if (! str_starts_with($permissionKey, 'platform.')) {
            return false;
        }

        $membership = $this->platformMembership($user);

        if ($membership === null) {
            return false;
        }

        if ($membership->roles->contains(fn ($role): bool => $role->isSuperadmin())) {
            return true;
        }

        return $membership->roles
            ->flatMap(fn ($role) => $role->permissions)
            ->contains(fn (Permission $permission): bool => $permission->key === $permissionKey);
    }

    public function allowsTenant(User $user, Tenant|int $tenant, string $permissionKey): bool
    {
        if (! str_starts_with($permissionKey, 'tenant.')) {
            return false;
        }

        $membership = $this->tenantMembership($user, $tenant);

        if ($membership === null) {
            return false;
        }

        if ($membership->isOwner()) {
            return true;
        }

        return $membership->roles
            ->flatMap(fn ($role) => $role->permissions)
            ->contains(fn (Permission $permission): bool => $permission->key === $permissionKey);
    }

    /**
     * @return Collection<int, string>
     */
    public function tenantPermissionKeys(User $user, Tenant|int $tenant): Collection
    {
        $membership = $this->tenantMembership($user, $tenant);

        if ($membership === null) {
            return collect();
        }

        if ($membership->isOwner()) {
            return Permission::query()
                ->where('scope', Permission::SCOPE_TENANT)
                ->orderBy('key')
                ->pluck('key');
        }

        return $membership->roles
            ->flatMap(fn ($role) => $role->permissions)
            ->filter(fn (Permission $permission): bool => $permission->scope === Permission::SCOPE_TENANT)
            ->pluck('key')
            ->unique()
            ->sort()
            ->values();
    }

    /**
     * @return Collection<int, string>
     */
    public function platformPermissionKeys(User $user): Collection
    {
        $membership = $this->platformMembership($user);

        if ($membership === null) {
            return collect();
        }

        if ($membership->roles->contains(fn ($role): bool => $role->isSuperadmin())) {
            return Permission::query()
                ->where('scope', Permission::SCOPE_PLATFORM)
                ->orderBy('key')
                ->pluck('key');
        }

        return $membership->roles
            ->flatMap(fn ($role) => $role->permissions)
            ->filter(fn (Permission $permission): bool => $permission->scope === Permission::SCOPE_PLATFORM)
            ->pluck('key')
            ->unique()
            ->sort()
            ->values();
    }

    public function canDelegateTenantPermission(User $actor, Tenant|int $tenant, string $permissionKey): bool
    {
        $permission = Permission::query()->where('key', $permissionKey)->first();

        return $permission !== null
            && $permission->scope === Permission::SCOPE_TENANT
            && $permission->is_delegable
            && $this->allowsTenant($actor, $tenant, $permissionKey);
    }
}
