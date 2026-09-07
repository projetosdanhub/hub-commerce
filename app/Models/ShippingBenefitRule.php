<?php

namespace App\Models;

use App\Domain\Tenancy\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShippingBenefitRule extends Model
{
    use BelongsToTenant;

    public const FREE_FOR_ALL = 'FREE_FOR_ALL';
    public const FREE_FOR_PRODUCT = 'FREE_FOR_PRODUCT';
    public const PERCENTAGE = 'PERCENTAGE';

    protected $fillable = [
        'type',
        'product_id',
        'percentage',
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
