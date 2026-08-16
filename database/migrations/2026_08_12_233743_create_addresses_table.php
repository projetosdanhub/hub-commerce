<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('titulo')->nullable();
            $table->string('cep');
            $table->string('rua');
            $table->string('num');
            $table->string('complemento')->nullable();
            $table->string('referencia')->nullable();
            $table->string('bairro');
            $table->string('cidade');
            $table->string('uf');
            $table->boolean('padrao')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('addresses');
    }
};