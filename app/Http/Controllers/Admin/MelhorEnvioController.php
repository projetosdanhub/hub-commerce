<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Shipping\MelhorEnvioRateAdapter;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MelhorEnvioSetting;
use Illuminate\Support\Facades\Http;

class MelhorEnvioController extends Controller
{
    private function baseUrl(MelhorEnvioSetting $config): string
    {
        return $config->environment === 'PRODUCTION'
            ? 'https://www.melhorenvio.com.br'
            : 'https://sandbox.melhorenvio.com.br';
    }

    public function getSettings()
    {
        $config = MelhorEnvioSetting::firstOrCreate([], ['environment' => 'SANDBOX']);
        
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
                'sender_info'      => $config->sender_info ?? [],
                'environment'      => $config->environment,
            ]
        ]);
    }

    public function verifyToken(Request $request)
    {
        $request->validate(['access_token' => 'required|string', 'environment' => 'required|in:SANDBOX,PRODUCTION']);
        $token = $request->access_token;

        $response = Http::withToken($token)
            ->withHeaders(['Accept' => 'application/json', 'User-Agent' => 'HUB Commerce (suporte@hubcommerce.com)'])
            ->get($this->baseUrl(new MelhorEnvioSetting(['environment' => $request->input('environment')])) . '/api/v2/me');

        if ($response->successful()) {
            $config = MelhorEnvioSetting::firstOrCreate([], ['environment' => 'SANDBOX']);
            $config->access_token = $token;
            $config->environment = $request->input('environment');
            $config->save();
            return response()->json(['status' => 'success', 'message' => 'Sincronizado com sucesso!']);
        }

        return response()->json(['status' => 'error', 'code' => 'REQUEST_FAILED', 'message' => 'Token inválido ou expirado.'], 400);
    }

    public function saveCarriers(Request $request)
    {
        $request->validate(['carriers_ativas' => 'required|array']);
        $config = MelhorEnvioSetting::firstOrCreate([], ['environment' => 'SANDBOX']);
        $config->carriers_ativas = $request->carriers_ativas;
        $config->save();
        
        return response()->json(['status' => 'success']);
    }

    public function saveSender(Request $request)
    {
        $config = MelhorEnvioSetting::firstOrCreate([], ['environment' => 'SANDBOX']);
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

    public function calculate(Request $request, MelhorEnvioRateAdapter $adapter)
    {
        $validated = $request->validate([
            'to_postal_code' => 'required|string',
            'height' => 'required|numeric|gt:0',
            'width' => 'required|numeric|gt:0',
            'length' => 'required|numeric|gt:0',
            'weight' => 'required|numeric|gt:0',
            'insurance_value' => 'required|numeric|min:0',
        ]);

        $config = MelhorEnvioSetting::first();

        if ($config === null) {
            return response()->json([
                'status' => 'error',
                'code' => 'REQUEST_FAILED',
                'message' => 'Melhor Envio não conectado.',
            ], 400);
        }

        try {
            $rates = $adapter->calculate(
                $config,
                $validated['to_postal_code'],
                [
                    'height' => $validated['height'],
                    'width' => $validated['width'],
                    'length' => $validated['length'],
                    'weight' => $validated['weight'],
                ],
                (string) $validated['insurance_value'],
            );
        } catch (\DomainException $exception) {
            return response()->json([
                'status' => 'error',
                'code' => 'REQUEST_FAILED',
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json(['status' => 'success', 'data' => $rates]);
    }

}