<?php

namespace App\Jobs;

use App\Models\ProviderWebhookEvent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

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
        DB::transaction(function (): void {
            $event = ProviderWebhookEvent::query()->lockForUpdate()->find($this->eventId);

            if ($event === null || $event->processed_at !== null) {
                return;
            }

            // A vinculação da etiqueta ao pedido será adicionada junto ao fluxo
            // idempotente de geração de etiquetas. Nunca atualize pedidos por dados
            // não vinculados ao tenant.
            // Inbox recebido não é rastreio processado. Sem vínculo persistido de
            // etiqueta, manter a pendência visível para reconciliação operacional.
            $event->forceFill(['failed_at' => now()])->save();
        });
    }
}
