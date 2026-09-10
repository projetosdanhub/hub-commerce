<?php

namespace App\Console\Commands;

use App\Domain\Identity\AuthorizationAuditLogger;
use App\Models\PlatformMembership;
use App\Models\PlatformRole;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

final class GrantSuperadmin extends Command
{
    protected $signature = 'identity:grant-superadmin {email : E-mail de uma conta existente} {--force : Obrigatório em produção}';

    protected $description = 'Concede o cargo protegido de superadmin a uma conta existente.';

    public function handle(AuthorizationAuditLogger $audit): int
    {
        if (app()->environment('production') && ! $this->option('force')) {
            $this->error('Em produção, confirme esta operação com --force.');

            return self::FAILURE;
        }

        $email = mb_strtolower(trim((string) $this->argument('email')));
        $user = User::query()->where('email', $email)->first();

        if ($user === null) {
            $this->error('Nenhuma conta foi encontrada para este e-mail.');

            return self::FAILURE;
        }

        if (! $user->isActive()) {
            $this->error('A conta precisa estar ativa para receber acesso de superadmin.');

            return self::FAILURE;
        }

        $role = PlatformRole::query()->where('key', 'superadmin')->first();

        if ($role === null) {
            $this->error('O catálogo de identidade ainda não foi migrado.');

            return self::FAILURE;
        }

        DB::transaction(function () use ($user, $role, $audit): void {
            $membership = PlatformMembership::query()->firstOrCreate(
                ['user_id' => $user->getKey()],
                [
                    'status' => PlatformMembership::STATUS_ACTIVE,
                    'authorization_version' => 1,
                    'joined_at' => now(),
                ],
            );

            $membership->forceFill([
                'status' => PlatformMembership::STATUS_ACTIVE,
                'revoked_at' => null,
                'authorization_version' => $membership->authorization_version + 1,
            ])->save();
            $membership->roles()->syncWithoutDetaching([$role->getKey()]);

            $audit->record(
                'platform',
                'platform.superadmin.granted_by_console',
                target: $membership,
                context: ['execution' => 'artisan'],
            );
        });

        $this->info('O acesso de superadmin foi concedido. Oriente o usuário a ativar MFA no primeiro login.');

        return self::SUCCESS;
    }
}
