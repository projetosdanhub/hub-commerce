<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TrackingDestination;
use App\Models\TrackingRule;
use App\Models\TrackingLog;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;

class TrackingController extends Controller
{
    // ==========================================
    // APP STORE DE INTEGRAÇÕES E COFRE
    // ==========================================
    public function getSettings() {
        $config = TrackingDestination::firstOrCreate(
            ['provider' => 'global'],
            ['name' => 'Cofre Principal', 'credentials' => [], 'settings' => [], 'is_active' => true]
        );
        return response()->json(['status' => 'success', 'data' => [
            'credentials' => $config->credentials ?? [],
            'settings' => $config->settings ?? []
        ]]);
    }

    public function updateSettings(Request $request) {
        $config = TrackingDestination::where('provider', 'global')->first();
        
        // 🟢 CORREÇÃO: Substituição direta dos arrays garante que os botões 
        // de ligar/desligar tudo do React sejam salvos perfeitamente.
        if ($request->has('credentials')) {
            $config->credentials = $request->credentials;
        }
        if ($request->has('settings')) {
            $config->settings = $request->settings;
        }
        
        $config->save();
        return response()->json(['status' => 'success']);
    }

    // ==========================================
    // DATA WAREHOUSE: MÉTRICAS REAIS DE E-COMMERCE
    // ==========================================
    public function getDashboardData(Request $request) {
        $inicio = $request->query('inicio', now()->subDays(7)->startOfDay());
        $fim = $request->query('fim', now()->endOfDay());

        // 1. Coleta de Eventos Canônicos (Data Layer)
        $eventosAgrupados = TrackingLog::select('event_name', DB::raw('count(*) as total'))
            ->whereBetween('created_at', [$inicio, $fim])
            ->groupBy('event_name')
            ->pluck('total', 'event_name');

        // 2. Pedidos Financeiros Reais
        $pedidosValidos = Order::whereNotIn('status', ['CANCELADO', 'REEMBOLSADO'])
                               ->whereBetween('created_at', [$inicio, $fim]);
        
        $receitaBruta = (float) $pedidosValidos->sum('total');
        $qtdPedidos = $pedidosValidos->count();
        $ticketMedio = $qtdPedidos > 0 ? $receitaBruta / $qtdPedidos : 0;
        
        // Itens Vendidos Reais no período
        $itensVendidos = OrderItem::whereHas('order', function($q) use ($inicio, $fim) {
            $q->whereNotIn('status', ['CANCELADO', 'REEMBOLSADO'])
              ->whereBetween('created_at', [$inicio, $fim]);
        })->sum('quantity');

        // 🟢 Cálculo de Novos vs Recorrentes
        $clientesNoPeriodo = $pedidosValidos->pluck('user_id')->filter()->unique();
        $novosClientes = 0;
        $clientesRecorrentes = 0;
        
        foreach ($clientesNoPeriodo as $userId) {
            $comprasAntigas = Order::where('user_id', $userId)->where('created_at', '<', $inicio)->count();
            if ($comprasAntigas > 0) {
                $clientesRecorrentes++;
            } else {
                $novosClientes++;
            }
        }

        // 3. Extração dos Eventos do Funil
        $pageViews = $eventosAgrupados['PageView'] ?? ($eventosAgrupados['page_view'] ?? 0);
        $viewItem = $eventosAgrupados['ViewContent'] ?? ($eventosAgrupados['view_item'] ?? 0);
        $addCart = $eventosAgrupados['AddToCart'] ?? ($eventosAgrupados['add_to_cart'] ?? 0);
        $checkouts = $eventosAgrupados['InitiateCheckout'] ?? ($eventosAgrupados['begin_checkout'] ?? 0);
        $addPaymentInfo = $eventosAgrupados['AddPaymentInfo'] ?? ($eventosAgrupados['add_payment_info'] ?? 0);
        $purchasesLayer = $eventosAgrupados['Purchase'] ?? ($eventosAgrupados['purchase'] ?? 0);

        // 4. Inteligência e Fórmulas de Abandono
        $taxaConversao = $pageViews > 0 ? ($qtdPedidos / $pageViews) * 100 : 0;
        $abandonoCarrinho = $addCart > 0 ? ((max(0, $addCart - $qtdPedidos)) / $addCart) * 100 : 0;
        $abandonoCheckout = $checkouts > 0 ? ((max(0, $checkouts - $qtdPedidos)) / $checkouts) * 100 : 0;

        // 5. Monta o Funil Dinâmico para o Gráfico (Unindo snake_case e PascalCase)
        $funilData = [];
        foreach ($eventosAgrupados as $nome => $total) {
            $nomeBonito = $nome;
            if ($nome == 'page_view') $nomeBonito = 'PageView';
            if ($nome == 'view_item') $nomeBonito = 'ViewContent';
            if ($nome == 'add_to_cart') $nomeBonito = 'AddToCart';
            if ($nome == 'begin_checkout') $nomeBonito = 'InitiateCheckout';
            if ($nome == 'purchase') $nomeBonito = 'Purchase';

            $keyIndex = array_search($nomeBonito, array_column($funilData, 'evento'));
            if ($keyIndex !== false) {
                $funilData[$keyIndex]['total'] += $total;
            } else {
                $funilData[] = ['evento' => $nomeBonito, 'total' => $total];
            }
        }
        usort($funilData, function($a, $b) { return $b['total'] <=> $a['total']; });

        return response()->json([
            'status' => 'success',
            'funil' => $funilData,
            'metrics' => [
                'receita_bruta' => $receitaBruta,
                'receita_liquida' => $receitaBruta, // Estornos já isolados
                'pedidos' => $qtdPedidos,
                'itens_vendidos' => (int) $itensVendidos,
                'ticket_medio' => $ticketMedio,
                'taxa_conversao' => $taxaConversao,
                'novos_clientes' => $novosClientes,
                'clientes_recorrentes' => $clientesRecorrentes,
                'cac' => 0, // Placeholder para integração futura de Ads API
                'roas' => 0, // Placeholder para integração futura de Ads API
                'ltv' => $ticketMedio,
                'margem_bruta' => 45.0, // Margem demonstrativa
                'sessoes' => $pageViews, // Sessões espelhadas nos PageViews como default
                'page_views' => $pageViews,
                'view_item' => $viewItem,
                'add_to_cart' => $addCart,
                'begin_checkout' => $checkouts,
                'add_payment_info' => $addPaymentInfo,
                'abandono_carrinho' => $abandonoCarrinho,
                'abandono_checkout' => $abandonoCheckout,
                'purchases_layer' => $purchasesLayer
            ]
        ]);
    }

