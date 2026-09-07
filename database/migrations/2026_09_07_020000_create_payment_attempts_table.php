<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_attempts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('gateway', 40);
            $table->string('environment', 16);
            $table->string('payment_method', 40);
            $table->string('status', 24)->default('PENDING');
            $table->uuid('idempotency_key');
            $table->unsignedBigInteger('amount_cents');
            $table->char('currency', 3);
            $table->string('gateway_payment_id', 191)->nullable();
            $table->string('gateway_transaction_id', 191)->nullable();
            $table->string('failure_code', 80)->nullable();
            $table->timestamp('initiated_at')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->unique(
                ['tenant_id', 'gateway', 'idempotency_key'],
                'payment_attempts_tenant_gateway_idempotency_unique',
            );
            $table->index(
                ['tenant_id', 'order_id', 'status'],
                'payment_attempts_tenant_order_status_index',
            );
            $table->index('gateway_payment_id');
            $table->index('gateway_transaction_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_attempts');
    }
};
