<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        // php artisan serve nem sempre honra TrustProxies para o scheme;
        // verificamos o header diretamente quando o proxy é confiável.
        $isSecure = $request->isSecure()
            || strtolower((string) $request->header('X-Forwarded-Proto')) === 'https';

        $scheme = $isSecure ? 'https' : 'http';
        $host   = $request->getHost();                       // já resolvido por TrustProxies
        $port   = $request->getPort();

        // Se for HTTPS mas o Laravel acha que a porta é 80 (comum em proxies sem X-Forwarded-Port), ignorar a porta 80.
        if ($isSecure && $port === 80) {
            $port = 443;
        }

        // Reconstrói a origem respeitando portas não-padrão.
        $defaultPort = $isSecure ? 443 : 80;
        $requestOrigin = $scheme . '://' . $host . ($port && $port !== $defaultPort ? ':' . $port : '');

        URL::forceRootUrl($requestOrigin);
        URL::forceScheme($isSecure ? 'https' : null);
        Vite::createAssetPathsUsing(
            static fn (string $path, ?bool $secure = null): string => rtrim($requestOrigin, '/').'/'.ltrim($path, '/'),
        );

        $response = $next($request);

        // HMR ativo → incluir origens de desenvolvimento no CSP.
        $hmrActive = file_exists(public_path('hot'));

        $devViteSources = $hmrActive
            ? ' http://127.0.0.1:5173 http://localhost:5173'
            : '';

        $scriptPolicy = app()->environment('local')
            ? "'self' 'unsafe-inline' 'unsafe-eval'{$devViteSources} https://connect.facebook.net https://www.googletagmanager.com https://analytics.tiktok.com https://s.pinimg.com"
            : "'self' 'unsafe-inline' https://connect.facebook.net https://www.googletagmanager.com https://analytics.tiktok.com https://s.pinimg.com";

        $stylePolicy = app()->environment('local')
            ? "'self' 'unsafe-inline'{$devViteSources}"
            : "'self' 'unsafe-inline'";

        $devConnectSources = $hmrActive
            ? ' ws://127.0.0.1:5173 ws://localhost:5173 http://127.0.0.1:5173 http://localhost:5173 http://localhost:8000 http://127.0.0.1:8000'
            : '';

        $connectPolicy = app()->environment('local')
            ? "'self'{$devConnectSources} https://graph.facebook.com https://www.google-analytics.com https://business-api.tiktok.com https://api.pinterest.com"
            : "'self' https://graph.facebook.com https://www.google-analytics.com https://business-api.tiktok.com https://api.pinterest.com";

        $frameAncestorsPolicy = app()->environment('local')
            ? "'self'" . ($hmrActive ? ' http://127.0.0.1:5173 http://localhost:5173' : '')
            : "'none'";

        $imgPolicy = app()->environment('local')
            ? "'self' data: https:{$devViteSources}"
            : "'self' data: https:";

        $response->headers->set('Content-Security-Policy', implode('; ', [
            "default-src 'self'",
            "script-src {$scriptPolicy}",
            "style-src {$stylePolicy}",
            "img-src {$imgPolicy}",
            "font-src 'self' data: https:",
            "connect-src {$connectPolicy}",
            "frame-ancestors {$frameAncestorsPolicy}",
            "base-uri 'self'",
            "form-action 'self'",
        ]));
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
        $response->headers->set('Cross-Origin-Opener-Policy', 'same-origin');

        if ($isSecure) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        return $response;
    }
}

