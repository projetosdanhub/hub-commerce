<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('produto_variacoes', function (Blueprint $table): void {
            $table->unique(['tenant_id', 'sku'], 'produto_variacoes_tenant_sku_unique');
        });

        Schema::table('produtos', function (Blueprint $table): void {
            $table->unique(
                ['tenant_id', 'sku_ref', 'sku_sufixo'],
                'produtos_tenant_sku_ref_sufixo_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::table('produtos', function (Blueprint $table): void {
            $table->dropUnique('produtos_tenant_sku_ref_sufixo_unique');
        });

        Schema::table('produto_variacoes', function (Blueprint $table): void {
            $table->dropUnique('produto_variacoes_tenant_sku_unique');
        });
    }
};
