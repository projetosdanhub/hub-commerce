<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $scriptPolicy = app()->environment('local')
            ? "'self' 'unsafe-inline' 'unsafe-eval' http://[::1]:5173 http://localhost:5173 https://connect.facebook.net https://www.googletagmanager.com https://analytics.tiktok.com https://s.pinimg.com"
            : "'self' 'unsafe-inline' https://connect.facebook.net https://www.googletagmanager.com https://analytics.tiktok.com https://s.pinimg.com";

        $stylePolicy = app()->environment('local')
            ? "'self' 'unsafe-inline' http://[::1]:5173 http://localhost:5173"
            : "'self' 'unsafe-inline'";

        $connectPolicy = app()->environment('local')
            ? "'self' ws://[::1]:5173 ws://localhost:5173 http://[::1]:5173 http://localhost:5173 https://graph.facebook.com https://www.google-analytics.com https://business-api.tiktok.com https://api.pinterest.com"
            : "'self' https://graph.facebook.com https://www.google-analytics.com https://business-api.tiktok.com https://api.pinterest.com";

        $response->headers->set('Content-Security-Policy', implode('; ', [
            "default-src 'self'",
            "script-src {$scriptPolicy}",
            "style-src {$stylePolicy}",
            "img-src 'self' data: https:",
            "font-src 'self' data: https:",
            "connect-src {$connectPolicy}",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ]));
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
        $response->headers->set('Cross-Origin-Opener-Policy', 'same-origin');

        if ($request->isSecure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        return $response;
    }
}
