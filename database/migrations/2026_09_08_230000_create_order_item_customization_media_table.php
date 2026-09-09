<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_item_customization_media', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->restrictOnDelete();
            $table->foreignId('order_item_id')->constrained('order_items')->cascadeOnDelete();
            $table->string('original_name');
            $table->string('storage_path');
            $table->string('mime_type', 127);
            $table->unsignedInteger('byte_size');
            $table->timestamps();

            $table->index(['tenant_id', 'order_item_id'], 'order_item_customization_media_tenant_item_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_item_customization_media');
    }
};
