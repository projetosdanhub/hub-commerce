<?php

namespace App\Domain\Identity;

use App\Models\User;
use App\Models\UserMfaMethod;
use App\Models\UserMfaRecoveryCode;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

final class MfaService
{
    public function __construct(
        private readonly TotpService $totp,
        private readonly IdentityAccessService $access,
        private readonly AuthorizationAuditLogger $audit,
    ) {
    }

    /**
     * @return array{secret: string, otpauth_uri: string}
     */
    public function beginEnrollment(User $user): array
    {
        if (! $this->access->hasAdministrativeAccess($user)) {
            throw new \Illuminate\Auth\Access\AuthorizationException('A autenticação multifator é reservada a contas administrativas.');
        }

        $this->ensureStorageIsAvailable();

        $method = UserMfaMethod::query()->firstOrNew([
            'user_id' => $user->getKey(),
            'type' => UserMfaMethod::TYPE_TOTP,
        ]);

        if ($method->isConfirmed()) {
            throw new \DomainException('A autenticação multifator já está habilitada.');
        }

        $secret = $this->totp->generateSecret();
        $method->forceFill([
            'secret' => $secret,
            'confirmed_at' => null,
            'last_used_at' => null,
        ])->save();

        return [
            'secret' => $secret,
            'otpauth_uri' => $this->totp->provisioningUri((string) config('identity.mfa.issuer'), $user->email, $secret),
        ];
    }

    /**
     * @return list<string>
     */
    public function confirmEnrollment(User $user, string $code): array
    {
        return DB::transaction(function () use ($user, $code): array {
            $method = UserMfaMethod::query()
                ->where('user_id', $user->getKey())
                ->where('type', UserMfaMethod::TYPE_TOTP)
                ->lockForUpdate()
                ->first();

            if ($method === null || $method->isConfirmed() || ! $this->totp->verify($method->secret, $code)) {
                throw new \InvalidArgumentException('Código de autenticação inválido.');
            }

            $method->forceFill(['confirmed_at' => now(), 'last_used_at' => now()])->save();
            UserMfaRecoveryCode::query()->where('user_id', $user->getKey())->delete();
            $recoveryCodes = $this->generateRecoveryCodes($user);

            $this->audit->record(
                'identity',
                'identity.mfa.enabled',
                $user,
                target: $method,
                after: ['recovery_codes_issued' => count($recoveryCodes)],
            );

            return $recoveryCodes;
        });
    }

    public function requiresChallenge(User $user): bool
    {
        return $this->isEnabled($user);
    }

    public function isEnabled(User $user): bool
    {
        if (! Schema::hasTable('user_mfa_methods')) {
            return false;
        }

        return UserMfaMethod::query()
            ->where('user_id', $user->getKey())
            ->where('type', UserMfaMethod::TYPE_TOTP)
            ->whereNotNull('confirmed_at')
            ->exists();
    }

    public function mustEnroll(User $user): bool
    {
        return (string) config('identity.mfa.enforcement') === 'required'
            && $this->access->hasAdministrativeAccess($user)
            && ! $this->isEnabled($user);
    }

    public function verifyChallenge(User $user, string $code): bool
    {
        if (! Schema::hasTable('user_mfa_methods')) {
            return false;
        }

        $method = UserMfaMethod::query()
            ->where('user_id', $user->getKey())
            ->where('type', UserMfaMethod::TYPE_TOTP)
            ->whereNotNull('confirmed_at')
            ->first();

        if ($method !== null && $this->totp->verify($method->secret, $code)) {
            $method->forceFill(['last_used_at' => now()])->save();

            return true;
        }

        return $this->consumeRecoveryCode($user, $code);
    }

    /**
     * @return list<string>
     */
    public function regenerateRecoveryCodes(User $user, string $code): array
    {
        if (! $this->verifyChallenge($user, $code)) {
            throw new \InvalidArgumentException('Código de autenticação inválido.');
        }

        return DB::transaction(function () use ($user): array {
            UserMfaRecoveryCode::query()->where('user_id', $user->getKey())->delete();
            $recoveryCodes = $this->generateRecoveryCodes($user);
            $this->audit->record('identity', 'identity.mfa.recovery_codes_regenerated', $user, context: ['count' => count($recoveryCodes)]);

            return $recoveryCodes;
        });
    }

    public function disable(User $user, string $code): void
    {
        if (! $this->verifyChallenge($user, $code)) {
            throw new \InvalidArgumentException('Código de autenticação inválido.');
        }

        DB::transaction(function () use ($user): void {
            UserMfaMethod::query()->where('user_id', $user->getKey())->delete();
            UserMfaRecoveryCode::query()->where('user_id', $user->getKey())->delete();
            $this->audit->record('identity', 'identity.mfa.disabled', $user);
        });
    }

    /**
     * @return list<string>
     */
    private function generateRecoveryCodes(User $user): array
    {
        $count = max(1, min(20, (int) config('identity.mfa.recovery_codes', 8)));
        $codes = [];

        for ($index = 0; $index < $count; $index++) {
            $code = strtoupper(bin2hex(random_bytes(4)));
            $codes[] = substr($code, 0, 4) . '-' . substr($code, 4);
        }

        foreach ($codes as $code) {
            UserMfaRecoveryCode::query()->create([
                'user_id' => $user->getKey(),
                'code_hash' => Hash::make($code),
            ]);
        }

        return $codes;
    }

    private function consumeRecoveryCode(User $user, string $code): bool
    {
        return DB::transaction(function () use ($user, $code): bool {
            $recoveryCodes = UserMfaRecoveryCode::query()
                ->where('user_id', $user->getKey())
                ->whereNull('used_at')
                ->lockForUpdate()
                ->get();

            foreach ($recoveryCodes as $recoveryCode) {
                if (! Hash::check($code, $recoveryCode->code_hash)) {
                    continue;
                }

                $recoveryCode->forceFill(['used_at' => now()])->save();
                $this->audit->record('identity', 'identity.mfa.recovery_code_used', $user, target: $recoveryCode);

                return true;
            }

            return false;
        });
    }

    private function ensureStorageIsAvailable(): void
    {
        if (! Schema::hasTable('user_mfa_methods') || ! Schema::hasTable('user_mfa_recovery_codes')) {
            throw new \LogicException('A infraestrutura de autenticação multifator não está disponível.');
        }
    }
}
