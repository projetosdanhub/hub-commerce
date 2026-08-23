<?php

namespace App\Jobs;

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
        $pixelId = $this->credentials['meta_pixel_id'];
        $token = $this->credentials['meta_access_token'];

        // Mapeamento Canônico para Meta
        $eventName = Str::studly($this->payload['event']['name']);
        
        // Estruturação do User Data (Com Hashing Automático)
        $userData = [
            'client_ip_address' => $this->ip,
            'client_user_agent' => $this->userAgent,
        ];

        // Hashing SHA256 obrigatório pela Meta
        $user = $this->payload['user'] ?? [];
        if (!empty($user['em'])) $userData['em'] = [$this->hash($user['em'])];
        if (!empty($user['ph'])) $userData['ph'] = [$this->hash($user['ph'])];
        if (!empty($user['fn'])) $userData['fn'] = [$this->hash($user['fn'])];
        if (!empty($user['ln'])) $userData['ln'] = [$this->hash($user['ln'])];
        if (!empty($user['external_id'])) $userData['external_id'] = [$this->hash($user['external_id'])];

        // Atribuição (fbc / fbp)
        $attr = $this->payload['attribution'] ?? [];
        if (!empty($attr['fbp'])) $userData['fbp'] = $attr['fbp'];
        if (!empty($attr['fbc'])) $userData['fbc'] = $attr['fbc'];

        // Custom Data (Carrinho, Valor, Moeda)
        $commerce = $this->payload['commerce'] ?? [];
        $customData = [];
        if (!empty($commerce['value'])) $customData['value'] = (float) $commerce['value'];
        if (!empty($commerce['currency'])) $customData['currency'] = $commerce['currency'];
        if (!empty($commerce['items'])) {
            $customData['contents'] = array_map(function($item) {
                return ['id' => $item['item_id'] ?? $item['product_id'] ?? '', 'quantity' => $item['quantity'] ?? 1];
            }, $commerce['items']);
            $customData['content_type'] = 'product';
        }

        $data = [
            'data' => [
                [
                    'event_name' => $eventName,
                    'event_time' => $this->payload['event']['event_time'],
                    'action_source' => 'website',
                    'event_id' => $this->payload['event']['event_id'],
                    'event_source_url' => $this->payload['event']['source_url'] ?? '',
                    'user_data' => $userData,
                    'custom_data' => $customData,
                ]
            ]
        ];

        // Envio HTTP para a Graph API da Meta
        Http::post("https://graph.facebook.com/v19.0/{$pixelId}/events?access_token={$token}", $data);
    }

    private function hash($string) {
        return hash('sha256', strtolower(trim($string)));
    }
}