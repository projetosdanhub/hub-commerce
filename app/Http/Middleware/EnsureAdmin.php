<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! Gate::forUser($user)->allows('access-admin')) {
            return response()->json([
                'status' => 'error',
                'code' => 'REQUEST_FAILED',
                'message' => 'Acesso administrativo nao autorizado.',
            ], 403);
        }

        if ($user->currentAccessToken() && ! $user->tokenCan('admin')) {
            return response()->json([
                'status' => 'error',
                'code' => 'REQUEST_FAILED',
                'message' => 'Token sem permissao administrativa.',
            ], 403);
        }

        return $next($request);
    }
}
