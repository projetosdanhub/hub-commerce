<?php

namespace Tests\Feature\ProviderConnections;

use App\Domain\ProviderConnections\MelhorEnvioTokenRefreshService;
use App\Domain\ProviderConnections\ProviderAuthorizationService;
use App\Domain\ProviderConnections\ProviderAuthorizationUrlFactory;
use App\Domain\ProviderConnections\ProviderOAuthTokenExchangeService;
use App\Models\ProviderConnectionCredential;
use App\Models\ProviderInstallation;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Tests\TestCase;

class ProviderOAuthFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_mercado_pago_uses_a_static_callback_state_and_s256_pkce(): void
    {
        config([
            'provider-connections.redirect_base_url' => 'https://app.hubcommerce.test',
            'provider-connections.mercado_pago.client_id' => 'mp-client-id',
            'provider-connections.mercado_pago.client_secret' => 'mp-client-secret',
        ]);

        $started = app(ProviderAuthorizationService::class)->begin(
            $this->installation('mercado_pago', 'SANDBOX'),
            $this->user(),
        );

        $url = app(ProviderAuthorizationUrlFactory::class)->make($started['authorization'], $started['state']);
        parse_str((string) parse_url($url, PHP_URL_QUERY), $query);

        $this->assertSame('https://auth.mercadopago.com/authorization', strtok($url, '?'));
        $this->assertSame('mp-client-id', $query['client_id']);
        $this->assertSame('code', $query['response_type']);
        $this->assertSame('mp', $query['platform_id']);
        $this->assertSame($started['state'], $query['state']);
        $this->assertSame('https://app.hubcommerce.test/api/oauth/mercado_pago/callback', $query['redirect_uri']);
        $this->assertSame('S256', $query['code_challenge_method']);
        $this->assertNotSame($started['authorization']->pkce_verifier, $query['code_challenge']);
    }

    public function test_pagbank_sandbox_uses_its_documented_connect_authorization_url(): void
    {
        config([
            'provider-connections.redirect_base_url' => 'https://app.hubcommerce.test',
            'provider-connections.pagbank.client_id' => 'pagbank-client-id',
            'provider-connections.pagbank.client_secret' => 'pagbank-client-secret',
        ]);

        $started = app(ProviderAuthorizationService::class)->begin(
            $this->installation('pagbank', 'SANDBOX'),
            $this->user(),
        );

        $url = app(ProviderAuthorizationUrlFactory::class)->make($started['authorization'], $started['state']);
        parse_str((string) parse_url($url, PHP_URL_QUERY), $query);

        $this->assertSame('https://connect.sandbox.pagbank.com.br/oauth2/authorize', strtok($url, '?'));
        $this->assertSame('https://app.hubcommerce.test/api/oauth/pagbank/callback', $query['redirect_uri']);
        $this->assertStringContainsString('payments.create', $query['scope']);
        $this->assertSame($started['state'], $query['state']);
    }

    public function test_melhor_envio_uses_oauth_callback_and_shipping_scopes(): void
    {
        config([
            'provider-connections.redirect_base_url' => 'https://app.hubcommerce.test',
            'provider-connections.melhor_envio.client_id' => 'melhor-envio-client-id',
            'provider-connections.melhor_envio.client_secret' => 'melhor-envio-client-secret',
            'provider-connections.melhor_envio.user_agent' => 'Hub Commerce (suporte@hubcommerce.test)',
        ]);

        $started = app(ProviderAuthorizationService::class)->begin(
            $this->installation('melhor_envio', 'SANDBOX'),
            $this->user(),
        );

        $url = app(ProviderAuthorizationUrlFactory::class)->make($started['authorization'], $started['state']);
        parse_str((string) parse_url($url, PHP_URL_QUERY), $query);

        $this->assertSame('https://sandbox.melhorenvio.com.br/oauth/authorize', strtok($url, '?'));
        $this->assertSame('melhor-envio-client-id', $query['client_id']);
        $this->assertSame('code', $query['response_type']);
        $this->assertSame($started['state'], $query['state']);
        $this->assertSame('https://app.hubcommerce.test/api/oauth/melhor_envio/callback', $query['redirect_uri']);
        $this->assertStringContainsString('shipping-calculate', $query['scope']);
        $this->assertStringContainsString('ecommerce-shipping', $query['scope']);
    }

    public function test_melhor_envio_token_exchange_is_encrypted_and_sends_required_user_agent(): void
    {
        config([
            'provider-connections.redirect_base_url' => 'https://app.hubcommerce.test',
            'provider-connections.melhor_envio.client_id' => 'melhor-envio-client-id',
            'provider-connections.melhor_envio.client_secret' => 'melhor-envio-client-secret',
            'provider-connections.melhor_envio.user_agent' => 'Hub Commerce (suporte@hubcommerce.test)',
        ]);

        $installation = $this->installation('melhor_envio', 'SANDBOX');
        $started = app(ProviderAuthorizationService::class)->begin($installation, $this->user());

        Http::fake([
            'https://sandbox.melhorenvio.com.br/oauth/token' => Http::response([
                'access_token' => 'sensitive-melhor-envio-token',
                'refresh_token' => 'sensitive-melhor-envio-refresh-token',
                'expires_in' => 2592000,
            ]),
        ]);

        app(ProviderOAuthTokenExchangeService::class)->exchange($started['authorization'], 'provider-code');

        $this->assertSame('CONNECTED', $installation->fresh()->status);
        $this->assertNotSame(
            'sensitive-melhor-envio-token',
            DB::table('provider_connection_credentials')->value('access_token'),
        );

        Http::assertSent(function (Request $request): bool {
            return $request->url() === 'https://sandbox.melhorenvio.com.br/oauth/token'
                && $request->hasHeader('User-Agent', 'Hub Commerce (suporte@hubcommerce.test)')
                && str_contains($request->body(), 'grant_type');
        });
    }

    public function test_melhor_envio_refresh_replaces_encrypted_credentials_without_exposing_them(): void
    {
        config([
            'provider-connections.redirect_base_url' => 'https://app.hubcommerce.test',
            'provider-connections.melhor_envio.client_id' => 'melhor-envio-client-id',
            'provider-connections.melhor_envio.client_secret' => 'melhor-envio-client-secret',
            'provider-connections.melhor_envio.user_agent' => 'Hub Commerce (suporte@hubcommerce.test)',
        ]);

        $installation = $this->installation('melhor_envio', 'SANDBOX');
        $installation->update(['status' => 'CONNECTED']);
        $installation->refresh();
        $credential = ProviderConnectionCredential::query()->create([
            'provider_installation_id' => $installation->getKey(),
            'access_token' => 'old-sensitive-access-token',
            'refresh_token' => 'old-sensitive-refresh-token',
            'expires_at' => now()->addHour(),
        ]);

        Http::fake([
            'https://sandbox.melhorenvio.com.br/oauth/token' => Http::response([
                'access_token' => 'new-sensitive-access-token',
                'refresh_token' => 'new-sensitive-refresh-token',
                'expires_in' => 2592000,
            ]),
        ]);

        $refreshed = app(MelhorEnvioTokenRefreshService::class)->refresh($credential);

        $this->assertSame('new-sensitive-access-token', $refreshed->access_token);
        $this->assertSame('new-sensitive-refresh-token', $refreshed->refresh_token);
        $this->assertNotSame(
            'new-sensitive-access-token',
            DB::table('provider_connection_credentials')->value('access_token'),
        );
        $this->assertTrue($refreshed->expires_at->isFuture());
    }

    public function test_mercado_pago_token_is_encrypted_and_never_returned_by_the_installation(): void
    {
        config([
            'provider-connections.redirect_base_url' => 'https://app.hubcommerce.test',
            'provider-connections.mercado_pago.client_id' => 'mp-client-id',
            'provider-connections.mercado_pago.client_secret' => 'mp-client-secret',
        ]);

        $installation = $this->installation('mercado_pago', 'SANDBOX');
        $started = app(ProviderAuthorizationService::class)->begin($installation, $this->user());

        Http::fake([
            'https://api.mercadopago.com/oauth/token' => Http::response([
                'access_token' => 'APP_USR-sensitive-access-token',
                'refresh_token' => 'TG-sensitive-refresh-token',
                'user_id' => 987654,
                'expires_in' => 3600,
                'scope' => 'offline_access payments',
            ]),
        ]);

        $credential = app(ProviderOAuthTokenExchangeService::class)->exchange(
            $started['authorization'],
            'one-time-provider-code',
        );

        $this->assertInstanceOf(ProviderConnectionCredential::class, $credential);
        $this->assertSame('APP_USR-sensitive-access-token', $credential->access_token);
        $this->assertSame('CONNECTED', $installation->fresh()->status);
        $this->assertNotSame(
            'APP_USR-sensitive-access-token',
            DB::table('provider_connection_credentials')->value('access_token'),
        );

        Http::assertSent(function (Request $request): bool {
            return $request->url() === 'https://api.mercadopago.com/oauth/token'
                && str_contains($request->body(), 'grant_type')
                && str_contains($request->body(), 'code_verifier');
        });
    }

    private function installation(string $provider, string $environment): ProviderInstallation
    {
        return ProviderInstallation::query()->create([
            'tenant_id' => Tenant::query()->create([
                'name' => 'Loja OAuth '.str()->random(8),
                'slug' => Str::lower(Str::random(12)),
            ])->getKey(),
            'provider' => $provider,
            'environment' => $environment,
            'connection_strategy' => 'OAUTH',
            'status' => 'PENDING',
        ]);
    }

    private function user(): User
    {
        return User::query()->create([
            'name' => 'Operador OAuth',
            'email' => str()->random(12).'@hub.test',
            'email_verified_at' => now(),
            'password' => bcrypt('SenhaForte123!'),
            'role' => 'admin',
            'status' => 'ATIVO',
        ]);
    }
}
