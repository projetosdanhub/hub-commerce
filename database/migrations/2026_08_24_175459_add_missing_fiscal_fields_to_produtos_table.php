<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Esta migration foi publicada com colunas fiscais já criadas pela
     * migration imediatamente anterior. Mantém somente a coluna que faltava.
     */
    public function up(): void
    {
        if (Schema::hasColumn('produtos', 'unidade_medida')) {
            return;
        }

        Schema::table('produtos', function (Blueprint $table): void {
            $table->string('unidade_medida', 10)->default('UN')->after('gtin');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasColumn('produtos', 'unidade_medida')) {
            return;
        }

        Schema::table('produtos', function (Blueprint $table): void {
            $table->dropColumn('unidade_medida');
        });
    }
};
