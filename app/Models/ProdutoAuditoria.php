<?php

namespace App\Models;

use App\Domain\Tenancy\Concerns\BelongsToTenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProdutoAuditoria extends Model
{
    use HasFactory, BelongsToTenant;

    protected $table = 'produto_auditorias';

    protected $fillable = [
        'produto_id',
        'admin_id',
        'acao',
        'entidade',
        'detalhes',
    ];

    public function produto()
    {
        return $this->belongsTo(Produto::class, 'produto_id');
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
