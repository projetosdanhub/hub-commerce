<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('provider_installations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->restrictOnDelete();
            $table->uuid('public_id')->unique();
            $table->string('provider', 40);
            $table->string('environment', 16);
            $table->string('connection_strategy', 24);
            $table->string('status', 24)->default('PENDING');
            $table->string('secret_ref')->nullable();
            $table->timestamp('connected_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'provider', 'environment']);
            $table->index(['tenant_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('provider_installations');
    }
};
