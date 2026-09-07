<?php

namespace App\Http\Requests\Storefront;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutSummaryRequest extends FormRequest
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
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'integer', 'min:1'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:999'],
            'address' => ['required', 'array'],
            'address.cep' => ['required', 'string', 'max:9'],
            'address.rua' => ['required', 'string', 'max:255'],
            'address.numero' => ['required', 'string', 'max:32'],
            'address.complemento' => ['nullable', 'string', 'max:255'],
            'address.bairro' => ['required', 'string', 'max:120'],
            'address.cidade' => ['required', 'string', 'max:120'],
            'address.uf' => ['required', 'string', 'size:2'],
            'shipping_quote_token' => ['required', 'uuid'],
        ];
    }
}
