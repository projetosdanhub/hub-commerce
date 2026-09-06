<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('refund_reason')->nullable()->after('cancel_reason');
            $table->string('refund_requested_from_status')->nullable()->after('refund_reason');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['refund_reason', 'refund_requested_from_status']);
        });
    }
};
