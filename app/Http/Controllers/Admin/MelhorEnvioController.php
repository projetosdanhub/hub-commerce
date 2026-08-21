<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MelhorEnvioSetting;
use Illuminate\Support\Facades\Http;

class MelhorEnvioController extends Controller
{
    private $isSandbox = false; // Mude para true se estiver usando ambiente de testes do Melhor Envio

    private function getBaseUrl() {
        return $this->isSandbox ? 'https://sandbox.melhorenvio.com.br' : 'https://www.melhorenvio.com.br';
    }

    public function getSettings()
    {
        $config = MelhorEnvioSetting::firstOrCreate(['id' => 1]);
        
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
                'carriers_ativas' => $config->carriers_ativas
            ]
        ]);
    }

    public function verifyToken(Request $request)
    {
        $request->validate(['access_token' => 'required|string']);
        $token = $request->access_token;

        // Ping de verificação nos servidores do Melhor Envio
        $response = Http::withToken($token)
            ->withHeaders([
                'Accept' => 'application/json', 
                'User-Agent' => 'HUB Commerce (suporte@hubcommerce.com)'
            ])
            ->get($this->getBaseUrl() . '/api/v2/me');

        if ($response->successful()) {
            $config = MelhorEnvioSetting::firstOrCreate(['id' => 1]);
            $config->access_token = $token;
            $config->save();

            return response()->json(['status' => 'success', 'message' => 'Sincronizado com sucesso!']);
        }

        return response()->json(['status' => 'error', 'message' => 'Token inválido ou expirado.'], 400);
    }

    public function saveCarriers(Request $request)
    {
        $request->validate(['carriers_ativas' => 'required|array']);
        $config = MelhorEnvioSetting::firstOrCreate(['id' => 1]);
        $config->carriers_ativas = $request->carriers_ativas;
        $config->save();
        
        return response()->json(['status' => 'success']);
    }

    public function disconnect()
    {
        $config = MelhorEnvioSetting::first();
        if ($config) {
            $config->access_token = null;
            $config->save();
        }
        return response()->json(['status' => 'success', 'message' => 'Desconectado com sucesso.']);
    }
}