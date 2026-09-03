<?php

namespace App\Http\Resources\Admin;

use App\Enums\ProductStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class AdminProductResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'categoria_id' => $this->categoria_id,
            'categoria' => $this->whenLoaded('categoria', fn () => [
                'id' => $this->categoria?->id,
                'nome' => $this->categoria?->nome,
                'slug' => $this->categoria?->slug,
            ]),
            'nome' => $this->nome,
            'slug' => $this->slug,
            'descricao' => $this->descricao,
            'preco' => $this->preco,
            'preco_promo' => $this->preco_promo,
            'quantidade_estoque' => $this->quantidade_estoque,
            'status_vitrine' => $this->statusValue(),
            'ativo' => (bool) $this->ativo,
            'destaque' => (bool) $this->destaque,
            'sku_ref' => $this->sku_ref,
            'sku_sufixo' => $this->sku_sufixo,
            'quick_view' => $this->quick_view,
            'controlar_estoque' => (bool) $this->controlar_estoque,
            'alerta_estoque' => $this->alerta_estoque,
            'alerta_moderado' => $this->alerta_moderado,
            'alerta_alto' => $this->alerta_alto,
            'pre_venda' => (bool) $this->pre_venda,
            'prep_tempo' => $this->prep_tempo,
            'prep_unidade' => $this->prep_unidade,
            'personalizado' => (bool) $this->personalizado,
            'custom_tipo' => $this->custom_tipo,
            'frete_gratis' => (bool) $this->frete_gratis,
            'badges' => $this->badges ?? [],
            'ficha_tecnica' => $this->ficha_tecnica ?? [],
            'categorias_secundarias' => $this->categorias_secundarias ?? [],
            'galeria' => collect($this->galeria ?? [])->map(fn ($path) => $this->assetUrl($path))->all(),
            'img' => $this->assetUrl($this->img),
            'video' => $this->assetUrl($this->video),
            'agrupavel' => (bool) $this->agrupavel,
            'peso' => $this->peso,
            'altura' => $this->altura,
            'largura' => $this->largura,
            'comprimento' => $this->comprimento,
            'ncm' => $this->ncm,
            'cest' => $this->cest,
            'gtin' => $this->gtin,
            'origem' => $this->origem,
            'csosn' => $this->csosn,
            'cst' => $this->cst,
            'cfop_dentro' => $this->cfop_dentro,
            'cfop_fora' => $this->cfop_fora,
            'unidade_medida' => $this->unidade_medida,
            'icms_perc' => $this->icms_perc,
            'ipi_perc' => $this->ipi_perc,
            'meta_title' => $this->meta_title,
            'meta_desc' => $this->meta_desc,
            'variacoes' => $this->whenLoaded('variacoes', fn () => $this->variacoes->map(fn ($variation) => [
                'id' => $variation->id,
                'tipo' => $variation->tipo,
                'nome' => $variation->nome,
                'sku' => $variation->sku,
                'estoque' => (int) $variation->estoque,
                'img' => $this->assetUrl($variation->img),
            ])->values()),
        ];
    }

    private function statusValue(): string
    {
        return $this->status_vitrine instanceof ProductStatus
            ? $this->status_vitrine->value
            : (string) $this->status_vitrine;
    }

    private function assetUrl(?string $path): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }

        return Str::startsWith($path, ['http://', 'https://']) ? $path : asset($path);
    }
}
