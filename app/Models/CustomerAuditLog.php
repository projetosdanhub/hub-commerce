<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomerAuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'cliente_id',
        'acao',
        'detalhes',
        'admin_id',
    ];

    public function cliente()
    {
        return $this->belongsTo(User::class, 'cliente_id');
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}