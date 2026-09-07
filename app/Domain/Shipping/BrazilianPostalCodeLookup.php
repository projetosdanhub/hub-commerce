<?php

namespace App\Domain\Shipping;

use DomainException;
use Illuminate\Support\Facades\Http;

final class BrazilianPostalCodeLookup
{
    /**
     * @return array{cep: string, rua: string, bairro: string, cidade: string, uf: string}
     */
    public function lookup(string $postalCode): array
    {
        $normalizedPostalCode = preg_replace('/\D/', '', $postalCode);

        if ($normalizedPostalCode === null || strlen($normalizedPostalCode) !== 8) {
            throw new DomainException('Informe um CEP válido para buscar o endereço.');
        }

        $response = Http::acceptJson()
            ->timeout(5)
            ->retry(1, 100)
            ->get("https://viacep.com.br/ws/{$normalizedPostalCode}/json/");

        if (! $response->successful() || $response->json('erro') === true) {
            throw new DomainException('Não foi possível localizar esse CEP. Confira os números ou preencha o endereço.');
        }

        return [
            'cep' => substr($normalizedPostalCode, 0, 5).'-'.substr($normalizedPostalCode, 5),
            'rua' => trim((string) $response->json('logradouro', '')),
            'bairro' => trim((string) $response->json('bairro', '')),
            'cidade' => trim((string) $response->json('localidade', '')),
            'uf' => mb_strtoupper(trim((string) $response->json('uf', ''))),
        ];
    }
}
