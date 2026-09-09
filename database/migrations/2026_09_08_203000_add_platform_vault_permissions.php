<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $timestamp = now();
        $permissions = [
            [
                'key' => 'platform.vault.view',
                'scope' => 'platform',
                'module' => 'vault',
                'action' => 'view',
                'is_delegable' => true,
                'risk_level' => 'high',
                'description' => 'Consultar metadados e diagnósticos do Cofre da plataforma.',
            ],
            [
                'key' => 'platform.vault.manage',
                'scope' => 'platform',
                'module' => 'vault',
                'action' => 'manage',
                'is_delegable' => false,
                'risk_level' => 'critical',
                'description' => 'Revogar referências de credenciais da plataforma.',
            ],
        ];

        foreach ($permissions as $permission) {
            DB::table('permissions')->insertOrIgnore([
                ...$permission,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ]);

            DB::table('permissions')
                ->where('key', $permission['key'])
                ->update([
                    ...$permission,
                    'updated_at' => $timestamp,
                ]);
        }
    }

    public function down(): void
    {
        // Não remove permissões: elas podem ter sido associadas a cargos.
    }
};
