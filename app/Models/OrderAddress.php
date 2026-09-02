<?php

namespace App\Models;

use App\Domain\Tenancy\Concerns\BelongsToTenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderAddress extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'order_id',
        'cep',
        'rua',          // Era logradouro
        'num',          // Era numero
        'complemento',
        'referencia',
        'bairro',
        'cidade',
        'uf',           // Era estado
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}