<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Carrier extends Model
{
    use HasFactory;

    protected $fillable = [
        'nome',
        'tempo_entrega',
        'status',
        'imagem'
    ];

    // 1 Transportadora TEM MUITOS Pedidos
    public function orders()
    {
        return $this->hasMany(Order::class, 'carrier_id');
    }
}