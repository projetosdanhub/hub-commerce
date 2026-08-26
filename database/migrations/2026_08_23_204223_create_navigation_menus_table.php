<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('navigation_menus', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->string('link')->nullable(); // Para URLs personalizadas
            $table->string('categoria_vinculada')->nullable(); // Para linkar com o nome de uma categoria real
            $table->integer('depth')->default(0); // 0 = Raiz, 1 = Submenu, 2 = Sub-submenu
            $table->integer('ordem')->default(0); // A ordem em que aparece na tela
            $table->string('banner')->nullable(); // A imagem promocional do dropdown
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('navigation_menus');
    }
};