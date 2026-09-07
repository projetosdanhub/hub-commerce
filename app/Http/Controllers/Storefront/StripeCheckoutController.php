<?php

namespace App\Http\Controllers\Storefront;

use App\Domain\Orders\CheckoutOrderCommand;
use App\Domain\Orders\CheckoutOrderCreator;
use App\Domain\Payments\StripeGatewayConfiguration;
use App\Domain\Payments\StripeGatewayUnavailableException;
use App\Domain\Payments\StripePaymentIntentCreator;
use App\Http\Controllers\Controller;
use App\Http\Requests\Storefront\CreateStripePaymentIntentRequest;
use App\Models\PaymentAttempt;
use App\Models\StorefrontCustomer;
use App\Models\TenantAppInstallation;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use Laravel\Sanctum\PersonalAccessToken;

class StripeCheckoutController extends Controller
{
    public function store(
        CreateStripePaymentIntentRequest $request,
        CheckoutOrderCreator $orders,
        StripeGatewayConfiguration $configuration,
        StripePaymentIntentCreator $stripe,
    ): JsonResponse {
        $accessToken = PersonalAccessToken::findToken((string) $request->bearerToken());
        $customer = $accessToken?->tokenable;

        if (! ($customer instanceof StorefrontCustomer) || ! $accessToken->can('storefront.checkout')) {
            abort(403);
        }

        $this->assertStripeInstalled();

        try {
            $environment = $configuration->safeStatus()['active_environment'];
            $result = $orders->create(new CheckoutOrderCommand(
                $customer->getKey(),
                $request->validated('items'),
                $request->validated('address'),
                $request->validated('shipping_quote_token'),
                'stripe',
                $environment,
                'CARD',
                $request->validated('idempotency_key'),
            ));
            $intent = $stripe->create($result->paymentAttempt);

            DB::transaction(function () use ($result, $intent): void {
                $attempt = PaymentAttempt::query()
                    ->whereKey($result->paymentAttempt->getKey())
                    ->lockForUpdate()
                    ->firstOrFail();
                $attempt->update(['gateway_payment_id' => $intent['id']]);
            });

            return response()->json([
                'data' => [
                    'order_id' => $result->order->getKey(),
                    'payment_attempt_id' => $result->paymentAttempt->getKey(),
                    'client_secret' => $intent['client_secret'],
                    'publishable_key' => $intent['publishable_key'],
                ],
            ])->header('Cache-Control', 'no-store, private');
        } catch (StripeGatewayUnavailableException) {
            return response()->json([
                'code' => 'STRIPE_UNAVAILABLE',
                'message' => 'O pagamento por cartão não está disponível nesta loja.',
            ], 422);
        } catch (DomainException|InvalidArgumentException) {
            return response()->json([
                'code' => 'CHECKOUT_UNAVAILABLE',
                'message' => 'Revise o carrinho e a entrega antes de continuar.',
            ], 422);
        }
    }

    private function assertStripeInstalled(): void
    {
        $installed = TenantAppInstallation::query()
            ->where('app_key', 'stripe')
            ->where('status', 'INSTALLED')
            ->exists();

        if (! $installed) {
            abort(409, 'O app Stripe precisa estar instalado nesta loja.');
        }
    }
}
