<?php

namespace App\Enums;

enum OrderStatus: string
{
    case AWAITING_PAYMENT = 'A_PAGAR';
    case PICKING = 'SEPARACAO';
    case READY_TO_SHIP = 'SEPARADO';
    case SHIPPED = 'DESPACHADO';
    case DELIVERED = 'ENTREGUE';
    case CANCELLED = 'CANCELADO';
    case REFUND_REVIEW = 'EM_ANALISE_REEMBOLSO';
    case REFUNDED = 'REEMBOLSADO';

    /**
     * @return list<self>
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::AWAITING_PAYMENT => [self::PICKING, self::CANCELLED],
            self::PICKING => [self::READY_TO_SHIP, self::CANCELLED, self::REFUND_REVIEW],
            self::READY_TO_SHIP => [self::SHIPPED, self::CANCELLED, self::REFUND_REVIEW],
            self::SHIPPED => [self::READY_TO_SHIP, self::DELIVERED, self::REFUND_REVIEW],
            self::DELIVERED => [self::REFUND_REVIEW],
            self::REFUND_REVIEW => [self::REFUNDED],
            self::CANCELLED, self::REFUNDED => [],
        };
    }

    public function canTransitionTo(self $target): bool
    {
        return in_array($target, $this->allowedTransitions(), true);
    }

    public function countsTowardRevenue(): bool
    {
        return ! in_array($this, [self::CANCELLED, self::REFUNDED], true);
    }

    public function isPaid(): bool
    {
        return ! in_array($this, [self::AWAITING_PAYMENT, self::CANCELLED], true);
    }
}
