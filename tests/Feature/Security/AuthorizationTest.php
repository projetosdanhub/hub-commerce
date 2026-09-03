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
        $response = $this->get('/admin');

        $response->assertRedirect('/login');
    }

    public function test_regular_users_cannot_access_admin_dashboard(): void
    {
        $user = User::factory()->create(['role' => 'cliente']);

        $response = $this->actingAs($user)->get('/admin');

        // Can be 403 or redirect, let's check what the middleware does
        // For now, assert forbidden or redirect
        $this->assertTrue(in_array($response->status(), [403, 302]), "Status is " . $response->status());
    }

    public function test_admin_can_access_admin_dashboard(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->get('/admin');

        $response->assertStatus(200);
    }
}
