<?php

namespace App\Domain\Shipping;

enum ShipmentOperation: string
{
    case CREATE = 'CREATE';
    case PURCHASE = 'PURCHASE';
    case GENERATE = 'GENERATE';
    case CANCEL = 'CANCEL';
}
