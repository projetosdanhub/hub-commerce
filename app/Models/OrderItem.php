<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'sku',
        'variation_sku',
        'product_name',
        'short_description', // Breve descrição do produto
        'variation_name',
        'quantity',
        'price',
        'product_image',
        'customization'      // Textos ou Imagens de personalização (JSON)
    ];

    protected function casts(): array
    {
        return [
            'quantity'      => 'integer',
            'price'         => 'decimal:2',
            'customization' => 'array', // Converte JSON para Objeto no React
        ];
    }

    // Este Item PERTENCE a 1 Pedido
    public function order() {
        return $this->belongsTo(Order::class, 'order_id');
    }
}