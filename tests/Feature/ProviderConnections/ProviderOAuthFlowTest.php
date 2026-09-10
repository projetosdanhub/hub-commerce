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
            'provider-connections.melhor_envio.sandbox_client_id' => 'melhor-envio-client-id',
            'provider-connections.melhor_envio.sandbox_client_secret' => 'melhor-envio-client-secret',
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
            'provider-connections.melhor_envio.sandbox_client_id' => 'melhor-envio-client-id',
            'provider-connections.melhor_envio.sandbox_client_secret' => 'melhor-envio-client-secret',
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
            'provider-connections.melhor_envio.sandbox_client_id' => 'melhor-envio-client-id',
            'provider-connections.melhor_envio.sandbox_client_secret' => 'melhor-envio-client-secret',
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

    public function test_shipping_uses_only_the_active_tenant_environment_and_unexpired_oauth_token(): void
    {
        $installation = $this->installation('melhor_envio', 'PRODUCTION');
        $installation->update(['status' => 'CONNECTED']);
        $credential = ProviderConnectionCredential::query()->create([
            'provider_installation_id' => $installation->getKey(),
            'access_token' => 'oauth-fixture',
            'expires_at' => now()->addHour(),
        ]);
        $tenant = $installation->tenant;
        app(\App\Domain\Tenancy\TenantContextStore::class)->run(\App\Domain\Tenancy\TenantContext::fromTenant($tenant), function () use ($credential): void {
            $settings = new \App\Models\MelhorEnvioSetting(['environment' => 'SANDBOX', 'access_token' => 'legacy-must-not-be-used']);
            $this->assertNull($settings->oauthConnection());
            $settings->environment = 'PRODUCTION';
            $this->assertSame('oauth-fixture', $settings->oauthAccessToken());
            $credential->update(['expires_at' => now()->subMinute()]);
            $this->assertNull($settings->oauthConnection());
            $credential->update(['expires_at' => now()->addHour(), 'revoked_at' => now()]);
            $this->assertNull($settings->oauthConnection());
        });
        $another = Tenant::query()->create(['name' => 'Outra loja', 'slug' => 'outra-loja']);
        app(\App\Domain\Tenancy\TenantContextStore::class)->run(\App\Domain\Tenancy\TenantContext::fromTenant($another), function (): void {
            $this->assertNull((new \App\Models\MelhorEnvioSetting(['environment' => 'PRODUCTION']))->oauthConnection());
        });
    }

    public function test_provider_registry_does_not_advertise_unimplemented_webhook_routes(): void
    {
        $this->assertSame('/api/webhooks/melhor-envio', $this->installation('melhor_envio', 'SANDBOX')->webhookPath());
        foreach (['stripe', 'mercado_pago', 'pagarme', 'pagbank'] as $provider) {
            $this->assertNull($this->installation($provider, 'SANDBOX')->webhookPath());
        }
    }

    public function test_shipping_inbox_requeues_unprocessed_retries_and_minimizes_payload(): void
    {
        \Illuminate\Support\Facades\Queue::fake();
        $secret = hash('sha256', 'me-signature-fixture');
        config(['provider-connections.melhor_envio.sandbox_client_secret' => $secret]);
        $payload = json_encode([
            'event' => 'order.posted',
            'data' => ['id' => 'label-fixture', 'status' => 'posted', 'tracking' => 'AA123', 'email' => 'private@example.test', 'tags' => [['url' => 'private']]],
        ], JSON_THROW_ON_ERROR);
        $signature = base64_encode(hash_hmac('sha256', $payload, $secret, true));
        for ($i = 0; $i < 2; $i++) {
            $this->call('POST', '/api/webhooks/melhor-envio', [], [], [], ['HTTP_X_ME_SIGNATURE' => $signature], $payload)->assertStatus(202);
        }
        $this->assertDatabaseCount('provider_webhook_events', 1);
        \Illuminate\Support\Facades\Queue::assertPushed(\App\Jobs\ProcessMelhorEnvioWebhook::class, 2);
        $event = \App\Models\ProviderWebhookEvent::query()->firstOrFail();
        $this->assertSame('SANDBOX', $event->payload['environment']);
        $this->assertArrayNotHasKey('email', $event->payload['data']);
        $this->assertArrayNotHasKey('tags', $event->payload['data']);
        try {
            (new \App\Jobs\ProcessMelhorEnvioWebhook($event->id))->handle();
            $this->fail('Evento sem vínculo não pode ser processado.');
        } catch (\RuntimeException) {
            // O worker deve tentar novamente se o webhook antecedeu a resposta do carrinho.
        }
        $this->assertNull($event->fresh()->processed_at);
        $this->assertNotNull($event->fresh()->failed_at);
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
