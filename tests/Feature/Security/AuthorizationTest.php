<?php

namespace Tests\Feature\Security;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_access_an_administrative_api_route(): void
    {
        $this->getJson('/api/admin/customers')->assertUnauthorized();
    }

    public function test_regular_users_cannot_access_an_administrative_api_route(): void
    {
        $user = User::factory()->create(['role' => 'cliente']);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/admin/customers')
            ->assertForbidden();
    }

    public function test_admin_shell_remains_available_for_client_side_routing(): void
    {
        $this->get('/admin')->assertOk();
    }
}
