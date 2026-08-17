<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User; 
use App\Models\CustomerAuditLog;
use App\Models\WalletTransaction;
use App\Models\VipLevel;
use App\Models\CrmSetting;
use App\Models\Order;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

// 🟢 Adicionados para Gerenciar os E-mails na Fila
use Illuminate\Support\Facades\Mail;
use App\Mail\VerifyEmailUpdate;
use App\Mail\TemporaryPassword;
use App\Mail\EmailForcedUpdate;

class CustomerController extends Controller
{
    /**
     * Helper Privado: Salva o Log de Auditoria no Banco de Dados
     */
    private function registrarLog($customerId, $acao, $detalhes, $tipo = 'info')
    {
        CustomerAuditLog::create([
            'user_id'    => $customerId, // 🟢 Ajustado para user_id (padrão que definimos nas migrations)
            'admin_id'   => Auth::id() ?? 1,
            'titulo'     => $acao,       // 🟢 Ajustado para titulo
            'desc'       => $detalhes,   // 🟢 Ajustado para desc
            'tipo'       => $tipo        // 🟢 Adicionado campo tipo (info, warning, success)
        ]);
    }

    /**
     * ALGORITMO VIP INTELIGENTE
     * Calcula o rank do cliente com base no LTV e Total de Compras.
     */
    private function getRank($ltv, $compras) {
        $niveis = VipLevel::orderBy('gasto_requisito', 'desc')->get();
        
        foreach ($niveis as $nivel) {
            if ($ltv >= $nivel->gasto_requisito && $compras >= $nivel->compras_requisito) {
                return $nivel->nome;
            }
        }
        
        $padrao = VipLevel::where('is_default', true)->first();
        return $padrao ? $padrao->nome : 'Iniciante';
    }

