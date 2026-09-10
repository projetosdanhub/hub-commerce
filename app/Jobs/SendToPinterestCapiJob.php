<?php

namespace App\Jobs;

use App\Domain\Tenancy\Concerns\InteractsWithTenant;

use App\Models\TrackingDestination;
use App\Support\Security\SensitiveData;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;

class SendToPinterestCapiJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, InteractsWithTenant;

    public int $tries = 3;
    public array $backoff = [30, 120, 300];

    public function __construct(
        protected array $payload,
        protected string $ip,
        protected string $userAgent,
        protected int $destinationId,
        protected int $tenantId,
    ) {}

    public function handle(): void
    {
        $this->runForTenant($this->tenantId, function (): void {
            $credentials = TrackingDestination::find($this->destinationId)?->credentials ?? [];
            $adAccountId = $credentials['pinterest_pixel_id'] ?? null;
            $token = $credentials['pinterest_access_token'] ?? null;
    
            if (! $adAccountId || ! $token) {
                return;
            }
    
            $events = [
                'page_view' => 'page_visit',
                'view_item' => 'page_visit',
                'add_to_cart' => 'add_to_cart',
                'begin_checkout' => 'checkout',
                'purchase' => 'checkout',
                'search' => 'search',
                'generate_lead' => 'lead',
                'complete_registration' => 'signup',
            ];
    
            $user = $this->payload['user'] ?? [];
            $userData = [
                'client_ip_address' => $this->ip,
                'client_user_agent' => $this->userAgent,
            ];
    
            foreach (['em', 'ph'] as $key) {
                if (! empty($user[$key])) {
                    $userData[$key] = [SensitiveData::hashIdentifier((string) $user[$key])];
                }
            }
    
            $commerce = $this->payload['commerce'] ?? [];
    
            Http::withToken($token)
                ->acceptJson()
                ->timeout(10)
                ->retry(2, 250)
                ->post("https://api.pinterest.com/v5/ad_accounts/{$adAccountId}/events", [
                    'data' => [[
                        'event_name' => $events[$this->payload['event']['name']] ?? 'custom',
                        'action_source' => 'web',
                        'event_time' => $this->payload['event']['event_time'] ?? now()->timestamp,
                        'event_id' => $this->payload['event']['event_id'],
                        'user_data' => $userData,
                        'custom_data' => array_filter([
                            'value' => isset($commerce['value']) ? (float) $commerce['value'] : null,
                            'currency' => $commerce['currency'] ?? null,
                            'order_id' => $commerce['transaction_id'] ?? null,
                        ], fn ($value) => $value !== null),
                    ]],
                ])
                ->throw();
        });
    }
}
