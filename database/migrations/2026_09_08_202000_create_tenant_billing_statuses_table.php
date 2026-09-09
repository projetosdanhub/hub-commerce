<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenant_billing_statuses', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->unique()->constrained()->restrictOnDelete();
            $table->string('status', 24)->default('ACTIVE');
            $table->timestamp('grace_ends_at')->nullable();
            $table->timestamp('restricted_at')->nullable();
            $table->timestamp('suspended_at')->nullable();
            $table->timestamp('reactivated_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_billing_statuses');
    }
};