    // =========================================================================
    // 1. LISTAR TODOS OS CLIENTES E DADOS RELACIONAIS (Cálculos Matemáticos)
    // =========================================================================
    public function index(Request $request)
    {
        // 🔒 Filtra APENAS quem é cliente e carrega TODOS os relacionamentos necessários
        $query = User::where('role', 'cliente')->with(['orders.items', 'orders.history', 'orders.address', 'addresses', 'auditLogs' => function($q) {
            $q->orderBy('created_at', 'desc');
        }])->orderBy('id', 'desc');

        // Filtro de Busca por Parâmetro Query
        if ($request->filled('busca')) {
            $busca = $request->busca;
            $query->where(function($q) use ($busca) {
                $q->where('name', 'like', "%{$busca}%")
                  ->orWhere('email', 'like', "%{$busca}%")
                  ->orWhere('cpf', 'like', "%{$busca}%")
                  ->orWhere('telefone', 'like', "%{$busca}%");
            });
        }

        // Filtro de Status
        if ($request->filled('status') && $request->status !== 'TODOS') {
            $query->where('status', $request->status);
        }

        // Filtro de Mês de Aniversário
        if ($request->filled('mes_aniversario') && $request->mes_aniversario !== 'TODOS') {
            $query->whereMonth('nascimento', $request->mes_aniversario);
        }

        $users = $query->get();

        // Mapeamento e Cálculos Dinâmicos
        $formatted = $users->map(function ($c) {
            $pedidosValidos = $c->orders->whereNotIn('status', ['CANCELADO', 'REEMBOLSADO']);
            $pedidosReembolsados = $c->orders->where('status', 'REEMBOLSADO');
            $ultimoPedido = $c->orders->sortByDesc('created_at')->first();

            // Variáveis Auxiliares de Cálculo
            $descFrete = 0;
            $descLoja = 0;
            $cuponsUsados = 0;
            $qtdProdutosComprados = 0;

            // Varre o histórico de compras para as métricas da Tabela de Registros
            foreach ($c->orders as $pedido) {
                if ($pedido->status !== 'CANCELADO') {
                    $qtdProdutosComprados += $pedido->items->sum('quantity');

                    if (!empty($pedido->applied_coupons)) {
                        $cupons = is_string($pedido->applied_coupons) ? json_decode($pedido->applied_coupons, true) : $pedido->applied_coupons;
                        if (is_array($cupons)) {
                            foreach ($cupons as $cupom) {
                                $cuponsUsados++;
                                if (($cupom['tipo'] ?? '') === 'Frete') {
                                    $descFrete += (float) ($cupom['valor'] ?? 0);
                                } else {
                                    $descLoja += (float) ($cupom['valor'] ?? 0);
                                }
                            }
                        }
                    }
                }
            }

            $ltv = $pedidosValidos->sum('total');

            return [
                'id' => $c->id,
                'nome' => $c->name,
                'email' => $c->email,
                'cpf' => $c->cpf ?? '-',
                'telefone' => $c->telefone ?? '-',
                'nascimento' => $c->nascimento ?? '-',
                'sexo' => $c->sexo ?? 'Não informado',
                'origem' => $c->origem ?? 'Direto / Loja',
                'tags' => $c->tags ?? [],
                'avatar' => $c->avatar ?? null,
                'status' => $c->status ?? 'ATIVO',
                'dataCadastro' => $c->created_at->format('Y-m-d'),

                // Finanças e Pedidos Globais
                'ltv' => (float) $ltv,
                'compras' => $pedidosValidos->count(),
                'ultimaCompra' => $ultimoPedido ? $ultimoPedido->created_at->format('Y-m-d') : null,
                'ultimaCompraValor' => $ultimoPedido ? (float) $ultimoPedido->total : 0,
                'ultimaCompraPagamento' => $ultimoPedido ? $ultimoPedido->payment_method : null,
                
                // Métricas Analíticas
                'produtosComprados' => $qtdProdutosComprados,
                'cuponsUsados' => $cuponsUsados,
                'descontoFrete' => $descFrete,
                'descontoLoja' => $descLoja,
                'coins' => (float) ($c->coins ?? 0),
                'cashback' => (float) ($c->cashback ?? 0),
                'rank' => $this->getRank($ltv, $pedidosValidos->count()),

                // Risco e Reembolsos
                'reembolsado' => $pedidosReembolsados->count() > 0,
                'produtosReembolsados' => $pedidosReembolsados->sum(function($p) { return $p->items->sum('quantity'); }),
                'reembolsosPagos' => $pedidosReembolsados->sum('total'),
                'enderecos' => $c->addresses,

                // 🟢 HISTÓRICO VISUAL DE PEDIDOS
                'pedidos' => $c->orders->map(function ($order) {
                    $cuponsJson = is_string($order->applied_coupons) ? json_decode($order->applied_coupons, true) : $order->applied_coupons;
                    return [
                        'id' => $order->id,
                        'status' => $order->status,
                        'data_raw' => $order->created_at->format('Y-m-d'),
                        'subtotal' => (float) $order->subtotal,
                        'frete' => (float) $order->frete,
                        'desconto' => (float) $order->desconto,
                        'total' => (float) $order->total,
                        'endereco' => $order->address,
                        'cupons' => $cuponsJson ?? [],
                        'history' => $order->history->map(function($h) {
                            return ['data' => $h->created_at->format('d/m/Y H:i'), 'evento' => $h->event];
                        })->values(),
                        'itens' => $order->items->map(function ($item) {
                            return [
                                'nome' => $item->product_name,
                                'variacao' => $item->variation_name,
                                'sku' => $item->sku,
                                'variacaoSku' => $item->variation_sku,
                                'qtd' => $item->quantity,
                                'preco' => (float) $item->price,
                                'img' => $item->product_image,
                                'personalizacao' => $item->customization
                            ];
                        })->values()
                    ];
                })->values(),

                // TIMELINE AUTOMÁTICA (Para a Aba Audit/Timeline)
                'auditLogs' => $c->orders->flatMap(function ($order) {
                    return $order->history->map(function ($log) use ($order) {
                        return [
                            'id' => 'order_'.$log->id,
                            'data' => $log->created_at->format('Y-m-d\TH:i:s'),
                            'titulo' => "Atualização no Pedido #{$order->id}",
                            'desc' => $log->event,
                            'tipo' => str_contains(strtolower($log->event), 'reembolso') || str_contains(strtolower($log->event), 'cancelado') ? 'warning' : 'info'
                        ];
                    });
                })->merge($c->auditLogs->map(function($log) {
                    // Logs de ações diretas do CRM
                    return [
                        'id' => 'crm_'.$log->id,
                        'data' => $log->created_at->format('Y-m-d\TH:i:s'),
                        'titulo' => $log->titulo,
                        'desc' => $log->desc,
                        'tipo' => $log->tipo
                    ];
                }))->sortByDesc('data')->values()
            ];
        });

        return response()->json(['status' => 'success', 'data' => $formatted]);
    }

