<?php

namespace App\Http\Requests\Admin;

use App\Domain\Tenancy\TenantContextStore;
use App\Enums\ProductStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        // A autorização tenant-scoped é exigida pela rota.
        return true;
    }

    protected function prepareForValidation(): void
    {
        $attributes = [];

        foreach (['nome', 'slug', 'sku_ref', 'sku_sufixo'] as $field) {
            if ($this->has($field)) {
                $attributes[$field] = trim((string) $this->input($field));
            }
        }

        if ($this->has('status_vitrine')) {
            $attributes['status_vitrine'] = strtoupper(trim((string) $this->input('status_vitrine')));
        }

        foreach (['preco_promo', 'peso', 'altura', 'largura', 'comprimento', 'icms_perc', 'ipi_perc'] as $field) {
            if ($this->has($field) && $this->input($field) === '') {
                $attributes[$field] = null;
            }
        }

        foreach (['ficha_tecnica', 'badges', 'categorias_secundarias'] as $field) {
            $value = $this->input($field);

            if (is_string($value)) {
                $decoded = json_decode($value, true);

                if (json_last_error() === JSON_ERROR_NONE) {
                    $attributes[$field] = $decoded;
                }
            }
        }

        if ($attributes !== []) {
            $this->merge($attributes);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $tenantId = app(TenantContextStore::class)->require()->tenantId;

        return [
            'id' => ['nullable', 'integer', 'min:1'],
            'categoria_id' => [
                'required',
                'integer',
                Rule::exists('categorias', 'id')->where(
                    fn ($query) => $query->where('tenant_id', $tenantId)
                ),
            ],
            'nome' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'descricao' => ['nullable', 'string', 'max:50000'],
            'preco' => ['required', 'numeric', 'decimal:0,2', 'min:0.01', 'max:99999999.99'],
            'preco_promo' => ['nullable', 'numeric', 'decimal:0,2', 'min:0.01', 'lt:preco'],
            'quantidade_estoque' => ['required', 'integer', 'min:0', 'max:2147483647'],
            'status_vitrine' => ['required', Rule::enum(ProductStatus::class)],
            'sku_ref' => ['nullable', 'string', 'max:100'],
            'sku_sufixo' => ['nullable', 'string', 'max:100'],
            'controlar_estoque' => ['required', 'boolean'],
            'alerta_estoque' => ['nullable', 'integer', 'min:0'],
            'alerta_moderado' => ['nullable', 'integer', 'min:0'],
            'alerta_alto' => ['nullable', 'integer', 'min:0'],
            'pre_venda' => ['required', 'boolean'],
            'ficha_tecnica' => ['nullable', 'array', 'max:100'],
            'ficha_tecnica.*.atributo' => ['required_with:ficha_tecnica', 'string', 'max:120'],
            'ficha_tecnica.*.valor' => ['required_with:ficha_tecnica', 'string', 'max:500'],
            'badges' => ['nullable', 'array', 'max:20'],
            'categorias_secundarias' => ['nullable', 'array', 'max:50'],
            'img' => ['nullable', 'file', 'mimes:jpeg,png,webp', 'max:4096'],
            'video' => ['nullable', 'file', 'mimes:mp4', 'max:12288'],
            'galeria' => ['nullable', 'array', 'max:10'],
            'galeria.*' => ['file', 'mimes:jpeg,png,webp', 'max:4096'],
            'galeria_urls' => ['nullable', 'array', 'max:10'],
            'galeria_urls.*' => ['string', 'max:2048'],
            'variaveis_json' => ['nullable', 'json'],
            'ncm' => ['nullable', 'string', 'max:20'],
            'cest' => ['nullable', 'string', 'max:20'],
            'gtin' => ['nullable', 'string', 'max:32'],
            'origem' => ['nullable', 'string', 'max:10'],
            'csosn' => ['nullable', 'string', 'max:10'],
            'cst' => ['nullable', 'string', 'max:10'],
            'cfop_dentro' => ['nullable', 'string', 'max:10'],
            'cfop_fora' => ['nullable', 'string', 'max:10'],
            'unidade_medida' => ['nullable', 'string', 'max:10'],
            'icms_perc' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'ipi_perc' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'peso' => ['nullable', 'numeric', 'min:0'],
            'altura' => ['nullable', 'numeric', 'min:0'],
            'largura' => ['nullable', 'numeric', 'min:0'],
            'comprimento' => ['nullable', 'numeric', 'min:0'],
            'agrupavel' => ['nullable', 'boolean'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_desc' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'preco.min' => 'O preço deve ser maior que zero.',
            'preco_promo.lt' => 'O preço promocional deve ser menor que o preço de venda.',
            'quantidade_estoque.min' => 'O estoque não pode ser negativo.',
            'status_vitrine.enum' => 'O status informado é inválido.',
            'categoria_id.exists' => 'A categoria não pertence a esta loja.',
            'img.max' => 'A imagem principal não pode ultrapassar 4MB.',
            'video.max' => 'O vídeo não pode ultrapassar 12MB.',
            'galeria.max' => 'A galeria pode ter no máximo 10 imagens.',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function productData(): array
    {
        return $this->safe()->only([
            'categoria_id',
            'nome',
            'slug',
            'descricao',
            'preco',
            'preco_promo',
            'quantidade_estoque',
            'status_vitrine',
            'sku_ref',
            'sku_sufixo',
            'controlar_estoque',
            'alerta_estoque',
            'alerta_moderado',
            'alerta_alto',
            'pre_venda',
            'ficha_tecnica',
            'badges',
            'categorias_secundarias',
            'ncm',
            'cest',
            'gtin',
            'origem',
            'csosn',
            'cst',
            'cfop_dentro',
            'cfop_fora',
            'unidade_medida',
            'icms_perc',
            'ipi_perc',
            'peso',
            'altura',
            'largura',
            'comprimento',
            'agrupavel',
            'meta_title',
            'meta_desc',
        ]);
    }
}
