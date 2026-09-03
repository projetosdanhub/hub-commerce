<?php

namespace Tests\Unit\Database;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class SchemaChangeBoundaryTest extends TestCase
{
    public function test_obsolete_manual_schema_command_is_not_registered(): void
    {
        $this->assertArrayNotHasKey('check:product-columns', Artisan::all());
    }

    public function test_schema_mutations_only_exist_in_migrations(): void
    {
        $schemaMutation = '/(?:Schema::(?:create|table|drop|dropIfExists|rename)|\b(?:CREATE|ALTER|DROP)\s+TABLE\b)/i';
        $violations = [];

        foreach (File::files(base_path()) as $file) {
            if (preg_match($schemaMutation, $file->getContents()) === 1) {
                $violations[] = $file->getRelativePathname();
            }
        }

        foreach (File::allFiles(app_path()) as $file) {
            if ($file->getExtension() !== 'php') {
                continue;
            }

            if (preg_match($schemaMutation, $file->getContents()) === 1) {
                $violations[] = 'app/'.$file->getRelativePathname();
            }
        }

        $this->assertSame(
            [],
            $violations,
            'Alterações de schema devem existir somente em database/migrations: '.implode(', ', $violations),
        );
    }
}
