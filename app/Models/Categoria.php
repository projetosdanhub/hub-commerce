<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    use HasFactory;

    protected $fillable = [
        'nome',
        'slug',
        'descricao',
        'ativo',
    ];

    /**
     * Uma categoria possui vários Produtos
     */
    public function produtos()
    {
        return $this->hasMany(Produto::class, 'categoria_id');
    }
}