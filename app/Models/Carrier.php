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
        'imagem',
        // 🟢 Novos campos de endereço adicionados
        'cep',
        'rua',
        'numero',
        'complemento',
        'bairro',
        'cidade',
        'uf',
        'referencia'
    ];

    public function orders()
    {
        return $this->hasMany(Order::class, 'carrier_id');
    }
}