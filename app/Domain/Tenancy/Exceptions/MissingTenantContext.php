<?php

namespace App\Domain\Tenancy\Exceptions;

use LogicException;

final class MissingTenantContext extends LogicException
{
    public function __construct()
    {
        parent::__construct('Uma operação tenant-owned exige TenantContext resolvido.');
    }
}
