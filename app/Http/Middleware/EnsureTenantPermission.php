<?php

namespace App\Http\Middleware;

use App\Domain\Tenancy\TenantContextStore;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\Response;

final class EnsureTenantPermission
{
    public function __construct(private readonly TenantContextStore $tenantContext)
    {
    }

    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();
        $context = $this->tenantContext->require();

        if (! $user || ! Gate::forUser($user)->allows('tenant-permission', [$context->tenantId, $permission])) {
            return response()->json([
                'status' => 'error',
                'code' => 'REQUEST_FAILED',
                'message' => 'Você não possui permissão para esta ação na loja atual.',
            ], 403);
        }

        if ($user->currentAccessToken() && ! $user->tokenCan('tenant')) {
            return response()->json([
                'status' => 'error',
                'code' => 'REQUEST_FAILED',
                'message' => 'A sessão não possui escopo para o painel da loja.',
            ], 403);
        }

        return $next($request);
    }
}
