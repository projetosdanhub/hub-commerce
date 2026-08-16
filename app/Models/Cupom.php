<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cupom extends Model
{
    use HasFactory;

    protected $fillable = [
        'codigo',
        'tipo',
        'valor_desconto',
        'limite_uso',
        'vezes_usado',
        'data_validade',
        'ativo',
    ];
}