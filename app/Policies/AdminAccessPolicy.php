<?php

namespace App\Policies;

use App\Domain\Identity\IdentityAccessService;
use App\Models\User;

final class AdminAccessPolicy
{
    public function access(User $user): bool
    {
        return app(IdentityAccessService::class)->canAccessTenantPanel($user);
    }
}
