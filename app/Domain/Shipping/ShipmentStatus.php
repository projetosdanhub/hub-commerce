<?php

namespace App\Domain\Shipping;

enum ShipmentStatus: string
{
    case PREPARING = 'PREPARING';
    case PENDING = 'PENDING';
    case RELEASED = 'RELEASED';
    case GENERATED = 'GENERATED';
    case RECEIVED = 'RECEIVED';

    case POSTED = 'POSTED';
    case DELIVERED = 'DELIVERED';
    case CANCELLED = 'CANCELLED';
    case UNDELIVERED = 'UNDELIVERED';
    case PAUSED = 'PAUSED';
    case SUSPENDED = 'SUSPENDED';

    public function accepts(self $next): bool
    {
        if ($this === $next) {

            return true;
        }
        if (in_array($this, [self::DELIVERED, self::CANCELLED], true)) {

            return false;
        }
        if (in_array($next, [self::DELIVERED, self::CANCELLED], true)) {

            return true;
        }
        $rank = [self::PREPARING->value => 0, self::PENDING->value => 1, self::RELEASED->value => 2, self::GENERATED->value => 3];
        if (isset($rank[$next->value])) {

            return isset($rank[$this->value]) && $rank[$next->value] >= $rank[$this->value];
        }

        return true;
    }
}
