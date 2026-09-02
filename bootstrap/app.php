<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'admin' => \App\Http\Middleware\EnsureAdmin::class,
            'tenant' => \App\Http\Middleware\ResolveTenantFromDomain::class,
        ]);

        $middleware->append(\App\Http\Middleware\SecurityHeaders::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Throwable $exception, \Illuminate\Http\Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }
            if (
                $exception instanceof \Illuminate\Validation\ValidationException
                || $exception instanceof \Illuminate\Auth\AuthenticationException
                || $exception instanceof \Illuminate\Auth\Access\AuthorizationException
                || $exception instanceof \Symfony\Component\HttpKernel\Exception\HttpExceptionInterface
            ) {
                return null;
            }
            \Illuminate\Support\Facades\Log::error('Erro nao tratado na API.', [
                'exception' => $exception::class,
                'request_id' => $request->header('X-Request-ID'),
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Ocorreu um erro interno.',
            ], 500);
        });
    })->create();
