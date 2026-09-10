<?php

namespace App\Http\Middleware;

use App\Domain\Tenancy\TenantContextStore;
use App\Models\TenantDomain;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveTenantFromDomain
{
    public function handle(Request $request, Closure $next): Response
    {
        try {
            $domain = TenantDomain::normalizeHost((string) ($request->server('HTTP_HOST') ?: $request->getHost()));
        } catch (\InvalidArgumentException) {
            abort(404, 'Loja não encontrada.');
        }

        if (TenantDomain::isInternalDevelopmentHost($domain) && ! app()->environment(['local', 'testing'])) {
            abort(404, 'Loja não encontrada.');
        }

        $tenantDomain = TenantDomain::query()
            ->with('tenant')
            ->where('domain', $domain)
            ->whereNull('disconnected_at')
            ->whereNotNull('verified_at')
            ->first();

        if ($tenantDomain === null) {
            abort(404, 'Loja não encontrada.');
        }

        if (! $tenantDomain->tenant->isActive()) {
            return response()->json([
                'status' => 'error',
                'code' => 'REQUEST_FAILED',
                'message' => 'Esta loja está temporariamente indisponível.',
            ], 423);
        }

        app(TenantContextStore::class)->setTenant($tenantDomain->tenant, $tenantDomain->domain);

        return $next($request);
    }
}
