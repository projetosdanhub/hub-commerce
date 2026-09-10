<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_shipments', function (Blueprint $table): void {
            $table->id();
            $table->uuid('public_id')->unique();
            $table->foreignId('tenant_id')->constrained()->restrictOnDelete();
            $table->foreignId('order_id')->constrained()->restrictOnDelete();
            $table->foreignId('provider_installation_id')->constrained()->restrictOnDelete();
            $table->string('environment', 16);
            $table->uuid('provider_reference')->nullable();
            $table->boolean('active_slot')->nullable()->default(true);
            $table->string('status', 24)->default('PREPARING');
            $table->string('operation', 24)->nullable();
            $table->timestamp('operation_started_at')->nullable();
            $table->char('request_fingerprint', 64);
            $table->text('request_payload');
            $table->unsignedBigInteger('quoted_cents');
            $table->string('tracking_code', 120)->nullable();
            $table->string('failure_code', 80)->nullable();
            $table->timestamps();
            $table->unique(['order_id', 'active_slot']);
            $table->unique(['environment', 'provider_reference']);
            $table->index(['tenant_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_shipments');
    }
};
