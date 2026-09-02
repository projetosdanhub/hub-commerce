<?php

namespace App\Models;

use App\Domain\Tenancy\Concerns\BelongsToTenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CarrierAuditLog extends Model
{
    use HasFactory, BelongsToTenant;

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
