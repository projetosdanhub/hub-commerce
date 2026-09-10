<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Adicionando os campos do CRM
            $table->string('telefone')->nullable();
            $table->string('cpf')->unique()->nullable();
            $table->date('nascimento')->nullable();
            $table->string('status')->default('ATIVO'); // ATIVO, INATIVO, SUSPENSO
            $table->text('notas')->nullable();
            
            // Adicionando os saldos da Carteira
            $table->decimal('coins', 10, 2)->default(0);
            $table->decimal('cashback', 10, 2)->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['telefone', 'cpf', 'nascimento', 'status', 'notas', 'coins', 'cashback']);
        });
    }
};