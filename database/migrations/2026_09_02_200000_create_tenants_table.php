<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('status', 20)->default('ACTIVE')->index();
            $table->string('timezone', 64)->default('America/Sao_Paulo');
            $table->string('currency', 3)->default('BRL');
            $table->json('settings')->nullable();
            $table->timestamp('suspended_at')->nullable();
            $table->timestamps();
        });

        DB::table('tenants')->insert([
            'uuid' => (string) Str::uuid(),
            'name' => 'Loja inicial migrada',
            'slug' => 'loja-inicial',
            'status' => 'ACTIVE',
            'timezone' => 'America/Sao_Paulo',
            'currency' => 'BRL',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
