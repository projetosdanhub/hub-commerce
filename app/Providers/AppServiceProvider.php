<?php

namespace App\Providers;

use App\Domain\Tenancy\TenantContextStore;
use App\Policies\AdminAccessPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->scoped(TenantContextStore::class, fn (): TenantContextStore => new TenantContextStore());
    }

    public function boot(): void
    {
        Gate::define('access-admin', [AdminAccessPolicy::class, 'access']);
    }
}
