<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MelhorEnvioSetting extends Model
{
    protected $fillable = [
        'client_id',
        'client_secret',
        'access_token',
        'refresh_token',
        'expires_in',
        'carriers_ativas'
    ];

    // Transforma o JSON do banco automaticamente em Array no PHP
    protected function casts(): array
    {
        return [
            'carriers_ativas' => 'array',
        ];
    }
}