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

class SendToTikTokCapiJob implements ShouldQueue
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
        $pixelCode = $credentials['tiktok_pixel_id'] ?? null;
        $token = $credentials['tiktok_access_token'] ?? null;

        if (! $pixelCode || ! $token) {
            return;
        }

        $events = [
            'page_view' => 'PageView',
            'view_item' => 'ViewContent',
            'add_to_cart' => 'AddToCart',
            'begin_checkout' => 'InitiateCheckout',
            'add_payment_info' => 'AddPaymentInfo',
            'purchase' => 'CompletePayment',
            'generate_lead' => 'SubmitForm',
            'complete_registration' => 'CompleteRegistration',
        ];

        $user = $this->payload['user'] ?? [];
        $userData = [];
        if (! empty($user['em'])) {
            $userData['email'] = SensitiveData::hashIdentifier((string) $user['em']);
        }
        if (! empty($user['ph'])) {
            $userData['phone_number'] = SensitiveData::hashIdentifier((string) $user['ph']);
        }

        Http::withHeaders(['Access-Token' => $token])
            ->acceptJson()
            ->timeout(10)
            ->retry(2, 250)
            ->post('https://business-api.tiktok.com/open_api/v1.3/pixel/track/', [
                'pixel_code' => $pixelCode,
                'event' => $events[$this->payload['event']['name']] ?? Str::studly($this->payload['event']['name']),
                'event_id' => $this->payload['event']['event_id'],
                'timestamp' => $this->payload['event']['event_time_iso'] ?? now()->toIso8601String(),
                'context' => [
                    'user' => $userData,
                    'user_agent' => $this->userAgent,
                    'ip' => $this->ip,
                    'page' => ['url' => $this->payload['event']['source_url'] ?? ''],
                ],
            ])
            ->throw();
    }
}
