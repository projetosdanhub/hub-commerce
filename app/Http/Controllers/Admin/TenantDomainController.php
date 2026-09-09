<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Tenancy\TenantContextStore;
use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\TenantDomain;
use InvalidArgumentException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Validation\ValidationException;

class TenantDomainController extends Controller
{
    public function index(): JsonResponse
    {
        $tenant = $this->tenant();
        $platformDomain = $this->ensurePlatformDomain($tenant);

        return response()->json([
            'domains' => TenantDomain::query()
                ->where('tenant_id', $tenant->getKey())
                ->whereNull('disconnected_at')
                ->orderByDesc('is_primary')
                ->orderBy('domain')
                ->get()
                ->map(fn (TenantDomain $domain) => $this->present($domain)),
            'platform_domain' => $this->present($platformDomain),
            'instructions' => [
                'txt_host_prefix' => '_hub-verify',
                'cname_target' => config('tenancy.storefront_cname_target'),
                'webhook_base_url' => config('tenancy.webhook_base_url'),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate(['domain' => ['required', 'string', 'max:253']]);

        try {
            $domain = TenantDomain::normalizeHost($request->string('domain')->toString());
        } catch (InvalidArgumentException $exception) {
            throw ValidationException::withMessages(['domain' => $exception->getMessage()]);
        }

        $baseDomain = strtolower((string) config('tenancy.storefront_base_domain'));
        if ($domain === $baseDomain || Str::endsWith($domain, '.'.$baseDomain)) {
            throw ValidationException::withMessages(['domain' => 'Esse domínio é reservado pela plataforma.']);
        }

        $token = 'hub-commerce-verification='.Str::random(48);

        try {
            $tenantDomain = DB::transaction(function () use ($domain, $token): TenantDomain {
                return TenantDomain::query()->create([
                    'tenant_id' => $this->tenant()->getKey(),
                    'domain' => $domain,
                    'kind' => 'CUSTOM',
                    'status' => 'PENDING_DNS',
                    'is_primary' => false,
                    'verification_token_hash' => hash('sha256', $token),
                    'verification_token' => $token,
                    'verification_token_created_at' => now(),
                ]);
            });
        } catch (UniqueConstraintViolationException) {
            throw ValidationException::withMessages(['domain' => 'Este domínio já está em verificação ou conectado a outra loja.']);
        }

        return response()->json([
            'domain' => $this->present($tenantDomain),
            'verification' => $this->verificationInstructions($tenantDomain, $token),
        ], 201);
    }

    public function verify(TenantDomain $domain): JsonResponse
    {
        $this->ownedCustomDomain($domain);
        $domain->forceFill(['dns_checked_at' => now()])->save();

        $token = (string) $domain->verification_token;
        $txtVerified = $this->hasTxtRecord('_hub-verify.'.$domain->domain, $token);
        $routingVerified = $this->hasStorefrontRouting($domain->domain);

        if (! $txtVerified || ! $routingVerified) {
            $domain->forceFill(['status' => 'PENDING_DNS'])->save();

            return response()->json([
                'domain' => $this->present($domain),
                'verification' => $this->verificationInstructions($domain, $token),
                'checks' => ['ownership' => $txtVerified, 'routing' => $routingVerified],
                'message' => 'O DNS ainda não propagou ou um dos registros não corresponde à configuração.',
            ], 422);
        }

        DB::transaction(function () use ($domain): void {
            TenantDomain::query()->where('tenant_id', $domain->tenant_id)->update(['is_primary' => false]);
            $domain->forceFill([
                'status' => 'VERIFIED',
                'verified_at' => now(),
                'is_primary' => true,
            ])->save();
        });

        return response()->json([
            'domain' => $this->present($domain->fresh()),
            'message' => 'Domínio autenticado. A loja, checkout e pixels já podem usar este endereço.',
        ]);
    }

    public function destroy(TenantDomain $domain): JsonResponse
    {
        $this->ownedCustomDomain($domain);

        DB::transaction(function () use ($domain): void {
            $domain->forceFill([
                'is_primary' => false,
                'status' => 'DISCONNECTED',
                'disconnected_at' => now(),
                'verified_at' => null,
                'verification_token' => null,
                'verification_token_hash' => null,
            ])->save();

            $this->ensurePlatformDomain($this->tenant())->forceFill(['is_primary' => true])->save();
        });

        return response()->json(['message' => 'Domínio desautenticado. A loja voltou ao endereço protegido da plataforma.']);
    }

    private function tenant(): Tenant
    {
        return Tenant::query()->findOrFail(app(TenantContextStore::class)->require()->tenantId);
    }

    private function ensurePlatformDomain(Tenant $tenant): TenantDomain
    {
        return TenantDomain::query()->firstOrCreate(
            ['tenant_id' => $tenant->getKey(), 'kind' => 'PLATFORM'],
            [
                'domain' => 'store-'.substr(hash('sha256', $tenant->uuid), 0, 16).'.'.config('tenancy.storefront_base_domain'),
                'status' => 'VERIFIED',
                'is_primary' => !TenantDomain::query()->where('tenant_id', $tenant->getKey())->where('is_primary', true)->exists(),
                'verified_at' => now(),
            ],
        );
    }

    private function ownedCustomDomain(TenantDomain $domain): void
    {
        abort_unless(
            $domain->tenant_id === $this->tenant()->getKey() && $domain->kind === 'CUSTOM' && $domain->disconnected_at === null,
            404,
        );
    }

    private function hasTxtRecord(string $host, string $expected): bool
    {
        foreach (dns_get_record($host, DNS_TXT) ?: [] as $record) {
            if (hash_equals($expected, (string) ($record['txt'] ?? ''))) {
                return true;
            }
        }

        return false;
    }

    private function hasStorefrontRouting(string $domain): bool
    {
        $expectedCname = rtrim(strtolower((string) config('tenancy.storefront_cname_target')), '.');
        foreach (dns_get_record($domain, DNS_CNAME) ?: [] as $record) {
            if (rtrim(strtolower((string) ($record['target'] ?? '')), '.') === $expectedCname) {
                return true;
            }
        }

        $expectedIpv4 = config('tenancy.storefront_ipv4');
        if (! $expectedIpv4) {
            return false;
        }

        return collect(dns_get_record($domain, DNS_A) ?: [])
            ->contains(fn (array $record) => ($record['ip'] ?? null) === $expectedIpv4);
    }

    private function verificationInstructions(TenantDomain $domain, string $token): array
    {
        return [
            'txt' => ['host' => '_hub-verify.'.$domain->domain, 'value' => $token],
            'routing' => ['host' => $domain->domain, 'type' => 'CNAME', 'value' => config('tenancy.storefront_cname_target')],
        ];
    }

    private function present(TenantDomain $domain): array
    {
        return [
            'id' => $domain->getKey(),
            'domain' => $domain->domain,
            'kind' => $domain->kind,
            'status' => $domain->status,
            'is_primary' => $domain->is_primary,
            'verified_at' => optional($domain->verified_at)->toISOString(),
            'dns_checked_at' => optional($domain->dns_checked_at)->toISOString(),
        ];
    }
}
