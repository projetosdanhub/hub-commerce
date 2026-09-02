<?php

namespace App\Models;

use App\Domain\Tenancy\Concerns\BelongsToTenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrackingRule extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'name',            // Nome interno criado por você (ex: 'Lead Promoção')
        'target_event',    // Evento oficial do Pixel (ex: 'Lead', 'CustomEvent')
        'conditions',      // Regras de Gatilho e URL Alvo (JSON)
        'transformations', // Payload Enriquecido / CAPI Builder (JSON)
        'priority',        // Ordem de execução (Padrão: 0)
        'is_active'        // Regra Ativa ou Pausada
    ];

    /**
     * Blindagem de Tipos (Cast)
     * Garante que conditions e transformations cheguem como Array no Controller.
     */
    protected function casts(): array
    {
        return [
            'conditions'      => 'array',
            'transformations' => 'array',
            'is_active'       => 'boolean',
            'priority'        => 'integer',
        ];
    }
}