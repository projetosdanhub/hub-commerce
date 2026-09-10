<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $provider_installation_id
 * @property Carbon $expires_at
 * @property Carbon|null $consumed_at
 * @property string|null $pkce_verifier
 * @property-read ProviderInstallation|null $installation
 */
class ProviderAuthorizationState extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider_installation_id',
        'user_id',
        'state_hash',
        'pkce_verifier',
        'expires_at',
        'consumed_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'consumed_at' => 'datetime',
            'pkce_verifier' => 'encrypted',
        ];
    }

    /**
     * @return BelongsTo<ProviderInstallation, $this>
     */
    public function installation(): BelongsTo
    {
        return $this->belongsTo(ProviderInstallation::class, 'provider_installation_id');
    }
}
