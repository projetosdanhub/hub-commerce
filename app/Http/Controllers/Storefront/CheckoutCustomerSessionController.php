<?php

namespace App\Http\Controllers\Storefront;

use App\Domain\Storefront\CheckoutCustomerAccessService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Storefront\CreateCheckoutCustomerSessionRequest;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\JsonResponse;

class CheckoutCustomerSessionController extends Controller
{
    public function store(
        CreateCheckoutCustomerSessionRequest $request,
        CheckoutCustomerAccessService $customerAccess,
    ): JsonResponse {
        try {
            $customer = $customerAccess->createOrAuthenticate($request->validated());
        } catch (AuthenticationException) {
            return response()->json([
                'code' => 'CHECKOUT_ACCOUNT_NOT_AVAILABLE',
                'message' => 'Não foi possível validar a conta. Confira a senha ou recupere o acesso.',
            ], 422);
        }

        $createdToken = $customer->createToken(
            'storefront_checkout',
            ['storefront.checkout'],
            now()->addHour(),
        );

        return response()->json([
            'data' => [
                'token' => $createdToken->plainTextToken,
                'customer' => [
                    'name' => $customer->name,
                    'email' => $customer->email,
                ],
            ],
        ], $customer->wasRecentlyCreated ? 201 : 200)->header('Cache-Control', 'no-store, private');
    }
}
