<?php

namespace App\Domain\Payments;

interface PaymentGateway
{
    public function key(): string;

    /**
     * O gateway recebe somente tokenização oficial e valor reconstituído no servidor.
     * A confirmação definitiva continua exclusiva do webhook assinado.
     */
    public function initiate(PaymentAuthorization $authorization): PaymentInitiation;
}
