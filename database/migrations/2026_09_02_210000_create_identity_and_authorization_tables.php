<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permissions', function (Blueprint $table): void {
            $table->id();
            $table->string('key', 120)->unique();
            $table->string('scope', 20)->index();
            $table->string('module', 50);
            $table->string('action', 50);
            $table->boolean('is_delegable')->default(true);
            $table->string('risk_level', 20)->default('normal');
            $table->string('description')->nullable();
            $table->timestamps();

            $table->unique(['scope', 'module', 'action'], 'permissions_scope_module_action_unique');
        });

        Schema::create('platform_memberships', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->string('status', 20)->default('ACTIVE')->index();
            $table->unsignedInteger('authorization_version')->default(1);
            $table->timestamp('joined_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();

            $table->unique('user_id');
            $table->index(['status', 'user_id']);
        });

        Schema::create('platform_roles', function (Blueprint $table): void {
            $table->id();
            $table->string('key', 80)->unique();
            $table->string('name', 120);
            $table->text('description')->nullable();
            $table->boolean('is_system')->default(false);
            $table->boolean('is_protected')->default(false);
            $table->timestamps();
        });

        Schema::create('platform_role_permissions', function (Blueprint $table): void {
            $table->foreignId('platform_role_id')->constrained()->cascadeOnDelete();
            $table->foreignId('permission_id')->constrained()->restrictOnDelete();
            $table->timestamps();

            $table->primary(['platform_role_id', 'permission_id'], 'platform_role_permissions_primary');
        });

        Schema::create('platform_membership_roles', function (Blueprint $table): void {
            $table->foreignId('platform_membership_id')->constrained()->cascadeOnDelete();
            $table->foreignId('platform_role_id')->constrained()->restrictOnDelete();
            $table->timestamps();

            $table->primary(['platform_membership_id', 'platform_role_id'], 'platform_membership_roles_primary');
        });

        Schema::create('tenant_memberships', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->restrictOnDelete();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->string('status', 20)->default('ACTIVE')->index();
            $table->unsignedInteger('authorization_version')->default(1);
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('joined_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'user_id'], 'tenant_memberships_tenant_user_unique');
            $table->unique(['id', 'tenant_id'], 'tenant_memberships_id_tenant_unique');
            $table->index(['tenant_id', 'status']);
        });

        Schema::create('tenant_roles', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->restrictOnDelete();
            $table->string('key', 80);
            $table->string('name', 120);
            $table->text('description')->nullable();
            $table->boolean('is_system')->default(false);
            $table->boolean('is_protected')->default(false);
            $table->boolean('is_assignable')->default(true);
            $table->timestamps();

            $table->unique(['tenant_id', 'key'], 'tenant_roles_tenant_key_unique');
            $table->unique(['id', 'tenant_id'], 'tenant_roles_id_tenant_unique');
        });

        Schema::create('tenant_role_permissions', function (Blueprint $table): void {
            $table->foreignId('tenant_role_id')->constrained()->cascadeOnDelete();
            $table->foreignId('permission_id')->constrained()->restrictOnDelete();
            $table->timestamps();

            $table->primary(['tenant_role_id', 'permission_id'], 'tenant_role_permissions_primary');
        });

        Schema::create('tenant_membership_roles', function (Blueprint $table): void {
            $table->foreignId('tenant_id')->constrained()->restrictOnDelete();
            $table->unsignedBigInteger('tenant_membership_id');
            $table->unsignedBigInteger('tenant_role_id');
            $table->timestamps();

            $table->primary(
                ['tenant_id', 'tenant_membership_id', 'tenant_role_id'],
                'tenant_membership_roles_primary'
            );
            $table->foreign(
                ['tenant_membership_id', 'tenant_id'],
                'tenant_membership_roles_membership_tenant_foreign'
            )->references(['id', 'tenant_id'])->on('tenant_memberships')->cascadeOnDelete();
            $table->foreign(
                ['tenant_role_id', 'tenant_id'],
                'tenant_membership_roles_role_tenant_foreign'
            )->references(['id', 'tenant_id'])->on('tenant_roles')->cascadeOnDelete();
        });

        Schema::create('tenant_ownerships', function (Blueprint $table): void {
            $table->unsignedBigInteger('tenant_id')->primary();
            $table->unsignedBigInteger('tenant_membership_id')->unique();
            $table->foreignId('assigned_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->restrictOnDelete();
            $table->foreign(
                ['tenant_membership_id', 'tenant_id'],
                'tenant_ownerships_membership_tenant_foreign'
            )->references(['id', 'tenant_id'])->on('tenant_memberships')->restrictOnDelete();
        });

        Schema::create('tenant_invitations', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('tenant_id')->constrained()->restrictOnDelete();
            $table->string('email')->index();
            $table->string('token_hash', 64)->unique();
            $table->foreignId('invited_by_membership_id')->nullable()->constrained('tenant_memberships')->nullOnDelete();
            $table->foreignId('accepted_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('expires_at')->index();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'email']);
        });

        Schema::create('tenant_invitation_roles', function (Blueprint $table): void {
            $table->foreignId('tenant_id')->constrained()->restrictOnDelete();
            $table->unsignedBigInteger('tenant_invitation_id');
            $table->unsignedBigInteger('tenant_role_id');
            $table->timestamps();

            $table->primary(
                ['tenant_id', 'tenant_invitation_id', 'tenant_role_id'],
                'tenant_invitation_roles_primary'
            );
            $table->foreign('tenant_invitation_id')->references('id')->on('tenant_invitations')->cascadeOnDelete();
            $table->foreign(
                ['tenant_role_id', 'tenant_id'],
                'tenant_invitation_roles_role_tenant_foreign'
            )->references(['id', 'tenant_id'])->on('tenant_roles')->restrictOnDelete();
        });

        Schema::create('authorization_audit_logs', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('scope', 20)->index();
            $table->foreignId('tenant_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('actor_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 120)->index();
            $table->string('target_type', 160)->nullable();
            $table->string('target_id', 64)->nullable();
            $table->string('result', 20)->default('SUCCESS')->index();
            $table->string('reason', 500)->nullable();
            $table->json('before_values')->nullable();
            $table->json('after_values')->nullable();
            $table->json('context')->nullable();
            $table->string('request_id', 100)->nullable()->index();
            $table->string('ip_hash', 64)->nullable();
            $table->string('user_agent', 512)->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'created_at']);
            $table->index(['scope', 'action', 'created_at']);
        });

        Schema::create('user_mfa_methods', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 20);
            $table->text('secret');
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'type']);
        });

        Schema::create('user_mfa_recovery_codes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('code_hash', 255);
            $table->timestamp('used_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'used_at']);
        });

        Schema::create('user_sessions', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('session_id', 255)->nullable()->unique();
            $table->foreignId('personal_access_token_id')->nullable()
                ->constrained('personal_access_tokens')->nullOnDelete();
            $table->string('type', 20);
            $table->string('label', 120)->nullable();
            $table->string('ip_hash', 64)->nullable();
            $table->string('user_agent', 512)->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'revoked_at', 'last_seen_at']);
        });

        $this->seedPermissionCatalog();
        $this->backfillLegacyAdminAccess();
    }

    public function down(): void
    {
        Schema::dropIfExists('user_sessions');
        Schema::dropIfExists('user_mfa_recovery_codes');
        Schema::dropIfExists('user_mfa_methods');
        Schema::dropIfExists('authorization_audit_logs');
        Schema::dropIfExists('tenant_invitation_roles');
        Schema::dropIfExists('tenant_invitations');
        Schema::dropIfExists('tenant_ownerships');
        Schema::dropIfExists('tenant_membership_roles');
        Schema::dropIfExists('tenant_role_permissions');
        Schema::dropIfExists('tenant_roles');
        Schema::dropIfExists('tenant_memberships');
        Schema::dropIfExists('platform_membership_roles');
        Schema::dropIfExists('platform_role_permissions');
        Schema::dropIfExists('platform_roles');
        Schema::dropIfExists('platform_memberships');
        Schema::dropIfExists('permissions');
    }

    private function seedPermissionCatalog(): void
    {
        $timestamp = now();

        $definitions = [
            ['platform.tenants.view', 'platform', 'tenants', 'view', false, 'normal'],
            ['platform.tenants.manage', 'platform', 'tenants', 'manage', false, 'high'],
            ['platform.tenants.suspend', 'platform', 'tenants', 'suspend', false, 'critical'],
            ['platform.billing.view', 'platform', 'billing', 'view', false, 'high'],
            ['platform.billing.manage', 'platform', 'billing', 'manage', false, 'critical'],
            ['platform.team.view', 'platform', 'team', 'view', false, 'high'],
            ['platform.team.manage', 'platform', 'team', 'manage', false, 'critical'],
            ['platform.roles.view', 'platform', 'roles', 'view', false, 'high'],
            ['platform.roles.manage', 'platform', 'roles', 'manage', false, 'critical'],
            ['platform.audit.view', 'platform', 'audit', 'view', false, 'high'],
            ['platform.support.assume_tenant', 'platform', 'support', 'assume_tenant', false, 'critical'],
            ['tenant.dashboard.view', 'tenant', 'dashboard', 'view', true, 'normal'],
            ['tenant.catalog.view', 'tenant', 'catalog', 'view', true, 'normal'],
            ['tenant.catalog.manage', 'tenant', 'catalog', 'manage', true, 'normal'],
            ['tenant.orders.view', 'tenant', 'orders', 'view', true, 'normal'],
            ['tenant.orders.manage', 'tenant', 'orders', 'manage', true, 'high'],
            ['tenant.customers.view', 'tenant', 'customers', 'view', true, 'normal'],
            ['tenant.customers.manage', 'tenant', 'customers', 'manage', true, 'high'],
            ['tenant.shipping.view', 'tenant', 'shipping', 'view', true, 'normal'],
            ['tenant.shipping.manage', 'tenant', 'shipping', 'manage', true, 'high'],
            ['tenant.tracking.view', 'tenant', 'tracking', 'view', true, 'normal'],
            ['tenant.tracking.manage', 'tenant', 'tracking', 'manage', true, 'high'],
            ['tenant.storefront.view', 'tenant', 'storefront', 'view', true, 'normal'],
            ['tenant.storefront.manage', 'tenant', 'storefront', 'manage', true, 'high'],
            ['tenant.settings.view', 'tenant', 'settings', 'view', true, 'normal'],
            ['tenant.settings.manage', 'tenant', 'settings', 'manage', false, 'critical'],
            ['tenant.team.view', 'tenant', 'team', 'view', true, 'normal'],
            ['tenant.team.manage', 'tenant', 'team', 'manage', true, 'high'],
            ['tenant.roles.view', 'tenant', 'roles', 'view', true, 'normal'],
            ['tenant.roles.manage', 'tenant', 'roles', 'manage', true, 'critical'],
            ['tenant.audit.view', 'tenant', 'audit', 'view', true, 'high'],
            ['tenant.payments.view', 'tenant', 'payments', 'view', true, 'high'],
            ['tenant.payments.manage', 'tenant', 'payments', 'manage', false, 'critical'],
            ['tenant.integrations.manage', 'tenant', 'integrations', 'manage', false, 'critical'],
        ];

        $permissions = array_map(
            fn (array $definition): array => [
                'key' => $definition[0],
                'scope' => $definition[1],
                'module' => $definition[2],
                'action' => $definition[3],
                'is_delegable' => $definition[4],
                'risk_level' => $definition[5],
                'description' => null,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            $definitions,
        );

        DB::table('permissions')->insert($permissions);
        DB::table('platform_roles')->insert([
            'key' => 'superadmin',
            'name' => 'Superadmin',
            'description' => 'Autoridade máxima protegida da plataforma.',
            'is_system' => true,
            'is_protected' => true,
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ]);
    }

    private function backfillLegacyAdminAccess(): void
    {
        $tenantId = DB::table('tenants')->orderBy('id')->value('id');

        if ($tenantId === null || ! Schema::hasColumn('users', 'role')) {
            return;
        }

        $adminRoleId = $this->provisionTenantAdminRole((int) $tenantId);
        $admins = DB::table('users')
            ->where('role', 'admin')
            ->orderBy('id')
            ->get();

        $firstMembershipId = null;

        foreach ($admins as $admin) {
            if (Schema::hasColumn('users', 'status') && $admin->status !== null && strtoupper((string) $admin->status) !== 'ATIVO') {
                continue;
            }

            DB::table('tenant_memberships')->updateOrInsert(
                ['tenant_id' => $tenantId, 'user_id' => $admin->id],
                [
                    'status' => 'ACTIVE',
                    'authorization_version' => 1,
                    'joined_at' => now(),
                    'updated_at' => now(),
                    'created_at' => now(),
                ],
            );

            $membershipId = DB::table('tenant_memberships')
                ->where('tenant_id', $tenantId)
                ->where('user_id', $admin->id)
                ->value('id');

            DB::table('tenant_membership_roles')->insertOrIgnore([
                'tenant_id' => $tenantId,
                'tenant_membership_id' => $membershipId,
                'tenant_role_id' => $adminRoleId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $firstMembershipId ??= $membershipId;
        }

        if ($firstMembershipId !== null && ! DB::table('tenant_ownerships')->where('tenant_id', $tenantId)->exists()) {
            DB::table('tenant_ownerships')->insert([
                'tenant_id' => $tenantId,
                'tenant_membership_id' => $firstMembershipId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    private function provisionTenantAdminRole(int $tenantId): int
    {
        $timestamp = now();
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

        $permissionIds = DB::table('permissions')
            ->where('scope', 'tenant')
            ->where('is_delegable', true)
            ->pluck('id');

        foreach ($permissionIds as $permissionId) {
            DB::table('tenant_role_permissions')->insertOrIgnore([
                'tenant_role_id' => $roleId,
                'permission_id' => $permissionId,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ]);
        }

        return (int) $roleId;
    }
};
