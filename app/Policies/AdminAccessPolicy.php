<?php

namespace App\Policies;

use App\Models\User;

class AdminAccessPolicy
{
    public function access(User $user): bool
    {
        return $user->isActiveAdmin();
    }
}
