<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->foreignId('storefront_customer_id')
                ->nullable()
                ->after('user_id')
                ->constrained()
                ->nullOnDelete();

            $table->index(
                ['tenant_id', 'storefront_customer_id'],
                'orders_tenant_storefront_customer_index',
            );
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->dropIndex('orders_tenant_storefront_customer_index');
            $table->dropForeign(['storefront_customer_id']);
            $table->dropColumn('storefront_customer_id');
        });
    }
};
