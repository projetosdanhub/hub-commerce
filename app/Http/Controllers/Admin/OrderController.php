<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\VipLevel;
use App\Services\OrderStatusTransitionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderStatusTransitionService $statusTransitions,
    ) {
    }

    private function getRank($ltv, $compras) {
        $niveis = VipLevel::orderBy('gasto_requisito', 'desc')->get();
        foreach ($niveis as $nivel) {
            if ($ltv >= $nivel->gasto_requisito && $compras >= $nivel->compras_requisito) { return $nivel->nome; }
        }
        $padrao = VipLevel::where('is_default', true)->first();
        return $padrao ? $padrao->nome : 'Iniciante';
    }

    public function index()
    {
        /** @var \Illuminate\Database\Eloquent\Collection $orders */
        $orders = Order::with(['user', 'items', 'address', 'carrier', 'history' => function($q) {
            $q->orderBy('created_at', 'desc');
        }])->orderBy('id', 'desc')->get();

        $formatted = $orders->map(function ($order) {
            $status = $order->status instanceof OrderStatus
                ? $order->status
                : OrderStatus::from((string) $order->getRawOriginal('status'));

            // Ignora CANCELADO e REEMBOLSADO para não inflar as métricas do CRM
            $historicoCliente = Order::where('user_id', $order->user_id)
                                     ->whereNotIn('status', [
                                         OrderStatus::CANCELLED->value,
                                         OrderStatus::REFUNDED->value,
                                     ]);
            
            $ltv = (float) $historicoCliente->sum('total');
            
            return [
                'id' => $order->id,
                'status' => $status->value,
                'data' => $order->created_at->format('d/m/Y'),
                'hora' => $order->created_at->format('H:i'),
                'data_raw' => $order->created_at->format('Y-m-d\TH:i:s'), 
                
                // MAPA FINANCEIRO ESTRITO
                'subtotal' => (float) $order->subtotal,
                'frete_valor' => (float) $order->frete,
                'desconto' => (float) $order->desconto,
                'total' => (float) $order->total,

                'desconto_loja' => (float) $order->desconto, 
                'desconto_vip_produtos' => 0, 
                'desconto_vip_frete' => 0, 
                'desconto_frete' => 0,

                // LOGÍSTICA E RASTREIO
                'tracking_code' => $order->tracking_code,
                // Puxa o nome real da transportadora do banco ou exibe status default
                'carrier' => $order->carrier ? $order->carrier->nome : 'Aguardando Despacho', 
                
                // DETALHES DE CANCELAMENTO / REEMBOLSO E COMPROVANTES
                'motivo_cancelamento' => $order->cancel_reason,
                'comprovante_reembolso' => $order->refund_receipt ? asset('storage/' . $order->refund_receipt) : null,
                'comprovante_pagamento' => $order->payment_receipt ? asset('storage/' . $order->payment_receipt) : null,
                'comprovante_entrega' => $order->delivery_receipt ? asset('storage/' . $order->delivery_receipt) : null,
                'metodo_reembolso' => $order->refund_method ?? 'Estorno/Transferência',
                'coupons' => is_string($order->applied_coupons) ? json_decode($order->applied_coupons, true) : ($order->applied_coupons ?? []),
                
                // PAGAMENTO VIA
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
                
                // CLIENTE
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
                    'cupons_usados' => $historicoCliente->whereNotNull('applied_coupons')->count(),
                    'rank' => $this->getRank($ltv, $historicoCliente->count())
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

        // CÁLCULO DAS MÉTRICAS DE PIX
        $pixTotal = $orders->filter(function($q){ return stripos($q->payment_method ?? '', 'pix') !== false; })->count();
        $pixPagos = $orders->filter(function ($order) {
            return stripos($order->payment_method ?? '', 'pix') !== false
                && $order->status instanceof OrderStatus
                && $order->status->isPaid();
        })->count();
        $conversaoPix = $pixTotal > 0 ? round(($pixPagos / $pixTotal) * 100, 1) : 0;
        
        return response()->json([
            'status' => 'success', 
            'data' => $formatted,
            'metrics' => [
                'conversao_pix' => $conversaoPix,
                'total_pix_gerados' => $pixTotal
            ]
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
                'REEMBOLSADO',
            ])],
            'motivo' => ['required', 'string'],
            'comprovante' => [
                Rule::requiredIf($request->input('tipo') === 'REEMBOLSADO'),
                'file',
                'mimes:jpeg,png,jpg,pdf',
                'max:5120',
            ],
        ]);

        $order = Order::findOrFail($id);
        $target = match ($validated['tipo']) {
            'REEMBOLSADO' => OrderStatus::REFUNDED,
            'SOLICITACAO_REEMBOLSO' => OrderStatus::REFUND_REVIEW,
            default => OrderStatus::CANCELLED,
        };

        $this->statusTransitions->assertCanTransition($order, $target);

        if ($target === OrderStatus::REFUNDED) {
            $order->refund_receipt = $request->file('comprovante')->store('reembolsos', 'public');
            $message = "Reembolso Aprovado. Motivo: {$validated['motivo']}";
        } elseif ($target === OrderStatus::REFUND_REVIEW) {
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
                $request->validate([
                    'motivo' => 'required|string', 
                    'arquivo' => 'required|file'
                ]);
                
                $order->cancel_reason = $motivo;
                $order->refund_receipt = $caminhoComprovante;
                $order->refund_method = $refundMethod; 
                
                $textoMetodo = $refundMethod === 'CASHBACK' ? 'Crédito em Loja (Cashback)' : 'Estorno/Transferência Bancária';
                $msg = "Reembolso Efetivado via {$textoMetodo}. Valor: R$ " . number_format($order->total, 2, ',', '.') . ". Parecer final: {$motivo}. Comprovante anexado.";
                
                if ($refundMethod === 'CASHBACK' && $order->user) {
                    $cliente = $order->user;
                    $cliente->cashback = ($cliente->cashback ?? 0) + $order->total;
                    $cliente->save();

                    \App\Models\WalletTransaction::create([
                        'user_id'   => $cliente->id,
                        'tipo'      => 'entrada',
                        'valor'     => $order->total,
                        'descricao' => "Estorno do Pedido #HUB-{$order->id} revertido em saldo Cashback. Parecer: {$motivo}"
                    ]);
                }

                if (!empty($order->applied_coupons)) {
                    $cuponsUsados = is_string($order->applied_coupons) ? json_decode($order->applied_coupons, true) : $order->applied_coupons;
                    if (is_array($cuponsUsados)) {
                        foreach ($cuponsUsados as $cupomAplicado) {
                            $nomeCupom = $cupomAplicado['nome'] ?? $cupomAplicado['codigo'] ?? null;
                            if ($nomeCupom && class_exists('\App\Models\Cupom')) {
                                $cupomBd = \App\Models\Cupom::where('codigo', $nomeCupom)->first();
                                if ($cupomBd && $cupomBd->vezes_usado > 0) {
                                    $cupomBd->vezes_usado -= 1;
                                    $cupomBd->save();
                                }
                            }
                        }
                    }
                }
                break;

            default:
                return response()->json(['status' => 'error', 'code' => 'REQUEST_FAILED', 'message' => 'Ação inválida não reconhecida.'], 400);
        }

        $this->statusTransitions->transition($order, $targetStatus, $msg);

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