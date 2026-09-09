<?php

namespace App\Domain\ProviderConnections;

use App\Models\ProviderConnectionCredential;
use App\Models\ProviderInstallation;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

final readonly class MelhorEnvioTokenRefreshService
{
    public function __construct(private ProviderOAuthConfiguration $configuration) {}

    public function refresh(ProviderConnectionCredential $credential): ProviderConnectionCredential
    {
        $credential = $credential->fresh(['installation']) ?? $credential;
        $installation = $credential->installation;

        if (($installation instanceof ProviderInstallation) === false || $installation->provider !== 'melhor_envio') {
            throw new ProviderOAuthTokenExchangeException('A credencial não pertence ao Melhor Envio.');
        }

        if (! $this->configuration->isConfigured($installation)) {
            throw new ProviderOAuthTokenExchangeException('A credencial de plataforma do Melhor Envio não está configurada.');
        }

        try {
            $response = Http::acceptJson()
                ->asForm()
                ->withUserAgent($this->configuration->userAgent($installation))
                ->connectTimeout(3)
                ->timeout(10)
                ->post($this->configuration->tokenUrl($installation), [
                    'grant_type' => 'refresh_token',
                    'client_id' => $this->configuration->clientId($installation),
                    'client_secret' => $this->configuration->clientSecret($installation),
                    'refresh_token' => $credential->refresh_token,
                ]);
        } catch (ConnectionException $exception) {
            throw new ProviderOAuthTokenExchangeException('Não foi possível renovar a conexão com o Melhor Envio.', previous: $exception);
        }

        $payload = $response->json();
        $accessToken = is_array($payload) ? $payload['access_token'] ?? null : null;

        if ($response->successful() === false || ! is_string($accessToken) || blank($accessToken)) {
            throw new ProviderOAuthTokenExchangeException('O Melhor Envio recusou a renovação da credencial.');
        }

        return DB::transaction(function () use ($credential, $payload, $accessToken): ProviderConnectionCredential {
            $locked = ProviderConnectionCredential::query()->lockForUpdate()->findOrFail($credential->getKey());
            $expiresIn = $payload['expires_in'] ?? null;
            $nextRefreshToken = $payload['refresh_token'] ?? null;

            $locked->forceFill([
                'access_token' => $accessToken,
                'refresh_token' => is_string($nextRefreshToken) && filled($nextRefreshToken)
                    ? $nextRefreshToken
                    : $locked->refresh_token,
                'expires_at' => is_numeric($expiresIn) ? now()->addSeconds((int) $expiresIn) : null,
                'revoked_at' => null,
            ])->save();

            return $locked->fresh();
        });
    }

    public function refreshDue(): int
    {
        $refreshed = 0;

        ProviderConnectionCredential::query()
            ->whereHas('installation', fn ($query) => $query
                ->where('provider', 'melhor_envio')
                ->where('status', 'CONNECTED')
                ->whereNull('revoked_at'))
            ->whereNotNull('refresh_token')
            ->where('expires_at', '<=', now()->addDay())
            ->orderBy('id')
            ->eachById(function (ProviderConnectionCredential $credential) use (&$refreshed): void {
                try {
                    $this->refresh($credential);
                    $refreshed++;
                } catch (ProviderOAuthTokenExchangeException) {
                    report(new \RuntimeException('Falha ao renovar credencial OAuth do Melhor Envio.'));
                }
            });

        return $refreshed;
    }
}
