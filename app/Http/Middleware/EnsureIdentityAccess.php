<?php

namespace App\Http\Middleware;

use App\Domain\Identity\IdentityAccessService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class EnsureIdentityAccess
{
    public function __construct(private readonly IdentityAccessService $access)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $this->access->hasAdministrativeAccess($user)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Acesso administrativo não autorizado.',
            ], 403);
        }

        return $next($request);
    }
}