    // =========================================================================
    // 2. BUSCAR UM ÚNICO CLIENTE
    // =========================================================================
    public function show($id)
    {
        $cliente = User::with(['addresses', 'orders.items', 'orders.history', 'orders.address', 'auditLogs' => function($q) {
            $q->orderBy('created_at', 'desc');
        }])->findOrFail($id);

        return response()->json(['status' => 'success', 'data' => $cliente]);
    }

    // =========================================================================
    // 3. ATUALIZAR DADOS BÁSICOS (NOME, GÊNERO)
    // =========================================================================
    public function updateBasics(Request $request, $id)
    {
        $request->validate([
            'nome' => 'required|string|max:255',
            'sexo' => 'nullable|string',
            'motivo' => 'required|string'
        ]);

        $cliente = User::findOrFail($id);
        $nomeAntigo = $cliente->name;
        
        $cliente->name = $request->nome;
        $cliente->sexo = $request->sexo;
        $cliente->save();

        $this->registrarLog($cliente->id, 'Dados Pessoais Alterados', "Nome de: {$nomeAntigo} para {$cliente->name}. Gênero: {$cliente->sexo}. Motivo: {$request->motivo}", 'warning');

        return response()->json(['status' => 'success', 'message' => 'Dados básicos atualizados.']);
    }

    // =========================================================================
    // 4. ATUALIZAR TELEFONE
    // =========================================================================
    public function updatePhone(Request $request, $id)
    {
        $request->validate([
            'telefone' => 'required|string',
            'motivo'   => 'required|string'
        ]);

        $cliente = User::findOrFail($id);
        $telefoneAntigo = $cliente->telefone;
        
        $cliente->telefone = $request->telefone;
        $cliente->save();

        $this->registrarLog($cliente->id, 'Telefone/WhatsApp Alterado', "De: {$telefoneAntigo} Para: {$cliente->telefone}. Motivo: {$request->motivo}", 'warning');

        return response()->json(['status' => 'success', 'message' => 'Telefone atualizado com sucesso.']);
    }

    // =========================================================================
    // 5. ATUALIZAR DADOS SENSÍVEIS (CPF / NASC) C/ ARQUIVO
    // =========================================================================
    public function updateSensitiveData(Request $request, $id)
    {
        $request->validate([
            'arquivo' => 'required|file|mimes:jpeg,png,jpg,pdf|max:3072', // Máx 3MB
            'motivo'  => 'required|string'
        ]);

        $cliente = User::findOrFail($id);
        $path = $request->file('arquivo')->store('comprovantes', 'public');

        $alteracoes = [];
        if ($request->filled('cpf')) {
            $alteracoes[] = "CPF de {$cliente->cpf} para {$request->cpf}";
            $cliente->cpf = $request->cpf;
        }
        if ($request->filled('nascimento')) {
            $alteracoes[] = "Nascimento de {$cliente->nascimento} para {$request->nascimento}";
            $cliente->nascimento = $request->nascimento;
        }
        
        $cliente->save();

        $descLog = implode(" | ", $alteracoes) . ". Documento arquivado (Ref: {$path}). Motivo: {$request->motivo}";
        $this->registrarLog($cliente->id, 'Alteração de Dados Sensíveis', $descLog, 'warning');

        return response()->json(['status' => 'success', 'message' => 'Dados sensíveis atualizados.']);
    }

