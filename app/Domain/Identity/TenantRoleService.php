<?php

namespace App\Domain\Identity;

use App\Models\Permission;
use App\Models\Tenant;
use App\Models\TenantMembership;
use App\Models\TenantRole;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class TenantRoleService
{
    public function __construct(
        private readonly AuthorizationService $authorization,
        private readonly TenantOwnershipService $ownership,
        private readonly AuthorizationAuditLogger $audit,
    ) {
    }

    /**
     * @param list<int> $permissionIds
     */
    public function create(User $actor, Tenant $tenant, array $attributes, array $permissionIds): TenantRole
    {
        $this->assertCanManageRoles($actor, $tenant);

        return DB::transaction(function () use ($actor, $tenant, $attributes, $permissionIds): TenantRole {
            $permissions = $this->delegablePermissions($actor, $tenant, $permissionIds);
            $role = TenantRole::query()->create([
                'tenant_id' => $tenant->getKey(),
                'key' => $this->nextKey($tenant, (string) $attributes['name']),
                'name' => trim((string) $attributes['name']),
                'description' => Arr::get($attributes, 'description'),
                'is_system' => false,
                'is_protected' => false,
                'is_assignable' => true,
            ]);
            $role->permissions()->sync($permissions->modelKeys());

            $this->audit->record(
                'tenant',
                'tenant.role.created',
                $actor,
                $tenant,
                $role,
                after: ['role' => $role->key, 'permission_ids' => $permissions->modelKeys()],
            );

            return $role->load('permissions');
        });
    }

    /**
     * @param list<int> $permissionIds
     */
    public function update(User $actor, Tenant $tenant, TenantRole $role, array $attributes, array $permissionIds): TenantRole
    {
        $this->assertCanManageRoles($actor, $tenant);
        $this->assertTenantRole($tenant, $role);

        if ($role->is_protected || $role->is_system) {
            throw new AuthorizationException('Este cargo de sistema não pode ser alterado.');
        }

        return DB::transaction(function () use ($actor, $tenant, $role, $attributes, $permissionIds): TenantRole {
            $permissions = $this->delegablePermissions($actor, $tenant, $permissionIds);
            $before = ['name' => $role->name, 'permission_ids' => $role->permissions()->pluck('permissions.id')->all()];

            $role->fill([
                'name' => trim((string) $attributes['name']),
                'description' => Arr::get($attributes, 'description'),
            ])->save();
            $role->permissions()->sync($permissions->modelKeys());

            $this->audit->record(
                'tenant',
                'tenant.role.updated',
                $actor,
                $tenant,
                $role,
                before: $before,
                after: ['name' => $role->name, 'permission_ids' => $permissions->modelKeys()],
            );

            return $role->load('permissions');
        });
    }

    public function delete(User $actor, Tenant $tenant, TenantRole $role): void
    {
        $this->assertCanManageRoles($actor, $tenant);
        $this->assertTenantRole($tenant, $role);

        if ($role->is_protected || $role->is_system) {
            throw new AuthorizationException('Este cargo de sistema não pode ser removido.');
        }

        DB::transaction(function () use ($actor, $tenant, $role): void {
            $snapshot = ['role' => $role->key, 'name' => $role->name];
            $role->delete();
            $this->audit->record('tenant', 'tenant.role.deleted', $actor, $tenant, null, before: $snapshot);
        });
    }

    /**
     * @param list<int> $roleIds
     */
    public function assignRoles(User $actor, Tenant $tenant, TenantMembership $membership, array $roleIds): TenantMembership
    {
        $this->assertCanManageTeam($actor, $tenant);
        $this->assertTenantMembership($tenant, $membership);
        $this->ownership->assertMutableByTenant($membership);

        return DB::transaction(function () use ($actor, $tenant, $membership, $roleIds): TenantMembership {
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

            $before = $membership->roles()->pluck('tenant_roles.id')->all();
            $membership->roles()->sync($roles->modelKeys());
            $membership->increment('authorization_version');

            $this->audit->record(
                'tenant',
                'tenant.membership.roles_assigned',
                $actor,
                $tenant,
                $membership,
                before: ['role_ids' => $before],
                after: ['role_ids' => $roles->modelKeys()],
            );

            return $membership->fresh(['user', 'roles.permissions', 'ownership']);
        });
    }

    public function setMembershipStatus(User $actor, Tenant $tenant, TenantMembership $membership, string $status): TenantMembership
    {
        $this->assertCanManageTeam($actor, $tenant);
        $this->assertTenantMembership($tenant, $membership);
        $this->ownership->assertMutableByTenant($membership);

        if (! in_array($status, [TenantMembership::STATUS_ACTIVE, TenantMembership::STATUS_SUSPENDED, TenantMembership::STATUS_REVOKED], true)) {
            throw new \InvalidArgumentException('Status de membro inválido.');
        }

        $before = $membership->status;
        $membership->forceFill([
            'status' => $status,
            'revoked_at' => $status === TenantMembership::STATUS_REVOKED ? now() : null,
            'authorization_version' => $membership->authorization_version + 1,
        ])->save();

        $this->audit->record(
            'tenant',
            'tenant.membership.status_changed',
            $actor,
            $tenant,
            $membership,
            before: ['status' => $before],
            after: ['status' => $status],
        );

        return $membership->fresh(['user', 'roles.permissions', 'ownership']);
    }

    private function assertCanManageRoles(User $actor, Tenant $tenant): void
    {
        if (! $this->authorization->allowsTenant($actor, $tenant, 'tenant.roles.manage')) {
            throw new AuthorizationException('Você não possui permissão para administrar cargos.');
        }
    }

    private function assertCanManageTeam(User $actor, Tenant $tenant): void
    {
        if (! $this->authorization->allowsTenant($actor, $tenant, 'tenant.team.manage')) {
            throw new AuthorizationException('Você não possui permissão para administrar a equipe.');
        }
    }

    private function assertTenantRole(Tenant $tenant, TenantRole $role): void
    {
        if ($role->tenant_id !== $tenant->getKey()) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException();
        }
    }

    private function assertTenantMembership(Tenant $tenant, TenantMembership $membership): void
    {
        if ($membership->tenant_id !== $tenant->getKey()) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException();
        }
    }

    /**
     * @param list<int> $permissionIds
     */
    private function delegablePermissions(User $actor, Tenant $tenant, array $permissionIds): \Illuminate\Database\Eloquent\Collection
    {
        $permissions = Permission::query()
            ->where('scope', Permission::SCOPE_TENANT)
            ->where('is_delegable', true)
            ->whereIn('id', $permissionIds)
            ->get();

        if ($permissions->count() !== count(array_unique($permissionIds))) {
            throw new \InvalidArgumentException('A seleção possui privilégio não delegável ou inválido.');
        }

        foreach ($permissions as $permission) {
            if (! $this->authorization->allowsTenant($actor, $tenant, $permission->key)) {
                throw new AuthorizationException('Você não pode delegar um dos privilégios selecionados.');
            }
        }

        return $permissions;
    }

    private function nextKey(Tenant $tenant, string $name): string
    {
        $base = Str::of($name)->ascii()->lower()->replaceMatches('/[^a-z0-9]+/', '_')->trim('_')->substr(0, 65)->toString();
        $base = $base !== '' ? $base : 'role';
        $key = $base;
        $suffix = 2;

        while (TenantRole::query()->where('tenant_id', $tenant->getKey())->where('key', $key)->exists()) {
            $key = substr($base, 0, 75 - strlen((string) $suffix) - 1) . '_' . $suffix;
            $suffix++;
        }

        return $key;
    }
}
