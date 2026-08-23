<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;

class SendToGa4Job implements ShouldQueue
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
        $measurementId = $this->credentials['ga4_measurement_id'];
        $apiSecret = $this->credentials['ga4_api_secret'] ?? '';

        if (empty($apiSecret)) return;

        $eventName = $this->payload['event']['name'];
        $commerce = $this->payload['commerce'] ?? [];

        $data = [
            'client_id' => $this->payload['user']['anonymous_id'] ?? uniqid(),
            'user_id' => $this->payload['user']['external_id'] ?? null,
            'events' => [
                [
                    'name' => $eventName,
                    'params' => array_merge($commerce, [
                        'session_id' => $this->payload['session']['session_id'] ?? '',
                        'ip_override' => $this->ip,
                        'user_agent' => $this->userAgent
                    ])
                ]
            ]
        ];

        Http::post("https://www.google-analytics.com/mp/collect?measurement_id={$measurementId}&api_secret={$apiSecret}", $data);
    }
}