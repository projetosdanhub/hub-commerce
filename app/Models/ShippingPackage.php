<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShippingPackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'nome',
        'altura',
        'largura',
        'comprimento',
        'peso_vazio',
        'is_default'
    ];

    protected function casts(): array
    {
        return [
            'altura'      => 'decimal:2',
            'largura'     => 'decimal:2',
            'comprimento' => 'decimal:2',
            'peso_vazio'  => 'decimal:3',
            'is_default'  => 'boolean'
        ];
    }
}