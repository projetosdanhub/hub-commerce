<?php

namespace App\Domain\Payments;

enum PaymentAttemptStatus: string
{
    case PENDING = 'PENDING';
    case PROCESSING = 'PROCESSING';
    case SUCCEEDED = 'SUCCEEDED';
    case FAILED = 'FAILED';
    case CANCELLED = 'CANCELLED';

    public function isTerminal(): bool
    {
        return match ($this) {
            self::SUCCEEDED, self::FAILED, self::CANCELLED => true,
            self::PENDING, self::PROCESSING => false,
        };
    }
}
