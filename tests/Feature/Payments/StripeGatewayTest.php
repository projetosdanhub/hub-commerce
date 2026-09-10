<?php

namespace Tests\Feature\Payments;

use App\Domain\Payments\PaymentAttemptStatus;
use App\Domain\Payments\PaymentAuthorization;
use App\Domain\Payments\StripeGateway;
use App\Domain\Payments\StripeGatewayUnavailableException;
use App\Domain\Tenancy\TenantContext;
use App\Domain\Tenancy\TenantContextStore;
use App\Models\GlobalSetting;
use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class StripeGatewayTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::query()->create([
            'name' => 'Loja Stripe',
            'slug' => 'loja-stripe',
        ]);
        app(TenantContextStore::class)->set(TenantContext::fromTenant($this->tenant, 'stripe.test'));
    }

    protected function tearDown(): void
    {
        app(TenantContextStore::class)->clear();

        parent::tearDown();
    }

    public function test_it_simulates_a_sandbox_payment_intent_with_the_official_stripe_contract(): void
    {
        $this->configureStripe('sandbox', [
            'publishable_key' => 'pk_test_123',
            'secret_key' => 'sk_test_123',
            'webhook_secret' => 'whsec_'.'test_123',
        ]);

        Http::fake([
            'https://api.stripe.com/v1/payment_intents' => Http::response([
                'id' => 'pi_test_123',
                'status' => 'requires_action',
                'next_action' => [
                    'redirect_to_url' => [
                        'url' => 'https://hooks.stripe.test/next-action',
                    ],
                ],
            ]),
        ]);

        $result = app(StripeGateway::class)->initiate(new PaymentAuthorization(
            'payment-attempt-reference',
            12_500,
            'BRL',
            'pm_test_123',
            'SANDBOX',
        ));

        $this->assertSame('pi_test_123', $result->gatewayPaymentId);
        $this->assertSame(PaymentAttemptStatus::PENDING, $result->status);
        $this->assertSame('https://hooks.stripe.test/next-action', $result->customerActionUrl);

        Http::assertSent(function (Request $request): bool {
            return $request->url() === 'https://api.stripe.com/v1/payment_intents'
                && $request->hasHeader('Idempotency-Key', 'payment-attempt-reference')
                && str_contains($request->body(), 'amount=12500')
                && str_contains($request->body(), 'currency=brl')
                && str_contains($request->body(), 'payment_method=pm_test_123');
        });
    }

    public function test_it_selects_the_production_credential_without_allowing_local_approval(): void
    {
        $this->configureStripe('production', [
            'publishable_key' => 'pk_live_123',
            'secret_key' => 'sk_live_123',
            'webhook_secret' => 'whsec_'.'live_123',
        ]);

        Http::fake([
            'https://api.stripe.com/v1/payment_intents' => Http::response([
                'id' => 'pi_live_123',
                'status' => 'succeeded',
            ]),
        ]);

        $result = app(StripeGateway::class)->initiate(new PaymentAuthorization(
            'production-attempt-reference',
            9_900,
            'BRL',
            'pm_live_123',
            'PRODUCTION',
        ));

        $this->assertSame('pi_live_123', $result->gatewayPaymentId);
        $this->assertSame(
            PaymentAttemptStatus::PENDING,
            $result->status,
            'Somente o webhook assinado poderá confirmar a tentativa.',
        );

        Http::assertSent(function (Request $request): bool {
            return $request->hasHeader('Authorization', 'Basic '.base64_encode('sk_live_123:'));
        });
    }

    public function test_it_blocks_the_gateway_without_a_credential_and_never_fakes_an_approval(): void
    {
        Http::fake();

        $this->expectException(StripeGatewayUnavailableException::class);

        try {
            app(StripeGateway::class)->initiate(new PaymentAuthorization(
                'missing-credential-reference',
                5_000,
                'BRL',
                'pm_test_123',
                'SANDBOX',
            ));
        } finally {
            Http::assertNothingSent();
        }
    }

    public function test_retry_retrieves_the_existing_intent_instead_of_creating_a_new_charge(): void
    {
        $this->configureStripe('sandbox', ['secret_key' => 'sk_test_123', 'publishable_key' => 'pk_test_123']);
        $attempt = new \App\Models\PaymentAttempt([
            'gateway_payment_id' => 'pi_existing', 'environment' => 'SANDBOX',
            'amount_cents' => 1200, 'currency' => 'BRL', 'idempotency_key' => 'attempt-fixture',
            'initiated_at' => now()->subDays(2),
        ]);
        Http::fake(['*' => Http::response([
            'id' => 'pi_existing', 'client_secret' => 'client-fixture', 'amount' => 1200, 'currency' => 'brl', 'livemode' => false,
        ])]);
        $result = app(\App\Domain\Payments\StripePaymentIntentCreator::class)->create($attempt);
        $this->assertSame('pi_existing', $result['id']);
        Http::assertSent(fn (Request $request): bool => $request->method() === 'GET' && str_ends_with($request->url(), '/pi_existing'));
        Http::assertSentCount(1);
    }

    public function test_stale_unresolved_attempt_is_not_reposted_after_provider_idempotency_expires(): void
    {
        $this->configureStripe('sandbox', ['secret_key' => 'sk_test_123', 'publishable_key' => 'pk_test_123']);
        $attempt = new \App\Models\PaymentAttempt([
            'environment' => 'SANDBOX', 'amount_cents' => 1200, 'currency' => 'BRL',
            'idempotency_key' => 'attempt-fixture', 'initiated_at' => now()->subDays(2),
        ]);
        Http::fake();
        $this->expectException(StripeGatewayUnavailableException::class);
        try {
            app(\App\Domain\Payments\StripePaymentIntentCreator::class)->create($attempt);
        } finally {
            Http::assertNothingSent();
        }
    }

    /**
     * @param  array<string, string>  $credentials
     */
    private function configureStripe(string $environment, array $credentials): void
    {
        $config = GlobalSetting::query()->firstOrNew([
            'group' => 'payments',
            'key' => 'stripe',
        ]);
        $config->setSecureValue([
            'active_environment' => strtoupper($environment),
            $environment => $credentials,
        ])->save();
    }
}
