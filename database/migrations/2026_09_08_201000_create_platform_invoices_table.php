<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('platform_invoices', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->restrictOnDelete();
            $table->foreignId('platform_subscription_id')->nullable()->constrained()->nullOnDelete();
            $table->string('number')->unique();
            $table->unsignedInteger('amount_cents');
            $table->string('currency', 3)->default('BRL');
            $table->string('status', 24)->default('DRAFT');
            $table->string('billing_provider', 40)->nullable();
            $table->string('external_id')->nullable();
            $table->timestamp('due_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('voided_at')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'status', 'due_at']);
            $table->unique(['billing_provider', 'external_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_invoices');
    }
};
