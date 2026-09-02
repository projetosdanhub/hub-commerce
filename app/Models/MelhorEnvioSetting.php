<?php

namespace App\Models;

use App\Domain\Tenancy\Concerns\BelongsToTenant;

use Illuminate\Database\Eloquent\Model;

class MelhorEnvioSetting extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'access_token',
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