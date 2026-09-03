<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MelhorEnvioSetting;
use Illuminate\Support\Facades\Http;

class MelhorEnvioController extends Controller
{
    // Mude para 'true' apenas se for usar a Sandbox de testes do Melhor Envio no futuro.
    private $isSandbox = true; 

    private function getBaseUrl() {
        return $this->isSandbox ? 'https://sandbox.melhorenvio.com.br' : 'https://www.melhorenvio.com.br';
    }

    public function getSettings()
    {
        $config = MelhorEnvioSetting::firstOrCreate(['id' => 1]);
        
        // Se for o primeiro acesso, define os serviços padrão
        if (empty($config->carriers_ativas)) {
            $config->carriers_ativas = [
                ['id' => '1', 'nome' => 'Correios PAC', 'ativo' => false],
                ['id' => '2', 'nome' => 'Correios SEDEX', 'ativo' => false],
                ['id' => '3', 'nome' => 'Jadlog', 'ativo' => false],
                ['id' => '4', 'nome' => 'Loggi', 'ativo' => false],
                ['id' => '5', 'nome' => 'Azul Cargo', 'ativo' => false],
                ['id' => '6', 'nome' => 'LATAM Cargo', 'ativo' => false]
            ];
            $config->save();
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'is_authenticated' => !empty($config->access_token),
                'carriers_ativas'  => $config->carriers_ativas,
                'sender_info'      => $config->sender_info ?? []
            ]
        ]);
    }

    public function verifyToken(Request $request)
    {
        $request->validate(['access_token' => 'required|string']);
        $token = $request->access_token;

        $response = Http::withToken($token)
            ->withHeaders(['Accept' => 'application/json', 'User-Agent' => 'HUB Commerce (suporte@hubcommerce.com)'])
            ->get($this->getBaseUrl() . '/api/v2/me');

        if ($response->successful()) {
            $config = MelhorEnvioSetting::firstOrCreate(['id' => 1]);
            $config->access_token = $token;
            $config->save();
            return response()->json(['status' => 'success', 'message' => 'Sincronizado com sucesso!']);
        }

        return response()->json(['status' => 'error', 'code' => 'REQUEST_FAILED', 'message' => 'Token inválido ou expirado.'], 400);
    }

    public function saveCarriers(Request $request)
    {
        $request->validate(['carriers_ativas' => 'required|array']);
        $config = MelhorEnvioSetting::firstOrCreate(['id' => 1]);
        $config->carriers_ativas = $request->carriers_ativas;
        $config->save();
        
        return response()->json(['status' => 'success']);
    }

    public function saveSender(Request $request)
    {
        $config = MelhorEnvioSetting::firstOrCreate(['id' => 1]);
        $config->sender_info = $request->all();
        $config->save();
        return response()->json(['status' => 'success', 'message' => 'Remetente salvo!']);
    }

    public function disconnect()
    {
        $config = MelhorEnvioSetting::first();
        if ($config) {
            $config->access_token = null;
            $config->sender_info = null;
            $config->save();
        }
        return response()->json(['status' => 'success', 'message' => 'Desconectado.']);
    }

    // 🟢 MAGIA: Cotação Real de Frete via API
    public function calculate(Request $request)
    {
        $request->validate([
            'to_postal_code' => 'required|string',
            'height' => 'required|numeric',
            'width' => 'required|numeric',
            'length' => 'required|numeric',
            'weight' => 'required|numeric',
            'insurance_value' => 'required|numeric',
        ]);

        $config = MelhorEnvioSetting::first();
        if (!$config || !$config->access_token) {
            return response()->json(['status' => 'error', 'code' => 'REQUEST_FAILED', 'message' => 'Melhor Envio não conectado.'], 400);
        }

        $senderInfo = $config->sender_info;
        if (empty($senderInfo['cep'])) {
            return response()->json(['status' => 'error', 'code' => 'REQUEST_FAILED', 'message' => 'Endereço da Loja (Remetente) não configurado.'], 400);
        }

        $response = Http::withToken($config->access_token)
            ->withHeaders(['Accept' => 'application/json', 'User-Agent' => 'HUB Commerce (suporte@hubcommerce.com)'])
            ->post($this->getBaseUrl() . '/api/v2/me/shipment/calculate', [
                'from' => ['postal_code' => preg_replace('/\D/', '', $senderInfo['cep'])],
                'to' => ['postal_code' => preg_replace('/\D/', '', $request->to_postal_code)],
                'package' => [
                    'height' => (float) $request->height,
                    'width' => (float) $request->width,
                    'length' => (float) $request->length,
                    'weight' => (float) $request->weight,
                ],
                'options' => [
                    'insurance_value' => (float) $request->insurance_value,
                    'receipt' => false,
                    'own_hand' => false,
                ]
            ]);

        if ($response->successful()) {
            $rates = $response->json();
            
            // Filtra os retornos inválidos (ex: caixa fora do limite) e limpa os dados
            $validRates = collect($rates)->filter(function ($rate) {
                return !isset($rate['error']);
            })->map(function ($rate) {
                return [
                    'id' => (string) $rate['id'],
                    'price' => (float) $rate['price'],
                    'delivery_time' => (int) $rate['delivery_time'],
                ];
            })->values();

            return response()->json(['status' => 'success', 'data' => $validRates]);
        }

        return response()->json(['status' => 'error', 'code' => 'REQUEST_FAILED', 'message' => 'Nao foi possivel calcular o frete. Verifique os dados informados.'], 502);
    }
}