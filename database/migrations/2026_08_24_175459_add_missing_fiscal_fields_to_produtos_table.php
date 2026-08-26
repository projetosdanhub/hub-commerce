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
            $table->string('gtin', 14)->nullable()->after('ncm');
            $table->string('unidade_medida', 10)->default('UN')->after('gtin');
            $table->decimal('icms_perc', 5, 2)->nullable()->after('unidade_medida');
            $table->decimal('ipi_perc', 5, 2)->nullable()->after('icms_perc');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('produtos', function (Blueprint $table) {
            $table->dropColumn(['gtin', 'unidade_medida', 'icms_perc', 'ipi_perc']);
        });
    }
};
