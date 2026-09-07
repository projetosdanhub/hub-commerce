<?php

namespace App\Models;

use App\Domain\Tenancy\Concerns\BelongsToTenant;

use Illuminate\Database\Eloquent\Model;

/**
 * @property string|null $access_token
 * @property string $environment
 * @property array<string, mixed>|null $sender_info
 */
class MelhorEnvioSetting extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'access_token',
        'environment',
        'carriers_ativas',
        'sender_info'
    ];

    protected function casts(): array
    {
        return [
            'access_token'    => 'encrypted',
            'carriers_ativas' => 'array',
            'sender_info'     => 'array',
        ];
    }
}