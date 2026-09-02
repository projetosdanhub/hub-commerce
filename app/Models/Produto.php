<?php

namespace App\Models;

use App\Domain\Tenancy\Concerns\BelongsToTenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Produto extends Model
{
    use HasFactory, BelongsToTenant;

    protected $table = 'produtos';

    protected $fillable = [
        'categoria_id',
        'nome',
        'slug',
        'descricao',
        'preco',
        'preco_promo',
        'quantidade_estoque',
        'destaque',
        'ativo',
        'status_vitrine',
        'sku_ref',
        'sku_sufixo',
        'quick_view',
        'controlar_estoque',
        'alerta_estoque',
        'alerta_moderado',
        'alerta_alto',
        'pre_venda',
        'prep_tempo',
        'prep_unidade',
        'personalizado',
        'custom_tipo',
        'frete_gratis',
        'badges',
        'ficha_tecnica',
        'categorias_secundarias',
        'galeria',
        'img',
        'video',
        'agrupavel',
        'peso',
        'altura',
        'largura',
        'comprimento',
        'ncm',
        'cest',
        'origem',
        'csosn',
        'cfop_dentro',
        'cfop_fora',
        'gtin',
        'cst',
        'cfop',
        'unidade',
        'unidade_medida',
        'icms_perc',
        'ipi_perc',
        'meta_title',
        'meta_desc',
    ];

    protected function casts(): array
    {
        return [
            'categoria_id' => 'integer',
            'preco' => 'decimal:2',
            'preco_promo' => 'decimal:2',
            'quantidade_estoque' => 'integer',
            'destaque' => 'boolean',
            'ativo' => 'boolean',
            'controlar_estoque' => 'boolean',
            'alerta_estoque' => 'integer',
            'alerta_moderado' => 'integer',
            'alerta_alto' => 'integer',
            'pre_venda' => 'boolean',
            'prep_tempo' => 'integer',
            'personalizado' => 'boolean',
            'frete_gratis' => 'boolean',
            'agrupavel' => 'boolean',
            'peso' => 'decimal:3',
            'altura' => 'decimal:2',
            'largura' => 'decimal:2',
            'comprimento' => 'decimal:2',
            'icms_perc' => 'decimal:2',
            'ipi_perc' => 'decimal:2',
            'badges' => 'array',
            'ficha_tecnica' => 'array',
            'categorias_secundarias' => 'array',
            'galeria' => 'array',
        ];
    }

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }

    public function variacoes(): HasMany
    {
        return $this->hasMany(ProdutoVariacao::class, 'produto_id');
    }
}
