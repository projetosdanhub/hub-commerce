<?php

namespace Tests\Feature\Database;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class ExistingDatabaseMigrationTest extends TestCase
{
    private ?string $originalDefaultConnection = null;

    public function test_fiscal_correction_preserves_existing_gtin_and_rolls_back_its_own_column(): void
    {
        $connection = $this->useInMemoryDatabase();
        $schema = Schema::connection($connection);

        $schema->create('produtos', function (Blueprint $table): void {
            $table->id();
            $table->string('gtin', 14)->nullable();
        });

        DB::connection($connection)->table('produtos')->insert(['gtin' => '7891234567890']);

        $migration = require database_path('migrations/2026_08_24_175459_add_missing_fiscal_fields_to_produtos_table.php');
        $migration->up();

        $this->assertTrue($schema->hasColumn('produtos', 'gtin'));
        $this->assertTrue($schema->hasColumn('produtos', 'unidade_medida'));
        $this->assertSame('7891234567890', DB::connection($connection)->table('produtos')->value('gtin'));

        $migration->down();

        $this->assertTrue($schema->hasColumn('produtos', 'gtin'));
        $this->assertFalse($schema->hasColumn('produtos', 'unidade_medida'));
        $this->assertSame('7891234567890', DB::connection($connection)->table('produtos')->value('gtin'));
    }

    public function test_fiscal_correction_does_not_change_an_existing_unit_column(): void
    {
        $connection = $this->useInMemoryDatabase();
        $schema = Schema::connection($connection);

        $schema->create('produtos', function (Blueprint $table): void {
            $table->id();
            $table->string('gtin', 14)->nullable();
            $table->string('unidade_medida', 10)->default('CX');
        });

        $migration = require database_path('migrations/2026_08_24_175459_add_missing_fiscal_fields_to_produtos_table.php');
        $migration->up();

        $this->assertTrue($schema->hasColumn('produtos', 'unidade_medida'));
    }

    private function useInMemoryDatabase(): string
    {
        $connection = 'migration_contract';

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
            DB::purge('migration_contract');
        }

        parent::tearDown();
    }
}
