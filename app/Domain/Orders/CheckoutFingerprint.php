<?php

namespace App\Domain\Orders;

use InvalidArgumentException;

final class CheckoutFingerprint
{
    /**
     * @param  array<int, mixed>  $items
     */
    public function cart(array $items): string
    {
        $normalized = [];

        foreach ($items as $item) {
            $id = $item['id'] ?? null;
            $quantity = $item['quantity'] ?? null;

            if (is_int($id) === false || $id < 1 || is_int($quantity) === false || $quantity < 1) {
                throw new InvalidArgumentException('Item de checkout inválido.');
            }

            $normalized[$id] = ($normalized[$id] ?? 0) + $quantity;
        }

        ksort($normalized);

        return $this->hash($normalized);
    }

    /**
     * @param  array<string, mixed>  $address
     */
    public function destination(array $address): string
    {
        $required = ['cep', 'rua', 'numero', 'bairro', 'cidade', 'uf'];
        $normalized = [];

        foreach ($required as $field) {
            $value = trim((string) ($address[$field] ?? ''));

            if ($value === '') {
                throw new InvalidArgumentException('Endereço de entrega inválido.');
            }

            $normalized[$field] = mb_strtoupper($value);
        }

        $normalized['complemento'] = mb_strtoupper(trim((string) ($address['complemento'] ?? '')));

        return $this->hash($normalized);
    }

    /**
     * @param  array<array-key, mixed>  $payload
     */
    private function hash(array $payload): string
    {
        return hash('sha256', json_encode($payload, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE));
    }
}
