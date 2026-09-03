<?php

namespace Tests\Feature\Catalog;

use App\Domain\Identity\TenantOwnershipService;
use App\Domain\Tenancy\TenantContext;
use App\Domain\Tenancy\TenantContextStore;
use App\Models\Categoria;
use App\Models\Tenant;
use App\Models\TenantDomain;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CategoryAdminApiTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        app(TenantContextStore::class)->clear();

        parent::tearDown();
    }

    public function test_store_owner_updates_its_category_through_the_existing_put_contract_without_cross_tenant_access(): void
    {
        [$tenantA, $ownerA] = $this->tenantWithOwner('Loja A', 'loja-a', 'loja-a.test', 'owner-a@loja.test');
        [$tenantB] = $this->tenantWithOwner('Loja B', 'loja-b', 'loja-b.test', 'owner-b@loja.test');

        $this->setTenantContext($tenantA, 'loja-a.test');
        $categoryA = Categoria::query()->create([
            'nome' => 'Coleção antiga',
            'slug' => 'colecao-antiga',
            'descricao' => 'Descrição antiga.',
            'ativo' => true,
            'status' => Categoria::STATUS_ATIVO,
        ]);

        app(TenantContextStore::class)->clear();
        $this->setTenantContext($tenantB, 'loja-b.test');
        $categoryB = Categoria::query()->create([
            'nome' => 'Categoria restrita',
            'slug' => 'categoria-restrita',
            'descricao' => 'Pertence à Loja B.',
            'ativo' => true,
            'status' => Categoria::STATUS_ATIVO,
        ]);

        app(TenantContextStore::class)->clear();

        $this->actingAs($ownerA, 'sanctum')
            ->withServerVariables(['HTTP_HOST' => 'loja-a.test', 'SERVER_NAME' => 'loja-a.test'])
            ->putJson('http://loja-a.test/api/admin/categories/'.$categoryA->id, [
                'nome' => 'Coleção atualizada',
                'descricao' => 'Descrição atualizada.',
                'status' => 'ativo',
            ])
            ->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.id', $categoryA->id)
            ->assertJsonPath('data.slug', 'colecao-atualizada')
            ->assertJsonPath('data.status', Categoria::STATUS_ATIVO);

        $this->actingAs($ownerA, 'sanctum')
            ->withServerVariables(['HTTP_HOST' => 'loja-a.test', 'SERVER_NAME' => 'loja-a.test'])
            ->putJson('http://loja-a.test/api/admin/categories/'.$categoryB->id, [
                'nome' => 'Tentativa indevida',
                'status' => Categoria::STATUS_ATIVO,
            ])
            ->assertNotFound();

        app(TenantContextStore::class)->clear();
        $this->setTenantContext($tenantB, 'loja-b.test');
        $this->assertSame('Categoria restrita', $categoryB->fresh()->nome);
    }

    /**
     * @return array{0: Tenant, 1: User}
     */
    private function tenantWithOwner(string $name, string $slug, string $domain, string $email): array
    {
        $tenant = Tenant::query()->create([
            'name' => $name,
            'slug' => $slug,
            'status' => Tenant::STATUS_ACTIVE,
        ]);

        TenantDomain::query()->create([
            'tenant_id' => $tenant->getKey(),
            'domain' => $domain,
            'is_primary' => true,
            'verified_at' => now(),
        ]);

        $owner = User::query()->create([
            'name' => 'Proprietário da loja',
            'email' => $email,
            'email_verified_at' => now(),
            'password' => Hash::make('SenhaForte123!'),
            'role' => 'cliente',
            'status' => 'ATIVO',
        ]);

        app(TenantOwnershipService::class)->assignInitialOwner($tenant, $owner);

        return [$tenant, $owner];
    }

    private function setTenantContext(Tenant $tenant, string $domain): void
    {
        app(TenantContextStore::class)->set(TenantContext::fromTenant($tenant, $domain));
    }
}
