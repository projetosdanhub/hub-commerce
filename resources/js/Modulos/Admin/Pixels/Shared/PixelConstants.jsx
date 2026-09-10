// ============================================================================
// FICHEIRO: resources/js/Modulos/Admin/Pixels/Compartilhado/PixelConstants.jsx
// Constantes, dados de referência e registries do módulo de Tracking
// ============================================================================
import {
    Server, Fingerprint, ShoppingCart,
    DollarSign, Activity, Filter, UserPlus, Users, Target,
    TrendingUp, Database, Globe, MousePointer2, MousePointerClick,
    CreditCard, AlertTriangle
} from 'lucide-react';

// --- Transição padrão de abas ---
export const tabTransition = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.24, ease: [0.25, 1, 0.5, 1] } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeInOut" } }
};

// --- Lista de eventos padrão (standard) ---
export const standardEvents = [
    'PageView','ViewContent','Search','AddToWishlist','AddToCart',
    'InitiateCheckout','AddPaymentInfo','Purchase','Subscribe','StartTrial',
    'CompleteRegistration','Contact','FindLocation','Schedule',
    'CustomizeProduct','Donate','SubmitApplication','Lead'
];

// --- Eventos Nativos da plataforma (tabela completa) ---
export const nativeEventsList = [
    { key: 'pageView', nome: 'PageView', desc: 'Em todas as páginas do site', layer: 'url, referrer, source' },
    { key: 'viewContent', nome: 'ViewContent', desc: 'Visualização da página de Produto', layer: 'content_ids, content_name, value, currency, content_type' },
    { key: 'addToCart', nome: 'AddToCart', desc: 'Adição ao Carrinho de compras', layer: 'content_ids, value, currency, num_items' },
    { key: 'addToWishlist', nome: 'AddToWishlist', desc: 'Adição a lista de desejos', layer: 'content_ids, value, currency' },
    { key: 'initiateCheckout', nome: 'InitiateCheckout', desc: 'Início da finalização de compra', layer: 'content_ids, value, currency, num_items' },
    { key: 'addPaymentInfo', nome: 'AddPaymentInfo', desc: 'Dados de pagamento preenchidos', layer: 'value, currency' },
    { key: 'purchase', nome: 'Purchase', desc: 'Pedido confirmado e pago', layer: 'transaction_id, order_id, value, currency, content_ids, user_data' },
    { key: 'completeRegistration', nome: 'CompleteRegistration', desc: 'Cadastro de nova conta concluído', layer: 'status, currency, value' },
    { key: 'lead', nome: 'Lead', desc: 'Formulários captados', layer: 'value, currency' },
    { key: 'contact', nome: 'Contact', desc: 'Ações de contato (Botão WhatsApp/Email)', layer: 'value' },
    { key: 'search', nome: 'Search', desc: 'Buscas realizadas na barra do topo', layer: 'search_string, content_ids' },
    { key: 'donate', nome: 'Donate', desc: 'Gorjetas ou Doações realizadas', layer: 'value, currency' },
    { key: 'customizeProduct', nome: 'CustomizeProduct', desc: 'Produto Personalizado', layer: 'content_ids' },
    { key: 'findLocation', nome: 'FindLocation', desc: 'Busca de lojas físicas', layer: 'location' },
    { key: 'schedule', nome: 'Schedule', desc: 'Agendamentos', layer: 'value' },
    { key: 'startTrial', nome: 'StartTrial', desc: 'Início de testes de serviços', layer: 'value, currency' },
    { key: 'submitApplication', nome: 'SubmitApplication', desc: 'Aplicações ou formulários VIP', layer: 'value' },
    { key: 'subscribe', nome: 'Subscribe', desc: 'Assinatura de plano', layer: 'value, currency' },
];

// --- Matriz inicial de estados dos eventos nativos ---
export const initNativos = {
    pageView: true, viewContent: true, addToCart: true, addToWishlist: true,
    initiateCheckout: true, addPaymentInfo: true, purchase: true,
    completeRegistration: true, lead: true, contact: true, search: true,
    donate: true, customizeProduct: true, findLocation: true, schedule: true,
    startTrial: true, submitApplication: true, subscribe: true
};

