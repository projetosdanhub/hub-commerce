<?php

namespace App\Http\Controllers\Identity;

use App\Domain\Identity\AuthorizationAuditLogger;
use App\Http\Controllers\Controller;
use App\Models\PlatformSecretRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PlatformVaultController extends Controller
{
    public function __construct(private readonly AuthorizationAuditLogger $audit) {}

    public function revoke(Request $request, PlatformSecretRecord $record): JsonResponse
    {
        $record = DB::transaction(function () use ($request, $record): PlatformSecretRecord {
            $record = PlatformSecretRecord::query()
                ->lockForUpdate()
                ->findOrFail($record->getKey());

            if ($record->status === 'REVOKED') {
                return $record;
            }

            $before = [
                'provider' => $record->provider,
                'purpose' => $record->purpose,
                'environment' => $record->environment,
                'status' => $record->status,
                'rotated_at' => $record->rotated_at?->toISOString(),
            ];

            $record->forceFill([
                'status' => 'REVOKED',
                'revoked_at' => now(),
                'secret_ref' => null,
            ])->save();

            $this->audit->record(
                'platform',
                'platform.vault.revoked',
                $request->user(),
                target: $record,
                before: $before,
                after: [
                    'provider' => $record->provider,
                    'purpose' => $record->purpose,
                    'environment' => $record->environment,
                    'status' => $record->status,
                    'revoked_at' => $record->revoked_at?->toISOString(),
                ],
                request: $request,
            );

            return $record->fresh();
        });

        return response()->json($this->present($record));
    }

    public function index(): JsonResponse
    {
        $stored = PlatformSecretRecord::query()
            ->orderBy('provider')
            ->orderBy('purpose')
            ->orderBy('environment')
            ->get()
            ->keyBy(fn (PlatformSecretRecord $record): string => $this->recordKey(
                $record->provider,
                $record->purpose,
                $record->environment,
            ));

        $expected = collect($this->expectedRecords())
            ->map(function (array $definition) use ($stored): array {
                $record = $stored->get($this->recordKey(
                    $definition['provider'],
                    $definition['purpose'],
                    $definition['environment'],
                ));

                if ($record instanceof PlatformSecretRecord) {
                    return $this->present($record);
                }

                return [
                    'id' => null,
                    ...$definition,
                    'status' => $definition['configured'] ? 'CONFIGURED' : 'UNCONFIGURED',
                    'rotated_at' => null,
                    'revoked_at' => null,
                ];
            });

        $additional = $stored
            ->reject(fn (PlatformSecretRecord $record): bool => collect($this->expectedRecords())
                ->contains(fn (array $definition): bool => $this->recordKey(
                    $definition['provider'],
                    $definition['purpose'],
                    $definition['environment'],
                ) === $this->recordKey($record->provider, $record->purpose, $record->environment)))
            ->map(fn (PlatformSecretRecord $record): array => $this->present($record));

        return response()->json(['records' => $expected->concat($additional)->values()]);
    }

    /**
     * @return array<int, array{provider: string, purpose: string, environment: string, configured: bool, credential_location: string}>
     */
    private function expectedRecords(): array
    {
        return [
            $this->expectedOAuthRecord('mercado_pago', 'SANDBOX'),
            $this->expectedOAuthRecord('mercado_pago', 'PRODUCTION'),
            $this->expectedOAuthRecord('pagbank', 'SANDBOX'),
            $this->expectedOAuthRecord('pagbank', 'PRODUCTION'),
            $this->expectedOAuthRecord('melhor_envio', 'SANDBOX', requireUserAgent: true),
            $this->expectedOAuthRecord('melhor_envio', 'PRODUCTION', requireUserAgent: true),
            [
                'provider' => 'stripe',
                'purpose' => 'CONNECT_PLATFORM',
                'environment' => 'PLATFORM',
                'configured' => filled(config('provider-connections.stripe.secret_key')),
                'credential_location' => 'Secret Manager / variável protegida da infraestrutura',
            ],
        ];
    }

    /**
     * @return array{provider: string, purpose: string, environment: string, configured: bool, credential_location: string}
     */
    private function expectedOAuthRecord(string $provider, string $environment, bool $requireUserAgent = false): array
    {
        $configured = filled(config('provider-connections.'.$provider.'.client_id'))
            && filled(config('provider-connections.'.$provider.'.client_secret'));

        if ($requireUserAgent) {
            $configured = $configured && filled(config('provider-connections.'.$provider.'.user_agent'));
        }

        return [
            'provider' => $provider,
            'purpose' => 'OAUTH_APPLICATION',
            'environment' => $environment,
            'configured' => $configured,
            'credential_location' => 'Secret Manager / variável protegida da infraestrutura',
        ];
    }

    private function recordKey(string $provider, string $purpose, string $environment): string
    {
        return strtolower($provider.'|'.$purpose.'|'.$environment);
    }

    /**
     * @return array<string, int|string|null>
     */
    private function present(PlatformSecretRecord $record): array
    {
        return [
            'id' => $record->getKey(),
            'provider' => $record->provider,
            'purpose' => $record->purpose,
            'environment' => $record->environment,
            'status' => $record->status,
            'rotated_at' => $record->rotated_at?->toISOString(),
            'revoked_at' => $record->revoked_at?->toISOString(),
            'credential_location' => 'Secret Manager / variável protegida da infraestrutura',
        ];
    }
}
