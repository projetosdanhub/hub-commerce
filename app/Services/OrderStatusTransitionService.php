<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderHistory;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class OrderStatusTransitionService
{
    public function assertCanTransition(Order $order, OrderStatus $target): void
    {
        $current = $this->currentStatus($order);

        if ($current === null || ! $current->canTransitionTo($target)) {
            throw ValidationException::withMessages([
                'status' => sprintf(
                    'A transição de %s para %s não é permitida.',
                    $current?->value ?? (string) $order->getRawOriginal('status'),
                    $target->value,
                ),
            ]);
        }
    }

    public function transition(Order $order, OrderStatus $target, string $event): Order
    {
        $pendingAttributes = $order->getDirty();
        unset($pendingAttributes['status'], $pendingAttributes['tenant_id'], $pendingAttributes['id']);

        return DB::transaction(function () use ($order, $target, $event, $pendingAttributes): Order {
            $lockedOrder = Order::query()
                ->whereKey($order->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            $this->assertCanTransition($lockedOrder, $target);

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

    private function currentStatus(Order $order): ?OrderStatus
    {
        return $order->status instanceof OrderStatus
            ? $order->status
            : OrderStatus::tryFrom((string) $order->getRawOriginal('status'));
    }
}
