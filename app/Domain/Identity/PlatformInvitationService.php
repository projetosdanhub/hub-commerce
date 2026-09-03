<?php

namespace App\Domain\Identity;

use App\Mail\PlatformInvitationMail;
use App\Models\PlatformInvitation;
use App\Models\PlatformMembership;
use App\Models\PlatformRole;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

final class PlatformInvitationService
{
    public function __construct(
        private readonly AuthorizationService $authorization,
        private readonly AuthorizationAuditLogger $audit,
    ) {
    }

    /**
     * @param list<int> $roleIds
     */
    public function issue(User $actor, string $email, array $roleIds): IssuedInvitation
    {
        if (! $this->authorization->allowsPlatform($actor, 'platform.team.manage')) {
            throw new AuthorizationException('Você não possui permissão para convidar membros da plataforma.');
        }

        $email = mb_strtolower(trim($email));

        return DB::transaction(function () use ($actor, $email, $roleIds): IssuedInvitation {
            $membership = $this->authorization->platformMembership($actor);

            if ($membership === null) {
                throw new AuthorizationException('O acesso à plataforma não está ativo.');
            }

            $roles = $this->authorizedRoles($actor, $roleIds);
            PlatformInvitation::query()
                ->where('email', $email)
                ->whereNull('accepted_at')
                ->whereNull('revoked_at')
                ->update(['revoked_at' => now(), 'updated_at' => now()]);

            $token = InvitationToken::generate();
            $invitation = PlatformInvitation::query()->create([
                'email' => $email,
                'token_hash' => InvitationToken::hash($token),
                'invited_by_membership_id' => $membership->getKey(),
                'expires_at' => now()->addHours((int) config('identity.invitation_expiration_hours', 168)),
            ]);
            $invitation->roles()->attach($roles->modelKeys());

            $this->audit->record(
                'platform',
                'platform.invitation.issued',
                $actor,
                target: $invitation,
                after: ['role_ids' => $roles->modelKeys(), 'expires_at' => $invitation->expires_at?->toIso8601String()],
            );

            return new IssuedInvitation($invitation->load('roles.permissions'), $token);
        });
    }

    public function deliver(IssuedInvitation $issued): void
    {
        /** @var PlatformInvitation $invitation */
        $invitation = $issued->invitation;
        // O fragmento não é enviado para o servidor nem para logs HTTP. A UI
        // lê o token e o envia no corpo do POST autenticado de aceite.
        $url = rtrim((string) config('identity.superadmin_url'), '/') . '/convites/aceitar#token=' . rawurlencode($issued->plainTextToken);

        Mail::to($invitation->email)->send(new PlatformInvitationMail(
            acceptUrl: $url,
            expiresAt: $invitation->expires_at,
        ));
    }

    public function revoke(User $actor, PlatformInvitation $invitation): void
    {
        if (! $this->authorization->allowsPlatform($actor, 'platform.team.manage')) {
            throw new AuthorizationException('Você não possui permissão para revogar convites.');
        }

        if ($invitation->accepted_at !== null || $invitation->revoked_at !== null) {
            return;
        }

        $invitation->forceFill(['revoked_at' => now()])->save();
        $this->audit->record('platform', 'platform.invitation.revoked', $actor, target: $invitation);
    }

    public function accept(User $user, string $plainTextToken): PlatformMembership
    {
        return DB::transaction(function () use ($user, $plainTextToken): PlatformMembership {
            $invitation = PlatformInvitation::query()
                ->where('token_hash', InvitationToken::hash($plainTextToken))
                ->lockForUpdate()
                ->with('roles.permissions')
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

            $membership = PlatformMembership::query()->firstOrCreate(
                ['user_id' => $user->getKey()],
                ['status' => PlatformMembership::STATUS_ACTIVE, 'authorization_version' => 1, 'joined_at' => now()],
            );
            $membership->forceFill([
                'status' => PlatformMembership::STATUS_ACTIVE,
                'revoked_at' => null,
                'authorization_version' => $membership->authorization_version + 1,
            ])->save();
            $membership->roles()->sync($invitation->roles->modelKeys());

            $invitation->forceFill([
                'accepted_by_user_id' => $user->getKey(),
                'accepted_at' => now(),
            ])->save();

            if (! $user->hasVerifiedEmail()) {
                $user->markEmailAsVerified();
            }

            $this->audit->record(
                'platform',
                'platform.invitation.accepted',
                $user,
                target: $membership,
                after: ['invitation_uuid' => $invitation->uuid],
            );

            return $membership->fresh(['roles.permissions']);
        });
    }

    /**
     * @param list<int> $roleIds
     */
    private function authorizedRoles(User $actor, array $roleIds): \Illuminate\Database\Eloquent\Collection
    {
        $roles = PlatformRole::query()->whereIn('id', $roleIds)->with('permissions')->get();

        if ($roles->count() !== count(array_unique($roleIds))) {
            throw new \InvalidArgumentException('Um ou mais cargos de plataforma são inválidos.');
        }

        foreach ($roles as $role) {
            if ($role->isSuperadmin() && ! $this->authorization->isSuperadmin($actor)) {
                throw new AuthorizationException('Somente um superadmin pode atribuir o cargo de superadmin.');
            }

            foreach ($role->permissions as $permission) {
                if (! $this->canDelegatePermission($actor, $permission)) {
                    throw new AuthorizationException('Você não pode delegar um dos privilégios selecionados.');
                }
            }
        }

        return $roles;
    }

    private function canDelegatePermission(User $actor, \App\Models\Permission $permission): bool
    {
        if ($this->authorization->isSuperadmin($actor)) {
            return $permission->scope === \App\Models\Permission::SCOPE_PLATFORM;
        }

        return $permission->is_delegable
            && $this->authorization->allowsPlatform($actor, $permission->key);
    }
}
