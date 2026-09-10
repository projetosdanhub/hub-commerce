<?php

namespace App\Domain\Tenancy;

use InvalidArgumentException;

final class TenantStorage
{
    public function path(string $relativePath): string
    {
        $relativePath = ltrim(str_replace('\\', '/', $relativePath), '/');

        if ($relativePath === '' || str_contains($relativePath, '../')) {
            throw new InvalidArgumentException('Caminho de arquivo de tenant inválido.');
        }

        return 'tenants/' . app(TenantContextStore::class)->require()->tenantUuid . '/' . $relativePath;
    }
}
