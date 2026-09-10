<?php

namespace App\Models;

use App\Domain\Tenancy\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class StripeWebhookEvent extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'event_id',
        'type',
        'environment',
        'payload_hash',
        'received_at',
        'processed_at',
    ];

    protected function casts(): array
    {
        return [
            'received_at' => 'datetime',
            'processed_at' => 'datetime',
        ];
    }
}
