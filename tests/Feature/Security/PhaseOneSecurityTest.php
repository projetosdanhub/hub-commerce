<?php

namespace Tests\Feature\Security;

use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class PhaseOneSecurityTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // A suíte reutiliza users e tokens para testar limites de autenticação.
        // A Fase 4 adiciona uma FK de user_sessions para tokens; remova a
        // dependência antes de reconstruir estas tabelas isoladas.
        Schema::dropIfExists('user_sessions');
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('users');

        Schema::create('users', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('role')->default('cliente');
            $table->string('status')->default('ATIVO');
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('personal_access_tokens', function (Blueprint $table): void {
            $table->id();
            $table->morphs('tokenable');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('users');

        parent::tearDown();
    }

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
        $checkout = $router->getRoutes()->match(Request::create('/api/storefront/checkout', 'POST'));
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
            ->assertHeader('X-Frame-Options', 'DENY')
            ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
            ->assertHeader('Content-Security-Policy');
    }
}