// --- Catálogo de Métricas (Dicionário de Dados) ---
export const dictionaryData = [
    { id: 'receita_bruta', group: 'KPIs Executivos', title: 'Receita Bruta Atribuída', desc: 'Soma do valor bruto dos pedidos válidos no período. Não contabiliza pedidos "Cancelados" ou "Reembolsados".', formula: 'SUM(valor) WHERE status IN (pago)' },
    { id: 'receita_liquida', group: 'KPIs Executivos', title: 'Receita Líquida', desc: 'Receita bruta subtraindo-se o valor de devoluções, cancelamentos e estornos.', formula: 'Receita Bruta - Estornos - Devoluções' },
    { id: 'pedidos', group: 'KPIs Executivos', title: 'Pedidos (Conversões)', desc: 'Quantidade de pedidos confirmados/pagos lidos pelo banco de dados central (Fonte da Verdade).', formula: 'COUNT(pedidos_pagos)' },
    { id: 'ticket_medio', group: 'KPIs Executivos', title: 'Ticket Médio (AOV)', desc: 'Receita atribuída dividida pela quantidade de pedidos. Indica o gasto médio de cada cliente.', formula: 'Receita Bruta ÷ Pedidos' },
    { id: 'cac_roas', group: 'KPIs Executivos', title: 'CAC e ROAS', desc: 'O Custo de Aquisição (CAC) cruza o valor investido nas plataformas com os Novos Clientes. ROAS é o retorno bruto da campanha.', formula: 'Custo ÷ Conversões | Receita ÷ Custo' },
    { id: 'ltv', group: 'KPIs Executivos', title: 'LTV (Lifetime Value)', desc: 'O valor estimado que cada cliente deixa na loja ao longo de sua vida útil.', formula: 'Ticket Médio × Frequência de Compra' },
    { id: 'taxa_conversao', group: 'Funil & Conversão', title: 'Taxa de Conversão', desc: 'Percentual de acessos que se tornaram receita real.', formula: '(Compras ÷ PageViews) × 100' },
    { id: 'cart_abandon', group: 'Funil & Conversão', title: 'Cart Abandonment Rate', desc: 'Percentual de carrinhos que não finalizaram a compra.', formula: '(1 - (Compras ÷ AddToCart)) × 100' },
    { id: 'checkout_abandon', group: 'Funil & Conversão', title: 'Checkout Abandonment', desc: 'Eficiência da página de pagamento.', formula: '(1 - (Compras ÷ InitiateCheckout)) × 100' },
    { id: 'emq', group: 'Tracking Health', title: 'Event Match Quality (EMQ)', desc: 'Qualidade dos identificadores (E-mail, FBC, FBP) recebidos pelas plataformas. A HUB atinge nota máxima ao utilizar a CAPI Server-Side enriquecida com Hash SHA-256.', formula: 'Score Meta (0 a 10)' },
    { id: 'delivery_rate', group: 'Tracking Health', title: 'Event Delivery Rate', desc: 'Percentual de eventos processados e entregues com sucesso aos destinos (Meta, TikTok, GA4) driblando AdBlockers.', formula: '(Eventos Entregues ÷ Eventos Recebidos) × 100' },
    { id: 'dedup_rate', group: 'Tracking Health', title: 'Deduplication Rate', desc: 'O motor da HUB gera um event_id único no Front-End para garantir que disparos Simultâneos de Browser e Server não dupliquem dados no Pixel.', formula: 'Unique event_id match' }
];

