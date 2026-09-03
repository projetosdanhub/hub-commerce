<?php

namespace Tests\Feature\Catalog;

use App\Models\Categoria;
use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

use App\Domain\Tenancy\TenantContext;
use App\Domain\Tenancy\TenantContextStore;

class CategoryHierarchyTest extends TestCase
{
    use RefreshDatabase;

    public function test_category_can_have_parent_and_children(): void
    {
        $tenant = Tenant::factory()->create();
        app(TenantContextStore::class)->set(new TenantContext(
            $tenant->id,
            $tenant->uuid,
            $tenant->slug
        ));

        $parentCategory = Categoria::factory()->create([
            'tenant_id' => $tenant->id,
            'nome' => 'Eletrônicos',
            'slug' => 'eletronicos',
        ]);

        $childCategory1 = Categoria::factory()->create([
            'tenant_id' => $tenant->id,
            'nome' => 'Smartphones',
            'slug' => 'smartphones',
            'parent_id' => $parentCategory->id,
        ]);

        $childCategory2 = Categoria::factory()->create([
            'tenant_id' => $tenant->id,
            'nome' => 'Laptops',
            'slug' => 'laptops',
            'parent_id' => $parentCategory->id,
        ]);

        $this->assertEquals($parentCategory->id, $childCategory1->parent->id);
        $this->assertCount(2, $parentCategory->children);
        $this->assertTrue($parentCategory->children->contains($childCategory1));
        $this->assertTrue($parentCategory->children->contains($childCategory2));
    }
}
