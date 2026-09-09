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
        return response()->json([
            'records' => PlatformSecretRecord::query()
                ->orderBy('provider')
                ->orderBy('purpose')
                ->orderBy('environment')
                ->get()
                ->map(fn (PlatformSecretRecord $record) => $this->present($record)),
        ]);
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
        ];
    }
}
