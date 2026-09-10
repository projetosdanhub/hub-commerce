<?php

namespace App\Http\Controllers\Admin;

use App\Domain\ProviderConnections\ProviderAuthorizationService;
use App\Domain\ProviderConnections\ProviderAuthorizationUrlFactory;
use App\Domain\ProviderConnections\ProviderOAuthConfiguration;
use App\Domain\ProviderConnections\ProviderRegistry;
use App\Domain\Tenancy\TenantContextStore;
use App\Http\Controllers\Controller;
use App\Models\ProviderInstallation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProviderInstallationController extends Controller
{
    public function __construct(
        private readonly ProviderRegistry $providers,
        private readonly ProviderAuthorizationService $authorizations,
        private readonly ProviderAuthorizationUrlFactory $authorizationUrls,
        private readonly ProviderOAuthConfiguration $configuration,
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'catalog' => $this->providers->all(),
            'installations' => ProviderInstallation::query()
                ->where('tenant_id', $this->tenantId())
                ->whereNull('revoked_at')
                ->get()
                ->map(fn (ProviderInstallation $installation) => $this->present($installation)),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'provider' => ['required', 'string'],
            'environment' => ['required', Rule::in([ProviderRegistry::SANDBOX, ProviderRegistry::PRODUCTION])],
        ]);

        $definition = $this->providers->require($validated['provider']);

        $installation = ProviderInstallation::query()->firstOrCreate(
            [
                'tenant_id' => $this->tenantId(),
                'provider' => strtolower($validated['provider']),
                'environment' => $validated['environment'],
            ],
            [
                'connection_strategy' => $definition['strategy'],
                'status' => 'PENDING',
            ],
        );

        return response()->json(['installation' => $this->present($installation)], 201);
    }

    public function beginAuthorization(Request $request, ProviderInstallation $installation): JsonResponse
    {
        abort_unless($installation->tenant_id === $this->tenantId(), 404);
        abort_if($installation->connection_strategy === 'API_KEYS', 422, 'Este provedor usa chaves de API, não OAuth.');

        if ($installation->connection_strategy === 'CONNECT') {
            return response()->json([
                'installation' => $this->present($installation),
                'authorization' => [
                    'status' => 'CONNECT_ONBOARDING_REQUIRED',
                    'message' => 'O onboarding Stripe Connect será iniciado pelo fluxo dedicado da plataforma.',
                ],
            ], 409);
        }

        if (! $this->configuration->isConfigured($installation)) {
            return response()->json([
                'installation' => $this->present($installation),
                'authorization' => [
                    'status' => 'PLATFORM_CONFIGURATION_REQUIRED',
                    'message' => 'A credencial de plataforma deste ambiente ainda não está disponível no Cofre.',
                ],
            ], 409);
        }

        $started = $this->authorizations->begin($installation, $request->user());

        return response()->json([
            'installation' => $this->present($installation),
            'authorization' => [
                'status' => 'READY',
                'expires_at' => $started['expires_at'],
                'url' => $this->authorizationUrls->make($started['authorization'], $started['state']),
            ],
        ]);
    }

    public function revoke(ProviderInstallation $installation): JsonResponse
    {
        abort_unless($installation->tenant_id === $this->tenantId(), 404);

        $installation->forceFill([
            'status' => 'REVOKED',
            'revoked_at' => now(),
            'secret_ref' => null,
        ])->save();

        $installation->credential()->first()?->delete();

        return response()->json(['installation' => $this->present($installation)]);
    }

    private function tenantId(): int
    {
        return app(TenantContextStore::class)->require()->tenantId;
    }

    /**
     * @return array<string, mixed>
     */
    private function present(ProviderInstallation $installation): array
    {
        return [
            'id' => $installation->public_id,
            'provider' => $installation->provider,
            'environment' => $installation->environment,
            'strategy' => $installation->connection_strategy,
            'status' => $installation->status,
            'methods' => $this->providers->require($installation->provider)['methods'],
            'webhook_url' => $installation->webhookPath() === null ? null : rtrim((string) config('tenancy.webhook_base_url'), '/').$installation->webhookPath(),
            'connected_at' => optional($installation->connected_at)->toISOString(),
        ];
    }
}