    // ==========================================
    // MINI-GTM (ACELERADORES & REGRAS)
    // ==========================================
    public function getTriggers() {
        $triggers = TrackingRule::orderBy('priority', 'desc')->orderBy('id', 'desc')->get();
        $formatado = $triggers->map(function($t) {
            return [
                'id' => $t->id,
                'nome' => $t->name,
                'evento' => $t->target_event,
                'tipo_gatilho' => $t->conditions['tipo'] ?? 'click',
                'valor_gatilho' => $t->conditions['valor'] ?? '',
                'url_alvo' => $t->conditions['url_alvo'] ?? '*',
                'payload' => $t->transformations ?? [],
                'status' => $t->is_active
            ];
        });
        return response()->json(['status' => 'success', 'data' => $formatado]);
    }

    public function storeTrigger(Request $request) {
        $request->validate(['nome' => 'required', 'evento' => 'required']);
        
        TrackingRule::updateOrCreate(
            ['id' => $request->id],
            [
                'name' => $request->nome, 
                'target_event' => $request->evento, 
                'conditions' => [
                    'tipo' => $request->tipo_gatilho, 
                    // 🟢 CORREÇÃO: Usa "??" para aceitar valor vazio nos eventos de 'exit_intent'
                    'valor' => $request->valor_gatilho ?? '', 
                    'url_alvo' => $request->url_alvo
                ], 
                'transformations' => $request->payload ?? [],
                'is_active' => $request->status ?? true
            ]
        );
        return response()->json(['status' => 'success']);
    }

    public function deleteTrigger($id) {
        TrackingRule::destroy($id);
        return response()->json(['status' => 'success']);
    }
}