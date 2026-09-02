<?php

namespace App\Services;

use App\Domain\Tenancy\TenantContextStore;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class CacheFallbackService
{
    public static function remember(string $key, $ttl, \Closure $callback): mixed
    {
        $tenantKey = self::tenantKey($key);

        try {
            return Cache::store('redis')->remember($tenantKey, $ttl, $callback);
        } catch (\Throwable $exception) {
            Log::warning('Redis indisponível; fallback tenant-aware ativado.', [
                'key' => $tenantKey,
                'exception' => $exception::class,
            ]);

            return Cache::store('file')->remember($tenantKey, $ttl, $callback);
        }
    }

    public static function forget(string $key): void
    {
        $tenantKey = self::tenantKey($key);

        try {
            Cache::store('redis')->forget($tenantKey);
        } catch (\Throwable) {
        }

        try {
            Cache::store('file')->forget($tenantKey);
        } catch (\Throwable) {
        }
    }

    public static function tenantKey(string $key): string
    {
        $context = app(TenantContextStore::class)->require();

        return 'tenant:' . $context->tenantUuid . ':' . ltrim($key, ':');
    }
}
