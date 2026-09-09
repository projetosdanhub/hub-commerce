<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class TrustedProxyTest extends TestCase
{
    public function test_https_forwarded_by_a_trusted_proxy_is_treated_as_secure(): void
    {
        $this->withServerVariables([
            'HTTP_X_FORWARDED_FOR' => '127.0.0.1',
            'HTTP_X_FORWARDED_PROTO' => 'https',
        ])->get('/up')
            ->assertOk()
            ->assertHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    public function test_asset_urls_use_https_behind_a_trusted_proxy(): void
    {
        Route::get('/_tests/trusted-proxy-asset', static fn (): string => asset('build/assets/app.css'));

        $this->withServerVariables([
            'HTTP_HOST' => 'average-applied-subfloor.ngrok-free.dev',
            'HTTP_X_FORWARDED_FOR' => '127.0.0.1',
            'HTTP_X_FORWARDED_PROTO' => 'https',
        ])->get('/_tests/trusted-proxy-asset')
            ->assertOk()
            ->assertSee(
                'https://average-applied-subfloor.ngrok-free.dev/build/assets/app.css',
                false,
            );
    }
}
