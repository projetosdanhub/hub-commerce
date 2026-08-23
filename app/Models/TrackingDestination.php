<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrackingDestination extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider',    // Ex: 'global', 'meta', 'tiktok'
        'name',        // Ex: 'Cofre Principal'
        'credentials', // Guarda os Tokens, Pixels IDs, Measurement IDs (JSON)
        'settings',    // Guarda os Switches de Eventos Nativos (JSON)
        'is_active'    // Status geral
    ];

    /**
     * Blindagem de Tipos (Cast)
     * Converte o JSON do banco de dados em Arrays do PHP automaticamente.
     */
    protected function casts(): array
    {
        return [
            'credentials' => 'array',
            'settings'    => 'array',
            'is_active'   => 'boolean',
        ];
    }
}