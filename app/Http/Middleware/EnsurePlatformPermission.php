<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\Response;

final class EnsurePlatformPermission
{
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (! $user || ! Gate::forUser($user)->allows('platform-permission', [$permission])) {
            return response()->json([
                'status' => 'error',
                'code' => 'REQUEST_FAILED',
                'message' => 'Você não possui permissão para esta ação na plataforma.',
            ], 403);
        }

        if ($user->currentAccessToken() && ! $user->tokenCan('platform')) {
            return response()->json([
                'status' => 'error',
                'code' => 'REQUEST_FAILED',
                'message' => 'A sessão não possui escopo para o painel da plataforma.',
            ], 403);
        }

        return $next($request);
    }
}
