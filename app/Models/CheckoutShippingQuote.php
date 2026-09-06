<?php

namespace App\Models;

use App\Domain\Tenancy\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class CheckoutShippingQuote extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'token',
        'cart_fingerprint',
        'destination_fingerprint',
        'provider',
        'service_code',
        'carrier_id',
        'shipping_cents',
        'estimated_delivery_days',
        'provider_metadata',
        'expires_at',
        'invalidated_at',
    ];

    protected function casts(): array
    {
        return [
            'carrier_id' => 'integer',
            'shipping_cents' => 'integer',
            'estimated_delivery_days' => 'integer',
            'provider_metadata' => 'array',
            'expires_at' => 'datetime',
            'invalidated_at' => 'datetime',
        ];
    }
}
