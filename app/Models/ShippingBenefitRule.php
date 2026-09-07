<?php

namespace App\Models;

use App\Domain\Tenancy\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShippingBenefitRule extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'type',
        'product_id',
        'percentage',
        'minimum_order_cents',
        'priority',
        'is_active',
        'starts_at',
        'ends_at',
    ];

    protected function casts(): array
    {
        return [
            'product_id' => 'integer',
            'percentage' => 'integer',
            'minimum_order_cents' => 'integer',
            'priority' => 'integer',
            'is_active' => 'boolean',
            'starts_at' => 'immutable_datetime',
            'ends_at' => 'immutable_datetime',
        ];
    }

    /**
     * @return BelongsTo<Produto, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Produto::class, 'product_id');
    }
}
