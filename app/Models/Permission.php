<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Permission extends Model
{
    use HasFactory;

    public const SCOPE_PLATFORM = 'platform';
    public const SCOPE_TENANT = 'tenant';

    protected $fillable = [
        'key',
        'scope',
        'module',
        'action',
        'is_delegable',
        'risk_level',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'is_delegable' => 'boolean',
        ];
    }

    public function tenantRoles(): BelongsToMany
    {
        return $this->belongsToMany(TenantRole::class, 'tenant_role_permissions')->withTimestamps();
    }

    public function platformRoles(): BelongsToMany
    {
        return $this->belongsToMany(PlatformRole::class, 'platform_role_permissions')->withTimestamps();
    }
}
