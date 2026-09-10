<?php

namespace App\Domain\Tenancy;

use App\Models\TenantDomain;
use Illuminate\Support\Str;

final class TenantDomainVerificationService
{
    /**
     * Retorna o token uma única vez. Apenas o hash é persistido.
     */
    public function issueChallenge(TenantDomain $domain): string
    {
        $token = Str::random(64);

        $domain->forceFill([
            'verification_token_hash' => hash('sha256', $token),
            'verified_at' => null,
        ])->save();

        return $token;
    }

    public function verify(TenantDomain $domain, string $token): void
    {
        $storedHash = (string) $domain->verification_token_hash;

        if ($storedHash === '' || ! hash_equals($storedHash, hash('sha256', $token))) {
            throw new \InvalidArgumentException('Desafio de domínio inválido.');
        }

        if (! $domain->tenant()->firstOrFail()->isActive()) {
            throw new \DomainException('Não é possível verificar domínio de tenant inativo.');
        }

        $domain->forceFill([
            'verified_at' => now(),
            'verification_token_hash' => null,
        ])->save();
    }
}
