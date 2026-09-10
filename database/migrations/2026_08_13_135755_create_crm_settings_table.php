<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('permite_cadastro')->default(true);
            $table->boolean('login_apenas_convite')->default(false);
            $table->boolean('aprovar_comentarios')->default(false);
            $table->boolean('bloquear_fora_do_pais')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_settings');
    }
};