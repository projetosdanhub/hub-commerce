<?php

namespace App\Models;

use App\Domain\Tenancy\Concerns\BelongsToTenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'nome',
        'slug',
        'descricao',
        'ativo',
        'img',      // 🟢 Adicionado
        'status',   // 🟢 Adicionado
    ];

    /**
     * Uma categoria possui vários Produtos
     */
    public function produtos()
    {
        return $this->hasMany(Produto::class, 'categoria_id');
    }
}