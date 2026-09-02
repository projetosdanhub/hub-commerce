<?php

namespace App\Models;

use App\Domain\Tenancy\Concerns\BelongsToTenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'user_id',
        'titulo',
        'cep',
        'rua',         // Antes era logradouro
        'num',         // Antes era numero
        'complemento',
        'referencia',  // Adicionado para bater com o CRM
        'bairro',
        'cidade',
        'uf',          // Antes era estado
        'padrao',      // Antes era principal
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}