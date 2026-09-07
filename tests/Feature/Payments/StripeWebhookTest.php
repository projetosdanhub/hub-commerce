<?php

namespace Tests\Feature\Payments;

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
        $config = GlobalSetting::query()->firstOrNew(['group' => 'payments', 'key' => 'stripe']);
        $config->setSecureValue([
            'sandbox' => ['secret_key' => 'sk_test_123', 'webhook_secret' => $secret],
        ])->save();

        $payload = json_encode([
            'id' => 'evt_test_123',
            'type' => 'payment_intent.succeeded',
            'livemode' => false,
            'data' => ['object' => ['id' => 'pi_test_123']],
        ], JSON_THROW_ON_ERROR);
        $timestamp = now()->timestamp;
        $signature = 't='.$timestamp.',v1='.hash_hmac('sha256', $timestamp.'.'.$payload, $secret);

        $this->postJson('/api/webhooks/stripe/'.$tenant->slug, [], ['Stripe-Signature' => $signature], content: $payload)
            ->assertOk()
            ->assertJsonPath('duplicate', false);

        $this->postJson('/api/webhooks/stripe/'.$tenant->slug, [], ['Stripe-Signature' => $signature], content: $payload)
            ->assertOk()
            ->assertJsonPath('duplicate', true);

        $this->assertDatabaseCount('stripe_webhook_events', 1);
    }

    public function test_it_rejects_an_invalid_signature(): void
    {
        $tenant = Tenant::query()->create(['name' => 'Loja Inválida', 'slug' => 'loja-invalida']);

        $this->postJson('/api/webhooks/stripe/'.$tenant->slug, [], ['Stripe-Signature' => 't=1,v1=invalid'], content: '{}')
            ->assertStatus(400);
    }
}
