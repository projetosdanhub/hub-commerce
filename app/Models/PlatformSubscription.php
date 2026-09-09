<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlatformSubscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'platform_plan_id',
        'status',
        'billing_provider',
        'external_id',
        'current_period_ends_at',
        'canceled_at',
    ];

    protected function casts(): array
    {
        return [
            'current_period_ends_at' => 'datetime',
            'canceled_at' => 'datetime',
        ];
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(PlatformPlan::class, 'platform_plan_id');
    }
}
