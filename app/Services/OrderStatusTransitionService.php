<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderHistory;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class OrderStatusTransitionService
{
    public function transition(Order $order, OrderStatus $target, string $event): Order
    {
        $current = $order->status instanceof OrderStatus
            ? $order->status
            : OrderStatus::tryFrom((string) $order->status);

        if ($current === null || ! $current->canTransitionTo($target)) {
            throw ValidationException::withMessages([
                'status' => sprintf(
                    'A transição de %s para %s não é permitida.',
                    $current?->value ?? (string) $order->status,
                    $target->value,
                ),
            ]);
        }

        $pendingAttributes = $order->getDirty();
        unset($pendingAttributes['status'], $pendingAttributes['tenant_id'], $pendingAttributes['id']);

        return DB::transaction(function () use ($order, $target, $event, $pendingAttributes): Order {
            $lockedOrder = Order::query()
                ->whereKey($order->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            $lockedOrder->fill($pendingAttributes);
            $lockedOrder->status = $target;
            $lockedOrder->save();

            OrderHistory::query()->create([
                'order_id' => $lockedOrder->getKey(),
                'event' => $event,
            ]);

            return $lockedOrder;
        });
    }
}
