<?php

namespace App\Enums;

enum ProductStatus: string
{
    case ACTIVE = 'ATIVO';
    case INACTIVE = 'INATIVO';
    case HIDDEN = 'OCULTO';

    public function isVisibleInStorefront(): bool
    {
        return $this === self::ACTIVE;
    }
}
