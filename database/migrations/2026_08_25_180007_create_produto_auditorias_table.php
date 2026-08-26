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
        Schema::create('produto_auditorias', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('produto_id')->nullable();
            $table->unsignedBigInteger('admin_id')->nullable();
            $table->string('acao'); // Criação, Atualização, Exclusão, etc
            $table->string('entidade'); // Nome ou SKU do Produto
            $table->text('detalhes')->nullable();
            $table->timestamps();

            // Chaves estrangeiras (opcional, mas recomendado para integridade referencial)
            $table->foreign('produto_id')->references('id')->on('produtos')->onDelete('set null');
            $table->foreign('admin_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('produto_auditorias');
    }
};
