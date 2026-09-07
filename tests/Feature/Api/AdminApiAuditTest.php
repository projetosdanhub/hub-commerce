<?php

namespace Tests\Feature\Api;

use App\Models\User;
use App\Models\Tenant;
use App\Models\TenantDomain;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;
use Database\Seeders\DatabaseSeeder;

class AdminApiAuditTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Ensure the full database seeding is run to populate a tenant, a domain and the admin user
        $this->seed(DatabaseSeeder::class);
    }

    public function test_admin_api_endpoints_respond_with_2xx_status()
    {
        // 1. Get the seeded tenant and domain
        $tenant = Tenant::where('slug', 'loja-inicial')->firstOrFail();
        $domain = TenantDomain::where('tenant_id', $tenant->id)
            ->where('domain', 'demo.hubcommerce.test')
            ->firstOrFail();

        // 2. Setup host so Tenant Middleware resolves it properly
        $this->withServerVariables(['HTTP_HOST' => $domain->domain]);

        // 3. Authenticate as the seeded admin
        $admin = User::where('email', 'admin@hubcommerce.com')->firstOrFail();
        $this->actingAs($admin, 'sanctum');

        // 4. List of endpoints to verify
        $endpoints = [
            '/api/admin/customers',
            '/api/admin/customers/metrics',
            '/api/admin/customers/vip-levels',
            '/api/admin/customers/settings',
            '/api/admin/categories',
            '/api/admin/menu',
            '/api/admin/products',
            '/api/admin/products/audits',
            '/api/admin/orders',
            '/api/admin/carriers',
            '/api/admin/carriers/audits',
            '/api/admin/shipping-packages',
            '/api/admin/melhorenvio/settings',
            '/api/admin/tracking/settings',
            '/api/admin/tracking/dashboard',
            '/api/admin/tracking/triggers',
            '/api/storefront',
        ];

        // 5. Audit all routes
        foreach ($endpoints as $endpoint) {
            $response = $this->getJson($endpoint);
            
            // Allow 200 OK or other successful 2xx states. 
            // Assert successful separately to show better error messages on failure.
            if (!$response->isSuccessful()) {
                dump("Endpoint failed: {$endpoint}");
                dump("Status: {$response->status()}");
                dump("Content: {$response->getContent()}");
            }
            $response->assertSuccessful();
        }
    }

    public function test_app_catalog_returns_only_safe_configuration_metadata(): void
    {
        $tenant = Tenant::where('slug', 'loja-inicial')->firstOrFail();
        $domain = TenantDomain::where('tenant_id', $tenant->id)
            ->where('domain', 'demo.hubcommerce.test')
            ->firstOrFail();

        $this->withServerVariables(['HTTP_HOST' => $domain->domain]);
        $this->actingAs(User::where('email', 'admin@hubcommerce.com')->firstOrFail(), 'sanctum');

        $this->getJson('/api/admin/settings/apps')
            ->assertSuccessful()
            ->assertJsonPath('0.key', 'logistics')
            ->assertJsonStructure([
                '*' => [
                    'key',
                    'name',
                    'description',
                    'installed',
                    'status',
                    'location',
                    'configuration' => [
                        'environment',
                        'credential_configured',
                    ],
                ],
            ])
            ->assertJsonMissing([
                'access_token',
                'api_token',
                'certificate_password',
            ]);
    }

}
