<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('storefront_customer_addresses', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('storefront_customer_id')->constrained()->cascadeOnDelete();
            $table->string('label', 80)->nullable();
            $table->string('cep', 9);
            $table->string('rua');
            $table->string('numero', 32);
            $table->string('complemento')->nullable();
            $table->string('referencia')->nullable();
            $table->string('bairro');
            $table->string('cidade');
            $table->string('uf', 2);
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            $table->index(
                ['tenant_id', 'storefront_customer_id', 'is_default'],
                'storefront_customer_addresses_default_index',
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('storefront_customer_addresses');
    }
};
