<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderItemCustomizationMedia;
use App\Models\Categoria;
use App\Models\Produto;
use App\Models\ProdutoVariacao;
use App\Models\OrderAddress;
use App\Models\OrderHistory;
use App\Models\Address;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use App\Models\Tenant;
use App\Models\TenantDomain;
use App\Domain\Tenancy\TenantContextStore;
use App\Domain\Tenancy\TenantContext;

class DatabaseSeeder extends Seeder
{
    // Todos os valores abaixo são sintéticos e destinados exclusivamente ao ambiente local/teste.
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            return;
        }
        $tenant = Tenant::query()->firstOrCreate(
            ['slug' => 'loja-inicial'],
            ['name' => 'Loja inicial migrada', 'timezone' => 'America/Sao_Paulo', 'currency' => 'BRL']
        );
        $domain = TenantDomain::query()->firstOrCreate(
            ['domain' => 'demo.hubcommerce.test'],
            ['tenant_id' => $tenant->getKey(), 'is_primary' => true, 'verified_at' => now()]
        );
        TenantDomain::query()->firstOrCreate(
            ['domain' => 'localhost'],
            ['tenant_id' => $tenant->getKey(), 'is_primary' => false, 'verified_at' => now()]
        );
        TenantDomain::query()->firstOrCreate(
            ['domain' => '127.0.0.1'],
            ['tenant_id' => $tenant->getKey(), 'is_primary' => false, 'verified_at' => now()]
        );
        app(TenantContextStore::class)->set(TenantContext::fromTenant($tenant, $domain->domain));
        // ==========================================
        // 1. CRIAR USUÁRIO ADMIN (GESTOR)
        // ==========================================
        $admin = User::create([
            'name' => 'Admin de Teste',
            'email' => 'admin@example.invalid',
            'password' => Hash::make('local-only-test-password'),
            'role' => 'admin',
        ]);

        $membership = \App\Models\TenantMembership::create([
            'tenant_id' => $tenant->getKey(),
            'user_id' => $admin->getKey(),
            'status' => \App\Models\TenantMembership::STATUS_ACTIVE,
            'joined_at' => now(),
        ]);

        \App\Models\TenantOwnership::create([
            'tenant_id' => $tenant->getKey(),
            'tenant_membership_id' => $membership->getKey(),
        ]);

        // ==========================================
        // 2. CRIAR CLIENTE COMPLETO (TESTE DE UI)
        // ==========================================
        $cliente = User::create([
            'name' => 'Cliente de Teste',
            'email' => 'cliente@example.invalid',
            'password' => Hash::make('local-only-test-password'),
            'role' => 'cliente',
            'cpf' => '000.000.000-00',
            'telefone' => '5500000000000',
            'nascimento' => '2000-01-01',
            'sexo' => 'Não Binário',
            'origem' => 'Busca Orgânica',
            'tags' => ['Tech Lover', 'VIP Diamante', 'Early Adopter', 'Reviewer'],
            'avatar' => 'https://example.invalid/avatar-test.svg',
            'coins' => 12500,
            'cashback' => 345.50
        ]);

        // ==========================================
        // 3. CRIAR AGENDA DE ENDEREÇOS DO CLIENTE
        // ==========================================
        Address::create([
            'user_id' => $cliente->id,
            'titulo' => 'Endereço de Teste',
            'cep' => '00000-000',
            'rua' => 'Rua de Teste',
            'num' => '1',
            'complemento' => 'Complemento de teste',
            'referencia' => 'Ponto de teste',
            'bairro' => 'Centro de Teste',
            'cidade' => 'Cidade de Teste',
            'uf' => 'SP',
            'padrao' => true
        ]);

        // =========================================================
        // 4. PEDIDO 1: O TESTE MÁXIMO (COMPLEXO - EM SEPARAÇÃO)
        // Possui: Variações, Personalização (Texto+Img), Cupons, VIP
        // =========================================================
        $pedido1 = Order::create([
            'user_id' => $cliente->id,
            'subtotal' => 950.00,
            'frete' => 65.00,
            'desconto' => 115.00, // 50 do cupom loja + 65 do frete grátis VIP
            'total' => 900.00,
            'status' => 'SEPARACAO', 
            'payment_gateway' => 'Stripe',
            'payment_method' => 'Cartão de Crédito',
            'payment_installments' => 10,
            'installment_value' => 90.00, 
            'gateway_fee' => 0.00,
            'applied_coupons' => [
                ['nome' => 'BEMVINDO50', 'tipo' => 'Loja', 'valor' => 50.00],
                ['nome' => 'VIP DIAMANTE', 'tipo' => 'Frete VIP', 'valor' => 65.00]
            ],
            'created_at' => Carbon::now()->subDays(1) 
        ]);

        // Item 1: Com Variação + Imagem e Texto Personalizado
        $moletomPersonalizado = OrderItem::create([
            'order_id' => $pedido1->id,
            'sku' => 'MOLETOM-DEV',
            'variation_sku' => 'MOLETOM-DEV-PRETO-GG',
            'product_name' => 'Moletom para Desenvolvedores',
            'short_description' => 'Moletom felpado com estampa personalizada nas costas.',
            'variation_name' => 'Cor: Preto | Tamanho: GG',
            'quantity' => 1,
            'price' => 350.00,
            'product_image' => 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=200&q=80',
            'customization' => [
                'Nome ou Nickname' => '<Cliente_Teste />', 
                'Logo da Empresa' => 'https://images.unsplash.com/photo-1618557161833-21b98a3b56f8?auto=format&fit=crop&w=500&q=80' 
            ]
        ]);

        $moletomMediaPath = 'tenants/'.$tenant->uuid.'/private/orders/'.$pedido1->id.'/customizations/moletom-logo-demo.png';
        Storage::disk('local')->put($moletomMediaPath, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADElEQVR42mP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC'));
        OrderItemCustomizationMedia::query()->create([
            'order_item_id' => $moletomPersonalizado->id,
            'original_name' => 'logo-personalizado-demo.png',
            'storage_path' => $moletomMediaPath,
            'mime_type' => 'image/png',
            'byte_size' => Storage::disk('local')->size($moletomMediaPath),
        ]);

        // Item 2: Sem Variação + Apenas Imagem Personalizada
        $quadroPersonalizado = OrderItem::create([
            'order_id' => $pedido1->id,
            'sku' => 'QUADRO-CANVAS',
            'variation_sku' => null,
            'product_name' => 'Quadro Decorativo Canvas Premium',
            'short_description' => 'Impressão em alta definição 60x90cm.',
            'variation_name' => null, 
            'quantity' => 2,
            'price' => 250.00, // 2x 250 = 500
            'product_image' => 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=200&q=80',
            'customization' => [
                'Arte Enviada' => 'https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?auto=format&fit=crop&w=500&q=80' 
            ]
        ]);

        $quadroMediaPath = 'tenants/'.$tenant->uuid.'/private/orders/'.$pedido1->id.'/customizations/quadro-arte-demo.png';
        Storage::disk('local')->put($quadroMediaPath, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADElEQVR42mP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC'));
        OrderItemCustomizationMedia::query()->create([
            'order_item_id' => $quadroPersonalizado->id,
            'original_name' => 'arte-personalizada-demo.png',
            'storage_path' => $quadroMediaPath,
            'mime_type' => 'image/png',
            'byte_size' => Storage::disk('local')->size($quadroMediaPath),
        ]);

        // Item 3: Com Variação + Apenas Texto Personalizado
        OrderItem::create([
            'order_id' => $pedido1->id,
            'sku' => 'GARRAFA-TERM',
            'variation_sku' => 'GARRAFA-TERM-AZUL',
            'product_name' => 'Garrafa Térmica Inox',
            'short_description' => 'Mantém gelado por 24h. Gravação a laser.',
            'variation_name' => 'Cor: Azul Metálico',
            'quantity' => 1,
            'price' => 100.00, 
            'product_image' => 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=200&q=80',
            'customization' => [
                'Iniciais' => 'G.A.I'
            ]
        ]);

        // Endereço Pedido 1
        OrderAddress::create([
            'order_id' => $pedido1->id,
            'rua' => 'Rua de Teste',
            'num' => '1',
            'complemento' => 'Complemento de teste',
            'referencia' => 'Ponto de teste',
            'bairro' => 'Centro de Teste',
            'cidade' => 'Cidade de Teste',
            'uf' => 'SP',
            'cep' => '00000-000'
        ]);

        // Timeline Pedido 1
        OrderHistory::create([
            'order_id' => $pedido1->id,
            'event' => 'Pedido recebido. Aguardando processamento da operadora de cartão.',
            'created_at' => Carbon::now()->subDays(1)->subHours(2)
        ]);
        OrderHistory::create([
            'order_id' => $pedido1->id,
            'event' => 'Pagamento aprovado via Stripe. Pedido enviado para produção e separação.',
            'created_at' => Carbon::now()->subDays(1)
        ]);


        // ==========================================
        // 5. PEDIDO 2: SIMPLES E ENTREGUE (SEM NADA EXTRA)
        // ==========================================
        $pedido2 = Order::create([
            'user_id' => $cliente->id,
            'subtotal' => 120.00,
            'frete' => 20.00,
            'desconto' => 0.00,
            'total' => 140.00,
            'status' => 'ENTREGUE', 
            'payment_gateway' => 'Mercado Pago',
            'payment_method' => 'Pix',
            'payment_installments' => 1,
            'installment_value' => 140.00, 
            'gateway_fee' => 0.00,
            'applied_coupons' => null,
            'tracking_code' => 'BR987654321PT',
            'created_at' => Carbon::now()->subDays(15) 
        ]);

        OrderItem::create([
            'order_id' => $pedido2->id,
            'sku' => 'MOUSE-PAD-RGB',
            'variation_sku' => null,
            'product_name' => 'Mousepad Gamer RGB Extended',
            'short_description' => 'Superfície speed com LEDs.',
            'variation_name' => null,
            'quantity' => 1,
            'price' => 120.00,
            'product_image' => 'https://images.unsplash.com/photo-1615663245857-ac1eeb5304ba?auto=format&fit=crop&w=200&q=80',
            'customization' => null
        ]);

        OrderAddress::create([
            'order_id' => $pedido2->id,
            'rua' => 'Rua de Teste',
            'num' => '1',
            'complemento' => 'Unidade de teste',
            'referencia' => 'Ponto de teste',
            'bairro' => 'Centro de Teste',
            'cidade' => 'Cidade de Teste',
            'uf' => 'SP',
            'cep' => '00000-000'
        ]);

        OrderHistory::create([
            'order_id' => $pedido2->id,
            'event' => 'Pedido entregue ao destinatário.',
            'created_at' => Carbon::now()->subDays(10)
        ]);


        // ==========================================
        // 6. PEDIDO 3: CANCELADO / REEMBOLSADO
        // ==========================================
        $pedido3 = Order::create([
            'user_id' => $cliente->id,
            'subtotal' => 450.00,
            'frete' => 0.00,
            'desconto' => 0.00,
            'total' => 450.00,
            'status' => 'CANCELADO', 
            'payment_gateway' => 'Pagar.me',
            'payment_method' => 'Boleto Bancário',
            'payment_installments' => 1,
            'installment_value' => 450.00, 
            'gateway_fee' => 0.00,
            'applied_coupons' => null,
            'cancel_reason' => 'Boleto não pago após o vencimento.',
            'created_at' => Carbon::now()->subDays(5) 
        ]);

        OrderItem::create([
            'order_id' => $pedido3->id,
            'sku' => 'TECLADO-MEC',
            'variation_sku' => 'TECLADO-MEC-RED',
            'product_name' => 'Teclado Mecânico Custom',
            'short_description' => 'Switches red lineares.',
            'variation_name' => 'Switch: Red',
            'quantity' => 1,
            'price' => 450.00,
            'product_image' => 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=200&q=80',
            'customization' => null
        ]);

        OrderAddress::create([
            'order_id' => $pedido3->id,
            'rua' => 'Rua de Teste',
            'num' => '1',
            'bairro' => 'Centro de Teste',
            'cidade' => 'Cidade de Teste',
            'uf' => 'SP',
            'cep' => '00000-000'
        ]);

        OrderHistory::create([
            'order_id' => $pedido3->id,
            'event' => 'Pedido cancelado pelo sistema. Motivo: Vencimento do Boleto Bancário.',
            'created_at' => Carbon::now()->subDays(2)
        ]);
        // Catálogo exclusivamente local/teste: todos os produtos recebem tenant_id pelo contexto.
        $categoria = Categoria::query()->firstOrCreate(
            ['slug' => 'demonstracao'],
            ['nome' => 'Demonstração', 'descricao' => 'Produtos locais para validar catálogo, variações e personalização.', 'ativo' => true, 'status' => Categoria::STATUS_ATIVO],
        );
        Produto::query()->firstOrCreate(
            ['slug' => 'camiseta-basica-demo'],
            ['categoria_id' => $categoria->id, 'nome' => 'Camiseta Básica', 'descricao' => 'Produto sem variação e sem personalização.', 'preco' => '79.90', 'quantidade_estoque' => 12, 'ativo' => true, 'status_vitrine' => 'ATIVO', 'sku_ref' => 'CAM-BASICA', 'sku_sufixo' => 'UN'],
        );
        $camisetaVariacoes = Produto::query()->firstOrCreate(
            ['slug' => 'camiseta-com-variacoes-demo'],
            ['categoria_id' => $categoria->id, 'nome' => 'Camiseta com Variações', 'descricao' => 'Produto com tamanho e cor.', 'preco' => '99.90', 'quantidade_estoque' => 18, 'ativo' => true, 'status_vitrine' => 'ATIVO', 'sku_ref' => 'CAM-VAR', 'sku_sufixo' => 'BASE'],
        );
        ProdutoVariacao::query()->firstOrCreate(['sku' => 'CAM-VAR-AZUL-M'], ['produto_id' => $camisetaVariacoes->id, 'tipo' => 'Cor/Tamanho', 'nome' => 'Azul · M', 'estoque' => 8]);
        ProdutoVariacao::query()->firstOrCreate(['sku' => 'CAM-VAR-PRETA-G'], ['produto_id' => $camisetaVariacoes->id, 'tipo' => 'Cor/Tamanho', 'nome' => 'Preta · G', 'estoque' => 10]);
        Produto::query()->firstOrCreate(
            ['slug' => 'quadro-personalizavel-demo'],
            ['categoria_id' => $categoria->id, 'nome' => 'Quadro Personalizável', 'descricao' => 'Produto personalizado sem variação.', 'preco' => '149.90', 'quantidade_estoque' => 6, 'ativo' => true, 'status_vitrine' => 'ATIVO', 'personalizado' => true, 'custom_tipo' => 'IMAGEM', 'sku_ref' => 'QUADRO-PERS', 'sku_sufixo' => 'UN'],
        );
        $moletomPersonalizavel = Produto::query()->firstOrCreate(
            ['slug' => 'moletom-personalizavel-demo'],
            ['categoria_id' => $categoria->id, 'nome' => 'Moletom Personalizável', 'descricao' => 'Produto com variação e personalização.', 'preco' => '189.90', 'preco_promo' => '169.90', 'quantidade_estoque' => 9, 'ativo' => true, 'status_vitrine' => 'ATIVO', 'personalizado' => true, 'custom_tipo' => 'AMBOS', 'frete_gratis' => true, 'sku_ref' => 'MOLETOM-PERS', 'sku_sufixo' => 'BASE'],
        );
        ProdutoVariacao::query()->firstOrCreate(['sku' => 'MOLETOM-PERS-PRETO-M'], ['produto_id' => $moletomPersonalizavel->id, 'tipo' => 'Cor/Tamanho', 'nome' => 'Preto · M', 'estoque' => 4]);
        ProdutoVariacao::query()->firstOrCreate(['sku' => 'MOLETOM-PERS-PRETO-G'], ['produto_id' => $moletomPersonalizavel->id, 'tipo' => 'Cor/Tamanho', 'nome' => 'Preto · G', 'estoque' => 5]);

    }
}