<?php

namespace Tests\Feature\Payments;

use App\Domain\Tenancy\TenantContext;
use App\Domain\Tenancy\TenantContextStore;
use App\Models\GlobalSetting;
use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StripeWebhookTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_accepts_a_signed_event_once_and_ignores_replay(): void
    {
        $tenant = Tenant::query()->create(['name' => 'Loja Webhook', 'slug' => 'loja-webhook']);
        $secret = 'whsec_'.'test_123';
        $this->configureStripe($tenant, $secret);
        $payload = json_encode([
            'id' => 'evt_test_123',
            'type' => 'payment_intent.succeeded',
            'livemode' => false,
            'data' => ['object' => ['id' => 'pi_test_123']],
        ], JSON_THROW_ON_ERROR);
        $signature = $this->signature($payload, $secret);

        $this->call('POST', '/api/webhooks/stripe/'.$tenant->slug, [], [], [], ['HTTP_STRIPE_SIGNATURE' => $signature], $payload)
            ->assertOk()
            ->assertJsonPath('duplicate', false);

        $this->call('POST', '/api/webhooks/stripe/'.$tenant->slug, [], [], [], ['HTTP_STRIPE_SIGNATURE' => $signature], $payload)
            ->assertOk()
            ->assertJsonPath('duplicate', true);

        $this->assertDatabaseCount('stripe_webhook_events', 1);
    }

    public function test_it_rejects_an_invalid_signature(): void
    {
        $tenant = Tenant::query()->create(['name' => 'Loja Inválida', 'slug' => 'loja-invalida']);
        $this->configureStripe($tenant, 'whsec_'.'test_123');

        $this->call('POST', '/api/webhooks/stripe/'.$tenant->slug, [], [], [], ['HTTP_STRIPE_SIGNATURE' => 't=1,v1=invalid'], '{}')
            ->assertStatus(400);
    }

    private function configureStripe(Tenant $tenant, string $secret): void
    {
        app(TenantContextStore::class)->run(TenantContext::fromTenant($tenant), function () use ($secret): void {
            $config = GlobalSetting::query()->firstOrNew(['group' => 'payments', 'key' => 'stripe']);
            $config->setSecureValue([
                'sandbox' => ['secret_key' => 'sk_test_123', 'webhook_secret' => $secret],
            ])->save();
        });
    }

    private function signature(string $payload, string $secret): string
    {
        $timestamp = now()->timestamp;

        return 't='.$timestamp.',v1='.hash_hmac('sha256', $timestamp.'.'.$payload, $secret);
    }
}
