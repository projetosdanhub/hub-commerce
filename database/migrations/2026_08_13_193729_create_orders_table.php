<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up() {
    Schema::create('orders', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete(); // Chave estrangeira relacional
        $table->decimal('total', 10, 2)->default(0);
        $table->decimal('subtotal', 10, 2)->default(0);
        $table->decimal('frete', 10, 2)->default(0);
        $table->decimal('desconto', 10, 2)->default(0);
        $table->string('status')->default('A_PAGAR');
        $table->string('payment_gateway')->nullable();
        $table->string('payment_method')->nullable();
        $table->integer('payment_installments')->default(1);
        $table->string('tracking_code')->nullable();
        $table->string('reembolso_status')->nullable();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
