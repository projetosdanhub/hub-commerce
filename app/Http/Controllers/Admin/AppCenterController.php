<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Tenancy\TenantStorage;
use App\Http\Controllers\Controller;
use App\Models\GlobalSetting;
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
            'name' => 'Logística & Envios',
            'description' => 'Parceiros, Melhor Envio, remetente, embalagens, etiquetas e romaneios.',
            'location' => '/admin/transportadoras',
        ],
        'fiscal' => [
            'name' => 'Fiscal',
            'description' => 'Emitente, certificado A1, preflight e emissão fiscal quando houver adapter homologado.',
            'location' => null,
        ],
    ];

    public function __construct(
        private readonly TenantStorage $tenantStorage,
    ) {}

    public function index(): JsonResponse
    {
        $installed = TenantAppInstallation::query()
            ->get()
            ->keyBy('app_key');

        return response()->json(collect(self::APPS)->map(function (array $app, string $key) use ($installed): array {
            $installation = $installed->get($key);

            return [
                'key' => $key,
                ...$app,
                'installed' => $installation !== null,
                'status' => $installation?->status ?? 'AVAILABLE',
                'location' => $app['location'],
            ];
        })->values());
    }

    public function install(Request $request, string $app): JsonResponse
    {
        $this->knownApp($app);

        $installation = TenantAppInstallation::query()->firstOrCreate(
            ['app_key' => $app],
            ['status' => 'INSTALLED', 'installed_at' => now()],
        );

        return response()->json([
            'app_key' => $installation->app_key,
            'status' => $installation->status,
        ]);
    }

    public function fiscal(): JsonResponse
    {
        $config = $this->fiscalConfig();
        $certificatePath = $config['certificate_path'] ?? null;
        $certificateReady = is_string($certificatePath) && Storage::disk('local')->exists($certificatePath);

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

        TenantAppInstallation::query()->firstOrCreate(
            ['app_key' => 'fiscal'],
            ['status' => 'INSTALLED', 'installed_at' => now()],
        );

        return $this->fiscal();
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
