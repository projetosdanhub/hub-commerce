<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('installment_value', 10, 2)->nullable()->after('payment_installments');
            $table->decimal('gateway_fee', 10, 2)->default(0)->after('installment_value');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['installment_value', 'gateway_fee']);
        });
    }
};