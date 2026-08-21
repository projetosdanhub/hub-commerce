<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderHistory;
use App\Models\VipLevel;

class OrderController extends Controller
{
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
        // 🟢 ADICIONADO: Relacionamento 'carrier' para puxar o nome da transportadora oficial do banco
        $orders = Order::with(['user', 'items', 'address', 'carrier', 'history' => function($q) {
            $q->orderBy('created_at', 'desc');
        }])->orderBy('id', 'desc')->get();

        $formatted = $orders->map(function ($order) {
            // 🟢 CORREÇÃO: Ignora CANCELADO e REEMBOLSADO para não inflar as métricas do CRM
            $historicoCliente = Order::where('user_id', $order->user_id)
                                     ->whereNotIn('status', ['CANCELADO', 'REEMBOLSADO']);
            
            $ltv = (float) $historicoCliente->sum('total');
            
            return [
                'id' => $order->id,
                'status' => $order->status,
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
                // 🟢 Puxa o nome real da transportadora do banco ou exibe status default
                'carrier' => $order->carrier ? $order->carrier->nome : 'Aguardando Despacho', 
                
                // DETALHES DE CANCELAMENTO / REEMBOLSO
                'motivo_cancelamento' => $order->cancel_reason,
                'comprovante_reembolso' => $order->refund_receipt ? asset('storage/' . $order->refund_receipt) : null,
                'metodo_reembolso' => $order->refund_method ?? 'Estorno/Transferência',
                
                'coupons' => $order->applied_coupons ?? [],
                
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
                    'isPago' => !in_array($order->status, ['A_PAGAR', 'CANCELADO'])
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
        $pixTotal = $orders->filter(function($q){ return stripos($q->payment_method, 'pix') !== false; })->count();
        $pixPagos = $orders->filter(function($q){ return stripos($q->payment_method, 'pix') !== false; })->whereNotIn('status', ['A_PAGAR', 'CANCELADO'])->count();
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

    public function updateStatus(Request $request, $id) {
        $order = Order::findOrFail($id);
        $order->status = $request->status;
        $order->save();
        OrderHistory::create(['order_id' => $order->id, 'event' => "Status atualizado para: " . str_replace('_', ' ', $request->status)]);
        return response()->json(['status' => 'success', 'message' => 'Status do pedido atualizado.']);
    }

    public function dispatchOrder(Request $request, $id) {
        $order = Order::findOrFail($id);
        $order->status = 'DESPACHADO';
        $order->tracking_code = $request->rastreio;
        $order->save();
        $textoRastreio = $request->rastreio ? "Código de Rastreio: {$request->rastreio}" : "Enviado sem código de rastreio.";
        OrderHistory::create(['order_id' => $order->id, 'event' => "Pedido Despachado para a transportadora. {$textoRastreio}"]);
        return response()->json(['status' => 'success', 'message' => 'Pedido marcado como despachado.']);
    }

    public function cancelOrder(Request $request, $id) {
        $request->validate(['tipo' => 'required|string', 'motivo' => 'required|string']);
        $order = Order::findOrFail($id);
        
        $caminhoComprovante = null;

        if ($request->tipo === 'REEMBOLSADO') {
            $request->validate(['comprovante' => 'required|file|mimes:jpeg,png,jpg,pdf|max:5120']);
            $caminhoComprovante = $request->file('comprovante')->store('reembolsos', 'public');
            
            $order->status = 'REEMBOLSADO';
            $order->refund_receipt = $caminhoComprovante;
            $order->cancel_reason = $request->motivo;
            $msg = "Reembolso Aprovado. Motivo: {$request->motivo}";
        
        } elseif ($request->tipo === 'SOLICITACAO_REEMBOLSO') {
            $order->status = 'EM_ANALISE_REEMBOLSO';
            $order->cancel_reason = $request->motivo; 
            $msg = "Análise de Reembolso Iniciada. Motivo: {$request->motivo}";
        
        } else {
            $order->status = 'CANCELADO';
            $order->cancel_reason = $request->motivo; 
            $msg = "Pedido Cancelado. Motivo: {$request->motivo}";
        }
        
        $order->save();
        OrderHistory::create(['order_id' => $order->id, 'event' => $msg]);

        return response()->json(['status' => 'success', 'message' => 'Fluxo processado com sucesso.']);
    }

    // =========================================================================
    // 🟢 MÁQUINA DE ESTADOS UNIFICADA: AÇÕES MANUAIS COM COMPROVANTES E ESTORNO
    // =========================================================================
    public function updateStatusManual(Request $request, $id) 
    {
        $order = Order::findOrFail($id);
        $acao = $request->input('acao'); 
        $motivo = $request->input('motivo');
        $carrierId = $request->input('carrier_id');
        $trackingCode = $request->input('tracking_code');
        $refundMethod = $request->input('refund_method');
        
        $msg = "";
        $caminhoComprovante = null;

        if ($request->hasFile('arquivo')) {
            $request->validate(['arquivo' => 'file|mimes:jpeg,png,jpg,pdf|max:5120']);
            $pasta = $acao === 'ENTREGAR' ? 'comprovantes_entrega' : 'reembolsos';
            $caminhoComprovante = $request->file('arquivo')->store($pasta, 'public');
        }

        switch ($acao) {
            case 'PAGAR':
                $request->validate(['motivo' => 'required|string']);
                $order->status = 'SEPARACAO';
                $msg = "Pagamento Aprovado Manualmente. Motivo/Parecer: {$motivo}";
                break;

            case 'DESPACHAR':
                $request->validate(['carrier_id' => 'required']);
                $order->status = 'DESPACHADO';
                $order->tracking_code = $trackingCode;
                $order->carrier_id = $carrierId; // Associa a Transportadora
                
                $textoRastreio = $trackingCode ? "Rastreio: {$trackingCode}" : "Sem rastreio.";
                $msg = "Pedido Despachado. {$textoRastreio}";
                break;

            case 'ENTREGAR':
                $request->validate(['arquivo' => 'required|file']);
                $order->status = 'ENTREGUE';
                $msg = "Entrega Confirmada. Comprovante de entrega anexado aos arquivos da ordem.";
                break;

            case 'CANCELAR':
                $request->validate(['motivo' => 'required|string']);
                $order->status = 'CANCELADO';
                $order->cancel_reason = $motivo;
                $msg = "Pedido Cancelado pelo Gestor. Motivo: {$motivo}";
                break;

            case 'INICIAR_REEMBOLSO':
                $request->validate(['motivo' => 'required|string']);
                $order->status = 'EM_ANALISE_REEMBOLSO';
                $order->cancel_reason = $motivo;
                $msg = "Análise de Devolução/Reembolso Iniciada. Parecer: {$motivo}";
                break;

            case 'PROCESSAR_REEMBOLSO':
                $request->validate([
                    'motivo' => 'required|string', 
                    'arquivo' => 'required|file'
                ]);
                
                $order->status = 'REEMBOLSADO';
                $order->cancel_reason = $motivo;
                $order->refund_receipt = $caminhoComprovante;
                
                // ATENÇÃO: Garanta que você criou a coluna "refund_method" na migration da tabela de Orders
                $order->refund_method = $refundMethod; 
                
                $textoMetodo = $refundMethod === 'CASHBACK' ? 'Crédito em Loja (Cashback)' : 'Estorno/Transferência Bancária';
                $msg = "Reembolso Efetivado via {$textoMetodo}. Valor: R$ " . number_format($order->total, 2, ',', '.') . ". Parecer final: {$motivo}. Comprovante anexado.";
                
                // ==============================================================
                // 1. ESTORNO EM CASHBACK (TEMPO REAL)
                // ==============================================================
                if ($refundMethod === 'CASHBACK' && $order->user) {
                    $cliente = $order->user;
                    $cliente->cashback = ($cliente->cashback ?? 0) + $order->total;
                    $cliente->save();

                    // Registra o extrato financeiro na carteira do cliente
                    \App\Models\WalletTransaction::create([
                        'user_id'   => $cliente->id,
                        'tipo'      => 'entrada',
                        'valor'     => $order->total,
                        'descricao' => "Estorno do Pedido #HUB-{$order->id} revertido em saldo Cashback. Parecer: {$motivo}"
                    ]);
                }

                // ==============================================================
                // 2. DEVOLUÇÃO DO LIMITE DE CUPONS
                // ==============================================================
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
                return response()->json(['status' => 'error', 'message' => 'Ação inválida não reconhecida.'], 400);
        }

        $order->save();
        OrderHistory::create(['order_id' => $order->id, 'event' => $msg]);

        return response()->json(['status' => 'success', 'message' => 'Operação processada e auditada com sucesso.']);
    }
}