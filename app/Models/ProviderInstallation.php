<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $tenant_id
 * @property string $public_id
 * @property string $provider
 * @property string $environment
 * @property string $connection_strategy
 * @property string $status
 * @property Carbon|null $connected_at
 * @property Carbon|null $revoked_at
 */
class ProviderInstallation extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'public_id',
        'provider',
        'environment',
        'connection_strategy',
        'status',
        'secret_ref',
        'connected_at',
        'revoked_at',
    ];

    protected function casts(): array
    {
        return [
            'connected_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $installation): void {
            $installation->public_id ??= (string) Str::uuid();
        });
    }

    public function getRouteKeyName(): string
    {
        return 'public_id';
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * @return HasOne<ProviderConnectionCredential, $this>
     */
    public function credential(): HasOne
    {
        return $this->hasOne(ProviderConnectionCredential::class);
    }

    public function webhookPath(): ?string
    {
        return $this->provider === 'melhor_envio' ? '/api/webhooks/melhor-envio' : null;
    }
}
