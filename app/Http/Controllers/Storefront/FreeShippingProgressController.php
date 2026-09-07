<?php

namespace App\Http\Controllers\Storefront;

use App\Domain\Orders\CheckoutPricingService;
use App\Domain\Shipping\ShippingBenefitRuleType;
use App\Http\Controllers\Controller;
use App\Models\ShippingBenefitRule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FreeShippingProgressController extends Controller
{
    public function store(Request $request, CheckoutPricingService $pricing): JsonResponse
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1', 'max:100'],
            'items.*.id' => ['required', 'integer'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:999'],
        ]);

        $priced = $pricing->priceItems($data['items']);
        $subtotalCents = $priced['product_subtotal_cents'];
        $productsEligible = collect($priced['items'])
            ->every(static fn (array $item): bool => $item['product']->frete_gratis === true);

        if ($productsEligible) {
            return response()->json([
                'data' => [
                    'status' => 'PRODUCTS_ELIGIBLE',
                    'minimum_order_cents' => null,
                    'product_subtotal_cents' => $subtotalCents,
                    'remaining_cents' => 0,
                    'progress_percent' => 100,
                ],
            ]);
        }

        $minimumOrderCents = ShippingBenefitRule::query()
            ->where('type', ShippingBenefitRuleType::FREE_ABOVE_SUBTOTAL)
            ->where('is_active', true)
            ->orderBy('priority')
            ->value('minimum_order_cents');

        if ($minimumOrderCents === null) {
            return response()->json([
                'data' => [
                    'status' => 'NOT_CONFIGURED',
                    'minimum_order_cents' => null,
                    'product_subtotal_cents' => $subtotalCents,
                    'remaining_cents' => null,
                    'progress_percent' => null,
                ],
            ]);
        }

        $minimumOrderCents = (int) $minimumOrderCents;
        $remainingCents = max(0, $minimumOrderCents - $subtotalCents);
        $progressPercent = min(100, (int) floor(($subtotalCents / $minimumOrderCents) * 100));

        return response()->json([
            'data' => [
                'status' => $remainingCents === 0 ? 'THRESHOLD_REACHED' : 'THRESHOLD_IN_PROGRESS',
                'minimum_order_cents' => $minimumOrderCents,
                'product_subtotal_cents' => $subtotalCents,
                'remaining_cents' => $remainingCents,
                'progress_percent' => $progressPercent,
            ],
        ]);
    }
}