// --- Categorias de Payload (CAPI Builder) ---
export const payloadCategories = [
    {
        title: 'Dados do servidor', desc: 'Chaves usadas no envio server-side quando fornecidas pela operação.', icon: Server, color: 'text-indigo-600', bg: 'bg-indigo-50/50', border: 'border-indigo-100',
        items: [
            { key: 'event_id', label: 'Event ID', tip: 'Código único para deduplicação (Browser x Server).' },
            { key: 'event_time', label: 'Event Time', tip: 'Timestamp UNIX de quando o evento ocorreu.' },
            { key: 'event_source_url', label: 'Source URL', tip: 'A URL exata onde o evento aconteceu.' },
            { key: 'action_source', label: 'Action Source', tip: 'Origem da ação (ex: website, app, physical_store).' },
            { key: 'client_ip_address', label: 'Endereço IP', tip: 'IP do cliente. Essencial para match de CAPI.' },
            { key: 'client_user_agent', label: 'User Agent', tip: 'Navegador e SO do cliente.' },
            { key: 'fbc', label: 'Click ID (fbc)', tip: 'Cookie do Facebook com o ID do clique do anúncio.' },
            { key: 'fbp', label: 'Browser ID (fbp)', tip: 'Cookie do Facebook que identifica o navegador.' },
            { key: 'opt_out', label: 'Opt Out', tip: 'Sinalizador de permissão de rastreamento (LGPD).' }
        ]
    },
    {
        title: 'Informações do cliente', desc: 'Dados enviados somente quando disponíveis e permitidos pela operação.', icon: Fingerprint, color: 'text-emerald-600', bg: 'bg-emerald-50/50', border: 'border-emerald-100',
        items: [
            { key: 'em', label: 'E-mail', tip: 'E-mail do cliente (hasheado).' },
            { key: 'ph', label: 'Telefone', tip: 'Número de telefone com DDI (hasheado).' },
            { key: 'fn', label: 'Nome', tip: 'Primeiro nome do cliente.' },
            { key: 'ln', label: 'Sobrenome', tip: 'Sobrenome do cliente.' },
            { key: 'ct', label: 'Cidade', tip: 'Cidade do cliente.' },
            { key: 'st', label: 'Estado/Província', tip: 'Estado do cliente.' },
            { key: 'country', label: 'País', tip: 'Código do país (ex: BR, PT).' },
            { key: 'zp', label: 'CEP/Zip', tip: 'Código postal do cliente.' },
            { key: 'ge', label: 'Gênero', tip: 'Gênero do cliente (m/f).' },
            { key: 'db', label: 'Nascimento', tip: 'Data de nascimento (YYYYMMDD).' },
            { key: 'external_id', label: 'User ID', tip: 'ID interno do cliente no seu banco de dados.' }
        ]
    },
    {
        title: 'E-commerce e conversão', desc: 'Dados de produto e transação fornecidos pela operação.', icon: ShoppingCart, color: 'text-orange-600', bg: 'bg-orange-50/50', border: 'border-orange-100',
        items: [
            { key: 'value', label: 'Valor da Conversão', tip: 'Valor monetário do evento.' },
            { key: 'currency', label: 'Moeda', tip: 'Moeda da transação (ex: BRL, USD).' },
            { key: 'content_name', label: 'Nome do Item', tip: 'Nome do produto ou conteúdo visualizado.' },
            { key: 'content_ids', label: 'SKU / ID', tip: 'ID ou SKU do produto (Array).' },
            { key: 'content_type', label: 'Tipo', tip: 'Ex: product ou product_group.' },
            { key: 'num_items', label: 'Qtd. Itens', tip: 'Quantidade de produtos envolvidos na ação.' },
            { key: 'order_id', label: 'Order ID', tip: 'ID único do pedido finalizado.' },
            { key: 'search_string', label: 'Termo de Busca', tip: 'O que o usuário pesquisou no site.' },
            { key: 'subscription_id', label: 'ID de Assinatura', tip: 'ID gerado para assinaturas recorrentes.' }
        ]
    }
];

