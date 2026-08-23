<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Destinos e Integrações (Cofre de Tokens e Configurações Globais)
        Schema::create('tracking_destinations', function (Blueprint $table) {
            $table->id();
            $table->string('provider')->unique(); // Ex: 'global', 'meta', 'tiktok'
            $table->string('name'); // Ex: 'Cofre Principal'
            $table->json('credentials')->nullable(); // Guarda os IDs e Tokens CAPI
            $table->json('settings')->nullable(); // Guarda os Switches de Eventos Nativos
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Motor de Regras e Acionadores (Mini-GTM / Rules Engine)
        Schema::create('tracking_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nome interno da regra
            $table->string('target_event')->nullable(); // Evento do catálogo que será disparado
            $table->json('conditions')->nullable(); // Gatilho (Click, Scroll) e URL Alvo
            $table->json('transformations')->nullable(); // Payload Enriquecido / CAPI Builder
            $table->integer('priority')->default(0); // Para rodar uma regra antes da outra
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 3. Observabilidade e Funil (Event Stream / Data Warehouse)
        Schema::create('tracking_logs', function (Blueprint $table) {
            $table->id();
            $table->string('session_id')->nullable()->index(); // Para rastreio de jornada
            $table->string('anonymous_id')->nullable()->index(); // Usuário não logado
            $table->unsignedBigInteger('user_id')->nullable()->index(); // ID do Cliente (se logado)
            
            $table->string('event_name')->index(); // Ex: PageView, Purchase
            $table->string('url')->nullable(); // URL onde ocorreu o disparo
            $table->string('ip_address')->nullable(); // Necessário para a nota EMQ do Facebook
            $table->text('user_agent')->nullable(); // Dispositivo e Navegador
            
            $table->json('payload')->nullable(); // O pacote completo que a loja enviou (compras, leads, etc)
            
            $table->timestamps(); // created_at servirá como a data/hora do evento no Funil
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tracking_logs');
        Schema::dropIfExists('tracking_rules');
        Schema::dropIfExists('tracking_destinations');
    }
};