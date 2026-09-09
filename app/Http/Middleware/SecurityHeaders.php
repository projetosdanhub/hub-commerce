<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        URL::forceRootUrl($request->getSchemeAndHttpHost());
        URL::forceScheme($request->isSecure() ? 'https' : null);

        $response = $next($request);

        $scriptPolicy = app()->environment('local')
            ? "'self' 'unsafe-inline' 'unsafe-eval' http://127.0.0.1:5173 http://localhost:5173 https://connect.facebook.net https://www.googletagmanager.com https://analytics.tiktok.com https://s.pinimg.com"
            : "'self' 'unsafe-inline' https://connect.facebook.net https://www.googletagmanager.com https://analytics.tiktok.com https://s.pinimg.com";

        $stylePolicy = app()->environment('local')
            ? "'self' 'unsafe-inline' http://127.0.0.1:5173 http://localhost:5173"
            : "'self' 'unsafe-inline'";

        $connectPolicy = app()->environment('local')
            ? "'self' ws://127.0.0.1:5173 ws://localhost:5173 http://127.0.0.1:5173 http://localhost:5173 http://localhost:8000 http://127.0.0.1:8000 https://graph.facebook.com https://www.google-analytics.com https://business-api.tiktok.com https://api.pinterest.com"
            : "'self' https://graph.facebook.com https://www.google-analytics.com https://business-api.tiktok.com https://api.pinterest.com";

        $frameAncestorsPolicy = app()->environment('local')
            ? "'self' http://127.0.0.1:5173 http://localhost:5173"
            : "'none'";

        $imgPolicy = app()->environment('local')
            ? "'self' data: https: http://127.0.0.1:5173 http://localhost:5173"
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

        if ($request->isSecure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        return $response;
    }
}
