<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class ApiContractTest extends TestCase
{
    use RefreshDatabase;

    public function test_validation_errors_use_the_canonical_envelope(): void
    {
        $this->postJson('/api/admin/login', [])
            ->assertUnprocessable()
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('code', 'VALIDATION_FAILED')
            ->assertJsonPath('message', 'Os dados informados são inválidos.')
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_authentication_and_not_found_errors_use_stable_codes(): void
    {
        $this->getJson('/api/admin/products')
            ->assertUnauthorized()
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('code', 'UNAUTHENTICATED');

        $this->getJson('/api/route-that-does-not-exist')
            ->assertNotFound()
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('code', 'RESOURCE_NOT_FOUND');
    }

    public function test_explicit_api_errors_always_include_a_code(): void
    {
        $violations = [];

        foreach (File::allFiles(app_path('Http')) as $file) {
            $content = $file->getContents();
            $offset = 0;

            while (preg_match(
                "/['\"]status['\"]\s*=>\s*['\"]error['\"]/",
                $content,
                $match,
                PREG_OFFSET_CAPTURE,
                $offset,
            ) === 1) {
                $position = $match[0][1];
                $fragment = substr($content, $position, 300);

                if (preg_match("/['\"]code['\"]\s*=>/", $fragment) !== 1) {
                    $violations[] = 'app/Http/'.$file->getRelativePathname();
                }

                $offset = $position + strlen($match[0][0]);
            }
        }

        $this->assertSame(
            [],
            array_values(array_unique($violations)),
            'Toda resposta de erro explícita deve possuir um code estável.',
        );
    }
}
