<?php

namespace App\Domain\Identity;

use Illuminate\Database\Eloquent\Model;

final readonly class IssuedInvitation
{
    public function __construct(
        public Model $invitation,
        public string $plainTextToken,
    ) {
    }
}
