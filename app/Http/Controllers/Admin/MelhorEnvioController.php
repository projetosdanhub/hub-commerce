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

    public function getSettings(MelhorEnvioRateAdapter $adapter)
    {
        $config = MelhorEnvioSetting::firstOrCreate([], ['environment' => 'SANDBOX']);
        
        $services = [];
        $servicesError = null;
        if ($config->oauthConnection() !== null) {
            try {
                $services = $adapter->services($config);
            } catch (\DomainException) {
                $servicesError = 'Não foi possível carregar os serviços. Tente atualizar novamente.';
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'is_authenticated' => $this->credentialFor($config) !== null,
                'carriers_ativas'  => $services,
                'services_error' => $servicesError,
                'sender_info'      => $config->sender_info ?? [],
                'environment'      => $config->environment,
            ]
        ]);
    }

    public function verifyToken(): never
    {
        abort(410, 'A conexão por token manual foi desativada. Use Conectar com Melhor Envio para autorizar a conta por OAuth.');
    }

    public function saveCarriers(Request $request, MelhorEnvioRateAdapter $adapter)
    {
        $validated = $request->validate([
            'carriers_ativas' => 'required|array|max:100',
            'carriers_ativas.*' => 'array:id,nome,ativo',
            'carriers_ativas.*.id' => 'required|integer|min:1|distinct',
            'carriers_ativas.*.nome' => 'required|string|max:120',
            'carriers_ativas.*.ativo' => 'required|boolean',
        ]);
        $config = MelhorEnvioSetting::firstOrCreate([], ['environment' => 'SANDBOX']);
        try {
            $catalog = collect($adapter->services($config))->keyBy('id');
        } catch (\DomainException) {
            return response()->json(['message' => 'Não foi possível validar os serviços de frete.'], 422);
        }
        foreach ($validated['carriers_ativas'] as $service) {
            abort_unless($catalog->has((string) $service['id']), 422, 'Serviço de frete indisponível.');
        }
        $config->carriers_ativas = collect($validated['carriers_ativas'])->map(fn ($service) => [
            'id' => (string) $service['id'],
            'nome' => $catalog->get((string) $service['id'])['nome'],
            'ativo' => (bool) $service['ativo'],
        ])->all();
        $config->save();
        
        return response()->json(['status' => 'success']);
    }

    public function saveSender(Request $request)
    {
        $config = MelhorEnvioSetting::firstOrCreate([], ['environment' => 'SANDBOX']);
        $config->sender_info = $request->validate([
            'nome' => 'required|string|max:120',
            'telefone' => ['required', 'string', 'regex:/^[0-9()+ \-]{10,20}$/'],
            'email' => 'required|email|max:254',
            'documento' => ['required', 'string', 'regex:/^[0-9.\/\-]{11,18}$/'],
            'cep' => ['required', 'string', 'regex:/^\d{5}-?\d{3}$/'],
            'rua' => 'required|string|max:255',
            'numero' => 'required|string|max:32',
            'complemento' => 'nullable|string|max:120',
            'bairro' => 'required|string|max:120',
            'cidade' => 'required|string|max:120',
            'uf' => ['required', 'string', 'regex:/^[A-Z]{2}$/'],
        ]);
        $config->save();
        return response()->json(['status' => 'success', 'message' => 'Remetente salvo!']);
    }

    public function saveEnvironment(Request $request)
    {
        $validated = $request->validate(['environment' => 'required|in:SANDBOX,PRODUCTION']);
        abort_if(app()->environment('production') && $validated['environment'] !== 'PRODUCTION', 422, 'Sandbox não está disponível nesta implantação.');
        $config = MelhorEnvioSetting::firstOrCreate([], ['environment' => 'SANDBOX']);
        if ($config->environment !== $validated['environment']) {
            $config->environment = $validated['environment'];
            $config->access_token = null;
            $config->save();
            \App\Models\CheckoutShippingQuote::query()->whereNull('invalidated_at')->update(['invalidated_at' => now()]);
        }

        return response()->json(['status' => 'success', 'environment' => $config->environment]);
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
        return $config->oauthConnection();
    }

    private function credentialFor(MelhorEnvioSetting $config): ?\App\Models\ProviderConnectionCredential
    {
        return $this->connectionFor($config)?->credential;
    }

}
