<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TenantBillingStatus extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'status',
        'grace_ends_at',
        'restricted_at',
        'suspended_at',
        'reactivated_at',
    ];

    protected function casts(): array
    {
        return [
            'grace_ends_at' => 'datetime',
            'restricted_at' => 'datetime',
            'suspended_at' => 'datetime',
            'reactivated_at' => 'datetime',
        ];
    }
}
