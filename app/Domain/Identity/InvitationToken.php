<?php

namespace App\Domain\Identity;

use Illuminate\Support\Str;

final class InvitationToken
{
    public static function generate(): string
    {
        return Str::random(80);
    }

    public static function hash(string $token): string
    {
        return hash('sha256', $token);
    }
}
