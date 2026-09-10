<?php

namespace App\Domain\Shipping;

use App\Models\MelhorEnvioSetting;
use App\Models\Order;
use DomainException;
use Illuminate\Support\Facades\Validator;

final class MelhorEnvioShipmentPayload
{
    public function build(Order $order, MelhorEnvioSetting $settings, array $input): array
    {
        $data = Validator::make($input, [
            'me_carrier_id' => 'required|integer|min:1',
            'vol_altura' => 'required|numeric|gt:0|max:300',
            'vol_largura' => 'required|numeric|gt:0|max:300',
            'vol_comprimento' => 'required|numeric|gt:0|max:300',
            'vol_peso' => 'required|numeric|gt:0|max:1000',
            'doc_tipo' => 'required|in:DECLARACAO,NFE',
            'invoice_key' => ['required_if:doc_tipo,NFE', 'nullable', 'regex:/^\d{44}$/'],
            'recipient_document' => 'required|string|max:18',
            'recipient_phone' => 'required|string|max:20',
        ])->validate();
        $order->loadMissing(['items', 'address', 'storefrontCustomer', 'user']);
        $customer = $order->storefrontCustomer ?? $order->user;
        $address = $order->address;
        if ($customer === null || $address === null || $order->items->isEmpty()) {
            throw new DomainException('Complete os dados do destinatário e dos itens antes de gerar o envio.');
        }
        $sender = $settings->sender_info ?? [];
        $from = $this->party([
            'name' => $sender['nome'] ?? '', 'email' => $sender['email'] ?? '',
            'phone' => $sender['telefone'] ?? '', 'document' => $sender['documento'] ?? '',
            'postal_code' => $sender['cep'] ?? '', 'address' => $sender['rua'] ?? '',
            'number' => $sender['numero'] ?? '', 'complement' => $sender['complemento'] ?? '',
            'district' => $sender['bairro'] ?? '', 'city' => $sender['cidade'] ?? '',
            'state_abbr' => $sender['uf'] ?? '',
        ]);
        $to = $this->party([
            'name' => $customer->name, 'email' => $customer->email,
            'phone' => $data['recipient_phone'], 'document' => $data['recipient_document'],
            'postal_code' => $address->cep, 'address' => $address->rua, 'number' => $address->num,
            'complement' => $address->complemento ?? '', 'district' => $address->bairro,
            'city' => $address->cidade, 'state_abbr' => $address->uf,
        ]);
        $insuranceCents = 0;
        $products = [];
        foreach ($order->items as $item) {
            $price = $this->cents((string) $item->price);
            if ($item->quantity < 1 || blank($item->product_name)) {
                throw new DomainException('Item de pedido inválido para envio.');
            }
            $insuranceCents += $price * $item->quantity;
            $products[] = ['name' => $item->product_name, 'quantity' => $item->quantity, 'unitary_value' => $this->decimal($price)];
        }
        $options = ['insurance_value' => $this->decimal($insuranceCents), 'receipt' => false, 'own_hand' => false];
        if ($data['doc_tipo'] === 'NFE') {
            if (blank($sender['inscricao_estadual'] ?? null)) {
                throw new DomainException('Informe a inscrição estadual do remetente para envio comercial.');
            }
            $from['state_register'] = $sender['inscricao_estadual'];
            $options['invoice'] = ['key' => $data['invoice_key']];
            $options['non_commercial'] = false;
        } else {
            $from['state_register'] = 'ISENTO';
            $options['non_commercial'] = true;
        }
        if (filled($sender['cnae'] ?? null)) {
            $from['economic_activity_code'] = $sender['cnae'];
        }

        return [
            'service' => (int) $data['me_carrier_id'], 'from' => $from, 'to' => $to,
            'products' => $products,
            'volumes' => [[
                'height' => (float) $data['vol_altura'], 'width' => (float) $data['vol_largura'],
                'length' => (float) $data['vol_comprimento'], 'weight' => (float) $data['vol_peso'],
            ]],
            'options' => $options,
        ];
    }

    private function party(array $data): array
    {
        foreach (['phone', 'document', 'postal_code'] as $field) {
            $data[$field] = preg_replace('/\D/', '', (string) $data[$field]);
        }
        Validator::make($data, [
            'name' => 'required|string|max:120', 'email' => 'required|email|max:254',
            'phone' => 'required|digits_between:10,11', 'document' => 'required|digits_between:11,14',
            'postal_code' => 'required|digits:8', 'address' => 'required|string|max:255',
            'number' => 'required|string|max:32', 'district' => 'required|string|max:120',
            'city' => 'required|string|max:120', 'state_abbr' => 'required|string|size:2',
        ])->validate();
        if (! in_array(strlen($data['document']), [11, 14], true) || preg_match('/^(\d)\1+$/', $data['document'])) {
            throw new DomainException('CPF/CNPJ do envio inválido.');
        }
        if (strlen($data['document']) === 14) {
            $data['company_document'] = $data['document'];
            unset($data['document']);
        }

        return $data;
    }

    public function cents(string $amount): int
    {
        if (! preg_match('/^\d{1,9}(?:\.\d{1,2})?$/', $amount)) {
            throw new DomainException('Valor do envio inválido.');
        }
        $parts = explode('.', $amount);

        return (int) $parts[0] * 100 + (int) str_pad($parts[1] ?? '', 2, '0');
    }

    private function decimal(int $cents): string
    {

        return intdiv($cents, 100).'.'.str_pad((string) ($cents % 100), 2, '0', STR_PAD_LEFT);
    }
}
