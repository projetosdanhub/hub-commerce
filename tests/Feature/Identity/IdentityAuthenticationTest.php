<?php

namespace Tests\Feature\Identity;

use App\Domain\Identity\TenantRoleProvisioningService;
use App\Models\Tenant;
use App\Models\TenantMembership;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class IdentityAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_membership_based_administrator_receives_scoped_session_and_can_logout(): void
    {
        config()->set('identity.legacy_admin_access', false);
        $tenant = Tenant::query()->create([
            'name' => 'Loja de Teste',
            'slug' => 'loja-de-teste',
            'status' => Tenant::STATUS_ACTIVE,
        ]);
        $user = User::query()->create([
            'name' => 'Administrador por membership',
            'email' => 'membership@hub.test',
            'email_verified_at' => now(),
            'password' => Hash::make('SenhaForte123!'),
            'role' => 'cliente',
            'status' => 'ATIVO',
        ]);
        $role = app(TenantRoleProvisioningService::class)->provisionSystemRoles($tenant);
        $membership = TenantMembership::query()->create([
            'tenant_id' => $tenant->getKey(),
            'user_id' => $user->getKey(),
            'status' => TenantMembership::STATUS_ACTIVE,
            'authorization_version' => 1,
            'joined_at' => now(),
        ]);
        $membership->syncRoles([$role->getKey()]);

        $login = $this->postJson('/api/admin/login', [
            'email' => $user->email,
            'password' => 'SenhaForte123!',
        ])->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonFragment(['access' => ['admin', 'tenant']]);

        $token = $login->json('token');

        $this->assertDatabaseHas('user_sessions', ['user_id' => $user->getKey(), 'revoked_at' => null]);

        $this->withToken($token)
            ->postJson('/api/admin/logout')
            ->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);
        $this->assertDatabaseMissing('user_sessions', ['user_id' => $user->getKey(), 'revoked_at' => null]);
    }

    public function test_existing_admin_routes_receive_resource_permissions_in_the_backend(): void
    {
        $router = app('router');
        $customers = $router->getRoutes()->match(Request::create('/api/admin/customers', 'GET'));
        $orders = $router->getRoutes()->match(Request::create('/api/admin/orders', 'GET'));
        $settings = $router->getRoutes()->match(Request::create('/api/admin/settings/general', 'GET'));

        $this->assertContains('tenant.permission:tenant.customers.view', $customers->gatherMiddleware());
        $this->assertContains('tenant.permission:tenant.orders.view', $orders->gatherMiddleware());
        $this->assertContains('tenant.permission:tenant.settings.view', $settings->gatherMiddleware());
    }
}
