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
use App\Services\OrderStatusTransitionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderStatusTransitionService $statusTransitions,
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
                    'url' => route('admin.orders.refund-receipts.show', [
                        'id' => $order->getKey(),
                        'receiptIndex' => $index,
                    ]),
                ])
                ->all();

            $documents = collect([
                $order->payment_receipt ? [
                    'id' => 'payment-receipt',
                    'name' => 'Comprovante de pagamento',
                    'kind' => $this->documentKind($order->payment_receipt),
                    'url' => route('admin.orders.documents.show', ['id' => $order->getKey(), 'type' => 'payment']),
                ] : null,
                $order->delivery_receipt ? [
                    'id' => 'delivery-receipt',
                    'name' => 'Comprovante de entrega',
                    'kind' => $this->documentKind($order->delivery_receipt),
                    'url' => route('admin.orders.documents.show', ['id' => $order->getKey(), 'type' => 'delivery']),
                ] : null,
                $order->refund_receipt ? [
                    'id' => 'legacy-refund-receipt',
                    'name' => 'Comprovante de reembolso',
                    'kind' => $this->documentKind($order->refund_receipt),
                    'url' => route('admin.orders.documents.show', ['id' => $order->getKey(), 'type' => 'refund']),
                ] : null,
                $order->romaneio_url ? [
                    'id' => 'delivery-manifest',
                    'name' => 'Romaneio de entrega',
                    'kind' => $this->documentKind($order->romaneio_url),
                    'url' => route('admin.orders.documents.show', ['id' => $order->getKey(), 'type' => 'manifest']),
                ] : null,
            ])->filter()->merge($refundReceipts)->values()->all();

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

                // Pedidos antigos guardam apenas o desconto agregado. Não atribua
                // artificialmente esse valor a loja, VIP, cupom ou frete.
                'desconto_loja' => null,
                'desconto_vip_produtos' => null,
                'desconto_vip_frete' => null,
                'desconto_frete' => null,
                'financeiro' => [
                    'subtotal' => (float) $order->subtotal,
                    'frete' => (float) $order->frete,
                    'total_bruto' => (float) $order->subtotal + (float) $order->frete,
                    'total_liquido' => (float) $order->total,
                    'desconto_total' => (float) $order->desconto,
                    'detalhamento_disponivel' => false,
                    'descontos' => (float) $order->desconto > 0 ? [[
                        'tipo' => 'Desconto registrado no pedido',
                        'valor' => (float) $order->desconto,
                    ]] : [],
                ],

                'tracking_code' => $order->tracking_code,
                'carrier' => $order->carrier ? $order->carrier->nome : 'Aguardando Despacho', 
                
                'motivo_cancelamento' => $order->cancel_reason,
                'comprovante_reembolso' => $order->refund_receipt
                    ? route('admin.orders.documents.show', ['id' => $order->getKey(), 'type' => 'refund'])
                    : null,
                'comprovantes_reembolso' => $refundReceipts,
                'comprovante_pagamento' => $order->payment_receipt
                    ? route('admin.orders.documents.show', ['id' => $order->getKey(), 'type' => 'payment'])
                    : null,
                'comprovante_entrega' => $order->delivery_receipt
                    ? route('admin.orders.documents.show', ['id' => $order->getKey(), 'type' => 'delivery'])
                    : null,
                'documentos' => $documents,
                'metodo_reembolso' => $order->refund_method,
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

    public function refundReceipt($id, int $receiptIndex)
    {
        $order = Order::findOrFail($id);
        $receipts = array_values(array_filter($order->refund_receipts ?? []));
        $path = $receipts[$receiptIndex] ?? null;

        abort_unless($path && Storage::disk('local')->exists($path), 404);

        return Storage::disk('local')->response(
            $path,
            'comprovante-reembolso-'.($receiptIndex + 1),
            ['Content-Disposition' => 'inline'],
        );
    }

    public function orderDocument(Request $request, $id, string $type)
    {
        $order = Order::findOrFail($id);

        [$disk, $path, $name] = match ($type) {
            'payment' => ['public', $order->payment_receipt, 'comprovante-pagamento'],
            'delivery' => ['public', $order->delivery_receipt, 'comprovante-entrega'],
            'refund' => ['public', $order->refund_receipt, 'comprovante-reembolso'],
            'manifest' => ['local', $order->romaneio_url, 'romaneio-entrega'],
            default => abort(404),
        };

        abort_unless(is_string($path) && $path !== '' && Storage::disk($disk)->exists($path), 404);

        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        $downloadName = $name.($extension !== '' ? '.'.$extension : '');
        $disposition = $request->boolean('download') ? 'attachment' : 'inline';

        return Storage::disk($disk)->response($path, $downloadName, [
            'Content-Disposition' => $disposition.'; filename="'.$downloadName.'"',
            'Cache-Control' => 'private, no-store',
            'X-Content-Type-Options' => 'nosniff',
        ]);
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
            'tipo' => ['required', Rule::in([
                'CANCELADO',
                'SOLICITACAO_REEMBOLSO',
            ])],
            'motivo' => ['required', 'string', 'max:1000'],
        ]);

        $order = Order::findOrFail($id);
        $target = match ($validated['tipo']) {
            'SOLICITACAO_REEMBOLSO' => OrderStatus::REFUND_REVIEW,
            default => OrderStatus::CANCELLED,
        };

        $this->statusTransitions->assertCanTransition($order, $target);

        if ($target === OrderStatus::REFUND_REVIEW) {
            $message = "Análise de Reembolso Iniciada. Motivo: {$validated['motivo']}";
        } else {
            $message = "Pedido Cancelado. Motivo: {$validated['motivo']}";
        }

        $order->cancel_reason = $validated['motivo'];
        $this->statusTransitions->transition($order, $target, $message);

        return response()->json(['status' => 'success', 'message' => 'Fluxo processado com sucesso.']);
    }

    // =========================================================================
    // 🟢 MÁQUINA DE ESTADOS UNIFICADA: AÇÕES MANUAIS COM COMPROVANTES E ESTORNO
    // =========================================================================
    public function updateStatusManual(Request $request, $id) 
    {
        $order = Order::findOrFail($id);
        $acao = $request->input('acao');

        if ($acao === 'CANCELAR_REEMBOLSO') {
            $validated = $request->validate(['motivo' => ['required', 'string', 'max:1000']]);
            $this->statusTransitions->cancelRefund(
                $order,
                'Solicitação de reembolso cancelada. Motivo: '.$validated['motivo'],
            );

            return response()->json(['status' => 'success', 'message' => 'Solicitação de reembolso cancelada e etapa anterior restaurada.']);
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
        $refundReceiptPaths = [];

        if ($acao === 'PROCESSAR_REEMBOLSO') {
            $request->validate([
                'motivo' => ['required', 'string'],
                'refund_method' => ['required', Rule::in(['TRANSFERENCIA', 'CASHBACK'])],
                'comprovantes' => ['required', 'array', 'min:1', 'max:2'],
                'comprovantes.*' => ['required', 'file', 'image', 'mimes:jpeg,png,jpg', 'max:5120', 'dimensions:max_width=8000,max_height=8000'],
            ]);

            $refundReceiptPaths = collect($request->file('comprovantes', []))
                ->map(fn ($file) => $file->store('orders/'.$order->getKey().'/refunds', 'local'))
                ->all();
        }

        if ($request->hasFile('arquivo')) {
            $request->validate(['arquivo' => 'file|mimes:jpeg,png,jpg,pdf|max:5120']);
            if ($acao === 'ENTREGAR') {
                $pasta = 'comprovantes_entrega';
            } elseif ($acao === 'PAGAR') {
                $pasta = 'comprovantes_pagamento';
            } else {
                $pasta = 'reembolsos';
            }
            $caminhoComprovante = $request->file('arquivo')->store($pasta, 'public');
        }

        switch ($acao) {
            case 'PAGAR':
                $request->validate(['motivo' => 'required|string']);
                $order->payment_receipt = $caminhoComprovante; // <-- SALVA O COMPROVANTE AQUI
                $msg = "Pagamento Aprovado Manualmente. Motivo/Parecer: {$motivo}";
                break;

            // 🟢 NOVO FLUXO: Operador finalizou a separação dos itens físicos
            case 'SEPARAR':
                $msg = "Itens separados e conferidos no estoque. Aguardando configuração de expedição." . ($motivo ? " Obs: {$motivo}" : "");
                break;

            // 🟢 FLUXO EXPEDIÇÃO: Gera a Etiqueta e passa para DESPACHADO
            case 'DESPACHAR':
                $dispatchData = $request->validate([
                    'dispatch_type' => ['required', Rule::in(['MANUAL', 'MELHORENVIO'])],
                    'doc_tipo' => ['required', Rule::in(['DECLARACAO', 'NFE'])],
                ]);
                $dispatchType = $dispatchData['dispatch_type'];
                $trackingCode = $request->input('tracking_code');

                if ($dispatchData['doc_tipo'] === 'NFE') {
                    return response()->json([
                        'status' => 'error',
                        'code' => 'FISCAL_CONFIGURATION_REQUIRED',
                        'message' => 'A NF-e ainda não está habilitada: configure certificado A1, emitente e provedor fiscal antes da expedição.',
                    ], 422);
                }

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

                    if (! $order->user || ! $destinatario
                        || ! $order->user->name || ! $order->user->email
                        || ! $order->user->telefone || ! $order->user->cpf) {
                        return response()->json([
                            'status' => 'error',
                            'code' => 'ORDER_RECIPIENT_INCOMPLETE',
                            'message' => 'Complete nome, e-mail, telefone, CPF/CNPJ e endereço do destinatário antes de gerar a etiqueta.',
                        ], 422);
                    }
                    
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
                            'name' => $order->user->name,
                            'phone' => preg_replace('/\D/', '', $order->user->telefone),
                            'email' => $order->user->email,
                            'document' => preg_replace('/\D/', '', $order->user->cpf),
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
                $order->delivery_receipt = $caminhoComprovante; // <-- SALVA O COMPROVANTE AQUI
                $msg = "Entrega Confirmada. Comprovante de entrega anexado aos arquivos da ordem.";
                break;

            case 'CANCELAR':
                $request->validate(['motivo' => 'required|string']);
                $order->cancel_reason = $motivo;
                $msg = "Pedido Cancelado pelo Gestor. Motivo: {$motivo}";
                break;

            case 'INICIAR_REEMBOLSO':
                $request->validate(['motivo' => 'required|string']);
                $order->cancel_reason = $motivo;
                $msg = "Análise de Devolução/Reembolso Iniciada. Parecer: {$motivo}";
                break;

            case 'PROCESSAR_REEMBOLSO':
                $order->cancel_reason = $motivo;
                $order->refund_receipts = $refundReceiptPaths;
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

        if ($acao === 'PROCESSAR_REEMBOLSO') {
            $afterLock = function (Order $lockedOrder) use ($motivo, $refundMethod): void {
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

        $this->statusTransitions->transition($order, $targetStatus, $msg, $afterLock);

        return response()->json(['status' => 'success', 'message' => 'Operação processada e auditada com sucesso.']);
    }

    // 🟢 GERAÇÃO DE DOCUMENTOS (NFe / Declaração de Conteúdo)
    public function previewDoc(Request $request, $id)
    {
        /** @var \App\Models\Order $order */
        $order = Order::with(['user', 'items', 'address'])->findOrFail($id);
        $tipo = $request->validate([
            'tipo' => ['nullable', Rule::in(['DECLARACAO', 'NFE'])],
        ])['tipo'] ?? 'DECLARACAO';

        if ($tipo === 'NFE') {
            return response()->json([
                'status' => 'error',
                'code' => 'FISCAL_CONFIGURATION_REQUIRED',
                'message' => 'A NF-e só pode ser emitida após configurar certificado A1 válido e provedor fiscal. Nenhum espelho fiscal foi gerado.',
            ], 422);
        }

        $shippingSettings = \App\Models\MelhorEnvioSetting::query()->first();
        $remetente = $shippingSettings?->sender_info;
        $requiredSenderFields = ['nome', 'rua', 'numero', 'bairro', 'cidade', 'uf', 'cep', 'documento'];

        if (! is_array($remetente) || collect($requiredSenderFields)->contains(
            fn (string $field): bool => ! isset($remetente[$field]) || trim((string) $remetente[$field]) === '',
        )) {
            return response()->json([
                'status' => 'error',
                'code' => 'SENDER_CONFIGURATION_REQUIRED',
                'message' => 'Complete os dados reais do remetente nas configurações de envio antes de gerar a declaração.',
            ], 422);
        }

        abort_unless($order->user && $order->address, 422, 'O pedido não possui cliente e endereço completos para gerar a declaração.');

        return response()->view('documents.order-declaration', compact('order', 'remetente'));
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
