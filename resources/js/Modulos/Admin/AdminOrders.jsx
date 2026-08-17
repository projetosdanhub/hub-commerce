// ============================================================================
// FICHEIRO: resources/js/Modulos/Admin/AdminOrders.jsx
// ARQUITETURA: Gestão de Pedidos First Page 100% API (Com Real-Time Polling)
// UI/UX: Premium Minimal SaaS | Flex Inteligente Anti-Reflow | Filtros
// ============================================================================

import React, { useState, useMemo, useEffect, useRef, Component } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient, QueryClientProvider, QueryClient } from '@tanstack/react-query';
import api from '../../api';

const queryClient = new QueryClient();

class ErrorBoundary extends Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null }; }
    static getDerivedStateFromError(error) { return { hasError: true }; }
    componentDidCatch(error, errorInfo) { this.setState({ error }); console.error("Erro no módulo de Pedidos:", error); }
    render() {
        if (this.state.hasError) return (
            <div className="p-8 m-8 bg-rose-50 border border-rose-200 rounded-3xl" role="alert">
                <h2 className="text-xl font-black text-rose-600 mb-4 flex items-center gap-2"><Icons.AlertTriangle /> Erro de Renderização Contido</h2>
                <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition-colors shadow-sm">Recarregar Página</button>
            </div>
        );
        return this.props.children;
    }
}

const Icons = {
    Search: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Close: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" /></svg>,
    Clock: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Eye: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    WhatsApp: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
    Printer: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>,
    Box: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    Calendar: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Spinner: ({className="w-4 h-4"}) => <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>,
    Filter: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>,
    Bolt: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    AlertTriangle: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    Check: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>,
    Upload: () => <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>,
    MapPin: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    ChevronLeft: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>,
    CreditCard: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    Tag: () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
    Refresh: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    Download: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
    Crown: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>
};

