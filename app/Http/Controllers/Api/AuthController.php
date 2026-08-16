<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        // Verifica se o usuário existe e se a senha está correta
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'E-mail ou senha incorretos. Acesso negado.'
            ], 401);
        }

        // Se for válido, gera o Token de Segurança (Sanctum)
        $token = $user->createToken('hub_admin_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'token' => $token,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ]
        ]);
    }
}