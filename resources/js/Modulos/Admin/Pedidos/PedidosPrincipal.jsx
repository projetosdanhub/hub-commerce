// ============================================================================
// FICHEIRO: resources/js/Modulos/Admin/AdminOrders.jsx
// ARQUITETURA: Gestão de Pedidos 100% API | Expedição Inteligente Integrada
// UI/UX: Minimal SaaS Premium | Fluid Elements | Acessibilidade Maximizada
// ============================================================================

import React, { useState, useMemo, useEffect, Component } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient, QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../../api';
import {
  dicMelhorEnvio,
  safeNum, formatCurrency, formatSmartCurrency,
  formatDateBR, formatDateTimeBR, parseCoupons,
  calcularDescontosReais, getCarrierLogo, getLogInfo, deduceCarrier
} from './Compartilhado/PedidosUtils';

import {
  OrdersSkeleton, ProgressButton, HoverProgressRoundButton,
  DateFilterPopup, AnimatedNotification, RenderStepper
} from './Compartilhado/PedidosUI';
import { Icons } from './Compartilhado/PedidosIcons';



const queryClient = new QueryClient({
    defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 1000 * 60 * 5 } },
});

const tabTransition = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.24, ease: [0.25, 1, 0.5, 1] } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.12, ease: "easeInOut" } }
};

class ErrorBoundary extends Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null, errorInfo: null }; }
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(error, errorInfo) { this.setState({ error, errorInfo }); console.error("Erro no módulo:", error); }
    render() {
        if (this.state.hasError) return (
            <div className="p-8 m-8 bg-rose-50 border border-rose-200 rounded-2xl shadow-sm">
                <h2 className="text-xl font-black text-rose-600 mb-4 flex items-center gap-2">
                    <Icons.AlertTriangle className="w-6 h-6" /> Erro de Renderização Contido
                </h2>
                <div className="bg-white p-4 rounded-xl border border-rose-100 overflow-auto text-[10px] font-mono text-slate-800 shadow-inner max-h-48 mb-4">
                    <p className="font-bold text-rose-500 mb-2">{String(this.state.error)}</p>
                    <p className="whitespace-pre-wrap text-slate-500">{this.state.errorInfo?.componentStack}</p>
                </div>
                <button type="button" onClick={() => window.location.reload()} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition-colors shadow-sm">Recarregar Página</button>
            </div>
        );
        return this.props.children;
    }
}

// ==========================================
// DICIONÁRIO COMPLETO DE ÍCONES BLINDADOS
// ==========================================

