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
        Schema::create('melhor_envio_settings', function (Blueprint $table) {
            $table->id();
            $table->text('access_token')->nullable(); // Token JWT Pessoal
            $table->json('carriers_ativas')->nullable(); // Transportadoras selecionadas
            $table->json('sender_info')->nullable(); // Dados e Endereço do Remetente (Loja)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('melhor_envio_settings');
    }
};