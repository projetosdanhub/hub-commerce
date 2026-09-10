<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Evoluindo a tabela de Produtos
        Schema::table('produtos', function (Blueprint $table) {
            $table->string('sku_ref')->nullable()->after('slug');
            $table->string('sku_sufixo')->nullable()->after('sku_ref');
            $table->decimal('preco_promo', 10, 2)->nullable()->after('preco');
            $table->string('quick_view', 150)->nullable()->after('descricao');
            
            // Flags e Configurações
            $table->boolean('controlar_estoque')->default(true);
            $table->integer('alerta_estoque')->default(10);
            $table->boolean('pre_venda')->default(false);
            $table->integer('prep_tempo')->nullable();
            $table->string('prep_unidade')->default('Dias');
            $table->boolean('personalizado')->default(false);
            $table->string('custom_tipo')->nullable(); // IMAGEM, TEXTO, AMBOS
            $table->boolean('frete_gratis')->default(false);
            
            // Arrays JSON (O Segredo do NoSQL dentro do SQL)
            $table->json('badges')->nullable();
            $table->json('ficha_tecnica')->nullable();
            $table->json('categorias_secundarias')->nullable();
            $table->json('galeria')->nullable();
            
            // Mídia Principal
            $table->string('img')->nullable();
            $table->string('video')->nullable();
            
            // Logística & Fiscal
            $table->boolean('agrupavel')->default(true);
            $table->decimal('peso', 8, 3)->nullable();
            $table->decimal('altura', 8, 2)->nullable();
            $table->decimal('largura', 8, 2)->nullable();
            $table->decimal('comprimento', 8, 2)->nullable();
            $table->string('ncm')->nullable();
            $table->string('cest')->nullable();
            $table->string('origem')->default('0');
            $table->string('csosn')->nullable();
            $table->string('cfop_dentro')->nullable();
            $table->string('cfop_fora')->nullable();
            
            // Atualiza o status para usar String em vez de boolean (ATIVO, INATIVO, OCULTO)
            $table->string('status_vitrine')->default('ATIVO')->after('ativo');
        });

        // 2. Criando a tabela de Variações de SKU (Filhos)
        Schema::create('produto_variacoes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('produto_id')->constrained('produtos')->onDelete('cascade');
            $table->string('tipo'); // Ex: Cor, Tamanho, Voltagem
            $table->string('nome'); // Ex: Preto Onyx, GG, 220V
            $table->string('sku')->nullable();
            $table->integer('estoque')->default(0);
            $table->string('img')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('produto_variacoes');
        
        Schema::table('produtos', function (Blueprint $table) {
            $table->dropColumn([
                'sku_ref', 'sku_sufixo', 'preco_promo', 'quick_view', 'controlar_estoque', 
                'alerta_estoque', 'pre_venda', 'prep_tempo', 'prep_unidade', 'personalizado', 
                'custom_tipo', 'frete_gratis', 'badges', 'ficha_tecnica', 'categorias_secundarias', 
                'galeria', 'img', 'video', 'agrupavel', 'peso', 'altura', 'largura', 
                'comprimento', 'ncm', 'cest', 'origem', 'csosn', 'cfop_dentro', 'cfop_fora', 'status_vitrine'
            ]);
        });
    }
};