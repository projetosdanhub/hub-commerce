<?php

namespace App\Http\Controllers\Admin;

use App\Support\Http\Pagination;
use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\AdminMetricPreference;
use App\Models\Order;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Models\VipLevel;
use App\Services\OrderDocumentStorage;
use App\Services\OrderStatusTransitionService;
use App\Services\RefundReceiptStorage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderDocumentStorage $orderDocuments,
        private readonly OrderStatusTransitionService $statusTransitions,
        private readonly RefundReceiptStorage $refundReceipts,
    ) {
    }

    private const ORDER_METRIC_IDS = [
        'valid-revenue',
        'awaiting-shipment',
        'pix-confirmed',
        'refund-review',
    ];

    public function metricPreferences(Request $request)
    {
        $preferences = AdminMetricPreference::query()
            ->where('user_id', $request->user()->getKey())
            ->where('context', 'orders')
            ->value('preferences');

        return response()->json($preferences ?? [
            'order' => self::ORDER_METRIC_IDS,
            'hidden' => [],
        ]);
    }

    public function updateMetricPreferences(Request $request)
    {
        $validated = $request->validate([
            'order' => ['required', 'array', 'size:'.count(self::ORDER_METRIC_IDS)],
            'order.*' => ['required', 'string', Rule::in(self::ORDER_METRIC_IDS)],
            'hidden' => ['present', 'array'],
            'hidden.*' => ['required', 'string', Rule::in(self::ORDER_METRIC_IDS)],
        ]);

        $order = array_values(array_unique($validated['order']));
        $hidden = array_values(array_unique($validated['hidden']));

        if (
            count($order) !== count(self::ORDER_METRIC_IDS)
            || array_diff(self::ORDER_METRIC_IDS, $order)
            || array_diff($order, self::ORDER_METRIC_IDS)
        ) {
            throw ValidationException::withMessages([
                'order' => 'Informe cada métrica uma única vez.',
            ]);
        }

        if (count(array_diff($order, $hidden)) === 0) {
            throw ValidationException::withMessages([
                'hidden' => 'Mantenha ao menos uma métrica visível no painel.',
            ]);
        }

        $preferences = [
            'order' => $order,
            'hidden' => $hidden,
        ];

        $preference = AdminMetricPreference::query()->firstOrNew([
            'user_id' => $request->user()->getKey(),
            'context' => 'orders',
        ]);
        $preference->preferences = $preferences;
        $preference->save();

        return response()->json($preferences);
    }

    public function index(Request $request)
    {
        $query = Order::with(['user', 'items', 'address', 'carrier', 'history' => function($q) {
            $q->orderBy('created_at', 'desc');
        }]);

        if ($search = $request->input('busca')) {
            $query->where(function($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                  ->orWhereHas('user', function($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%")
                         ->orWhere('cpf', 'like', "%{$search}%");
                  });
            });
        }
        
        if ($status = $request->input('status')) {
            if ($status !== 'TUDO') {
                $query->where('status', $status);
            }
        }

        if ($start = $request->input('start_date')) {
            $query->where('created_at', '>=', $start . ' 00:00:00');
        }
        if ($end = $request->input('end_date')) {
            $query->where('created_at', '<=', $end . ' 23:59:59');
        }

        $query->orderBy('id', 'desc');

        $limit = Pagination::perPage($request, 10);
        $paginator = $query->paginate($limit);

        // Pre-fetch LTV for users in this page to avoid N+1
        $userIds = $paginator->pluck('user_id')->filter()->unique();
        $userMetrics = [];
        if ($userIds->isNotEmpty()) {
            $metrics = Order::whereIn('user_id', $userIds)
                ->whereNotIn('status', [OrderStatus::CANCELLED->value, OrderStatus::REFUNDED->value])
                ->selectRaw('user_id, SUM(total) as ltv, COUNT(*) as compras')
                ->groupBy('user_id')
                ->get();
            foreach ($metrics as $m) {
                $userMetrics[$m->user_id] = [
                    'ltv' => (float)$m->ltv,
                    'compras' => (int)$m->compras
                ];
            }
        }

        $niveisVip = VipLevel::orderBy('gasto_requisito', 'desc')->get();
        $defaultVip = VipLevel::where('is_default', true)->first();

        $formatted = $paginator->getCollection()->map(function ($order) use ($userMetrics, $niveisVip, $defaultVip) {
            $status = $order->status instanceof OrderStatus
                ? $order->status
                : OrderStatus::from((string) $order->getRawOriginal('status'));

            $refundReceipts = collect($order->refund_receipts ?? [])
                ->filter()
                ->values()
                ->map(fn (string $path, int $index) => [
                    'id' => $index,
                    'name' => 'Comprovante de reembolso '.($index + 1),
                    'kind' => in_array(strtolower(pathinfo($path, PATHINFO_EXTENSION)), ['jpg', 'jpeg', 'png'], true)
                        ? 'image'
                        : 'document',
                    'preview_url' => $this->refundReceiptUrl($order, $index),
                    'download_url' => $this->refundReceiptUrl($order, $index, true),
                ])
                ->all();

            $ltv = $userMetrics[$order->user_id]['ltv'] ?? 0.0;
            $compras = $userMetrics[$order->user_id]['compras'] ?? 0;
            
            $rank = 'Iniciante';
            foreach ($niveisVip as $nivel) {
                if ($ltv >= $nivel->gasto_requisito && $compras >= $nivel->compras_requisito) {
                    $rank = $nivel->nome;
                    break;
                }
            }
            if ($rank === 'Iniciante' && $defaultVip) {
                $rank = $defaultVip->nome;
            }

            return [
                'id' => $order->id,
                'status' => $status->value,
                'data' => $order->created_at->format('d/m/Y'),
                'hora' => $order->created_at->format('H:i'),
                'data_raw' => $order->created_at->format('Y-m-d\TH:i:s'), 
                
                'subtotal' => (float) $order->subtotal,
                'frete_valor' => (float) $order->frete,
                'desconto' => (float) $order->desconto,
                'total' => (float) $order->total,

                'desconto_loja' => (float) $order->desconto, 
                'desconto_vip_produtos' => 0, 
                'desconto_vip_frete' => 0, 
                'desconto_frete' => 0,

                'tracking_code' => $order->tracking_code,
                'carrier' => $order->carrier ? $order->carrier->nome : 'Aguardando Despacho', 
                
                'motivo_cancelamento' => $order->cancel_reason,
                'comprovante_reembolso' => null,
                'comprovantes_reembolso' => $refundReceipts,
                'comprovante_pagamento' => null,
                'comprovante_entrega' => null,
                'documentos' => $this->documentsFor($order),
                'metodo_reembolso' => $order->refund_method ?? 'Estorno/Transferência',
                'motivo_reembolso' => $order->refund_reason,
                'pode_cancelar_reembolso' => $this->canCancelRefundRequest($order),
                'coupons' => is_string($order->applied_coupons) ? json_decode($order->applied_coupons, true) : ($order->applied_coupons ?? []),
                
                'pagamento_metodo' => $order->payment_method ?? 'A Vista',
                'pagamento_parcelas' => (int) $order->payment_installments,
                'juros' => (float) $order->gateway_fee > 0, 
                
                'pagamento' => [
                    'gateway' => $order->payment_gateway ?? 'N/A',
                    'payment_gateway' => $order->payment_gateway,
                    'metodo' => $order->payment_method ?? 'A Vista',
                    'parcelas' => (int) $order->payment_installments,
                    'valor_parcela' => (float) $order->installment_value,
                    'juros' => (float) $order->gateway_fee,
                    'isPago' => $status->isPaid()
                ],
                
                'cliente' => [
                    'id' => $order->user ? $order->user->id : 0,
                    'nome' => $order->user ? $order->user->name : 'Cliente Excluído',
                    'email' => $order->user ? $order->user->email : '-',
                    'cpf' => $order->user->cpf ?? '-',
                    'telefone' => $order->user->telefone ?? '-',
                    'nascimento' => $order->user->nascimento ?? '-',
                    'sexo' => $order->user->sexo ?? 'Não informado',
                    'origem' => $order->user->origem ?? 'Direto / Loja',
                    'tags' => $order->user->tags ?? [],
                    'avatar' => $order->user->avatar ?? null,
                    'ltv' => $ltv,
                    'compras' => $compras,
                    'cupons_usados' => $compras,
                    'rank' => $rank
                ],

                'endereco' => $order->address ? [
                    'rua' => $order->address->rua, 
                    'numero' => $order->address->num, 
                    'complemento' => $order->address->complemento,
                    'referencia' => $order->address->referencia,
                    'bairro' => $order->address->bairro,
                    'cidade' => $order->address->cidade,
                    'uf' => $order->address->uf, 
                    'cep' => $order->address->cep,
                ] : null,

                'items' => $order->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'nome' => $item->product_name,
                        'descricao' => $item->short_description,
                        'sku' => $item->sku,
                        'variacao' => $item->variation_name,
                        'variacaoSku' => $item->variation_sku,
                        'quantidade' => $item->quantity, 
                        'qtd' => $item->quantity, 
                        'preco' => (float) $item->price,
                        'img' => $item->product_image,
                        'personalizacao' => $item->customization
                    ];
                })->values(),

                'timeline' => $order->history->map(function ($log) {
                    return [
                        'data' => $log->created_at->format('d/m/Y H:i'),
                        'data_raw' => $log->created_at->format('Y-m-d\TH:i:s'), 
                        'evento' => $log->event,
                        'autor' => $log->author ?? 'Sistema'
                    ];
                })->values()
            ];
        });

        $paginator->setCollection($formatted);

        return response()->json($paginator);
    }

    public function document(Request $request, $id, string $type)
    {
        $order = Order::findOrFail($id);
        $path = $this->orderDocuments->existingPath($order, $type);

        abort_unless($path !== null, 404);

        return Storage::disk('local')->response(
            $path,
            'pedido-'.$order->getKey().'-'.$type.'.'.pathinfo($path, PATHINFO_EXTENSION),
            ['Content-Disposition' => $request->boolean('download') ? 'attachment' : 'inline'],
        );
    }

    private function documentsFor(Order $order): array
    {
        $labels = [
            'payment' => 'Comprovante de pagamento',
            'delivery' => 'Comprovante de entrega',
            'romaneio' => 'Romaneio',
        ];

        return collect($labels)
            ->map(function (string $name, string $type) use ($order): ?array {
                $field = $this->orderDocuments->fieldFor($type);
                $path = $this->orderDocuments->existingPath($order, $type);

                if ($path === null) {
                    return $field !== null && filled($order->{$field})
                        ? ['type' => $type, 'name' => $name, 'legacy_pending' => true]
                        : null;
                }

                $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));

                return [
                    'type' => $type,
                    'name' => $name,
                    'kind' => in_array($extension, ['jpg', 'jpeg', 'png'], true) ? 'image' : 'document',
                    'preview_url' => $this->orderDocumentUrl($order, $type),
                    'download_url' => $this->orderDocumentUrl($order, $type, true),
                    'legacy_pending' => false,
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    private function orderDocumentUrl(Order $order, string $type, bool $download = false): string
    {
        return URL::temporarySignedRoute(
            'secure-download.orders.documents',
            now()->addMinutes(10),
            [
                'order' => $order->getKey(),
                'type' => $type,
                'download' => $download ? 1 : null,
            ],
        );
    }

    public function refundReceipt(Request $request, $id, int $receiptIndex)
    {
        $order = Order::findOrFail($id);
        $receipts = array_values(array_filter($order->refund_receipts ?? []));
        $path = $receipts[$receiptIndex] ?? null;

        abort_unless($path && Storage::disk('local')->exists($path), 404);

        $disposition = $request->boolean('download') ? 'attachment' : 'inline';

        return Storage::disk('local')->response(
            $path,
            'comprovante-reembolso-'.($receiptIndex + 1),
            ['Content-Disposition' => $disposition],
        );
    }

    private function refundReceiptUrl(Order $order, int $receiptIndex, bool $download = false): string
    {
        return URL::temporarySignedRoute(
            'secure-download.orders.refund-receipts',
            now()->addMinutes(10),
            [
                'order' => $order->getKey(),
                'receiptIndex' => $receiptIndex,
                'download' => $download ? 1 : null,
            ],
        );
    }

    private function canCancelRefundRequest(Order $order): bool
    {
        $source = OrderStatus::tryFrom((string) $order->refund_requested_from_status);

        return $order->status === OrderStatus::REFUND_REVIEW
            && $source !== null
            && $source->canTransitionTo(OrderStatus::REFUND_REVIEW);
    }

    public function metrics(Request $request)
    {
        $pixPayment = '%pix%';
        $awaitingPayment = OrderStatus::AWAITING_PAYMENT->value;
        $cancelled = OrderStatus::CANCELLED->value;
        $refunded = OrderStatus::REFUNDED->value;

        $metrics = Order::query()
            ->selectRaw('COUNT(*) as totais')
            ->selectRaw(
                'COALESCE(SUM(CASE WHEN status = ? THEN 1 ELSE 0 END), 0) as a_enviar',
                [OrderStatus::PICKING->value],
            )
            ->selectRaw(
                "COALESCE(SUM(CASE WHEN LOWER(COALESCE(payment_method, '')) LIKE ? THEN 1 ELSE 0 END), 0) as pix_totais",
                [$pixPayment],
            )
            ->selectRaw(
                "COALESCE(SUM(CASE WHEN LOWER(COALESCE(payment_method, '')) LIKE ? AND status NOT IN (?, ?, ?) THEN 1 ELSE 0 END), 0) as pix_pagos",
                [$pixPayment, $awaitingPayment, $cancelled, $refunded],
            )
            ->selectRaw(
                'COALESCE(SUM(CASE WHEN status = ? THEN 1 ELSE 0 END), 0) as cancelados',
                [$cancelled],
            )
            ->selectRaw(
                'COALESCE(SUM(CASE WHEN status = ? THEN 1 ELSE 0 END), 0) as qtd_reembolsados',
                [$refunded],
            )
            ->selectRaw(
                'COALESCE(SUM(CASE WHEN status = ? THEN total ELSE 0 END), 0) as valor_reembolsado',
                [$refunded],
            )
            ->selectRaw(
                'COALESCE(SUM(CASE WHEN status = ? THEN 1 ELSE 0 END), 0) as em_analise',
                [OrderStatus::REFUND_REVIEW->value],
            )
            ->selectRaw(
                'COALESCE(SUM(CASE WHEN status NOT IN (?, ?) THEN total ELSE 0 END), 0) as ltv',
                [$cancelled, $refunded],
            )
            ->firstOrFail();

        $totais = (int) $metrics->totais;
        $pixTotais = (int) $metrics->pix_totais;
        $pixPagos = (int) $metrics->pix_pagos;
        $cancelledCount = (int) $metrics->cancelados;
        $refundedCount = (int) $metrics->qtd_reembolsados;

        return response()->json([
            'totais' => $totais,
            'aEnviar' => (int) $metrics->a_enviar,
            'pixTotais' => $pixTotais,
            'pixPagos' => $pixPagos,
            'conversaoPix' => $pixTotais > 0 ? round(($pixPagos / $pixTotais) * 100, 1) : 0,
            'cancelados' => $cancelledCount,
            'taxaCancelamento' => $totais > 0 ? round(($cancelledCount / $totais) * 100, 1) : 0,
            'qtdReembolsados' => $refundedCount,
            'valorReembolsado' => (float) $metrics->valor_reembolsado,
            'taxaReembolso' => $totais > 0 ? round(($refundedCount / $totais) * 100, 1) : 0,
            'emAnalise' => (int) $metrics->em_analise,
            'ltv' => (float) $metrics->ltv,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::enum(OrderStatus::class)],
        ]);

        $order = Order::findOrFail($id);
        $target = OrderStatus::from($validated['status']);

        $this->statusTransitions->transition(
            $order,
            $target,
            'Status atualizado para: '.str_replace('_', ' ', $target->value),
        );

        return response()->json(['status' => 'success', 'message' => 'Status do pedido atualizado.']);
    }

    public function dispatchOrder(Request $request, $id)
    {
        $validated = $request->validate([
            'rastreio' => ['nullable', 'string', 'max:255'],
        ]);

        $order = Order::findOrFail($id);
        $order->tracking_code = $validated['rastreio'] ?? null;
        $textoRastreio = $order->tracking_code
            ? "Código de Rastreio: {$order->tracking_code}"
            : 'Enviado sem código de rastreio.';

        $this->statusTransitions->transition(
            $order,
            OrderStatus::SHIPPED,
            "Pedido Despachado para a transportadora. {$textoRastreio}",
        );

        return response()->json(['status' => 'success', 'message' => 'Pedido marcado como despachado.']);
    }

    public function cancelOrder(Request $request, $id)
    {
        $validated = $request->validate([
            'tipo' => ['required', Rule::in(['CANCELADO'])],
            'motivo' => ['required', 'string', 'max:2000'],
        ]);

        $order = Order::findOrFail($id);
        $order->cancel_reason = $validated['motivo'];

        $this->statusTransitions->transition(
            $order,
            OrderStatus::CANCELLED,
            "Pedido cancelado. Motivo: {$validated['motivo']}",
        );

        return response()->json(['status' => 'success', 'message' => 'Pedido cancelado com sucesso.']);
    }

    // =========================================================================
    // 🟢 MÁQUINA DE ESTADOS UNIFICADA: AÇÕES MANUAIS COM COMPROVANTES E ESTORNO
    // =========================================================================
    public function updateStatusManual(Request $request, $id) 
    {
        $order = Order::findOrFail($id);
        $acao = $request->input('acao');

        if ($acao === 'CANCELAR_REEMBOLSO') {
            $validated = $request->validate([
                'motivo' => ['required', 'string', 'max:2000'],
            ]);
            $restoredOrder = $this->statusTransitions->cancelRefundRequest(
                $order,
                "Solicitação de reembolso cancelada. Retorno para o status anterior. Motivo: {$validated['motivo']}",
            );

            return response()->json([
                'status' => 'success',
                'message' => 'Solicitação de reembolso cancelada e pedido restaurado ao estado anterior.',
                'order_status' => $restoredOrder->status->value,
            ]);
        }

        $targetStatus = match ($acao) {
            'PAGAR' => OrderStatus::PICKING,
            'SEPARAR' => OrderStatus::READY_TO_SHIP,
            'DESPACHAR' => OrderStatus::SHIPPED,
            'ENTREGAR' => OrderStatus::DELIVERED,
            'CANCELAR' => OrderStatus::CANCELLED,
            'INICIAR_REEMBOLSO' => OrderStatus::REFUND_REVIEW,
            'PROCESSAR_REEMBOLSO' => OrderStatus::REFUNDED,
            default => null,
        };

        if ($targetStatus === null) {
            return response()->json(['status' => 'error', 'code' => 'REQUEST_FAILED', 'message' => 'Ação inválida não reconhecida.'], 400);
        }

        $this->statusTransitions->assertCanTransition($order, $targetStatus);

        $motivo = $request->input('motivo');
        $carrierId = $request->input('carrier_id');
        $trackingCode = $request->input('tracking_code');
        $refundMethod = $request->input('refund_method');
        $docTipo = $request->input('doc_tipo'); // DECLARACAO ou NFE
        
        $msg = "";
        $caminhoComprovante = null;
        $sanitizedRefundReceipts = [];
        $storedRefundReceiptPaths = [];

        if ($acao === 'PROCESSAR_REEMBOLSO') {
            $validated = $request->validate([
                'motivo' => ['required', 'string', 'max:2000'],
                'refund_method' => ['required', Rule::in(['TRANSFERENCIA', 'CASHBACK'])],
                'comprovantes' => ['required', 'array', 'min:1', 'max:2'],
                'comprovantes.*' => ['required', 'image', 'mimes:jpeg,jpg,png', 'max:5120'],
            ]);

            $sanitizedRefundReceipts = collect($validated['comprovantes'])
                ->map(fn ($file) => $this->refundReceipts->sanitize($file))
                ->all();
        }

        if ($request->hasFile('arquivo')) {
            if ($acao === 'PAGAR' || $acao === 'ENTREGAR') {
                $tipoDocumento = $acao === 'PAGAR' ? 'payment' : 'delivery';
                $caminhoComprovante = $this->orderDocuments->store(
                    $order,
                    $request->file('arquivo'),
                    $tipoDocumento,
                );
            }
        }

        switch ($acao) {
            case 'PAGAR':
                $request->validate(['motivo' => 'required|string']);
                if ($caminhoComprovante !== null) {
                    $order->payment_receipt = $caminhoComprovante;
                }
                $msg = "Pagamento Aprovado Manualmente. Motivo/Parecer: {$motivo}";
                break;

            // 🟢 NOVO FLUXO: Operador finalizou a separação dos itens físicos
            case 'SEPARAR':
                $msg = "Itens separados e conferidos no estoque. Aguardando configuração de expedição." . ($motivo ? " Obs: {$motivo}" : "");
                break;

            // 🟢 FLUXO EXPEDIÇÃO: Gera a Etiqueta e passa para DESPACHADO
            case 'DESPACHAR':
                $dispatchType = $request->input('dispatch_type');
                $trackingCode = $request->input('tracking_code');

                if ($dispatchType === 'MANUAL') {
                    $request->validate(['carrier_id' => 'required'], [
                        'carrier_id.required' => 'Selecione a transportadora manual.'
                    ]);
                    $order->carrier_id = $request->input('carrier_id');
                    $tipoEnvio = "Parceria Própria";

                } elseif ($dispatchType === 'MELHORENVIO') {
                    $request->validate(['me_carrier_id' => 'required'], [
                        'me_carrier_id.required' => 'Selecione o serviço do Melhor Envio.'
                    ]);

                    $meConfig = \App\Models\MelhorEnvioSetting::first();
                    if (!$meConfig || !$meConfig->access_token || empty($meConfig->sender_info)) {
                        return response()->json(['status' => 'error', 'code' => 'REQUEST_FAILED', 'message' => 'Melhor Envio não autenticado ou Remetente não configurado.'], 400);
                    }

                    $remetente = $meConfig->sender_info;
                    $destinatario = $order->address;
                    
                    $produtosApi = $order->items->map(function($item) {
                        return [
                            'name' => $item->product_name,
                            'quantity' => $item->quantity,
                            'unitary_value' => (float) $item->price
                        ];
                    })->toArray();

                    $options = [
                        'insurance_value' => (float) $request->input('me_insurance_value', $order->total),
                        'receipt' => false,
                        'own_hand' => false,
                    ];

                    if ($docTipo === 'DECLARACAO') {
                        $options['non_commercial'] = true;
                    } else {
                        $options['non_commercial'] = false;
                    }

                    $payloadEnvio = [
                        'service' => (int) $request->input('me_carrier_id'),
                        'agency' => null,
                        'from' => [
                            'name' => $remetente['nome'],
                            'phone' => preg_replace('/\D/', '', $remetente['telefone'] ?? ''),
                            'email' => $remetente['email'],
                            'document' => preg_replace('/\D/', '', $remetente['documento']),
                            'address' => $remetente['rua'],
                            'complement' => $remetente['complemento'] ?? '',
                            'number' => $remetente['numero'],
                            'district' => $remetente['bairro'],
                            'city' => $remetente['cidade'],
                            'state_abbr' => $remetente['uf'],
                            'postal_code' => preg_replace('/\D/', '', $remetente['cep'])
                        ],
                        'to' => [
                            'name' => $order->user ? $order->user->name : 'Cliente',
                            'phone' => preg_replace('/\D/', '', $order->user->telefone ?? '11999999999'),
                            'email' => $order->user ? $order->user->email : 'cliente@email.com',
                            'document' => preg_replace('/\D/', '', $order->user->cpf ?? '00000000000'),
                            'address' => $destinatario->rua,
                            'complement' => $destinatario->complemento ?? '',
                            'number' => $destinatario->num,
                            'district' => $destinatario->bairro,
                            'city' => $destinatario->cidade,
                            'state_abbr' => $destinatario->uf,
                            'postal_code' => preg_replace('/\D/', '', $destinatario->cep)
                        ],
                        'products' => $produtosApi,
                        'volumes' => [
                            [
                                'height' => (float) $request->input('vol_altura'),
                                'width' => (float) $request->input('vol_largura'),
                                'length' => (float) $request->input('vol_comprimento'),
                                'weight' => (float) $request->input('vol_peso')
                            ]
                        ],
                        'options' => $options
                    ];

                    // SANDBOX ATIVO (Para adicionar ao carrinho de testes)
                    $isSandbox = true; 
                    $baseUrl = $isSandbox ? 'https://sandbox.melhorenvio.com.br' : 'https://www.melhorenvio.com.br';

                    $response = Http::withToken($meConfig->access_token)
                        ->withHeaders(['Accept' => 'application/json', 'User-Agent' => 'HUB Commerce (suporte@hubcommerce.com)'])
                        ->post($baseUrl . '/api/v2/me/cart', $payloadEnvio);

                    if (! $response->successful()) {
                        $isClientError = $response->clientError();

                        Log::warning('Melhor Envio recusou a geração de etiqueta.', [
                            'tenant_id' => $order->tenant_id,
                            'order_id' => $order->getKey(),
                            'provider_status' => $response->status(),
                        ]);

                        return response()->json([
                            'status' => 'error',
                            'code' => $isClientError
                                ? 'SHIPPING_PROVIDER_REJECTED'
                                : 'SHIPPING_PROVIDER_UNAVAILABLE',
                            'message' => $isClientError
                                ? 'Não foi possível gerar a etiqueta com os dados informados. Revise o envio e tente novamente.'
                                : 'Não foi possível gerar a etiqueta no momento. Tente novamente mais tarde.',
                        ], $isClientError ? 422 : 502);
                    }

                    $respostaApi = $response->json();
                    
                    $order->carrier_id = null; 
                    $trackingCode = $respostaApi['id'] ?? 'Aguardando Geração';
                    $tipoEnvio = "Melhor Envio (Serviço: " . $request->input('me_carrier_id') . ")";
                }

                $order->tracking_code = $trackingCode;
                
                $textoRastreio = $trackingCode ? "Rastreio/Protocolo: {$trackingCode}" : "Aguardando geração de etiqueta.";
                $msg = "Pedido Despachado via {$tipoEnvio}. {$textoRastreio}";
                break;

            case 'ENTREGAR':
                $request->validate(['arquivo' => 'required|file']);
                $order->delivery_receipt = $caminhoComprovante;
                $msg = "Entrega Confirmada. Comprovante de entrega anexado aos arquivos da ordem.";
                break;

            case 'CANCELAR':
                $request->validate(['motivo' => 'required|string']);
                $order->cancel_reason = $motivo;
                $msg = "Pedido Cancelado pelo Gestor. Motivo: {$motivo}";
                break;

            case 'INICIAR_REEMBOLSO':
                $request->validate(['motivo' => 'required|string|max:2000']);
                $order->refund_reason = $motivo;
                $msg = "Análise de Devolução/Reembolso Iniciada. Parecer: {$motivo}";
                break;

            case 'PROCESSAR_REEMBOLSO':
                $order->refund_reason = $motivo;
                $order->refund_method = $refundMethod;

                $textoMetodo = $refundMethod === 'CASHBACK'
                    ? 'Crédito em cashback'
                    : 'Transferência ou estorno manual';
                $msg = "Reembolso confirmado via {$textoMetodo}. Valor: R$ "
                    . number_format($order->total, 2, ',', '.')
                    . ". Motivo: {$motivo}. Comprovante(s) anexado(s).";
                break;

            default:
                return response()->json(['status' => 'error', 'code' => 'REQUEST_FAILED', 'message' => 'Ação inválida não reconhecida.'], 400);
        }

        $afterLock = null;

        if ($acao === 'INICIAR_REEMBOLSO') {
            $afterLock = function (Order $lockedOrder): void {
                $current = $lockedOrder->status instanceof OrderStatus
                    ? $lockedOrder->status
                    : OrderStatus::from((string) $lockedOrder->getRawOriginal('status'));

                $lockedOrder->refund_requested_from_status = $current->value;
            };
        }

        if ($acao === 'PROCESSAR_REEMBOLSO') {
            $afterLock = function (Order $lockedOrder) use ($motivo, $refundMethod, $sanitizedRefundReceipts, &$storedRefundReceiptPaths): void {
                $storedRefundReceiptPaths = collect($sanitizedRefundReceipts)
                    ->map(fn (array $receipt) => $this->refundReceipts->store($lockedOrder, $receipt))
                    ->all();
                $lockedOrder->refund_receipts = $storedRefundReceiptPaths;

                if ($refundMethod === 'CASHBACK' && $lockedOrder->user_id) {
                    $cliente = User::query()
                        ->whereKey($lockedOrder->user_id)
                        ->lockForUpdate()
                        ->first();

                    if ($cliente) {
                        $cliente->cashback = ($cliente->cashback ?? 0) + $lockedOrder->total;
                        $cliente->save();

                        WalletTransaction::query()->create([
                            'user_id' => $cliente->getKey(),
                            'tipo' => 'entrada',
                            'valor' => $lockedOrder->total,
                            'descricao' => "Reembolso do pedido HUB-{$lockedOrder->id} convertido em cashback. Motivo: {$motivo}",
                        ]);
                    }
                }

                foreach ($lockedOrder->applied_coupons ?? [] as $coupon) {
                    $code = $coupon['nome'] ?? $coupon['codigo'] ?? null;

                    if (! $code || ! class_exists('\App\Models\Cupom')) {
                        continue;
                    }

                    $couponModel = \App\Models\Cupom::query()
                        ->where('codigo', $code)
                        ->lockForUpdate()
                        ->first();

                    if ($couponModel && $couponModel->vezes_usado > 0) {
                        $couponModel->decrement('vezes_usado');
                    }
                }
            };
        }

        try {
            $this->statusTransitions->transition($order, $targetStatus, $msg, $afterLock);
        } catch (\Throwable $exception) {
            $this->refundReceipts->delete($storedRefundReceiptPaths);

            throw $exception;
        }

        return response()->json(['status' => 'success', 'message' => 'Operação processada e auditada com sucesso.']);
    }

    // 🟢 GERAÇÃO DE DOCUMENTOS (NFe / Declaração de Conteúdo)
    public function previewDoc(Request $request, $id)
    {
        /** @var \App\Models\Order $order */
        $order = Order::with(['user', 'items', 'address'])->findOrFail($id);
        $tipo = $request->query('tipo', 'DECLARACAO');
        
        $remetente = \App\Models\MelhorEnvioSetting::first()->sender_info ?? [
            'nome' => 'Sua Loja', 'rua' => 'Rua Exemplo', 'numero' => '123', 'bairro' => 'Centro', 'cidade' => 'Sua Cidade', 'uf' => 'SP', 'cep' => '00000-000', 'documento' => '000.000.000-00'
        ];

        // 🟢 PREPARA AS LINHAS DA TABELA ANTES (Resolve o erro do Editor e limpa o código)
        $linhasTabela = '';
        foreach ($order->items as $item) {
            $variacao = $item->variation_name ?: '-';
            $precoUnitario = number_format($item->price, 2, ',', '.');
            $precoTotal = number_format($item->price * $item->quantity, 2, ',', '.');

            $linhasTabela .= '
                <tr>
                    <td>' . $item->product_name . '</td>
                    <td>' . $variacao . '</td>
                    <td style="text-align:center;">' . $item->quantity . '</td>
                    <td>R$ ' . $precoUnitario . '</td>
                    <td>R$ ' . $precoTotal . '</td>
                </tr>';
        }

        return response()->make('
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Documento Auxiliar - Pedido #'.$order->id.'</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; margin: 0; color: #000; font-size: 12px; }
                    .page { max-width: 800px; margin: 0 auto; border: 1px solid #000; padding: 20px; }
                    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                    .header h1 { margin: 0; font-size: 18px; text-transform: uppercase; }
                    .flex { display: flex; justify-content: space-between; margin-bottom: 20px; }
                    .box { width: 48%; border: 1px solid #000; padding: 10px; }
                    .box h3 { margin-top: 0; border-bottom: 1px solid #ccc; padding-bottom: 5px; font-size: 12px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                    th { background-color: #f0f0f0; }
                    .footer { text-align: justify; font-size: 10px; margin-top: 30px; border-top: 1px solid #000; padding-top: 10px; }
                    .signature { margin-top: 50px; text-align: center; }
                    .signature span { border-top: 1px solid #000; padding: 5px 40px; display: inline-block; }
                    @media print { body { padding: 0; } .no-print { display: none; } }
                </style>
            </head>
            <body>
                <div style="text-align: right; margin-bottom: 10px;" class="no-print">
                    <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: #fff; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Imprimir Documento</button>
                </div>
                <div class="page">
                    <div class="header">
                        <h1>' . ($tipo === 'NFE' ? 'Recibo Provisório / Espelho de Nota Fiscal' : 'Declaração de Conteúdo') . '</h1>
                        <p>Pedido #HUB-'.$order->id.' | Data: '.$order->created_at->format('d/m/Y H:i').'</p>
                    </div>
                    
                    <div class="flex">
                        <div class="box">
                            <h3>REMETENTE</h3>
                            <strong>Nome:</strong> '.$remetente['nome'].'<br>
                            <strong>Endereço:</strong> '.$remetente['rua'].', '.$remetente['numero'].'<br>
                            <strong>Bairro:</strong> '.$remetente['bairro'].' - '.$remetente['cidade'].'/'.$remetente['uf'].'<br>
                            <strong>CEP:</strong> '.$remetente['cep'].'<br>
                            <strong>CPF/CNPJ:</strong> '.$remetente['documento'].'
                        </div>
                        <div class="box">
                            <h3>DESTINATÁRIO</h3>
                            <strong>Nome:</strong> '.($order->user->name ?? 'Cliente').'<br>
                            <strong>Endereço:</strong> '.$order->address->rua.', '.$order->address->num.' '.($order->address->complemento ?? '').'<br>
                            <strong>Bairro:</strong> '.$order->address->bairro.' - '.$order->address->cidade.'/'.$order->address->uf.'<br>
                            <strong>CEP:</strong> '.$order->address->cep.'<br>
                            <strong>CPF/CNPJ:</strong> '.($order->user->cpf ?? 'Não informado').'
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Descrição / Variação</th>
                                <th>Qtd</th>
                                <th>Valor Unitário</th>
                                <th>Valor Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ' . $linhasTabela . '
                        </tbody>
                    </table>

                    <div style="text-align: right; margin-bottom: 20px;">
                        <strong>TOTAL DECLARADO: R$ '.number_format($order->total, 2, ',', '.').'</strong>
                    </div>

                    <div class="footer">
                        <p>Declaro que não estou postando material inflamável, corrosivo, explosivo ou perigoso, nem qualquer outro item proibido pela legislação vigente.</p>
                    </div>

                    <div class="signature">
                        <span>Assinatura do Remetente</span>
                        <p>___________________, _____ de ________________ de ______</p>
                    </div>
                </div>
            </body>
            </html>
        ', 200, ['Content-Type' => 'text/html']);
    }
    // 🟢 CANCELAR ETIQUETA NO CARRINHO DO MELHOR ENVIO
    public function cancelMelhorEnvioCart($id) 
    {
        $order = Order::findOrFail($id);
        $this->statusTransitions->assertCanTransition($order, OrderStatus::READY_TO_SHIP);
        
        // Verifica se é um UUID de carrinho (tamanho maior que 20)
        if (strlen($order->tracking_code) > 20) {
            $meConfig = \App\Models\MelhorEnvioSetting::first();
            
            if ($meConfig && $meConfig->access_token) {
                $isSandbox = true; // Mude para false quando for para Produção
                $baseUrl = $isSandbox ? 'https://sandbox.melhorenvio.com.br' : 'https://www.melhorenvio.com.br';
                
                // Envia requisição DELETE para a API do Melhor Envio
                \Illuminate\Support\Facades\Http::withToken($meConfig->access_token)
                    ->delete($baseUrl . '/api/v2/me/cart/' . $order->tracking_code);
            }
        }
        
        // Limpa os dados de logística do pedido para permitir nova configuração
        $order->tracking_code = null;
        $order->carrier_id = null;

        $this->statusTransitions->transition(
            $order,
            OrderStatus::READY_TO_SHIP,
            'Etiqueta removida do carrinho do Melhor Envio. Transporte reaberto para nova configuração.',
        );
        
        return response()->json(['status' => 'success', 'message' => 'Etiqueta removida do carrinho com sucesso.']);
    }
}