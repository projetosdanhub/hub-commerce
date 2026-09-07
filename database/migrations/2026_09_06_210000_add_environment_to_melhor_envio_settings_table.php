<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('melhor_envio_settings', function (Blueprint $table): void {
            $table->string('environment', 20)->default('SANDBOX')->after('access_token');
        });
    }

    public function down(): void
    {
        Schema::table('melhor_envio_settings', function (Blueprint $table): void {
            $table->dropColumn('environment');
        });
    }
};
