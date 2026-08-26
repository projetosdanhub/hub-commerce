<?php

namespace App\Services;

use App\Models\GlobalSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentGatewayService
{
    /**
     * Processa o pagamento de acordo com o gateway configurado e ativo.
     * 
     * @param \App\Models\Order $order Pedido criado no banco
     * @param array $paymentData Dados do pagamento (cartão, método, parcelas)
     * @param array $customerData Dados do cliente
     * @param array $addressData Endereço de cobrança/entrega
     * @return array Resposta padronizada do processamento
     */
    public function processPayment($order, $paymentData, $customerData, $addressData)
    {
        // 1. Obter o Gateway Ativo
        $activeGatewaySetting = GlobalSetting::where('group', 'payment')->where('key', 'active_gateway')->first();
        $activeGateway = $activeGatewaySetting ? $activeGatewaySetting->value : 'mercadopago'; // Default fallback

        // 2. Obter as Credenciais do Gateway
        $credentialsSetting = GlobalSetting::where('group', 'payment')->where('key', $activeGateway)->first();
        $credentials = $credentialsSetting ? $credentialsSetting->value : [];

        if (empty($credentials) || empty($credentials['access_token'])) {
            Log::error("Pagamento Falhou: Gateway [{$activeGateway}] não configurado corretamente.");
            return [
                'status' => 'error',
                'message' => 'O gateway de pagamento não está devidamente configurado.',
                'gateway_response' => null
            ];
        }

        $accessToken = $credentials['access_token'];

        // 3. Roteamento para o Gateway Específico
        switch ($activeGateway) {
            case 'mercadopago':
                return $this->processMercadoPago($order, $paymentData, $customerData, $addressData, $accessToken);
            
            case 'pagarme':
                return $this->processPagarme($order, $paymentData, $customerData, $addressData, $accessToken);
                
            case 'stripe':
                return $this->processStripe($order, $paymentData, $customerData, $addressData, $accessToken);
                
            case 'infinity':
                return $this->processInfinityPay($order, $paymentData, $customerData, $addressData, $accessToken);
                
            default:
                return [
                    'status' => 'error',
                    'message' => 'Gateway de pagamento não suportado.',
                    'gateway_response' => null
                ];
        }
    }

    /**
     * Integração Fictícia Mercado Pago (Para fins de demonstração/implementação)
     */
    private function processMercadoPago($order, $paymentData, $customerData, $addressData, $accessToken)
    {
        Log::info("Processando pagamento Mercado Pago para o Pedido #{$order->id}");
        
        // Simulação de chamada de API ao Mercado Pago
        // $response = Http::withToken($accessToken)->post('https://api.mercadopago.com/v1/payments', [ ... ]);
        
        // Simulando sucesso imediato (Score 100)
        return [
            'status' => 'approved',
            'message' => 'Pagamento aprovado com sucesso.',
            'transaction_id' => 'MP-' . rand(10000000, 99999999),
            'gateway' => 'mercadopago'
        ];
    }

    /**
     * Integração Fictícia Pagar.me
     */
    private function processPagarme($order, $paymentData, $customerData, $addressData, $accessToken)
    {
        Log::info("Processando pagamento Pagar.me para o Pedido #{$order->id}");
        
        return [
            'status' => 'approved',
            'message' => 'Pagamento aprovado com sucesso.',
            'transaction_id' => 'PG-' . rand(10000000, 99999999),
            'gateway' => 'pagarme'
        ];
    }

    /**
     * Integração Fictícia Stripe
     */
    private function processStripe($order, $paymentData, $customerData, $addressData, $accessToken)
    {
        Log::info("Processando pagamento Stripe para o Pedido #{$order->id}");
        
        return [
            'status' => 'approved',
            'message' => 'Pagamento aprovado com sucesso.',
            'transaction_id' => 'ST-' . rand(10000000, 99999999),
            'gateway' => 'stripe'
        ];
    }

    /**
     * Integração Fictícia Infinity Pay
     */
    private function processInfinityPay($order, $paymentData, $customerData, $addressData, $accessToken)
    {
        Log::info("Processando pagamento Infinity Pay para o Pedido #{$order->id}");
        
        return [
            'status' => 'approved',
            'message' => 'Pagamento aprovado com sucesso.',
            'transaction_id' => 'INF-' . rand(10000000, 99999999),
            'gateway' => 'infinity'
        ];
    }
}
