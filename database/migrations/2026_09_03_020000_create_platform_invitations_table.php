<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('platform_invitations', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('email')->index();
            $table->string('token_hash', 64)->unique();
            $table->foreignId('invited_by_membership_id')
                ->nullable()
                ->constrained('platform_memberships')
                ->nullOnDelete();
            $table->foreignId('accepted_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamp('expires_at')->index();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();

            $table->index(['email', 'expires_at']);
        });

        Schema::create('platform_invitation_roles', function (Blueprint $table): void {
            $table->unsignedBigInteger('platform_invitation_id');
            $table->unsignedBigInteger('platform_role_id');
            $table->timestamps();

            $table->primary(
                ['platform_invitation_id', 'platform_role_id'],
                'platform_invitation_roles_primary',
            );
            $table->foreign('platform_invitation_id')
                ->references('id')
                ->on('platform_invitations')
                ->cascadeOnDelete();
            $table->foreign('platform_role_id')
                ->references('id')
                ->on('platform_roles')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_invitation_roles');
        Schema::dropIfExists('platform_invitations');
    }
};
