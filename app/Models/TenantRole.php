<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class TenantRole extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'key',
        'name',
        'description',
        'is_system',
        'is_protected',
        'is_assignable',
    ];

    protected function casts(): array
    {
        return [
            'is_system' => 'boolean',
            'is_protected' => 'boolean',
            'is_assignable' => 'boolean',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'tenant_role_permissions')->withTimestamps();
    }

    public function memberships(): BelongsToMany
    {
        return $this->belongsToMany(TenantMembership::class, 'tenant_membership_roles')
            ->withPivot('tenant_id')
            ->withTimestamps();
    }
}
