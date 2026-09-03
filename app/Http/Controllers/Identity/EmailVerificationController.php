<?php

namespace App\Http\Controllers\Identity;

use App\Domain\Identity\AuthorizationAuditLogger;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class EmailVerificationController extends Controller
{
    public function __construct(private readonly AuthorizationAuditLogger $audit)
    {
    }

    public function verify(Request $request, int $id, string $hash): JsonResponse
    {
        $user = User::query()->findOrFail($id);

        if (! hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            abort(403, 'Assinatura de verificação inválida.');
        }

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            $this->audit->record('identity', 'identity.email.verified', $user, target: $user);
        }

        return response()->json([
            'status' => 'success',
            'data' => ['verified' => true],
        ]);
    }

    public function send(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->hasVerifiedEmail()) {
            $user->sendEmailVerificationNotification();
            $this->audit->record('identity', 'identity.email.verification_requested', $user, target: $user);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Se necessário, um novo e-mail de verificação foi enviado.',
        ], 202);
    }
}
