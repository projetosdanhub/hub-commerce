<?php

namespace App\Domain\Shipping;

use App\Domain\Tenancy\TenantContextStore;
use App\Models\OrderShipment;
use App\Models\ProviderInstallation;
use DomainException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

final class MelhorEnvioShipmentClient
{
    public function request(OrderShipment $shipment, string $method, string $path, array $body = []): Response
    {
        if ($shipment->tenant_id !== app(TenantContextStore::class)->require()->tenantId) {
            throw new DomainException('Envio indisponível para esta loja.');
        }
        $installation = ProviderInstallation::query()
            ->whereKey($shipment->provider_installation_id)
            ->where('tenant_id', app(TenantContextStore::class)->require()->tenantId)
            ->where('provider', 'melhor_envio')
            ->where('environment', $shipment->environment)
            ->where('status', 'CONNECTED')->whereNull('revoked_at')->with('credential')->first();
        $credential = $installation?->credential;
        if ($credential === null || $credential->revoked_at !== null || $credential->expires_at?->isPast() || blank($credential->access_token)) {
            throw new DomainException('Autorize novamente a conexão que criou esta etiqueta.');
        }
        $agent = config('provider-connections.melhor_envio.user_agent');
        if (! is_string($agent) || blank($agent)) {
            throw new DomainException('Configure o contato técnico do aplicativo de frete.');
        }
        if (app()->environment('production') && $shipment->environment !== 'PRODUCTION') {
            throw new DomainException('Sandbox não está disponível nesta implantação.');
        }
        $base = match ($shipment->environment) {
            'SANDBOX' => 'https://sandbox.melhorenvio.com.br',
            'PRODUCTION' => 'https://www.melhorenvio.com.br',
            default => throw new DomainException('Ambiente de etiqueta inválido.'),
        };
        $client = Http::acceptJson()->withToken($credential->access_token)->withUserAgent($agent)
            ->connectTimeout(3)->timeout(10);

        return $this->send($client, $method, $base.'/api/v2/me/'.$path, $body);
    }

    private function send(PendingRequest $client, string $method, string $url, array $body): Response
    {

        return match ($method) {
            'POST' => $client->post($url, $body),
            'DELETE' => $client->delete($url),
            'GET' => $client->get($url, $body),
            default => throw new DomainException('Operação de envio inválida.'),
        };
    }
}
