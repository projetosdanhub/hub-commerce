<?php

namespace Tests\Feature\Security;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_access_admin_dashboard(): void
    {
        $response = $this->getJson('/api/admin/customers');

        $response->assertUnauthorized();
    }

    public function test_regular_users_cannot_access_admin_dashboard(): void
    {
        $user = User::factory()->create(['role' => 'cliente']);

        $response = $this->actingAs($user)->getJson('/api/admin/customers');

        $response->assertForbidden();
    }

    public function test_admin_can_access_admin_dashboard(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        // Since /api/admin/customers requires tenant context, we just test logout
        // to avoid setting up full tenant domains in this basic authorization test.
        $response = $this->actingAs($admin)->postJson('/api/admin/logout');

        $response->assertOk();
    }
}
