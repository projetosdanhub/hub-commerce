<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipping_benefit_rules', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('type', 32);
            $table->foreignId('product_id')->nullable()->constrained('produtos')->cascadeOnDelete();
            $table->unsignedTinyInteger('percentage')->nullable();
            $table->unsignedInteger('priority')->default(100);
            $table->boolean('is_active')->default(true);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'is_active', 'priority'], 'shipping_benefit_rules_tenant_active_priority_index');
            $table->index(['tenant_id', 'product_id'], 'shipping_benefit_rules_tenant_product_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipping_benefit_rules');
    }
};
