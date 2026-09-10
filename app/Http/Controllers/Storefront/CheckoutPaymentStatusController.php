<?php

namespace App\Http\Controllers\Storefront;

use App\Domain\Orders\StorefrontCheckoutCustomerResolver;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PaymentAttempt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class CheckoutPaymentStatusController extends Controller
{
    public function show(
        Request $request,
        int $id,
        StorefrontCheckoutCustomerResolver $customers,
    ): JsonResponse {
        $customer = $customers->resolve($request);
        $order = Order::query()
            ->whereKey($id)
            ->where('storefront_customer_id', $customer->getKey())
            ->firstOrFail();
        $attempt = PaymentAttempt::query()
            ->where('order_id', $order->getKey())
            ->where('gateway', 'stripe')
            ->latest('id')
            ->firstOrFail();

        return response()->json([
            'data' => [
                'order_id' => (int) $order->getKey(),
                'order_status' => $order->status->value,
                'payment_status' => $attempt->status->value,
            ],
        ])->header('Cache-Control', 'no-store, private');
    }
}
