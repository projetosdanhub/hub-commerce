<?php

namespace App\Domain\Identity;

use App\Models\PlatformMembership;
use App\Models\TenantMembership;
use App\Models\User;
use Illuminate\Support\Facades\Schema;

final class IdentityAccessService
{
    public function __construct(private readonly AuthorizationService $authorization)
    {
    }

    /**
     * @return list<string>
     */
    public function loginAbilities(User $user): array
    {
        if (! $user->isActive()) {
            return [];
        }

        $abilities = [];

        if ($this->canAccessTenantPanel($user)) {
            $abilities[] = 'tenant';
        }

        if ($this->canAccessPlatformPanel($user)) {
            $abilities[] = 'platform';
        }

        if ($abilities === []) {
            return [];
        }

        // Mantém compatibilidade temporária com os consumidores existentes.
        array_unshift($abilities, 'admin');

        return $abilities;
    }

    public function canAccessTenantPanel(User $user): bool
    {
        if (! $user->isActive()) {
            return false;
        }

        if ((bool) config('identity.legacy_admin_access') && $user->isActiveAdmin()) {
            return true;
        }

        if (! Schema::hasTable('tenant_memberships')) {
            return false;
        }

        return TenantMembership::query()
            ->where('user_id', $user->getKey())
            ->where('status', TenantMembership::STATUS_ACTIVE)
            ->exists();
    }

    public function canAccessPlatformPanel(User $user): bool
    {
        if (! $user->isActive()) {
            return false;
        }

        if (! Schema::hasTable('platform_memberships')) {
            return false;
        }

        return PlatformMembership::query()
            ->where('user_id', $user->getKey())
            ->where('status', PlatformMembership::STATUS_ACTIVE)
            ->exists();
    }

    public function hasAdministrativeAccess(User $user): bool
    {
        return $this->canAccessTenantPanel($user) || $this->canAccessPlatformPanel($user);
    }

    public function isSuperadmin(User $user): bool
    {
        return $user->isActive() && $this->authorization->isSuperadmin($user);
    }
}
