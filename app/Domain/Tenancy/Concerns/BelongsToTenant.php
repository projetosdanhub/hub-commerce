<?php

namespace App\Domain\Tenancy\Concerns;

use App\Domain\Tenancy\Scopes\TenantScope;
use App\Domain\Tenancy\TenantContextStore;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToTenant
{
    public static function bootBelongsToTenant(): void
    {
        static::addGlobalScope(new TenantScope());

        static::saving(function (Model $model): void {
            $context = app(TenantContextStore::class)->require();
            $tenantId = $model->getAttribute('tenant_id');

            if ($tenantId !== null && (int) $tenantId !== $context->tenantId) {
                throw new \LogicException('Não é permitido persistir dados em outro tenant.');
            }

            $model->setAttribute('tenant_id', $context->tenantId);
        });
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function scopeForTenant(Builder $query, Tenant|int $tenant): Builder
    {
        $tenantId = $tenant instanceof Tenant ? $tenant->getKey() : $tenant;

        return $query->withoutGlobalScope(TenantScope::class)
            ->where($this->qualifyColumn('tenant_id'), $tenantId);
    }
}
