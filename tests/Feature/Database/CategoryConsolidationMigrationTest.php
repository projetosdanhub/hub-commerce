<?php

namespace Tests\Feature\Database;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class CategoryConsolidationMigrationTest extends TestCase
{
    private ?string $originalDefaultConnection = null;

    public function test_legacy_categories_are_consolidated_without_overwriting_canonical_records(): void
    {
        $connection = $this->useInMemoryDatabase();
        $schema = Schema::connection($connection);

        $schema->create('categorias', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->string('nome');
            $table->string('slug');
            $table->text('descricao')->nullable();
            $table->string('img')->nullable();
            $table->boolean('ativo')->default(true);
            $table->string('status')->default('ATIVO');
            $table->timestamps();
            $table->unique(['tenant_id', 'slug']);
        });

        $schema->create('categories', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->string('nome');
            $table->string('status')->default('ATIVA');
            $table->timestamps();
        });

        DB::connection($connection)->table('categorias')->insert([
            'tenant_id' => 1,
            'nome' => 'Roupas',
            'slug' => 'roupas',
            'descricao' => 'Registro canônico.',
            'ativo' => true,
            'status' => 'ATIVO',
        ]);

        DB::connection($connection)->table('categories')->insert([
            ['tenant_id' => 1, 'nome' => 'Roupas', 'status' => 'INATIVA'],
            ['tenant_id' => 1, 'nome' => 'Calçados', 'status' => 'ATIVA'],
            ['tenant_id' => 2, 'nome' => 'Calçados', 'status' => 'INATIVA'],
        ]);

        $migration = require database_path('migrations/2026_09_03_160000_consolidate_legacy_categories.php');
        $migration->up();

        $this->assertFalse($schema->hasTable('categories'));
        $this->assertSame(3, DB::connection($connection)->table('categorias')->count());
        $this->assertSame('Registro canônico.', DB::connection($connection)->table('categorias')->where('tenant_id', 1)->where('slug', 'roupas')->value('descricao'));
        $this->assertSame('ATIVO', DB::connection($connection)->table('categorias')->where('tenant_id', 1)->where('slug', 'calcados')->value('status'));
        $this->assertSame(1, (int) DB::connection($connection)->table('categorias')->where('tenant_id', 1)->where('slug', 'calcados')->value('ativo'));
        $this->assertSame('INATIVO', DB::connection($connection)->table('categorias')->where('tenant_id', 2)->where('slug', 'calcados')->value('status'));
        $this->assertSame(0, (int) DB::connection($connection)->table('categorias')->where('tenant_id', 2)->where('slug', 'calcados')->value('ativo'));
    }

    public function test_consolidation_does_not_offer_an_unsafe_automatic_rollback(): void
    {
        $this->useInMemoryDatabase();
        $migration = require database_path('migrations/2026_09_03_160000_consolidate_legacy_categories.php');

        $this->expectException(\LogicException::class);
        $migration->down();
    }

    private function useInMemoryDatabase(): string
    {
        $connection = 'category_consolidation';

        $this->originalDefaultConnection ??= config('database.default');

        config()->set('database.connections.'.$connection, [
            'driver' => 'sqlite',
            'database' => ':memory:',
            'prefix' => '',
            'foreign_key_constraints' => true,
        ]);
        config()->set('database.default', $connection);
        DB::purge($connection);
        DB::connection($connection)->getPdo();

        return $connection;
    }

    protected function tearDown(): void
    {
        if ($this->originalDefaultConnection !== null) {
            config()->set('database.default', $this->originalDefaultConnection);
            DB::purge('category_consolidation');
        }

        parent::tearDown();
    }
}
