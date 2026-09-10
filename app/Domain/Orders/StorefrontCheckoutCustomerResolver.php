<?php

namespace App\Domain\Orders;

use App\Models\StorefrontCustomer;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

final class StorefrontCheckoutCustomerResolver
{
    public function resolve(Request $request): StorefrontCustomer
    {
        $accessToken = PersonalAccessToken::findToken((string) $request->bearerToken());

        if (
            $accessToken === null
            || $accessToken->tokenable_type !== StorefrontCustomer::class
            || ! $accessToken->can('storefront.checkout')
        ) {
            abort(403);
        }

        $customer = StorefrontCustomer::query()->find($accessToken->tokenable_id);

        if ($customer === null || ! $customer->isActive()) {
            abort(403);
        }

        return $customer;
    }
}
