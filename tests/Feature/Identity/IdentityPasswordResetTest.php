<?php

namespace Tests\Feature\Identity;

use App\Domain\Identity\IdentityPasswordResetService;
use App\Mail\PasswordResetLink;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class IdentityPasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_password_reset_uses_broker_token_and_revokes_existing_sessions(): void
    {
        Mail::fake();
        $user = User::query()->create([
            'name' => 'Pessoa Teste',
            'email' => 'senha@hub.test',
            'email_verified_at' => now(),
            'password' => Hash::make('SenhaAnterior123!'),
            'role' => 'cliente',
            'status' => 'ATIVO',
        ]);
        $user->createToken('sessao-antiga', ['admin']);

        $service = app(IdentityPasswordResetService::class);
        $service->send($user);

        Mail::assertSent(PasswordResetLink::class, fn (PasswordResetLink $mail): bool => $mail->hasTo($user->email));

        $token = Password::broker()->createToken($user);
        $result = $service->reset($user->email, $token, 'SenhaNovaForte123!');

        $this->assertTrue($result);
        $this->assertTrue(Hash::check('SenhaNovaForte123!', $user->fresh()->password));
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
