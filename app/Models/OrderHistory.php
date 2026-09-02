<?php

namespace App\Models;

use App\Domain\Tenancy\Concerns\BelongsToTenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderHistory extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'order_id',
        'event'
    ];

    public function order() {
        return $this->belongsTo(Order::class, 'order_id');
    }
}