<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\TrackingDestination;
use App\Models\TrackingLog;
use App\Models\TrackingRule;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TrackingController extends Controller
{
    public function getPublicSettings(): JsonResponse
    {
        $config = TrackingDestination::where('provider', 'global')->first();

        if (! $config || ! $config->is_active) {
            return response()->json([
                'status' => 'success',
                'data' => ['is_active' => false],
            ]);
        }

        return response()->json([
            'status' => 'success',
            'data' => array_merge(
                ['is_active' => true],
                $config->publicCredentials(),
                $config->settings ?? []
            ),
        ]);
    }

    public function getSettings(): JsonResponse
    {
        $config = TrackingDestination::firstOrCreate(
            ['provider' => 'global'],
            ['name' => 'Cofre Principal', 'credentials' => [], 'settings' => [], 'is_active' => true]
        );

        return response()->json([
            'status' => 'success',
            'data' => [
                'credentials' => $config->maskedCredentials(),
                'configured' => $config->configuredCredentials(),
                'settings' => $config->settings ?? [],
                'is_active' => $config->is_active,
            ],
        ]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'credentials' => ['sometimes', 'array'],
            'credentials.meta_pixel_id' => ['nullable', 'string', 'max:100'],
            'credentials.meta_access_token' => ['nullable', 'string', 'max:4096'],
            'credentials.tiktok_pixel_id' => ['nullable', 'string', 'max:100'],
            'credentials.tiktok_access_token' => ['nullable', 'string', 'max:4096'],
            'credentials.ga4_measurement_id' => ['nullable', 'string', 'max:100'],
            'credentials.ga4_api_secret' => ['nullable', 'string', 'max:4096'],
            'credentials.pinterest_pixel_id' => ['nullable', 'string', 'max:100'],
            'credentials.pinterest_access_token' => ['nullable', 'string', 'max:4096'],
            'settings' => ['sometimes', 'array'],
            'settings.*' => ['boolean'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $config = TrackingDestination::firstOrCreate(
            ['provider' => 'global'],
            ['name' => 'Cofre Principal', 'credentials' => [], 'settings' => [], 'is_active' => true]
        );

        if (isset($validated['credentials'])) {
            $credentials = $config->credentials ?? [];

            foreach ($validated['credentials'] as $key => $value) {
                if ($value === '********' || $value === null || $value === '') {
                    continue;
                }

                $credentials[$key] = $value;
            }

            $config->credentials = $credentials;
        }

        if (isset($validated['settings'])) {
            $config->settings = $validated['settings'];
        }

        if (array_key_exists('is_active', $validated)) {
            $config->is_active = $validated['is_active'];
        }

        $config->save();

        return response()->json(['status' => 'success']);
    }

    public function getDashboardData(Request $request): JsonResponse
    {
        try {
            $inicio = $request->filled('inicio')
                ? Carbon::parse($request->input('inicio'))->setTimezone(config('app.timezone'))->startOfDay()
                : now()->subDays(7)->startOfDay();

            $fim = $request->filled('fim')
                ? Carbon::parse($request->input('fim'))->setTimezone(config('app.timezone'))->endOfDay()
                : now()->endOfDay();

            $eventosAgrupados = TrackingLog::select('event_name', DB::raw('count(*) as total'))
                ->whereBetween('created_at', [$inicio, $fim])
                ->groupBy('event_name')
                ->pluck('total', 'event_name')
                ->toArray();

            $pedidosValidos = Order::whereNotIn('status', ['CANCELADO', 'REEMBOLSADO'])
                ->whereBetween('created_at', [$inicio, $fim]);

            $receitaBruta = (float) $pedidosValidos->sum('total');
            $qtdPedidos = $pedidosValidos->count();
            $ticketMedio = $qtdPedidos > 0 ? $receitaBruta / $qtdPedidos : 0;
            $itensVendidos = \App\Models\OrderItem::whereHas('order', function ($query) use ($inicio, $fim) {
                $query->whereNotIn('status', ['CANCELADO', 'REEMBOLSADO'])
                    ->whereBetween('created_at', [$inicio, $fim]);
            })->sum('quantity');

            $novosClientes = 0;
            $clientesRecorrentes = 0;
            foreach ($pedidosValidos->pluck('user_id')->filter()->unique() as $userId) {
                $hasOlderOrder = Order::where('user_id', $userId)->where('created_at', '<', $inicio)->exists();
                $hasOlderOrder ? $clientesRecorrentes++ : $novosClientes++;
            }

            $pageViews = $eventosAgrupados['PageView'] ?? $eventosAgrupados['page_view'] ?? 0;
            $viewItem = $eventosAgrupados['ViewContent'] ?? $eventosAgrupados['view_item'] ?? 0;
            $addCart = $eventosAgrupados['AddToCart'] ?? $eventosAgrupados['add_to_cart'] ?? 0;
            $checkouts = $eventosAgrupados['InitiateCheckout'] ?? $eventosAgrupados['begin_checkout'] ?? 0;
            $addPaymentInfo = $eventosAgrupados['AddPaymentInfo'] ?? $eventosAgrupados['add_payment_info'] ?? 0;
            $purchasesLayer = $eventosAgrupados['Purchase'] ?? $eventosAgrupados['purchase'] ?? 0;

            $funilData = collect($eventosAgrupados)
                ->map(fn ($total, $name) => ['evento' => $this->canonicalEventName($name), 'total' => (int) $total])
                ->groupBy('evento')
                ->map(fn ($items, $event) => ['evento' => $event, 'total' => $items->sum('total')])
                ->sortByDesc('total')
                ->values();

            return response()->json([
                'status' => 'success',
                'funil' => $funilData,
                'metrics' => [
                    'receita_bruta' => $receitaBruta,
                    'receita_liquida' => $receitaBruta,
                    'pedidos' => $qtdPedidos,
                    'itens_vendidos' => (int) $itensVendidos,
                    'ticket_medio' => $ticketMedio,
                    'taxa_conversao' => $pageViews > 0 ? ($qtdPedidos / $pageViews) * 100 : 0,
                    'novos_clientes' => $novosClientes,
                    'clientes_recorrentes' => $clientesRecorrentes,
                    'cac' => 0,
                    'roas' => 0,
                    'ltv' => $ticketMedio,
                    'margem_bruta' => 0,
                    'sessoes' => $pageViews,
                    'page_views' => $pageViews,
                    'view_item' => $viewItem,
                    'add_to_cart' => $addCart,
                    'begin_checkout' => $checkouts,
                    'add_payment_info' => $addPaymentInfo,
                    'abandono_carrinho' => $addCart > 0 ? (max(0, $addCart - $qtdPedidos) / $addCart) * 100 : 0,
                    'abandono_checkout' => $checkouts > 0 ? (max(0, $checkouts - $qtdPedidos) / $checkouts) * 100 : 0,
                    'purchases_layer' => $purchasesLayer,
                ],
            ]);
        } catch (\Throwable $exception) {
            Log::warning('Falha ao montar dashboard de tracking.', [
                'exception' => $exception::class,
                'request_id' => $request->header('X-Request-ID'),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Nao foi possivel carregar as metricas.',
            ], 503);
        }
    }

    public function getTriggers(): JsonResponse
    {
        $triggers = TrackingRule::orderBy('priority', 'desc')->orderBy('id', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $triggers->map(fn ($trigger) => [
                'id' => $trigger->id,
                'nome' => $trigger->name,
                'evento' => $trigger->target_event,
                'tipo_gatilho' => $trigger->conditions['tipo'] ?? 'click',
                'valor_gatilho' => $trigger->conditions['valor'] ?? '',
                'url_alvo' => $trigger->conditions['url_alvo'] ?? '*',
                'payload' => $trigger->transformations ?? [],
                'status' => $trigger->is_active,
            ]),
        ]);
    }

    public function storeTrigger(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id' => ['nullable', 'integer'],
            'nome' => ['required', 'string', 'max:255'],
            'evento' => ['required', 'string', 'max:100'],
            'tipo_gatilho' => ['nullable', 'string', 'max:50'],
            'valor_gatilho' => ['nullable', 'string', 'max:500'],
            'url_alvo' => ['nullable', 'string', 'max:2048'],
            'payload' => ['nullable', 'array'],
            'status' => ['nullable', 'boolean'],
        ]);

        $data = [
            'name' => $validated['nome'],
            'target_event' => $validated['evento'],
            'conditions' => [
                'tipo' => $validated['tipo_gatilho'] ?? 'click',
                'valor' => $validated['valor_gatilho'] ?? '',
                'url_alvo' => $validated['url_alvo'] ?? '*',
            ],
            'transformations' => $validated['payload'] ?? [],
            'is_active' => $validated['status'] ?? true,
        ];

        isset($validated['id'])
            ? TrackingRule::whereKey($validated['id'])->update($data)
            : TrackingRule::create($data);

        return response()->json(['status' => 'success']);
    }

    public function deleteTrigger(int $id): JsonResponse
    {
        TrackingRule::whereKey($id)->delete();

        return response()->json(['status' => 'success']);
    }

    private function canonicalEventName(string $name): string
    {
        return match ($name) {
            'page_view' => 'PageView',
            'view_item' => 'ViewContent',
            'add_to_cart' => 'AddToCart',
            'begin_checkout' => 'InitiateCheckout',
            'add_payment_info' => 'AddPaymentInfo',
            'purchase' => 'Purchase',
            default => $name,
        };
    }
}
