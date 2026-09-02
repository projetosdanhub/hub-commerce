<?php

namespace App\Domain\Tenancy\Scopes;

use App\Domain\Tenancy\TenantContextStore;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

final class TenantScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $context = app(TenantContextStore::class)->current();

        if ($context === null) {
            if (app()->runningInConsole()) {
                return;
            }

            app(TenantContextStore::class)->require();
        }

        $builder->where($model->qualifyColumn('tenant_id'), $context->tenantId);
    }
}
