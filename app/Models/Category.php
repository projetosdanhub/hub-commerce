<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = ['nome', 'status'];

    // Isto injeta um dado "falso" de contagem para o React não quebrar 
    // até criarmos a tabela de Produtos reais.
    protected $appends = ['qtd_produtos'];

    public function getQtdProdutosAttribute()
    {
        return 0; // Futuramente será: $this->products()->count();
    }
}