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
        $orders = Order::with(['user', 'items', 'address', 'history' => function($q) {
            $q->orderBy('created_at', 'desc');
        }])->orderBy('id', 'desc')->get();

        $formatted = $orders->map(function ($order) {
            $historicoCliente = Order::where('user_id', $order->user_id)->where('status', '!=', 'CANCELADO');
            $ltv = (float) $historicoCliente->sum('total');
            
            return [
                'id' => $order->id,
                'status' => $order->status,
                'data' => $order->created_at->format('d/m/Y'),
                'hora' => $order->created_at->format('H:i'),
                'data_raw' => $order->created_at->format('Y-m-d'),
                'subtotal' => (float) $order->subtotal,
                'frete' => (float) $order->frete,
                'desconto' => (float) $order->desconto,
                'total' => (float) $order->total,
                'rastreio' => $order->tracking_code,
                
                // 🟢 MOTIVO DO CANCELAMENTO OU ABANDONO ENVIADO PARA O FRONT
                'motivo_cancelamento' => $order->cancel_reason,
                'comprovante_reembolso' => $order->refund_receipt ? asset('storage/' . $order->refund_receipt) : null,
                
                'cupons' => $order->applied_coupons ?? [],
                
                'pagamento' => [
                    'gateway' => $order->payment_gateway ?? 'N/A',
                    'metodo' => $order->payment_method ?? 'A Vista',
                    'parcelas' => (int) $order->payment_installments,
                    'valor_parcela' => (float) $order->installment_value,
                    'juros' => (float) $order->gateway_fee,
                    'isPago' => !in_array($order->status, ['A_PAGAR', 'CANCELADO'])
                ],
                
                'cliente' => [
                    'id' => $order->user->id,
                    'nome' => $order->user->name,
                    'email' => $order->user->email,
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
                    'logradouro' => $order->address->logradouro,
                    'numero' => $order->address->numero,
                    'complemento' => $order->address->complemento,
                    'referencia' => $order->address->referencia,
                    'bairro' => $order->address->bairro,
                    'cidade' => $order->address->cidade,
                    'uf' => $order->address->uf,
                    'cep' => $order->address->cep,
                ] : null,

                'itens' => $order->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'nome' => $item->product_name,
                        'descricao' => $item->short_description,
                        'sku' => $item->sku,
                        'variacao' => $item->variation_name,
                        'variacaoSku' => $item->variation_sku,
                        'qtd' => $item->quantity,
                        'preco' => (float) $item->price,
                        'img' => $item->product_image,
                        'personalizacao' => $item->customization
                    ];
                })->values(),

                'timeline' => $order->history->map(function ($log) {
                    return [
                        'data' => $log->created_at->format('d/m/Y H:i'),
                        'data_raw' => $log->created_at->format('Y-m-d'),
                        'evento' => $log->event,
                    ];
                })->values()
            ];
        });

        // 🟢 CÁLCULO DAS MÉTRICAS DE PIX E ABANDONO
        $pixTotal = $orders->where('payment_method', 'PIX')->count();
        $pixPagos = $orders->where('payment_method', 'PIX')->whereNotIn('status', ['A_PAGAR', 'CANCELADO'])->count();
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
        // Se mudou para despachado, aqui no futuro entrará a lógica: $produto->decrementarEstoqueReservado();
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
            $order->cancel_reason = $request->motivo; // Salva o motivo
            $msg = "Reembolso Aprovado. Motivo: {$request->motivo}";
        
        } elseif ($request->tipo === 'SOLICITACAO_REEMBOLSO') {
            $order->status = 'EM_ANALISE_REEMBOLSO';
            $order->cancel_reason = $request->motivo; // Salva o motivo temporário
            $msg = "Análise de Reembolso Iniciada. Motivo: {$request->motivo}";
        
        } else {
            // Cancelamento Puro (Abandono, Boleto não pago, Gestor)
            $order->status = 'CANCELADO';
            $order->cancel_reason = $request->motivo; // Salva o motivo oficial
            $msg = "Pedido Cancelado. Motivo: {$request->motivo}";
            
            // Lógica Futura: Aqui o estoque reservado volta para o estoque disponível
        }
        
        $order->save();
        OrderHistory::create(['order_id' => $order->id, 'event' => $msg]);

        return response()->json(['status' => 'success', 'message' => 'Fluxo processado com sucesso.']);
    }
}