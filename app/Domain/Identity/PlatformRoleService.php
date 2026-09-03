<?php

namespace App\Domain\Identity;

use App\Models\Permission;
use App\Models\PlatformMembership;
use App\Models\PlatformRole;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class PlatformRoleService
{
    public function __construct(
        private readonly AuthorizationService $authorization,
        private readonly AuthorizationAuditLogger $audit,
    ) {
    }

    /**
     * @param list<int> $permissionIds
     */
    public function create(User $actor, array $attributes, array $permissionIds): PlatformRole
    {
        $this->assertCanManage($actor);

        return DB::transaction(function () use ($actor, $attributes, $permissionIds): PlatformRole {
            $permissions = $this->delegablePermissions($actor, $permissionIds);
            $role = PlatformRole::query()->create([
                'key' => $this->nextKey((string) $attributes['name']),
                'name' => trim((string) $attributes['name']),
                'description' => Arr::get($attributes, 'description'),
                'is_system' => false,
                'is_protected' => false,
            ]);
            $role->permissions()->sync($permissions->modelKeys());

            $this->audit->record(
                'platform',
                'platform.role.created',
                $actor,
                target: $role,
                after: ['role' => $role->key, 'permission_ids' => $permissions->modelKeys()],
            );

            return $role->load('permissions');
        });
    }

    /**
     * @param list<int> $permissionIds
     */
    public function update(User $actor, PlatformRole $role, array $attributes, array $permissionIds): PlatformRole
    {
        $this->assertCanManage($actor);

        if ($role->is_protected || $role->is_system) {
            throw new AuthorizationException('Este cargo de sistema não pode ser alterado.');
        }

        return DB::transaction(function () use ($actor, $role, $attributes, $permissionIds): PlatformRole {
            $permissions = $this->delegablePermissions($actor, $permissionIds);
            $before = ['name' => $role->name, 'permission_ids' => $role->permissions()->pluck('permissions.id')->all()];

            $role->fill([
                'name' => trim((string) $attributes['name']),
                'description' => Arr::get($attributes, 'description'),
            ])->save();
            $role->permissions()->sync($permissions->modelKeys());

            $this->audit->record(
                'platform',
                'platform.role.updated',
                $actor,
                target: $role,
                before: $before,
                after: ['name' => $role->name, 'permission_ids' => $permissions->modelKeys()],
            );

            return $role->load('permissions');
        });
    }

    public function delete(User $actor, PlatformRole $role): void
    {
        $this->assertCanManage($actor);

        if ($role->is_protected || $role->is_system) {
            throw new AuthorizationException('Este cargo de sistema não pode ser removido.');
        }

        DB::transaction(function () use ($actor, $role): void {
            $snapshot = ['role' => $role->key, 'name' => $role->name];
            $role->delete();
            $this->audit->record('platform', 'platform.role.deleted', $actor, target: null, before: $snapshot);
        });
    }

    /**
     * @param list<int> $roleIds
     */
    public function assignRoles(User $actor, PlatformMembership $membership, array $roleIds): PlatformMembership
    {
        if (! $this->authorization->allowsPlatform($actor, 'platform.team.manage')) {
            throw new AuthorizationException('Você não possui permissão para administrar a equipe da plataforma.');
        }

        return DB::transaction(function () use ($actor, $membership, $roleIds): PlatformMembership {
            $membership->loadMissing('roles');
            $targetIsSuperadmin = $membership->roles->contains(fn (PlatformRole $role): bool => $role->isSuperadmin());

            if ($targetIsSuperadmin && ! $this->authorization->isSuperadmin($actor)) {
                throw new AuthorizationException('Somente outro superadmin pode alterar a conta de um superadmin.');
            }

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

            $nextIsSuperadmin = $roles->contains(fn (PlatformRole $role): bool => $role->isSuperadmin());

            if ($targetIsSuperadmin && ! $nextIsSuperadmin) {
                $this->assertNotLastSuperadmin($membership);
            }

            $before = $membership->roles()->pluck('platform_roles.id')->all();
            $membership->roles()->sync($roles->modelKeys());
            $membership->increment('authorization_version');

            $this->audit->record(
                'platform',
                'platform.membership.roles_assigned',
                $actor,
                target: $membership,
                before: ['role_ids' => $before],
                after: ['role_ids' => $roles->modelKeys()],
            );

            return $membership->fresh(['user', 'roles.permissions']);
        });
    }

    public function setMembershipStatus(User $actor, PlatformMembership $membership, string $status): PlatformMembership
    {
        if (! $this->authorization->allowsPlatform($actor, 'platform.team.manage')) {
            throw new AuthorizationException('Você não possui permissão para administrar a equipe da plataforma.');
        }

        $membership->loadMissing('roles');

        if ($membership->roles->contains(fn (PlatformRole $role): bool => $role->isSuperadmin())) {
            if (! $this->authorization->isSuperadmin($actor)) {
                throw new AuthorizationException('Somente outro superadmin pode alterar a conta de um superadmin.');
            }

            if ($status !== PlatformMembership::STATUS_ACTIVE) {
                $this->assertNotLastSuperadmin($membership);
            }
        }

        if (! in_array($status, [PlatformMembership::STATUS_ACTIVE, PlatformMembership::STATUS_SUSPENDED, PlatformMembership::STATUS_REVOKED], true)) {
            throw new \InvalidArgumentException('Status de membro inválido.');
        }

        $before = $membership->status;
        $membership->forceFill([
            'status' => $status,
            'revoked_at' => $status === PlatformMembership::STATUS_REVOKED ? now() : null,
            'authorization_version' => $membership->authorization_version + 1,
        ])->save();

        $this->audit->record(
            'platform',
            'platform.membership.status_changed',
            $actor,
            target: $membership,
            before: ['status' => $before],
            after: ['status' => $status],
        );

        return $membership->fresh(['user', 'roles.permissions']);
    }

    private function assertCanManage(User $actor): void
    {
        if (! $this->authorization->allowsPlatform($actor, 'platform.roles.manage')) {
            throw new AuthorizationException('Você não possui permissão para administrar cargos de plataforma.');
        }
    }

    /**
     * @param list<int> $permissionIds
     */
    private function delegablePermissions(User $actor, array $permissionIds): \Illuminate\Database\Eloquent\Collection
    {
        $permissions = Permission::query()
            ->where('scope', Permission::SCOPE_PLATFORM)
            ->where('is_delegable', true)
            ->whereIn('id', $permissionIds)
            ->get();

        if ($permissions->count() !== count(array_unique($permissionIds))) {
            throw new \InvalidArgumentException('A seleção possui privilégio não delegável ou inválido.');
        }

        foreach ($permissions as $permission) {
            if (! $this->canDelegatePermission($actor, $permission)) {
                throw new AuthorizationException('Você não pode delegar um dos privilégios selecionados.');
            }
        }

        return $permissions;
    }

    private function canDelegatePermission(User $actor, Permission $permission): bool
    {
        if ($this->authorization->isSuperadmin($actor)) {
            return $permission->scope === Permission::SCOPE_PLATFORM;
        }

        return $permission->is_delegable
            && $this->authorization->allowsPlatform($actor, $permission->key);
    }

    private function nextKey(string $name): string
    {
        $base = Str::of($name)->ascii()->lower()->replaceMatches('/[^a-z0-9]+/', '_')->trim('_')->substr(0, 65)->toString();
        $base = $base !== '' ? $base : 'role';
        $key = $base;
        $suffix = 2;

        while (PlatformRole::query()->where('key', $key)->exists()) {
            $key = substr($base, 0, 75 - strlen((string) $suffix) - 1) . '_' . $suffix;
            $suffix++;
        }

        return $key;
    }

    private function assertNotLastSuperadmin(PlatformMembership $membership): void
    {
        $superadminRoleId = PlatformRole::query()->where('key', 'superadmin')->value('id');

        if ($superadminRoleId === null) {
            return;
        }

        $otherActiveSuperadmins = PlatformMembership::query()
            ->where('status', PlatformMembership::STATUS_ACTIVE)
            ->where('id', '!=', $membership->getKey())
            ->whereHas('roles', fn ($query) => $query->where('platform_roles.id', $superadminRoleId))
            ->exists();

        if (! $otherActiveSuperadmins) {
            throw new \DomainException('A última conta superadmin ativa não pode ser removida ou rebaixada.');
        }
    }
}
