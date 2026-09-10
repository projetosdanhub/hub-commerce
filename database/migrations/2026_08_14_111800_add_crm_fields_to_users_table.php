<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Adicionando a coluna de Permissão (Role) logo após a senha
            $table->string('role')->default('cliente')->after('password');
            
            // Adicionando Sexo e Origem após o nascimento
            $table->string('sexo')->nullable()->after('nascimento');
            $table->string('origem')->default('Orgânico / Direto')->after('sexo');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'sexo', 'origem']);
        });
    }
};