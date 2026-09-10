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
        Schema::create('shipping_packages', function (Blueprint $table) {
            $table->id();
            $table->string('nome'); // Ex: "Caixa Padrão P", "Caixa Caneca", "Envelope Bolha"
            $table->decimal('altura', 8, 2); // em cm (mínimo 1cm no ME)
            $table->decimal('largura', 8, 2); // em cm (mínimo 11cm no ME)
            $table->decimal('comprimento', 8, 2); // em cm (mínimo 16cm no ME)
            $table->decimal('peso_vazio', 8, 3)->default(0.000); // em kg (ex: 0.100 kg)
            $table->boolean('is_default')->default(false); // Se é a embalagem padrão pré-selecionada
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipping_packages');
    }
};