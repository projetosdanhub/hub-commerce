<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrackingLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id',   // ID da Sessão do Usuário
        'anonymous_id', // ID Anônimo do Navegador
        'user_id',      // ID do Cliente logado (Se existir)
        'event_name',   // O Nome Canônico do Evento (ex: 'PageView', 'AddToCart')
        'url',          // A URL onde o evento ocorreu
        'payload',      // Todos os dados do evento, produtos, valores (JSON)
        'ip_address',   // IP real do usuário para nota de qualidade CAPI
        'user_agent'    // Navegador e Sistema Operativo
    ];

    /**
     * Blindagem de Tipos (Cast)
     */
    protected function casts(): array
    {
        return [
            'payload' => 'array',
        ];
    }

    // ==========================================
    // RELACIONAMENTOS
    // ==========================================
    
    // Um Log PODE pertencer a um Cliente cadastrado
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}