<?php

namespace Tests\Feature\Identity;

use App\Domain\Identity\InvitationException;
use App\Domain\Identity\PlatformRoleService;
use App\Domain\Identity\ProtectedOwnerException;
use App\Domain\Identity\TenantInvitationService;
use App\Domain\Identity\TenantOwnershipService;
use App\Domain\Identity\TenantRoleProvisioningService;
use App\Domain\Identity\TenantRoleService;
use App\Models\PlatformMembership;
use App\Models\PlatformRole;
use App\Models\Tenant;
use App\Models\TenantMembership;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class IdentityAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_tenant_administrator_cannot_suspend_or_revoke_the_protected_owner(): void
    {
        $tenant = $this->tenant('Loja Principal');
        $owner = $this->user('owner@loja.test');
        $administrator = $this->user('admin@loja.test');

        $ownerMembership = app(TenantOwnershipService::class)->assignInitialOwner($tenant, $owner);
        $adminRole = app(TenantRoleProvisioningService::class)->provisionSystemRoles($tenant);
        $adminMembership = $this->membership($tenant, $administrator);
        $adminMembership->roles()->attach($adminRole);

        $this->expectException(ProtectedOwnerException::class);

        app(TenantRoleService::class)->setMembershipStatus(
            $administrator,
            $tenant,
            $ownerMembership,
            TenantMembership::STATUS_REVOKED,
        );
    }

    public function test_tenant_staff_cannot_mutate_a_membership_from_another_tenant(): void
    {
        $tenantA = $this->tenant('Loja A');
        $tenantB = $this->tenant('Loja B');
        $administrator = $this->user('admin@loja-a.test');
        $staffB = $this->user('staff@loja-b.test');

        $adminRole = app(TenantRoleProvisioningService::class)->provisionSystemRoles($tenantA);
        $membershipA = $this->membership($tenantA, $administrator);
        $membershipA->roles()->attach($adminRole);
        $membershipB = $this->membership($tenantB, $staffB);

        $this->expectException(ModelNotFoundException::class);

        app(TenantRoleService::class)->setMembershipStatus(
            $administrator,
            $tenantA,
            $membershipB,
            TenantMembership::STATUS_SUSPENDED,
        );
    }

    public function test_tenant_invitation_is_bound_to_email_and_can_only_be_accepted_once(): void
    {
        $tenant = $this->tenant('Loja Convites');
        $owner = $this->user('owner@convites.test');
        $wrongUser = $this->user('outro@convites.test');
        $invitedUser = $this->user('convidado@convites.test', verified: false);

        app(TenantOwnershipService::class)->assignInitialOwner($tenant, $owner);
        $role = app(TenantRoleProvisioningService::class)->provisionSystemRoles($tenant);
        $service = app(TenantInvitationService::class);
        $issued = $service->issue($owner, $tenant, $invitedUser->email, [$role->getKey()]);

        try {
            $service->accept($wrongUser, $issued->plainTextToken);
            $this->fail('O convite não pode ser aceito por outro e-mail.');
        } catch (AuthorizationException) {
            $this->assertTrue(true);
        }

        $membership = $service->accept($invitedUser, $issued->plainTextToken);

        $this->assertSame($tenant->getKey(), $membership->tenant_id);
        $this->assertTrue($invitedUser->fresh()->hasVerifiedEmail());

        $this->expectException(InvitationException::class);
        $service->accept($invitedUser, $issued->plainTextToken);
    }

    public function test_last_active_superadmin_cannot_be_suspended(): void
    {
        $superadmin = $this->user('superadmin@hub.test');
        $role = PlatformRole::query()->where('key', 'superadmin')->firstOrFail();
        $membership = PlatformMembership::query()->create([
            'user_id' => $superadmin->getKey(),
            'status' => PlatformMembership::STATUS_ACTIVE,
            'authorization_version' => 1,
            'joined_at' => now(),
        ]);
        $membership->roles()->attach($role);

        $this->expectException(\DomainException::class);

        app(PlatformRoleService::class)->setMembershipStatus(
            $superadmin,
            $membership,
            PlatformMembership::STATUS_SUSPENDED,
        );
    }

    public function test_only_platform_superadmin_can_transfer_store_ownership(): void
    {
        $tenant = $this->tenant('Loja Transferência');
        $owner = $this->user('owner@transferencia.test');
        $nextOwner = $this->user('novo-owner@transferencia.test');
        $superadmin = $this->user('super@transferencia.test');

        app(TenantOwnershipService::class)->assignInitialOwner($tenant, $owner);
        $nextMembership = $this->membership($tenant, $nextOwner);
        $platformMembership = PlatformMembership::query()->create([
            'user_id' => $superadmin->getKey(),
            'status' => PlatformMembership::STATUS_ACTIVE,
            'authorization_version' => 1,
            'joined_at' => now(),
        ]);
        $platformMembership->roles()->attach(PlatformRole::query()->where('key', 'superadmin')->firstOrFail());

        app(TenantOwnershipService::class)->transfer($superadmin, $tenant, $nextMembership);

        $this->assertTrue($nextMembership->fresh()->isOwner());
    }

    private function tenant(string $name): Tenant
    {
        return Tenant::query()->create([
            'name' => $name,
            'slug' => str($name)->slug()->toString(),
            'status' => Tenant::STATUS_ACTIVE,
        ]);
    }

    private function user(string $email, bool $verified = true): User
    {
        return User::query()->create([
            'name' => 'Conta de teste',
            'email' => $email,
            'email_verified_at' => $verified ? now() : null,
            'password' => Hash::make('SenhaForte123!'),
            'role' => 'cliente',
            'status' => 'ATIVO',
        ]);
    }

    private function membership(Tenant $tenant, User $user): TenantMembership
    {
        return TenantMembership::query()->create([
            'tenant_id' => $tenant->getKey(),
            'user_id' => $user->getKey(),
            'status' => TenantMembership::STATUS_ACTIVE,
            'authorization_version' => 1,
            'joined_at' => now(),
        ]);
    }
}
