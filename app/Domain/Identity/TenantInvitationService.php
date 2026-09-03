<?php

namespace App\Domain\Identity;

use App\Mail\TenantInvitationMail;
use App\Models\Tenant;
use App\Models\TenantInvitation;
use App\Models\TenantMembership;
use App\Models\TenantRole;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

final class TenantInvitationService
{
    public function __construct(
        private readonly AuthorizationService $authorization,
        private readonly AuthorizationAuditLogger $audit,
    ) {
    }

    /**
     * @param list<int> $roleIds
     */
    public function issue(User $actor, Tenant $tenant, string $email, array $roleIds): IssuedInvitation
    {
        if (! $this->authorization->allowsTenant($actor, $tenant, 'tenant.team.manage')) {
            throw new AuthorizationException('Você não possui permissão para convidar membros.');
        }

        $email = mb_strtolower(trim($email));

        return DB::transaction(function () use ($actor, $tenant, $email, $roleIds): IssuedInvitation {
            $membership = $this->authorization->tenantMembership($actor, $tenant);

            if ($membership === null) {
                throw new AuthorizationException('O acesso à loja não está ativo.');
            }

            $roles = $this->authorizedRoles($actor, $tenant, $roleIds);
            TenantInvitation::query()
                ->where('tenant_id', $tenant->getKey())
                ->where('email', $email)
                ->whereNull('accepted_at')
                ->whereNull('revoked_at')
                ->update(['revoked_at' => now(), 'updated_at' => now()]);

            $token = InvitationToken::generate();
            $invitation = TenantInvitation::query()->create([
                'tenant_id' => $tenant->getKey(),
                'email' => $email,
                'token_hash' => InvitationToken::hash($token),
                'invited_by_membership_id' => $membership->getKey(),
                'expires_at' => now()->addHours((int) config('identity.invitation_expiration_hours', 168)),
            ]);
            $invitation->roles()->attach($roles->modelKeys(), ['tenant_id' => $tenant->getKey()]);

            $this->audit->record(
                'tenant',
                'tenant.invitation.issued',
                $actor,
                $tenant,
                $invitation,
                after: ['role_ids' => $roles->modelKeys(), 'expires_at' => $invitation->expires_at?->toIso8601String()],
            );

            return new IssuedInvitation($invitation->load('roles.permissions'), $token);
        });
    }

    public function deliver(IssuedInvitation $issued): void
    {
        /** @var TenantInvitation $invitation */
        $invitation = $issued->invitation;
        $tenant = $invitation->tenant()->firstOrFail();
        // O fragmento não é enviado para o servidor nem para logs HTTP. A UI
        // lê o token e o envia no corpo do POST autenticado de aceite.
        $url = rtrim((string) config('identity.admin_url'), '/') . '/convites/aceitar#token=' . rawurlencode($issued->plainTextToken);

        Mail::to($invitation->email)->send(new TenantInvitationMail(
            tenantName: $tenant->name,
            acceptUrl: $url,
            expiresAt: $invitation->expires_at,
        ));
    }

    public function revoke(User $actor, Tenant $tenant, TenantInvitation $invitation): void
    {
        if (! $this->authorization->allowsTenant($actor, $tenant, 'tenant.team.manage')) {
            throw new AuthorizationException('Você não possui permissão para revogar convites.');
        }

        if ($invitation->tenant_id !== $tenant->getKey()) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException();
        }

        if ($invitation->accepted_at !== null || $invitation->revoked_at !== null) {
            return;
        }

        $invitation->forceFill(['revoked_at' => now()])->save();
        $this->audit->record('tenant', 'tenant.invitation.revoked', $actor, $tenant, $invitation);
    }

    public function accept(User $user, string $plainTextToken): TenantMembership
    {
        return DB::transaction(function () use ($user, $plainTextToken): TenantMembership {
            $invitation = TenantInvitation::query()
                ->where('token_hash', InvitationToken::hash($plainTextToken))
                ->lockForUpdate()
                ->with(['roles.permissions', 'tenant'])
                ->first();

            if ($invitation === null || ! $invitation->isPending()) {
                throw new InvitationException('O convite é inválido, expirou ou já foi utilizado.');
            }

            if (mb_strtolower((string) $user->email) !== $invitation->email) {
                throw new AuthorizationException('Este convite pertence a outro endereço de e-mail.');
            }

            if (! $user->isActive()) {
                throw new AuthorizationException('A conta associada a este convite não está ativa.');
            }

            $membership = TenantMembership::query()->firstOrCreate(
                [
                    'tenant_id' => $invitation->tenant_id,
                    'user_id' => $user->getKey(),
                ],
                [
                    'status' => TenantMembership::STATUS_ACTIVE,
                    'authorization_version' => 1,
                    'created_by_user_id' => $invitation->invitedByMembership?->user_id,
                    'joined_at' => now(),
                ],
            );

            if (! $membership->isOwner()) {
                $membership->forceFill([
                    'status' => TenantMembership::STATUS_ACTIVE,
                    'revoked_at' => null,
                    'authorization_version' => $membership->authorization_version + 1,
                ])->save();
                $membership->syncRoles($invitation->roles->modelKeys());
            }

            $invitation->forceFill([
                'accepted_by_user_id' => $user->getKey(),
                'accepted_at' => now(),
            ])->save();

            if (! $user->hasVerifiedEmail()) {
                $user->markEmailAsVerified();
            }

            $this->audit->record(
                'tenant',
                'tenant.invitation.accepted',
                $user,
                $invitation->tenant,
                $membership,
                after: ['invitation_uuid' => $invitation->uuid],
            );

            return $membership->fresh(['roles.permissions', 'ownership']);
        });
    }

    /**
     * @param list<int> $roleIds
     */
    private function authorizedRoles(User $actor, Tenant $tenant, array $roleIds): \Illuminate\Database\Eloquent\Collection
    {
        $roles = TenantRole::query()
            ->where('tenant_id', $tenant->getKey())
            ->where('is_assignable', true)
            ->whereIn('id', $roleIds)
            ->with('permissions')
            ->get();

        if ($roles->count() !== count(array_unique($roleIds))) {
            throw new \InvalidArgumentException('Um ou mais cargos não pertencem a esta loja ou não podem ser atribuídos.');
        }

        foreach ($roles as $role) {
            foreach ($role->permissions as $permission) {
                if (! $permission->is_delegable || ! $this->authorization->allowsTenant($actor, $tenant, $permission->key)) {
                    throw new AuthorizationException('Você não pode delegar um dos privilégios selecionados.');
                }
            }
        }

        return $roles;
    }
}
