<?php

namespace App\Models;

use Illuminate\Auth\MustVerifyEmail as MustVerifyEmailTrait;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, MustVerifyEmailTrait, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'avatar',
        'password',
        'role',
        'telefone',
        'cpf',
        'nascimento',
        'sexo',
        'origem',
        'tags',
        'status',
        'notas',
        'coins',
        'cashback',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'tags' => 'array',
        ];
    }

    /**
     * Compatibilidade temporária com o modelo de autorização anterior.
     * Novas autorizações administrativas devem usar memberships e permissions.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isActive(): bool
    {
        return strtoupper((string) $this->status) === 'ATIVO';
    }

    public function isActiveAdmin(): bool
    {
        return $this->isAdmin() && $this->isActive();
    }

    public function isCliente(): bool
    {
        return $this->role === 'cliente';
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class, 'user_id');
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(CustomerAuditLog::class, 'cliente_id');
    }

    public function walletTransactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class, 'user_id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'user_id');
    }

    public function pedidos(): HasMany
    {
        return $this->hasMany(Order::class, 'user_id');
    }

    public function platformMembership(): HasOne
    {
        return $this->hasOne(PlatformMembership::class);
    }

    public function tenantMemberships(): HasMany
    {
        return $this->hasMany(TenantMembership::class);
    }

    public function mfaMethods(): HasMany
    {
        return $this->hasMany(UserMfaMethod::class);
    }

    public function mfaRecoveryCodes(): HasMany
    {
        return $this->hasMany(UserMfaRecoveryCode::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(UserSession::class);
    }
}
