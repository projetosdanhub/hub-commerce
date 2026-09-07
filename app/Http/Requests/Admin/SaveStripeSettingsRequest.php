<?php

namespace App\Http\Requests\Admin;

use App\Domain\Payments\StripeGatewayConfiguration;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveStripeSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'active_environment' => ['required', 'string', Rule::in([
                StripeGatewayConfiguration::SANDBOX,
                StripeGatewayConfiguration::PRODUCTION,
            ])],
            'sandbox_publishable_key' => ['nullable', 'string', 'max:255', 'regex:/^pk_test_[A-Za-z0-9_]+$/'],
            'sandbox_secret_key' => ['nullable', 'string', 'max:255', 'regex:/^sk_test_[A-Za-z0-9_]+$/'],
            'sandbox_webhook_secret' => ['nullable', 'string', 'max:255', 'regex:/^whsec_[A-Za-z0-9_]+$/'],
            'production_publishable_key' => ['nullable', 'string', 'max:255', 'regex:/^pk_live_[A-Za-z0-9_]+$/'],
            'production_secret_key' => ['nullable', 'string', 'max:255', 'regex:/^sk_live_[A-Za-z0-9_]+$/'],
            'production_webhook_secret' => ['nullable', 'string', 'max:255', 'regex:/^whsec_[A-Za-z0-9_]+$/'],
        ];
    }
}
