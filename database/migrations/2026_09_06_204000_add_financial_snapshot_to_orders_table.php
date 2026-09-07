<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->json('financial_snapshot')->nullable()->after('total');
            $table->unsignedSmallInteger('financial_snapshot_version')->nullable()->after('financial_snapshot');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->dropColumn(['financial_snapshot', 'financial_snapshot_version']);
        });
    }
};
