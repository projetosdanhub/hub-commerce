<?php

namespace App\Models;

use App\Domain\Tenancy\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StorefrontCustomerAddress extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'storefront_customer_id',
        'label',
        'cep',
        'rua',
        'numero',
        'complemento',
        'referencia',
        'bairro',
        'cidade',
        'uf',
        'is_default',
    ];

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(StorefrontCustomer::class, 'storefront_customer_id');
    }
}
