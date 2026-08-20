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
                'notas' => $c->notas ?? '',

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

                // 🟢 MAP EXATO DOS PEDIDOS E SUAS INFORMAÇÕES FINANCEIRAS/LOGÍSTICAS
                'pedidos' => $c->orders->map(function ($order) {
                    $cuponsJson = is_string($order->applied_coupons) ? json_decode($order->applied_coupons, true) : $order->applied_coupons;
                    return [
                        'id' => $order->id,
                        'status' => $order->status,
                        'data_raw' => $order->created_at->format('Y-m-d H:i:s'),
                        
                        // Financeiro
                        'subtotal' => (float) $order->subtotal,
                        'frete_valor' => (float) $order->frete,
                        'desconto' => (float) $order->desconto,
                        'total' => (float) $order->total,
                        
                        // 🟢 ADICIONE ESTAS 6 LINHAS AQUI NO SEU CUSTOMER CONTROLLER:
                        'payment_gateway' => $order->payment_gateway,
                        'payment_method' => $order->payment_method,
                        'payment_installments' => $order->payment_installments,
                        'installment_value' => (float) $order->installment_value,
                        'gateway_fee' => (float) $order->gateway_fee,
                        'tracking_code' => $order->tracking_code,
                        
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
    // 2. BUSCAR UM ÚNICO CLIENTE (Retorno Consolidado Igual a Index)
    // =========================================================================
    public function show($id)
    {
        // Alterado para garantir que os retornos são os mesmos. Como a Listagem
        // Index faz o parser, podemos redirecionar ou reescrever a lógica,
        // mas para uso de API Resource, é aconselhável manter o formato.
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
        $dados = Cache::get("email_update_{$token}");

        if (!$token || !$dados) {
            return response()->make('
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <title>Link Expirado</title>
                    <style>
                        body { font-family: -apple-system, sans-serif; background: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
                        .card { background: #fff; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); text-align: center; max-width: 420px; border: 1px solid #e2e8f0; }
                        .icon { width: 60px; height: 60px; background: #ffe4e6; color: #e11d48; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 28px; font-weight: bold; }
                        h2 { color: #0f172a; margin: 0 0 10px; font-size: 20px; }
                        p { color: #64748b; font-size: 14px; margin: 0 0 20px; line-height: 1.5; }
                        a { display: inline-block; background: #0f172a; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 700; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="icon">&times;</div>
                        <h2>Link Expirado ou Inválido</h2>
                        <p>Este link de verificação já foi utilizado ou passou do limite de segurança de 7 minutos.</p>
                        <a href="'.config('app.url').'">Voltar para a Loja</a>
                    </div>
                </body>
                </html>
            ', 400, ['Content-Type' => 'text/html']);
        }

        // Aplica a alteração no Banco de Dados
        $user = User::findOrFail($dados['user_id']);
        $emailAntigo = $user->email;
        $user->email = $dados['novo_email'];
        $user->save();

        Cache::forget("email_update_{$token}");
        $this->registrarLog($user->id, 'E-mail Confirmado via Link', "De: {$emailAntigo} Para: {$user->email}", 'success');

        $redirectUrl = config('app.url');

        return response()->make('
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>E-mail Confirmado!</title>
                <style>
                    body { font-family: -apple-system, sans-serif; background: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
                    .card { background: #fff; padding: 40px; border-radius: 24px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); text-align: center; max-width: 440px; border: 1px solid #e2e8f0; position: relative; overflow: hidden; }
                    .icon { width: 64px; height: 64px; background: #d1fae5; color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 32px; font-weight: bold; }
                    h2 { color: #0f172a; margin: 0 0 10px; font-size: 22px; font-weight: 800; }
                    p { color: #64748b; font-size: 14px; margin: 0 0 20px; line-height: 1.5; }
                    .badge { display: inline-block; background: #f1f5f9; color: #334155; font-family: monospace; font-size: 14px; padding: 8px 16px; border-radius: 8px; font-weight: bold; margin-bottom: 20px; }
                    .redirect { font-size: 12px; color: #94a3b8; display: flex; align-items: center; justify-content: center; gap: 8px; }
                    .progress-bar { position: absolute; bottom: 0; left: 0; height: 4px; background: #10b981; width: 100%; transition: width 2.5s linear; }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="icon">&check;</div>
                    <h2>E-mail Confirmado!</h2>
                    <p>Seu novo endereço de e-mail foi verificado com sucesso:</p>
                    <div class="badge">'.$user->email.'</div>
                    <div class="redirect">
                        <span>Redirecionando para a loja em 2,5s...</span>
                    </div>
                    <div class="progress-bar" id="bar"></div>
                </div>

                <script>
                    setTimeout(() => { document.getElementById("bar").style.width = "0%"; }, 50);
                    setTimeout(() => { window.location.href = "'.$redirectUrl.'"; }, 2500);
                </script>
            </body>
            </html>
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

    // =========================================================================
    // EXIBE O FORMULÁRIO DE NOVA SENHA (CLIQUE NO E-MAIL)
    // =========================================================================
    public function showPasswordResetForm(Request $request)
    {
        $token = $request->query('token');
        if (!Cache::has("password_reset_{$token}")) {
            return response()->make('
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head><meta charset="UTF-8"><title>Link Expirado</title>
                <style>
                    body { font-family: -apple-system, sans-serif; background: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
                    .card { background: #fff; padding: 40px; border-radius: 20px; text-align: center; max-width: 400px; border: 1px solid #e2e8f0; }
                    h2 { color: #e11d48; margin-top: 0; }
                    p { color: #64748b; font-size: 14px; }
                </style></head>
                <body><div class="card"><h2>Link Expirado</h2><p>Este link de redefinição expirou ou já foi utilizado. Solicite um novo no painel.</p></div></body>
                </html>
            ', 400, ['Content-Type' => 'text/html']);
        }

        $postUrl = url('/api/clientes/processar-senha');

        return response()->make('
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Criar Nova Senha</title>
                <style>
                    * { box-sizing: border-box; }
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f1f5f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
                    .card { background: #ffffff; padding: 36px; border-radius: 24px; box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05); width: 100%; max-width: 440px; border: 1px solid #e2e8f0; }
                    h2 { color: #0f172a; font-size: 22px; font-weight: 800; margin: 0 0 6px; text-align: center; }
                    p.sub { color: #64748b; font-size: 13px; text-align: center; margin: 0 0 24px; }
                    .group { margin-bottom: 18px; text-align: left; }
                    label { display: block; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
                    input { width: 100%; padding: 12px 14px; border-radius: 12px; border: 1px solid #cbd5e1; font-size: 14px; outline: none; transition: border-color 0.2s; background: #f8fafc; }
                    input:focus { border-color: #2563eb; background: #fff; }
                    
                    /* Barra de Força */
                    .strength-meter { height: 6px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin: 10px 0 16px; }
                    .strength-bar { height: 100%; width: 0%; transition: width 0.3s, background-color 0.3s; }

                    /* Lista de Requisitos */
                    .rules { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 20px; }
                    .rule-item { font-size: 12px; color: #64748b; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
                    .rule-item:last-child { margin-bottom: 0; }
                    .rule-item.valid { color: #10b981; font-weight: 600; }
                    .rule-icon { width: 14px; text-align: center; }

                    button { width: 100%; padding: 14px; background: #2563eb; color: #ffffff; border: none; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; transition: background 0.2s, opacity 0.2s; }
                    button:disabled { opacity: 0.5; cursor: not-allowed; background: #94a3b8; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h2>Redefinir Senha</h2>
                    <p class="sub">Crie uma senha forte e segura para a sua conta.</p>

                    <form action="'.$postUrl.'" method="POST" id="resetForm">
                        <input type="hidden" name="token" value="'.$token.'">

                        <div class="group">
                            <label>Nova Senha</label>
                            <input type="password" id="password" name="password" placeholder="••••••••" required>
                        </div>

                        <div class="strength-meter">
                            <div class="strength-bar" id="strengthBar"></div>
                        </div>

                        <div class="group">
                            <label>Confirmar Nova Senha</label>
                            <input type="password" id="password_confirmation" placeholder="••••••••" required>
                        </div>

                        <div class="rules">
                            <div class="rule-item" id="r-len"><span class="rule-icon">&bull;</span> Pelo menos 8 caracteres</div>
                            <div class="rule-item" id="r-upper"><span class="rule-icon">&bull;</span> Ao menos 1 letra maiúscula (A-Z)</div>
                            <div class="rule-item" id="r-num"><span class="rule-icon">&bull;</span> Ao menos 1 número (0-9)</div>
                            <div class="rule-item" id="r-seq"><span class="rule-icon">&bull;</span> Sem 3 números iguais em sequência (ex: 111)</div>
                            <div class="rule-item" id="r-match"><span class="rule-icon">&bull;</span> As senhas devem coincidir</div>
                        </div>

                        <button type="submit" id="submitBtn" disabled>Salvar Nova Senha</button>
                    </form>
                </div>

                <script>
                    const pass = document.getElementById("password");
                    const passConf = document.getElementById("password_confirmation");
                    const submitBtn = document.getElementById("submitBtn");
                    const bar = document.getElementById("strengthBar");

                    function validate() {
                        const val = pass.value;
                        const confVal = passConf.value;

                        const hasLen = val.length >= 8;
                        const hasUpper = /[A-Z]/.test(val);
                        const hasNum = /[0-9]/.test(val);
                        const noSeq = !/(000|111|222|333|444|555|666|777|888|999)/.test(val);
                        const match = val.length > 0 && val === confVal;

                        toggleRule("r-len", hasLen);
                        toggleRule("r-upper", hasUpper);
                        toggleRule("r-num", hasNum);
                        toggleRule("r-seq", noSeq && hasNum);
                        toggleRule("r-match", match);

                        let score = 0;
                        if (hasLen) score++;
                        if (hasUpper) score++;
                        if (hasNum) score++;
                        if (noSeq) score++;

                        if (score <= 1) { bar.style.width = "25%"; bar.style.backgroundColor = "#ef4444"; }
                        else if (score === 2 || score === 3) { bar.style.width = "60%"; bar.style.backgroundColor = "#f59e0b"; }
                        else if (score === 4) { bar.style.width = "100%"; bar.style.backgroundColor = "#10b981"; }

                        const isValid = hasLen && hasUpper && hasNum && noSeq && match;
                        submitBtn.disabled = !isValid;
                    }

                    function toggleRule(id, valid) {
                        const el = document.getElementById(id);
                        if (valid) {
                            el.classList.add("valid");
                            el.querySelector(".rule-icon").innerHTML = "&#10003;";
                        } else {
                            el.classList.remove("valid");
                            el.querySelector(".rule-icon").innerHTML = "&bull;";
                        }
                    }

                    pass.addEventListener("input", validate);
                    passConf.addEventListener("input", validate);
                </script>
            </body>
            </html>
        ', 200, ['Content-Type' => 'text/html']);
    }

    // =========================================================================
    // PROCESSA A NOVA SENHA ENVIADA PELO FORMULÁRIO
    // =========================================================================
    public function processPasswordReset(Request $request)
    {
        $token = $request->input('token');
        $novaSenha = $request->input('password');

        $dados = Cache::get("password_reset_{$token}");

        // Validações do Backend (Anti-Bypass)
        $hasLen = strlen($novaSenha) >= 8;
        $hasUpper = preg_match('/[A-Z]/', $novaSenha);
        $hasNum = preg_match('/[0-9]/', $novaSenha);
        $hasSeq = preg_match('/([0-9])\1\1/', $novaSenha); // Detecta 3 números iguais seguidos

        if (!$token || !$dados || !$hasLen || !$hasUpper || !$hasNum || $hasSeq) {
            return response()->make('
                <!DOCTYPE html>
                <html lang="pt-BR"><head><meta charset="UTF-8"><title>Erro ao Redefinir</title>
                <style>
                    body { font-family: -apple-system, sans-serif; background: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
                    .card { background: #fff; padding: 40px; border-radius: 20px; text-align: center; max-width: 420px; border: 1px solid #e2e8f0; }
                    h2 { color: #e11d48; margin-top: 0; }
                    p { color: #64748b; font-size: 14px; }
                </style></head>
                <body><div class="card"><h2>Requisitos Não Preenchidos</h2><p>A senha fornecida não atende às regras de segurança do sistema (mínimo 8 caracteres, 1 maiúscula, 1 número e sem 3 números iguais consecutivos) ou o link expirou.</p></div></body>
                </html>
            ', 400, ['Content-Type' => 'text/html']);
        }

        $user = User::findOrFail($dados['user_id']);
        $user->password = Hash::make($novaSenha);
        $user->save();

        Cache::forget("password_reset_{$token}");
        $this->registrarLog($user->id, 'Senha Redefinida via Link', 'O cliente redefiniu sua senha de acesso com sucesso.', 'success');

        $redirectUrl = config('app.url') . '/login';

        return response()->make('
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Senha Redefinida!</title>
                <style>
                    body { font-family: -apple-system, sans-serif; background: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
                    .card { background: #fff; padding: 40px; border-radius: 24px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); text-align: center; max-width: 440px; border: 1px solid #e2e8f0; position: relative; overflow: hidden; }
                    .icon { width: 64px; height: 64px; background: #d1fae5; color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 32px; font-weight: bold; }
                    h2 { color: #0f172a; margin: 0 0 10px; font-size: 22px; font-weight: 800; }
                    p { color: #64748b; font-size: 14px; margin: 0 0 20px; line-height: 1.5; }
                    .redirect { font-size: 12px; color: #94a3b8; }
                    .progress-bar { position: absolute; bottom: 0; left: 0; height: 4px; background: #10b981; width: 100%; transition: width 2.5s linear; }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="icon">&check;</div>
                    <h2>Senha Redefinida com Sucesso!</h2>
                    <p>Sua nova senha já está ativa. Você será redirecionado para a tela de login.</p>
                    <div class="redirect">Redirecionando em 2,5s...</div>
                    <div class="progress-bar" id="bar"></div>
                </div>

                <script>
                    setTimeout(() => { document.getElementById("bar").style.width = "0%"; }, 50);
                    setTimeout(() => { window.location.href = "'.$redirectUrl.'"; }, 2500);
                </script>
            </body>
            </html>
        ', 200, ['Content-Type' => 'text/html']);
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