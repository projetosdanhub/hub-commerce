<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class PlatformRole extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'name',
        'description',
        'is_system',
        'is_protected',
    ];

    protected function casts(): array
    {
        return [
            'is_system' => 'boolean',
            'is_protected' => 'boolean',
        ];
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'platform_role_permissions')->withTimestamps();
    }

    public function memberships(): BelongsToMany
    {
        return $this->belongsToMany(PlatformMembership::class, 'platform_membership_roles')->withTimestamps();
    }

    public function isSuperadmin(): bool
    {
        return $this->key === 'superadmin';
    }
}
