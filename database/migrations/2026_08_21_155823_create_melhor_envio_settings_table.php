<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void {
    Schema::create('melhor_envio_settings', function (Blueprint $table) {
        $table->id();
        $table->string('client_id')->nullable();
        $table->string('client_secret')->nullable();
        $table->text('access_token')->nullable(); // OAuth2 Token longo
        $table->text('refresh_token')->nullable();
        $table->integer('expires_in')->nullable();
        $table->json('carriers_ativas')->nullable(); // Para guardar as toggles que fizemos no front
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('melhor_envio_settings');
    }
};
