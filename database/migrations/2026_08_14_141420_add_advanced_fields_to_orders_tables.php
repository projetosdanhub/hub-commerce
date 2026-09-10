<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Adicionando tipo de cupom e valor exato nos pedidos
        Schema::table('orders', function (Blueprint $table) {
            $table->string('coupon_type')->nullable()->after('coupon_code'); // Ex: 'Loja', 'Frete'
            $table->decimal('coupon_value', 10, 2)->default(0)->after('coupon_type');
        });

        // 2. Adicionando descrição e dados de personalização nos itens
        Schema::table('order_items', function (Blueprint $table) {
            $table->text('short_description')->nullable()->after('product_name');
            $table->json('customization')->nullable()->after('product_image'); // Guarda {texto: "...", imagem: "url..."}
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['coupon_type', 'coupon_value']);
        });
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['short_description', 'customization']);
        });
    }
};