const statusConfig = {
    'A_PAGAR': { label: 'A Pagar', cor: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    'SEPARACAO': { label: 'Em Separação', cor: 'bg-sky-50 text-sky-700 border-sky-200' },
    'SEPARADO': { label: 'Separado (Falta Envio)', cor: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    'DESPACHADO': { label: 'Enviado', cor: 'bg-purple-50 text-purple-700 border-purple-200' },
    'ENTREGUE': { label: 'Entregue', cor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    'EM_ANALISE_REEMBOLSO': { label: 'Em Análise', cor: 'bg-amber-50 text-amber-700 border-amber-200' },
    'REEMBOLSADO': { label: 'Reembolsados', cor: 'bg-rose-50 text-rose-700 border-rose-200' },
    'CANCELADO': { label: 'Cancelados', cor: 'bg-slate-100 text-slate-600 border-slate-300' }
};


const TABS_INTELIGENTES = [
    { key: 'TUDO', label: 'Todos' },
    { key: 'A_PAGAR', label: 'A Pagar' },
    { key: 'SEPARACAO', label: 'Em Separação' },
    { key: 'SEPARADO', label: 'Separados' },
    { key: 'DESPACHADO', label: 'Enviados' },
    { key: 'ENTREGUE', label: 'Entregues' },
    { key: 'CANCELADO', label: 'Cancelados' },
    { key: 'REEMBOLSADO', label: 'Reembolsados' }
];






// ============================================================================
// CONTEÚDO PRINCIPAL
// ============================================================================
const AdminOrdersContent = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const orderIdUrl = searchParams.get('id');
    const navigate = useNavigate(); 
    const queryClientLocal = useQueryClient();
    const prefixo = "HUB-"; 
    
    // ESTADOS GLOBAIS
    const [abaAtiva, setAbaAtiva] = useState('TUDO');
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const [itensPorPagina, setItensPorPagina] = useState(10);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [detailTab, setDetailTab] = useState('RESUMO'); 
    const [toast, setToast] = useState({ show: false, message: '', status: '' });
    const showToast = (message, status = 'success') => { setToast({ show: true, message, status }); setTimeout(() => setToast({ show: false, message: '', status: '' }), 3000); };
    
    const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
    const [showMetricsHelp, setShowMetricsHelp] = useState(false);
    const [isManualRefresh, setIsManualRefresh] = useState(false);
    
    const [itemsPage, setItemsPage] = useState(1);
    const itemsPerPage = 3;

    // Timeline Filtros
    const [timelinePeriodo, setTimelinePeriodo] = useState({ start: '', end: '' });
    const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
    const [loadingTimeline, setLoadingTimeline] = useState(false);
    const [timelinePage, setTimelinePage] = useState(1);
    const timelinePerPage = 6;

    const [dashDateOpen, setDashDateOpen] = useState(false);
    const [dashDateRange, setDashDateRange] = useState({ start: '', end: '' });

    // 🟢 ESTADOS DO MODAL & FLUXO DE EXPEDIÇÃO & MELHOR ENVIO COTAÇÃO
    const [modalAcao, setModalAcao] = useState({ isOpen: false, tipo: null, data: {} });
    const [formModal, setFormModal] = useState({ 
        motivo: '', tracking: '', refundMethod: 'ESTORNO', file: null,
        dispatchType: 'MANUAL', docTipo: 'DECLARACAO', mePagarCarteira: false,
        carrierId: '', meCarrierId: '',
        packageId: '',
        volAltura: '', volLargura: '', volComprimento: '', volPeso: '',
        insuranceValue: ''
    });
    const [loadingAcao, setLoadingAcao] = useState(false);
    const [shippingRates, setShippingRates] = useState([]);
    const [isCalculatingME, setIsCalculatingME] = useState(false);
    const [navigatingOrder, setNavigatingOrder] = useState(null);

    // 🟢 FETCH PEDIDOS
    const { data: fetchResult = {}, isLoading: carregandoPedidos, refetch } = useQuery({
        queryKey: ['adminOrders'],
        queryFn: async () => { const res = await api.get('/admin/orders'); return res.data; },
        refetchInterval: 15000,
    });
    const pedidosDaApi = fetchResult.data || [];

    // 🟢 FETCH TRANSPORTADORAS MANUAIS
    const { data: carriersApi = [] } = useQuery({
        queryKey: ['adminCarriers'],
        queryFn: async () => {
            try { const res = await api.get('/admin/carriers'); return res.data.data; } 
            catch(e) { return []; }
        }
    });

    // 🟢 FETCH EMBALAGENS (VOLUMES SALVOS)
    const { data: packagesApi = [] } = useQuery({
        queryKey: ['adminPackages'],
        queryFn: async () => {
            try { const res = await api.get('/admin/shipping-packages'); return res.data.data; } 
            catch(e) { return []; }
        }
    });

    // 🟢 FETCH CONFIGURAÇÕES DO MELHOR ENVIO
    const { data: meResult } = useQuery({
        queryKey: ['melhorEnvioSettings'],
        queryFn: async () => { const res = await api.get('/admin/melhorenvio/settings'); return res.data; }
    });

    const isMEAuthenticated = meResult?.data?.is_authenticated || false;
    const meCarriersAtivas = useMemo(() => {
        const ativas = meResult?.data?.carriers_ativas?.filter(c => c.ativo) || [];
        return dicMelhorEnvio.filter(m => ativas.find(a => a.id === m.id || a.nome === m.key)).map(m => ({ ...m, nome: m.key }));
    }, [meResult]);

    const handleRefresh = async () => {
        setIsManualRefresh(true);
        await refetch();
        setTimeout(() => setIsManualRefresh(false), 800);
    };

    useEffect(() => {
        if (orderIdUrl && pedidosDaApi.length > 0) {
            const pedidoAlvo = pedidosDaApi.find(p => String(p.id) === String(orderIdUrl));
            if (pedidoAlvo && (!pedidoSelecionado || pedidoSelecionado.id !== pedidoAlvo.id)) {
                setPedidoSelecionado(pedidoAlvo);
            } else if (!pedidoAlvo) { setSearchParams({}); }
        }
    }, [orderIdUrl, pedidosDaApi]); 

    useEffect(() => {
        if (pedidoSelecionado && pedidosDaApi.length > 0) {
            const pedidoAtualizado = pedidosDaApi.find(p => p.id === pedidoSelecionado.id);
            if (pedidoAtualizado && JSON.stringify(pedidoAtualizado) !== JSON.stringify(pedidoSelecionado)) {
                setPedidoSelecionado(pedidoAtualizado);
            }
        }
    }, [pedidosDaApi]);

    const handleFecharPedido = () => {
        setPedidoSelecionado(null);
        setDetailTab('RESUMO');
        setItemsPage(1);
        if (orderIdUrl) setSearchParams({});
    };

    const aplicarFiltroTimeline = () => {
        setLoadingTimeline(true);
        setTimeout(() => { setLoadingTimeline(false); setIsTimelineModalOpen(false); }, 800);
    };

    const handlePackageChange = (e) => {
        const pkgId = e.target.value;
        if (!pkgId) {
            setFormModal({...formModal, packageId: '', volAltura: '', volLargura: '', volComprimento: '', volPeso: ''});
            return;
        }
        const pkg = packagesApi.find(p => String(p.id) === String(pkgId));
        if (pkg) {
            setFormModal({
                ...formModal,
                packageId: pkgId,
                volAltura: pkg.altura,
                volLargura: pkg.largura,
                volComprimento: pkg.comprimento,
                volPeso: pkg.peso_vazio 
            });
        }
    };

    const handleCalculateShipping = async () => {
        if (!formModal.volAltura || !formModal.volLargura || !formModal.volComprimento || !formModal.volPeso) {
            return alert("Por favor, preencha todos os campos de volumetria e peso para simular o frete.");
        }
        if (Number(formModal.insuranceValue) < Number(pedidoSelecionado?.total || 0)) {
            return alert(`O valor segurado deve ser no mínimo o valor do pedido (R$ ${pedidoSelecionado?.total || 0}).`);
        }
        
        setIsCalculatingME(true);
        try {
            const payload = {
                to_postal_code: pedidoSelecionado.endereco.cep || pedidoSelecionado.endereco.zip_code,
                height: formModal.volAltura,
                width: formModal.volLargura,
                length: formModal.volComprimento,
                weight: formModal.volPeso,
                insurance_value: formModal.insuranceValue
            };
            const res = await api.post('/admin/melhorenvio/calculate', payload);
            setShippingRates(res.data.data);
            setIsCalculatingME(false);
        } catch (error) {
            console.error("Erro na cotação:", error);
            const msg = error.response?.data?.message || "Erro na cotação.";
            alert(msg + " Verifique se as dimensões estão corretas e se o Endereço Remetente foi salvo nas Configurações.");
            setIsCalculatingME(false);
            setShippingRates([]);
        }
    };

    // 🟢 MUTAÇÕES
    const mutacaoGenericaStatus = useMutation({
        mutationFn: async ({ id, formData }) => await api.post(`/admin/orders/${id}/status-manual`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
        onSuccess: () => {
            queryClientLocal.invalidateQueries({ queryKey: ['adminOrders'] });
            setModalAcao({ isOpen: false, tipo: null, data: {} });
            setLoadingAcao(false);
            showToast('Operação realizada com sucesso!');
        },
        onError: (err) => {
            queryClientLocal.invalidateQueries({ queryKey: ['adminOrders'] });
            setModalAcao({ isOpen: false, tipo: null, data: {} });
            setLoadingAcao(false);
            const msgErro = err.response?.data?.message || err.message;
            showToast('Erro: ' + msgErro, 'error');
            alert('Falha na integração: ' + msgErro);
        }
    });

    const mutacaoEnvioManual = useMutation({
        mutationFn: async ({ id, rastreio }) => await api.post(`/admin/orders/${id}/dispatch`, { rastreio }),
        onSuccess: () => {
            queryClientLocal.invalidateQueries({ queryKey: ['adminOrders'] });
            setModalAcao({ isOpen: false, tipo: null, data: {} });
            setLoadingAcao(false);
            showToast('Rastreio salvo com sucesso!');
        },
        onError: (err) => {
            setLoadingAcao(false);
            alert('Erro: ' + (err.response?.data?.message || err.message));
        }
    });

    const processarAcaoManual = () => {
        const { tipo } = modalAcao;
        
        if (tipo === 'PAGAR' && (!formModal.motivo.trim() || !formModal.file)) {
            return alert("Para aprovar o pagamento manualmente é obrigatório informar o motivo e anexar o comprovante do pagamento.");
        }
        
        if (['CANCELAR', 'INICIAR_REEMBOLSO', 'PROCESSAR_REEMBOLSO'].includes(tipo) && !formModal.motivo.trim()) {
            return alert("O motivo/parecer é obrigatório para manter o registro de auditoria.");
        }
        if (tipo === 'PROCESSAR_REEMBOLSO' && !formModal.file) return alert("O comprovante do estorno/reembolso é obrigatório.");
        if (tipo === 'ENTREGAR' && !formModal.file) return alert("O comprovante de entrega é obrigatório.");

        if (tipo === 'CONFIGURAR_ENVIO' || tipo === 'ALTERAR_ENVIO') {
            if (!formModal.volAltura || !formModal.volLargura || !formModal.volComprimento || !formModal.volPeso) {
                return alert("Por favor, preencha todas as dimensões de volumetria do pacote.");
            }
            if (formModal.dispatchType === 'MANUAL' && !formModal.carrierId) return alert("Selecione a transportadora manual.");
            if (formModal.dispatchType === 'MELHORENVIO') {
                if (!formModal.meCarrierId) return alert("Selecione um serviço parceiro do Melhor Envio após calcular o frete.");
                if (Number(formModal.insuranceValue) < Number(pedidoSelecionado.total)) {
                    return alert(`O valor segurado deve ser no mínimo o valor do pedido (R$ ${pedidoSelecionado.total}).`);
                }
            }
        }

        if (tipo === 'ALTERAR_RASTREIO') {
            if(!formModal.tracking) return alert("Insira o código de rastreio válido.");
            setLoadingAcao(true);
            mutacaoEnvioManual.mutate({ id: pedidoSelecionado.id, rastreio: formModal.tracking });
            return;
        }

        // 🟢 FLUXO DE CANCELAR ETIQUETA NO CARRINHO DO MELHOR ENVIO
        if (tipo === 'CANCELAR_ME_CART') {
            setLoadingAcao(true);
            api.post(`/admin/orders/${pedidoSelecionado.id}/cancel-me-cart`)
                .then(() => {
                    queryClientLocal.invalidateQueries({ queryKey: ['adminOrders'] });
                    showToast('Etiqueta removida do carrinho com sucesso!');
                    abrirModal('ALTERAR_ENVIO');
                })
                .catch((err) => {
                    alert('Erro ao cancelar etiqueta no Melhor Envio: ' + (err.response?.data?.message || err.message));
                })
                .finally(() => {
                    setLoadingAcao(false);
                });
            return;
        }

        setLoadingAcao(true);
        const formData = new FormData();
        
        formData.append('acao', (tipo === 'CONFIGURAR_ENVIO' || tipo === 'ALTERAR_ENVIO') ? 'DESPACHAR' : tipo); 
        
        if (formModal.motivo) formData.append('motivo', formModal.motivo);
        if (formModal.refundMethod) formData.append('refund_method', formModal.refundMethod);
        if (formModal.file) formData.append('arquivo', formModal.file);

        if (tipo === 'CONFIGURAR_ENVIO' || tipo === 'ALTERAR_ENVIO') {
            formData.append('tracking_code', formModal.tracking);
            formData.append('dispatch_type', formModal.dispatchType);
            formData.append('doc_tipo', formModal.docTipo);
            formData.append('vol_altura', formModal.volAltura);
            formData.append('vol_largura', formModal.volLargura);
            formData.append('vol_comprimento', formModal.volComprimento);
            formData.append('vol_peso', formModal.volPeso);
            
            if (formModal.dispatchType === 'MANUAL') formData.append('carrier_id', formModal.carrierId);
            if (formModal.dispatchType === 'MELHORENVIO') {
                formData.append('me_carrier_id', formModal.meCarrierId);
                formData.append('me_pagar_carteira', formModal.mePagarCarteira ? '1' : '0');
                formData.append('me_insurance_value', formModal.insuranceValue);
            }
        }

        mutacaoGenericaStatus.mutate({ id: pedidoSelecionado.id, formData });
    };

    const abrirModal = (tipo) => {
        const defaultPackage = packagesApi.find(p => p.is_default);

        setFormModal({ 
            motivo: '', 
            tracking: tipo === 'ALTERAR_RASTREIO' ? (pedidoSelecionado?.tracking_code || '') : '', 
            refundMethod: 'ESTORNO', file: null,
            dispatchType: isMEAuthenticated ? 'MELHORENVIO' : 'MANUAL', 
            docTipo: 'DECLARACAO', mePagarCarteira: false,
            carrierId: '', meCarrierId: '',
            packageId: defaultPackage ? defaultPackage.id : '',
            volAltura: defaultPackage ? defaultPackage.altura : '', 
            volLargura: defaultPackage ? defaultPackage.largura : '', 
            volComprimento: defaultPackage ? defaultPackage.comprimento : '', 
            volPeso: defaultPackage ? defaultPackage.peso_vazio : '',
            insuranceValue: pedidoSelecionado?.total || ''
        });
        setShippingRates([]);
        setModalAcao({ isOpen: true, tipo, data: pedidoSelecionado });
    };

    const pedidosFiltrados = useMemo(() => {
        let f = pedidosDaApi;
        if (dashDateRange.start) { const s = new Date(dashDateRange.start); s.setHours(0,0,0,0); f = f.filter(p => new Date(p.data_raw || p.created_at) >= s); }
        if (dashDateRange.end) { const e = new Date(dashDateRange.end); e.setHours(23,59,59,999); f = f.filter(p => new Date(p.data_raw || p.created_at) <= e); }
        if (abaAtiva !== 'TUDO') f = f.filter(p => p.status === abaAtiva);
        if (termoPesquisa) {
            const t = termoPesquisa.toLowerCase();
            f = f.filter(p => p.id.toString().includes(t) || (p.cliente?.nome || '').toLowerCase().includes(t));
        }
        return f.sort((a,b) => new Date(b.data_raw || b.created_at) - new Date(a.data_raw || a.created_at));
    }, [pedidosDaApi, abaAtiva, termoPesquisa, dashDateRange]);

    const pedidosPaginados = pedidosFiltrados.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);
    const totalPaginas = Math.ceil(pedidosFiltrados.length / itensPorPagina) || 1;

    const timelineFiltrada = useMemo(() => {
        if (!pedidoSelecionado || !pedidoSelecionado.timeline) return [];
        let logs = pedidoSelecionado.timeline;
        if (timelinePeriodo.start) { const s = new Date(timelinePeriodo.start); s.setHours(0,0,0,0); logs = logs.filter(log => new Date(log.data_raw || log.data) >= s); }
        if (timelinePeriodo.end) { const e = new Date(timelinePeriodo.end); e.setHours(23,59,59,999); logs = logs.filter(log => new Date(log.data_raw || log.data) <= e); }
        return logs;
    }, [pedidoSelecionado, timelinePeriodo]);
    const timelinePaginada = timelineFiltrada.slice((timelinePage - 1) * timelinePerPage, timelinePage * timelinePerPage);
    const totalPaginasTimeline = Math.ceil(timelineFiltrada.length / timelinePerPage) || 1;

    const metricasCalculadas = useMemo(() => {
        const totais = pedidosDaApi.length;
        const aEnviar = pedidosDaApi.filter(p => p.status === 'SEPARACAO').length;
        const pixTotais = pedidosDaApi.filter(p => String(p.pagamento_metodo).toLowerCase().includes('pix')).length;
        const pixPagos = pedidosDaApi.filter(p => String(p.pagamento_metodo).toLowerCase().includes('pix') && !['A_PAGAR', 'CANCELADO'].includes(p.status)).length;
        const conversaoPix = pixTotais > 0 ? ((pixPagos / pixTotais) * 100).toFixed(1) : 0;
        const cancelados = pedidosDaApi.filter(p => p.status === 'CANCELADO').length;
        const taxaCancelamento = totais > 0 ? ((cancelados / totais) * 100).toFixed(1) : 0;
        const reembolsados = pedidosDaApi.filter(p => p.status === 'REEMBOLSADO');
        const qtdReembolsados = reembolsados.length;
        const valorReembolsado = reembolsados.reduce((acc, p) => acc + safeNum(p.total), 0);
        const taxaReembolso = totais > 0 ? ((qtdReembolsados / totais) * 100).toFixed(1) : 0;
        const emAnalise = pedidosDaApi.filter(p => p.status === 'EM_ANALISE_REEMBOLSO').length;
        const ltv = pedidosDaApi.reduce((acc, p) => !['CANCELADO', 'REEMBOLSADO'].includes(p.status) ? acc + safeNum(p.total) : acc, 0);

        return { totais, aEnviar, pixTotais, pixPagos, conversaoPix, cancelados, taxaCancelamento, qtdReembolsados, valorReembolsado, taxaReembolso, emAnalise, ltv };
    }, [pedidosDaApi]);

    if (carregandoPedidos && pedidosDaApi.length === 0) {
        return (
            <div className="w-full min-h-screen pb-20 relative font-sans">
                <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-8 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gestão de Pedidos</h1>
                        <p className="text-sm font-medium text-slate-500 mt-1">Acompanhe transações, status logístico e fluxo de caixa.</p>
                    </div>
                </header>
                <div className="px-4 sm:px-8"><OrdersSkeleton /></div>
            </div>
        );
    }

    // ============================================================================
    // MODAL DE AÇÕES MANUAIS E FLUXOS ESPECÍFICOS
    // ============================================================================
    const renderModalAcoes = () => {
        if (!modalAcao.isOpen) return null;
        
        const isPagamento = modalAcao.tipo === 'PAGAR';
        const isSeparar = modalAcao.tipo === 'SEPARAR';
        const isDespacho = modalAcao.tipo === 'CONFIGURAR_ENVIO' || modalAcao.tipo === 'ALTERAR_ENVIO';
        const isAlterarRastreio = modalAcao.tipo === 'ALTERAR_RASTREIO';
        const isEntrega = modalAcao.tipo === 'ENTREGAR';
        const isCancelar = modalAcao.tipo === 'CANCELAR';
        const isIniciaReembolso = modalAcao.tipo === 'INICIAR_REEMBOLSO';
        const isProcessaReembolso = modalAcao.tipo === 'PROCESSAR_REEMBOLSO';
        const isCancelarMeCart = modalAcao.tipo === 'CANCELAR_ME_CART'; // 🟢 REGRA CADASTRADA

        let titulo = ''; let subtitulo = ''; let iconTitle = null; let confirmText = "Confirmar Ação";
        
        if (isPagamento) { titulo = "Aprovar Pagamento Manual"; subtitulo = "Atenção: O upload do comprovante é obrigatório para auditoria financeira."; iconTitle = <Icons.CreditCard className="w-5 h-5"/>; }
        if (isSeparar) { titulo = "Concluir Separação"; subtitulo = "Confirme que todos os produtos já foram separados fisicamente no estoque."; iconTitle = <Icons.Box className="w-5 h-5"/>; confirmText="Confirmar Separação"; }
        if (isDespacho) { titulo = "Configurar Expedição"; subtitulo = "Selecione o método de envio e a volumetria para gerar as etiquetas."; iconTitle = <Icons.Package className="w-5 h-5"/>; confirmText="Gerar Envio e Despachar";}
        if (isAlterarRastreio) { titulo = "Alterar Código de Rastreio"; subtitulo = "Atualize o código de rastreamento do parceiro logístico."; iconTitle = <Icons.Truck className="w-5 h-5"/>; confirmText="Atualizar Rastreio";}
        if (isEntrega) { titulo = "Confirmar Entrega"; subtitulo = "Marque o pedido como entregue (Comprovante obrigatório)."; iconTitle = <Icons.Check className="w-5 h-5"/>; }
        if (isCancelar) { titulo = "Cancelar Pedido"; subtitulo = "O pedido será cancelado e a reserva de estoque será liberada."; iconTitle = <Icons.AlertTriangle className="text-rose-500 w-6 h-6"/>; confirmText = "Confirmar Cancelamento"; }
        if (isIniciaReembolso) { titulo = "Analisar Devolução"; subtitulo = "Mudar status para Em Análise de Reembolso."; iconTitle = <Icons.AlertTriangle className="text-amber-500 w-6 h-6"/>; confirmText = "Iniciar Análise"; }
        if (isProcessaReembolso) { titulo = "Efetivar Reembolso"; subtitulo = "Aprove e documente o estorno ou saldo gerado."; iconTitle = <Icons.DollarSign className="text-rose-500 w-6 h-6"/>; confirmText = "Finalizar Ciclo"; }
        // 🟢 APARÊNCIA DO NOVO MODAL
        if (isCancelarMeCart) { titulo = "Remover do Carrinho (Melhor Envio)"; subtitulo = "Esta ação vai cancelar a etiqueta pendente no parceiro logístico, permitindo que você configure um novo transporte logo em seguida."; iconTitle = <Icons.AlertTriangle className="text-rose-500 w-6 h-6"/>; confirmText = "Confirmar Exclusão"; }

        return (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer" onClick={() => setModalAcao({...modalAcao, isOpen: false})} />
                
                <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className={`bg-white rounded-2xl shadow-2xl p-8 w-full relative z-10 border border-slate-200 overflow-y-auto custom-scrollbar ${isDespacho ? 'max-w-4xl max-h-[90vh]' : 'max-w-md max-h-[95vh]'}`}>
                    
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCancelar || isProcessaReembolso || isCancelarMeCart ? 'bg-rose-50 text-rose-500' : isIniciaReembolso ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-600'}`}>{iconTitle}</div>
                        <h3 className={`text-xl font-black ${isCancelar || isProcessaReembolso || isCancelarMeCart ? 'text-rose-600' : isIniciaReembolso ? 'text-amber-600' : 'text-slate-900'}`}>{titulo}</h3>
                    </div>
                    <p className="text-sm font-medium text-slate-500 mb-6 leading-relaxed">{subtitulo}</p>

                    <div className="space-y-6 mb-8">
                        
                        {/* 🟢 FLUXO ENVIO MANUAL (MARCAR COMO ENVIADO) */}
                        {isAlterarRastreio && (
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Rastreio Logístico *</label>
                                <input type="text" value={formModal.tracking} onChange={e => setFormModal({...formModal, tracking: e.target.value.toUpperCase()})} placeholder="BR123456789PT" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-mono font-bold text-slate-800 outline-none focus:border-blue-500 shadow-inner" />
                            </div>
                        )}

                        {/* 🟢 FLUXO EXPEDIÇÃO: MELHOR ENVIO VS PARCEIROS MANUAIS */}
                        {isDespacho && (
                            <div className="space-y-8">
                                <div className="bg-slate-50 p-1.5 rounded-xl flex border border-slate-200/60">
                                    <button onClick={() => { setFormModal({...formModal, dispatchType: 'MANUAL'}); setShippingRates([]); }} className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${formModal.dispatchType === 'MANUAL' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
                                        Parcerias Próprias
                                    </button>
                                    
                                    {isMEAuthenticated && (
                                        <button onClick={() => setFormModal({...formModal, dispatchType: 'MELHORENVIO'})} className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ${formModal.dispatchType === 'MELHORENVIO' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-500 hover:text-blue-600'}`}>
                                            <Icons.Truck className="w-4 h-4"/> Melhor Envio
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Icons.FileText className="w-4 h-4 text-blue-500"/> Documentação Legal</h4>
                                            <div className="space-y-2">
                                                <div className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${formModal.docTipo === 'DECLARACAO' ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
                                                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                                                        <input type="radio" name="docTipo" checked={formModal.docTipo === 'DECLARACAO'} onChange={() => setFormModal({...formModal, docTipo: 'DECLARACAO'})} className="accent-blue-600 w-4 h-4"/>
                                                        <span className="text-sm font-bold text-slate-700">Declaração de Conteúdo</span>
                                                    </label>
                                                </div>
                                                <div className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${formModal.docTipo === 'NFE' ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
                                                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                                                        <input type="radio" name="docTipo" checked={formModal.docTipo === 'NFE'} onChange={() => setFormModal({...formModal, docTipo: 'NFE'})} className="accent-blue-600 w-4 h-4"/>
                                                        <span className="text-sm font-bold text-slate-700">Nota Fiscal (NFe)</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Icons.Ruler className="w-4 h-4 text-amber-500"/> Volumetria do Pacote</h4>
                                            
                                            <div className="mb-3">
                                                <label className="text-[10px] font-bold text-slate-500 block mb-1">Usar Embalagem Salva</label>
                                                <select value={formModal.packageId} onChange={handlePackageChange} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-amber-400 cursor-pointer shadow-sm">
                                                    <option value="">Personalizada (Digitar)</option>
                                                    {packagesApi.map(p => <option key={p.id} value={p.id}>{p.nome} ({p.altura}x{p.largura}x{p.comprimento}cm)</option>)}
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mb-3">
                                                <div className="relative">
                                                    <input type="number" value={formModal.volAltura} onChange={e=>setFormModal({...formModal, volAltura: e.target.value, packageId: ''})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2.5 text-sm font-bold outline-none focus:border-amber-400" placeholder="Altura"/>
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">cm</span>
                                                </div>
                                                <div className="relative">
                                                    <input type="number" value={formModal.volLargura} onChange={e=>setFormModal({...formModal, volLargura: e.target.value, packageId: ''})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2.5 text-sm font-bold outline-none focus:border-amber-400" placeholder="Largura"/>
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">cm</span>
                                                </div>
                                                <div className="relative">
                                                    <input type="number" value={formModal.volComprimento} onChange={e=>setFormModal({...formModal, volComprimento: e.target.value, packageId: ''})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2.5 text-sm font-bold outline-none focus:border-amber-400" placeholder="Comprim."/>
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">cm</span>
                                                </div>
                                                <div className="relative">
                                                    <input type="number" step="0.001" value={formModal.volPeso} onChange={e=>setFormModal({...formModal, volPeso: e.target.value, packageId: ''})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2.5 text-sm font-bold outline-none focus:border-amber-400" placeholder="Peso"/>
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">kg</span>
                                                </div>
                                            </div>

                                            {formModal.dispatchType === 'MELHORENVIO' && (
                                                <div className="relative mb-3">
                                                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Valor Segurado (Garantia do Pacote) *</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-slate-400 font-bold">R$</span>
                                                        <input type="number" step="0.01" min={pedidoSelecionado?.total} value={formModal.insuranceValue} onChange={e=>setFormModal({...formModal, insuranceValue: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2.5 text-sm font-bold outline-none focus:border-amber-400" placeholder="0.00"/>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Icons.Truck className="w-4 h-4 text-emerald-500"/> Serviço Logístico</h4>
                                            {formModal.dispatchType === 'MELHORENVIO' && (
                                                <button type="button" onClick={handleCalculateShipping} disabled={isCalculatingME} className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1">
                                                    {isCalculatingME ? <><Icons.Spinner className="w-3 h-3"/> Calculando...</> : 'Calcular Frete Real'}
                                                </button>
                                            )}
                                        </div>
                                        
                                        {formModal.dispatchType === 'MANUAL' && (
                                            <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                {formModal.carrierId ? (
                                                    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                                        <div className="flex items-center gap-3">
                                                            {getCarrierLogo(carriersApi.find(c => String(c.id) === String(formModal.carrierId))?.nome) ? (
                                                                <img src={getCarrierLogo(carriersApi.find(c => String(c.id) === String(formModal.carrierId))?.nome)} className="h-8 object-contain mix-blend-multiply" alt=""/>
                                                            ) : <Icons.Box className="w-6 h-6 text-slate-400"/>}
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-slate-700">{carriersApi.find(c => String(c.id) === String(formModal.carrierId))?.nome}</span>
                                                                <span className="text-[10px] font-medium text-slate-500">Prazo: {carriersApi.find(c => String(c.id) === String(formModal.carrierId))?.tempo_entrega}</span>
                                                            </div>
                                                        </div>
                                                        <button type="button" onClick={() => setFormModal({...formModal, carrierId: ''})} className="text-xs font-bold text-blue-600 hover:underline">Alterar</button>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Selecione o Parceiro</label>
                                                        <select value={formModal.carrierId} onChange={e => setFormModal({...formModal, carrierId: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500">
                                                            <option value="">Escolher...</option>
                                                            {carriersApi.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                                        </select>
                                                    </div>
                                                )}
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Rastreio (Opcional)</label>
                                                    <input type="text" value={formModal.tracking} onChange={e => setFormModal({...formModal, tracking: e.target.value.toUpperCase()})} placeholder="BR123456789PT" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-sm font-mono font-bold text-slate-800 outline-none focus:border-blue-500" />
                                                </div>
                                            </div>
                                        )}

                                        {formModal.dispatchType === 'MELHORENVIO' && (
                                            <div className="flex flex-col gap-4">
                                                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    <span className="text-xs font-bold text-slate-600">Agências de Postagem</span>
                                                    <a href="https://melhorenvio.com.br/mapa" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"><Icons.MapPin className="w-4 h-4"/> Ver Mapa</a>
                                                </div>
                                                
                                                {shippingRates.length === 0 ? (
                                                    <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-2xl border border-slate-200 border-dashed h-[180px]">
                                                        <Icons.Truck className="w-8 h-8 text-slate-300 mb-3" />
                                                        <p className="text-xs font-bold text-slate-500 mb-3 text-center">Preencha a volumetria e clique em "Calcular Frete" <br/> para visualizar as opções.</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2 pt-1 h-[180px]">
                                                        {meCarriersAtivas.map(c => {
                                                            const tax = shippingRates?.find(r => String(r.id) === String(c.id));
                                                            if(!tax) return null;
                                                            return (
                                                                <div 
                                                                    key={c.id} 
                                                                    onClick={() => setFormModal({...formModal, meCarrierId: c.id})}
                                                                    className={`flex-shrink-0 w-36 relative rounded-2xl overflow-hidden cursor-pointer group transition-all border-2 flex flex-col items-center justify-center p-4 gap-2 ${formModal.meCarrierId === c.id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-200 bg-white hover:border-blue-300'}`}
                                                                >
                                                                    <div className="h-8 flex items-center justify-center">
                                                                        {c.logo ? <img src={c.logo} alt={c.nome} className="max-w-full max-h-full object-contain mix-blend-multiply" /> : <Icons.Truck className="w-6 h-6 text-slate-400"/>}
                                                                    </div>
                                                                    <span className="text-[10px] font-black text-slate-600 text-center uppercase tracking-wider">{c.nome}</span>
                                                                    
                                                                    <div className="text-center mt-1">
                                                                        <span className="block text-sm font-black text-emerald-600 leading-none">{formatCurrency(tax.price)}</span>
                                                                        <span className="text-[9px] font-bold text-slate-400">{tax.delivery_time} dias úteis</span>
                                                                    </div>

                                                                    {formModal.meCarrierId === c.id && <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-0.5"><Icons.Check className="w-3 h-3"/></div>}
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 🟢 DEMAIS FLUXOS (PAGAMENTO, CANCELAR, REEMBOLSO) */}
                        {isProcessaReembolso && (
                            <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 mb-4">
                                <p className="text-[10px] font-bold text-rose-700 uppercase tracking-widest mb-1">Valor a Reembolsar</p>
                                <p className="text-xl font-black text-rose-800">{formatCurrency(pedidoSelecionado?.total)}</p>
                            </div>
                        )}

                        {(isPagamento || isSeparar || isCancelar || isIniciaReembolso || isProcessaReembolso) && (
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Motivo / Parecer {(isSeparar || isCancelarMeCart) ? '(Opcional)' : '*'}</label>
                                <textarea value={formModal.motivo} onChange={e => setFormModal({...formModal, motivo: e.target.value})} rows="2" placeholder="Descreva a razão desta ação..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 resize-none transition-all shadow-inner" />
                            </div>
                        )}

                        {isProcessaReembolso && (
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Método de Devolução</label>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setFormModal({...formModal, refundMethod: 'ESTORNO'})} className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-colors ${formModal.refundMethod === 'ESTORNO' ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-white border-slate-200 text-slate-500'}`}>Estorno Gateway</button>
                                    <button type="button" onClick={() => setFormModal({...formModal, refundMethod: 'CASHBACK'})} className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-colors ${formModal.refundMethod === 'CASHBACK' ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white border-slate-200 text-slate-500'}`}>Add Cashback</button>
                                </div>
                            </div>
                        )}

                        {(isPagamento || isEntrega || isCancelar || isProcessaReembolso) && (
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Anexar Comprovante {(isProcessaReembolso || isEntrega || isPagamento) ? '*' : '(Opcional)'}</label>
                                <label className={`w-full flex items-center justify-center gap-2 border-2 border-dashed bg-slate-50 hover:bg-slate-100 rounded-xl p-3.5 cursor-pointer transition-colors shadow-sm ${((isProcessaReembolso || isEntrega || isPagamento) && !formModal.file) ? 'border-rose-300 text-rose-500' : 'border-slate-300 text-slate-600'}`}>
                                    <Icons.Upload className={`w-5 h-5 ${((isProcessaReembolso || isEntrega || isPagamento) && !formModal.file) ? 'text-rose-400' : 'text-slate-400'}`} />
                                    <span className="text-xs font-bold truncate">{formModal.file ? formModal.file.name : 'Selecionar Arquivo PDF/Imagem'}</span>
                                    <input type="file" accept="image/*,application/pdf" onChange={e => setFormModal({...formModal, file: e.target.files[0]})} className="hidden" />
                                </label>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button type="button" onClick={() => setModalAcao({ isOpen: false, tipo: null, data: {} })} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors shadow-sm">Voltar</button>
                        <ProgressButton onClick={processarAcaoManual} loading={loadingAcao} text={confirmText} className={`flex-[2] text-white font-bold rounded-xl text-sm shadow-sm transition-colors ${isCancelar || isProcessaReembolso || isCancelarMeCart ? 'bg-rose-600 hover:bg-rose-700' : isIniciaReembolso ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`} />
                    </div>
                </motion.div>
            </div>
        );
    };

    const renderList = () => (
        <motion.div key="list" {...tabTransition} className="bg-transparent flex flex-col min-h-[600px] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-lg font-black text-slate-800 tracking-tight">Visão Geral Financeira e Logística</h2>
                 <button type="button" onClick={() => setShowMetricsHelp(true)} className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-all shadow-sm">
                      <Icons.Info className="w-4 h-4" />
                 </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                <div onClick={() => { setAbaAtiva('TUDO'); setPaginaAtual(1); }} className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-center cursor-pointer hover:shadow-md hover:-translate-y-1 hover:border-blue-200 transition-all group">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 group-hover:text-blue-600 transition-colors">LTV Total</span>
                    <span className="text-xl font-black text-slate-800">{formatSmartCurrency(metricasCalculadas.ltv)}</span>
                </div>
                <div onClick={() => { setAbaAtiva('TUDO'); setPaginaAtual(1); }} className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-center cursor-pointer hover:shadow-md hover:-translate-y-1 hover:border-blue-200 transition-all group">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 group-hover:text-blue-600 transition-colors">Conversão PIX</span>
                    <span className="text-xl font-black text-slate-800">{metricasCalculadas.conversaoPix}%</span>
                    <span className="text-[10px] font-medium text-slate-400 mt-1">{metricasCalculadas.pixPagos} pagos</span>
                </div>
                <div onClick={() => { setAbaAtiva('TUDO'); setPaginaAtual(1); }} className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-center cursor-pointer hover:shadow-md hover:-translate-y-1 hover:border-blue-200 transition-all group">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 group-hover:text-blue-600 transition-colors">Pedidos Totais</span>
                    <span className="text-xl font-black text-slate-800">{metricasCalculadas.totais}</span>
                    <span className="text-[10px] font-medium text-slate-400 mt-1">{metricasCalculadas.aEnviar} a enviar</span>
                </div>
                <div onClick={() => { setAbaAtiva('CANCELADO'); setPaginaAtual(1); }} className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-center cursor-pointer hover:shadow-md hover:-translate-y-1 hover:border-blue-200 transition-all group">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 group-hover:text-blue-600 transition-colors">Cancelados</span>
                    <span className="text-xl font-black text-slate-800">{metricasCalculadas.taxaCancelamento}%</span>
                    <span className="text-[10px] font-medium text-slate-400 mt-1">{metricasCalculadas.cancelados} perdidos</span>
                </div>
                <div onClick={() => { setAbaAtiva('REEMBOLSADO'); setPaginaAtual(1); }} className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-center cursor-pointer hover:shadow-md hover:-translate-y-1 hover:border-blue-200 transition-all group">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 group-hover:text-rose-500 transition-colors">Reembolsados</span>
                    <span className="text-xl font-black text-slate-800">{metricasCalculadas.taxaReembolso}%</span>
                    <span className="text-[10px] font-medium text-slate-400 mt-1">{metricasCalculadas.qtdReembolsados} perdidos</span>
                </div>
                <div onClick={() => { setAbaAtiva('EM_ANALISE_REEMBOLSO'); setPaginaAtual(1); }} className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-center cursor-pointer hover:shadow-md hover:-translate-y-1 hover:border-blue-200 transition-all group">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1 group-hover:text-amber-600 transition-colors">Em Análise</span>
                    <span className="text-xl font-black text-amber-600">{metricasCalculadas.emAnalise}</span>
                    <span className="text-[10px] font-medium text-slate-400 mt-1">Ações Pendentes</span>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col flex-1">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 rounded-t-[32px]">
                    <div className="relative w-full lg:w-[450px]">
                        <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input type="text" placeholder="Buscar pedido, nome ou e-mail..." value={termoPesquisa} onChange={e => {setTermoPesquisa(e.target.value); setPaginaAtual(1);}} className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 shadow-sm transition-all" />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <button type="button" onClick={handleRefresh} className={`w-[48px] h-[48px] rounded-full bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 shadow-sm flex items-center justify-center transition-all ${isManualRefresh ? 'animate-spin text-blue-500 border-blue-300' : ''}`}>
                            <Icons.Refresh className="w-5 h-5"/>
                        </button>
                        <div className="relative z-[50]">
                            <HoverProgressRoundButton text={dashDateRange.start || dashDateRange.end ? 'Filtrado' : 'Período'} onClick={() => setDashDateOpen(!dashDateOpen)} icon={Icons.Calendar} isActive={dashDateOpen} loading={loadingAcao === 'filtroDate'} />
                            <DateFilterPopup isOpen={dashDateOpen} onClose={() => setDashDateOpen(false)} dateRange={dashDateRange} setDateRange={setDashDateRange} loading={loadingAcao === 'filtroDate'} onClear={() => { setDashDateRange({start:'', end:''}); setDashDateOpen(false); setPaginaAtual(1); }} onApply={() => { if(dashDateRange.start && dashDateRange.end) { setLoadingAcao('filtroDate'); setTimeout(() => { setDashDateOpen(false); setPaginaAtual(1); setLoadingAcao(null); }, 600); } }} />
                        </div>
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 h-[48px] shadow-sm focus-within:border-blue-500 transition-all">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Exibir:</span>
                            <select value={itensPorPagina} onChange={e => {setItensPorPagina(Number(e.target.value)); setPaginaAtual(1);}} className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer">
                                <option value={10}>10 Itens</option><option value={20}>20 Itens</option><option value={30}>30 Itens</option><option value={50}>50 Itens</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="px-6 border-b border-slate-200 bg-white overflow-hidden flex items-center justify-start md:justify-center">
                    <div className="flex overflow-x-auto no-scrollbar w-max max-w-full">
                        {TABS_INTELIGENTES.map(tab => (
                            <button
                                type="button"
                                key={tab.key}
                                onClick={() => {setAbaAtiva(tab.key); setPaginaAtual(1);}}
                                className={`whitespace-nowrap py-4 px-2 mx-3 text-sm font-semibold transition-all relative ${abaAtiva === tab.key ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                {tab.label}
                                {abaAtiva === tab.key && (
                                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto flex-1 custom-scrollbar w-full">
                    <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap min-w-[1000px]">
                        <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Pedido & Data</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4 text-center">Itens</th>
                                <th className="px-6 py-4 text-right">Total</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <AnimatePresence>
                                {pedidosPaginados.length > 0 ? pedidosPaginados.map(o => (
                                    <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={o.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer group" onClick={() => setPedidoSelecionado(o)}>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">#{prefixo}{o.id}</span>
                                                <span className="text-xs text-slate-500 mt-1">{formatDateTimeBR(o.data_raw || o.created_at)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-900 text-sm">{o.cliente?.nome}</span>
                                                <span className="text-xs text-slate-500">{o.cliente?.email}</span>
                                                <span className="text-xs font-medium text-slate-400 mt-0.5">CPF: {o.cliente?.cpf || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center font-medium text-slate-700">{o.items?.reduce((a, b) => a + safeNum(b.quantidade || b.qtd), 0) || 0} un</td>
                                        <td className="px-6 py-4 text-right font-semibold text-emerald-600">{formatCurrency(o.total)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 inline-flex items-center justify-center text-xs font-semibold rounded-full border shadow-sm ${statusConfig[o.status]?.cor || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                                {statusConfig[o.status]?.label || o.status}
                                            </span>
                                        </td>
                                    </motion.tr>
                                )) : (
                                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <td colSpan="5" className="p-16 text-center text-slate-500 font-medium">Nenhum pedido atende aos filtros atuais.</td>
                                    </motion.tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {pedidosFiltrados.length > 0 && (
                    <footer className="p-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center text-xs font-bold text-slate-500 rounded-b-[32px] shrink-0 gap-4">
                        <span className="sm:ml-4">Mostrando {pedidosPaginados.length} de {pedidosFiltrados.length} pedidos</span>
                        <div className="flex gap-4 items-center sm:pr-2">
                            <span>Página {paginaAtual} de {totalPaginas}</span>
                            <div className="flex gap-1.5">
                                <button type="button" onClick={() => setPaginaAtual(p => Math.max(1, p-1))} disabled={paginaAtual===1} className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-50 shadow-sm transition-colors"><Icons.ChevronLeft className="w-4 h-4"/></button>
                                <button type="button" onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p+1))} disabled={paginaAtual===totalPaginas} className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-50 shadow-sm transition-colors"><Icons.ChevronRight className="w-4 h-4"/></button>
                            </div>
                        </div>
                    </footer>
                )}
            </div>
        </motion.div>
    );

    const renderDetail = () => {
        const o = pedidoSelecionado;

        const end = o.endereco || {};
        const rua = end.rua || end.street || end.logradouro || '-';
        const num = end.numero || end.num || end.number || '-';
        const bairro = end.bairro || end.neighborhood || '-';
        const cidade = end.cidade || end.city || '-';
        const uf = end.uf || end.estado || end.state || '-';
        const cep = end.cep || end.zip_code || '-';
        const comp = end.complemento || end.complement || '';
        const ref = end.referencia || end.reference || '';

        const whatsAppMsg = encodeURIComponent(`Olá ${o.cliente?.nome}, tudo bem? Sou da equipe da HUB Commerce. Tivemos um problema com a personalização do seu pedido #${prefixo}${o.id}...`);

        const totalItemsPages = Math.ceil((o.items?.length || 0) / itemsPerPage);
        const paginatedItems = o.items?.slice((itemsPage - 1) * itemsPerPage, itemsPage * itemsPerPage);

        const getLogDate = (statusKeyword) => {
            if (!o || !o.timeline) return null;
            const keys = statusKeyword.split('|');
            const log = o.timeline.slice().reverse().find(l => keys.some(k => String(l.evento || l.desc).toUpperCase().includes(k)));
            return log ? (log.data || formatDateTimeBR(log.data_raw)) : null;
        };

        const isMelhorEnvio = deduceCarrier(o).toLowerCase().includes('melhor envio') || 
                              deduceCarrier(o).toLowerCase().includes('correios') || 
                              deduceCarrier(o).toLowerCase().includes('jadlog') || 
                              deduceCarrier(o).toLowerCase().includes('loggi') || 
                              deduceCarrier(o).toLowerCase().includes('azul') || 
                              deduceCarrier(o).toLowerCase().includes('latam');

        const imprimirDocumento = async (tipo) => {
            try {
                const response = await api.get(`/admin/orders/${o.id}/preview-doc?tipo=${tipo}`);
                const janela = window.open('', '', 'width=900,height=700');
                janela.document.write(response.data);
                janela.document.close();
            } catch (error) {
                console.error("Erro ao gerar documento:", error);
                alert("Erro ao gerar o documento fiscal. Verifique a sua conexão.");
            }
        };

        return (
            <motion.div key="detail" {...tabTransition} className="space-y-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button type="button" onClick={handleFecharPedido} className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-white hover:border-blue-200 transition-all">
                            <Icons.ChevronLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2 mb-1">
                                Pedido #{prefixo}{o.id} 
                                <button type="button" onClick={handleRefresh} className="ml-1 p-1.5 bg-slate-50 border border-slate-200 text-slate-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 rounded-md transition-all shadow-sm" title="Sincronizar Pedido">
                                    <Icons.Refresh className={`w-3.5 h-3.5 ${isManualRefresh ? 'animate-spin' : ''}`} />
                                </button>
                                <span className={`ml-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-md border shadow-sm tracking-widest ${statusConfig[o.status]?.cor || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                    {statusConfig[o.status]?.label || o.status}
                                </span>
                            </h2>
                            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest flex items-center gap-1.5">
                                <Icons.Clock className="w-3.5 h-3.5"/> Efetuado em: {formatDateTimeBR(o.data_raw || o.created_at)}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {o.status === 'A_PAGAR' && (
                            <>
                                <button type="button" onClick={() => abrirModal('CANCELAR')} className="group relative h-12 flex items-center justify-center bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-rose-500 rounded-xl shadow-sm transition-all px-4">
                                    <Icons.Close className="w-5 h-5" />
                                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-200 ease-in-out whitespace-nowrap font-bold text-sm"><span className="pl-2">Cancelar Pedido</span></span>
                                </button>
                                <button type="button" onClick={() => abrirModal('PAGAR')} className="h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all px-4 gap-2">
                                    <Icons.Check className="w-5 h-5" />
                                    <span className="whitespace-nowrap font-bold text-sm">Aprovar Pagamento</span>
                                </button>
                            </>
                        )}
                        {o.status === 'SEPARACAO' && (
                            <>
                                <button type="button" onClick={() => abrirModal('INICIAR_REEMBOLSO')} className="group relative h-12 flex items-center justify-center bg-white border border-slate-200 hover:bg-amber-50 hover:border-amber-200 text-amber-500 rounded-xl shadow-sm transition-all px-4">
                                    <Icons.AlertTriangle className="w-5 h-5" />
                                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-200 ease-in-out whitespace-nowrap font-bold text-sm"><span className="pl-2">Cancelar & Reembolsar</span></span>
                                </button>
                                <button type="button" onClick={() => abrirModal('SEPARAR')} className="h-12 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all px-4 gap-2">
                                    <Icons.Package className="w-5 h-5" />
                                    <span className="whitespace-nowrap font-bold text-sm">Finalizar Separação</span>
                                </button>
                            </>
                        )}
                        {o.status === 'SEPARADO' && (
                            <>
                                <button type="button" onClick={() => abrirModal('INICIAR_REEMBOLSO')} className="group relative h-12 flex items-center justify-center bg-white border border-slate-200 hover:bg-amber-50 hover:border-amber-200 text-amber-500 rounded-xl shadow-sm transition-all px-4">
                                    <Icons.AlertTriangle className="w-5 h-5" />
                                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-200 ease-in-out whitespace-nowrap font-bold text-sm"><span className="pl-2">Iniciar Reembolso</span></span>
                                </button>
                                <button type="button" onClick={() => abrirModal('CONFIGURAR_ENVIO')} className="h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all px-4 gap-2">
                                    <Icons.Truck className="w-5 h-5" />
                                    <span className="whitespace-nowrap font-bold text-sm">Configurar Expedição</span>
                                </button>
                            </>
                        )}
                        {o.status === 'DESPACHADO' && (
                            <>
                                <button type="button" onClick={() => abrirModal('INICIAR_REEMBOLSO')} className="group relative h-12 flex items-center justify-center bg-white border border-slate-200 hover:bg-amber-50 hover:border-amber-200 text-amber-500 rounded-xl shadow-sm transition-all px-4">
                                    <Icons.AlertTriangle className="w-5 h-5" />
                                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-200 ease-in-out whitespace-nowrap font-bold text-sm"><span className="pl-2">Iniciar Reembolso</span></span>
                                </button>
                                <button type="button" onClick={() => abrirModal('ENTREGAR')} className="h-12 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all px-4 gap-2">
                                    <Icons.Check className="w-5 h-5" />
                                    <span className="whitespace-nowrap font-bold text-sm">Confirmar Entrega</span>
                                </button>
                            </>
                        )}
                        {o.status === 'ENTREGUE' && (
                            <button type="button" onClick={() => abrirModal('INICIAR_REEMBOLSO')} className="group relative h-12 flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-sm transition-all px-4">
                                <Icons.AlertTriangle className="w-5 h-5" />
                                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-200 ease-in-out whitespace-nowrap font-bold text-sm"><span className="pl-2">Iniciar Reembolso</span></span>
                            </button>
                        )}
                        {o.status === 'EM_ANALISE_REEMBOLSO' && (
                            <button type="button" onClick={() => abrirModal('PROCESSAR_REEMBOLSO')} className="h-12 flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition-all px-4 gap-2">
                                <Icons.DollarSign className="w-5 h-5" />
                                <span className="whitespace-nowrap font-bold text-sm">Processar Reembolso</span>
                            </button>
                        )}
                    </div>
                </div>

                <RenderStepper status={o.status} pedido={o} getLogDate={getLogDate} />

                <div className="flex overflow-x-auto no-scrollbar bg-slate-100 p-1.5 rounded-2xl shadow-inner border border-slate-200/60 mb-6 w-max max-w-full">
                    {['RESUMO', 'LOGISTICA', 'AUDITORIA'].map((tab) => {
                        const isActive = detailTab === tab;
                        const label = tab === 'LOGISTICA' ? 'Destinatário & Logística' : tab === 'AUDITORIA' ? 'Timeline (Audit)' : tab;
                        const Icon = tab === 'RESUMO' ? Icons.Package : tab === 'LOGISTICA' ? Icons.Truck : Icons.Activity;
                        
                        return (
                            <button key={tab} type="button" onClick={() => setDetailTab(tab)} className={`px-6 py-3 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-2 ${isActive ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-800'}`}>
                                <Icon className="w-4 h-4" /> {label}
                            </button>
                        );
                    })}
                </div>

                <AnimatePresence>
                    {detailTab === 'RESUMO' && (
                        <motion.div key="RESUMO" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6 flex flex-col">
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-fit">
                                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><Icons.Package className="w-5 h-5 text-blue-500"/> Produtos do Pedido</h3>
                                    </div>
                                    <div className="p-6 space-y-6 flex-1">
                                        {paginatedItems?.map((item, idx) => {
                                            const isPerso = item.personalizacao || item.is_customized || item.custom_text || item.custom_image;
                                            const persoData = item.personalizacao || {};
                                            const temDados = Object.keys(persoData).length > 0;

                                            return (
                                                <div key={idx} className="flex flex-col sm:flex-row gap-5 pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                                                    <div className="w-24 h-24 bg-slate-100 rounded-2xl border border-slate-200 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm">
                                                        {item.imagem || item.img ? <img src={item.imagem || item.img} className="w-full h-full object-cover" alt="Produto" /> : <Icons.Box className="w-8 h-8 text-slate-300"/>}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h4 className="font-bold text-slate-800 text-base leading-tight">{item.nome}</h4>
                                                                <div className="flex flex-wrap gap-2 mt-2">
                                                                    <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200 tracking-wider">SKU: {item.sku || item.variacaoSku}</span>
                                                                    {item.variacao && <span className="text-[10px] font-black uppercase bg-amber-50 text-amber-600 px-2 py-1 rounded border border-amber-100 tracking-wider">Variação: {item.variacao}</span>}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="font-black text-emerald-600 text-lg block">{formatCurrency(item.preco)}</span>
                                                                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-1 inline-block">Qtd: {item.quantidade || item.qtd} un.</span>
                                                            </div>
                                                        </div>

                                                        {isPerso && (
                                                            <div className={`mt-4 p-4 rounded-xl shadow-sm border ${temDados ? 'bg-purple-50/50 border-purple-100' : 'bg-rose-50 border-rose-200'}`}>
                                                                <div className="flex justify-between items-center mb-3">
                                                                    <p className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${temDados ? 'text-purple-800' : 'text-rose-600'}`}>
                                                                        {temDados ? <Icons.Edit3 className="w-3.5 h-3.5 text-purple-500"/> : <Icons.AlertTriangle className="w-4 h-4"/>} 
                                                                        {temDados ? 'Personalização' : 'Faltam Dados de Personalização!'}
                                                                    </p>
                                                                    {!temDados && (
                                                                        <a href={`https://wa.me/${(o.cliente?.telefone || o.cliente?.phone)?.replace(/\D/g, '')}?text=${whatsAppMsg}`} target="_blank" rel="noreferrer" className="bg-[#25D366] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1 hover:bg-[#20bd5a] transition-colors">
                                                                            <Icons.WhatsApp className="w-3 h-3"/> Cobrar Cliente
                                                                        </a>
                                                                    )}
                                                                </div>
                                                                {temDados && (
                                                                    <div className="space-y-4">
                                                                        {Object.entries(persoData).map(([chave, valor], i) => (
                                                                            <div key={i}>
                                                                                <span className="text-[9px] font-bold text-purple-500 uppercase tracking-wider block mb-1">{chave}:</span>
                                                                                {String(valor).startsWith('http') ? (
                                                                                    <button type="button" onClick={() => window.open(valor, '_blank')} className="w-max flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors shadow-sm">
                                                                                        <Icons.Download className="w-4 h-4" /> Baixar Imagem / Anexo
                                                                                    </button>
                                                                                ) : (
                                                                                    <p className="text-sm font-medium text-slate-800 italic bg-white p-3 rounded-lg border border-purple-100 shadow-sm">"{valor}"</p>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {totalItemsPages > 1 && (
                                        <footer className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs font-bold text-slate-500 shrink-0">
                                            <span>Pág. {itemsPage} de {totalItemsPages}</span>
                                            <div className="flex gap-2">
                                                <button type="button" onClick={() => setItemsPage(p => Math.max(1, p - 1))} disabled={itemsPage === 1} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"><Icons.ChevronLeft className="w-4 h-4"/></button>
                                                <button type="button" onClick={() => setItemsPage(p => Math.min(totalItemsPages, p + 1))} disabled={itemsPage === totalItemsPages} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"><Icons.ChevronRight className="w-4 h-4"/></button>
                                            </div>
                                        </footer>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6 flex flex-col">
                                {(() => {
                                    // 1. Extrai os valores originais
                                    const subtotalBruto = safeNum(o.subtotal);
                                    const freteBruto = safeNum(o.frete_valor || o.frete);
                                    const totalBruto = subtotalBruto + freteBruto;

                                    // 2. Captura os cupons
                                    const cuponsLista = parseCoupons(o.coupons || o.cupons || o.applied_coupons);
                                    let reqCupomLoja = 0, reqCupomFrete = 0, reqVipLoja = 0, reqVipFrete = 0;

                                    cuponsLista.forEach(c => {
                                        const tipo = String(c.tipo).toUpperCase();
                                        const val = safeNum(c.valor || c.desconto);
                                        if (tipo === 'LOJA') reqCupomLoja += val;
                                        else if (tipo === 'FRETE') reqCupomFrete += val;
                                        else if (tipo === 'LOJA VIP' || (tipo.includes('VIP') && !tipo.includes('FRETE'))) reqVipLoja += val;
                                        else if (tipo === 'FRETE VIP' || (tipo.includes('VIP') && tipo.includes('FRETE'))) reqVipFrete += val;
                                    });

                                    // 4. LÓGICA ANTI-FRAUDE EM CASCATA
                                    let saldoFrete = freteBruto;
                                    const descontoFreteReal = Math.min(reqCupomFrete, saldoFrete);
                                    saldoFrete -= descontoFreteReal;
                                    const descontoVipFreteReal = Math.min(reqVipFrete, saldoFrete);
                                    saldoFrete -= descontoVipFreteReal;

                                    let saldoLoja = subtotalBruto;
                                    const descontoLojaReal = Math.min(reqCupomLoja, saldoLoja);
                                    saldoLoja -= descontoLojaReal;
                                    const descontoVipLojaReal = Math.min(reqVipLoja, saldoLoja);
                                    saldoLoja -= descontoVipLojaReal;

                                    const totalLiquidoAuditoria = saldoLoja + saldoFrete;

                                    const cuponsReaisAplicados = [];
                                    cuponsLista.forEach(c => {
                                        const tipo = String(c.tipo).toUpperCase();
                                        let valorAplicado = 0;
                                        if (tipo === 'LOJA' && descontoLojaReal > 0) valorAplicado = Math.min(safeNum(c.valor || c.desconto), descontoLojaReal);
                                        else if (tipo === 'FRETE' && descontoFreteReal > 0) valorAplicado = Math.min(safeNum(c.valor || c.desconto), descontoFreteReal);
                                        else if ((tipo === 'LOJA VIP' || (tipo.includes('VIP') && !tipo.includes('FRETE'))) && descontoVipLojaReal > 0) valorAplicado = Math.min(safeNum(c.valor || c.desconto), descontoVipLojaReal);
                                        else if ((tipo === 'FRETE VIP' || (tipo.includes('VIP') && tipo.includes('FRETE'))) && descontoVipFreteReal > 0) valorAplicado = Math.min(safeNum(c.valor || c.desconto), descontoVipFreteReal);
                                        
                                        if (valorAplicado > 0) {
                                            cuponsReaisAplicados.push({ ...c, valorAplicado });
                                        }
                                    });

                                    return (
                                        <>
                                            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col max-h-[340px]">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 shrink-0"><Icons.Tag className="w-4 h-4" /> Cupons e Vantagens</h4>
                                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 mb-2">
                                                    {cuponsReaisAplicados.length > 0 ? (
                                                        cuponsReaisAplicados.map((cupom, idx) => {
                                                            const isVip = cupom.tipo && String(cupom.tipo).toUpperCase().includes('VIP');
                                                            const theme = isVip ? 'amber' : 'purple';
                                                            return (
                                                                <div key={idx} className={`bg-${theme}-50/30 border border-${theme}-100 p-3.5 rounded-xl flex justify-between items-center shadow-sm`}>
                                                                    <div className="flex items-center gap-2.5">
                                                                        <div className={`w-8 h-8 rounded-full bg-${theme}-100 flex items-center justify-center shrink-0`}>
                                                                            {isVip ? <Icons.Crown className={`w-4 h-4 text-${theme}-600`}/> : <Icons.Tag className={`w-4 h-4 text-${theme}-600`}/>}
                                                                        </div>
                                                                        <div>
                                                                            <strong className={`text-[11px] font-black text-${theme}-900 block`}>{cupom.nome || cupom.codigo || 'Benefício'}</strong>
                                                                            <span className={`text-[8px] font-black text-${theme}-600 uppercase tracking-widest block mt-0.5`}>{cupom.tipo || 'CUPOM'}</span>
                                                                        </div>
                                                                    </div>
                                                                    <span className="text-[11px] font-black text-emerald-600 bg-white px-2 py-1 rounded-lg shadow-sm border border-emerald-100/60 shrink-0">-{formatCurrency(cupom.valorAplicado)}</span>
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="h-[60px] flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-200 border-dashed text-center">
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nenhum benefício aplicado</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-5"><Icons.DollarSign className="w-4 h-4 text-emerald-500"/> Composição Fin. & Auditoria</h3>
                                                <div className="space-y-3.5 text-xs font-medium text-slate-600">
                                                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                                                        <span>Subtotal Produtos:</span>
                                                        <span className="text-slate-800 font-bold text-sm">{formatCurrency(subtotalBruto)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                                                        <span>Frete Cobrado:</span>
                                                        <span className="text-slate-800 font-bold text-sm">{formatCurrency(freteBruto)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center pb-3 border-b-2 border-slate-800 border-dashed">
                                                        <span className="font-bold uppercase tracking-wider text-[10px]">Total Bruto:</span>
                                                        <span className="text-slate-900 font-black">{formatCurrency(totalBruto)}</span>
                                                    </div>

                                                    {descontoLojaReal > 0 && (
                                                        <div className="flex justify-between items-center text-rose-500">
                                                            <span className="font-bold uppercase tracking-wider text-[10px]">(-) Cupom Loja:</span>
                                                            <span className="font-black">-{formatCurrency(descontoLojaReal)}</span>
                                                        </div>
                                                    )}
                                                    {descontoFreteReal > 0 && (
                                                        <div className="flex justify-between items-center text-rose-500">
                                                            <span className="font-bold uppercase tracking-wider text-[10px]">(-) Cupom Frete:</span>
                                                            <span className="font-black">-{formatCurrency(descontoFreteReal)}</span>
                                                        </div>
                                                    )}
                                                    {descontoVipLojaReal > 0 && (
                                                        <div className="flex justify-between items-center text-indigo-500">
                                                            <span className="font-bold uppercase tracking-wider text-[10px]">(-) Benefício VIP (Loja):</span>
                                                            <span className="font-black">-{formatCurrency(descontoVipLojaReal)}</span>
                                                        </div>
                                                    )}
                                                    {descontoVipFreteReal > 0 && (
                                                        <div className="flex justify-between items-center text-indigo-500">
                                                            <span className="font-bold uppercase tracking-wider text-[10px]">(-) Benefício VIP (Frete):</span>
                                                            <span className="font-black">-{formatCurrency(descontoVipFreteReal)}</span>
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between items-end pt-3 mt-3 border-t border-slate-100">
                                                        <div className="flex flex-col">
                                                            <span className="text-slate-800 font-black uppercase tracking-widest text-xs">Líquido Recebido:</span>
                                                            {safeNum(o.total) !== totalLiquidoAuditoria && (
                                                                <span className="text-[9px] text-rose-500 mt-1">
                                                                    *Divergência Banco: {formatCurrency(o.total)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-2xl text-emerald-600 font-black">{formatCurrency(totalLiquidoAuditoria)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* GATEWAY & COMPROVANTE (Se Houver) */}
                                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="space-y-1">
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Gateway de Pagamento</span>
                                                        <span className="text-sm font-black text-slate-800 block">"{o.pagamento?.payment_gateway || o.pagamento?.gateway || 'Desconhecido'}"</span>
                                                    </div>
                                                    <Icons.CheckCircle className="w-6 h-6 text-emerald-500 opacity-60" />
                                                </div>
                                                <div className="space-y-1 pb-4 border-b border-slate-100">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Pagamento Via</span>
                                                    <span className="text-xs font-bold text-slate-700 block uppercase">{o.pagamento_metodo || o.pagamento?.metodo}</span>
                                                    {(o.pagamento_parcelas > 1 || o.pagamento?.parcelas > 1) ? (
                                                        <span className="text-[10px] font-medium text-slate-500">Parcelado em {o.pagamento_parcelas || o.pagamento?.parcelas}x de {formatCurrency(o.pagamento?.valor_parcela || (o.total / (o.pagamento_parcelas || 1)))}</span>
                                                    ) : <span className="text-[10px] font-medium text-slate-500">Pagamento à vista / Único</span>}
                                                </div>

                                                {/* Mostra botão para baixar comprovante de pagamento se existir no histórico */}
                                                {o.comprovante_pagamento && (
                                                    <div className="pt-4 mt-4 border-t border-slate-100">
                                                        <a href={o.comprovante_pagamento} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors border border-slate-200 shadow-sm">
                                                            <Icons.Download className="w-4 h-4" /> Baixar Comprovante de Pagamento
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </motion.div>
                    )}

                    {detailTab === 'LOGISTICA' && (
                        <motion.div key="LOGISTICA" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                                <h3 className="font-black text-slate-800 flex items-center gap-2 mb-6 text-base"><Icons.MapPin className="w-5 h-5 text-rose-500"/> Endereço do Destinatário</h3>
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3 shadow-sm">
                                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-3"><span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Destinatário:</span> <span className="text-slate-800 font-black text-sm">{o.cliente?.nome}</span></div>
                                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-3"><span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">CEP:</span> <span className="text-slate-800 font-mono text-base font-bold">{cep}</span></div>
                                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-3"><span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Rua/Nº:</span> <span className="text-slate-800 text-sm font-bold text-right truncate max-w-[200px]">{rua}, {num}</span></div>
                                    {comp && <div className="flex justify-between items-center border-b border-slate-200/60 pb-3"><span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Complemento:</span> <span className="text-slate-800 text-sm font-bold">{comp}</span></div>}
                                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-3"><span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Bairro:</span> <span className="text-slate-800 text-sm font-bold">{bairro}</span></div>
                                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-3"><span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Cidade/UF:</span> <span className="text-slate-800 font-black text-sm">{cidade} - {uf}</span></div>
                                    {ref && (
                                        <div className="pt-2"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ponto de Referência:</span><p className="text-[11px] font-medium text-slate-600 italic leading-relaxed">"{ref}"</p></div>
                                    )}
                                </div>
                            </div>

                            {/* CAIXA DE INFORMAÇÕES DA TRANSPORTADORA SUPERIOR */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>
                                <h3 className="font-black text-slate-800 flex items-center gap-2 mb-4 text-sm relative z-10"><Icons.Truck className="w-4 h-4 text-blue-500"/> Informações da Logística</h3>
                                
                                <div className="space-y-4 relative z-10">
                                    {(!o.carrier && !o.tracking_code) ? (
                                        <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-100 border-dashed rounded-xl p-6 text-center shadow-sm">
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                                                <Icons.Box className="w-6 h-6 text-slate-300" />
                                            </div>
                                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Aguardando Configuração</span>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1 max-w-xs leading-relaxed">Nenhum envio foi gerado ou o anterior foi removido. Configure a expedição para visualizar a transportadora.</p>
                                        </div>
                                    ) : (
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                                            
                                            {/* LOGO REDUZIDO E ADAPTADO */}
                                            <div className="w-16 h-12 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-1.5 shadow-sm shrink-0">
                                                {getCarrierLogo(deduceCarrier(o)) ? (
                                                    <img src={getCarrierLogo(deduceCarrier(o))} className="w-full h-full object-contain mix-blend-multiply" alt="Transportadora" />
                                                ) : (
                                                    <Icons.Box className="w-6 h-6 text-slate-300"/>
                                                )}
                                            </div>

                                            <div className="flex-1 w-full text-center sm:text-left space-y-1">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Transportadora Escolhida</span>
                                                <h4 className="text-sm font-black text-slate-800 leading-tight">{deduceCarrier(o) || 'Logística Manual'}</h4>
                                                
                                                <div className="mt-2 pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row items-center gap-3 justify-center sm:justify-start">
                                                    <div>
                                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                                                            {isMelhorEnvio && String(o.tracking_code).length > 20 ? 'Protocolo / Carrinho (ME)' : 'Cód. Rastreio / Integração'}
                                                        </span>
                                                        <span className="font-mono text-[11px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-block shadow-sm">
                                                            {o.tracking_code || 'Pendente'}
                                                        </span>
                                                    </div>
                                                    <div className="hidden sm:block w-px h-6 bg-slate-200"></div>
                                                    <div>
                                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Status Logístico</span>
                                                        <span className={`text-[11px] font-black block ${o.status === 'SEPARADO' ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                            {o.status === 'SEPARADO' ? 'Aguardando Pagamento/Envio' : (getLogDate('DESPACHADO|ENVIADO') || 'Enviado')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 🟢 MOSTRA O COMPROVANTE DE ASSINATURA/ENTREGA SE HOUVER */}
                                    {o.status === 'ENTREGUE' && o.comprovante_entrega && (
                                        <div className="mt-4 pt-4 border-t border-slate-200/60">
                                            <a href={o.comprovante_entrega} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-2.5 rounded-xl text-xs transition-colors border border-emerald-200 shadow-sm">
                                                <Icons.Download className="w-4 h-4" /> Baixar Comprovante de Assinatura/Entrega
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 🟢 PAINEL DE GESTÃO DE ETIQUETAS E FISCAL */}
                            {['DESPACHADO', 'ENTREGUE'].includes(o.status) && (
                                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-xl p-6 sm:p-8 mt-6 col-span-1 md:col-span-2 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent pointer-events-none"></div>
                                    
                                    <h3 className="font-black text-white flex items-center gap-2 mb-6 text-lg relative z-10"><Icons.Printer className="w-6 h-6 text-blue-400"/> Central Fiscal e Etiquetas</h3>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                                        
                                        <motion.button 
                                            whileTap={{ scale: 0.95 }}
                                            type="button"
                                            onClick={() => imprimirDocumento('DECLARACAO')}
                                            className="flex flex-col items-center justify-center p-4 bg-slate-800/80 border border-slate-600 hover:border-blue-400 hover:bg-slate-700 rounded-xl transition-colors shadow-sm text-center"
                                        >
                                            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center mb-2 shadow-inner">
                                                <Icons.QrCode className="w-5 h-5 text-slate-300"/>
                                            </div>
                                            <span className="text-[11px] font-bold text-white mb-0.5">Declaração Conteúdo</span>
                                            <span className="text-[9px] font-medium text-slate-400">c/ QR Code Seguro</span>
                                        </motion.button>

                                        <motion.button 
                                            whileTap={{ scale: 0.95 }}
                                            type="button"
                                            onClick={() => alert("MÓDULO FUTURO: A emissão de NFe A1 será disponibilizada com o seu Certificado Digital.")}
                                            className="flex flex-col items-center justify-center p-4 bg-slate-800/80 border border-slate-600 hover:border-emerald-400 hover:bg-slate-700 rounded-xl transition-colors shadow-sm text-center"
                                        >
                                            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center mb-2 shadow-inner">
                                                <Icons.FileText className="w-5 h-5 text-slate-300"/>
                                            </div>
                                            <span className="text-[11px] font-bold text-white mb-0.5">Emitir NFe (A1)</span>
                                            <span className="text-[9px] font-medium text-slate-400">Módulo ERP Avançado</span>
                                        </motion.button>

                                        {isMelhorEnvio ? (
                                            <>
                                                <motion.a 
                                                    whileTap={{ scale: 0.95 }}
                                                    href="https://sandbox.melhorenvio.com.br/painel/carrinho" 
                                                    target="_blank" rel="noreferrer"
                                                    className="flex flex-col items-center justify-center p-4 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 rounded-xl transition-colors shadow-sm text-center"
                                                >
                                                    <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center mb-2 shadow-inner">
                                                        <Icons.DollarSign className="w-5 h-5 text-amber-400"/>
                                                    </div>
                                                    <span className="text-[11px] font-bold text-white mb-0.5">Pagar Etiqueta (ME)</span>
                                                    <span className="text-[9px] font-medium text-amber-200/60">Finalizar no Sandbox</span>
                                                </motion.a>

                                                <motion.a 
                                                    whileTap={{ scale: 0.95 }}
                                                    href="https://sandbox.melhorenvio.com.br/painel/envios/liberados" 
                                                    target="_blank" rel="noreferrer"
                                                    className="flex flex-col items-center justify-center p-4 bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 rounded-xl transition-colors shadow-sm text-center"
                                                >
                                                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mb-2 shadow-inner">
                                                        <Icons.Printer className="w-5 h-5 text-blue-400"/>
                                                    </div>
                                                    <span className="text-[11px] font-bold text-white mb-0.5">Imprimir Etiqueta Final</span>
                                                    <span className="text-[9px] font-medium text-blue-200/60">DACE e Romaneio (ME)</span>
                                                </motion.a>

                                                {/* 🟢 O BOTÃO DE CANCELAR ETIQUETA COM MODAL PREMIUM */}
                                                {(o.tracking_code && String(o.tracking_code).length > 20) && (
                                                    <div className="col-span-1 sm:col-span-4 mt-2 flex justify-end">
                                                        <button 
                                                            type="button" 
                                                            onClick={() => abrirModal('CANCELAR_ME_CART')} 
                                                            className="text-[10px] font-bold text-rose-400 hover:text-rose-300 underline underline-offset-2 transition-colors"
                                                        >
                                                            Cancelar Etiqueta no Carrinho e Alterar Transporte
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <motion.button 
                                                    whileTap={{ scale: 0.95 }}
                                                    type="button"
                                                    onClick={() => imprimirDocumento('ETIQUETA_MANUAL')}
                                                    className="flex flex-col items-center justify-center p-4 bg-slate-800/80 border border-slate-600 hover:border-sky-400 hover:bg-slate-700 rounded-xl transition-colors shadow-sm text-center"
                                                >
                                                    <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center mb-2 shadow-inner">
                                                        <Icons.Printer className="w-5 h-5 text-slate-300"/>
                                                    </div>
                                                    <span className="text-[11px] font-bold text-white mb-0.5">Etiqueta & Romaneio</span>
                                                    <span className="text-[9px] font-medium text-slate-400">c/ QR Code (Parceiro)</span>
                                                </motion.button>

                                                <motion.button 
                                                    whileTap={{ scale: 0.95 }}
                                                    type="button"
                                                    onClick={() => abrirModal('ALTERAR_RASTREIO')}
                                                    className="flex flex-col items-center justify-center p-4 bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 rounded-xl transition-colors shadow-sm text-center"
                                                >
                                                    <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center mb-2 shadow-inner">
                                                        <Icons.Edit3 className="w-5 h-5 text-indigo-400"/>
                                                    </div>
                                                    <span className="text-[11px] font-bold text-white mb-0.5">Alterar Rastreio</span>
                                                    <span className="text-[9px] font-medium text-indigo-200/60">Atualizar Código Local</span>
                                                </motion.button>

                                                <div className="col-span-1 sm:col-span-4 mt-2 flex justify-end">
                                                    <button type="button" onClick={() => abrirModal('ALTERAR_ENVIO')} className="text-[10px] font-bold text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors">
                                                        Alterar Modo de Transporte (Voltar)
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {detailTab === 'AUDITORIA' && (
                        <motion.div key="AUDIT" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                            <header className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0"><Icons.Activity className="w-5 h-5"/></div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-800">Trilha de Auditoria & Segurança</h3>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">Histórico imutável de eventos e logs de segurança do pedido.</p>
                                    </div>
                                </div>
                                <div className="relative z-50 flex justify-end">
                                    <HoverProgressRoundButton text={(timelinePeriodo.start || timelinePeriodo.end) ? 'Filtrado' : 'Filtrar'} onClick={() => setIsTimelineModalOpen(!isTimelineModalOpen)} icon={Icons.Calendar} ariaLabel="Filtrar Período Timeline" loading={loadingTimeline} isActive={isTimelineModalOpen} />
                                    <DateFilterPopup isOpen={isTimelineModalOpen} onClose={() => setIsTimelineModalOpen(false)} dateRange={timelinePeriodo} setDateRange={setTimelinePeriodo} loading={loadingTimeline} onClear={() => { setTimelinePeriodo({start:'', end:''}); setIsTimelineModalOpen(false); setTimelinePage(1); }} onApply={aplicarFiltroTimeline} />
                                </div>
                            </header>
                            <div className="p-6 sm:p-8 relative flex-1 overflow-y-auto custom-scrollbar">
                                <div className="absolute left-6 sm:left-12 top-8 bottom-8 w-0.5 bg-slate-200/80"></div>
                                <div className="space-y-6 relative z-10">
                                    {timelinePaginada?.map((log, idx) => {
                                        const { tipo, titulo } = getLogInfo(log);
                                        let badgeStyle = "bg-blue-50 text-blue-600 border-blue-200";
                                        let dotStyle = "bg-blue-500 ring-blue-100";
                                        
                                        if (tipo === 'success') { badgeStyle = "bg-emerald-50 text-emerald-600 border-emerald-200"; dotStyle = "bg-emerald-500 ring-emerald-100"; } 
                                        else if (tipo === 'warning') { badgeStyle = "bg-amber-50 text-amber-600 border-amber-200"; dotStyle = "bg-amber-500 ring-amber-100"; } 
                                        else if (tipo === 'danger') { badgeStyle = "bg-rose-50 text-rose-600 border-rose-200"; dotStyle = "bg-rose-500 ring-rose-100"; }

                                        return (
                                            <article key={idx} className="relative pl-8 sm:pl-14 group">
                                                <div className={`absolute left-0 sm:left-[21px] top-4 w-3.5 h-3.5 rounded-full ring-4 shadow-sm transition-transform duration-200 ${dotStyle}`}></div>
                                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all duration-200">
                                                    <div className="flex flex-wrap justify-between items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                                                        <div className="flex items-center gap-2.5">
                                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${badgeStyle}`}>{tipo === 'info' ? 'SISTEMA' : tipo}</span>
                                                            <h5 className="font-black text-slate-800 text-sm tracking-wide">{titulo}</h5>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-400 font-mono bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">{formatDateTimeBR(log.data_raw || log.data)}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50/60 p-3 rounded-xl border border-slate-100/80">{log.evento || log.desc}</p>
                                                    <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                        <span>Executado por:</span>
                                                        <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{log.autor || 'Sistema'}</span>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                                    {(!timelinePaginada || timelinePaginada.length === 0) && (
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 text-slate-300 border border-slate-100"><Icons.Activity className="w-7 h-7" /></div>
                                            <p className="text-sm font-bold text-slate-500">Nenhum registro de auditoria encontrado.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {timelineFiltrada.length > timelinePerPage && (
                                <footer className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center text-xs font-bold text-slate-500 gap-3 shrink-0">
                                    <span>Mostrando {timelinePaginada.length} de {timelineFiltrada.length} registros</span>
                                    <div className="flex items-center gap-3">
                                        <span>Página {timelinePage} de {totalPaginasTimeline}</span>
                                        <div className="flex gap-1.5">
                                            <button type="button" onClick={() => setTimelinePage(p => Math.max(1, p - 1))} disabled={timelinePage === 1} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"><Icons.ChevronLeft className="w-4 h-4" /></button>
                                            <button type="button" onClick={() => setTimelinePage(p => Math.min(totalPaginasTimeline, p + 1))} disabled={timelinePage === totalPaginasTimeline} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"><Icons.ChevronRight className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                </footer>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    };

    return (
        <div className="w-full min-h-screen pb-20 relative font-sans">
            <Helmet><title>Gestão de Pedidos | HUB ADMIN</title></Helmet>
            <AnimatedNotification show={toast.show} status={toast.status} titulo={toast.message} />
            
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-8 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gestão de Pedidos</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Acompanhe transações, status logístico e fluxo de caixa.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <HoverProgressRoundButton text="Atualizar" onClick={handleRefresh} loading={isManualRefresh} icon={Icons.Refresh} ariaLabel="Atualizar dados" />
                </div>
            </header>
            
            <div className="px-4 sm:px-8">
                <AnimatePresence mode="wait">
                    {pedidoSelecionado ? renderDetail() : renderList()}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {renderModalAcoes()}
            </AnimatePresence>

            <AnimatePresence>
                {showMetricsHelp && (
                    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer" onClick={() => setShowMetricsHelp(false)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xl relative z-10 border border-slate-200" role="dialog">
                            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Icons.Info className="w-6 h-6 text-blue-500"/> Dicionário de Métricas</h3>
                                <button type="button" onClick={() => setShowMetricsHelp(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors"><Icons.Close className="w-5 h-5"/></button>
                            </div>
                            <div className="space-y-4 text-sm font-medium text-slate-600 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="font-bold text-slate-800">LTV Total (Receita)</p>
                                    <p className="text-xs text-slate-500 mt-1">Soma do valor bruto (Total Pago) de todas as vendas válidas. Pedidos com status 'Cancelado' ou 'Reembolsado' são subtraídos do cálculo automaticamente.</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="font-bold text-slate-800">Conversão PIX</p>
                                    <p className="text-xs text-slate-500 mt-1">Mede a eficiência dos pagamentos via PIX. Mostra a porcentagem exata de pedidos em PIX que foram pagos e aprovados em relação a todos os pedidos PIX gerados (incluindo abandonos).</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="font-bold text-slate-800">Pedidos Totais</p>
                                    <p className="text-xs text-slate-500 mt-1">Volume absoluto de pedidos processados no sistema, acompanhado da quantidade de pedidos que ainda encontram-se em fase de separação/preparação.</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="font-bold text-slate-800">Cancelados</p>
                                    <p className="text-xs text-slate-500 mt-1">Taxa de evasão e perda. Mostra a porcentagem de pedidos cancelados (por expiração de boleto, abandono ou ação manual) contra o total de pedidos.</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="font-bold text-slate-800">Reembolsados</p>
                                    <p className="text-xs text-slate-500 mt-1">Mede o impacto das devoluções. Exibe a porcentagem, a quantidade e o montante financeiro que teve o ciclo encerrado e foi devolvido ao consumidor.</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="font-bold text-slate-800">Em Análise</p>
                                    <p className="text-xs text-slate-500 mt-1">Quantidade de solicitações de reembolso/devolução que exigem a atenção do Gestor para aprovar e solicitar o envio dos comprovantes.</p>
                                </div>
                            </div>
                            <button type="button" onClick={() => setShowMetricsHelp(false)} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm">Entendido</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};


export default function AdminOrders() {
    return (
        <QueryClientProvider client={queryClient}>
            <ErrorBoundary>
                <AdminOrdersContent />
            </ErrorBoundary>
        </QueryClientProvider>
    );
}
