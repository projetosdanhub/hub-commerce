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
            ]),
        ]);

        $config = new MelhorEnvioSetting([
            'access_token' => 'token-teste',
            'environment' => 'SANDBOX',
            'sender_info' => ['cep' => '01001-000'],
        ]);

        $rates = (new MelhorEnvioRateAdapter())->calculate(
            $config,
            '20040-020',
            ['height' => 10, 'width' => 20, 'length' => 30, 'weight' => 1],
            '100.00',
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
}
