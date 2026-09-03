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
        Schema::table('produto_variacoes', function (Blueprint $table) {
            $table->integer('quantidade_encomendada')->default(0)->after('estoque');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('produto_variacoes', function (Blueprint $table) {
            $table->dropColumn('quantidade_encomendada');
        });
    }
};
