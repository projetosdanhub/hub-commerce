<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\StorefrontConfig;
use App\Models\NavigationMenu;
use App\Models\Category;
use App\Models\Produto;
use App\Services\CacheFallbackService;
use App\Services\PaymentGatewayService;
use Illuminate\Support\Facades\Log;

class StorefrontController extends Controller
{
    // Retorna a vitrine atual
    public function getVitrine()
    {
        $config = StorefrontConfig::first();
        
        if (!$config) {
            // Layout padrão inicial caso a loja seja nova
            $defaultLayout = [
                ['id' => 'fb-1', 'type' => 'BannerPrincipal', 'isVisible' => true, 'props' => ['titulo' => 'Grande Promoção']],
                ['id' => 'fb-2', 'type' => 'GradeCategorias', 'isVisible' => true, 'props' => ['titulo' => 'Departamentos']],
                ['id' => 'fb-3', 'type' => 'BannersPromocionais', 'isVisible' => true, 'props' => ['quantidade' => 2]],
            ];
            return response()->json(['status' => 'success', 'data' => $defaultLayout, 'active_menu_id' => null]);
        }

        return response()->json([
            'status' => 'success', 
            'data' => $config->layout_blocks,
            'active_menu_id' => $config->active_menu_id
        ]);
    }

    // Retorna o menu sincronizado para a loja pública (Apenas itens ativos)
    public function getMenu()
    {
        $config = StorefrontConfig::first();
        $activeMenuId = $config ? $config->active_menu_id : null;

        if (!$activeMenuId) {
            return response()->json(['status' => 'success', 'data' => []]);
        }

        $menus = CacheFallbackService::remember('storefront_navigation_menu_active_' . $activeMenuId, 60 * 24, function () use ($activeMenuId) {
            // Busca todos ordenados e só os ativos deste menu config
            $all = NavigationMenu::where('menu_config_id', $activeMenuId)
                ->where('ativo', true)
                ->orderBy('ordem', 'asc')
                ->get();
            
            // Filtra os filhos que têm pai inativo.
            $activeIds = $all->pluck('id')->toArray();
            
            return $all->filter(function($item) use ($activeIds) {
                if ($item->parent_id) {
                    return in_array($item->parent_id, $activeIds);
                }
                return true;
            })->values();
        });

        return response()->json(['status' => 'success', 'data' => $menus]);
    }

    // Retorna categorias ativas para a loja
    public function getCategories()
    {
        $categories = CacheFallbackService::remember('storefront_categories_active', 60 * 24, function () {
            return Category::where('status', 'ativo')->orderBy('ordem', 'asc')->get();
        });
        return response()->json(['status' => 'success', 'data' => $categories]);
    }

    // Retorna produtos para a loja (com paginação e filtros)
    public function getProducts(Request $request)
    {
        $query = Produto::query()
            ->with(['categoria', 'variacoes'])
            ->where('ativo', true)
            ->where('status_vitrine', 'ATIVO')
            ->where('quantidade_estoque', '>', 0);

        if ($request->filled('category_id')) {
            $query->where('categoria_id', $request->integer('category_id'));
        }

        if ($request->boolean('is_featured')) {
            $query->where('destaque', true);
        }

        $searchTerm = trim((string) $request->query('q', ''));

        if ($searchTerm !== '') {
            $query->where('nome', 'like', '%' . $searchTerm . '%');
        }

        $products = $query->orderByDesc('created_at')->paginate(12);

        return response()->json(['status' => 'success', 'data' => $products]);
    }

    // Retorna um produto detalhado por ID ou slug
    public function getProduct($id)
    {
        $product = Produto::query()
            ->with(['categoria', 'variacoes'])
            ->where('ativo', true)
            ->where('status_vitrine', 'ATIVO')
            ->where(function ($query) use ($id): void {
                $query->where('id', $id)->orWhere('slug', $id);
            })
            ->first();

        if (! $product) {
            return response()->json(['status' => 'error', 'message' => 'Produto não encontrado'], 404);
        }

        return response()->json(['status' => 'success', 'data' => $product]);
    }

    // Salva a nova configuração da vitrine
    public function publishVitrine(Request $request)
    {
        $request->validate([
            'layout_blocks' => 'required|array',
            'active_menu_id' => 'nullable|exists:menu_configs,id'
        ]);

        $config = StorefrontConfig::firstOrCreate(['id' => 1]);
        $config->layout_blocks = $request->layout_blocks;
        
        if ($request->has('active_menu_id')) {
            $config->active_menu_id = $request->active_menu_id;
            CacheFallbackService::forget('storefront_navigation_menu_active_' . $request->active_menu_id);
        }
        
        $config->save();

        return response()->json([
            'status' => 'success', 
            'message' => 'Vitrine publicada com sucesso! A loja já está atualizada.'
        ]);
    }

