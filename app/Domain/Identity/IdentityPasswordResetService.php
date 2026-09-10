<?php

namespace App\Domain\Identity;

use App\Mail\PasswordResetLink;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

final class IdentityPasswordResetService
{
    public function __construct(
        private readonly UserSessionService $sessions,
        private readonly AuthorizationAuditLogger $audit,
    ) {
    }

    public function send(User $user): void
    {
        $token = Password::broker()->createToken($user);

        // O token está hashado no banco. O envio é síncrono para que o segredo
        // não seja serializado em uma fila ou log de job.
        Mail::to($user->email)->send(new PasswordResetLink($token, $user->name, $user->email));
        $this->audit->record('identity', 'identity.password_reset.requested', $user);
    }

    public function reset(string $email, string $token, string $password): bool
    {
        $status = Password::broker()->reset(
            [
                'email' => mb_strtolower(trim($email)),
                'token' => $token,
                'password' => $password,
            ],
            function (User $user, string $newPassword): void {
                $user->forceFill([
                    'password' => Hash::make($newPassword),
                    'remember_token' => Str::random(60),
                ])->save();

                $this->sessions->revokeAll($user);
                $this->audit->record('identity', 'identity.password_reset.completed', $user);
            },
        );

        return $status === Password::PASSWORD_RESET;
    }
}
