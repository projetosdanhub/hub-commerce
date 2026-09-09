<?php

namespace App\Http\Controllers\Admin;

use App\Domain\ProviderConnections\ProviderRegistry;
use App\Domain\Shipping\MelhorEnvioRateAdapter;
use App\Domain\Tenancy\TenantContextStore;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MelhorEnvioSetting;
use App\Models\ProviderInstallation;
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
                'is_authenticated' => $this->credentialFor($config) !== null,
                'carriers_ativas'  => $config->carriers_ativas,
                'sender_info'      => $config->sender_info ?? [],
                'environment'      => $config->environment,
            ]
        ]);
    }

    public function verifyToken(): never
    {
        abort(410, 'A conexão por token manual foi desativada. Use Conectar com Melhor Envio para autorizar a conta por OAuth.');
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
        $installation = $this->installationForEnvironment(
            MelhorEnvioSetting::query()->first()?->environment ?? ProviderRegistry::SANDBOX,
        );

        if ($installation !== null) {
            $installation->credential()->delete();
            $installation->forceFill([
                'status' => 'REVOKED',
                'revoked_at' => now(),
                'secret_ref' => null,
            ])->save();
        }

        return response()->json(['status' => 'success', 'message' => 'Conexão OAuth revogada.']);
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
        $installation = $config instanceof MelhorEnvioSetting ? $this->connectionFor($config) : null;
        $credential = $installation?->credential;

        if ($config === null || $credential === null || $installation === null) {
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
                $credential->access_token,
                $installation->environment,
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
    private function installationForEnvironment(string $environment): ?ProviderInstallation
    {
        return ProviderInstallation::query()
            ->where('tenant_id', app(TenantContextStore::class)->require()->tenantId)
            ->where('provider', 'melhor_envio')
            ->where('environment', $environment)
            ->where('status', 'CONNECTED')
            ->whereNull('revoked_at')
            ->first();
    }

    private function connectionFor(MelhorEnvioSetting $config): ?ProviderInstallation
    {
        return $this->installationForEnvironment($config->environment)
            ?? ProviderInstallation::query()
                ->where('tenant_id', app(TenantContextStore::class)->require()->tenantId)
                ->where('provider', 'melhor_envio')
                ->where('status', 'CONNECTED')
                ->whereNull('revoked_at')
                ->latest('connected_at')
                ->first();
    }

    private function credentialFor(MelhorEnvioSetting $config): ?\App\Models\ProviderConnectionCredential
    {
        return $this->connectionFor($config)?->credential;
    }

}
