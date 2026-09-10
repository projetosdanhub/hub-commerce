<?php

namespace App\Http\Controllers\Identity;

use App\Domain\Identity\TenantInvitationService;
use App\Domain\Identity\TenantRoleService;
use App\Domain\Tenancy\TenantContextStore;
use App\Http\Controllers\Controller;
use App\Http\Requests\Identity\AssignRolesRequest;
use App\Http\Requests\Identity\InviteMemberRequest;
use App\Http\Requests\Identity\ManageRoleRequest;
use App\Http\Requests\Identity\UpdateMembershipStatusRequest;
use App\Models\Permission;
use App\Models\Tenant;
use App\Models\TenantInvitation;
use App\Models\TenantMembership;
use App\Models\TenantRole;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

final class TenantTeamController extends Controller
{
    public function __construct(
        private readonly TenantContextStore $tenantContext,
        private readonly TenantRoleService $roles,
        private readonly TenantInvitationService $invitations,
    ) {
    }

    public function members(Request $request): JsonResponse
    {
        $tenant = $this->tenant();
        $perPage = min(100, max(1, $request->integer('per_page', 30)));
        $members = TenantMembership::query()
            ->where('tenant_id', $tenant->getKey())
            ->with(['user:id,name,email,status', 'roles:id,tenant_id,key,name,is_protected', 'ownership'])
            ->orderBy('id')
            ->paginate($perPage);

        return response()->json([
            'data' => $members->getCollection()->map(fn (TenantMembership $member): array => $this->memberData($member))->values(),
            'meta' => [
                'current_page' => $members->currentPage(),
                'last_page' => $members->lastPage(),
                'per_page' => $members->perPage(),
                'total' => $members->total(),
            ],
        ]);
    }

    public function roles(): JsonResponse
    {
        $tenant = $this->tenant();

        return response()->json([
            'data' => TenantRole::query()
                ->where('tenant_id', $tenant->getKey())
                ->with('permissions:id,key,module,action,is_delegable,risk_level')
                ->orderBy('is_system', 'desc')
                ->orderBy('name')
                ->get()
                ->map(fn (TenantRole $role): array => $this->roleData($role))
                ->values(),
        ]);
    }

    public function permissions(): JsonResponse
    {
        return response()->json([
            'data' => Permission::query()
                ->where('scope', Permission::SCOPE_TENANT)
                ->orderBy('module')
                ->orderBy('action')
                ->get(['id', 'key', 'module', 'action', 'is_delegable', 'risk_level', 'description']),
        ]);
    }

    public function createRole(ManageRoleRequest $request): JsonResponse
    {
        try {
            $role = $this->roles->create(
                $request->user(),
                $this->tenant(),
                $request->safe()->only(['name', 'description']),
                $request->validated('permission_ids'),
            );

            return response()->json(['data' => $this->roleData($role)], 201);
        } catch (DomainException|InvalidArgumentException $exception) {
            return $this->invalid($exception);
        }
    }

    public function updateRole(ManageRoleRequest $request, int $role): JsonResponse
    {
        try {
            $tenant = $this->tenant();
            $model = TenantRole::query()->where('tenant_id', $tenant->getKey())->findOrFail($role);
            $updated = $this->roles->update(
                $request->user(),
                $tenant,
                $model,
                $request->safe()->only(['name', 'description']),
                $request->validated('permission_ids'),
            );

            return response()->json(['data' => $this->roleData($updated)]);
        } catch (DomainException|InvalidArgumentException $exception) {
            return $this->invalid($exception);
        }
    }

    public function deleteRole(Request $request, int $role): JsonResponse
    {
        try {
            $tenant = $this->tenant();
            $model = TenantRole::query()->where('tenant_id', $tenant->getKey())->findOrFail($role);
            $this->roles->delete($request->user(), $tenant, $model);

            return response()->noContent();
        } catch (DomainException|InvalidArgumentException $exception) {
            return $this->invalid($exception);
        }
    }

    public function invite(InviteMemberRequest $request): JsonResponse
    {
        try {
            $tenant = $this->tenant();
            $issued = $this->invitations->issue(
                $request->user(),
                $tenant,
                $request->validated('email'),
                $request->validated('role_ids'),
            );

            try {
                $this->invitations->deliver($issued);
            } catch (\Throwable) {
                $this->invitations->revoke($request->user(), $tenant, $issued->invitation);

                return response()->json([
                    'status' => 'error',
                    'code' => 'REQUEST_FAILED',
                    'message' => 'Não foi possível enviar o convite. Tente novamente.',
                ], 503);
            }

            /** @var TenantInvitation $invitation */
            $invitation = $issued->invitation;

            return response()->json([
                'data' => [
                    'uuid' => $invitation->uuid,
                    'email' => $invitation->email,
                    'expires_at' => $invitation->expires_at?->toIso8601String(),
                    'role_ids' => $invitation->roles->modelKeys(),
                ],
            ], 202);
        } catch (DomainException|InvalidArgumentException $exception) {
            return $this->invalid($exception);
        }
    }

