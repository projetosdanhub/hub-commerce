<?php

namespace Tests\Feature\Security;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PhaseOneSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_never_receives_an_admin_token(): void
    {
        User::create([
            'name' => 'Cliente',
            'email' => 'cliente@example.test',
            'password' => Hash::make('Password123!'),
            'role' => 'cliente',
            'status' => 'ATIVO',
        ]);

        $this->postJson('/api/admin/login', [
            'email' => 'cliente@example.test',
            'password' => 'Password123!',
        ])->assertUnauthorized()->assertJsonMissing(['token']);
    }

    public function test_inactive_admin_never_receives_an_admin_token(): void
    {
        User::create([
            'name' => 'Admin inativo',
            'email' => 'inativo@example.test',
            'password' => Hash::make('Password123!'),
            'role' => 'admin',
            'status' => 'SUSPENSO',
        ]);

        $this->postJson('/api/admin/login', [
            'email' => 'inativo@example.test',
            'password' => 'Password123!',
        ])->assertUnauthorized()->assertJsonMissing(['token']);
    }

    public function test_admin_token_is_revoked_on_logout(): void
    {
        User::create([
            'name' => 'Admin',
            'email' => 'admin@example.test',
            'password' => Hash::make('Password123!'),
            'role' => 'admin',
            'status' => 'ATIVO',
        ]);

        $login = $this->postJson('/api/admin/login', [
            'email' => 'admin@example.test',
            'password' => 'Password123!',
        ])->assertOk()->assertJsonStructure(['token', 'expires_at']);

        $token = $login->json('token');

        $this->withToken($token)
            ->postJson('/api/admin/logout')
            ->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_login_is_rate_limited_with_429(): void
    {
        for ($attempt = 1; $attempt <= 6; $attempt++) {
            $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.10'])
                ->postJson('/api/admin/login', [
                    'email' => 'rate-limit@example.test',
                    'password' => 'invalid-password',
                ])
                ->assertUnauthorized();
        }

        $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.10'])
            ->postJson('/api/admin/login', [
                'email' => 'rate-limit@example.test',
                'password' => 'invalid-password',
            ])
            ->assertStatus(429);
    }

    public function test_critical_public_routes_have_explicit_rate_limits(): void
    {
        $router = app('router');

        $login = $router->getRoutes()->match(Request::create('/api/admin/login', 'POST'));
        $checkout = $router->getRoutes()->match(Request::create('/api/storefront/checkout/summary', 'POST'));
        $tracking = $router->getRoutes()->match(Request::create('/api/tracking/collect', 'POST'));

        $this->assertContains('throttle:6,1', $login->gatherMiddleware());
        $this->assertContains('throttle:10,1', $checkout->gatherMiddleware());
        $this->assertContains('throttle:60,1', $tracking->gatherMiddleware());
    }

    public function test_admin_routes_require_authentication_and_admin_authorization(): void
    {
        $route = app('router')->getRoutes()->match(Request::create('/api/admin/customers', 'GET'));

        $this->assertContains('auth:sanctum', $route->gatherMiddleware());
        $this->assertContains('admin', $route->gatherMiddleware());

        $this->getJson('/api/admin/customers')->assertUnauthorized();
    }

    public function test_security_headers_are_present(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
            ->assertHeader('Content-Security-Policy');
    }
}
