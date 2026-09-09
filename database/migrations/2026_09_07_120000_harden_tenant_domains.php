<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenant_domains', function (Blueprint $table): void {
            $table->string('kind', 20)->default('CUSTOM')->after('domain');
            $table->string('status', 30)->default('PENDING')->after('verification_token_hash');
            $table->text('verification_token')->nullable()->after('verification_token_hash');
            $table->timestamp('verification_token_created_at')->nullable()->after('verification_token');
            $table->timestamp('dns_checked_at')->nullable()->after('verified_at');
            $table->timestamp('disconnected_at')->nullable()->after('dns_checked_at');

            $table->index(['tenant_id', 'kind', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('tenant_domains', function (Blueprint $table): void {
            $table->dropIndex(['tenant_id', 'kind', 'status']);
            $table->dropColumn([
                'kind',
                'status',
                'verification_token',
                'verification_token_created_at',
                'dns_checked_at',
                'disconnected_at',
            ]);
        });
    }
};