    public function invitations(Request $request): JsonResponse
    {
        $tenant = $this->tenant();

        return response()->json([
            'data' => TenantInvitation::query()
                ->where('tenant_id', $tenant->getKey())
                ->with('roles:id,tenant_id,key,name')
                ->latest()
                ->limit(100)
                ->get()
                ->map(fn (TenantInvitation $invitation): array => [
                    'uuid' => $invitation->uuid,
                    'email' => $invitation->email,
                    'status' => $invitation->accepted_at ? 'ACCEPTED' : ($invitation->revoked_at ? 'REVOKED' : ($invitation->expires_at->isPast() ? 'EXPIRED' : 'PENDING')),
                    'expires_at' => $invitation->expires_at?->toIso8601String(),
                    'roles' => $invitation->roles->map(fn (TenantRole $role): array => ['id' => $role->getKey(), 'key' => $role->key, 'name' => $role->name]),
                ]),
        ]);
    }

    public function revokeInvitation(Request $request, string $invitation): JsonResponse
    {
        try {
            $tenant = $this->tenant();
            $model = TenantInvitation::query()->where('tenant_id', $tenant->getKey())->where('uuid', $invitation)->firstOrFail();
            $this->invitations->revoke($request->user(), $tenant, $model);

            return response()->noContent();
        } catch (DomainException|InvalidArgumentException $exception) {
            return $this->invalid($exception);
        }
    }

    public function assignMemberRoles(AssignRolesRequest $request, int $membership): JsonResponse
    {
        try {
            $tenant = $this->tenant();
            $model = TenantMembership::query()->where('tenant_id', $tenant->getKey())->findOrFail($membership);
            $updated = $this->roles->assignRoles($request->user(), $tenant, $model, $request->validated('role_ids'));

            return response()->json(['data' => $this->memberData($updated)]);
        } catch (DomainException|InvalidArgumentException $exception) {
            return $this->invalid($exception);
        }
    }

    public function updateMemberStatus(UpdateMembershipStatusRequest $request, int $membership): JsonResponse
    {
        try {
            $tenant = $this->tenant();
            $model = TenantMembership::query()->where('tenant_id', $tenant->getKey())->findOrFail($membership);
            $updated = $this->roles->setMembershipStatus($request->user(), $tenant, $model, $request->validated('status'));

            return response()->json(['data' => $this->memberData($updated)]);
        } catch (DomainException|InvalidArgumentException $exception) {
            return $this->invalid($exception);
        }
    }

    private function tenant(): Tenant
    {
        return Tenant::query()->findOrFail($this->tenantContext->require()->tenantId);
    }

    private function roleData(TenantRole $role): array
    {
        return [
            'id' => $role->getKey(),
            'key' => $role->key,
            'name' => $role->name,
            'description' => $role->description,
            'is_system' => $role->is_system,
            'is_protected' => $role->is_protected,
            'is_assignable' => $role->is_assignable,
            'permissions' => $role->permissions->map(fn (Permission $permission): array => [
                'id' => $permission->getKey(),
                'key' => $permission->key,
                'module' => $permission->module,
                'action' => $permission->action,
                'is_delegable' => $permission->is_delegable,
                'risk_level' => $permission->risk_level,
            ])->values(),
        ];
    }

    private function memberData(TenantMembership $member): array
    {
        return [
            'id' => $member->getKey(),
            'user' => $member->user ? ['id' => $member->user->getKey(), 'name' => $member->user->name, 'email' => $member->user->email] : null,
            'status' => $member->status,
            'is_owner' => $member->isOwner(),
            'roles' => $member->roles->map(fn (TenantRole $role): array => ['id' => $role->getKey(), 'key' => $role->key, 'name' => $role->name]),
        ];
    }

    private function invalid(\Throwable $exception): JsonResponse
    {
        return response()->json([
            'status' => 'error',
            'code' => 'REQUEST_FAILED',
            'message' => $exception->getMessage(),
        ], 422);
    }
}
