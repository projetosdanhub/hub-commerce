<?php

namespace App\Domain\Tenancy;

use App\Domain\Tenancy\Exceptions\MissingTenantContext;
use App\Domain\Tenancy\Exceptions\TenantContextConflict;
use App\Models\Tenant;
use Closure;

final class TenantContextStore
{
    private ?TenantContext $context = null;

    public function current(): ?TenantContext
    {
        return $this->context;
    }

    public function require(): TenantContext
    {
        return $this->context ?? throw new MissingTenantContext();
    }

    public function set(TenantContext $context): void
    {
        if ($this->context !== null && $this->context->tenantId !== $context->tenantId) {
            throw new TenantContextConflict();
        }

        $this->context ??= $context;
    }

    public function setTenant(Tenant $tenant, ?string $domain = null): void
    {
        if (! $tenant->isActive()) {
            throw new \DomainException('O tenant não está ativo.');
        }

        $this->set(TenantContext::fromTenant($tenant, $domain));
    }

    /**
     * Uso interno de workers, seeders e testes. Requests não podem trocar tenant.
     */
    public function run(TenantContext $context, Closure $callback): mixed
    {
        $this->set($context);

        try {
            return $callback();
        } finally {
            $this->clear();
        }
    }

    public function clear(): void
    {
        $this->context = null;
    }
}
