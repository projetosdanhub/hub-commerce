<?php

namespace App\Domain\Shipping;

use App\Models\Produto;
use App\Models\ShippingPackage;
use DomainException;
use Illuminate\Support\Collection;

final class CheckoutPackageBuilder
{
    /**
     * @param Collection<int, array{product: Produto, quantity: int}> $items
     * @return array{height: string, width: string, length: string, weight: string}
     */
    public function build(Collection $items): array
    {
        $package = ShippingPackage::query()->where('is_default', true)->first();

        if ($package === null) {
            throw new DomainException('Configure uma embalagem padrão para calcular o frete.');
        }

        $weight = (float) $package->peso_vazio;

        foreach ($items as $item) {
            $productWeight = $item['product']->peso;

            if ($productWeight === null || (float) $productWeight <= 0) {
                throw new DomainException('Um ou mais produtos não possuem peso para cotação.');
            }

            $weight += (float) $productWeight * $item['quantity'];
        }

        return [
            'height' => (string) $package->altura,
            'width' => (string) $package->largura,
            'length' => (string) $package->comprimento,
            'weight' => number_format($weight, 3, '.', ''),
        ];
    }
}
