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
        Schema::table('orders', function (Blueprint $table) {
            // Adiciona a coluna logo após a coluna cancel_reason para ficar organizado
            $table->string('refund_method')->nullable()->after('cancel_reason');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Remove a coluna caso você precise reverter a migration no futuro
            $table->dropColumn('refund_method');
        });
    }
};