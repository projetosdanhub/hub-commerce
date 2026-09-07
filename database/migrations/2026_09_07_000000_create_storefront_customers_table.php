<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('storefront_customers', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('email');
            $table->string('password');
            $table->string('status', 24)->default('ACTIVE');
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();

            $table->unique(['tenant_id', 'email'], 'storefront_customers_tenant_email_unique');
            $table->index(['tenant_id', 'created_at'], 'storefront_customers_tenant_created_at_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('storefront_customers');
    }
};