// --- Base Card Props builder para KPIs do Dashboard ---
const hasMetricValue = (value) => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
const metricNumber = (value) => hasMetricValue(value) ? Number(value) : null;
const metricCurrency = (value) => {
    const numeric = metricNumber(value);
    return numeric === null ? '—' : `R$ ${numeric.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
};
const metricInteger = (value) => {
    const numeric = metricNumber(value);
    return numeric === null ? '—' : numeric.toLocaleString('pt-BR');
};
const metricPercent = (value) => {
    const numeric = metricNumber(value);
    return numeric === null ? '—' : `${numeric.toFixed(2)}%`;
};
const metricRatio = (value) => {
    const numeric = metricNumber(value);
    return numeric === null ? '—' : `${numeric.toFixed(2)}x`;
};

export const buildBaseCardProps = (met = {}) => ({
    receita_bruta: { label: 'Receita Bruta Atribuída', valor: metricCurrency(met.receita_bruta), icon: DollarSign, color: 'text-emerald-600', tooltip: 'Faturamento validado dos pedidos do banco de dados.', formula: 'Σ(orders.total) WHERE status NOT IN(CANCELADO, REEMBOLSADO)' },
    receita_liquida: { label: 'Receita Líquida', valor: metricCurrency(met.receita_liquida), icon: Activity, color: 'text-emerald-500', tooltip: 'Receita bruta menos devoluções e cancelamentos.', formula: 'Receita Bruta - Estornos' },
    pedidos: { label: 'Pedidos Confirmados', valor: metricInteger(met.pedidos), icon: ShoppingCart, color: 'text-blue-600', tooltip: 'Quantidade de checkouts aprovados reais.', formula: 'COUNT(orders.id)' },
    itens_vendidos: { label: 'Itens Vendidos', valor: metricInteger(met.itens_vendidos), icon: Database, color: 'text-blue-500', tooltip: 'Total de produtos físicos vendidos.', formula: 'Σ(order_items.qty)' },
    ticket_medio: { label: 'Ticket Médio (AOV)', valor: metricCurrency(met.ticket_medio), icon: TrendingUp, color: 'text-slate-800', tooltip: 'Média gasta por cliente em cada pedido válido.', formula: 'Receita Bruta ÷ Pedidos' },
    taxa_conversao: { label: 'Taxa de Conversão (CR)', valor: metricPercent(met.taxa_conversao), icon: Filter, color: 'text-slate-800', tooltip: 'Porcentagem de acessos que geraram compra.', formula: '(Pedidos ÷ PageViews) × 100' },
    novos_clientes: { label: 'Novos Clientes', valor: metricInteger(met.novos_clientes), icon: UserPlus, color: 'text-purple-600', tooltip: 'Clientes na primeira compra.', formula: 'COUNT DISTINCT user_id (first purchase)' },
    clientes_recorrentes: { label: 'Clientes Recorrentes', valor: metricInteger(met.clientes_recorrentes), icon: Users, color: 'text-purple-500', tooltip: 'Clientes com mais de uma compra.', formula: 'COUNT DISTINCT user_id (repeat purchase)' },
    cac: { label: 'CAC', valor: metricCurrency(met.cac), icon: Target, color: 'text-rose-500', tooltip: 'Custo de aquisição de clientes.', formula: 'Gasto Ads ÷ Novos Clientes' },
    roas: { label: 'ROAS Geral', valor: metricRatio(met.roas), icon: Activity, color: 'text-emerald-600', tooltip: 'Retorno sobre investimento.', formula: 'Receita atribuída ÷ Investimento' },
    ltv: { label: 'LTV Médio', valor: metricCurrency(met.ltv), icon: Database, color: 'text-indigo-600', tooltip: 'Lifetime Value médio dos clientes.', formula: 'Receita Total ÷ Clientes Únicos' },
    margem_bruta: { label: 'Margem Bruta', valor: metricPercent(met.margem_bruta), icon: TrendingUp, color: 'text-emerald-500', tooltip: 'Margem de lucro sobre os produtos.', formula: '(Lucro Bruto ÷ Receita Líquida) × 100' },
    sessoes: { label: 'Sessões', valor: metricInteger(met.sessoes), icon: Globe, color: 'text-sky-600', tooltip: 'Sessões únicas na loja.', formula: 'COUNT DISTINCT session_id' },
    page_views: { label: 'Total PageViews', valor: metricInteger(met.page_views), icon: Globe, color: 'text-sky-500', tooltip: 'Visualizações de página rastreadas no Data Layer.', formula: 'COUNT(event) WHERE event = PageView' },
    view_item: { label: 'View Item (Produtos)', valor: metricInteger(met.view_item), icon: MousePointer2, color: 'text-sky-400', tooltip: 'Visualizações de página de produto.', formula: 'COUNT(event) WHERE event = ViewContent' },
    add_to_cart: { label: 'Adições ao Carrinho', valor: metricInteger(met.add_to_cart), icon: MousePointerClick, color: 'text-orange-500', tooltip: 'Total de itens que entraram no carrinho.', formula: 'COUNT(event) WHERE event = AddToCart' },
    begin_checkout: { label: 'Checkouts Iniciados', valor: metricInteger(met.begin_checkout), icon: CreditCard, color: 'text-orange-600', tooltip: 'Checkouts iniciados.', formula: 'COUNT(event) WHERE event = InitiateCheckout' },
    add_payment_info: { label: 'Info. Pagamento', valor: metricInteger(met.add_payment_info), icon: CreditCard, color: 'text-orange-400', tooltip: 'Eventos de inserção de pagamento.', formula: 'COUNT(event) WHERE event = AddPaymentInfo' },
    abandono_carrinho: { label: 'Abandono de Carrinho', valor: metricPercent(met.abandono_carrinho), icon: AlertTriangle, color: 'text-rose-500', tooltip: 'Usuários que colocaram no carrinho mas não compraram.', formula: '(1 - (Pedidos ÷ AddToCart)) × 100' },
    abandono_checkout: { label: 'Abandono de Checkout', valor: metricPercent(met.abandono_checkout), icon: AlertTriangle, color: 'text-rose-600', tooltip: 'Pessoas que iniciaram pagamento mas abandonaram.', formula: '(1 - (Pedidos ÷ InitiateCheckout)) × 100' },
});