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
        // 2. CRIAR CLIENTE COMPLETO
        // ==========================================
        $cliente = User::create([
            'name' => 'Ana Beatriz Costa',
            'email' => 'ana.beatriz@exemplo.com',
            'password' => Hash::make('senha123'),
            'role' => 'cliente',
            'cpf' => '123.456.789-00',
            'telefone' => '5511977778888',
            'nascimento' => '1995-08-20',
            'sexo' => 'Feminino',
            'origem' => 'Instagram Ads',
            'tags' => ['VIP Potencial', 'Black Friday', 'Recorrente'],
            'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            'coins' => 150,
            'cashback' => 25.50
        ]);

        // ==========================================
        // 3. CRIAR AGENDA DE ENDEREÇOS DO CLIENTE (Global)
        // ==========================================
        Address::create([
            'user_id' => $cliente->id,
            'titulo' => 'Meu Apartamento',
            'cep' => '01310-100',
            'rua' => 'Avenida Paulista',
            'num' => '1000',
            'complemento' => 'Apto 45',
            'referencia' => 'Em frente ao MASP',
            'bairro' => 'Bela Vista',
            'cidade' => 'São Paulo',
            'uf' => 'SP',
            'padrao' => true
        ]);

        // ==========================================
        // 4. CRIAR PEDIDO 1 (COMPLEXO - A_PAGAR)
        // ==========================================
        // Subtotal: 585.00 | Frete: 50.00 | Desconto: 100.00 | Total: 535.00
        $pedido1 = Order::create([
            'user_id' => $cliente->id,
            'subtotal' => 585.00,
            'frete' => 50.00,
            'desconto' => 100.00,
            'total' => 535.00,
            'status' => 'A_PAGAR', 
            'payment_gateway' => 'Mercado Pago',
            'payment_method' => 'Cartão de Crédito',
            'payment_installments' => 5,
            'installment_value' => 107.00, 
            'gateway_fee' => 0.00,
            'applied_coupons' => [
                ['nome' => 'BEMVINDA50', 'tipo' => 'Loja', 'valor' => 50.00],
                ['nome' => 'FRETEFREE', 'tipo' => 'Frete', 'valor' => 50.00]
            ],
            'created_at' => Carbon::now()->subHours(2) 
        ]);

        // PRODUTO 1: 2 Variações + 1 Imagem + 1 Texto (Qtd: 2)
        OrderItem::create([
            'order_id' => $pedido1->id,
            'sku' => 'CANECA-MAGICA',
            'variation_sku' => 'CANECA-MAGICA-BCA-FOSCA',
            'product_name' => 'Caneca Mágica Personalizada',
            'short_description' => 'Caneca de cerâmica que revela foto com calor.',
            'variation_name' => 'Cor: Branca | Acabamento: Fosco',
            'quantity' => 2,
            'price' => 175.00,
            'product_image' => 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=200&q=80',
            'customization' => [
                'Texto da Caneca' => 'Feliz dia das Mães! Te amo muito!', 
                'Foto Estampada' => 'https://images.unsplash.com/photo-1596813362035-3edcff0cfa43?auto=format&fit=crop&w=500&q=80' 
            ]
        ]);

        // PRODUTO 2: 2 Variações + 1 Imagem + 1 Texto (Qtd: 1)
        OrderItem::create([
            'order_id' => $pedido1->id,
            'sku' => 'CAM-ALG-01',
            'variation_sku' => 'CAM-ALG-PRETA-M',
            'product_name' => 'Camiseta Premium 100% Algodão',
            'short_description' => 'Camiseta com estampa frontal em DTG.',
            'variation_name' => 'Cor: Preta | Tamanho: M', 
            'quantity' => 1,
            'price' => 89.00,
            'product_image' => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80',
            'customization' => [
                'Nome nas Costas' => 'Ana Beatriz', 
                'Arte Frontal' => 'https://images.unsplash.com/photo-1618557161833-21b98a3b56f8?auto=format&fit=crop&w=500&q=80' 
            ]
        ]);

        // PRODUTO 3: 1 Variação + Apenas Texto (Qtd: 3)
        OrderItem::create([
            'order_id' => $pedido1->id,
            'sku' => 'CHAV-METAL',
            'variation_sku' => 'CHAV-METAL-PRATA',
            'product_name' => 'Chaveiro de Metal Gravado a Laser',
            'short_description' => 'Chaveiro durável com argola italiana.',
            'variation_name' => 'Acabamento: Prata',
            'quantity' => 3,
            'price' => 48.66, // 3x de ~16.22 = 146.00
            'product_image' => 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=200&q=80',
            'customization' => [
                'Iniciais Gravadas' => 'A.B.C'
            ]
        ]);

        // ENDEREÇO DO PEDIDO 1 (OrderAddress)
        OrderAddress::create([
            'order_id' => $pedido1->id,
            'rua' => 'Avenida Paulista',
            'num' => '1000',
            'complemento' => 'Apto 45',
            'referencia' => 'Em frente ao museu',
            'bairro' => 'Bela Vista',
            'cidade' => 'São Paulo',
            'uf' => 'SP',
            'cep' => '01310-100'
        ]);

        // TIMELINE DO PEDIDO 1
        OrderHistory::create([
            'order_id' => $pedido1->id,
            'event' => 'Pedido realizado com sucesso. Aguardando pagamento via Cartão de Crédito.',
            'created_at' => Carbon::now()->subHours(2)
        ]);


        // ==========================================
        // 5. CRIAR PEDIDO 2 (SIMPLES - A_PAGAR)
        // ==========================================
        $pedido2 = Order::create([
            'user_id' => $cliente->id,
            'subtotal' => 120.00,
            'frete' => 20.00,
            'desconto' => 0.00,
            'total' => 140.00,
            'status' => 'A_PAGAR', 
            'payment_gateway' => 'Pix',
            'payment_method' => 'Pix Copia e Cola',
            'payment_installments' => 1,
            'installment_value' => 140.00, 
            'gateway_fee' => 0.00,
            'applied_coupons' => null,
            'created_at' => Carbon::now()->subMinutes(30) 
        ]);

        OrderItem::create([
            'order_id' => $pedido2->id,
            'sku' => 'QUADRO-CV-A3',
            'variation_sku' => 'QUADRO-CV-A3-MOLD-PRETA',
            'product_name' => 'Quadro Canvas Fosco (Pronta Entrega)',
            'short_description' => 'Impressão em tela canvas com moldura canaleta.',
            'variation_name' => 'Moldura: Preta | Tamanho: A3',
            'quantity' => 1,
            'price' => 120.00,
            'product_image' => 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=200&q=80',
            'customization' => null
        ]);

        OrderAddress::create([
            'order_id' => $pedido2->id,
            'rua' => 'Avenida Paulista',
            'num' => '1000',
            'complemento' => 'Apto 45',
            'referencia' => 'Em frente ao museu',
            'bairro' => 'Bela Vista',
            'cidade' => 'São Paulo',
            'uf' => 'SP',
            'cep' => '01310-100'
        ]);

        OrderHistory::create([
            'order_id' => $pedido2->id,
            'event' => 'Pedido realizado via PIX. Aguardando confirmação do banco.',
            'created_at' => Carbon::now()->subMinutes(30)
        ]);
    }
}