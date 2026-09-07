<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Produto;
use App\Models\ShippingBenefitRule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ProductFreeShippingController extends Controller
{
    public function show(): JsonResponse
    {
        $threshold = ShippingBenefitRule::query()
            ->where('type', ShippingBenefitRule::FREE_ABOVE_SUBTOTAL)
            ->where('is_active', true)
            ->orderBy('priority')
            ->value('minimum_order_cents');

        return response()->json([
            'product_ids' => Produto::query()->where('frete_gratis', true)->pluck('id')->map(static fn ($id): int => (int) $id)->values(),
            'minimum_order_cents' => $threshold === null ? null : (int) $threshold,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_ids' => ['present', 'array', 'max:500'],
            'product_ids.*' => [
                'integer',
                Rule::exists('produtos', 'id')->where(fn ($query) => $query->where('tenant_id', tenant()->id)),
            ],
            'minimum_order_cents' => ['nullable', 'integer', 'min:1', 'max:999999999'],
        ]);

        DB::transaction(function () use ($data): void {
            Produto::query()->update(['frete_gratis' => false]);

            if ($data['product_ids'] !== []) {
                Produto::query()->whereIn('id', $data['product_ids'])->update(['frete_gratis' => true]);
            }

            ShippingBenefitRule::query()
                ->where('type', ShippingBenefitRule::FREE_ABOVE_SUBTOTAL)
                ->update(['is_active' => false]);

            if ($data['minimum_order_cents'] !== null) {
                ShippingBenefitRule::query()->create([
                    'type' => ShippingBenefitRule::FREE_ABOVE_SUBTOTAL,
                    'minimum_order_cents' => $data['minimum_order_cents'],
                    'priority' => 50,
                    'is_active' => true,
                ]);
            }
        });

        return $this->show();
    }
}
