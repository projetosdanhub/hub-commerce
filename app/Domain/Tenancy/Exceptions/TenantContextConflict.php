<?php

namespace App\Domain\Tenancy\Exceptions;

use LogicException;

final class TenantContextConflict extends LogicException
{
    public function __construct()
    {
        parent::__construct('Não é permitido trocar o tenant durante a mesma execução.');
    }
}
