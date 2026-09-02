<?php

namespace App\Jobs;

use App\Models\TrackingDestination;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;

class SendToGa4Job implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [30, 120, 300];

    public function __construct(
        protected array $payload,
        protected string $ip,
        protected string $userAgent,
        protected int $destinationId,
    ) {}

    public function handle(): void
    {
        $credentials = TrackingDestination::find($this->destinationId)?->credentials ?? [];
        $measurementId = $credentials['ga4_measurement_id'] ?? null;
        $apiSecret = $credentials['ga4_api_secret'] ?? null;

        if (! $measurementId || ! $apiSecret) {
            return;
        }

        Http::acceptJson()
            ->timeout(10)
            ->retry(2, 250)
            ->post("https://www.google-analytics.com/mp/collect?measurement_id={$measurementId}&api_secret={$apiSecret}", [
                'client_id' => $this->payload['user']['anonymous_id'] ?? $this->payload['session']['session_id'] ?? (string) now()->timestamp,
                'user_id' => $this->payload['user']['external_id'] ?? null,
                'events' => [[
                    'name' => $this->payload['event']['name'],
                    'params' => array_merge($this->payload['commerce'] ?? [], [
                        'session_id' => $this->payload['session']['session_id'] ?? '',
                        'ip_override' => $this->ip,
                        'user_agent' => $this->userAgent,
                    ]),
                ]],
            ])
            ->throw();
    }
}
