<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Removemos as antigas para colocar a nova JSON
            $table->dropColumn(['coupon_code', 'coupon_type', 'coupon_value']);
            // A nova coluna que guarda tudo: [{"nome": "BLACK10", "tipo": "Loja", "valor": 50}, {"nome": "FRETEZERO", "tipo": "Frete", "valor": 20}]
            $table->json('applied_coupons')->nullable()->after('desconto');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('applied_coupons');
        });
    }
};