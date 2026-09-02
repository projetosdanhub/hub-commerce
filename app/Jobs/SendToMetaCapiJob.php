<?php

namespace App\Jobs;

use App\Models\TrackingDestination;
use App\Support\Security\SensitiveData;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class SendToMetaCapiJob implements ShouldQueue
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
        $pixelId = $credentials['meta_pixel_id'] ?? null;
        $token = $credentials['meta_access_token'] ?? null;

        if (! $pixelId || ! $token) {
            return;
        }

        $user = $this->payload['user'] ?? [];
        $userData = [
            'client_ip_address' => $this->ip,
            'client_user_agent' => $this->userAgent,
        ];

        foreach (['em', 'ph', 'fn', 'ln', 'external_id'] as $key) {
            if (! empty($user[$key])) {
                $userData[$key] = [SensitiveData::hashIdentifier((string) $user[$key])];
            }
        }

        $attribution = $this->payload['attribution'] ?? [];
        foreach (['fbp', 'fbc'] as $key) {
            if (! empty($attribution[$key])) {
                $userData[$key] = $attribution[$key];
            }
        }

        $commerce = $this->payload['commerce'] ?? [];
        $customData = array_filter([
            'value' => isset($commerce['value']) ? (float) $commerce['value'] : null,
            'currency' => $commerce['currency'] ?? null,
        ], fn ($value) => $value !== null);

        if (! empty($commerce['items'])) {
            $customData['contents'] = array_map(fn ($item) => [
                'id' => $item['item_id'] ?? $item['product_id'] ?? '',
                'quantity' => $item['quantity'] ?? 1,
            ], $commerce['items']);
            $customData['content_type'] = 'product';
        }

        Http::withToken($token)
            ->acceptJson()
            ->timeout(10)
            ->retry(2, 250)
            ->post("https://graph.facebook.com/v19.0/{$pixelId}/events", [
                'data' => [[
                    'event_name' => Str::studly($this->payload['event']['name']),
                    'event_time' => $this->payload['event']['event_time'] ?? now()->timestamp,
                    'action_source' => 'website',
                    'event_id' => $this->payload['event']['event_id'],
                    'event_source_url' => $this->payload['event']['source_url'] ?? '',
                    'user_data' => $userData,
                    'custom_data' => $customData,
                ]],
            ])
            ->throw();
    }
}
