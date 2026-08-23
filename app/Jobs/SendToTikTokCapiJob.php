<?php

namespace App\Jobs;

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

    protected $payload;
    protected $ip;
    protected $userAgent;
    protected $credentials;

    public function __construct($payload, $ip, $userAgent, $credentials)
    {
        $this->payload = $payload;
        $this->ip = $ip;
        $this->userAgent = $userAgent;
        $this->credentials = $credentials;
    }

    public function handle()
    {
        $pixelCode = $this->credentials['tiktok_pixel_id'];
        
        // Mapeamento de Eventos TikTok
        $ttEvents = [
            'page_view' => 'PageView', 'view_item' => 'ViewContent', 'add_to_cart' => 'AddToCart',
            'begin_checkout' => 'InitiateCheckout', 'add_payment_info' => 'AddPaymentInfo', 
            'purchase' => 'CompletePayment', 'generate_lead' => 'SubmitForm', 'complete_registration' => 'CompleteRegistration'
        ];
        
        $ttEventName = $ttEvents[$this->payload['event']['name']] ?? Str::studly($this->payload['event']['name']);

        $user = $this->payload['user'] ?? [];
        $userData = [];
        if (!empty($user['em'])) $userData['email'] = hash('sha256', strtolower(trim($user['em'])));
        if (!empty($user['ph'])) $userData['phone_number'] = hash('sha256', strtolower(trim($user['ph'])));

        $data = [
            'pixel_code' => $pixelCode,
            'event' => $ttEventName,
            'event_id' => $this->payload['event']['event_id'],
            'timestamp' => new \DateTime($this->payload['event']['event_time_iso']),
            'context' => [
                'user' => $userData,
                'user_agent' => $this->userAgent,
                'ip' => $this->ip,
                'page' => ['url' => $this->payload['event']['source_url'] ?? '']
            ]
        ];

        // O TikTok Server-Side requer um Access Token. 
        if (!empty($this->credentials['tiktok_access_token'])) {
            Http::withHeaders(['Access-Token' => $this->credentials['tiktok_access_token']])
                ->post("https://business-api.tiktok.com/open_api/v1.3/pixel/track/", $data);
        }
    }
}