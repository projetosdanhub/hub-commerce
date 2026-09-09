<?php

namespace App\Domain\ProviderConnections;

use App\Models\ProviderAuthorizationState;
use App\Models\ProviderConnectionCredential;
use App\Models\ProviderInstallation;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

final readonly class ProviderOAuthTokenExchangeService
{
    public function __construct(
        private ProviderOAuthConfiguration $configuration,
    ) {}

    public function exchange(ProviderAuthorizationState $authorization, string $code): ProviderConnectionCredential
    {
        $installation = $authorization->installation;

        if (($installation instanceof ProviderInstallation) === false || $installation->connection_strategy !== 'OAUTH') {
            throw new ProviderOAuthTokenExchangeException('A instalação não aceita troca OAuth.');
        }

        try {
            $response = $this->requestToken($installation, $authorization, $code);
        } catch (ConnectionException $exception) {
            throw new ProviderOAuthTokenExchangeException('Não foi possível comunicar com o provedor.', previous: $exception);
        }

        if ($response->successful() === false || is_array($response->json()) === false) {
            throw new ProviderOAuthTokenExchangeException('O provedor recusou a autorização.');
        }

        /** @var array<string, mixed> $payload */
        $payload = $response->json();
        $accessToken = $payload['access_token'] ?? null;

        if (is_string($accessToken) === false || blank($accessToken)) {
            throw new ProviderOAuthTokenExchangeException('O provedor não devolveu uma credencial válida.');
        }

        return DB::transaction(fn (): ProviderConnectionCredential => $this->persist($installation, $payload, $accessToken));
    }

    private function requestToken(
        ProviderInstallation $installation,
        ProviderAuthorizationState $authorization,
        string $code,
    ): Response {
        if ($installation->provider === 'mercado_pago') {
            return Http::acceptJson()
                ->asJson()
                ->connectTimeout(3)
                ->timeout(10)
                ->post($this->configuration->tokenUrl($installation), [
                    'client_id' => $this->configuration->clientId($installation),
                    'client_secret' => $this->configuration->clientSecret($installation),
                    'code' => $code,
                    'grant_type' => 'authorization_code',
                    'redirect_uri' => $this->configuration->callbackUrl('mercado_pago'),
                    'code_verifier' => $authorization->pkce_verifier,
                    'test_token' => $installation->environment === ProviderRegistry::SANDBOX,
                ]);
        }

        if ($installation->provider === 'melhor_envio') {
            return Http::acceptJson()
                ->asForm()
                ->withUserAgent($this->configuration->userAgent($installation))
                ->connectTimeout(3)
                ->timeout(10)
                ->post($this->configuration->tokenUrl($installation), [
                    'grant_type' => 'authorization_code',
                    'client_id' => $this->configuration->clientId($installation),
                    'client_secret' => $this->configuration->clientSecret($installation),
                    'redirect_uri' => $this->configuration->callbackUrl('melhor_envio'),
                    'code' => $code,
                ]);
        }

        if ($installation->provider === 'pagbank') {
            return Http::acceptJson()
                ->asJson()
                ->withHeaders([
                    'X_CLIENT_ID' => $this->configuration->clientId($installation),
                    'X_CLIENT_SECRET' => $this->configuration->clientSecret($installation),
                ])
                ->connectTimeout(3)
                ->timeout(10)
                ->post($this->configuration->tokenUrl($installation), [
                    'grant_type' => 'authorization_code',
                    'code' => $code,
                    'redirect_uri' => $this->configuration->callbackUrl('pagbank'),
                ]);
        }

        throw new ProviderOAuthTokenExchangeException('O adapter OAuth deste provedor não está disponível.');
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function persist(ProviderInstallation $installation, array $payload, string $accessToken): ProviderConnectionCredential
    {
        $expiresIn = $payload['expires_in'] ?? null;
        $credential = ProviderConnectionCredential::query()->updateOrCreate(
            ['provider_installation_id' => $installation->getKey()],
            [
                'provider_account_id' => $this->providerAccountId($installation, $payload),
                'access_token' => $accessToken,
                'refresh_token' => $this->stringOrNull($payload['refresh_token'] ?? null),
                'scopes' => $this->scopes($payload['scope'] ?? null),
                'expires_at' => is_numeric($expiresIn) ? now()->addSeconds((int) $expiresIn) : null,
                'revoked_at' => null,
            ],
        );

        if ($installation->provider === 'melhor_envio') {
            \App\Models\MelhorEnvioSetting::query()->updateOrCreate([], [
                'environment' => $installation->environment,
            ]);
        }

        $installation->forceFill([
            'status' => 'CONNECTED',
            'connected_at' => now(),
            'revoked_at' => null,
            'secret_ref' => null,
        ])->save();

        return $credential;
    }

    /**
     * @param  array<string, mixed>  $response
     */
    private function providerAccountId(ProviderInstallation $installation, array $response): ?string
    {
        $value = match ($installation->provider) {
            'mercado_pago' => $response['user_id'] ?? null,
            'pagbank' => $response['account_id'] ?? $response['seller_id'] ?? null,
            'melhor_envio' => $response['user']['id'] ?? $response['user_id'] ?? null,
            default => null,
        };

        return is_scalar($value) ? (string) $value : null;
    }

    /**
     * @return array<int, string>|null
     */
    private function scopes(mixed $scope): ?array
    {
        if (is_string($scope) === false || blank($scope)) {
            return null;
        }

        return preg_split('/\s+/', trim($scope)) ?: null;
    }

    private function stringOrNull(mixed $value): ?string
    {
        return is_string($value) && filled($value) ? $value : null;
    }
}
