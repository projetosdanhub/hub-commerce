<?php

namespace App\Domain\ProviderConnections;

use App\Models\ProviderAuthorizationState;
use App\Models\ProviderInstallation;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class ProviderAuthorizationService
{
    public function consume(string $state): ProviderAuthorizationState
    {
        return DB::transaction(function () use ($state): ProviderAuthorizationState {
            $authorization = ProviderAuthorizationState::query()
                ->where('state_hash', hash('sha256', $state))
                ->lockForUpdate()
                ->firstOrFail();

            abort_if($authorization->consumed_at !== null || $authorization->expires_at->isPast(), 422, 'Autorização expirada ou já utilizada.');

            $authorization->forceFill(['consumed_at' => now()])->save();

            return $authorization->fresh(['installation']);
        });
    }

    /**
     * @return array{authorization: ProviderAuthorizationState, expires_at: string, state: string}
     */
    public function begin(ProviderInstallation $installation, User $user): array
    {
        $state = Str::random(80);
        $expiresAt = now()->addMinutes(10);
        $authorization = ProviderAuthorizationState::query()->create([
            'provider_installation_id' => $installation->getKey(),
            'user_id' => $user->getKey(),
            'state_hash' => hash('sha256', $state),
            'pkce_verifier' => $installation->connection_strategy === 'OAUTH' ? $this->pkceVerifier() : null,
            'expires_at' => $expiresAt,
        ]);

        return [
            'authorization' => $authorization->fresh(['installation']),
            'expires_at' => $expiresAt->toISOString(),
            'state' => $state,
        ];
    }

    private function pkceVerifier(): string
    {
        return rtrim(strtr(base64_encode(random_bytes(64)), '+/', '-_'), '=');
    }
}
