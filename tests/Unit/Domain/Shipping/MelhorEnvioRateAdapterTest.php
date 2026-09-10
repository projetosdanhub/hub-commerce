<?php

namespace Tests\Unit\Domain\Shipping;

use App\Domain\Shipping\MelhorEnvioRateAdapter;
use App\Models\MelhorEnvioSetting;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class MelhorEnvioRateAdapterTest extends TestCase
{
    public function test_it_normalizes_only_valid_provider_rates(): void
    {
        Http::fake([
            'https://sandbox.melhorenvio.com.br/*' => Http::response([
                ['id' => 1, 'price' => '12.50', 'delivery_time' => 3],
                ['error' => 'fora dos limites'],
                ['id' => 2, 'price' => '25.00', 'delivery_time' => 1],
            ]),
        ]);

        $config = new MelhorEnvioSetting([
            'access_token' => 'token-teste',
            'environment' => 'SANDBOX',
            'carriers_ativas' => [['id' => '1', 'nome' => 'PAC', 'ativo' => true]],
            'sender_info' => ['cep' => '01001-000'],
        ]);

        $rates = (new MelhorEnvioRateAdapter)->calculate(
            $config,
            '20040-020',
            ['height' => 10, 'width' => 20, 'length' => 30, 'weight' => 1],
            '100.00',
            'token-teste',
        );

        $this->assertSame([
            ['id' => '1', 'price' => '12.50', 'delivery_time' => 3],
        ], $rates);

        Http::assertSent(function (Request $request): bool {
            return $request->hasHeader('Authorization', 'Bearer token-teste')
                && $request['from']['postal_code'] === '01001000'
                && $request['to']['postal_code'] === '20040020';
        });
    }
    public function test_timeout_returns_a_safe_domain_error(): void
    {
        Http::fake(['*' => Http::failedConnection()]);
        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage('O serviço de frete está temporariamente indisponível.');
        (new MelhorEnvioRateAdapter)->calculate(
            new MelhorEnvioSetting(['environment' => 'SANDBOX', 'sender_info' => ['cep' => '01001000']]),
            '20040020', ['height' => 10, 'width' => 10, 'length' => 10, 'weight' => 1], '10.00', 'fixture',
        );
    }

    public function test_invalid_dimensions_never_reach_the_provider(): void
    {
        Http::fake();
        try {
            (new MelhorEnvioRateAdapter)->calculate(
                new MelhorEnvioSetting(['environment' => 'SANDBOX', 'sender_info' => ['cep' => '01001000']]),
                '20040020', ['height' => 0, 'width' => 10, 'length' => 10, 'weight' => 1], '10.00', 'fixture',
            );
            $this->fail('Dimensão inválida foi aceita.');
        } catch (\DomainException) {
            Http::assertNothingSent();
        }
    }
}
