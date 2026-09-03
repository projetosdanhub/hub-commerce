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
        Schema::create('inventory_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('produto_id')->constrained('produtos')->cascadeOnDelete();
            $table->foreignId('variacao_id')->nullable()->constrained('produto_variacoes')->cascadeOnDelete();
            
            // Quantidade da transação (positivo = entrada, negativo = saída/reserva)
            $table->integer('quantidade');
            
            // Tipo: RESERVA, VENDA, ESTORNO, AJUSTE
            $table->string('tipo', 50);
            
            // Referência (Ex: order_id)
            $table->string('reference_id')->nullable();
            $table->string('reference_type')->nullable(); // Ex: App\Models\Order

            $table->timestamps();
            
            // Índices para performance em cálculo de saldo
            $table->index(['tenant_id', 'produto_id', 'variacao_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_transactions');
    }
};
