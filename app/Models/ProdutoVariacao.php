<?php

namespace App\Models;

use App\Domain\Tenancy\Concerns\BelongsToTenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProdutoVariacao extends Model
{
    use HasFactory, BelongsToTenant;

    protected $table = 'produto_variacoes';
    protected $guarded = ['id'];

    public function produto()
    {
        return $this->belongsTo(Produto::class, 'produto_id');
    }
}