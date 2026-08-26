<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;

class SendToPinterestCapiJob implements ShouldQueue
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
        // O Pinterest exige o Ad Account ID (que mapearemos como o próprio Pixel ID para simplificar) e o Token
        $adAccountId = $this->credentials['pinterest_pixel_id']; 
        $token = $this->credentials['pinterest_access_token'];

        // Mapeamento Oficial do Pinterest
        $pinEvents = [
            'page_view' => 'page_visit', 
            'view_item' => 'page_visit', 
            'add_to_cart' => 'add_to_cart',
            'begin_checkout' => 'checkout', 
            'purchase' => 'checkout', 
            'search' => 'search',
            'generate_lead' => 'lead', 
            'complete_registration' => 'signup'
        ];
        
        $eventName = $pinEvents[$this->payload['event']['name']] ?? 'custom';

        // Hash SHA-256 (Padrão de segurança exigido)
        $user = $this->payload['user'] ?? [];
        $userData = [
            'client_ip_address' => $this->ip,
            'client_user_agent' => $this->userAgent,
        ];
        if (!empty($user['em'])) $userData['em'] = [hash('sha256', strtolower(trim($user['em'])))];
        if (!empty($user['ph'])) $userData['ph'] = [hash('sha256', strtolower(trim($user['ph'])))];

        // Dados de E-commerce
        $customData = [];
        $commerce = $this->payload['commerce'] ?? [];
        if (!empty($commerce['value'])) $customData['value'] = (float) $commerce['value'];
        if (!empty($commerce['currency'])) $customData['currency'] = $commerce['currency'];
        if (!empty($commerce['transaction_id'])) $customData['order_id'] = $commerce['transaction_id'];

        $data = [
            'data' => [
                [
                    'event_name' => $eventName,
                    'action_source' => 'web',
                    'event_time' => $this->payload['event']['event_time'],
                    'event_id' => $this->payload['event']['event_id'],
                    'user_data' => $userData,
                    'custom_data' => $customData,
                ]
            ]
        ];

        // Envio HTTP para a API v5 do Pinterest
        Http::withToken($token)->post("https://api.pinterest.com/v5/ad_accounts/{$adAccountId}/events", $data);
    }
}