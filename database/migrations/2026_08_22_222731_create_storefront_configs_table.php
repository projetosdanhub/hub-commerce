<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('storefront_configs', function (Blueprint $table) {
            $table->id();
            $table->json('layout_blocks'); // Guarda a ordem e propriedades dos blocos
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('storefront_configs');
    }
};