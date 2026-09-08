<?php

namespace App\Models;

use App\Domain\Tenancy\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItemCustomizationMedia extends Model
{
    use BelongsToTenant, HasFactory;

    protected $fillable = ['order_item_id', 'original_name', 'storage_path', 'mime_type', 'byte_size'];

    protected function casts(): array
    {
        return ['byte_size' => 'integer'];
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class, 'order_item_id');
    }
}
