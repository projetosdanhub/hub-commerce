<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CarrierAuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'admin_id',
        'acao',
        'detalhes'
    ];

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
