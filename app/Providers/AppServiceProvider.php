<?php

namespace App\Providers;

use App\Domain\Identity\AuthorizationAuditLogger;
use App\Domain\Identity\AuthorizationService;
use App\Domain\Tenancy\TenantContextStore;
use App\Policies\AdminAccessPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->scoped(TenantContextStore::class, fn (): TenantContextStore => new TenantContextStore());
        $this->app->scoped(AuthorizationService::class, fn (): AuthorizationService => new AuthorizationService());
        $this->app->scoped(AuthorizationAuditLogger::class, fn (): AuthorizationAuditLogger => new AuthorizationAuditLogger());
    }

    public function boot(): void
    {
        Gate::define('access-admin', [AdminAccessPolicy::class, 'access']);
    }
}
