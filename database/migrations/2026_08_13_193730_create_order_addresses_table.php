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
        Schema::create('order_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->string('cep');
            $table->string('rua'); // Atualizado
            $table->string('num'); // Atualizado
            $table->string('complemento')->nullable();
            $table->string('referencia')->nullable(); // Atualizado
            $table->string('bairro');
            $table->string('cidade');
            $table->string('uf'); // Atualizado
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_addresses');
    }
};
