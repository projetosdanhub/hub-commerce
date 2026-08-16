<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Produto extends Model
{
    use HasFactory;

    protected $fillable = [
        'categoria_id',
        'nome',
        'slug',
        'descricao',
        'preco',
        'quantidade_estoque',
        'destaque',
        'ativo',
    ];

    /**
     * Um produto pertence a uma Categoria
     */
    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }
}