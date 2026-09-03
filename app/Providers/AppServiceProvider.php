<?php

namespace App\Providers;

use App\Domain\Identity\AuthorizationAuditLogger;
use App\Domain\Identity\AuthorizationService;
use App\Domain\Identity\IdentityAccessService;
use App\Domain\Identity\IdentityPasswordResetService;
use App\Domain\Identity\MfaService;
use App\Domain\Identity\PlatformInvitationService;
use App\Domain\Identity\PlatformRoleService;
use App\Domain\Identity\TenantInvitationService;
use App\Domain\Identity\TenantOwnershipService;
use App\Domain\Identity\TenantRoleService;
use App\Domain\Identity\TotpService;
use App\Domain\Identity\UserSessionService;
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
        $this->app->scoped(IdentityAccessService::class);
        $this->app->scoped(TenantOwnershipService::class);
        $this->app->scoped(TenantRoleService::class);
        $this->app->scoped(PlatformRoleService::class);
        $this->app->scoped(TenantInvitationService::class);
        $this->app->scoped(PlatformInvitationService::class);
        $this->app->scoped(TotpService::class);
        $this->app->scoped(MfaService::class);
        $this->app->scoped(UserSessionService::class);
        $this->app->scoped(IdentityPasswordResetService::class);
    }

    public function boot(): void
    {
        Gate::define('access-admin', [AdminAccessPolicy::class, 'access']);
        Gate::define('tenant-permission', fn ($user, int $tenantId, string $permission): bool => app(AuthorizationService::class)->allowsTenant($user, $tenantId, $permission));
        Gate::define('platform-permission', fn ($user, string $permission): bool => app(AuthorizationService::class)->allowsPlatform($user, $permission));
    }
}
