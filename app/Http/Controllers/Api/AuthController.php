<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email:rfc', 'max:255'],
            'password' => ['required', 'string', 'max:255'],
        ]);

        $user = User::where('email', mb_strtolower($credentials['email']))->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password) || ! $user->isActiveAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Credenciais invalidas ou acesso nao autorizado.',
            ], 401);
        }

        $user->tokens()->where('name', 'hub_admin_token')->delete();

        $expiresAt = now()->addMinutes((int) config('sanctum.expiration', 60));
        $token = $user->createToken('hub_admin_token', ['admin'], $expiresAt)->plainTextToken;

        return response()->json([
            'status' => 'success',
            'token' => $token,
            'expires_at' => $expiresAt->toIso8601String(),
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Sessao encerrada.',
        ]);
    }
}
