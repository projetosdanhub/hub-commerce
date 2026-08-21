<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderAddress;
use App\Models\OrderHistory;
use App\Models\Address;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ==========================================
        // 1. CRIAR USUÁRIO ADMIN (GESTOR)
        // ==========================================
        User::create([
            'name' => 'Gestor Admin',
            'email' => 'admin@hubcommerce.com',
            'password' => Hash::make('senha123'),
            'role' => 'admin',
        ]);

        // ==========================================
        // 2. CRIAR CLIENTE COMPLETO (TESTE DE UI)
        // ==========================================
        $cliente = User::create([
            'name' => 'Gemini Inteligência Artificial',
            'email' => 'gemini@hubcommerce.com',
            'password' => Hash::make('senha123'),
            'role' => 'cliente',
            'cpf' => '999.888.777-66',
            'telefone' => '5511999999999',
            'nascimento' => '1999-12-31',
            'sexo' => 'Não Binário',
            'origem' => 'Busca Orgânica',
            'tags' => ['Tech Lover', 'VIP Diamante', 'Early Adopter', 'Reviewer'],
            'avatar' => 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=200&q=80',
            'coins' => 12500,
            'cashback' => 345.50
        ]);

        // ==========================================
        // 3. CRIAR AGENDA DE ENDEREÇOS DO CLIENTE
        // ==========================================
        Address::create([
            'user_id' => $cliente->id,
            'titulo' => 'Meu Servidor Principal',
            'cep' => '01310-100',
            'rua' => 'Avenida Paulista',
            'num' => '1000',
            'complemento' => 'Data Center, Rack 42',
            'referencia' => 'Prédio espelhado ao lado do parque',
            'bairro' => 'Bela Vista',
            'cidade' => 'São Paulo',
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
        OrderItem::create([
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
                'Nome ou Nickname' => '<Gemini_AI />', 
                'Logo da Empresa' => 'https://images.unsplash.com/photo-1618557161833-21b98a3b56f8?auto=format&fit=crop&w=500&q=80' 
            ]
        ]);

        // Item 2: Sem Variação + Apenas Imagem Personalizada
        OrderItem::create([
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
            'rua' => 'Avenida Paulista',
            'num' => '1000',
            'complemento' => 'Data Center, Rack 42',
            'referencia' => 'Prédio espelhado ao lado do parque',
            'bairro' => 'Bela Vista',
            'cidade' => 'São Paulo',
            'uf' => 'SP',
            'cep' => '01310-100'
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
            'rua' => 'Avenida Paulista',
            'num' => '1000',
            'complemento' => 'Apto 45',
            'referencia' => 'Em frente ao MASP',
            'bairro' => 'Bela Vista',
            'cidade' => 'São Paulo',
            'uf' => 'SP',
            'cep' => '01310-100'
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
            'rua' => 'Avenida Paulista',
            'num' => '1000',
            'bairro' => 'Bela Vista',
            'cidade' => 'São Paulo',
            'uf' => 'SP',
            'cep' => '01310-100'
        ]);

        OrderHistory::create([
            'order_id' => $pedido3->id,
            'event' => 'Pedido cancelado pelo sistema. Motivo: Vencimento do Boleto Bancário.',
            'created_at' => Carbon::now()->subDays(2)
        ]);
    }
}