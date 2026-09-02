<?php

namespace App\Models;

use App\Domain\Tenancy\Concerns\BelongsToTenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Carrier extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'nome',
        'tempo_entrega',
        'status',
        'imagem',
        // 🟢 Novos campos de endereço adicionados
        'cep',
        'rua',
        'numero',
        'complemento',
        'bairro',
        'cidade',
        'uf',
        'referencia',
        // 🟢 Novos campos de status e detalhamento
        'status_reason',
        'vehicle_plate',
        'vehicle_model',
        'vehicle_type',
        'document_rg_front',
        'document_rg_back',
        'document_cnh'
    ];

    public function orders()
    {
        return $this->hasMany(Order::class, 'carrier_id');
    }
}