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
        $trustedProxies = array_values(array_filter(array_map(
            static fn (string $proxy): string => trim($proxy),
            explode(',', (string) config('app.trusted_proxies', '')),
        )));

        if ($trustedProxies !== []) {
            $middleware->trustProxies(at: $trustedProxies === ['*'] ? '*' : $trustedProxies);
        }

        $middleware->alias([
            'admin' => \App\Http\Middleware\EnsureAdmin::class,
            'tenant' => \App\Http\Middleware\ResolveTenantFromDomain::class,
            'tenant.permission' => \App\Http\Middleware\EnsureTenantPermission::class,
            'platform.permission' => \App\Http\Middleware\EnsurePlatformPermission::class,
            'identity' => \App\Http\Middleware\EnsureIdentityAccess::class,
        ]);

        $middleware->append(\App\Http\Middleware\SecurityHeaders::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (\Illuminate\Http\Request $request, \Throwable $exception): bool => $request->is('api/*')
                || $request->expectsJson(),
        );

        $exceptions->render(function (\Throwable $exception, \Illuminate\Http\Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return app(\App\Http\Api\ApiExceptionRenderer::class)
                ->render($exception, $request);
        });
    })->create();
