<?php

namespace App\Domain\Orders;

use App\Models\CheckoutShippingQuote;
use Carbon\CarbonImmutable;
use DomainException;

final class CheckoutShippingQuoteResolver
{
    public function resolve(
        string $token,
        string $cartFingerprint,
        string $destinationFingerprint,
        bool $lockForUpdate = false,
    ): CheckoutShippingQuote {
        $query = CheckoutShippingQuote::query()
            ->where('token', $token)
            ->where('cart_fingerprint', $cartFingerprint)
            ->where('destination_fingerprint', $destinationFingerprint)
            ->whereNull('invalidated_at');

        if ($lockForUpdate) {
            $query->lockForUpdate();
        }

        $quote = $query->first();

        if ($quote === null) {
            throw new DomainException('A cotação de frete não está mais disponível.');
        }

        if ($quote->expires_at->lessThanOrEqualTo(CarbonImmutable::now())) {
            throw new DomainException('A cotação de frete não está mais disponível.');
        }

        return $quote;
    }
}
