<?php

namespace App\Services;

use App\Models\Order;

class PaymentGatewayService
{
    private const FORBIDDEN_CARD_FIELDS = [
        'card_number',
        'numero_cartao',
        'numeroCartao',
        'pan',
        'cvv',
        'cvc',
        'cvvCartao',
        'validadeCartao',
        'nomeCartao',
    ];

    public function processPayment(
        Order $order,
        array $paymentData,
        array $customerData,
        array $addressData,
    ): array {
        $forbiddenFields = array_intersect(
            self::FORBIDDEN_CARD_FIELDS,
            array_keys($paymentData)
        );

        if ($forbiddenFields !== []) {
            return [
                'status' => 'error',
                'code' => 'RAW_CARD_DATA_REJECTED',
                'message' => 'Dados brutos de cartao nao sao aceitos.',
            ];
        }

        return [
            'status' => 'error',
            'code' => 'PAYMENT_GATEWAY_NOT_AVAILABLE',
            'message' => 'Pagamento indisponivel ate a homologacao do gateway.',
        ];
    }
}
