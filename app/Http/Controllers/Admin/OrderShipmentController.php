<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Shipping\MelhorEnvioShipmentService;
use App\Domain\Shipping\ShipmentOperation;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderShipment;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class OrderShipmentController extends Controller
{
    public function __construct(private readonly MelhorEnvioShipmentService $shipments) {}

    public function show(int $id): JsonResponse
    {
        Order::query()->findOrFail($id);
        $shipment = OrderShipment::query()->where('order_id', $id)->latest('id')->first();

        return response()->json(['data' => $shipment === null ? null : $this->present($shipment)]);
    }

    public function store(Request $request, int $id): JsonResponse
    {
        $order = Order::query()->findOrFail($id);
        try {
            $shipment = $this->shipments->create($order, $request->all());

            return response()->json(['data' => $this->present($shipment), 'message' => 'Envio preparado. Compre e gere a etiqueta antes da postagem.']);
        } catch (DomainException $exception) {

            return $this->unavailable($exception);
        }
    }

    public function action(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'action' => 'required|in:PURCHASE,GENERATE,CANCEL,SYNCHRONIZE,PRINT',
            'reason' => 'required_if:action,CANCEL|nullable|string|max:2000',
        ]);
        $shipment = $this->current($id);
        try {
            if ($data['action'] === 'PRINT') {

                return response()->json(['url' => $this->shipments->printUrl($shipment)]);
            }
            $shipment = $data['action'] === 'SYNCHRONIZE'
                ? $this->shipments->synchronize($shipment)
                : $this->shipments->operate($shipment, ShipmentOperation::from($data['action']), $data['reason'] ?? null);

            return response()->json(['data' => $this->present($shipment)]);
        } catch (DomainException $exception) {

            return $this->unavailable($exception);
        }
    }

    public function cancel(Request $request, int $id): JsonResponse
    {
        $data = $request->validate(['motivo' => 'required|string|max:2000']);
        try {
            $shipment = $this->shipments->operate($this->current($id), ShipmentOperation::CANCEL, $data['motivo']);

            return response()->json(['data' => $this->present($shipment)]);
        } catch (DomainException $exception) {

            return $this->unavailable($exception);
        }
    }

    private function current(int $id): OrderShipment
    {
        Order::query()->findOrFail($id);

        return OrderShipment::query()->where('order_id', $id)->where('active_slot', true)->firstOrFail();
    }

    private function present(OrderShipment $shipment): array
    {

        return $shipment->only([
            'public_id', 'environment', 'status', 'operation', 'quoted_cents',
            'tracking_code', 'failure_code', 'active_slot', 'updated_at',
        ]);
    }

    private function unavailable(DomainException $exception): JsonResponse
    {

        return response()->json(['message' => $exception->getMessage(), 'code' => 'SHIPMENT_ACTION_UNAVAILABLE'], 422);
    }
}
