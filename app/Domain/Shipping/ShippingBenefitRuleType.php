<?php

namespace App\Domain\Shipping;

final class ShippingBenefitRuleType
{
    public const FREE_FOR_ALL = 'FREE_FOR_ALL';
    public const FREE_FOR_PRODUCT = 'FREE_FOR_PRODUCT';
    public const FREE_ABOVE_SUBTOTAL = 'FREE_ABOVE_SUBTOTAL';
    public const PERCENTAGE = 'PERCENTAGE';
}
