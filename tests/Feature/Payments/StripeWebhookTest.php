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
        $secret = hash('sha256', 'stripe-webhook-fixture-legacy');
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
        $secret = hash('sha256', 'stripe-webhook-fixture');
        $this->configureStripe($tenant, $secret);
        $attempt = $this->pendingAttempt($tenant, 'pi_test_sync');

        $payload = json_encode([
            'id' => 'evt_test_sync',
            'type' => 'payment_intent.succeeded',
            'livemode' => false,
            'data' => ['object' => ['id' => 'pi_test_sync', 'amount' => 10000, 'amount_received' => 10000, 'currency' => 'brl']],
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
        $this->configureStripe($tenant, hash('sha256', 'stripe-webhook-fixture-invalid'));

        $this->call('POST', '/api/webhooks/stripe/'.$tenant->slug, [], [], [], ['HTTP_STRIPE_SIGNATURE' => 't=1,v1=invalid'], '{}')
            ->assertStatus(400);
    }

    public function test_late_failure_does_not_downgrade_a_paid_attempt(): void
    {
        $tenant = Tenant::query()->create(['name' => 'Loja eventos', 'slug' => 'loja-eventos']);
        $secret = hash('sha256', 'events-fixture');
        $this->configureStripe($tenant, $secret);
        $attempt = $this->pendingAttempt($tenant, 'pi_sequence');
        foreach (['payment_intent.succeeded', 'payment_intent.payment_failed', 'payment_intent.canceled'] as $type) {
            $payload = json_encode([
                'id' => 'evt_'.$type,
                'type' => $type,
                'livemode' => false,
                'data' => ['object' => ['id' => 'pi_sequence', 'amount' => 10000, 'amount_received' => 10000, 'currency' => 'brl']],
            ], JSON_THROW_ON_ERROR);
            $this->call('POST', '/api/webhooks/stripe/'.$tenant->slug, [], [], [], [
                'HTTP_STRIPE_SIGNATURE' => $this->signature($payload, $secret),
            ], $payload)->assertOk();
        }
        app(TenantContextStore::class)->run(TenantContext::fromTenant($tenant), function () use ($attempt): void {
            $this->assertSame(PaymentAttemptStatus::SUCCEEDED, $attempt->fresh()->status);
            $this->assertSame(OrderStatus::PICKING, $attempt->order->fresh()->status);
        });
        $this->assertDatabaseCount('order_histories', 1);
    }

    public function test_signed_payment_with_wrong_amount_or_currency_cannot_fulfill_order(): void
    {
        $tenant = Tenant::query()->create(['name' => 'Loja valores', 'slug' => 'loja-valores']);
        $secret = hash('sha256', 'amount-fixture');
        $this->configureStripe($tenant, $secret);
        $attempt = $this->pendingAttempt($tenant, 'pi_amount');
        foreach ([[1, 1, 'brl'], [10000, 10000, 'usd'], [10000, 9000, 'brl']] as [$amount, $received, $currency]) {
            $payload = json_encode([
                'id' => 'evt_amount_'.$currency.'_'.$received,
                'type' => 'payment_intent.succeeded',
                'livemode' => false,
                'data' => ['object' => ['id' => 'pi_amount', 'amount' => $amount, 'amount_received' => $received, 'currency' => $currency]],
            ], JSON_THROW_ON_ERROR);
            $this->call('POST', '/api/webhooks/stripe/'.$tenant->slug, [], [], [], [
                'HTTP_STRIPE_SIGNATURE' => $this->signature($payload, $secret),
            ], $payload)->assertStatus(400);
        }
        $this->assertDatabaseCount('stripe_webhook_events', 0);
        app(TenantContextStore::class)->run(TenantContext::fromTenant($tenant), function () use ($attempt): void {
            $this->assertSame(PaymentAttemptStatus::PENDING, $attempt->fresh()->status);
            $this->assertSame(OrderStatus::AWAITING_PAYMENT, $attempt->order->fresh()->status);
        });
    }

    public function test_signature_rotation_accepts_any_valid_v1_signature_and_rejects_stale_timestamp(): void
    {
        $tenant = Tenant::query()->create(['name' => 'Loja rotação', 'slug' => 'loja-rotacao']);
        $secret = hash('sha256', 'rotation-fixture');
        $this->configureStripe($tenant, $secret);
        $payload = json_encode(['id' => 'evt_rotation', 'type' => 'unhandled', 'livemode' => false], JSON_THROW_ON_ERROR);
        $this->call('POST', '/api/webhooks/stripe/'.$tenant->slug, [], [], [], [
            'HTTP_STRIPE_SIGNATURE' => $this->signature($payload, $secret).',v1=retired',
        ], $payload)->assertOk();
        $timestamp = now()->subMinutes(6)->timestamp;
        $this->call('POST', '/api/webhooks/stripe/'.$tenant->slug, [], [], [], [
            'HTTP_STRIPE_SIGNATURE' => 't='.$timestamp.',v1='.hash_hmac('sha256', $timestamp.'.'.$payload, $secret),
        ], $payload)->assertStatus(400);
    }

    public function test_malformed_json_returns_a_safe_client_error(): void
    {
        $tenant = Tenant::query()->create(['name' => 'Loja JSON', 'slug' => 'loja-json']);
        $this->call('POST', '/api/webhooks/stripe/'.$tenant->slug, [], [], [], [], '{')->assertStatus(400);
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
                'idempotency_key' => (string) \Illuminate\Support\Str::uuid(),
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
