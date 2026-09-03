<?php

namespace App\Http\Controllers\Api;

use App\Domain\Identity\IdentityAccessService;
use App\Domain\Identity\MfaService;
use App\Domain\Identity\UserSessionService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Identity\AdminLoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

final class AuthController extends Controller
{
    public function __construct(
        private readonly IdentityAccessService $access,
        private readonly MfaService $mfa,
        private readonly UserSessionService $sessions,
    ) {
    }

    public function login(AdminLoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();
        $user = User::query()->where('email', mb_strtolower($credentials['email']))->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password) || ! $this->access->hasAdministrativeAccess($user)) {
            return $this->invalidCredentials();
        }

        if ($this->mfa->mustEnroll($user)) {
            $expiresAt = now()->addMinutes(15);
            $createdToken = $user->createToken('hub_mfa_enrollment', ['mfa.enroll'], $expiresAt);
            $this->sessions->recordToken($user, $createdToken->accessToken, $request);

            return response()->json([
                'status' => 'mfa_enrollment_required',
                'message' => 'A autenticação multifator precisa ser configurada antes de acessar o painel.',
                'enrollment_token' => $createdToken->plainTextToken,
                'expires_at' => $expiresAt->toIso8601String(),
            ], 403)->header('Cache-Control', 'no-store, private');
        }

        if ($this->mfa->requiresChallenge($user)) {
            $code = $credentials['mfa_code'] ?? null;

            if ($code === null || ! $this->mfa->verifyChallenge($user, $code)) {
                return response()->json([
                    'status' => 'mfa_required',
                    'message' => 'Informe um código válido de autenticação multifator.',
                ], 401);
            }
        }

        $abilities = $this->access->loginAbilities($user);

        if ($abilities === []) {
            return $this->invalidCredentials();
        }

        $expiresAt = now()->addMinutes((int) config('sanctum.expiration', 60));
        $createdToken = $user->createToken('hub_admin_session', $abilities, $expiresAt);
        $this->sessions->recordToken($user, $createdToken->accessToken, $request);

        return response()->json([
            'status' => 'success',
            'token' => $createdToken->plainTextToken,
            'expires_at' => $expiresAt->toIso8601String(),
            'access' => $abilities,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ])->header('Cache-Control', 'no-store, private');
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user !== null) {
            $this->sessions->revokeCurrent($user, $user->currentAccessToken());
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Sessão encerrada.',
        ]);
    }

    private function invalidCredentials(): JsonResponse
    {
        return response()->json([
            'status' => 'error',
            'message' => 'Credenciais inválidas ou acesso não autorizado.',
        ], 401);
    }
}
