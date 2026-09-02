<?php

namespace App\Models;

use App\Domain\Tenancy\Concerns\BelongsToTenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cupom extends Model
{
    use HasFactory, BelongsToTenant;

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