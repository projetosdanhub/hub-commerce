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
        return $this->belongsToMany(TenantRole::class, 'tenant_membership_roles')
            ->withPivot('tenant_id')
            ->withTimestamps();
    }

    /**
     * Sincroniza cargos sempre com o tenant da membership.
     *
     * A tabela pivô usa tenant_id na chave primária e em duas FKs compostas;
     * por isso, chamar roles()->sync() diretamente pode gravar um vínculo
     * inválido. Centralizar a escrita evita um papel sem escopo ou de outra
     * loja, sem introduzir um filtro que quebraria eager loading.
     *
     * @param list<int|string> $roleIds
     * @return array{attached: list<int|string>, detached: list<int|string>, updated: list<int|string>}
     */
    public function syncRoles(array $roleIds): array
    {
        if (! $this->exists || $this->tenant_id === null) {
            throw new \LogicException('A membership persistida precisa ter um tenant para receber cargos.');
        }

        $records = [];

        foreach (array_unique($roleIds) as $roleId) {
            $records[$roleId] = ['tenant_id' => $this->tenant_id];
        }

        return $this->roles()->sync($records);
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
