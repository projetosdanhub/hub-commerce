<?php

namespace App\Domain\Identity;

use DomainException;

final class ProtectedOwnerException extends DomainException
{
    public function __construct()
    {
        parent::__construct('O administrador proprietário da loja só pode ser alterado por uma ação de plataforma autorizada.');
    }
}
