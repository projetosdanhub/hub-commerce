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
        Schema::table('produtos', function (Blueprint $table) {
            $table->string('gtin', 14)->nullable()->after('quantidade_estoque');
            $table->string('cst', 3)->nullable()->after('gtin');
            $table->string('cfop', 4)->nullable()->after('cst');
            $table->string('unidade', 2)->nullable()->after('cfop');
            $table->decimal('icms_perc', 5, 2)->nullable()->after('unidade');
            $table->decimal('ipi_perc', 5, 2)->nullable()->after('icms_perc');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('produtos', function (Blueprint $table) {
            $table->dropColumn([
                'gtin',
                'cst',
                'cfop',
                'unidade',
                'icms_perc',
                'ipi_perc'
            ]);
        });
    }
};