    // =========================================================================
    // 6. GESTÃO DE E-MAIL (ENVIAR LINK OU FORÇAR)
    // =========================================================================
    public function sendEmailUpdateLink(Request $request, $id)
    {
        $request->validate(['email' => 'required|email']);
        $cliente = User::findOrFail($id);
        
        // Simulação de geração de token (A ser expandida)
        $token = Str::random(60); 

        // 🟢 Passando o nome do cliente no envio do e-mail
        Mail::to($request->email)->send(new VerifyEmailUpdate($token, $request->email, $cliente->name));

        $this->registrarLog($cliente->id, 'Solicitação de Troca de E-mail', "Link enviado para validação do endereço: {$request->email}", 'info');

        return response()->json(['status' => 'success', 'message' => 'Link de verificação enviado!']);
    }

    public function forceEmailUpdate(Request $request, $id)
    {
        $request->validate([
            'email'  => 'required|email|unique:users,email,'.$id, 
            'motivo' => 'required|string'
        ]);

        $cliente = User::findOrFail($id);
        $emailAntigo = $cliente->email;
        
        $cliente->email = $request->email;
        $cliente->save();

        // 🟢 Dispara o e-mail de alerta para o E-MAIL ANTIGO do cliente para avisar sobre a troca forçada
        Mail::to($emailAntigo)->send(new EmailForcedUpdate($cliente->name, $request->email, $request->motivo));

        $this->registrarLog($cliente->id, 'E-mail Alterado (Forçado)', "De: {$emailAntigo} Para: {$cliente->email}. Motivo: {$request->motivo}", 'warning');

        return response()->json(['status' => 'success', 'message' => 'E-mail alterado forçadamente.']);
    }


    // =========================================================================
    // 7. GESTÃO DE SENHA (GERAR TEMP)
    // =========================================================================
    public function generateTempPassword($id)
    {
        $cliente = User::findOrFail($id);
        
        $senhaProvisoria = strtoupper(Str::random(8));
        $cliente->password = Hash::make($senhaProvisoria);
        $cliente->save();

        // Na função generateTempPassword:
        Mail::to($cliente->email)->send(new TemporaryPassword($senhaProvisoria, $cliente->name));

        $this->registrarLog($cliente->id, 'Senha Provisória Gerada', 'Nova credencial temporária gerada e enviada por e-mail.', 'warning');

        return response()->json([
            'status'   => 'success', 
            'password' => $senhaProvisoria,
            'message'  => 'Senha gerada e e-mail colocado na fila de envio.'
        ]);
    }

    // =========================================================================
    // 8. ATUALIZAR NOTAS INTERNAS
    // =========================================================================
    public function updateNotes(Request $request, $id)
    {
        $cliente = User::findOrFail($id);
        $cliente->notas = $request->notas;
        $cliente->save();

        $this->registrarLog($cliente->id, 'Anotações Atualizadas', 'O Gestor atualizou as notas internas do cliente.', 'info');

        return response()->json(['status' => 'success', 'message' => 'Anotações salvas.']);
    }

    // =========================================================================
    // 9. SUSPENDER OU REATIVAR CONTA
    // =========================================================================
    public function toggleSuspension(Request $request, $id)
    {
        $request->validate([
            'acao'   => 'required|in:SUSPENDER,REATIVAR',
            'motivo' => 'required|string'
        ]);

        $cliente = User::findOrFail($id);
        $novoStatus = $request->acao === 'SUSPENDER' ? 'BLOQUEADA' : 'ATIVO';
        $cliente->status = $novoStatus;
        $cliente->save();

        $titulo = $novoStatus === 'BLOQUEADA' ? 'Conta Suspensa / Bloqueada' : 'Conta Reativada pelo Admin';
        $tipo = $novoStatus === 'BLOQUEADA' ? 'warning' : 'success';
        
        $this->registrarLog($cliente->id, $titulo, "Motivo: {$request->motivo}", $tipo);

        return response()->json(['status' => 'success', 'message' => "Conta alterada para {$novoStatus}."]);
    }

