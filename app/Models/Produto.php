<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Produto extends Model
{
    use HasFactory;

    protected $guarded = ['id']; // Libera todos os campos para mass assignment

    protected function casts(): array
    {
        return [
            'preco' => 'decimal:2',
            'preco_promo' => 'decimal:2',
            'peso' => 'decimal:3',
            'altura' => 'decimal:2',
            'largura' => 'decimal:2',
            'comprimento' => 'decimal:2',
            'controlar_estoque' => 'boolean',
            'pre_venda' => 'boolean',
            'personalizado' => 'boolean',
            'frete_gratis' => 'boolean',
            'agrupavel' => 'boolean',
            'badges' => 'array',
            'ficha_tecnica' => 'array',
            'categorias_secundarias' => 'array',
            'galeria' => 'array',
        ];
    }

    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }

    public function variacoes()
    {
        return $this->hasMany(ProdutoVariacao::class, 'produto_id');
    }
}