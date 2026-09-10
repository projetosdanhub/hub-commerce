<?php

namespace App\Domain\Shipping;

use App\Enums\OrderStatus;
use App\Models\MelhorEnvioSetting;
use App\Models\Order;
use App\Models\OrderHistory;
use App\Models\OrderShipment;
use App\Services\OrderStatusTransitionService;
use DomainException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final readonly class MelhorEnvioShipmentService
{
    public function __construct(
        private MelhorEnvioShipmentClient $client,
        private MelhorEnvioShipmentPayload $payloads,
        private MelhorEnvioRateAdapter $rates,
        private OrderStatusTransitionService $transitions,
    ) {}

    public function create(Order $order, array $input): OrderShipment
    {
        $settings = MelhorEnvioSetting::query()->first();
        $installation = $settings?->oauthConnection();
        if ($settings === null || $installation === null) {
            throw new DomainException('Conecte o Melhor Envio e configure o remetente.');
        }
        $payload = $this->payloads->build($order, $settings, $input);
        $fingerprint = hash('sha256', json_encode([$installation->id, $payload], JSON_THROW_ON_ERROR));
        $existing = OrderShipment::query()->where('order_id', $order->id)->where('active_slot', true)->first();
        if ($existing !== null) {

            return $this->existing($existing, $fingerprint);
        }
        $rate = collect($this->rates->calculate($settings, $payload['to']['postal_code'], $payload['volumes'][0], $payload['options']['insurance_value']))
            ->first(fn (array $rate): bool => $rate['id'] === (string) $payload['service']);
        if ($rate === null) {
            throw new DomainException('O serviço selecionado não atende este pacote e destino.');
        }
        $created = false;
        $shipment = DB::transaction(function () use ($order, $installation, $fingerprint, $payload, $rate, &$created): OrderShipment {
            $lockedOrder = Order::query()->whereKey($order->id)->lockForUpdate()->firstOrFail();
            if ($lockedOrder->status !== OrderStatus::READY_TO_SHIP) {
                throw new DomainException('O pedido precisa estar separado antes de preparar o envio.');
            }
            $existing = OrderShipment::query()->where('order_id', $order->id)->where('active_slot', true)->first();
            if ($existing !== null) {

                return $this->existing($existing, $fingerprint);
            }
            $reference = (string) Str::uuid();
            $payload['options']['tags'] = [['tag' => $reference, 'url' => null]];
            $created = true;

            return OrderShipment::query()->create([
                'public_id' => $reference, 'order_id' => $order->id,
                'provider_installation_id' => $installation->id, 'environment' => $installation->environment,
                'status' => ShipmentStatus::PREPARING, 'operation' => ShipmentOperation::CREATE,
                'operation_started_at' => now(), 'request_fingerprint' => $fingerprint,
                'request_payload' => $payload, 'quoted_cents' => $this->payloads->cents($rate['price']),
            ]);
        });
        if (! $created) {

            return $shipment;
        }
        try {
            $response = $this->client->request($shipment, 'POST', 'cart', $shipment->request_payload);
        } catch (ConnectionException) {
            $this->uncertain($shipment);
        } catch (DomainException $exception) {
            $shipment->update(['active_slot' => null, 'operation' => null, 'failure_code' => 'CONFIGURATION_REQUIRED']);
            throw $exception;
        }
        if (in_array($response->status(), [400, 401, 403, 422], true)) {
            $shipment->update(['active_slot' => null, 'operation' => null, 'failure_code' => 'PROVIDER_REJECTED']);
            throw new DomainException('O Melhor Envio recusou o envio. Revise remetente, destinatário, pacote e documento.');
        }
        $reference = $response->json('id');
        if (! $response->successful() || ! is_string($reference) || ! Str::isUuid($reference)) {
            $this->uncertain($shipment);
        }
        $shipment->update(['provider_reference' => $reference, 'status' => ShipmentStatus::PENDING, 'operation' => null]);
        $this->audit($shipment, 'Envio adicionado ao carrinho do Melhor Envio; aguardando compra e geração da etiqueta.');

        return $shipment->refresh();
    }

    public function operate(OrderShipment $shipment, ShipmentOperation $operation, ?string $reason = null): OrderShipment
    {
        if ($operation === ShipmentOperation::CANCEL && (blank($reason) || strlen((string) $reason) > 2000)) {
            throw new DomainException('Informe o motivo do cancelamento, com até 2000 caracteres.');
        }
        $shipment = DB::transaction(function () use ($shipment, $operation): OrderShipment {
            $locked = OrderShipment::query()->whereKey($shipment->id)->lockForUpdate()->firstOrFail();
            if ($locked->operation !== null) {
                throw new DomainException('Existe uma operação pendente. Consulte o estado do envio antes de repetir.');
            }
            if ($locked->provider_reference === null) {
                throw new DomainException('A criação precisa ser reconciliada antes de continuar.');
            }
            $allowed = match ($operation) {
                ShipmentOperation::PURCHASE => [ShipmentStatus::PENDING],
                ShipmentOperation::GENERATE => [ShipmentStatus::RELEASED],
                ShipmentOperation::CANCEL => [ShipmentStatus::PENDING, ShipmentStatus::RELEASED, ShipmentStatus::GENERATED],
                default => [],
            };
            if (! in_array($locked->status, $allowed, true)) {
                throw new DomainException('Esta operação não está disponível no estado atual da etiqueta.');
            }
            $locked->update(['operation' => $operation, 'operation_started_at' => now(), 'failure_code' => null]);

            return $locked;
        });
        $isCartRemoval = $operation === ShipmentOperation::CANCEL && $shipment->status === ShipmentStatus::PENDING;
        $path = match ($operation) {
            ShipmentOperation::PURCHASE => 'shipment/checkout',
            ShipmentOperation::GENERATE => 'shipment/generate',
            ShipmentOperation::CANCEL => $isCartRemoval ? 'cart/'.$shipment->provider_reference : 'shipment/cancel',
            default => throw new DomainException('Operação inválida.'),
        };
        $body = $operation === ShipmentOperation::CANCEL
            ? ['order' => ['id' => $shipment->provider_reference, 'reason_id' => 2, 'description' => $reason]]
            : ['orders' => [$shipment->provider_reference]];
        try {
            $response = $this->client->request($shipment, $isCartRemoval ? 'DELETE' : 'POST', $path, $body);
        } catch (ConnectionException) {
            $this->uncertain($shipment);
        } catch (DomainException $exception) {
            $shipment->update(['operation' => null, 'failure_code' => 'CONFIGURATION_REQUIRED']);
            throw $exception;
        }
        if (in_array($response->status(), [400, 401, 403, 422], true)) {
            $shipment->update(['operation' => null, 'failure_code' => 'PROVIDER_REJECTED']);
            throw new DomainException('O provedor recusou a operação. Verifique saldo, dados e estado da etiqueta.');
        }
        if (! $response->successful()) {
            $this->uncertain($shipment);
        }
        if ($isCartRemoval && $response->status() === 204) {

            return $this->applyStatus($shipment, ShipmentStatus::CANCELLED);
        }
        $this->audit($shipment, 'Operação de etiqueta solicitada: '.$operation->value.'. Aguardando confirmação do provedor.');

        return $this->synchronize($shipment);
    }

    public function synchronize(OrderShipment $shipment): OrderShipment
    {
        if ($shipment->provider_reference === null) {
            $shipment = $this->recoverCreation($shipment);
        }
        try {
            $response = $this->client->request($shipment, 'POST', 'shipment/tracking', ['orders' => [$shipment->provider_reference]]);
        } catch (ConnectionException) {
            throw new DomainException('Não foi possível consultar o estado do envio.');
        }
        $data = $response->json($shipment->provider_reference);
        if (! $response->successful() || ! is_array($data)) {
            throw new DomainException('O provedor não retornou o estado desta etiqueta.');
        }
        $status = ShipmentStatus::tryFrom(strtoupper((string) ($data['status'] ?? '')));
        if ($status === null) {
            throw new DomainException('O estado retornado da etiqueta exige verificação.');
        }
        $tracking = $data['tracking'] ?? null;

        return $this->applyStatus($shipment, $status, is_string($tracking) ? $tracking : null);
    }

    public function printUrl(OrderShipment $shipment): string
    {
        if (! in_array($shipment->status, [ShipmentStatus::GENERATED, ShipmentStatus::RECEIVED, ShipmentStatus::POSTED, ShipmentStatus::DELIVERED], true)) {
            throw new DomainException('A etiqueta ainda não foi gerada.');
        }
        try {
            $response = $this->client->request($shipment, 'POST', 'shipment/print', ['orders' => [$shipment->provider_reference], 'mode' => 'private']);
        } catch (ConnectionException) {
            throw new DomainException('Não foi possível obter a impressão da etiqueta.');
        }
        $url = $response->json('url');
        $host = is_string($url) ? parse_url($url, PHP_URL_HOST) : null;
        if (! $response->successful() || ! is_string($url) || parse_url($url, PHP_URL_SCHEME) !== 'https'
            || ! is_string($host) || ! ($host === 'melhorenvio.com.br' || str_ends_with($host, '.melhorenvio.com.br'))) {
            throw new DomainException('O provedor não disponibilizou uma impressão privada válida.');
        }

        return $url;
    }

    public function applyStatus(OrderShipment $shipment, ShipmentStatus $status, ?string $tracking = null): OrderShipment
    {

        return DB::transaction(function () use ($shipment, $status, $tracking): OrderShipment {
            $order = Order::query()->whereKey($shipment->order_id)->lockForUpdate()->firstOrFail();
            $locked = OrderShipment::query()->whereKey($shipment->id)->lockForUpdate()->firstOrFail();
            if (! $locked->status->accepts($status)) {

                return $locked;
            }
            $changed = $locked->status !== $status;
            $locked->status = $status;
            if (is_string($tracking) && preg_match('/^[A-Za-z0-9-]{1,120}$/', $tracking)) {
                $locked->tracking_code = $tracking;
            }
            $complete = match ($locked->operation) {
                ShipmentOperation::CREATE => $status !== ShipmentStatus::PREPARING,
                ShipmentOperation::PURCHASE => ! in_array($status, [ShipmentStatus::PREPARING, ShipmentStatus::PENDING], true),
                ShipmentOperation::GENERATE => ! in_array($status, [ShipmentStatus::PREPARING, ShipmentStatus::PENDING, ShipmentStatus::RELEASED], true),
                ShipmentOperation::CANCEL => $status === ShipmentStatus::CANCELLED,
                null => true,
            };
            if ($complete) {
                $locked->operation = null;
                $locked->failure_code = null;
            }
            if ($status === ShipmentStatus::CANCELLED) {
                $locked->active_slot = null;
            }
            $locked->save();
            if ($locked->tracking_code !== null && $status !== ShipmentStatus::CANCELLED) {
                $order->tracking_code = $locked->tracking_code;
                $order->save();
            }
            if (in_array($status, [ShipmentStatus::POSTED, ShipmentStatus::DELIVERED], true) && $order->status === OrderStatus::READY_TO_SHIP) {
                $order = $this->transitions->transition($order, OrderStatus::SHIPPED, 'Postagem confirmada pelo Melhor Envio.');
            }
            if ($status === ShipmentStatus::DELIVERED && $order->status === OrderStatus::SHIPPED) {
                $this->transitions->transition($order, OrderStatus::DELIVERED, 'Entrega confirmada pelo Melhor Envio.');
            }
            if ($changed) {
                $this->audit($locked, 'Estado da etiqueta Melhor Envio: '.$status->value.'.');
            }

            return $locked;
        });
    }

    private function recoverCreation(OrderShipment $shipment): OrderShipment
    {
        try {
            $response = $this->client->request($shipment, 'GET', 'cart');
        } catch (ConnectionException) {
            throw new DomainException('Não foi possível consultar o carrinho. A criação permanece pendente.');
        }
        $items = $response->json('data') ?? $response->json();
        if (! $response->successful() || ! is_array($items)) {
            throw new DomainException('Não foi possível reconciliar o carrinho. Não repita a criação.');
        }
        $matches = collect($items)->filter(function ($item) use ($shipment): bool {

            return is_array($item) && collect($item['tags'] ?? [])->contains(
                fn ($tag): bool => is_array($tag) && ($tag['tag'] ?? null) === $shipment->public_id,
            );
        });
        $reference = $matches->count() === 1 ? $matches->first()['id'] ?? null : null;
        if (! is_string($reference) || ! Str::isUuid($reference)) {
            throw new DomainException('Etiqueta ainda não localizada com segurança. Verifique o carrinho no Melhor Envio usando a referência '.$shipment->public_id.'.');
        }

        return DB::transaction(function () use ($shipment, $reference): OrderShipment {
            $locked = OrderShipment::query()->whereKey($shipment->id)->lockForUpdate()->firstOrFail();
            if ($locked->provider_reference === null) {
                $locked->update(['provider_reference' => $reference]);
            }

            return $locked;
        });
    }

    private function existing(OrderShipment $shipment, string $fingerprint): OrderShipment
    {
        if (! hash_equals($shipment->request_fingerprint, $fingerprint)) {
            throw new DomainException('Já existe um envio com outra configuração para este pedido. Consulte ou cancele a etiqueta existente.');
        }

        return $shipment;
    }

    private function uncertain(OrderShipment $shipment): never
    {
        $shipment->update(['failure_code' => 'RECONCILIATION_REQUIRED']);
        throw new DomainException('Resposta incerta do provedor. Consulte o envio antes de repetir para evitar duplicação.');
    }

    private function audit(OrderShipment $shipment, string $message): void
    {
        OrderHistory::query()->create(['order_id' => $shipment->order_id, 'event' => $message]);
    }
}
