<?php

namespace App\Domain\Payments;

use InvalidArgumentException;

final readonly class PaymentAuthorization
{
    public function __construct(
        public string $attemptReference,
        public int $amountCents,
        public string $currency,
        public string $paymentMethodToken,
        public string $environment,
    ) {
        if ($this->amountCents <= 0) {
            throw new InvalidArgumentException('Uma tentativa de pagamento deve ter valor positivo.');
        }

        if (preg_match('/^[A-Z]{3}$/', $this->currency) !== 1) {
            throw new InvalidArgumentException('A moeda da tentativa de pagamento é inválida.');
        }

        if (in_array($this->environment, [
            StripeGatewayConfiguration::SANDBOX,
            StripeGatewayConfiguration::PRODUCTION,
        ], true) === false) {
            throw new InvalidArgumentException('O ambiente da tentativa de pagamento é inválido.');
        }

        if (trim($this->attemptReference) === '' || trim($this->paymentMethodToken) === '') {
            throw new InvalidArgumentException('A referência e o token de pagamento são obrigatórios.');
        }
    }
}