const statusConfig = {
    'A_PAGAR': { label: 'A Pagar', cor: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    'SEPARACAO': { label: 'Em Separação', cor: 'bg-sky-50 text-sky-700 border-sky-200' },
    'DESPACHADO': { label: 'Enviado', cor: 'bg-purple-50 text-purple-700 border-purple-200' },
    'ENTREGUE': { label: 'Entregue', cor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    'EM_ANALISE_REEMBOLSO': { label: 'Em Análise', cor: 'bg-amber-50 text-amber-700 border-amber-200' },
    'REEMBOLSADO': { label: 'Reembolsados', cor: 'bg-rose-50 text-rose-700 border-rose-200' },
    'CANCELADO': { label: 'Cancelados', cor: 'bg-slate-100 text-slate-600 border-slate-300' }
};

const GlobalStyles = () => (
    <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; transition: all 0.3s; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #94a3b8; width: 8px; }
        input[type="checkbox"] { accent-color: #3B82F6; cursor: pointer; width: 1.1rem; height: 1.1rem; border-radius: 4px; }
    `}} />
);

// --- COMPONENTES AUXILIARES UI ---
const FadeIn = React.forwardRef(({ children, className = "", ...props }, ref) => (
    <motion.div ref={ref} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }} className={className} {...props}>
        {children}
    </motion.div>
));
FadeIn.displayName = 'FadeIn';

const ProgressButton = ({ onClick, loading, text, loadingText, className, disabled = false, icon: Icon, ariaLabel }) => (
    <button aria-label={ariaLabel || text} onClick={onClick} disabled={loading || disabled} className={`relative overflow-hidden ${className} disabled:opacity-90 disabled:cursor-not-allowed transition-all focus:ring-2 focus:ring-blue-500/20`}>
        {loading && <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5, ease: "linear" }} className="absolute left-0 top-0 h-full bg-black/10 z-0" />}
        <span className="relative z-10 flex items-center justify-center gap-2">{loading ? <><Icons.Spinner /> {loadingText}</> : <>{Icon && <Icon />} {text}</>}</span>
    </button>
);

const HoverProgressRoundButton = ({ text, onClick, loading, icon: Icon, ariaLabel }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
      <motion.button 
          onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} whileTap={loading ? {} : { scale: 0.95 }} 
          onClick={onClick} aria-label={ariaLabel} disabled={loading} animate={{ width: isHovered ? 'auto' : 48 }}
          className={`relative overflow-hidden h-12 rounded-full bg-white border border-slate-200 shadow-sm flex items-center pl-[14px] pr-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-80 transition-colors ${isHovered ? 'hover:border-blue-300 hover:bg-slate-50' : ''}`}
      >
          {loading ? <Icons.Spinner className="text-blue-500 shrink-0" /> : <Icon className="text-slate-500 group-hover:text-blue-600 shrink-0 transition-colors" />}
          <AnimatePresence>
              {isHovered && !loading && (
                  <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="text-xs font-bold text-slate-700 truncate pr-2 ml-2">
                      {text}
                  </motion.span>
              )}
          </AnimatePresence>
      </motion.button>
    );
};

const AnimatedNotification = ({ show, status, titulo }) => (
    <AnimatePresence>
        {show && (
            <motion.div initial={{ opacity: 0, y: -50, scale: 0.9 }} animate={{ opacity: 1, y: 20, scale: 1 }} exit={{ opacity: 0, y: -50, scale: 0.9 }} className="fixed top-4 right-4 z-[99999] bg-white rounded-2xl shadow-xl border border-slate-200 p-3 flex items-center gap-4 min-w-[300px]" role="alert">
                <div className="relative w-10 h-10 flex-shrink-0 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center">
                    {status === 'loading' ? <Icons.Spinner className="text-blue-500" /> : <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-500"><Icons.Check /></motion.div>}
                </div>
                <div className="pr-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{status === 'loading' ? 'A Processar...' : 'Concluído'}</p>
                    <p className="text-sm font-black text-slate-800 line-clamp-1">{status === 'loading' ? 'Aguarde um momento...' : titulo}</p>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

const DateFilterPopup = ({ dateRange, setDateRange, onApply, onClear, loading, isOpen, onClose }) => {
  const ref = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) { if (ref.current && !ref.current.contains(event.target)) onClose(); }
    document.addEventListener('mousedown', handleClickOutside); return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} ref={ref} className="absolute right-0 mt-2 bg-white border border-slate-200 rounded-3xl shadow-2xl p-5 w-80 z-[100]" role="dialog" aria-modal="true" aria-label="Filtro de Data">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2"><Icons.Filter /> Filtrar Período</p>
          <div className="space-y-4">
            <div><label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="data-inicio">Data Inicial</label><input id="data-inicio" type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-800" /></div>
            <div><label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="data-fim">Data Final</label><input id="data-fim" type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-800" /></div>
            <div className="pt-2 flex gap-2">
              <button type="button" onClick={onClear} className="w-1/3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm py-2.5 rounded-xl border border-slate-200 shadow-sm transition-colors">Limpar</button>
              <button type="button" onClick={onApply} disabled={loading} className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 rounded-xl shadow-sm transition-colors">{loading ? 'A processar...' : 'Aplicar Filtro'}</button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// UTILS
const safeNum = (val) => isNaN(Number(val)) ? 0 : Number(val);
const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safeNum(val));
const formatSmartCurrency = (value) => {
    const num = safeNum(value);
    if (num >= 1000000000) return `R$ ${(num / 1000000000).toFixed(2).replace('.', ',')}B`;
    if (num >= 1000000) return `R$ ${(num / 1000000).toFixed(2).replace('.', ',')}M`;
    if (num >= 1000) return `R$ ${(num / 1000).toFixed(1).replace('.', ',')}k`;
    return `R$ ${num.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
};
const formatDateBR = (dateStr) => {
    if(!dateStr || dateStr === '-') return '-';
    const parts = String(dateStr).split('-');
    if(parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
};
const formatPhone = (phone) => {
    if (!phone || phone === '-') return '-';
    const str = String(phone).replace(/\D/g, '');
    if (str.length === 13) return `+${str.slice(0,2)} (${str.slice(2,4)}) ${str.slice(4,9)}-${str.slice(9)}`;
    if (str.length === 11) return `+55 (${str.slice(0,2)}) ${str.slice(2,7)}-${str.slice(7)}`;
    return phone;
};

// ============================================================================
// CONTEÚDO PRINCIPAL (AdminOrdersContent)
// ============================================================================
const AdminOrdersContent = () => {
    const queryClientLocal = useQueryClient();
    const prefixo = "HUB-"; 
    
    // Estados Listagem
    const [abaAtiva, setAbaAtiva] = useState('TUDO');
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const [itensPorPagina, setItensPorPagina] = useState(10);
    const [paginaAtual, setPaginaAtual] = useState(1);
    
    // Filtro de Data Global
    const [dashDateOpen, setDashDateOpen] = useState(false);
    const [dashDateRange, setDashDateRange] = useState({ start: '', end: '' });

    // UI States
    const [toast, setToast] = useState({ show: false, message: '', status: '' });
    const showToast = (message, status = 'success') => { setToast({ show: true, message, status }); setTimeout(() => setToast({ show: false, message: '', status: '' }), 3000); };
    
    const [modalRastreio, setModalRastreio] = useState({ isOpen: false, pedidoId: null });
    const [codigoRastreio, setCodigoRastreio] = useState('');
    const [pedidosSelecionados, setPedidosSelecionados] = useState([]);
    
    // 🟢 ESTADO PRINCIPAL: FIRST PAGE VIEW E MODAL
    const [modalConfirmacao, setModalConfirmacao] = useState({ isOpen: false, tipo: null, pedidoId: null });

    const [motivoReembolso, setMotivoReembolso] = useState('');
    const [comprovanteReembolso, setComprovanteReembolso] = useState(null); 
    const [loadingAcao, setLoadingAcao] = useState(null); 
    const [printMenuOpen, setPrintMenuOpen] = useState(false);

    // Filtros Timeline Interna do Pedido
    const [timelinePeriodo, setTimelinePeriodo] = useState({ start: '', end: '' });
    const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
    const [loadingTimeline, setLoadingTimeline] = useState(false);
    const [timelinePage, setTimelinePage] = useState(1);
    const timelinePerPage = 5;

    // ==========================================
    // API: BUSCA E MUTAÇÕES REAL TIME POLLING
    // ==========================================
    const { data: fetchResult = {}, isLoading: carregandoPedidos, isFetching, refetch } = useQuery({
        queryKey: ['adminOrders'],
        queryFn: async () => { const res = await api.get('/admin/orders'); return res.data; },
        refetchInterval: 15000,
    });

    const pedidosDaApi = fetchResult.data || [];
    const metricas = fetchResult.metrics || { conversao_pix: 0, total_pix_gerados: 0 };

    // Sincronizador Real-Time
    useEffect(() => {
        if (pedidoSelecionado && pedidosDaApi.length > 0) {
            const pedidoAtualizado = pedidosDaApi.find(p => p.id === pedidoSelecionado.id);
            if (pedidoAtualizado) setPedidoSelecionado(pedidoAtualizado);
        }
    }, [pedidosDaApi]);

    useEffect(() => { setTimelinePage(1); }, [pedidoSelecionado]);

    const mutacaoAvancarStatus = useMutation({
        mutationFn: async ({ id, status }) => await api.put(`/admin/orders/${id}/status`, { status }),
        onSuccess: () => { queryClientLocal.invalidateQueries({ queryKey: ['adminOrders'] }); setLoadingAcao(null); showToast('Status atualizado!'); }
    });

    const mutacaoDespachar = useMutation({
        mutationFn: async ({ id, rastreio }) => await api.post(`/admin/orders/${id}/dispatch`, { rastreio }),
        onSuccess: () => { 
            queryClientLocal.invalidateQueries({ queryKey: ['adminOrders'] }); 
            setModalRastreio({ isOpen: false, pedidoId: null }); setCodigoRastreio(''); setLoadingAcao(null); showToast('Pedido despachado!');
        }
    });

    const mutacaoCancelarReembolsar = useMutation({
        mutationFn: async (formData) => await api.post(`/admin/orders/${pedidoSelecionado.id}/cancel`, formData, { headers: { 'Content-Type': 'multipart/form-data' }}),
        onSuccess: () => {
            queryClientLocal.invalidateQueries({ queryKey: ['adminOrders'] });
            setModalConfirmacao({ isOpen: false, tipo: null, pedidoId: null });
            setMotivoReembolso(''); setComprovanteReembolso(null); setLoadingAcao(null); showToast('Ação processada com sucesso!');
        }
    });

    // --- FILTRAGEM GLOBAL & PAGINAÇÃO ---
    const pedidosFiltrados = useMemo(() => {
        let filtrados = pedidosDaApi;
        
        if (dashDateRange.start) filtrados = filtrados.filter(p => new Date(p.data_raw) >= new Date(dashDateRange.start));
        if (dashDateRange.end) filtrados = filtrados.filter(p => new Date(p.data_raw) <= new Date(dashDateRange.end));

        if (abaAtiva !== 'TUDO') filtrados = filtrados.filter(p => p.status === abaAtiva);
        
        if (termoPesquisa) {
            const t = termoPesquisa.toLowerCase();
            filtrados = filtrados.filter(p => p.id.toString().includes(t) || (p.cliente?.nome || '').toLowerCase().includes(t) || (p.cliente?.cpf || '').includes(t));
        }
        return filtrados;
    }, [pedidosDaApi, abaAtiva, termoPesquisa, dashDateRange]);

    const timelineFiltrada = useMemo(() => {
        if (!pedidoSelecionado || !pedidoSelecionado.timeline) return [];
        let logs = pedidoSelecionado.timeline;
        if (timelinePeriodo.start) logs = logs.filter(log => new Date(log.data_raw) >= new Date(timelinePeriodo.start));
        if (timelinePeriodo.end) logs = logs.filter(log => new Date(log.data_raw) <= new Date(timelinePeriodo.end));
        return logs;
    }, [pedidoSelecionado, timelinePeriodo]);

    const indexUltimoItem = paginaAtual * itensPorPagina;
    const indexPrimeiroItem = indexUltimoItem - itensPorPagina;
    const pedidosPaginados = pedidosFiltrados.slice(indexPrimeiroItem, indexUltimoItem);
    const totalPaginas = Math.ceil(pedidosFiltrados.length / itensPorPagina);
    
    const indexUltimoLog = timelinePage * timelinePerPage;
    const indexPrimeiroLog = indexUltimoLog - timelinePerPage;
    const timelinePaginada = timelineFiltrada.slice(indexPrimeiroLog, indexUltimoLog);
    const totalPaginasTimeline = Math.ceil(timelineFiltrada.length / timelinePerPage);

    const ltvGlobalTotal = pedidosFiltrados.reduce((acc, p) => p.status !== 'CANCELADO' && p.status !== 'REEMBOLSADO' ? acc + safeNum(p.total) : acc, 0);
    const totalReembolsado = pedidosFiltrados.reduce((acc, p) => p.status === 'REEMBOLSADO' ? acc + safeNum(p.total) : acc, 0);
    const qtdReembolsados = pedidosFiltrados.filter(p => p.status === 'REEMBOLSADO').length;

    // --- AÇÕES ---
    const toggleSelecionarTodos = () => {
        if (pedidosSelecionados.length === pedidosPaginados.length) setPedidosSelecionados([]);
        else setPedidosSelecionados(pedidosPaginados.map(p => p.id));
    };

    const toggleSelecionar = (id) => {
        setPedidosSelecionados(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    const processarAcaoEmLote = (acao) => {
        if(acao === 'IMPRIMIR') alert("Gerando PDF em lote...");
        setPedidosSelecionados([]);
    };

    const imprimirPickingList = () => {
        setPrintMenuOpen(false);
        showToast('Download do Picking List iniciado!', 'success');
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = 'data:application/pdf;base64,JVBERi0xLjQKJd...'; 
            link.download = `picking_list_${prefixo}${pedidoSelecionado.id}.pdf`;
            link.click();
        }, 800);
    };

    const processarDespachoComRastreio = (comRastreio) => {
        setLoadingAcao('despachar');
        mutacaoDespachar.mutate({ id: modalRastreio.pedidoId, rastreio: comRastreio ? codigoRastreio : null });
    };

    const processarFluxoReembolso = (tipoAcao) => {
        if (!motivoReembolso.trim()) return alert("O motivo é obrigatório para registrar a auditoria financeira.");
        if (tipoAcao === 'REEMBOLSADO' && !comprovanteReembolso) return alert("O upload do comprovante é obrigatório para efetivar o reembolso.");
        
        setLoadingAcao(tipoAcao);
        const formData = new FormData();
        formData.append('tipo', tipoAcao);
        formData.append('motivo', motivoReembolso);
        if (comprovanteReembolso) formData.append('comprovante', comprovanteReembolso);
        mutacaoCancelarReembolsar.mutate(formData);
    };

    const avancarStatus = (pedidoId, statusAtual) => {
        if (statusAtual === 'SEPARACAO') return setModalRastreio({ isOpen: true, pedidoId });
        setLoadingAcao('avancar');
        let nextStatus = statusAtual === 'A_PAGAR' ? 'SEPARACAO' : 'ENTREGUE';
        mutacaoAvancarStatus.mutate({ id: pedidoId, status: nextStatus });
    };

    const aplicarFiltroTimeline = () => {
        setIsTimelineModalOpen(false);
        setLoadingTimeline(true);
        setTimeout(() => setLoadingTimeline(false), 800);
    };

    // --- RENDER DO STEPPER ANIMADO ---
    const RenderStepper = ({ status }) => {
        const steps = ['A_PAGAR', 'SEPARACAO', 'DESPACHADO', 'ENTREGUE'];
        let currentIndex = steps.indexOf(status);
        
        if (status === 'CANCELADO') return (
            <div className="text-slate-600 font-bold text-sm bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center shadow-sm">
                <span className="text-rose-500 font-black uppercase text-[10px] tracking-widest block mb-1">Pedido Cancelado (Carrinho Abandonado / Pagamento Expirado)</span>
                Motivo: {pedidoSelecionado.motivo_cancelamento || 'Motivo não informado.'}
            </div>
        );
        if (status === 'EM_ANALISE_REEMBOLSO') return (
            <div className="text-amber-700 font-bold text-sm bg-amber-50 p-4 rounded-2xl border border-amber-200 text-center shadow-sm">
                <span className="text-amber-600 font-black uppercase text-[10px] tracking-widest block mb-1 flex items-center justify-center gap-1"><Icons.AlertTriangle/> Reembolso / Devolução Em Análise</span>
                Motivo Solicitado: {pedidoSelecionado.motivo_cancelamento || 'Aguardando justificativa.'}
            </div>
        );
        if (status === 'REEMBOLSADO') return (
            <div className="text-rose-600 font-bold text-sm bg-rose-50 p-4 rounded-2xl border border-rose-200 text-center shadow-sm">
                <span className="text-rose-500 font-black uppercase text-[10px] tracking-widest block mb-1">Ciclo Financeiro Encerrado</span>
                Este pedido foi REEMBOLSADO. O estoque físico pode ter sido retornado à loja.
            </div>
        );

        return (
            <div className="flex items-center justify-between w-full max-w-lg mx-auto mb-2 mt-4 relative" aria-label="Progresso do Pedido">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full"></div>
                <motion.div initial={false} animate={{ width: `${(currentIndex / 3) * 100}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="absolute top-1/2 left-0 h-1 bg-blue-500 -translate-y-1/2 z-0 rounded-full"></motion.div>
                
                {steps.map((step, idx) => {
                    const isCompleted = idx <= currentIndex;
                    return (
                        <div key={step} className={`relative z-10 flex flex-col items-center gap-2 ${isCompleted ? 'text-blue-600' : 'text-slate-400'}`}>
                            <motion.div layout transition={{ duration: 0.5 }} className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white shadow-sm ${isCompleted ? 'border-blue-500' : 'border-slate-200'}`}>
                                {isCompleted && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring" }} className="text-blue-500">
                                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                    </motion.div>
                                )}
                            </motion.div>
                            <span className="text-[10px] font-bold uppercase whitespace-nowrap absolute -bottom-6">{statusConfig[step]?.label || step}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="w-full pb-20 font-sans">
            <Helmet><title>Gestão de Pedidos | HUB ADMIN</title></Helmet>
            <GlobalStyles />
            <AnimatedNotification show={toast.show} status={toast.status} titulo={toast.message} />

            <AnimatePresence mode="wait">
                {/* ============================================================== */}
                {/* VISUALIZAÇÃO 1: DIRETÓRIO DE PEDIDOS (TABLE)                   */}
                {/* ============================================================== */}
                {!pedidoSelecionado ? (
                    <FadeIn key="dashboard_pedidos" className="flex flex-col h-full min-h-[85vh]">
                        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Pedidos</h1>
                                <p className="text-slate-500 text-sm mt-1">Acompanhe o fluxo de vendas, gere picking lists e processe envios.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => refetch()} className={`w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 shadow-sm flex items-center justify-center transition-all ${isFetching ? 'animate-spin text-blue-500 border-blue-300' : ''}`}>
                                    <Icons.Refresh />
                                </button>
                                <div className="relative z-[100]">
                                    <HoverProgressRoundButton 
                                        text={(dashDateRange.start || dashDateRange.end) ? 'Filtrado' : 'Período'} 
                                        onClick={() => setDashDateOpen(!dashDateOpen)} 
                                        icon={Icons.Calendar} 
                                        ariaLabel="Filtrar Período de Pedidos"
                                        loading={loadingAcao === 'filtroDash'} 
                                    />
                                    <DateFilterPopup 
                                        isOpen={dashDateOpen} onClose={() => setDashDateOpen(false)}
                                        dateRange={dashDateRange} setDateRange={setDashDateRange} loading={loadingAcao === 'filtroDash'}
                                        onClear={() => { setDashDateRange({start:'',end:''}); setDashDateOpen(false); }}
                                        onApply={() => { setDashDateOpen(false); }}
                                    />
                                </div>
                                <div className="flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 rounded-xl shadow-sm">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Exibir:</span>
                                    <select aria-label="Quantidade de itens por página" value={itensPorPagina} onChange={(e) => setItensPorPagina(Number(e.target.value))} className="bg-transparent text-sm font-bold text-slate-800 outline-none cursor-pointer">
                                        <option value={10}>10 Itens</option><option value={20}>20 Itens</option><option value={30}>30 Itens</option><option value={50}>50 Itens</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* DASHBOARD DE MÉTRICAS */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 sm:gap-6 items-center justify-between">
                            <div className="flex-1 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">LTV Total (Receita)</span>
                                <div className="flex items-end gap-1.5"><span className="text-2xl font-black text-emerald-600">{formatSmartCurrency(ltvGlobalTotal)}</span></div>
                            </div>
                            <div className="flex-1 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-1">Conversão PIX</span>
                                <div className="flex items-end gap-1.5"><span className="text-2xl font-black text-blue-600">{metricas.conversao_pix}%</span></div>
                                <span className="text-[9px] font-bold text-blue-500 bg-blue-100 px-1.5 py-0.5 rounded mt-1 inline-block">{metricas.total_pix_gerados} gerados</span>
                            </div>
                            {['SEPARACAO', 'DESPACHADO', 'EM_ANALISE_REEMBOLSO'].map(stat => (
                                <div key={stat} className="flex-1 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 hover:-translate-y-1 transition-transform cursor-default">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{statusConfig[stat]?.label || stat}</span>
                                    <div className="flex items-end gap-1.5"><span className={`text-2xl font-black ${stat === 'EM_ANALISE_REEMBOLSO' ? 'text-amber-600' : 'text-slate-800'}`}>{pedidosFiltrados.filter(p=>p.status===stat).length}</span></div>
                                </div>
                            ))}
                            <div className="flex-1 bg-rose-50/50 p-4 rounded-2xl border border-rose-100/50 hover:-translate-y-1 transition-transform cursor-default">
                                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block mb-1">Total Reembolsado</span>
                                <div className="flex items-end gap-1.5"><span className="text-2xl font-black text-rose-600">{formatSmartCurrency(totalReembolsado)}</span></div>
                                <span className="text-[9px] font-bold text-rose-500 bg-rose-100 px-1.5 py-0.5 rounded mt-1 inline-block">{qtdReembolsados} pedidos</span>
                            </div>
                        </div>

                        {/* 🟢 TABELA DE PEDIDOS COM ESTRUTURA ELÁSTICA PARA PREVENIR FLICKERING */}
                        <div className="bg-white border border-slate-200 rounded-[24px] shadow-sm relative z-0 flex-1 flex flex-col min-h-[750px]">
                            <div className="p-6 border-b border-slate-200 bg-slate-50/50 rounded-t-[24px]">
                                <div className="flex gap-6 border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar pb-1">
                                    {['TUDO', 'A_PAGAR', 'SEPARACAO', 'DESPACHADO', 'ENTREGUE', 'EM_ANALISE_REEMBOLSO', 'REEMBOLSADO', 'CANCELADO'].map(tab => (
                                        <button key={tab} aria-current={abaAtiva === tab ? 'page' : undefined} onClick={() => setAbaAtiva(tab)} className={`pb-4 text-[11px] font-bold uppercase tracking-widest transition-colors relative whitespace-nowrap ${abaAtiva === tab ? 'text-blue-600' : 'text-slate-400 hover:text-slate-800'}`}>
                                            {tab === 'TUDO' ? 'Todos os Pedidos' : statusConfig[tab]?.label || tab}
                                            {abaAtiva === tab && <motion.div layoutId="tabOrder" className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-t-full" />}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative w-full md:w-[400px] flex items-center">
                                    <div className="absolute left-4 text-slate-400"><Icons.Search /></div>
                                    <input type="text" placeholder="Buscar por #Pedido, Cliente ou CPF..." value={termoPesquisa} onChange={(e) => setTermoPesquisa(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 shadow-sm transition-all" />
                                </div>
                            </div>

                            <div className="overflow-x-auto custom-scrollbar flex-1 relative flex flex-col">
                                <table className="w-full text-left border-collapse min-w-[1000px]">
                                    <thead>
                                        <tr className="bg-white border-b border-slate-100 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                            <th className="p-5 pl-6 w-12"><input type="checkbox" onChange={toggleSelecionarTodos} checked={pedidosPaginados.length > 0 && pedidosSelecionados.length === pedidosPaginados.length} /></th>
                                            <th className="p-5">Pedido & Data</th><th className="p-5">Cliente</th><th className="p-5 text-center">Itens</th><th className="p-5 text-right">Total</th><th className="p-5 text-center">Status</th><th className="p-5 pr-6 text-center">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 bg-white">
                                        <AnimatePresence mode="wait">
                                            {carregandoPedidos ? (
                                                <motion.tr key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                    <td colSpan="7" className="p-16 text-center text-slate-400 text-sm font-bold animate-pulse">Sincronizando com a Base de Dados...</td>
                                                </motion.tr>
                                            ) : pedidosPaginados.length > 0 ? pedidosPaginados.map(pedido => (
                                                <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={pedido.id} className={`transition-colors cursor-pointer group ${pedidosSelecionados.includes(pedido.id) ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`} onClick={() => setPedidoSelecionado(pedido)}>
                                                    <td className="p-5 pl-6" onClick={e => e.stopPropagation()}><input type="checkbox" checked={pedidosSelecionados.includes(pedido.id)} onChange={() => toggleSelecionar(pedido.id)} /></td>
                                                    <td className="p-5">
                                                        <div className="flex flex-col"><span className="font-black text-slate-900 text-sm group-hover:text-blue-600 transition-colors">#{prefixo}{pedido.id}</span><span className="text-[11px] font-semibold text-slate-400 mt-1 flex items-center gap-1"><Icons.Clock /> {pedido.data}</span></div>
                                                    </td>
                                                    <td className="p-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-sm text-slate-600 shadow-sm overflow-hidden">
                                                                {pedido.cliente?.avatar ? <img src={pedido.cliente.avatar} className="w-full h-full object-cover" alt="" /> : (pedido.cliente?.nome?.substring(0,2) || 'CL')}
                                                            </div>
                                                            <div className="flex flex-col"><span className="font-bold text-slate-800 text-sm block">{pedido.cliente?.nome}</span><span className="text-[10px] text-slate-500 font-mono mt-0.5">{pedido.cliente?.cpf}</span></div>
                                                        </div>
                                                    </td>
                                                    <td className="p-5 text-center">
                                                        <div className="flex flex-col items-center justify-center gap-1.5">
                                                            <span className="text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">{pedido.itens?.reduce((a, b) => a + b.qtd, 0) || 0}</span>
                                                            {pedido.itens?.some(i => i.personalizacao) && <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 text-[8px] font-bold rounded uppercase shadow-sm border border-purple-100">Personalizado</span>}
                                                        </div>
                                                    </td>
                                                    <td className="p-5 text-right"><span className="font-black text-slate-900 text-base">{formatCurrency(pedido.total)}</span></td>
                                                    <td className="p-5 text-center">
                                                        <span className={`text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest border whitespace-nowrap bg-white shadow-sm ${statusConfig[pedido.status]?.cor || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                                            {statusConfig[pedido.status]?.label || pedido.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-5 pr-6 text-center" onClick={e => e.stopPropagation()}>
                                                        <button onClick={() => setPedidoSelecionado(pedido)} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 hover:border-blue-300 rounded-full shadow-sm mx-auto text-slate-500 hover:text-blue-600 transition-colors"><Icons.Eye /></button>
                                                    </td>
                                                </motion.tr>
                                            )) : (
                                                <motion.tr key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                    <td colSpan="7" className="p-16 text-center text-slate-400 text-base font-medium">Nenhum pedido encontrado nesta aba.</td>
                                                </motion.tr>
                                            )}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>

                            {/* PAGINAÇÃO INFERIOR PREGADA NO RODAPÉ */}
                            {pedidosFiltrados.length > 0 && (
                                <div className="p-5 border-t border-slate-200 bg-slate-50/50 mt-auto rounded-b-[24px]">
                                    <div className="flex items-center justify-end gap-4 text-xs font-bold text-slate-500">
                                        <span>Página {paginaAtual} de {totalPaginas || 1}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => setPaginaAtual(p => Math.max(1, p - 1))} disabled={paginaAtual === 1} className="w-8 h-8 flex items-center justify-center bg-white shadow-sm border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors">&lt;</button>
                                            <button onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))} disabled={paginaAtual === totalPaginas || totalPaginas === 0} className="w-8 h-8 flex items-center justify-center bg-white shadow-sm border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors">&gt;</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </FadeIn>
                ) : (
                    
                /* ============================================================== */
                /* VISUALIZAÇÃO 2: DETALHES DO PEDIDO (FIRST PAGE - GRID CARDS)   */
                /* ============================================================== */
                    <FadeIn key="detalhes_pedido" className="flex flex-col gap-6">
                        
                        {/* CABEÇALHO DO PEDIDO */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <button onClick={() => {setPedidoSelecionado(null); setMotivoReembolso(''); setComprovanteReembolso(null);}} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 font-bold text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors">
                                    <Icons.ChevronLeft /> Voltar 
                                </button>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 leading-tight">#{prefixo}{pedidoSelecionado.id}</h2>
                                    <p className="text-[11px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">{pedidoSelecionado.data} às {pedidoSelecionado.hora}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                {pedidoSelecionado.status === 'A_PAGAR' && (
                                    <button onClick={() => setModalConfirmacao({ isOpen: true, tipo: 'CANCELAR', pedidoId: pedidoSelecionado.id })} className="bg-white text-rose-600 hover:bg-rose-50 font-bold rounded-xl text-sm border border-slate-200 py-2.5 px-5 transition-colors shadow-sm">Cancelar Pedido</button>
                                )}

                                {pedidoSelecionado.status === 'A_PAGAR' && (
                                    <ProgressButton onClick={() => avancarStatus(pedidoSelecionado.id, pedidoSelecionado.status)} loading={loadingAcao === 'avancar'} text="Confirmar Pagamento Manual" loadingText="Processando..." className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm shadow-sm transition-colors" />
                                )}
                                {pedidoSelecionado.status === 'SEPARACAO' && (
                                    <ProgressButton onClick={() => avancarStatus(pedidoSelecionado.id, pedidoSelecionado.status)} loading={loadingAcao === 'avancar'} text="Avançar p/ Despachado" loadingText="Processando..." className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm shadow-sm transition-colors" />
                                )}
                                {pedidoSelecionado.status === 'DESPACHADO' && (
                                    <ProgressButton onClick={() => avancarStatus(pedidoSelecionado.id, pedidoSelecionado.status)} loading={loadingAcao === 'avancar'} text="Confirmar Entrega" loadingText="Processando..." className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm shadow-sm transition-colors" />
                                )}
                                
                                <div className="relative">
                                    <button onClick={() => setPrintMenuOpen(!printMenuOpen)} className="w-10 h-10 bg-white hover:bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 border border-slate-200 transition-colors shadow-sm"><Icons.Printer /></button>
                                    <AnimatePresence>
                                        {printMenuOpen && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-[210]">
                                                <div className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50">Documentos</div>
                                                <div className="p-2 space-y-1"><button onClick={imprimirPickingList} className="w-full text-left px-3 py-3 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-3 transition-colors"><Icons.Box /> Baixar Picking List</button></div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        {/* STEPPER */}
                        <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm">
                            <RenderStepper status={pedidoSelecionado.status} />
                        </div>

                        {/* GRID PRINCIPAL */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            
                            {/* COLUNA ESQUERDA (MAIOR: ITENS, FINANCEIRO E TIMELINE) */}
                            <div className="xl:col-span-2 space-y-6">
                                
                                {/* CARD: ITENS DO PEDIDO E TOTAIS */}
                                <div className="bg-white border border-slate-200 rounded-[24px] p-6 sm:p-8 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-6"><Icons.Box /> Resumo do Pedido</h3>
                                    <div className="space-y-4 mb-6 pb-6 border-b border-slate-100">
                                        {pedidoSelecionado.itens?.map(item => (
                                            <div key={item.id} className="flex gap-4 items-start">
                                                <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200 overflow-hidden">
                                                    <img src={item.img} className="w-full h-full object-cover" alt={item.nome}/>
                                                </div>
                                                <div className="flex-1 flex flex-col justify-center">
                                                    <span className="font-bold text-slate-900 text-sm line-clamp-2 leading-tight">{item.nome}</span>
                                                    {item.descricao && <span className="text-[10px] text-slate-500 mt-1 line-clamp-1">{item.descricao}</span>}
                                                    <span className="text-[11px] font-bold text-slate-500 mt-1.5">{item.variacao} | SKU: {item.variacaoSku}</span>
                                                    
                                                    {/* DADOS DE PERSONALIZAÇÃO ANIMADOS */}
                                                    {item.personalizacao && (
                                                        <div className="mt-3 bg-indigo-50/50 border border-indigo-100 p-3.5 rounded-xl text-[11px] text-slate-700 shadow-sm">
                                                            <strong className="text-indigo-800 block mb-1.5 uppercase tracking-widest text-[9px] flex items-center gap-1"><Icons.Eye /> Personalização do Cliente</strong>
                                                            {item.personalizacao.texto && <p className="mb-1"><span className="font-bold">Texto Escrito:</span> "{item.personalizacao.texto}"</p>}
                                                            {item.personalizacao.imagem && (
                                                                <a href={item.personalizacao.imagem} download target="_blank" rel="noreferrer" className="group text-indigo-600 hover:text-indigo-800 underline font-bold mt-2 inline-flex items-center gap-1 transition-colors">
                                                                    <motion.div whileHover={{ y: 2 }} transition={{ repeat: Infinity, duration: 0.5, repeatType: "reverse" }}>
                                                                        <Icons.Download /> 
                                                                    </motion.div>
                                                                    Baixar Arquivo HD
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <span className="font-black text-slate-900 text-base block">{formatCurrency(item.qtd * item.preco)}</span>
                                                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block">Qtd: {item.qtd}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* DETALHES FINANCEIROS AVANÇADOS */}
                                    <div className="space-y-3 text-sm font-medium">
                                        <div className="flex justify-between items-center text-slate-500 border-b border-slate-50 pb-3 mb-3">
                                            <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded text-[10px] font-bold uppercase"><Icons.CreditCard /> Gateway: {pedidoSelecionado.pagamento?.gateway}</span>
                                            <div className="text-right">
                                                <span className="font-bold text-slate-700 block">{pedidoSelecionado.pagamento?.metodo} em {pedidoSelecionado.pagamento?.parcelas}x</span>
                                                {pedidoSelecionado.pagamento?.parcelas > 1 && (
                                                    <span className="text-[10px] text-slate-400">Parcela de {formatCurrency(pedidoSelecionado.pagamento?.valor_parcela)} {pedidoSelecionado.pagamento?.juros > 0 ? `(Juros ${formatCurrency(pedidoSelecionado.pagamento?.juros)})` : '(Sem Juros)'}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-slate-600 mt-4"><span>Subtotal</span><span className="font-bold">{formatCurrency(pedidoSelecionado.subtotal)}</span></div>
                                        <div className="flex justify-between text-slate-600"><span>Frete</span><span className="font-bold">{formatCurrency(pedidoSelecionado.frete)}</span></div>
                                        <div className="flex justify-between text-emerald-600"><span>Descontos Aplicados</span><span className="font-bold">- {formatCurrency(pedidoSelecionado.desconto)}</span></div>
                                        <div className="flex justify-between items-center pt-4 mt-2 border-t border-slate-100"><span className="font-black text-slate-900 uppercase tracking-widest text-[11px]">Total Final</span><span className="text-2xl font-black text-slate-900">{formatCurrency(pedidoSelecionado.total)}</span></div>
                                    </div>
                                </div>

                                {/* CARD: GESTÃO DE DEVOLUÇÃO / REEMBOLSO */}
                                {pedidoSelecionado.status !== 'CANCELADO' && pedidoSelecionado.status !== 'A_PAGAR' && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-[24px] p-6 sm:p-8 shadow-sm">
                                        <h4 className="text-sm font-black text-amber-800 flex items-center gap-2 mb-2"><Icons.AlertTriangle /> Gestão de Devolução / Reembolso</h4>
                                        <p className="text-xs font-medium text-amber-700/80 leading-relaxed mb-6">
                                            O cliente tem o direito de solicitar reembolso em até 7 dias após o recebimento.
                                        </p>
                                        
                                        {pedidoSelecionado.status === 'REEMBOLSADO' ? (
                                            <div className="bg-white border border-slate-200 rounded-[20px] p-6 text-center shadow-sm">
                                                <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-3"><Icons.Check /></div>
                                                <h3 className="text-base font-black text-rose-700">Pedido Reembolsado</h3>
                                                <p className="text-xs font-medium text-slate-500 mt-1">O valor de {formatCurrency(pedidoSelecionado.total)} foi devolvido ao cliente. O ciclo financeiro foi encerrado.</p>
                                                
                                                {pedidoSelecionado.comprovante_reembolso && (
                                                    <div className="mt-4">
                                                        <a href={pedidoSelecionado.comprovante_reembolso} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg shadow-sm transition-colors">
                                                            <Icons.Download /> Baixar Comprovante
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="bg-white border border-slate-200 rounded-[20px] p-6 shadow-sm">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Motivo da Ação Financeira *</label>
                                                <textarea value={motivoReembolso} onChange={e => setMotivoReembolso(e.target.value)} rows="2" placeholder="Ex: Cliente devolveu a mercadoria avariada..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 transition-all resize-none mb-4"></textarea>

                                                {pedidoSelecionado.status === 'EM_ANALISE_REEMBOLSO' && (
                                                    <>
                                                        <label className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block mb-2">Comprovante de Devolução (Obrigatório para Aprovar)</label>
                                                        <label className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 rounded-xl p-3 cursor-pointer transition-colors shadow-sm mb-6">
                                                            <Icons.Upload />
                                                            <span className="text-xs font-bold text-slate-600">{comprovanteReembolso ? comprovanteReembolso.name : 'Anexar PDF / Imagem'}</span>
                                                            <input type="file" accept="image/*,application/pdf" onChange={e => setComprovanteReembolso(e.target.files[0])} className="hidden" />
                                                        </label>
                                                    </>
                                                )}

                                                <div className="flex flex-col xl:flex-row gap-3 border-t border-slate-100 pt-4">
                                                    {pedidoSelecionado.status !== 'EM_ANALISE_REEMBOLSO' ? (
                                                        <ProgressButton onClick={() => processarFluxoReembolso('SOLICITACAO_REEMBOLSO')} loading={loadingAcao === 'SOLICITACAO_REEMBOLSO'} text="Iniciar Análise de Reembolso" className="w-full bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold py-3 rounded-xl text-xs transition-colors" />
                                                    ) : (
                                                        <ProgressButton disabled={!comprovanteReembolso} onClick={() => processarFluxoReembolso('REEMBOLSADO')} loading={loadingAcao === 'REEMBOLSADO'} text="Aprovar Reembolso e Encerrar" className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl text-xs shadow-sm transition-colors disabled:opacity-50" />
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 🟢 CARD: TIMELINE / AUDITORIA (COM PAGINAÇÃO FIXA E ALTURA PRESERVADA) */}
                                <div className="bg-white border border-slate-200 rounded-[24px] p-6 sm:p-8 shadow-sm flex flex-col h-[500px]">
                                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Icons.Clock /> Timeline / Auditoria</h4>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Histórico Imutável do Pedido</p>
                                        </div>
                                        <div className="relative">
                                            {/* ÍCONE DO CALENDÁRIO DA TIMELINE COM ANIMAÇÃO FAKE PROGRESS */}
                                            <HoverProgressRoundButton 
                                                text={(timelinePeriodo.start || timelinePeriodo.end) ? 'Filtrado' : 'Filtrar'} 
                                                onClick={() => setIsTimelineModalOpen(!isTimelineModalOpen)} 
                                                icon={Icons.Calendar} 
                                                ariaLabel="Filtrar Período Timeline"
                                                loading={loadingTimeline} 
                                            />
                                            
                                            <AnimatePresence>
                                                {isTimelineModalOpen && (
                                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 top-14 bg-white border border-slate-200 shadow-xl rounded-2xl p-5 z-50 w-64">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Data Início</label>
                                                        <input type="date" value={timelinePeriodo.start} onChange={e => setTimelinePeriodo({...timelinePeriodo, start: e.target.value})} className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none mb-4 focus:ring-2 focus:ring-blue-500/20" />
                                                        
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Data Fim</label>
                                                        <input type="date" value={timelinePeriodo.end} onChange={e => setTimelinePeriodo({...timelinePeriodo, end: e.target.value})} className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none mb-5 focus:ring-2 focus:ring-blue-500/20" />

                                                        <div className="flex gap-2">
                                                            <button onClick={() => {setTimelinePeriodo({start:'', end:''}); setIsTimelineModalOpen(false); setTimelinePage(1);}} className="w-1/3 text-center text-[10px] text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-lg py-2.5 transition-colors">Limpar</button>
                                                            <button onClick={aplicarFiltroTimeline} className="w-2/3 text-center text-[10px] text-white font-bold bg-blue-600 hover:bg-blue-700 rounded-lg py-2.5 transition-colors shadow-sm">Aplicar</button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                    <div className="pl-4 space-y-6 border-l-2 border-slate-100 ml-2 flex-1 overflow-y-auto custom-scrollbar">
                                        {timelinePaginada?.map((log, idx) => (
                                            <div key={idx} className="relative pl-6">
                                                <div className="absolute -left-[31px] top-0 w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow-sm"></div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{log.data}</p>
                                                <p className="text-sm text-slate-800 font-bold mt-1.5 leading-relaxed">{log.evento}</p>
                                            </div>
                                        ))}
                                        {(!timelinePaginada || timelinePaginada.length === 0) && (
                                            <p className="text-sm font-medium text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">Nenhum evento registrado para este período.</p>
                                        )}
                                    </div>

                                    {/* PAGINAÇÃO DA TIMELINE PREGADA NO RODAPÉ DO CARD */}
                                    {timelineFiltrada.length > timelinePerPage && (
                                        <div className="mt-auto pt-6 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-500">
                                            <span>Pág. {timelinePage} de {totalPaginasTimeline}</span>
                                            <div className="flex gap-2">
                                                <button onClick={() => setTimelinePage(p => Math.max(1, p - 1))} disabled={timelinePage === 1} className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-50 transition-colors">&lt;</button>
                                                <button onClick={() => setTimelinePage(p => Math.min(totalPaginasTimeline, p + 1))} disabled={timelinePage === totalPaginasTimeline} className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-50 transition-colors">&gt;</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* COLUNA DIREITA (CLIENTE, BENEFÍCIOS, ENDEREÇO) */}
                            <div className="space-y-6">
                                {/* CARD: CLIENTE (Com VIP) */}
                                <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100"><Icons.Eye /> Sobre o Cliente</h3>
                                    
                                    <div className="flex items-center gap-4 mb-6 relative">
                                        <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-lg text-slate-600 shadow-sm overflow-hidden">
                                            {pedidoSelecionado.cliente?.avatar ? <img src={pedidoSelecionado.cliente.avatar} className="w-full h-full object-cover" alt="" /> : (pedidoSelecionado.cliente?.nome?.substring(0,2) || 'CL')}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 text-base leading-tight">{pedidoSelecionado.cliente?.nome}</p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <span className="text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">{pedidoSelecionado.cliente?.origem}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 text-xs font-medium text-slate-600 mb-6 border-b border-slate-100 pb-6 relative">
                                        {/* 🟢 SELO VIP COM ÍCONE DE COROA ESTILIZADO */}
                                        <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-100 to-yellow-50 border border-yellow-200 text-yellow-700 font-black text-[10px] uppercase px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                                            <Icons.Crown/>{pedidoSelecionado.cliente?.rank}
                                        </div>
                                        
                                        <div className="flex flex-col gap-1"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">WhatsApp / Telefone</span><span className="font-bold text-slate-800">{formatPhone(pedidoSelecionado.cliente?.telefone)}</span></div>
                                        <div className="flex flex-col gap-1"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">E-mail de Contato</span><span>{pedidoSelecionado.cliente?.email}</span></div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CPF</span><span className="font-mono">{pedidoSelecionado.cliente?.cpf}</span></div>
                                            <div className="flex flex-col gap-1"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gênero</span><span>{pedidoSelecionado.cliente?.sexo}</span></div>
                                            <div className="flex flex-col gap-1"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nascimento</span><span>{formatDateBR(pedidoSelecionado.cliente?.nascimento)}</span></div>
                                        </div>
                                    </div>

                                    {pedidoSelecionado.cliente?.tags?.length > 0 && (
                                        <div className="mb-6 flex flex-wrap gap-1">
                                            {pedidoSelecionado.cliente.tags.map(tag => <span key={tag} className="flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded-md shadow-sm"><Icons.Tag /> {tag}</span>)}
                                        </div>
                                    )}

                                    <a href={`https://wa.me/${pedidoSelecionado.cliente?.telefone?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="w-full bg-[#25D366] text-white text-xs font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 shadow-sm hover:bg-[#1ebe57] transition-all">
                                        <Icons.WhatsApp /> Falar no WhatsApp
                                    </a>
                                </div>

                                {/* CARD: BENEFÍCIOS MÚLTIPLOS USADOS */}
                                <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Cupons Aplicados no Pedido</h4>
                                    <div className="space-y-3 text-sm">
                                        {pedidoSelecionado.cupons && pedidoSelecionado.cupons.length > 0 ? (
                                            pedidoSelecionado.cupons.map((cupom, i) => (
                                                <div key={i} className="flex justify-between items-center pb-2 border-b border-slate-50">
                                                    <div>
                                                        <span className="font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 shadow-sm">{cupom.nome}</span>
                                                        <span className={`block text-[9px] font-bold mt-2 uppercase ${cupom.tipo === 'Frete' ? 'text-blue-500' : 'text-emerald-500'}`}>Desc. {cupom.tipo}</span>
                                                    </div>
                                                    <span className="font-black text-emerald-600">- {formatCurrency(cupom.valor)}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <span className="font-medium text-slate-400 text-xs">Nenhum cupom foi utilizado nesta compra.</span>
                                        )}
                                    </div>
                                </div>

                                {/* CARD: ENDEREÇO DE ENTREGA */}
                                <div className="bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-sm">
                                    <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-sm"><Icons.MapPin /></div>
                                            <h4 className="text-sm font-bold text-slate-800">Endereço de Entrega</h4>
                                        </div>
                                        <div className="space-y-3 text-xs font-medium text-slate-600">
                                            {/* CORREÇÃO DO ENDEREÇO COM OS NOVOS CAMPOS DO BANCO */}
                                            <div className="flex flex-col"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Rua</span><span className="font-black text-slate-800 text-sm">{pedidoSelecionado.endereco?.rua}, {pedidoSelecionado.endereco?.num}</span></div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="flex flex-col"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Bairro</span><span>{pedidoSelecionado.endereco?.bairro}</span></div>
                                                <div className="flex flex-col"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">CEP</span><span className="font-mono font-bold text-slate-500">{pedidoSelecionado.endereco?.cep}</span></div>
                                            </div>
                                            <div className="flex flex-col"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Cidade / UF</span><span className="font-bold text-slate-800">{pedidoSelecionado.endereco?.cidade} - {pedidoSelecionado.endereco?.uf}</span></div>
                                            <div className="flex flex-col pt-2 border-t border-slate-100"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Complemento / Referência</span><span>{pedidoSelecionado.endereco?.complemento || '-'} | {pedidoSelecionado.endereco?.referencia || '-'}</span></div>
                                        </div>
                                        {pedidoSelecionado.rastreio && (
                                            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                                                <div>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Rastreio</span>
                                                    <span className="font-bold text-slate-800 font-mono">{pedidoSelecionado.rastreio}</span>
                                                </div>
                                                <button onClick={() => navigator.clipboard.writeText(pedidoSelecionado.rastreio)} className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors">Copiar</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                )}
            </AnimatePresence>

            {/* MODAL DE RASTREIO E CANCELAMENTO */}
            <AnimatePresence>
                {modalRastreio.isOpen && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalRastreio({ isOpen: false, pedidoId: null })} />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-[24px] shadow-2xl p-8 w-full max-w-sm relative z-10 border border-slate-200" role="dialog">
                            <h3 className="text-xl font-black text-slate-900 mb-2">Despachar Pedido</h3>
                            <p className="text-sm font-medium text-slate-500 mb-6">Insira o código de rastreio. Caso não possua, despache sem código.</p>
                            <input type="text" placeholder="BR123456789PT (Opcional)" value={codigoRastreio} onChange={e => setCodigoRastreio(e.target.value.toUpperCase())} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-mono font-bold outline-none focus:border-blue-500 mb-6 transition-all shadow-inner" />
                            <div className="flex gap-3">
                                <button onClick={() => processarDespachoComRastreio(false)} className="flex-1 bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold py-4 rounded-xl text-xs transition-colors shadow-sm">Sem Rastreio</button>
                                <ProgressButton onClick={() => processarDespachoComRastreio(true)} disabled={!codigoRastreio} loading={loadingAcao === 'despachar'} text="Com Rastreio" loadingText="Enviando" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-xs shadow-sm transition-colors" />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {modalConfirmacao.isOpen && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalConfirmacao({ ...modalConfirmacao, isOpen: false })} />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-[24px] shadow-2xl p-8 w-full max-w-md relative z-10 border border-slate-200" role="dialog">
                            <h3 className="text-xl font-black mb-2 text-rose-600 flex items-center gap-2"><Icons.AlertTriangle/> Cancelar Pedido</h3>
                            <p className="text-sm font-medium text-slate-500 mb-2">Este pedido ainda não foi pago. O estorno será apenas interno.</p>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 mt-4">Motivo Obrigatório *</label>
                            <textarea value={motivoReembolso} onChange={e => setMotivoReembolso(e.target.value)} rows="3" placeholder="Ex: Boleto não pago..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-700 outline-none focus:border-rose-500 resize-none mb-6 transition-all shadow-inner" />
                            <div className="flex gap-3">
                                <button onClick={() => setModalConfirmacao({ ...modalConfirmacao, isOpen: false })} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors shadow-sm">Voltar</button>
                                <ProgressButton onClick={() => processarFluxoReembolso('CANCELAMENTO')} loading={loadingAcao === 'CANCELAMENTO'} text="Confirmar Cancelamento" className="flex-[2] bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm shadow-sm transition-colors" />
                            </div>
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