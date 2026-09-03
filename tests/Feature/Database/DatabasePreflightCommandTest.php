<?php

namespace Tests\Feature\Database;

use Illuminate\Console\Command;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class DatabasePreflightCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_preflight_accepts_the_current_migration_history(): void
    {
        $this->artisan('database:preflight', ['--json' => true])
            ->assertExitCode(Command::SUCCESS);
    }

    public function test_preflight_blocks_a_legacy_schema_without_migration_history(): void
    {
        $connection = 'legacy_schema_without_history';
        $originalDefault = config('database.default');

        config()->set('database.connections.'.$connection, [
            'driver' => 'sqlite',
            'database' => ':memory:',
            'prefix' => '',
            'foreign_key_constraints' => true,
        ]);
        config()->set('database.default', $connection);
        DB::purge($connection);

        try {
            Schema::connection($connection)->create('produtos', function (Blueprint $table): void {
                $table->id();
            });

            $this->artisan('database:preflight', ['--json' => true])
                ->assertExitCode(Command::FAILURE);
        } finally {
            config()->set('database.default', $originalDefault);
            DB::purge($connection);
        }
    }
}
