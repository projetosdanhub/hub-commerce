<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property string $provider
 * @property string $purpose
 * @property string $environment
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $rotated_at
 * @property \Illuminate\Support\Carbon|null $revoked_at
 */
class PlatformSecretRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider',
        'purpose',
        'environment',
        'secret_ref',
        'status',
        'rotated_at',
        'revoked_at',
    ];

    protected function casts(): array
    {
        return [
            'rotated_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }
}
