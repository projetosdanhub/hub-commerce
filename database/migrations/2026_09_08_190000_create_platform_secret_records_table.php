<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('platform_secret_records', function (Blueprint $table): void {
            $table->id();
            $table->string('provider', 40);
            $table->string('purpose', 40);
            $table->string('environment', 16);
            $table->string('secret_ref')->unique();
            $table->string('status', 24)->default('UNCONFIGURED');
            $table->timestamp('rotated_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();

            $table->unique(['provider', 'purpose', 'environment']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_secret_records');
    }
};