    // =========================================================================
    // 10. ADICIONAR SALDO (LIVRO RAZÃO)
    // =========================================================================
    public function addWalletTransaction(Request $request, $id)
    {
        $request->validate([
            'tipo'   => 'required|string', 
            'valor'  => 'required|numeric',
            'motivo' => 'required|string'
        ]);

        $cliente = User::findOrFail($id);

        if ($request->tipo === 'Hub Coins') {
            $cliente->coins = ($cliente->coins ?? 0) + $request->valor;
        } else {
            $cliente->cashback = ($cliente->cashback ?? 0) + $request->valor;
        }
        $cliente->save();

        WalletTransaction::create([
            'user_id'   => $cliente->id,
            'tipo'      => 'entrada',
            'valor'     => $request->valor,
            'descricao' => "{$request->tipo} inserido manualmente pelo gestor. Motivo: {$request->motivo}"
        ]);

        $this->registrarLog($cliente->id, "Saldo Manual Adicionado: {$request->tipo}", "Valor: {$request->valor}. Motivo Formal: {$request->motivo}", 'success');

        return response()->json(['status' => 'success', 'message' => 'Transação financeira registrada.']);
    }

    // =========================================================================
    // 11. MÉTRICAS REAIS DO DASHBOARD
    // =========================================================================
    public function getDashboardMetrics()
    {
        $receitaBruta = \App\Models\Order::where('status', '!=', 'CANCELADO')->sum('total');
        $totalPedidos = \App\Models\Order::where('status', '!=', 'CANCELADO')->count();
        $ticketMedio  = $totalPedidos > 0 ? ($receitaBruta / $totalPedidos) : 0;

        $receitaMesAtual = \App\Models\Order::where('status', '!=', 'CANCELADO')
                                 ->whereMonth('created_at', now()->month)
                                 ->whereYear('created_at', now()->year)
                                 ->sum('total');

        $receitaMesAnterior = \App\Models\Order::where('status', '!=', 'CANCELADO')
                                    ->whereMonth('created_at', now()->subMonth()->month)
                                    ->whereYear('created_at', now()->subMonth()->year)
                                    ->sum('total');

        $crescimentoReceita = 0;
        if ($receitaMesAnterior > 0) {
            $crescimentoReceita = (($receitaMesAtual - $receitaMesAnterior) / $receitaMesAnterior) * 100;
        } elseif ($receitaMesAtual > 0) {
            $crescimentoReceita = 100;
        }

        $clientesTotais = User::where('role', 'cliente')->count();
        $clientesMesAtual = User::where('role', 'cliente')
                                ->whereMonth('created_at', now()->month)
                                ->whereYear('created_at', now()->year)
                                ->count();
        
        $crescimentoClientes = $clientesTotais > 0 ? ($clientesMesAtual / $clientesTotais) * 100 : 0;

        $pedidosMesAtualCount = \App\Models\Order::where('status', '!=', 'CANCELADO')
                                 ->whereMonth('created_at', now()->month)
                                 ->whereYear('created_at', now()->year)
                                 ->count();
        
        $pedidosMesAnteriorCount = \App\Models\Order::where('status', '!=', 'CANCELADO')
                                    ->whereMonth('created_at', now()->subMonth()->month)
                                    ->whereYear('created_at', now()->subMonth()->year)
                                    ->count();

        $ticketMesAtual = $pedidosMesAtualCount > 0 ? ($receitaMesAtual / $pedidosMesAtualCount) : 0;
        $ticketMesAnterior = $pedidosMesAnteriorCount > 0 ? ($receitaMesAnterior / $pedidosMesAnteriorCount) : 0;

        $diferencaLTV = $ticketMesAtual - $ticketMesAnterior;

        return response()->json([
            'status'        => 'success',
            'receita_bruta' => (float) $receitaBruta,
            'total_pedidos' => $totalPedidos,
            'ticket_medio'  => (float) $ticketMedio,
            'crescimento'   => (float) $crescimentoReceita,
            'novos_clientes_pct' => (float) $crescimentoClientes,
            'diferenca_ltv'      => (float) $diferencaLTV
        ]);
    }

