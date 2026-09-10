<?php

namespace App\Models;

use App\Domain\Payments\PaymentAttemptStatus;
use App\Domain\Tenancy\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $order_id
 * @property string $gateway
 * @property string $environment
 * @property string $payment_method
 * @property PaymentAttemptStatus $status
 * @property string $idempotency_key
 * @property string $checkout_fingerprint
 * @property int $amount_cents
 * @property string $currency
 */
class PaymentAttempt extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'order_id',
        'gateway',
        'environment',
        'payment_method',
        'status',
        'idempotency_key',
        'checkout_fingerprint',
        'amount_cents',
        'currency',
        'gateway_payment_id',
        'gateway_transaction_id',
        'failure_code',
        'initiated_at',
        'processed_at',
    ];

    protected function casts(): array
    {
        return [
            'amount_cents' => 'integer',
            'status' => PaymentAttemptStatus::class,
            'initiated_at' => 'datetime',
            'processed_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
