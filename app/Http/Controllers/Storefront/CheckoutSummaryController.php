<?php

namespace App\Http\Controllers\Storefront;

use App\Domain\Orders\CheckoutSummaryService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Storefront\CheckoutSummaryRequest;
use DomainException;
use Illuminate\Http\JsonResponse;
use InvalidArgumentException;

class CheckoutSummaryController extends Controller
{
    public function store(
        CheckoutSummaryRequest $request,
        CheckoutSummaryService $checkout,
    ): JsonResponse {
        try {
            return response()->json([
                'data' => $checkout->summarize(
                    $request->validated('items'),
                    $request->validated('address'),
                    $request->validated('shipping_quote_token'),
                ),
            ]);
        } catch (DomainException|InvalidArgumentException) {
            return response()->json([
                'code' => 'CHECKOUT_UNAVAILABLE',
                'message' => 'Revise o carrinho e a entrega antes de continuar.',
            ], 422);
        }
    }
}
