<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Domain\Tenancy\Concerns\BelongsToTenant;

class InventoryTransaction extends Model
{
    use HasFactory, BelongsToTenant;

    public const TIPO_RESERVA = 'RESERVA';
    public const TIPO_VENDA = 'VENDA';
    public const TIPO_ESTORNO = 'ESTORNO';
    public const TIPO_AJUSTE = 'AJUSTE';

    protected $fillable = [
        'tenant_id',
        'produto_id',
        'variacao_id',
        'quantidade',
        'tipo',
        'reference_id',
        'reference_type',
    ];

    public function produto()
    {
        return $this->belongsTo(Produto::class);
    }

    public function variacao()
    {
        return $this->belongsTo(ProdutoVariacao::class);
    }
}
