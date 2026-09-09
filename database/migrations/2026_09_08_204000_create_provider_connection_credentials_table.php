<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('provider_connection_credentials', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('provider_installation_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('provider_account_id')->nullable();
            $table->text('access_token');
            $table->text('refresh_token')->nullable();
            $table->json('scopes')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();

            $table->index(['expires_at', 'revoked_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('provider_connection_credentials');
    }
};
