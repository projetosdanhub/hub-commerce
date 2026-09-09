<?php

namespace App\Http\Controllers\Webhooks;

use App\Domain\ProviderConnections\ProviderAuthorizationService;
use App\Domain\ProviderConnections\ProviderOAuthConfiguration;
use App\Domain\ProviderConnections\ProviderOAuthTokenExchangeException;
use App\Domain\ProviderConnections\ProviderOAuthTokenExchangeService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProviderAuthorizationCallbackController extends Controller
{
    public function __construct(
        private readonly ProviderAuthorizationService $authorizations,
        private readonly ProviderOAuthConfiguration $configuration,
        private readonly ProviderOAuthTokenExchangeService $tokens,
    ) {}

    public function handle(Request $request, string $provider): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:4000'],
            'state' => ['required', 'string', 'max:200'],
        ]);

        $provider = strtolower($provider);
        $authorization = $this->authorizations->consume($validated['state']);
        $installation = $authorization->installation;

        abort_unless($installation !== null && $installation->provider === $provider, 404);
        abort_unless($this->configuration->isConfigured($installation), 409, 'A credencial de plataforma deste ambiente não está disponível.');

        try {
            $this->tokens->exchange($authorization, $validated['code']);
        } catch (ProviderOAuthTokenExchangeException) {
            return response()->json([
                'code' => 'PROVIDER_AUTHORIZATION_FAILED',
                'message' => 'Não foi possível concluir a conexão com o provedor. Inicie uma nova autorização.',
            ], 422);
        }

        return response()->json([
            'installation' => [
                'id' => $installation->public_id,
                'provider' => $installation->provider,
                'environment' => $installation->environment,
                'status' => 'CONNECTED',
            ],
        ])->header('Cache-Control', 'no-store, private');
    }
}
