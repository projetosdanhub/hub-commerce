<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('carriers', function (Blueprint $table) {
            $table->text('status_reason')->nullable()->after('status');
            $table->string('vehicle_plate')->nullable();
            $table->string('vehicle_model')->nullable();
            $table->string('vehicle_type')->nullable();
            $table->string('document_rg_front')->nullable();
            $table->string('document_rg_back')->nullable();
            $table->string('document_cnh')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('carriers', function (Blueprint $table) {
            $table->dropColumn([
                'status_reason',
                'vehicle_plate',
                'vehicle_model',
                'vehicle_type',
                'document_rg_front',
                'document_rg_back',
                'document_cnh'
            ]);
        });
    }
};
