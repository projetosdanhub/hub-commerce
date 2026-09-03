<?php

namespace App\Domain\Identity;

use App\Models\Tenant;
use App\Models\TenantMembership;
use App\Models\TenantOwnership;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

final class TenantOwnershipService
{
    public function __construct(
        private readonly AuthorizationService $authorization,
        private readonly AuthorizationAuditLogger $audit,
    ) {
    }

    public function assignInitialOwner(Tenant $tenant, User $owner, ?User $assignedBy = null): TenantMembership
    {
        return DB::transaction(function () use ($tenant, $owner, $assignedBy): TenantMembership {
            if (! $owner->isActive()) {
                throw new \InvalidArgumentException('O proprietário inicial precisa possuir uma conta ativa.');
            }

            $membership = TenantMembership::query()->firstOrCreate(
                [
                    'tenant_id' => $tenant->getKey(),
                    'user_id' => $owner->getKey(),
                ],
                [
                    'status' => TenantMembership::STATUS_ACTIVE,
                    'authorization_version' => 1,
                    'created_by_user_id' => $assignedBy?->getKey(),
                    'joined_at' => now(),
                ],
            );

            $membership->forceFill([
                'status' => TenantMembership::STATUS_ACTIVE,
                'revoked_at' => null,
                'authorization_version' => $membership->authorization_version + 1,
            ])->save();

            $currentOwnership = TenantOwnership::query()
                ->where('tenant_id', $tenant->getKey())
                ->lockForUpdate()
                ->first();

            if ($currentOwnership !== null && $currentOwnership->tenant_membership_id !== $membership->getKey()) {
                throw new \DomainException('A propriedade existente deve ser transferida pelo fluxo de plataforma.');
            }

            TenantOwnership::query()->updateOrCreate(
                ['tenant_id' => $tenant->getKey()],
                [
                    'tenant_membership_id' => $membership->getKey(),
                    'assigned_by_user_id' => $assignedBy?->getKey(),
                ],
            );

            $this->audit->record(
                'tenant',
                'tenant.owner.assigned',
                $assignedBy,
                $tenant,
                $membership,
                context: ['owner_user_id' => $owner->getKey()],
            );

            return $membership;
        });
    }

    public function transfer(User $actor, Tenant $tenant, TenantMembership $nextOwner): void
    {
        if (! $this->authorization->allowsPlatform($actor, 'platform.tenants.manage')) {
            throw new AuthorizationException('Você não possui permissão para transferir a propriedade da loja.');
        }

        if ($nextOwner->tenant_id !== $tenant->getKey() || ! $nextOwner->isActive()) {
            throw new \InvalidArgumentException('O novo proprietário precisa ser um membro ativo da mesma loja.');
        }

        DB::transaction(function () use ($actor, $tenant, $nextOwner): void {
            $current = TenantOwnership::query()->where('tenant_id', $tenant->getKey())->lockForUpdate()->first();

            TenantOwnership::query()->updateOrCreate(
                ['tenant_id' => $tenant->getKey()],
                [
                    'tenant_membership_id' => $nextOwner->getKey(),
                    'assigned_by_user_id' => $actor->getKey(),
                ],
            );

            $this->audit->record(
                'platform',
                'tenant.owner.transferred',
                $actor,
                $tenant,
                $nextOwner,
                before: ['tenant_membership_id' => $current?->tenant_membership_id],
                after: ['tenant_membership_id' => $nextOwner->getKey()],
            );
        });
    }

    public function assertMutableByTenant(TenantMembership $membership): void
    {
        if ($membership->isOwner()) {
            throw new ProtectedOwnerException();
        }
    }
}