    // Processa o Checkout da loja
    public function checkout(Request $request)
    {
        $request->validate([
            'cliente.email' => 'required|email',
            'cliente.nome' => 'required|string',
            'cliente.cpf' => 'nullable|string',
            'cliente.telefone' => 'nullable|string',
            'endereco.cep' => 'required|string',
            'endereco.rua' => 'required|string',
            'endereco.numero' => 'required|string',
            'endereco.bairro' => 'required|string',
            'endereco.cidade' => 'required|string',
            'endereco.uf' => 'required|string',
            'items' => 'required|array',
            'items.*.id' => 'required',
            'items.*.quantity' => 'required|integer|min:1',
            'pagamento.metodo' => 'required|string|in:tokenized_card,pix,boleto',
            'pagamento.parcelas' => 'nullable|integer|min:1|max:24',
            'pagamento.provider' => 'nullable|string|max:50',
            'pagamento.token' => 'nullable|string|max:4096',
        ]);

        $paymentData = $request->input('pagamento', []);
        $forbiddenCardFields = [
            'card_number', 'numero_cartao', 'numeroCartao', 'pan',
            'cvv', 'cvc', 'cvvCartao', 'validadeCartao', 'nomeCartao',
        ];

        if (array_intersect($forbiddenCardFields, array_keys($paymentData)) !== []) {
            return response()->json([
                'status' => 'error',
                'message' => 'Dados brutos de cartao nao sao aceitos. Use tokenizacao do gateway.',
            ], 422);
        }

        \DB::beginTransaction();

        try {
            // 1. Achar ou Criar o Cliente
            $user = \App\Models\User::firstOrCreate(
                ['email' => $request->input('cliente.email')],
                [
                    'name' => $request->input('cliente.nome'),
                    'cpf' => $request->input('cliente.cpf'),
                    'telefone' => $request->input('cliente.telefone'),
                    'role' => 'cliente',
                    'password' => \Hash::make(\Str::random(12)), // Senha aleatória para convidado
                ]
            );

            // 2. Calcular Totais
            $subtotal = 0;
            $itemsToSave = [];

            foreach ($request->input('items') as $itemInput) {
                $product = Produto::find($itemInput['id']);
                if (!$product) continue;
                
                $price = $product->preco_promo ?: $product->preco;
                $quantity = $itemInput['quantity'];
                
                $subtotal += $price * $quantity;
                
                $itemsToSave[] = [
                    'product_id' => $product->id, // Para referência futura, mas salvaremos os dados reais.
                    'sku' => $product->sku_ref ?? ('SKU-'.$product->id),
                    'product_name' => $product->nome,
                    'quantity' => $quantity,
                    'price' => $price,
                    'product_image' => $product->img,
                ];
            }

            // Exemplo de Frete Fixo
            $frete = 15.90;
            $total = $subtotal + $frete;

            // 3. Criar o Pedido
            $order = \App\Models\Order::create([
                'user_id' => $user->id,
                'subtotal' => $subtotal,
                'frete' => $frete,
                'desconto' => 0,
                'total' => $total,
                'status' => 'pending', // Pagamento Pendente
                'payment_gateway' => 'hub_default',
                'payment_method' => $request->input('pagamento.metodo'),
                'payment_installments' => $request->input('pagamento.parcelas', 1),
            ]);

            // 4. Salvar Itens
            foreach ($itemsToSave as $itemData) {
                \App\Models\OrderItem::create([
                    'order_id' => $order->id,
                    'sku' => $itemData['sku'],
                    'product_name' => $itemData['product_name'],
                    'quantity' => $itemData['quantity'],
                    'price' => $itemData['price'],
                ]);
            }

            // 5. Salvar Endereço
            \App\Models\OrderAddress::create([
                'order_id' => $order->id,
                'cep' => $request->input('endereco.cep'),
                'rua' => $request->input('endereco.rua'),
                'num' => $request->input('endereco.numero'),
                'complemento' => $request->input('endereco.complemento'),
                'bairro' => $request->input('endereco.bairro'),
                'cidade' => $request->input('endereco.cidade'),
                'uf' => $request->input('endereco.uf'),
            ]);

            // 6. Processar Pagamento via Gateway API
            $paymentService = new PaymentGatewayService();
            $paymentResult = $paymentService->processPayment(
                $order,
                $request->input('pagamento'),
                $request->input('cliente'),
                $request->input('endereco')
            );

            if (($paymentResult['status'] ?? null) !== 'approved') {
                \DB::rollBack();

                return response()->json([
                    'status' => 'error',
                    'code' => $paymentResult['code'] ?? 'PAYMENT_UNAVAILABLE',
                    'message' => 'Pagamento temporariamente indisponivel.',
                ], 503);
            }

            $order->status = 'paid';
            $order->payment_gateway = $paymentResult['gateway'];
            $order->save();
            
            \DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Pedido criado e pagamento aprovado com sucesso.',
                'data' => [
                    'order_id' => $order->id,
                    'transaction_id' => $paymentResult['transaction_id'],
                    'total' => $order->total,
                ]
            ]);

        } catch (\Throwable $exception) {
            \DB::rollBack();

            Log::error('Falha interna no checkout.', [
                'exception' => $exception::class,
                'request_id' => $request->header('X-Request-ID'),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Nao foi possivel processar o checkout.',
            ], 500);
        }
    }
}