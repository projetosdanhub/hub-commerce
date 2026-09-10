<?php

namespace App\Jobs;

use App\Domain\Shipping\MelhorEnvioShipmentService;
use App\Domain\Shipping\ShipmentStatus;
use App\Domain\Tenancy\TenantContext;
use App\Domain\Tenancy\TenantContextStore;
use App\Models\OrderShipment;
use App\Models\ProviderWebhookEvent;
use App\Models\Tenant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ProcessMelhorEnvioWebhook implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 5;

    public int $timeout = 30;

    public function backoff(): array
    {
        return [15, 60, 300, 900];
    }

    public function failed(?\Throwable $exception): void
    {
        ProviderWebhookEvent::query()->whereKey($this->eventId)->update(['failed_at' => now()]);
    }

    public function __construct(public readonly int $eventId) {}

    public function handle(): void
    {
        $event = ProviderWebhookEvent::query()->find($this->eventId);
        if ($event === null || $event->processed_at !== null || $event->provider !== 'melhor_envio') {
            return;
        }
        $payload = $event->payload;
        // Resolve apenas o tenant a partir do vínculo persistido localmente. Nunca
        // aceitar tenant, pedido ou conta enviados no corpo do webhook.
        $binding = DB::table('order_shipments')
            ->where('environment', $payload['environment'] ?? '')
            ->where('provider_reference', $payload['data']['id'] ?? '')
            ->first(['id', 'tenant_id']);
        $tenant = $binding === null ? null : Tenant::query()->find($binding->tenant_id);
        if ($tenant === null || ! $tenant->isActive()) {
            $event->forceFill(['failed_at' => now()])->save();
            throw new RuntimeException('Etiqueta sem vínculo local ativo. Reprocessamento necessário.');
        }
        $status = ShipmentStatus::tryFrom(strtoupper((string) ($payload['data']['status'] ?? '')));
        $expectedEvent = match ($status) {
            ShipmentStatus::PENDING => ['order.created', 'order.pending'],
            ShipmentStatus::RELEASED => ['order.released'],
            ShipmentStatus::GENERATED => ['order.generated'],
            ShipmentStatus::RECEIVED => ['order.received'],
            ShipmentStatus::POSTED => ['order.posted'],
            ShipmentStatus::DELIVERED => ['order.delivered'],
            ShipmentStatus::CANCELLED => ['order.cancelled'],
            ShipmentStatus::UNDELIVERED => ['order.undelivered'],
            ShipmentStatus::PAUSED => ['order.paused'],
            ShipmentStatus::SUSPENDED => ['order.suspended'],
            default => [],
        };
        if ($status === null || ! in_array($event->event_name, $expectedEvent, true)) {
            $event->forceFill(['failed_at' => now()])->save();
            throw new RuntimeException('Estado de etiqueta não reconhecido.');
        }
        app(TenantContextStore::class)->run(TenantContext::fromTenant($tenant), function () use ($binding, $payload, $status): void {
            DB::transaction(function () use ($binding, $payload, $status): void {
                $event = ProviderWebhookEvent::query()->lockForUpdate()->findOrFail($this->eventId);
                if ($event->processed_at !== null) {
                    return;
                }
                $shipment = OrderShipment::query()->findOrFail($binding->id);
                $tracking = $payload['data']['tracking'] ?? null;
                app(MelhorEnvioShipmentService::class)->applyStatus($shipment, $status, is_string($tracking) ? $tracking : null);
                $event->forceFill(['processed_at' => now(), 'failed_at' => null])->save();
            });
        });
    }
}
