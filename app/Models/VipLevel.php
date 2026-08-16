<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VipLevel extends Model
{
    use HasFactory;

    protected $fillable = [
        'nome',
        'is_default',
        'gasto_requisito',
        'compras_requisito',
        'mult_coins',
        'desc_frete',
        'desc_produtos',
        'acumula_frete',
        'frequencia_uso',
        'limite_uso',
        'imagem'
    ];

    /**
     * Casts de tipos.
     * Garante que o JSON enviado para o React tenha os tipos exatos (Booleanos, Inteiros e Decimais)
     */
    protected function casts(): array
    {
        return [
            'is_default'        => 'boolean',
            'acumula_frete'     => 'boolean',
            'gasto_requisito'   => 'decimal:2',
            'mult_coins'        => 'decimal:2',
            'desc_frete'        => 'decimal:2',
            'desc_produtos'     => 'decimal:2',
            'compras_requisito' => 'integer',
            'limite_uso'        => 'integer',
        ];
    }
}