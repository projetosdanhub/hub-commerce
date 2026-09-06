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

    public function transition(
        Order $order,
        OrderStatus $target,
        string $event,
        ?\Closure $afterLock = null,
    ): Order
    {
        $pendingAttributes = $this->pendingAttributes($order);

        return DB::transaction(function () use ($afterLock, $order, $target, $event, $pendingAttributes): Order {
            $lockedOrder = Order::query()
                ->whereKey($order->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            $this->assertCanTransition($lockedOrder, $target);

            if ($target === OrderStatus::REFUND_REVIEW) {
                $lockedOrder->refund_previous_status = $this->currentStatus($lockedOrder);
            }

            $lockedOrder->fill($pendingAttributes);

            if ($afterLock !== null) {
                $afterLock($lockedOrder);
            }

            $lockedOrder->status = $target;
            $lockedOrder->save();

            OrderHistory::query()->create([
                'order_id' => $lockedOrder->getKey(),
                'event' => $event,
            ]);

            return $lockedOrder;
        });
    }

    public function cancelRefund(Order $order, string $event): Order
    {
        return DB::transaction(function () use ($order, $event): Order {
            $lockedOrder = Order::query()
                ->whereKey($order->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            if ($this->currentStatus($lockedOrder) !== OrderStatus::REFUND_REVIEW) {
                throw ValidationException::withMessages([
                    'status' => 'Somente um reembolso em análise pode ser cancelado.',
                ]);
            }

            $previousStatus = $lockedOrder->refund_previous_status;

            if (! $previousStatus instanceof OrderStatus || $previousStatus === OrderStatus::REFUND_REVIEW) {
                throw ValidationException::withMessages([
                    'status' => 'A etapa anterior do pedido não está disponível para restauração segura.',
                ]);
            }

            $lockedOrder->status = $previousStatus;
            $lockedOrder->refund_previous_status = null;
            $lockedOrder->save();

            OrderHistory::query()->create([
                'order_id' => $lockedOrder->getKey(),
                'event' => $event,
            ]);

            return $lockedOrder;
        });
    }

    private function pendingAttributes(Order $order): array
    {
        $pendingAttributes = $order->getDirty();
        unset($pendingAttributes['status'], $pendingAttributes['tenant_id'], $pendingAttributes['id']);

        foreach ($pendingAttributes as $attribute => $value) {
            $cast = $order->getCasts()[$attribute] ?? null;

            if (
                is_string($value)
                && in_array($cast, ['array', 'json', 'object', 'collection'], true)
            ) {
                $decoded = json_decode($value, true);

                if (json_last_error() === JSON_ERROR_NONE) {
                    $pendingAttributes[$attribute] = $decoded;
                }
            }
        }

        return $pendingAttributes;
    }

    private function currentStatus(Order $order): ?OrderStatus
    {
        return $order->status instanceof OrderStatus
            ? $order->status
            : OrderStatus::tryFrom((string) $order->getRawOriginal('status'));
    }
}
