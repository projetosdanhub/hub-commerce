<?php

use App\Enums\OrderStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use RuntimeException;

return new class extends Migration
{
    public function up(): void
    {
        $aliases = [
            'pending' => OrderStatus::AWAITING_PAYMENT->value,
            'awaiting_payment' => OrderStatus::AWAITING_PAYMENT->value,
            'paid' => OrderStatus::PICKING->value,
            'processing' => OrderStatus::PICKING->value,
            'shipped' => OrderStatus::SHIPPED->value,
            'delivered' => OrderStatus::DELIVERED->value,
            'cancelled' => OrderStatus::CANCELLED->value,
            'canceled' => OrderStatus::CANCELLED->value,
            'refund_pending' => OrderStatus::REFUND_REVIEW->value,
            'refunded' => OrderStatus::REFUNDED->value,
        ];

        foreach ($aliases as $legacyStatus => $canonicalStatus) {
            DB::table('orders')
                ->whereRaw('LOWER(status) = ?', [$legacyStatus])
                ->update(['status' => $canonicalStatus]);
        }

        $allowed = array_map(
            static fn (OrderStatus $status): string => $status->value,
            OrderStatus::cases(),
        );

        $invalidStatuses = DB::table('orders')
            ->whereNotIn('status', $allowed)
            ->distinct()
            ->pluck('status')
            ->all();

        if ($invalidStatuses !== []) {
            throw new RuntimeException(
                'Existem estados de pedido não reconhecidos: '.implode(', ', $invalidStatuses)
            );
        }
    }

    public function down(): void
    {
        // Estados canônicos podem ter sido criados antes desta migration.
        // Reverter para aliases legados destruiria essa distinção; rollback de dados é manual.
    }
};