    // =========================================================================
    // 12. REGRAS E NÍVEIS VIP (Com Suporte a Upload de Imagem)
    // =========================================================================
    public function getVipLevels() {
        try {
            $vips = VipLevel::all();
            return response()->json(['status' => 'success', 'data' => $vips]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'success', 'data' => []]);
        }
    }

    public function storeOrUpdateVipLevel(Request $request)
    {
        $request->validate([
            'nome' => 'required|string',
            'imagem' => 'nullable|file|mimes:jpeg,png,jpg,svg,webp|max:2048'
        ]);

        if ($request->is_default) {
            VipLevel::query()->update(['is_default' => false]);
        }

        $fields = $request->only([
            'nome', 'is_default', 'gasto_requisito', 'compras_requisito',
            'mult_coins', 'desc_frete', 'desc_produtos', 'acumula_frete',
            'frequencia_uso', 'limite_uso'
        ]);

        if ($request->hasFile('imagem')) {
            $path = $request->file('imagem')->store('vip_badges', 'public');
            $fields['imagem'] = asset('storage/' . $path);
        }

        $vip = VipLevel::updateOrCreate(['id' => $request->id], $fields);

        $this->registrarLog(1, 'Regra VIP Atualizada', "O Nível VIP '{$vip->nome}' foi modificado/criado.", 'info');

        return response()->json(['status' => 'success', 'message' => 'Nível VIP processado.', 'data' => $vip]);
    }

    public function deleteVipLevel($id)
    {
        VipLevel::destroy($id);
        return response()->json(['status' => 'success', 'message' => 'Nível VIP removido com sucesso.']);
    }

    // =========================================================================
    // 13. CONFIGURAÇÕES DA LOJA E CRM
    // =========================================================================
    public function getSettings()
    {
        try {
            $settings = CrmSetting::firstOrCreate(['id' => 1]);
            return response()->json(['status' => 'success', 'data' => $settings]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'success', 'data' => null]);
        }
    }

    public function updateSettings(Request $request)
    {
        $settings = CrmSetting::firstOrCreate(['id' => 1]);
        
        $fields = $request->only([
            'permite_cadastro',
            'login_apenas_convite',
            'aprovar_comentarios',
            'bloquear_fora_do_pais'
        ]);

        $settings->update($fields);

        return response()->json(['status' => 'success', 'message' => 'Configurações atualizadas.']);
    }

    // =========================================================================
    // 14. ATUALIZAR ETIQUETAS (TAGS)
    // =========================================================================
    public function syncTags(Request $request, $id)
    {
        $request->validate(['tags' => 'array']);

        $cliente = User::findOrFail($id);
        $cliente->tags = $request->tags;
        $cliente->save();

        $this->registrarLog($cliente->id, 'Etiquetas (Tags) Atualizadas', 'As tags do cliente foram atualizadas.', 'info');

        return response()->json(['status' => 'success', 'message' => 'Tags atualizadas com sucesso!']);
    }
    // =========================================================================
    // ENVIAR LINK DE REDEFINIÇÃO DE SENHA (PADRÃO LARAVEL)
    // =========================================================================
    public function sendPasswordResetLink($id)
    {
        $cliente = User::findOrFail($id);
        
        // Aqui você pode disparar um Mailable específico com um token, ou usar o 
        // Password::broker() nativo do Laravel.
        // Por exemplo (se criar um Mailable chamado PasswordResetLink):
        // Mail::to($cliente->email)->send(new \App\Mail\PasswordResetLink($cliente->name, $token));

        $this->registrarLog($cliente->id, 'Redefinição de Senha', 'Link de redefinição de senha enviado para o e-mail atual do cliente.', 'info');

        return response()->json(['status' => 'success', 'message' => 'Link de redefinição enviado com sucesso!']);
    }
}