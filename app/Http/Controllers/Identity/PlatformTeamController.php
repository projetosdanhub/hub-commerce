<?php

namespace App\Http\Controllers\Identity;

use App\Domain\Identity\PlatformInvitationService;
use App\Domain\Identity\PlatformRoleService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Identity\AssignRolesRequest;
use App\Http\Requests\Identity\InviteMemberRequest;
use App\Http\Requests\Identity\ManageRoleRequest;
use App\Http\Requests\Identity\UpdateMembershipStatusRequest;
use App\Models\Permission;
use App\Models\PlatformInvitation;
use App\Models\PlatformMembership;
use App\Models\PlatformRole;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

final class PlatformTeamController extends Controller
{
    public function __construct(
        private readonly PlatformRoleService $roles,
        private readonly PlatformInvitationService $invitations,
    ) {
    }

    public function members(Request $request): JsonResponse
    {
        $perPage = min(100, max(1, $request->integer('per_page', 30)));
        $members = PlatformMembership::query()
            ->with(['user:id,name,email,status', 'roles:id,key,name,is_protected'])
            ->orderBy('id')
            ->paginate($perPage);

        return response()->json([
            'data' => $members->getCollection()->map(fn (PlatformMembership $member): array => $this->memberData($member))->values(),
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
        return response()->json([
            'data' => PlatformRole::query()
                ->with('permissions:id,key,module,action,is_delegable,risk_level')
                ->orderBy('is_system', 'desc')
                ->orderBy('name')
                ->get()
                ->map(fn (PlatformRole $role): array => $this->roleData($role))
                ->values(),
        ]);
    }

    public function permissions(): JsonResponse
    {
        return response()->json([
            'data' => Permission::query()
                ->where('scope', Permission::SCOPE_PLATFORM)
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
            $model = PlatformRole::query()->findOrFail($role);
            $updated = $this->roles->update(
                $request->user(),
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
            $this->roles->delete($request->user(), PlatformRole::query()->findOrFail($role));

            return response()->noContent();
        } catch (DomainException|InvalidArgumentException $exception) {
            return $this->invalid($exception);
        }
    }

    public function invite(InviteMemberRequest $request): JsonResponse
    {
        try {
            $issued = $this->invitations->issue(
                $request->user(),
                $request->validated('email'),
                $request->validated('role_ids'),
            );

            try {
                $this->invitations->deliver($issued);
            } catch (\Throwable) {
                $this->invitations->revoke($request->user(), $issued->invitation);

                return response()->json([
                    'status' => 'error',
                    'message' => 'Não foi possível enviar o convite. Tente novamente.',
                ], 503);
            }

            /** @var PlatformInvitation $invitation */
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

    public function invitations(): JsonResponse
    {
        return response()->json([
            'data' => PlatformInvitation::query()
                ->with('roles:id,key,name')
                ->latest()
                ->limit(100)
                ->get()
                ->map(fn (PlatformInvitation $invitation): array => [
                    'uuid' => $invitation->uuid,
                    'email' => $invitation->email,
                    'status' => $invitation->accepted_at ? 'ACCEPTED' : ($invitation->revoked_at ? 'REVOKED' : ($invitation->expires_at->isPast() ? 'EXPIRED' : 'PENDING')),
                    'expires_at' => $invitation->expires_at?->toIso8601String(),
                    'roles' => $invitation->roles->map(fn (PlatformRole $role): array => ['id' => $role->getKey(), 'key' => $role->key, 'name' => $role->name]),
                ]),
        ]);
    }

    public function revokeInvitation(Request $request, string $invitation): JsonResponse
    {
        try {
            $this->invitations->revoke($request->user(), PlatformInvitation::query()->where('uuid', $invitation)->firstOrFail());

            return response()->noContent();
        } catch (DomainException|InvalidArgumentException $exception) {
            return $this->invalid($exception);
        }
    }

    public function assignMemberRoles(AssignRolesRequest $request, int $membership): JsonResponse
    {
        try {
            $updated = $this->roles->assignRoles($request->user(), PlatformMembership::query()->findOrFail($membership), $request->validated('role_ids'));

            return response()->json(['data' => $this->memberData($updated)]);
        } catch (DomainException|InvalidArgumentException $exception) {
            return $this->invalid($exception);
        }
    }

    public function updateMemberStatus(UpdateMembershipStatusRequest $request, int $membership): JsonResponse
    {
        try {
            $updated = $this->roles->setMembershipStatus($request->user(), PlatformMembership::query()->findOrFail($membership), $request->validated('status'));

            return response()->json(['data' => $this->memberData($updated)]);
        } catch (DomainException|InvalidArgumentException $exception) {
            return $this->invalid($exception);
        }
    }

    private function roleData(PlatformRole $role): array
    {
        return [
            'id' => $role->getKey(),
            'key' => $role->key,
            'name' => $role->name,
            'description' => $role->description,
            'is_system' => $role->is_system,
            'is_protected' => $role->is_protected,
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

    private function memberData(PlatformMembership $member): array
    {
        return [
            'id' => $member->getKey(),
            'user' => $member->user ? ['id' => $member->user->getKey(), 'name' => $member->user->name, 'email' => $member->user->email] : null,
            'status' => $member->status,
            'roles' => $member->roles->map(fn (PlatformRole $role): array => ['id' => $role->getKey(), 'key' => $role->key, 'name' => $role->name]),
        ];
    }

    private function invalid(\Throwable $exception): JsonResponse
    {
        return response()->json([
            'status' => 'error',
            'message' => $exception->getMessage(),
        ], 422);
    }
}
