<?php

namespace Tests\Feature\Storefront;

use App\Models\Tenant;
use App\Models\TenantDomain;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PostalCodeLookupTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_returns_a_normalized_address_for_a_valid_postal_code(): void
    {
        $tenant = Tenant::query()->create([
            'name' => 'Loja de CEP',
            'slug' => 'loja-cep',
        ]);
        TenantDomain::query()->create([
            'tenant_id' => $tenant->id,
            'domain' => 'cep.test',
            'is_primary' => true,
            'verified_at' => now(),
        ]);
        Http::fake([
            'https://viacep.com.br/ws/01001000/json/' => Http::response([
                'cep' => '01001-000',
                'logradouro' => 'Praça da Sé',
                'bairro' => 'Sé',
                'localidade' => 'São Paulo',
                'uf' => 'SP',
            ]),
        ]);

        $this->withServerVariables([
            'HTTP_HOST' => 'cep.test',
            'SERVER_NAME' => 'cep.test',
        ])->getJson('http://cep.test/api/storefront/postal-codes/01001-000')
            ->assertOk()
            ->assertJsonPath('data.cep', '01001-000')
            ->assertJsonPath('data.rua', 'Praça da Sé')
            ->assertJsonPath('data.cidade', 'São Paulo')
            ->assertJsonPath('data.uf', 'SP');

        Http::assertSent(function (Request $request): bool {
            return $request->url() === 'https://viacep.com.br/ws/01001000/json/';
        });
    }
}
