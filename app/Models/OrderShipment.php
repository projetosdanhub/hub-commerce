<?php

namespace App\Models;

use App\Domain\Shipping\ShipmentOperation;
use App\Domain\Shipping\ShipmentStatus;
use App\Domain\Tenancy\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $tenant_id
 * @property int $order_id
 * @property int $provider_installation_id
 * @property string $public_id
 * @property string $environment
 * @property string|null $provider_reference
 * @property string|null $tracking_code
 * @property string|null $failure_code
 * @property string $request_fingerprint
 * @property array<string, mixed> $request_payload
 * @property int $quoted_cents
 * @property ShipmentStatus $status
 * @property ShipmentOperation|null $operation
 */
class OrderShipment extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'public_id', 'order_id', 'provider_installation_id', 'environment',
        'provider_reference', 'active_slot', 'status', 'operation', 'operation_started_at',
        'request_fingerprint', 'request_payload', 'quoted_cents', 'tracking_code', 'failure_code',
    ];

    protected $hidden = ['request_payload', 'request_fingerprint'];

    protected function casts(): array
    {

        return [
            'status' => ShipmentStatus::class,
            'operation' => ShipmentOperation::class,
            'request_payload' => 'encrypted:array',
            'active_slot' => 'boolean',
            'quoted_cents' => 'integer',
            'operation_started_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Order, $this> */
    public function order(): BelongsTo
    {

        return $this->belongsTo(Order::class);
    }
}
