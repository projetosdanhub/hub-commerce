<?php

namespace App\Http\Controllers\Identity;

use App\Domain\Identity\InvitationException;
use App\Domain\Identity\PlatformInvitationService;
use App\Domain\Identity\TenantInvitationService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Identity\AcceptInvitationRequest;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;

final class InvitationAcceptanceController extends Controller
{
    public function __construct(
        private readonly TenantInvitationService $tenantInvitations,
        private readonly PlatformInvitationService $platformInvitations,
    ) {
    }

    public function acceptTenant(AcceptInvitationRequest $request): JsonResponse
    {
        try {
            $membership = $this->tenantInvitations->accept($request->user(), $request->validated('token'));

            return response()->json([
                'status' => 'success',
                'data' => [
                    'scope' => 'tenant',
                    'membership_id' => $membership->getKey(),
                    'role_ids' => $membership->roles->modelKeys(),
                ],
            ]);
        } catch (InvitationException|\InvalidArgumentException $exception) {
            return $this->invalidInvitation();
        } catch (AuthorizationException $exception) {
            return response()->json([
                'status' => 'error',
                'code' => 'REQUEST_FAILED',
                'message' => 'Este convite não pode ser aceito por esta conta.',
            ], 403);
        }
    }

    public function acceptPlatform(AcceptInvitationRequest $request): JsonResponse
    {
        try {
            $membership = $this->platformInvitations->accept($request->user(), $request->validated('token'));

            return response()->json([
                'status' => 'success',
                'data' => [
                    'scope' => 'platform',
                    'membership_id' => $membership->getKey(),
                    'role_ids' => $membership->roles->modelKeys(),
                ],
            ]);
        } catch (InvitationException|\InvalidArgumentException $exception) {
            return $this->invalidInvitation();
        } catch (AuthorizationException $exception) {
            return response()->json([
                'status' => 'error',
                'code' => 'REQUEST_FAILED',
                'message' => 'Este convite não pode ser aceito por esta conta.',
            ], 403);
        }
    }

    private function invalidInvitation(): JsonResponse
    {
        return response()->json([
            'status' => 'error',
            'code' => 'REQUEST_FAILED',
            'message' => 'O convite é inválido, expirou ou já foi utilizado.',
        ], 422);
    }
}
