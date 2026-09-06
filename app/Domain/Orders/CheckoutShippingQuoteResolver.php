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
    ): CheckoutShippingQuote {
        $quote = CheckoutShippingQuote::query()
            ->where('token', $token)
            ->where('cart_fingerprint', $cartFingerprint)
            ->where('destination_fingerprint', $destinationFingerprint)
            ->whereNull('invalidated_at')
            ->first();

        if ($quote === null || $quote->expires_at->lessThanOrEqualTo(CarbonImmutable::now())) {
            throw new DomainException('A cotação de frete não está mais disponível.');
        }

        return $quote;
    }
}
