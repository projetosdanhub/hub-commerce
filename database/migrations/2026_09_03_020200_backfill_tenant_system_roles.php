<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $timestamp = now();
        $permissionIds = DB::table('permissions')
            ->where('scope', 'tenant')
            ->where('is_delegable', true)
            ->pluck('id');

        foreach (DB::table('tenants')->orderBy('id')->pluck('id') as $tenantId) {
            $roleId = DB::table('tenant_roles')
                ->where('tenant_id', $tenantId)
                ->where('key', 'admin')
                ->value('id');

            if ($roleId === null) {
                $roleId = DB::table('tenant_roles')->insertGetId([
                    'tenant_id' => $tenantId,
                    'key' => 'admin',
                    'name' => 'Administrador',
                    'description' => 'Cargo administrativo padrão da loja.',
                    'is_system' => true,
                    'is_protected' => true,
                    'is_assignable' => true,
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ]);
            }

            foreach ($permissionIds as $permissionId) {
                DB::table('tenant_role_permissions')->insertOrIgnore([
                    'tenant_role_id' => $roleId,
                    'permission_id' => $permissionId,
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ]);
            }
        }
    }

    public function down(): void
    {
        // Backfill de dados: não remova cargos que possam ter recebido vínculos
        // de membros após a migração.
    }
};
