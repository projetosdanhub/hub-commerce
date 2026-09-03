<?php

namespace App\Http\Requests\Identity;

use Illuminate\Foundation\Http\FormRequest;

final class AssignRolesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'role_ids' => ['present', 'array', 'max:20'],
            'role_ids.*' => ['integer', 'distinct', 'min:1'],
        ];
    }
}
