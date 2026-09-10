<?php

namespace App\Http\Controllers\Webhooks;

use App\Domain\Payments\StripeWebhookProcessor;
use App\Domain\Tenancy\TenantContext;
use App\Domain\Tenancy\TenantContextStore;
use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class StripeWebhookController extends Controller
{
    public function __construct(
        private readonly StripeWebhookProcessor $processor,
        private readonly TenantContextStore $tenants,
    ) {}

    public function handle(Request $request, Tenant $tenant): JsonResponse
    {
        try {
            $processed = $this->tenants->run(
                TenantContext::fromTenant($tenant),
                fn (): bool => $this->processor->process($request->getContent(), $request->header('Stripe-Signature')),
            );
        } catch (InvalidArgumentException|\JsonException|\App\Domain\Payments\StripeGatewayUnavailableException) {
            return response()->json(['message' => 'Webhook inválido.'], 400);
        }

        return response()->json(['received' => true, 'duplicate' => ! $processed]);
    }
}
