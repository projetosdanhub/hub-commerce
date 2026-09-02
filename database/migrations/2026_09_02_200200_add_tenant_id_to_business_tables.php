<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const TABLES = [
        'addresses',
        'carrier_audit_logs',
        'carriers',
        'categorias',
        'categories',
        'crm_settings',
        'cupoms',
        'customer_audit_logs',
        'customer_sensitive_documents',
        'global_settings',
        'melhor_envio_settings',
        'menu_configs',
        'navigation_menus',
        'order_addresses',
        'order_histories',
        'order_items',
        'orders',
        'produto_auditorias',
        'produto_variacoes',
        'produtos',
        'shipping_packages',
        'storefront_configs',
        'tracking_destinations',
        'tracking_logs',
        'tracking_rules',
        'vip_levels',
        'wallet_transactions',
    ];

    public function up(): void
    {
        $tenantId = DB::table('tenants')->orderBy('id')->value('id');

        foreach (self::TABLES as $tableName) {
            if (! Schema::hasTable($tableName) || Schema::hasColumn($tableName, 'tenant_id')) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table): void {
                $table->unsignedBigInteger('tenant_id')->nullable()->index();
            });

            DB::table($tableName)->whereNull('tenant_id')->update(['tenant_id' => $tenantId]);

            Schema::table($tableName, function (Blueprint $table): void {
                $table->unsignedBigInteger('tenant_id')->nullable(false)->change();
                $table->foreign('tenant_id')->references('id')->on('tenants')->restrictOnDelete();
            });
        }
    }

    public function down(): void
    {
        foreach (array_reverse(self::TABLES) as $tableName) {
            if (! Schema::hasTable($tableName) || ! Schema::hasColumn($tableName, 'tenant_id')) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table): void {
                $table->dropForeign(['tenant_id']);
                $table->dropColumn('tenant_id');
            });
        }
    }
};
