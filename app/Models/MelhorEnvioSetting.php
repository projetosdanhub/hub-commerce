<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MelhorEnvioSetting extends Model
{
    protected $fillable = [
        'access_token',
        'carriers_ativas',
        'sender_info'
    ];

    protected function casts(): array
    {
        return [
            'carriers_ativas' => 'array',
            'sender_info'     => 'array',
        ];
    }
}