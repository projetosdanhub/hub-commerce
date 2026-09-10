<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('navigation_menus', function (Blueprint $table) {
            $table->unsignedBigInteger('menu_config_id')->nullable()->after('id');
            $table->foreign('menu_config_id')->references('id')->on('menu_configs')->onDelete('cascade');
        });

        Schema::table('storefront_configs', function (Blueprint $table) {
            $table->unsignedBigInteger('active_menu_id')->nullable()->after('id');
            $table->foreign('active_menu_id')->references('id')->on('menu_configs')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('navigation_menus', function (Blueprint $table) {
            $table->dropForeign(['menu_config_id']);
            $table->dropColumn('menu_config_id');
        });

        Schema::table('storefront_configs', function (Blueprint $table) {
            $table->dropForeign(['active_menu_id']);
            $table->dropColumn('active_menu_id');
        });
    }
};
