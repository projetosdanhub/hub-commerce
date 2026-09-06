<?php

namespace App\Models;

use App\Domain\Tenancy\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class TenantAppInstallation extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'app_key',
        'status',
        'installed_at',
    ];

    protected function casts(): array
    {
        return [
            'installed_at' => 'datetime',
        ];
    }
}
