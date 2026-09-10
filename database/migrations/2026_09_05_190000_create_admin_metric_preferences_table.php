<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_metric_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('context', 64);
            $table->json('preferences');
            $table->timestamps();

            $table->unique(['tenant_id', 'user_id', 'context']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_metric_preferences');
    }
};
