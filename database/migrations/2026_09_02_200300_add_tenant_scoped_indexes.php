<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categorias', function (Blueprint $table): void {
            $table->dropUnique('categorias_slug_unique');
            $table->unique(['tenant_id', 'slug'], 'categorias_tenant_slug_unique');
        });

        Schema::table('produtos', function (Blueprint $table): void {
            $table->dropUnique('produtos_slug_unique');
            $table->unique(['tenant_id', 'slug'], 'produtos_tenant_slug_unique');
            $table->index(['tenant_id', 'status_vitrine', 'ativo'], 'produtos_tenant_vitrine_index');
        });

        Schema::table('cupoms', function (Blueprint $table): void {
            $table->unique(['tenant_id', 'codigo'], 'cupoms_tenant_codigo_unique');
        });

        Schema::table('tracking_destinations', function (Blueprint $table): void {
            $table->dropUnique('tracking_destinations_provider_unique');
            $table->unique(['tenant_id', 'provider'], 'tracking_destinations_tenant_provider_unique');
        });

        Schema::table('global_settings', function (Blueprint $table): void {
            $table->dropUnique('global_settings_key_unique');
            $table->unique(['tenant_id', 'group', 'key'], 'global_settings_tenant_group_key_unique');
        });

        Schema::table('storefront_configs', function (Blueprint $table): void {
            $table->unique('tenant_id', 'storefront_configs_tenant_unique');
        });

        Schema::table('melhor_envio_settings', function (Blueprint $table): void {
            $table->unique('tenant_id', 'melhor_envio_settings_tenant_unique');
        });

        Schema::table('crm_settings', function (Blueprint $table): void {
            $table->unique('tenant_id', 'crm_settings_tenant_unique');
        });

        Schema::table('orders', function (Blueprint $table): void {
            $table->index(['tenant_id', 'created_at'], 'orders_tenant_created_at_index');
        });

        Schema::table('tracking_logs', function (Blueprint $table): void {
            $table->index(['tenant_id', 'created_at'], 'tracking_logs_tenant_created_at_index');
        });
    }

    public function down(): void
    {
        Schema::table('tracking_logs', function (Blueprint $table): void {
            $table->dropIndex('tracking_logs_tenant_created_at_index');
        });
        Schema::table('orders', function (Blueprint $table): void {
            $table->dropIndex('orders_tenant_created_at_index');
        });
        Schema::table('crm_settings', function (Blueprint $table): void {
            $table->dropUnique('crm_settings_tenant_unique');
        });
        Schema::table('melhor_envio_settings', function (Blueprint $table): void {
            $table->dropUnique('melhor_envio_settings_tenant_unique');
        });
        Schema::table('storefront_configs', function (Blueprint $table): void {
            $table->dropUnique('storefront_configs_tenant_unique');
        });
        Schema::table('global_settings', function (Blueprint $table): void {
            $table->dropUnique('global_settings_tenant_group_key_unique');
            $table->unique('key', 'global_settings_key_unique');
        });
        Schema::table('tracking_destinations', function (Blueprint $table): void {
            $table->dropUnique('tracking_destinations_tenant_provider_unique');
            $table->unique('provider', 'tracking_destinations_provider_unique');
        });
        Schema::table('cupoms', function (Blueprint $table): void {
            $table->dropUnique('cupoms_tenant_codigo_unique');
        });
        Schema::table('produtos', function (Blueprint $table): void {
            $table->dropIndex('produtos_tenant_vitrine_index');
            $table->dropUnique('produtos_tenant_slug_unique');
            $table->unique('slug', 'produtos_slug_unique');
        });
        Schema::table('categorias', function (Blueprint $table): void {
            $table->dropUnique('categorias_tenant_slug_unique');
            $table->unique('slug', 'categorias_slug_unique');
        });
    }
};
