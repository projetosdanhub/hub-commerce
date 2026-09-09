<?php

namespace Tests\Feature\Payments;

use App\Domain\Payments\PaymentAttemptStatus;
use App\Domain\Tenancy\TenantContext;
use App\Domain\Tenancy\TenantContextStore;
use App\Enums\OrderStatus;
use App\Models\GlobalSetting;
use App\Models\Order;
use App\Models\PaymentAttempt;
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

    public function test_it_moves_the_order_forward_only_after_a_confirmed_payment_intent(): void
    {
        $tenant = Tenant::query()->create(['name' => 'Loja sincronizada', 'slug' => 'loja-sincronizada']);
        $secret = hash('sha256', 'stripe-webhook-test-secret');
        $this->configureStripe($tenant, $secret);
        $attempt = $this->pendingAttempt($tenant, 'pi_test_sync');

        $payload = json_encode([
            'id' => 'evt_test_sync',
            'type' => 'payment_intent.succeeded',
            'livemode' => false,
            'data' => ['object' => ['id' => 'pi_test_sync']],
        ], JSON_THROW_ON_ERROR);

        $this->call('POST', '/api/webhooks/stripe/'.$tenant->slug, [], [], [], [
            'HTTP_STRIPE_SIGNATURE' => $this->signature($payload, $secret),
        ], $payload)->assertOk();

        app(TenantContextStore::class)->run(TenantContext::fromTenant($tenant), function () use ($attempt): void {
            $this->assertSame(PaymentAttemptStatus::SUCCEEDED, $attempt->fresh()->status);
            $this->assertSame(OrderStatus::PICKING, $attempt->order->fresh()->status);
        });

        $this->assertDatabaseHas('order_histories', [
            'order_id' => $attempt->order_id,
            'event' => 'Pagamento confirmado pelo webhook Stripe.',
        ]);
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

    private function pendingAttempt(Tenant $tenant, string $paymentIntentId): PaymentAttempt
    {
        return app(TenantContextStore::class)->run(TenantContext::fromTenant($tenant), function () use ($paymentIntentId): PaymentAttempt {
            $order = Order::query()->create([
                'subtotal' => 100,
                'total' => 100,
                'status' => OrderStatus::AWAITING_PAYMENT,
                'payment_gateway' => 'stripe',
                'payment_method' => 'CARD',
            ]);

            return PaymentAttempt::query()->create([
                'order_id' => $order->getKey(),
                'gateway' => 'stripe',
                'environment' => 'SANDBOX',
                'payment_method' => 'CARD',
                'status' => PaymentAttemptStatus::PENDING,
                'idempotency_key' => 'd8a08f7c-6bf6-49ab-8ef7-2c87559c9d11',
                'checkout_fingerprint' => hash('sha256', $paymentIntentId),
                'amount_cents' => 10000,
                'currency' => 'BRL',
                'gateway_payment_id' => $paymentIntentId,
                'initiated_at' => now(),
            ]);
        });
    }

    private function signature(string $payload, string $secret): string
    {
        $timestamp = now()->timestamp;

        return 't='.$timestamp.',v1='.hash_hmac('sha256', $timestamp.'.'.$payload, $secret);
    }
}
