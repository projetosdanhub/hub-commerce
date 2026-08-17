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

// Gerenciamento de E-mails
use Illuminate\Support\Facades\Mail;
use App\Mail\VerifyEmailUpdate;
use App\Mail\TemporaryPassword;
use App\Mail\EmailForcedUpdate;

use Illuminate\Support\Facades\Cache; // 🟢 IMPORTANTE PARA O TOKEN FUNCIONAR
use App\Mail\PasswordResetLink;       // 🟢 IMPORTANTE

class CustomerController extends Controller
{
    /**
     * Helper Privado: Salva o Log de Auditoria no Banco de Dados
     */
    private function registrarLog($customerId, $acao, $detalhes, $tipo = 'info')
    {
        // 🟢 CORRIGIDO: Retornado para as colunas exatas do seu banco de dados
        CustomerAuditLog::create([
            'cliente_id' => $customerId,
            'admin_id'   => Auth::id() ?? 1,
            'acao'       => $acao,
            'detalhes'   => $detalhes
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
    // 1. LISTAR TODOS OS CLIENTES E DADOS RELACIONAIS
    // =========================================================================
    public function index(Request $request)
    {
        $query = User::where('role', 'cliente')->with(['orders.items', 'orders.history', 'orders.address', 'addresses', 'auditLogs' => function($q) {
            $q->orderBy('created_at', 'desc');
        }])->orderBy('id', 'desc');

        if ($request->filled('busca')) {
            $busca = $request->busca;
            $query->where(function($q) use ($busca) {
                $q->where('name', 'like', "%{$busca}%")
                  ->orWhere('email', 'like', "%{$busca}%")
                  ->orWhere('cpf', 'like', "%{$busca}%")
                  ->orWhere('telefone', 'like', "%{$busca}%");
            });
        }

        if ($request->filled('status') && $request->status !== 'TODOS') {
            $query->where('status', $request->status);
        }

        if ($request->filled('mes_aniversario') && $request->mes_aniversario !== 'TODOS') {
            $query->whereMonth('nascimento', $request->mes_aniversario);
        }

        $users = $query->get();

        $formatted = $users->map(function ($c) {
            $pedidosValidos = $c->orders->whereNotIn('status', ['CANCELADO', 'REEMBOLSADO']);
            $pedidosReembolsados = $c->orders->where('status', 'REEMBOLSADO');
            $ultimoPedido = $c->orders->sortByDesc('created_at')->first();

            $descFrete = 0;
            $descLoja = 0;
            $cuponsUsados = 0;
            $qtdProdutosComprados = 0;

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

                'ltv' => (float) $ltv,
                'compras' => $pedidosValidos->count(),
                'ultimaCompra' => $ultimoPedido ? $ultimoPedido->created_at->format('Y-m-d') : null,
                'ultimaCompraValor' => $ultimoPedido ? (float) $ultimoPedido->total : 0,
                'ultimaCompraPagamento' => $ultimoPedido ? $ultimoPedido->payment_method : null,
                
                'produtosComprados' => $qtdProdutosComprados,
                'cuponsUsados' => $cuponsUsados,
                'descontoFrete' => $descFrete,
                'descontoLoja' => $descLoja,
                'coins' => (float) ($c->coins ?? 0),
                'cashback' => (float) ($c->cashback ?? 0),
                'rank' => $this->getRank($ltv, $pedidosValidos->count()),

                'reembolsado' => $pedidosReembolsados->count() > 0,
                'produtosReembolsados' => $pedidosReembolsados->sum(function($p) { return $p->items->sum('quantity'); }),
                'reembolsosPagos' => $pedidosReembolsados->sum('total'),
                'enderecos' => $c->addresses,

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

                // 🟢 TIMELINE AUTOMÁTICA
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
                    
                    // 🟢 Inteligência de Cores para a Timeline (Baseada no texto)
                    $tipoCor = 'info';
                    $acaoLower = strtolower($log->acao);
                    if (str_contains($acaoLower, 'forçado') || str_contains($acaoLower, 'senha') || str_contains($acaoLower, 'sensíveis') || str_contains($acaoLower, 'telefone') || str_contains($acaoLower, 'suspensa')) {
                        $tipoCor = 'warning';
                    } elseif (str_contains($acaoLower, 'reativada') || str_contains($acaoLower, 'saldo')) {
                        $tipoCor = 'success';
                    }

                    return [
                        'id' => 'crm_'.$log->id,
                        'data' => $log->created_at->format('Y-m-d\TH:i:s'),
                        'titulo' => $log->acao,
                        'desc' => $log->detalhes,
                        'tipo' => $tipoCor
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
    // 3. ATUALIZAR DADOS BÁSICOS
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
    // 5. ATUALIZAR DADOS SENSÍVEIS (CPF / NASC)
    // =========================================================================
    public function updateSensitiveData(Request $request, $id)
    {
        $request->validate([
            'arquivo' => 'required|file|mimes:jpeg,png,jpg,pdf|max:3072',
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
    // CONFIRMAÇÃO DE E-MAIL VIA LINK (CLIQUE DO CLIENTE)
    // =========================================================================
   public function confirmEmailUpdate(Request $request)
    {
        $token = $request->query('token');
        
        // 🟢 BUSCA OS DADOS QUE GUARDAMOS NO CACHE
        $dados = Cache::get("email_update_{$token}");

        if (!$token || !$dados) {
            return response()->make('
                <html><body style="font-family:sans-serif;text-align:center;padding:50px;">
                    <h2 style="color:#e11d48;">Link Expirado ou Inválido</h2>
                    <p>Este link já foi utilizado ou passou do limite de 7 minutos.</p>
                </body></html>
            ', 400);
        }

        // 🟢 APLICA A ALTERAÇÃO NO BANCO DE DADOS
        $user = User::findOrFail($dados['user_id']);
        $emailAntigo = $user->email;
        $user->email = $dados['novo_email'];
        $user->save();

        // 🟢 APAGA O TOKEN DO CACHE PARA NÃO SER REUTILIZADO
        Cache::forget("email_update_{$token}");

        $this->registrarLog($user->id, 'E-mail Confirmado via Link', "De: {$emailAntigo} Para: {$user->email}", 'success');

        return response()->make('
            <html><body style="font-family:sans-serif;text-align:center;padding:50px;background-color:#f8fafc;">
                <div style="max-width:500px;margin:0 auto;background:#fff;padding:30px;border-radius:16px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
                    <h2 style="color:#10b981;margin-bottom:10px;">E-mail Atualizado com Sucesso!</h2>
                    <p style="color:#475569;">Seu novo endereço de e-mail (<strong>'.$user->email.'</strong>) foi verificado e salvo.</p>
                </div>
            </body></html>
        ', 200, ['Content-Type' => 'text/html']);
    }
    // =========================================================================
    // 6. GESTÃO DE E-MAIL
    // =========================================================================
    public function sendEmailUpdateLink(Request $request, $id)
    {
        $request->validate(['email' => 'required|email']);
        $cliente = User::findOrFail($id);
        
        $token = Str::random(60); 

        // 🟢 GUARDA OS DADOS NO CACHE POR 7 MINUTOS!
        Cache::put("email_update_{$token}", [
            'user_id' => $cliente->id,
            'novo_email' => $request->email
        ], now()->addMinutes(7));

        Mail::to($request->email)->send(new VerifyEmailUpdate($token, $request->email, $cliente->name));

        $this->registrarLog($cliente->id, 'Solicitação de Troca de E-mail', "Link enviado para: {$request->email}", 'info');

        return response()->json(['status' => 'success', 'message' => 'Link de verificação enviado!']);
    }



// =========================================================================
    // 7. GESTÃO DE SENHA
    // =========================================================================
    public function generateTempPassword($id)
    {
        $cliente = User::findOrFail($id);
        
        $senhaProvisoria = strtoupper(Str::random(8));
        $cliente->password = Hash::make($senhaProvisoria);
        $cliente->save();

        Mail::to($cliente->email)->send(new TemporaryPassword($senhaProvisoria, $cliente->name));

        $this->registrarLog($cliente->id, 'Senha Provisória Gerada', 'Nova credencial temporária gerada e enviada por e-mail.', 'warning');

        return response()->json([
            'status'   => 'success', 
            'password' => $senhaProvisoria,
            'message'  => 'Senha gerada e enviada com sucesso.'
        ]);
    }

    public function sendPasswordResetLink($id)
    {
        $cliente = User::findOrFail($id);
        $token = Str::random(60);
        
        // 🟢 GUARDA O PEDIDO DE SENHA NO CACHE
        Cache::put("password_reset_{$token}", ['user_id' => $cliente->id], now()->addMinutes(7));

        Mail::to($cliente->email)->send(new PasswordResetLink($token, $cliente->name));

        $this->registrarLog($cliente->id, 'Redefinição de Senha', 'Link de redefinição de senha enviado ao cliente.', 'info');

        return response()->json(['status' => 'success', 'message' => 'Link de redefinição enviado com sucesso!']);
    }

    // Rota que exibe o formulário de nova senha ao clicar no e-mail
    public function showPasswordResetForm(Request $request)
    {
        $token = $request->query('token');
        if (!Cache::has("password_reset_{$token}")) {
            return response()->make('<html><body style="text-align:center;padding:50px;"><h2 style="color:red;">Link Expirado.</h2></body></html>', 400);
        }

        return response()->make('
            <html><body style="font-family:sans-serif;text-align:center;padding:50px;background-color:#f1f5f9;">
                <form action="'.url('/api/clientes/processar-senha').'" method="POST" style="max-width:400px;margin:0 auto;background:#fff;padding:30px;border-radius:16px;">
                    <h2>Criar Nova Senha</h2>
                    <input type="hidden" name="token" value="'.$token.'">
                    <input type="password" name="password" placeholder="Nova Senha" required style="width:100%;padding:12px;margin-bottom:15px;border-radius:8px;border:1px solid #ccc;">
                    <button type="submit" style="width:100%;padding:12px;background:#2563eb;color:#fff;font-weight:bold;border:none;border-radius:8px;cursor:pointer;">Salvar Nova Senha</button>
                </form>
            </body></html>
        ', 200, ['Content-Type' => 'text/html']);
    }

    // Processa a senha enviada pelo formulário acima
    public function processPasswordReset(Request $request)
    {
        $token = $request->input('token');
        $novaSenha = $request->input('password');

        $dados = Cache::get("password_reset_{$token}");

        if (!$token || !$dados || strlen($novaSenha) < 6) {
            return response()->make('<html><body style="text-align:center;padding:50px;"><h2>Erro: Link expirado ou senha muito curta.</h2></body></html>', 400);
        }

        $user = User::findOrFail($dados['user_id']);
        $user->password = Hash::make($novaSenha);
        $user->save();

        Cache::forget("password_reset_{$token}");
        $this->registrarLog($user->id, 'Senha Redefinida via Link', 'O cliente criou uma nova senha via e-mail.', 'success');

        return response()->make('<html><body style="text-align:center;padding:50px;"><h2>Senha Atualizada com Sucesso!</h2><p>Você já pode acessar sua conta com a nova senha.</p></body></html>', 200, ['Content-Type' => 'text/html']);
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
    // 12. REGRAS E NÍVEIS VIP 
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
}