<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Exception;

class CacheFallbackService
{
    /**
     * Tenta usar Redis, se falhar ou não estiver disponível, usa o File cache automaticamente.
     */
    public static function remember(string $key, $ttl, \Closure $callback)
    {
        try {
            // Tenta usar Redis (primeira opção)
            return Cache::store('redis')->remember($key, $ttl, $callback);
        } catch (\Throwable $e) {
            // Se Redis falhar (ex: porta bloqueada ou não instalado na hospedagem)
            // Logamos silenciosamente apenas para debug e caímos pro FILE.
            Log::warning("Redis Indisponível (Key: {$key}). Fallback para File Cache ativado. Erro: " . $e->getMessage());
            
            return Cache::store('file')->remember($key, $ttl, $callback);
        }
    }

    public static function forget(string $key)
    {
        try {
            Cache::store('redis')->forget($key);
        } catch (\Throwable $e) {
            // Se falhou no redis, não fazemos nada lá
        }
        
        try {
            Cache::store('file')->forget($key);
        } catch (\Throwable $e) {
            // Se falhou no file, não fazemos nada lá
        }
    }
}
