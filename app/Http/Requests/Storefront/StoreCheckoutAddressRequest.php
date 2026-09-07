<?php

namespace App\Http\Requests\Storefront;

use Illuminate\Foundation\Http\FormRequest;

class StoreCheckoutAddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'label' => ['nullable', 'string', 'max:80'],
            'cep' => ['required', 'string', 'max:9'],
            'rua' => ['required', 'string', 'max:255'],
            'numero' => ['required', 'string', 'max:32'],
            'complemento' => ['nullable', 'string', 'max:255'],
            'referencia' => ['nullable', 'string', 'max:255'],
            'bairro' => ['required', 'string', 'max:120'],
            'cidade' => ['required', 'string', 'max:120'],
            'uf' => ['required', 'string', 'size:2'],
            'is_default' => ['sometimes', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'cep' => trim((string) $this->input('cep', '')),
            'rua' => trim((string) $this->input('rua', '')),
            'numero' => trim((string) $this->input('numero', '')),
            'bairro' => trim((string) $this->input('bairro', '')),
            'cidade' => trim((string) $this->input('cidade', '')),
            'uf' => mb_strtoupper(trim((string) $this->input('uf', ''))),
        ]);
    }
}
