<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vip_levels', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->boolean('is_default')->default(false);
            $table->decimal('gasto_requisito', 10, 2)->default(0);
            $table->integer('compras_requisito')->default(0);
            $table->decimal('mult_coins', 5, 2)->default(1.0);
            $table->decimal('desc_frete', 5, 2)->default(0);
            $table->decimal('desc_produtos', 5, 2)->default(0);
            $table->boolean('acumula_frete')->default(false);
            $table->string('frequencia_uso')->default('ILIMITADO'); // ILIMITADO, SEMANAL, MENSAL
            $table->integer('limite_uso')->default(0);
            $table->string('imagem')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vip_levels');
    }
};