<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('provider_authorization_states', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('provider_installation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->string('state_hash', 64)->unique();
            $table->string('pkce_verifier')->nullable();
            $table->timestamp('expires_at');
            $table->timestamp('consumed_at')->nullable();
            $table->timestamps();

            $table->index(['provider_installation_id', 'expires_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('provider_authorization_states');
    }
};
