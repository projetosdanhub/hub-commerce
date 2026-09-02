<?php

namespace App\Domain\Tenancy;

use App\Models\Tenant;

final readonly class TenantContext
{
    public function __construct(
        public int $tenantId,
        public string $tenantUuid,
        public string $tenantSlug,
        public ?string $domain = null,
    ) {
    }

    public static function fromTenant(Tenant $tenant, ?string $domain = null): self
    {
        return new self(
            tenantId: (int) $tenant->getKey(),
            tenantUuid: (string) $tenant->uuid,
            tenantSlug: (string) $tenant->slug,
            domain: $domain,
        );
    }
}
