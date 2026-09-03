<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class TenantMembership extends Model
{
    use HasFactory;

    public const STATUS_ACTIVE = 'ACTIVE';
    public const STATUS_SUSPENDED = 'SUSPENDED';
    public const STATUS_REVOKED = 'REVOKED';

    protected $fillable = [
        'tenant_id',
        'user_id',
        'status',
        'authorization_version',
        'created_by_user_id',
        'joined_at',
        'revoked_at',
    ];

    protected function casts(): array
    {
        return [
            'joined_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function roles(): BelongsToMany
    {
        // tenant_id faz parte da chave e das FKs compostas da tabela pivô.
        // Defini-lo na relação impede que attach/sync crie associação sem
        // escopo e ainda filtra qualquer vínculo de outro tenant.
        return $this->belongsToMany(TenantRole::class, 'tenant_membership_roles')
            ->withPivot('tenant_id')
            ->withPivotValue('tenant_id', $this->tenant_id)
            ->withTimestamps();
    }

    public function ownership(): HasOne
    {
        return $this->hasOne(TenantOwnership::class, 'tenant_membership_id');
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    public function isOwner(): bool
    {
        return $this->relationLoaded('ownership')
            ? $this->ownership !== null
            : $this->ownership()->exists();
    }
}
