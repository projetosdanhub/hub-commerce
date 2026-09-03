<?php

namespace App\Http\Controllers\Identity;

use App\Domain\Identity\MfaService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Identity\MfaCodeRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class MfaController extends Controller
{
    public function __construct(private readonly MfaService $mfa)
    {
    }

    public function status(Request $request): JsonResponse
    {
        return response()->json([
            'data' => [
                'enabled' => $this->mfa->isEnabled($request->user()),
                'enrollment_required' => $this->mfa->mustEnroll($request->user()),
            ],
        ]);
    }

    public function begin(Request $request): JsonResponse
    {
        $this->ensureEnrollmentToken($request);

        try {
            $enrollment = $this->mfa->beginEnrollment($request->user());

            return response()
                ->json(['data' => $enrollment])
                ->header('Cache-Control', 'no-store, private');
        } catch (\DomainException|\InvalidArgumentException|\LogicException $exception) {
            return response()->json([
                'status' => 'error',
                'message' => $exception->getMessage(),
            ], 422);
        }
    }

    public function confirm(MfaCodeRequest $request): JsonResponse
    {
        $this->ensureEnrollmentToken($request);

        try {
            $recoveryCodes = $this->mfa->confirmEnrollment($request->user(), $request->validated('code'));

            return response()
                ->json(['data' => ['recovery_codes' => $recoveryCodes]])
                ->header('Cache-Control', 'no-store, private');
        } catch (\InvalidArgumentException $exception) {
            return response()->json([
                'status' => 'error',
                'message' => 'Código de autenticação inválido.',
            ], 422);
        }
    }

    public function regenerateRecoveryCodes(MfaCodeRequest $request): JsonResponse
    {
        $this->ensureFullAdministrativeToken($request);

        try {
            $recoveryCodes = $this->mfa->regenerateRecoveryCodes($request->user(), $request->validated('code'));

            return response()
                ->json(['data' => ['recovery_codes' => $recoveryCodes]])
                ->header('Cache-Control', 'no-store, private');
        } catch (\InvalidArgumentException $exception) {
            return response()->json([
                'status' => 'error',
                'message' => 'Código de autenticação inválido.',
            ], 422);
        }
    }

    public function disable(MfaCodeRequest $request): JsonResponse
    {
        $this->ensureFullAdministrativeToken($request);

        try {
            $this->mfa->disable($request->user(), $request->validated('code'));

            return response()->noContent();
        } catch (\InvalidArgumentException $exception) {
            return response()->json([
                'status' => 'error',
                'message' => 'Código de autenticação inválido.',
            ], 422);
        }
    }

    private function ensureEnrollmentToken(Request $request): void
    {
        $token = $request->user()?->currentAccessToken();

        if ($token !== null && ! $token->can('admin') && ! $token->can('mfa.enroll')) {
            abort(403, 'A sessão não possui escopo para configurar MFA.');
        }
    }

    private function ensureFullAdministrativeToken(Request $request): void
    {
        $token = $request->user()?->currentAccessToken();

        if ($token !== null && ! $token->can('admin')) {
            abort(403, 'A sessão não possui escopo para esta ação.');
        }
    }
}
