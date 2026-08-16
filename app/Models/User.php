<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Atributos preenchíveis em massa.
     */
    protected $fillable = [
        'name',
        'email',
        'avatar',     // <--- ADICIONADO AQUI
        'password',
        'role',       
        'telefone',
        'cpf',
        'nascimento',
        'sexo',       
        'origem',     
        'tags',       
        'status',
        'notas',
        'coins',
        'cashback',
    ];
    /**
     * Atributos ocultos.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Casts de tipos.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'tags' => 'array', // <--- A MÁGICA ESTÁ AQUI (Transforma JSON do banco em Lista no React)
        ];
    }

    // ==========================================
    // MÉTODOS DE SEGURANÇA (VERIFICAÇÃO DE ROLE)
    // ==========================================
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isCliente()
    {
        return $this->role === 'cliente';
    }

    // ==========================================
    // RELACIONAMENTOS DO BANCO DE DADOS
    // ==========================================
    public function addresses()
    {
        return $this->hasMany(Address::class, 'user_id');
    }

    public function auditLogs()
    {
        return $this->hasMany(CustomerAuditLog::class, 'cliente_id');
    }

    public function walletTransactions()
    {
        return $this->hasMany(WalletTransaction::class, 'user_id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'user_id');
    }

    public function pedidos()
    {
        return $this->hasMany(Order::class, 'user_id');
    }
}