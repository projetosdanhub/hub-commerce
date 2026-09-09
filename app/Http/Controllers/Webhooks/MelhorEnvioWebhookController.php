<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessMelhorEnvioWebhook;
use App\Models\ProviderWebhookEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MelhorEnvioWebhookController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $rawBody = $request->getContent();
        $signature = $request->header('X-ME-Signature');
        $secret = config('provider-connections.melhor_envio.client_secret');

        if (! is_string($signature) || ! is_string($secret) || $secret === '' || ! $this->signatureIsValid($rawBody, $signature, $secret)) {
            return response()->json(['message' => 'Assinatura inválida.'], 401);
        }

        $payload = json_decode($rawBody, true);

        if (! is_array($payload) || ! is_string($payload['event'] ?? null) || ! is_array($payload['data'] ?? null)) {
            return response()->json(['message' => 'Evento inválido.'], 422);
        }

        $payloadHash = hash('sha256', $rawBody);

        $event = ProviderWebhookEvent::query()->firstOrCreate(
            ['provider' => 'melhor_envio', 'payload_hash' => $payloadHash],
            [
                'event_name' => $payload['event'],
                'payload' => $payload,
                'received_at' => now(),
            ],
        );

        if ($event->wasRecentlyCreated) {
            ProcessMelhorEnvioWebhook::dispatch($event->id);
        }

        return response()->json(['received' => true], 202);
    }

    private function signatureIsValid(string $rawBody, string $signature, string $secret): bool
    {
        return hash_equals(base64_encode(hash_hmac('sha256', $rawBody, $secret, true)), $signature);
    }
}
