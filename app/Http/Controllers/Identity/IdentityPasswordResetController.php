<?php

namespace App\Http\Controllers\Identity;

use App\Domain\Identity\IdentityPasswordResetService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Identity\ForgotPasswordRequest;
use App\Http\Requests\Identity\ResetPasswordRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class IdentityPasswordResetController extends Controller
{
    public function __construct(private readonly IdentityPasswordResetService $passwords)
    {
    }

    public function request(ForgotPasswordRequest $request): JsonResponse
    {
        $email = mb_strtolower(trim($request->validated('email')));
        $user = User::query()->where('email', $email)->first();

        if ($user !== null) {
            $this->passwords->send($user);
        }

        // A resposta é constante para não permitir enumeração de contas.
        return response()->json([
            'status' => 'success',
            'message' => 'Se houver uma conta com este e-mail, enviaremos as instruções de redefinição.',
        ], 202);
    }

    public function form(Request $request)
    {
        $data = $request->validate([
            'token' => ['required', 'string', 'min:40', 'max:255'],
            'email' => ['required', 'email:rfc', 'max:255'],
        ]);

        return response()
            ->view('identity.password-reset-form', $data)
            ->header('Cache-Control', 'no-store, private');
    }

    public function reset(ResetPasswordRequest $request)
    {
        $valid = $this->passwords->reset(
            $request->validated('email'),
            $request->validated('token'),
            $request->validated('password'),
        );

        if (! $valid) {
            return response()
                ->view('identity.password-reset-result', ['success' => false], 422)
                ->header('Cache-Control', 'no-store, private');
        }

        return response()
            ->view('identity.password-reset-result', ['success' => true])
            ->header('Cache-Control', 'no-store, private');
    }
}
