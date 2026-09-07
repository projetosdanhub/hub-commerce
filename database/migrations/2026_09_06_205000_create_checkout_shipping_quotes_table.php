<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('checkout_shipping_quotes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->uuid('token');
            $table->char('cart_fingerprint', 64);
            $table->char('destination_fingerprint', 64);
            $table->string('provider', 80);
            $table->string('service_code', 80);
            $table->foreignId('carrier_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedInteger('shipping_cents');
            $table->unsignedSmallInteger('estimated_delivery_days')->nullable();
            $table->json('provider_metadata')->nullable();
            $table->timestamp('expires_at');
            $table->timestamp('invalidated_at')->nullable();
            $table->timestamps();

            $table->unique('token');
            $table->index(['tenant_id', 'cart_fingerprint', 'destination_fingerprint']);
            $table->index(['tenant_id', 'expires_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checkout_shipping_quotes');
    }
};
