<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenant_app_installations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('app_key', 80);
            $table->string('status', 30)->default('INSTALLED');
            $table->timestamp('installed_at')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'app_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_app_installations');
    }
};
