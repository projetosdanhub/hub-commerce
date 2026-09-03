<?php

namespace App\Http\Requests\Admin;

use App\Models\Categoria;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        // A autorização tenant-scoped é exigida pela rota.
        return true;
    }

    protected function prepareForValidation(): void
    {
        $attributes = [];

        if ($this->has('nome')) {
            $attributes['nome'] = trim((string) $this->input('nome'));
        }

        if ($this->has('status')) {
            $attributes['status'] = strtoupper((string) $this->input('status'));
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
        return [
            'nome' => ['required', 'string', 'max:120'],
            'descricao' => ['nullable', 'string', 'max:5000'],
            'status' => ['required', 'string', Rule::in([Categoria::STATUS_ATIVO, Categoria::STATUS_INATIVO])],
            'img' => ['nullable', 'file', 'mimes:jpeg,png,webp', 'max:4096'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'img.max' => 'A imagem não pode ultrapassar 4MB.',
            'img.mimes' => 'A imagem deve ser JPG, PNG ou WEBP.',
        ];
    }
}
