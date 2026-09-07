<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Payments\StripeGatewayConfiguration;
use App\Domain\Tenancy\TenantStorage;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveStripeSettingsRequest;
use App\Models\GlobalSetting;
use App\Models\MelhorEnvioSetting;
use App\Models\Produto;
use App\Models\TenantAppInstallation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AppCenterController extends Controller
{
    private const APPS = [
        'logistics' => [
            'name' => 'Melhor Envio',
            'description' => 'Cotação, etiquetas, remetente e transportadoras da loja.',
            'category' => 'LOGISTICS',
            'category_label' => 'Logística',
            'auth_strategy' => 'OAUTH2',
            'location' => null,
        ],
        'stripe' => [
            'name' => 'Stripe',
            'description' => 'Cartão tokenizado por loja, com Sandbox e Produção separados.',
            'category' => 'GATEWAYS',
            'category_label' => 'Gateways',
            'auth_strategy' => 'API_KEYS',
            'location' => null,
        ],
        'mercado_pago' => [
            'name' => 'Mercado Pago',
            'description' => 'Gateway reservado para adapter, tokenização e webhook homologados.',
            'category' => 'GATEWAYS',
            'category_label' => 'Gateways',
            'auth_strategy' => 'OAUTH2',
            'location' => null,
        ],
        'pagarme' => [
            'name' => 'Pagar.me',
            'description' => 'Gateway reservado para adapter, tokenização e webhook homologados.',
            'category' => 'GATEWAYS',
            'category_label' => 'Gateways',
            'auth_strategy' => 'API_KEYS',
            'location' => null,
        ],
        'pagbank' => [
            'name' => 'PagBank',
            'description' => 'Gateway reservado para adapter, tokenização e webhook homologados.',
            'category' => 'GATEWAYS',
            'category_label' => 'Gateways',
            'auth_strategy' => 'OAUTH2',
            'location' => null,
        ],
        'fiscal' => [
            'name' => 'Fiscal',
            'description' => 'Emitente, certificado A1 e pré-validação antes de um adapter homologado.',
            'category' => 'FISCAL',
            'category_label' => 'Fiscal',
            'auth_strategy' => 'MANUAL_SECRET',
            'location' => null,
        ],
    ];

    public function __construct(
        private readonly TenantStorage $tenantStorage,
        private readonly StripeGatewayConfiguration $stripe,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $category = $request->query('category');
        $installed = TenantAppInstallation::query()->get()->keyBy('app_key');
        $logistics = MelhorEnvioSetting::query()->first();
        $fiscal = $this->fiscalConfig();
        $stripe = $this->stripe->safeStatus();

        $apps = collect(self::APPS)
            ->map(function (array $app, string $key) use ($installed, $logistics, $fiscal, $stripe): array {
                $installation = $installed->get($key);
                $isInstalled = $installation?->status === 'INSTALLED';

                return [
                    'key' => $key,
                    ...$app,
                    'installed' => $isInstalled,
                    'status' => $installation?->status ?? 'AVAILABLE',
                    'configuration' => $this->appConfiguration($key, $logistics, $fiscal, $stripe),
                ];
            });

        if (is_string($category) && $category !== 'ALL') {
            $apps = $apps->where('category', $category);
        }

        return response()->json($apps->values());
    }

    public function install(Request $request, string $app): JsonResponse
    {
        $this->knownApp($app);

        $installation = TenantAppInstallation::query()->firstOrNew(['app_key' => $app]);
        $installation->status = 'INSTALLED';
        $installation->installed_at = now();
        $installation->save();

        return response()->json([
            'app_key' => $installation->app_key,
            'status' => $installation->status,
        ]);
    }

    public function uninstall(string $app): JsonResponse
    {
        $this->knownApp($app);

        $installation = TenantAppInstallation::query()->where('app_key', $app)->first();

        if ($installation !== null) {
            $installation->update(['status' => 'UNINSTALLED']);
        }

        return response()->json([
            'app_key' => $app,
            'status' => 'UNINSTALLED',
        ]);
    }

    public function logistics(): JsonResponse
    {
        $config = MelhorEnvioSetting::query()->first();

        return response()->json([
            'provider' => 'melhor_envio',
            'environment' => $config?->environment,
            'credential_configured' => filled($config?->access_token),
            'sender_configured' => filled($config?->sender_info['cep'] ?? null),
            'auth_strategy' => 'OAUTH2',
            'oauth_ready' => false,
        ]);
    }

    public function saveLogistics(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'environment' => ['required', Rule::in(['SANDBOX', 'PRODUCTION'])],
            'access_token' => ['nullable', 'string', 'max:2000'],
        ]);

        $config = MelhorEnvioSetting::query()->firstOrCreate([], ['environment' => 'SANDBOX']);
        $previousEnvironment = $config->environment;
        $config->environment = $validated['environment'];

        if (filled($validated['access_token'] ?? null)) {
            $config->access_token = $validated['access_token'];
        } elseif ($config->environment !== $previousEnvironment) {
            $config->access_token = null;
        }

        $config->save();

        $this->markInstalled('logistics');

        return $this->logistics();
    }

    public function stripe(): JsonResponse
    {
        return response()->json($this->stripe->safeStatus());
    }

    public function saveStripe(SaveStripeSettingsRequest $request): JsonResponse
    {
        $this->stripe->save($request->validated());
        $this->markInstalled('stripe');

        return $this->stripe();
    }

    public function fiscal(): JsonResponse
    {
        $config = $this->fiscalConfig();
        $certificatePath = $config['certificate_path'] ?? null;
        $certificateReady = is_string($certificatePath) && Storage::disk('local')->exists($certificatePath);
        $catalog = $this->catalogFiscalPreflight();

        return response()->json([
            'issuer' => [
                'legal_name' => $config['legal_name'] ?? '',
                'cnpj' => $config['cnpj'] ?? '',
                'state_registration' => $config['state_registration'] ?? '',
                'environment' => $config['environment'] ?? 'HOMOLOGATION',
                'provider' => $config['provider'] ?? '',
            ],
            'certificate' => [
                'configured' => $certificateReady,
                'name' => $config['certificate_name'] ?? null,
            ],
            'preflight' => [
                'issuer' => filled($config['legal_name'] ?? null)
                    && filled($config['cnpj'] ?? null)
                    && filled($config['state_registration'] ?? null),
                'certificate' => $certificateReady,
                'provider' => filled($config['provider'] ?? null)
                    && filled($config['api_token'] ?? null),
                'catalog' => $catalog,
                'adapter_homologated' => false,
                'can_emit' => false,
            ],
        ]);
    }

    public function saveFiscal(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'legal_name' => ['required', 'string', 'max:255'],
            'cnpj' => ['required', 'string', 'max:30'],
            'state_registration' => ['required', 'string', 'max:40'],
            'environment' => ['required', Rule::in(['HOMOLOGATION', 'PRODUCTION'])],
            'provider' => ['nullable', 'string', 'max:80'],
            'api_token' => ['nullable', 'string', 'max:2000'],
            'certificate_password' => ['nullable', 'string', 'max:255'],
            'certificate' => ['nullable', 'file', 'mimes:pfx,p12', 'max:10240'],
        ]);

        $config = $this->fiscalConfig();
        $incoming = collect($validated)->except('certificate')->all();

        foreach (['api_token', 'certificate_password'] as $secret) {
            if (blank($incoming[$secret] ?? null) && array_key_exists($secret, $config)) {
                $incoming[$secret] = $config[$secret];
            }
        }

        $config = array_merge($config, $incoming);

        if ($request->hasFile('certificate')) {
            $certificate = $request->file('certificate');
            $path = $this->tenantStorage->path(
                'private/fiscal/certificates/'.Str::uuid().'.'.strtolower($certificate->getClientOriginalExtension()),
            );

            Storage::disk('local')->putFileAs(dirname($path), $certificate, basename($path));
            $config['certificate_path'] = $path;
            $config['certificate_name'] = $certificate->getClientOriginalName();
        }

        $setting = GlobalSetting::query()->firstOrNew([
            'group' => 'fiscal',
            'key' => 'configuration',
        ]);
        $setting->setSecureValue($config)->save();

        $this->markInstalled('fiscal');

        return $this->fiscal();
    }

    /**
     * @return array{ready: bool, active_products: int, incomplete_products: int}
     */
    private function catalogFiscalPreflight(): array
    {
        $products = Produto::query()->where('ativo', true);
        $activeProducts = (clone $products)->count();

        $incompleteProducts = (clone $products)
            ->where(function ($query): void {
                $query
                    ->whereNull('ncm')
                    ->orWhere('ncm', '')
                    ->orWhereNull('origem')
                    ->orWhere('origem', '')
                    ->orWhere(function ($cfopQuery): void {
                        $cfopQuery
                            ->where(function ($field): void {
                                $field->whereNull('cfop')->orWhere('cfop', '');
                            })
                            ->where(function ($field): void {
                                $field->whereNull('cfop_dentro')->orWhere('cfop_dentro', '');
                            })
                            ->where(function ($field): void {
                                $field->whereNull('cfop_fora')->orWhere('cfop_fora', '');
                            });
                    });
            })
            ->count();

        return [
            'ready' => $activeProducts > 0 && $incompleteProducts === 0,
            'active_products' => $activeProducts,
            'incomplete_products' => $incompleteProducts,
        ];
    }

    /**
     * @param  array<string, mixed>  $fiscal
     * @param  array<string, mixed>  $stripe
     * @return array{environment: string|null, credential_configured: bool}
     */
    private function appConfiguration(string $app, ?MelhorEnvioSetting $logistics, array $fiscal, array $stripe): array
    {
        return match ($app) {
            'logistics' => [
                'environment' => $logistics?->environment,
                'credential_configured' => filled($logistics?->access_token),
            ],
            'fiscal' => [
                'environment' => isset($fiscal['environment']) && is_string($fiscal['environment'])
                    ? $fiscal['environment']
                    : null,
                'credential_configured' => filled($fiscal['api_token'] ?? null),
            ],
            'stripe' => [
                'environment' => isset($stripe['active_environment']) && is_string($stripe['active_environment'])
                    ? $stripe['active_environment']
                    : null,
                'credential_configured' => isset(
                    $stripe['active_environment'],
                    $stripe['environments'][$stripe['active_environment']]['secret_key_configured'],
                ) && $stripe['environments'][$stripe['active_environment']]['secret_key_configured'] === true,
            ],
            default => [
                'environment' => null,
                'credential_configured' => false,
            ],
        };
    }

    private function markInstalled(string $app): void
    {
        $installation = TenantAppInstallation::query()->firstOrNew(['app_key' => $app]);
        $installation->status = 'INSTALLED';
        $installation->installed_at ??= now();
        $installation->save();
    }

    private function fiscalConfig(): array
    {
        $value = GlobalSetting::query()
            ->where('group', 'fiscal')
            ->where('key', 'configuration')
            ->first()?->secureValue();

        return is_array($value) ? $value : [];
    }

    private function knownApp(string $app): void
    {
        if (array_key_exists($app, self::APPS) === false) {
            throw ValidationException::withMessages([
                'app' => 'Aplicativo não disponível.',
            ]);
        }
    }
}
