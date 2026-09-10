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
        $secrets = array_filter(
            [
                'SANDBOX' => config('provider-connections.melhor_envio.sandbox_client_secret'),
                'PRODUCTION' => config('provider-connections.melhor_envio.production_client_secret'),
            ],
            static fn (mixed $secret): bool => is_string($secret) && $secret !== '',
        );

        $environment = is_string($signature) ? $this->signatureEnvironment($rawBody, $signature, $secrets) : null;
        if ($environment === null) {
            return response()->json(['message' => 'Assinatura inválida.'], 401);
        }

        $payload = json_decode($rawBody, true);

        if (! is_array($payload) || ! is_string($payload['event'] ?? null) || ! is_array($payload['data'] ?? null) || ! is_string($payload['data']['id'] ?? null)) {
            return response()->json(['message' => 'Evento inválido.'], 422);
        }

        $payloadHash = hash('sha256', $environment.':'.$rawBody);
        // Guardar apenas referências e estado operacional; nunca o payload integral.
        $safePayload = [
            'event' => $payload['event'],
            'environment' => $environment,
            'data' => array_intersect_key($payload['data'], array_flip([
                'id', 'status', 'tracking', 'user_id', 'posted_at', 'delivered_at', 'canceled_at',
            ])),
        ];

        $event = ProviderWebhookEvent::query()->firstOrCreate(
            ['provider' => 'melhor_envio', 'payload_hash' => $payloadHash],
            [
                'event_name' => $payload['event'],
                'payload' => $safePayload,
                'received_at' => now(),
            ],
        );

        if ($event->processed_at === null) {
            ProcessMelhorEnvioWebhook::dispatch($event->id);
        }

        return response()->json(['received' => true], 202);
    }

    /**
     * @param  array<string, string>  $secrets
     */
    private function signatureEnvironment(string $rawBody, string $signature, array $secrets): ?string
    {
        foreach ($secrets as $environment => $secret) {
            if (hash_equals(base64_encode(hash_hmac('sha256', $rawBody, $secret, true)), $signature)) {
                return $environment;
            }
        }

        return null;
    }
}
