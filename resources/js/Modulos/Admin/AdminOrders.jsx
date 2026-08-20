// ============================================================================
// FICHEIRO: resources/js/Modulos/Admin/AdminOrders.jsx
// ARQUITETURA: Gestão de Pedidos First Page 100% API (Com Real-Time Polling)
// UI/UX: Premium Minimal SaaS | Flex Inteligente Anti-Reflow | Filtros URL Sync
// ============================================================================

import React, { useState, useMemo, useEffect, useRef, Component } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient, QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { refetchOnWindowFocus: false, staleTime: 1000 * 60 * 5 },
    },
});

// =========================================================
// 🟢 ANIMAÇÃO PADRÃO ULTRA-SUAVE (TAB TRANSITION)
// =========================================================
const tabTransition = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeInOut" } }
};

class ErrorBoundary extends Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null, errorInfo: null }; }
    static getDerivedStateFromError(error) { return { hasError: true }; }
    componentDidCatch(error, errorInfo) { this.setState({ error, errorInfo }); console.error("Erro no módulo de Pedidos:", error, errorInfo); }
    render() {
        if (this.state.hasError) return (
            <div className="p-8 m-8 bg-rose-50 border border-rose-200 rounded-3xl shadow-sm" role="alert">
                <h2 className="text-xl font-black text-rose-600 mb-4 flex items-center gap-2">Erro de Renderização Contido</h2>
                <div className="bg-white p-4 rounded-xl border border-rose-100 overflow-auto text-[10px] font-mono text-slate-800 shadow-inner max-h-48 mb-4">
                    <p className="font-bold text-rose-500 mb-2">{String(this.state.error)}</p>
                    <p className="whitespace-pre-wrap text-slate-500">{this.state.errorInfo?.componentStack}</p>
                </div>
                <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition-colors shadow-sm">Recarregar Página</button>
            </div>
        );
        return this.props.children;
    }
}

// ==========================================
// 1. DICIONÁRIO COMPLETO DE ÍCONES
// ==========================================
const Icons = {
    Search: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Calendar: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Filter: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>,
    Close: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
    ChevronLeft: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>,
    ChevronRight: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>,
    Package: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    Box: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    CreditCard: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    Spinner: ({className="w-4 h-4"}) => <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>,
    Check: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>,
    Download: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
    Tag: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
    Eye: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    Crown: ({className="w-4 h-4"}) => <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>,
    Shield: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    MapPin: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    DollarSign: ({ className = "w-4 h-4" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"></line><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
    UserCircle: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Edit3: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    AlertTriangle: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    WhatsApp: ({className="w-4 h-4"}) => <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
    Printer: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>,
    Clock: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Refresh: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    Upload: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
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

const TABS_INTELIGENTES = [
    { key: 'TUDO', label: 'Todos os Pedidos' },
    { key: 'A_PAGAR', label: 'A Pagar' },
    { key: 'SEPARACAO', label: 'Em Separação' },
    { key: 'DESPACHADO', label: 'Enviado' },
    { key: 'ENTREGUE', label: 'Entregue' },
    { key: 'EM_ANALISE_REEMBOLSO', label: 'Em Análise' },
    { key: 'REEMBOLSADO', label: 'Reembolsados' },
    { key: 'CANCELADO', label: 'Cancelados' }
];

const GlobalStyles = () => (
    <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; transition: all 0.3s; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #94a3b8; width: 8px; }
        input[type="checkbox"] { accent-color: #3B82F6; cursor: pointer; width: 1.1rem; height: 1.1rem; border-radius: 4px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
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
        <span className="relative z-10 flex items-center justify-center gap-2">{loading ? <><Icons.Spinner className="w-4 h-4" /> {loadingText || text}</> : <>{Icon && <Icon className="w-4 h-4" />} {text}</>}</span>
    </button>
);

// 🟢 BOTÃO ANIMADO DE FILTRO E POPUP (BLINDADO)
const HoverProgressRoundButton = ({ text, onClick, loading, icon: Icon, ariaLabel, isActive }) => {
    const [isHovered, setIsHovered] = useState(false);
    const shouldExpand = isHovered || isActive;

    return (
      <motion.button 
          onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} whileTap={loading ? {} : { scale: 0.95 }} 
          onClick={onClick} aria-label={ariaLabel} disabled={loading} animate={{ width: shouldExpand ? 'auto' : 48 }}
          className={`relative overflow-hidden h-[38px] rounded-full bg-white border shadow-sm flex items-center pl-[14px] pr-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-80 transition-colors z-10 ${shouldExpand ? 'border-blue-300 bg-blue-50' : 'border-slate-200'}`}
      >
          {loading && (
             <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 38 38">
                 <motion.circle cx="19" cy="19" r="17" fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="106" initial={{ strokeDashoffset: 106 }} animate={{ strokeDashoffset: 0 }} transition={{ duration: 1.5, ease: "linear" }} />
             </svg>
          )}
          <div className="relative z-10 flex items-center gap-2 whitespace-nowrap">
              {loading ? <Icons.Spinner className="w-5 h-5 text-blue-500 shrink-0" /> : <Icon className={`w-5 h-5 shrink-0 transition-colors ${shouldExpand ? 'text-blue-600' : 'text-slate-500'}`} />}
              <AnimatePresence>
                  {shouldExpand && !loading && (
                      <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="text-[11px] font-bold text-slate-700 truncate pr-2">
                          {text}
                      </motion.span>
                  )}
              </AnimatePresence>
          </div>
      </motion.button>
    );
};

const DateFilterPopup = ({ dateRange, setDateRange, onApply, onClear, loading, isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={(e) => { e.stopPropagation(); onClose(); }} aria-hidden="true"></div>
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 top-full mt-2 origin-top-right bg-white border border-slate-200 rounded-3xl shadow-2xl p-5 w-80 z-[100]" role="dialog" aria-modal="true" aria-label="Filtro de Data">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2"><Icons.Filter className="w-4 h-4"/> Filtrar Período</p>
            <div className="space-y-4">
              <div className="relative z-10">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="data-inicio">Data Inicial</label>
                  <input id="data-inicio" type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-800 cursor-pointer transition-all shadow-sm" />
              </div>
              <div className="relative z-10">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="data-fim">Data Final</label>
                  <input id="data-fim" type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-800 cursor-pointer transition-all shadow-sm" />
              </div>
              <div className="pt-2 flex gap-2 relative z-10">
                <button type="button" onClick={onClear} className="w-1/3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs py-2.5 rounded-xl border border-slate-200 shadow-sm transition-colors">Limpar</button>
                <button type="button" onClick={onApply} disabled={loading} className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm transition-colors">{loading ? 'Aplicando...' : 'Aplicar Filtro'}</button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const AnimatedNotification = ({ show, status, titulo }) => (
    <AnimatePresence>
        {show && (
            <motion.div initial={{ opacity: 0, y: -50, scale: 0.9 }} animate={{ opacity: 1, y: 20, scale: 1 }} exit={{ opacity: 0, y: -50, scale: 0.9 }} className="fixed top-4 right-4 z-[99999] bg-white rounded-2xl shadow-xl border border-slate-200 p-3 flex items-center gap-4 min-w-[300px]" role="alert">
                <div className="relative w-10 h-10 flex-shrink-0 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center">
                    {status === 'loading' ? <Icons.Spinner className="text-blue-500 w-5 h-5" /> : <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-500"><Icons.Check className="w-5 h-5"/></motion.div>}
                </div>
                <div className="pr-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{status === 'loading' ? 'A Processar...' : 'Concluído'}</p>
                    <p className="text-sm font-black text-slate-800 line-clamp-1">{status === 'loading' ? 'Aguarde um momento...' : titulo}</p>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

// UTILS
const safeNum = (val) => isNaN(Number(val)) ? 0 : Number(val);
const safeStr = (val) => { if (val === null || val === undefined) return ''; return String(val); };
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
    try { const parts = safeStr(dateStr).split('-'); if(parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`; return safeStr(dateStr); } 
    catch(e) { return '-'; }
};
const formatDateTimeBR = (dateStr) => {
    if(!dateStr) return '-';
    try { const d = new Date(dateStr); return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }); } 
    catch(e) { return '-'; }
};
const formatPhone = (phone) => {
    if (!phone || phone === '-') return '-';
    const str = String(phone).replace(/\D/g, '');
    if (str.length === 13) return `+${str.slice(0,2)} (${str.slice(2,4)}) ${str.slice(4,9)}-${str.slice(9)}`;
    if (str.length === 11) return `+55 (${str.slice(0,2)}) ${str.slice(2,7)}-${str.slice(7)}`;
    return phone;
};
const parseCoupons = (coupons) => {
    if (!coupons) return [];
    return typeof coupons === 'string' ? JSON.parse(coupons) : coupons;
};

// ============================================================================
// CONTEÚDO PRINCIPAL (AdminOrdersContent)
// ============================================================================
const AdminOrdersContent = () => {
    
    // =========================================================
    // 🟢 1. LEITURA REATIVA DE PARÂMETROS DA URL
    // =========================================================
    const [searchParams, setSearchParams] = useSearchParams();
    const orderIdUrl = searchParams.get('id');
    const navigate = useNavigate(); 
    
    const queryClientLocal = useQueryClient();
    const prefixo = "HUB-"; 
    
    // Estados Listagem
    const [abaAtiva, setAbaAtiva] = useState('TUDO');
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const [itensPorPagina, setItensPorPagina] = useState(10);
    const [paginaAtual, setPaginaAtual] = useState(1);
    
    // Filtro de Data Animado (Dashboard)
    const [dashDateOpen, setDashDateOpen] = useState(false);
    const [dashDateRange, setDashDateRange] = useState({ start: '', end: '' });
    const [dashFilterText, setDashFilterText] = useState('Todo o Período');

    // UI States e Modais
    const [toast, setToast] = useState({ show: false, message: '', status: '' });
    const showToast = (message, status = 'success') => { setToast({ show: true, message, status }); setTimeout(() => setToast({ show: false, message: '', status: '' }), 3000); };
    
    const [modalRastreio, setModalRastreio] = useState({ isOpen: false, pedidoId: null });
    const [codigoRastreio, setCodigoRastreio] = useState('');
    const [pedidosSelecionados, setPedidosSelecionados] = useState([]);
    
    // ESTADO PRINCIPAL: FIRST PAGE VIEW E MODAL
    const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
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

    // Transportadora Manual Interna
    const [transpManualInput, setTranspManualInput] = useState('');

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

    // =========================================================
    // 🟢 2. AUTO-OPEN MODAL VIA URL E MANUTENÇÃO DE ESTADO
    // =========================================================
    useEffect(() => {
        if (orderIdUrl && pedidosDaApi && pedidosDaApi.length > 0) {
            const pedidoAlvo = pedidosDaApi.find(p => String(p.id) === String(orderIdUrl));
            if (pedidoAlvo && (!pedidoSelecionado || pedidoSelecionado.id !== pedidoAlvo.id)) {
                setPedidoSelecionado(pedidoAlvo);
            } else if (!pedidoAlvo) {
                setSearchParams({});
            }
        }
    }, [orderIdUrl, pedidosDaApi]); 

    // Sincronizador Real-Time para Pedido Selecionado
    useEffect(() => {
        if (pedidoSelecionado && pedidosDaApi.length > 0) {
            const pedidoAtualizado = pedidosDaApi.find(p => p.id === pedidoSelecionado.id);
            if (pedidoAtualizado && JSON.stringify(pedidoAtualizado) !== JSON.stringify(pedidoSelecionado)) {
                setPedidoSelecionado(pedidoAtualizado);
            }
        }
    }, [pedidosDaApi]);

    // Reseta página da timeline e carrega o input de transportadora ao abrir novo pedido
    useEffect(() => { 
        setTimelinePage(1); 
        setTranspManualInput(pedidoSelecionado?.carrier || '');
    }, [pedidoSelecionado?.id]);

    // =========================================================
    // 🟢 3. FUNÇÕES DE AÇÃO E FECHAMENTO
    // =========================================================
    const handleFecharPedido = () => {
        setPedidoSelecionado(null);
        setMotivoReembolso('');
        setComprovanteReembolso(null);
        if (orderIdUrl) setSearchParams({});
    };

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

    const mutacaoAtualizarTransportadora = useMutation({
        mutationFn: async ({ id, carrier }) => await api.put(`/admin/orders/${id}/carrier`, { carrier }),
        onSuccess: () => {
            queryClientLocal.invalidateQueries({ queryKey: ['adminOrders'] });
            setLoadingAcao(null);
            showToast('Transportadora salva na auditoria!', 'success');
        }
    });

    const salvarTransportadoraManual = () => {
        setLoadingAcao('salvarTransportadora');
        mutacaoAtualizarTransportadora.mutate({ id: pedidoSelecionado.id, carrier: transpManualInput });
    };

    // --- FILTRAGEM GLOBAL & PAGINAÇÃO ---
    const pedidosFiltrados = useMemo(() => {
        let filtrados = pedidosDaApi;
        
        if (dashDateRange.start) {
            const s = new Date(dashDateRange.start); s.setHours(0,0,0,0);
            filtrados = filtrados.filter(p => new Date(p.data_raw || p.created_at) >= s);
        }
        if (dashDateRange.end) {
            const e = new Date(dashDateRange.end); e.setHours(23,59,59,999);
            filtrados = filtrados.filter(p => new Date(p.data_raw || p.created_at) <= e);
        }

        if (abaAtiva !== 'TUDO') filtrados = filtrados.filter(p => p.status === abaAtiva);
        
        if (termoPesquisa) {
            const t = termoPesquisa.toLowerCase();
            filtrados = filtrados.filter(p => p.id.toString().includes(t) || (p.cliente?.nome || '').toLowerCase().includes(t) || (p.cliente?.cpf || '').includes(t));
        }
        return filtrados.sort((a,b) => new Date(b.data_raw || b.created_at) - new Date(a.data_raw || a.created_at));
    }, [pedidosDaApi, abaAtiva, termoPesquisa, dashDateRange]);

    const timelineFiltrada = useMemo(() => {
        if (!pedidoSelecionado || !pedidoSelecionado.timeline) return [];
        let logs = pedidoSelecionado.timeline;
        if (timelinePeriodo.start) {
            const s = new Date(timelinePeriodo.start); s.setHours(0,0,0,0);
            logs = logs.filter(log => new Date(log.data_raw || log.data) >= s);
        }
        if (timelinePeriodo.end) {
            const e = new Date(timelinePeriodo.end); e.setHours(23,59,59,999);
            logs = logs.filter(log => new Date(log.data_raw || log.data) <= e);
        }
        return logs;
    }, [pedidoSelecionado, timelinePeriodo]);

    const indexUltimoItem = paginaAtual * itensPorPagina;
    const indexPrimeiroItem = indexUltimoItem - itensPorPagina;
    const pedidosPaginados = pedidosFiltrados.slice(indexPrimeiroItem, indexUltimoItem);
    const totalPaginas = Math.ceil(pedidosFiltrados.length / itensPorPagina) || 1;

    const indexUltimoLog = timelinePage * timelinePerPage;
    const indexPrimeiroLog = indexUltimoLog - timelinePerPage;
    const timelinePaginada = timelineFiltrada.slice(indexPrimeiroLog, indexUltimoLog);
    const totalPaginasTimeline = Math.ceil(timelineFiltrada.length / timelinePerPage) || 1;

    // Métricas
    const ltvGlobalTotal = pedidosDaApi
        .filter(p => {
             if (dashDateRange.start && new Date(p.data_raw || p.created_at) < new Date(dashDateRange.start).setHours(0,0,0,0)) return false;
             if (dashDateRange.end && new Date(p.data_raw || p.created_at) > new Date(dashDateRange.end).setHours(23,59,59,999)) return false;
             return true;
        })
        .reduce((acc, p) => p.status !== 'CANCELADO' && p.status !== 'REEMBOLSADO' ? acc + safeNum(p.total) : acc, 0);

    const pedidosReembolsadosFiltered = pedidosDaApi.filter(p => {
        if (p.status !== 'REEMBOLSADO') return false;
        if (dashDateRange.start && new Date(p.data_raw || p.created_at) < new Date(dashDateRange.start).setHours(0,0,0,0)) return false;
        if (dashDateRange.end && new Date(p.data_raw || p.created_at) > new Date(dashDateRange.end).setHours(23,59,59,999)) return false;
        return true;
    });
    const totalReembolsado = pedidosReembolsadosFiltered.reduce((acc, p) => acc + safeNum(p.total), 0);
    const qtdReembolsados = pedidosReembolsadosFiltered.length;

    // --- AÇÕES ---
    const toggleSelecionarTodos = () => {
        if (pedidosSelecionados.length === pedidosPaginados.length && pedidosPaginados.length > 0) setPedidosSelecionados([]);
        else setPedidosSelecionados(pedidosPaginados.map(p => p.id));
    };

    const toggleSelecionar = (id) => {
        setPedidosSelecionados(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
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
        setLoadingTimeline(true);
        setTimeout(() => { setLoadingTimeline(false); setIsTimelineModalOpen(false); }, 800);
    };

    // --- RENDER DO STEPPER ANIMADO (PROGRESSO) ---
    // A trava "hasAnimated" impede que ele pisque a cada vez que o Real-Time Polling rodar
    const RenderStepper = ({ status }) => {
        const [isInitialMount, setIsInitialMount] = useState(true);
        useEffect(() => { setIsInitialMount(false); }, []);

        const steps = ['A_PAGAR', 'SEPARACAO', 'DESPACHADO', 'ENTREGUE'];
        const flowLabels = ['A Pagar', 'Em Separação', 'Enviado', 'Entregue'];
        
        let currentIndex = steps.indexOf(status);
        if (currentIndex === -1 && ['CANCELADO', 'REEMBOLSADO', 'EM_ANALISE_REEMBOLSO'].includes(status)) {
            currentIndex = 0; 
        }
        
        const progressPercentage = currentIndex === -1 ? 0 : (currentIndex / (steps.length - 1)) * 100;

        if (status === 'CANCELADO') return (
            <div className="text-slate-600 font-bold text-sm bg-slate-50 p-6 rounded-[24px] border border-slate-200 text-center shadow-sm">
                <span className="text-rose-500 font-black uppercase text-xs tracking-widest block mb-2">Pedido Cancelado (Carrinho Abandonado / Pagamento Expirado)</span>
                Motivo: {pedidoSelecionado.motivo_cancelamento || 'Motivo não informado.'}
            </div>
        );
        if (status === 'EM_ANALISE_REEMBOLSO') return (
            <div className="text-amber-700 font-bold text-sm bg-amber-50 p-6 rounded-[24px] border border-amber-200 text-center shadow-sm">
                <span className="text-amber-600 font-black uppercase text-xs tracking-widest block mb-2 flex items-center justify-center gap-2"><Icons.AlertTriangle className="w-5 h-5"/> Reembolso / Devolução Em Análise</span>
                Motivo Solicitado: {pedidoSelecionado.motivo_cancelamento || 'Aguardando justificativa.'}
            </div>
        );
        if (status === 'REEMBOLSADO') return (
            <div className="text-rose-600 font-bold text-sm bg-rose-50 p-6 rounded-[24px] border border-rose-200 text-center shadow-sm">
                <span className="text-rose-500 font-black uppercase text-xs tracking-widest block mb-2">Ciclo Financeiro Encerrado</span>
                Este pedido foi REEMBOLSADO. O estoque físico pode ter sido retornado à loja.
            </div>
        );

        return (
            <div className="relative overflow-hidden p-6 sm:p-8 bg-slate-50/50 rounded-[24px] border border-slate-100 mb-6">
                <div className="relative z-10 w-full max-w-2xl mx-auto flex items-center justify-between pb-6 pt-2">
                    {/* Linha de fundo */}
                    <div className="absolute top-[22px] left-0 w-full h-1.5 bg-slate-200 rounded-full z-0" />
                    {/* Linha Preenchida Animada (Só anima do 0 no primeiro mount) */}
                    <motion.div 
                        className="absolute top-[22px] left-0 h-1.5 bg-emerald-500 rounded-full z-0 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                        initial={isInitialMount ? { width: 0 } : false}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                    
                    {steps.map((step, idx) => {
                        const isCompleted = idx <= currentIndex;
                        const isCurrent = idx === currentIndex;
                        return (
                            <div key={step} className="relative z-10 flex flex-col items-center gap-3 px-2 bg-slate-50/50">
                                <motion.div 
                                    initial={isInitialMount ? { scale: 0.8, opacity: 0 } : false} 
                                    animate={{ scale: 1, opacity: 1 }} 
                                    transition={{ delay: idx * 0.2 }}
                                    className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-colors duration-500 ${isCompleted ? 'bg-emerald-500 border-emerald-100 text-white shadow-lg shadow-emerald-500/30' : 'bg-white border-slate-200 text-slate-300'}`}
                                >
                                    {isCompleted ? <Icons.Check className="w-5 h-5"/> : <Icons.Box className="w-5 h-5"/>}
                                </motion.div>
                                <span className={`text-[11px] font-black uppercase tracking-widest absolute -bottom-4 whitespace-nowrap ${isCurrent ? 'text-emerald-600' : isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>
                                    {flowLabels[idx]}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // ============================================================================
    // RENDER: LISTAGEM DE PEDIDOS
    // ============================================================================
    const renderList = () => (
        <motion.div key="list" {...tabTransition} className="bg-transparent flex flex-col min-h-[600px] overflow-hidden">
            
            {/* 🟢 DASHBOARD DE MÉTRICAS */}
            <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 sm:gap-6 items-center justify-between">
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
                        <div className="flex items-end gap-1.5"><span className={`text-2xl font-black ${stat === 'EM_ANALISE_REEMBOLSO' ? 'text-amber-600' : 'text-slate-800'}`}>{pedidosDaApi.filter(p=>p.status===stat).length}</span></div>
                    </div>
                ))}
                <div className="flex-1 bg-rose-50/50 p-4 rounded-2xl border border-rose-100/50 hover:-translate-y-1 transition-transform cursor-default">
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block mb-1">Total Reembolsado</span>
                    <div className="flex items-end gap-1.5"><span className="text-2xl font-black text-rose-600">{formatSmartCurrency(totalReembolsado)}</span></div>
                    <span className="text-[9px] font-bold text-rose-500 bg-rose-100 px-1.5 py-0.5 rounded mt-1 inline-block">{qtdReembolsados} pedidos</span>
                </div>
            </div>

            <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 flex flex-col flex-1">
                {/* TOPO: Buscas e Filtros */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 rounded-t-[32px]">
                    <div className="relative w-full lg:w-[450px]">
                        <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input type="text" placeholder="Buscar pedido, nome, CPF ou e-mail..." value={termoPesquisa} onChange={e => {setTermoPesquisa(e.target.value); setPaginaAtual(1);}} className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 shadow-sm transition-all" />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <button onClick={() => refetch()} className={`w-[48px] h-[48px] rounded-full bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 shadow-sm flex items-center justify-center transition-all ${isFetching ? 'animate-spin text-blue-500 border-blue-300' : ''}`} title="Atualizar Pedidos">
                            <Icons.Refresh className="w-5 h-5"/>
                        </button>
                        
                        <div className="relative z-[50]">
                            <HoverProgressRoundButton 
                                text={dashFilterText}
                                onClick={() => setDashDateOpen(!dashDateOpen)}
                                icon={Icons.Calendar}
                                isActive={dashDateOpen}
                                loading={loadingAcao === 'filtroDate'}
                            />
                            <DateFilterPopup 
                                isOpen={dashDateOpen} onClose={() => setDashDateOpen(false)}
                                dateRange={dashDateRange} setDateRange={setDashDateRange}
                                loading={loadingAcao === 'filtroDate'}
                                onClear={() => { setDashDateRange({start:'', end:''}); setDashFilterText('Todo o Período'); setDashDateOpen(false); setPaginaAtual(1); }}
                                onApply={() => { 
                                    if(dashDateRange.start && dashDateRange.end) {
                                        setLoadingAcao('filtroDate');
                                        setTimeout(() => {
                                            setDashFilterText(`${formatDateBR(dashDateRange.start)} até ${formatDateBR(dashDateRange.end)}`);
                                            setDashDateOpen(false); setPaginaAtual(1);
                                            setLoadingAcao(null);
                                        }, 600);
                                    }
                                }}
                            />
                        </div>
                        
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 h-[48px] shadow-sm focus-within:border-blue-500 transition-all">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Exibir:</span>
                            <select value={itensPorPagina} onChange={e => {setItensPorPagina(Number(e.target.value)); setPaginaAtual(1);}} className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer">
                                <option value={5}>5 Itens</option><option value={10}>10 Itens</option><option value={20}>20 Itens</option><option value={30}>30 Itens</option><option value={50}>50 Itens</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* ABAS INTELIGENTES */}
                <div className="flex overflow-x-auto custom-scrollbar border-b border-slate-100 bg-white items-center gap-6 px-6">
                    {TABS_INTELIGENTES.map(tab => {
                        return (
                        <button key={tab.key} onClick={() => {setAbaAtiva(tab.key); setPaginaAtual(1);}} className={`relative py-4 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${abaAtiva === tab.key ? 'text-blue-600' : 'text-slate-400 hover:text-slate-800'}`}>
                            {tab.label}
                            {abaAtiva === tab.key && <motion.div layoutId="orderTabIndicator" className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-t-md" />}
                        </button>
                        )
                    })}
                </div>

                {/* TABELA DE PEDIDOS */}
                <div className="overflow-x-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap min-w-[1000px]">
                        <thead className="bg-slate-50/50 text-slate-400 uppercase font-black text-[10px] tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 w-12"><input type="checkbox" onChange={toggleSelecionarTodos} checked={pedidosPaginados.length > 0 && pedidosSelecionados.length === pedidosPaginados.length} /></th>
                                <th className="px-6 py-4">Pedido & Data</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4 text-center">Itens</th>
                                <th className="px-6 py-4 text-right">Total</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            <AnimatePresence mode="wait">
                                {pedidosPaginados.length > 0 ? pedidosPaginados.map(o => (
                                    <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={o.id} className="hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => setPedidoSelecionado(o)}>
                                        <td className="px-6 py-4" onClick={e => e.stopPropagation()}><input type="checkbox" checked={pedidosSelecionados.includes(o.id)} onChange={() => toggleSelecionar(o.id)} /></td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-800 text-sm group-hover:text-blue-600 transition-colors">#{prefixo}{o.id}</span>
                                                <span className="text-[10px] font-bold text-slate-400 mt-1">{formatDateTimeBR(o.data_raw || o.created_at)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700">{o.cliente?.nome}</span>
                                                <span className="text-[10px] font-medium text-slate-500">{o.cliente?.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-slate-700">{o.items?.reduce((a, b) => a + safeNum(b.quantidade || b.qtd), 0) || 0} un</td>
                                        <td className="px-6 py-4 text-right font-black text-emerald-600">{formatCurrency(o.total)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border shadow-sm ${statusConfig[o.status]?.cor || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                                {statusConfig[o.status]?.label || o.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 shadow-sm flex items-center justify-center mx-auto transition-colors">
                                                <Icons.Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                )) : (
                                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <td colSpan="7" className="p-16 text-center text-slate-400 font-bold uppercase tracking-widest">Nenhum pedido atende aos filtros atuais.</td>
                                    </motion.tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* FOOTER / PAGINAÇÃO */}
                {pedidosFiltrados.length > 0 && (
                    <footer className="p-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center text-xs font-bold text-slate-500 rounded-b-[32px] shrink-0 gap-4">
                        <span className="sm:ml-4">Mostrando {pedidosPaginados.length} de {pedidosFiltrados.length} pedidos</span>
                        <div className="flex gap-4 items-center sm:pr-2">
                            <span>Página {paginaAtual} de {totalPaginas}</span>
                            <div className="flex gap-1.5">
                                <button onClick={() => setPaginaAtual(p => Math.max(1, p-1))} disabled={paginaAtual===1} className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-50 shadow-sm transition-colors"><Icons.ChevronLeft className="w-4 h-4"/></button>
                                <button onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p+1))} disabled={paginaAtual===totalPaginas} className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-50 shadow-sm transition-colors"><Icons.ChevronRight className="w-4 h-4"/></button>
                            </div>
                        </div>
                    </footer>
                )}
            </div>
        </motion.div>
    );

    // ============================================================================
    // RENDER: DETALHES DO PEDIDO (O GLOW UP DA TELA INTERNA)
    // ============================================================================
    const renderDetail = () => {
        const o = pedidoSelecionado;

        // Endereço Seguro
        const end = o.endereco || {};
        const rua = end.rua || end.street || end.logradouro || '-';
        const num = end.numero || end.num || end.number || '-';
        const bairro = end.bairro || end.neighborhood || '-';
        const cidade = end.cidade || end.city || '-';
        const uf = end.uf || end.estado || end.state || '-';
        const cep = end.cep || end.zip_code || '-';
        const comp = end.complemento || end.complement || '';
        const ref = end.referencia || end.reference || '';

        return (
            <motion.div key="detail" {...tabTransition} className="space-y-6 max-w-7xl mx-auto">
                
                {/* TOPO: VOLTAR E STATUS */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={handleFecharPedido} className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-white hover:border-blue-200 transition-all">
                            <Icons.ChevronLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2 mb-1">
                                Pedido #{prefixo}{o.id} 
                                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border shadow-sm tracking-widest ${statusConfig[o.status]?.cor || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                    {statusConfig[o.status]?.label || o.status}
                                </span>
                            </h2>
                            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest flex items-center gap-1.5">
                                <Icons.Clock className="w-3.5 h-3.5"/> Efetuado em: {formatDateTimeBR(o.data_raw || o.created_at)}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button onClick={() => refetch()} className={`w-12 h-12 bg-white hover:bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 border border-slate-200 transition-all shadow-sm ${isFetching ? 'animate-spin text-blue-500 border-blue-300' : ''}`} title="Atualizar Pedido">
                            <Icons.Refresh className="w-5 h-5" />
                        </button>

                        {o.status === 'A_PAGAR' && (
                            <ProgressButton onClick={() => avancarStatus(o.id, o.status)} loading={loadingAcao === 'avancar'} text="Confirmar Pagamento" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl text-sm shadow-sm transition-colors" />
                        )}
                        {o.status === 'SEPARACAO' && (
                            <ProgressButton onClick={() => avancarStatus(o.id, o.status)} loading={loadingAcao === 'avancar'} text="Avançar p/ Despachado" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl text-sm shadow-sm transition-colors" />
                        )}
                        {o.status === 'DESPACHADO' && (
                            <ProgressButton onClick={() => avancarStatus(o.id, o.status)} loading={loadingAcao === 'avancar'} text="Confirmar Entrega" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl text-sm shadow-sm transition-colors" />
                        )}
                        
                        <div className="relative">
                            <button onClick={() => setPrintMenuOpen(!printMenuOpen)} className="w-12 h-12 bg-white hover:bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 border border-slate-200 transition-colors shadow-sm"><Icons.Printer className="w-5 h-5"/></button>
                            <AnimatePresence>
                                {printMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setPrintMenuOpen(false)}></div>
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 top-14 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-[210]">
                                            <div className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50">Documentos</div>
                                            <div className="p-2 space-y-1"><button onClick={imprimirPickingList} className="w-full text-left px-3 py-3 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-3 transition-colors"><Icons.Box className="w-4 h-4"/> Baixar Picking List</button></div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                <RenderStepper status={o.status} />

                {/* 🟢 GRID PRINCIPAL DE INFORMAÇÕES (2 COLUNAS LG) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* COLUNA ESQUERDA (Resumo, Personalizações, Valores) */}
                    <div className="lg:col-span-2 space-y-6 flex flex-col h-fit">
                        
                        {/* RESUMO DO PEDIDO E PRODUTOS */}
                        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden h-fit">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><Icons.Package className="w-5 h-5 text-blue-500"/> Produtos do Pedido</h3>
                            </div>
                            <div className="p-6 space-y-6">
                                {o.items?.map((item, idx) => {
                                    const hasCustomization = item.personalizacao || item.is_customized || item.custom_text || item.custom_image;
                                    const customText = item.personalizacao?.texto || item.custom_text;
                                    const customImg = item.personalizacao?.imagem || item.custom_image;

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
                                                            {item.estoque !== undefined && <span className="text-[10px] font-black uppercase bg-slate-50 text-slate-500 px-2 py-1 rounded border border-slate-200 tracking-wider flex items-center gap-1"><Icons.Activity className="w-3 h-3"/> Estoque: {item.estoque}</span>}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-black text-emerald-600 text-lg block">{formatCurrency(item.preco * (item.quantidade || item.qtd))}</span>
                                                        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-1 inline-block">Qtd: {item.quantidade || item.qtd} un.</span>
                                                    </div>
                                                </div>

                                                {/* 🟢 DETALHES DE PERSONALIZAÇÃO */}
                                                {hasCustomization && (
                                                    <div className="mt-4 p-4 bg-purple-50/50 border border-purple-100 rounded-xl shadow-sm">
                                                        <p className="text-[10px] font-black text-purple-800 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Icons.Edit3 className="w-3.5 h-3.5 text-purple-500"/> Personalização do Cliente</p>
                                                        <div className="space-y-4">
                                                            {customText && (
                                                                <div>
                                                                    <span className="text-[9px] font-bold text-purple-500 uppercase tracking-wider block mb-1">Texto para Gravação:</span>
                                                                    <p className="text-sm font-medium text-slate-800 italic bg-white p-3 rounded-lg border border-purple-100 shadow-sm">"{customText}"</p>
                                                                </div>
                                                            )}
                                                            {customImg && (
                                                                <button onClick={() => window.open(customImg, '_blank')} className="w-max flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-sm">
                                                                    <Icons.Download className="w-4 h-4" /> Baixar Arte / Imagem Anexada
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* COMPOSIÇÃO DOS VALORES E GATEWAY */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-fit">
                            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col justify-between">
                                <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Gateway de Pagamento</span>
                                    <span className="text-xl font-black text-slate-800 block uppercase mb-5">"{o.pagamento?.gateway || o.payment_gateway || 'N/A'}"</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Pagamento Via</span>
                                    <span className="text-sm font-bold text-slate-700 block uppercase mb-1.5">{o.pagamento_metodo || o.pagamento?.metodo || o.payment_method || 'N/A'}</span>
                                    {(o.pagamento_parcelas > 1 || o.pagamento?.parcelas > 1 || o.payment_installments > 1) ? (
                                        <span className="text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 inline-block mt-1">
                                            {o.pagamento_parcelas || o.pagamento?.parcelas || o.payment_installments}x de {formatCurrency(o.pagamento?.valor_parcela || o.installment_value || (o.total / (o.pagamento_parcelas || o.pagamento?.parcelas || o.payment_installments)))} {safeNum(o.juros || o.pagamento?.juros || o.gateway_fee) > 0 ? `(Com Juros)` : '(Sem Juros)'}
                                        </span>
                                    ) : (
                                        <span className="text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 inline-block mt-1">À vista / Único</span>
                                    )}
                                </div>
                                <div className="mt-6 flex justify-end"><Icons.CreditCard className="w-10 h-10 text-blue-500 opacity-20" /></div>
                            </div>

                            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-5"><Icons.DollarSign className="w-4 h-4 text-emerald-500"/> Composição Financeira</h3>
                                <div className="space-y-3.5 text-xs font-medium text-slate-600 flex-1">
                                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-100"><span>Subtotal Produtos:</span><span className="text-slate-800 font-bold text-sm">{formatCurrency(o.subtotal)}</span></div>
                                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-100"><span>Frete Cobrado:</span><span className="text-slate-800 font-bold text-sm">{formatCurrency(o.frete_valor || o.frete)}</span></div>
                                    
                                    {safeNum(o.desconto_loja || o.desconto) > 0 && (
                                        <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 text-rose-500">
                                            <span className="font-bold uppercase tracking-wider text-[10px]">(-) Desc. Loja/Cupom:</span>
                                            <span className="font-black text-sm">-{formatCurrency(o.desconto_loja || o.desconto)}</span>
                                        </div>
                                    )}
                                    {safeNum(o.desconto_vip_produtos) > 0 && (
                                        <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 text-indigo-500">
                                            <span className="font-bold uppercase tracking-wider text-[10px]">(-) Desc. VIP (Produtos):</span>
                                            <span className="font-black text-sm">-{formatCurrency(o.desconto_vip_produtos)}</span>
                                        </div>
                                    )}
                                    {safeNum(o.desconto_frete) > 0 && (
                                        <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 text-rose-500">
                                            <span className="font-bold uppercase tracking-wider text-[10px]">(-) Desc. Frete:</span>
                                            <span className="font-black text-sm">-{formatCurrency(o.desconto_frete)}</span>
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-between items-center pt-3 mt-auto">
                                        <span className="text-slate-800 font-black uppercase tracking-widest text-xs">Líquido Recebido:</span>
                                        <span className="text-2xl text-emerald-600 font-black">{formatCurrency(o.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* COLUNA DIREITA (Cliente, Endereço, Transportadora, Auditoria) */}
                    <div className="space-y-6">
                        
                        {/* SOBRE O CLIENTE (Padrão CRM Sem Tags e Sem Botão Editar) */}
                        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 sm:p-8">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="font-black text-slate-800 flex items-center gap-2 text-base"><Icons.UserCircle className="w-5 h-5 text-blue-500"/> Sobre o Cliente</h3>
                            </div>
                            
                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-black border border-slate-200 text-xl shadow-sm overflow-hidden">
                                    {o.cliente?.avatar ? <img src={o.cliente.avatar} className="w-full h-full object-cover" alt="Avatar"/> : (o.cliente?.nome?.charAt(0) || 'CL')}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-base leading-tight">{o.cliente?.nome}</h4>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[10px] font-black bg-gradient-to-r from-yellow-100 to-yellow-50 border border-yellow-200 text-yellow-700 uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1.5"><Icons.Crown className="w-3.5 h-3.5"/> {o.cliente?.vip || o.cliente?.rank || 'Iniciante'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-4 text-xs">
                                <div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">WhatsApp / Telefone</span><p className="font-bold text-slate-700 text-sm">{formatPhone(o.cliente?.telefone || o.cliente?.phone)}</p></div>
                                <div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">E-mail de Contato</span><p className="font-bold text-slate-700 text-sm">{o.cliente?.email}</p></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">CPF</span><p className="font-bold text-slate-700 font-mono text-sm">{o.cliente?.cpf}</p></div>
                                    <div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nascimento</span><p className="font-bold text-slate-700 text-sm">{formatDateBR(o.cliente?.nascimento)}</p></div>
                                </div>
                                <div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Gênero / Sexo</span><p className="font-bold text-slate-700 text-sm">{o.cliente?.sexo || 'Não informado'}</p></div>
                            </div>
                        </div>

                        {/* CARD: BENEFÍCIOS MÚLTIPLOS USADOS */}
                        <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Icons.Tag className="w-4 h-4" /> Cupons e Vantagens</h4>
                            <div className="space-y-3">
                                {parseCoupons(o.coupons || o.cupons).length > 0 ? (
                                    parseCoupons(o.coupons || o.cupons).map((cupom, idx) => {
                                        const isVip = cupom.tipo && String(cupom.tipo).toUpperCase().includes('VIP');
                                        const theme = isVip ? 'amber' : 'purple';
                                        const IconTitle = isVip ? Icons.Crown : Icons.Tag;
                                        
                                        return (
                                            <div key={idx} className={`bg-${theme}-50/30 border border-${theme}-100 p-3.5 rounded-xl flex justify-between items-center shadow-sm`}>
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-8 h-8 rounded-full bg-${theme}-100 flex items-center justify-center shrink-0`}><IconTitle className={`w-4 h-4 text-${theme}-600`} /></div>
                                                    <div>
                                                        <strong className={`text-[11px] font-black text-${theme}-900 block`}>{cupom.nome || cupom.codigo || 'Benefício Especial'}</strong>
                                                        <span className={`text-[8px] font-black text-${theme}-600 uppercase tracking-widest block mt-0.5`}>{cupom.tipo || 'CUPOM / BENEFÍCIO'}</span>
                                                    </div>
                                                </div>
                                                <span className="text-[11px] font-black text-emerald-600 bg-white px-2 py-1 rounded-lg shadow-sm border border-emerald-100/60 shrink-0">
                                                    -{formatCurrency(cupom.valor || cupom.desconto)}
                                                </span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="h-[80px] flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-200 border-dashed text-center">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nenhum benefício aplicado</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ENDEREÇO DE ENTREGA E TRANSPORTADORA */}
                        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 sm:p-8">
                            <h3 className="font-black text-slate-800 flex items-center gap-2 mb-5 text-base"><Icons.MapPin className="w-5 h-5 text-rose-500"/> Destinatário & Logística</h3>
                            
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2.5 mb-6 shadow-sm">
                                <div className="flex justify-between items-center border-b border-slate-200/60 pb-2.5"><span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Destinatário:</span> <span className="text-slate-800 font-black text-xs">{o.cliente?.nome}</span></div>
                                <div className="flex justify-between items-center border-b border-slate-200/60 pb-2.5"><span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">CEP:</span> <span className="text-slate-800 font-mono text-sm font-bold">{cep}</span></div>
                                <div className="flex justify-between items-center border-b border-slate-200/60 pb-2.5"><span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Rua/Nº:</span> <span className="text-slate-800 text-xs font-bold text-right truncate max-w-[150px]" title={`${rua}, ${num}`}>{rua}, {num}</span></div>
                                {comp && <div className="flex justify-between items-center border-b border-slate-200/60 pb-2.5"><span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Complemento:</span> <span className="text-slate-800 text-xs font-bold truncate max-w-[150px]">{comp}</span></div>}
                                <div className="flex justify-between items-center border-b border-slate-200/60 pb-2.5"><span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Bairro:</span> <span className="text-slate-800 text-xs font-bold truncate max-w-[150px]">{bairro}</span></div>
                                <div className="flex justify-between items-center border-b border-slate-200/60 pb-2.5"><span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Cidade/UF:</span> <span className="text-slate-800 font-black text-xs">{cidade} - {uf}</span></div>
                                {ref && (
                                    <div className="pt-2"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ponto de Referência:</span><p className="text-[11px] font-medium text-slate-600 italic leading-relaxed">"{ref}"</p></div>
                                )}
                            </div>

                            {/* Transportadora Manual (Gestor) */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Transportadora (Despacho Manual)</label>
                                <div className="flex gap-2">
                                    <input type="text" value={transpManualInput} onChange={(e) => setTranspManualInput(e.target.value)} placeholder="Ex: Correios Sedex" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 shadow-sm transition-all" />
                                    <ProgressButton onClick={salvarTransportadoraManual} loading={loadingAcao === 'salvarTransportadora'} text="Salvar" className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-5 rounded-xl shadow-sm transition-colors" />
                                </div>
                            </div>
                        </div>

                        {/* TRILHA DE AUDITORIA & SEGURANÇA COM FILTRO */}
                        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col h-[500px]">
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                                <div>
                                    <h4 className="text-base font-black text-slate-800 flex items-center gap-2"><Icons.Shield className="w-5 h-5 text-emerald-500"/> Trilha de Auditoria</h4>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Histórico Imutável do Pedido</p>
                                </div>
                                <div className="relative z-50 flex justify-end">
                                    <HoverProgressRoundButton 
                                        text={(timelinePeriodo.start || timelinePeriodo.end) ? 'Filtrado' : 'Filtrar'} 
                                        onClick={() => setIsTimelineModalOpen(!isTimelineModalOpen)} 
                                        icon={Icons.Calendar} 
                                        ariaLabel="Filtrar Período Timeline"
                                        loading={loadingTimeline} 
                                        isActive={isTimelineModalOpen}
                                    />
                                    <DateFilterPopup 
                                        isOpen={isTimelineModalOpen} onClose={() => setIsTimelineModalOpen(false)}
                                        dateRange={timelinePeriodo} setDateRange={setTimelinePeriodo} loading={loadingTimeline}
                                        onClear={() => { setTimelinePeriodo({start:'', end:''}); setIsTimelineModalOpen(false); setTimelinePage(1); }}
                                        onApply={aplicarFiltroTimeline}
                                    />
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-5 relative min-h-0">
                                <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-slate-100 z-0"></div>
                                {timelinePaginada?.map((log, idx) => (
                                    <div key={idx} className="relative z-10 flex gap-4 items-start">
                                        <div className="w-5 h-5 rounded-full bg-emerald-100 border-2 border-white shadow-sm flex items-center justify-center shrink-0 mt-0.5"><Icons.Check className="w-3 h-3 text-emerald-600"/></div>
                                        <div>
                                            <p className="text-[11px] font-bold text-slate-700 leading-relaxed">{log.desc || log.evento}</p>
                                            <span className="text-[9px] font-bold text-slate-400 mt-1 block uppercase tracking-wider">{formatDateTimeBR(log.data_raw || log.data)}</span>
                                        </div>
                                    </div>
                                ))}
                                {(!timelinePaginada || timelinePaginada.length === 0) && (
                                    <p className="text-sm font-medium text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center relative z-10 mt-6">Nenhum evento registrado para este período.</p>
                                )}
                            </div>

                            {/* PAGINAÇÃO DA TIMELINE */}
                            {timelineFiltrada.length > timelinePerPage && (
                                <div className="mt-4 pt-6 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-500 shrink-0">
                                    <span>Pág. {timelinePage} de {totalPaginasTimeline}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => setTimelinePage(p => Math.max(1, p - 1))} disabled={timelinePage === 1} className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-50 transition-colors shadow-sm"><Icons.ChevronLeft className="w-4 h-4"/></button>
                                        <button onClick={() => setTimelinePage(p => Math.min(totalPaginasTimeline, p + 1))} disabled={timelinePage === totalPaginasTimeline} className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-50 transition-colors shadow-sm"><Icons.ChevronRight className="w-4 h-4"/></button>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

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
                                <h3 className="text-xl font-black mb-2 text-rose-600 flex items-center gap-2"><Icons.AlertTriangle className="w-6 h-6"/> Cancelar Pedido</h3>
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

            </motion.div>
        );
    };

    return (
        <ErrorBoundary>
            <div className="w-full min-h-screen pb-20 relative font-sans">
                <Helmet><title>Gestão de Pedidos | HUB ADMIN</title></Helmet>
                <AnimatedNotification show={toast.show} status={toast.status} titulo={toast.message} />
                
                <header className="mb-6 pt-4 px-4 sm:px-8">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Pedidos</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Acompanhe transações, status logístico e fluxo de caixa.</p>
                </header>
                
                <div className="px-4 sm:px-8">
                    <AnimatePresence mode="wait">
                        {pedidoSelecionado ? renderDetail() : renderList()}
                    </AnimatePresence>
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default function AdminOrders() {
    return (
        <QueryClientProvider client={queryClient}>
            <AdminOrdersContent />
        </QueryClientProvider>
    );
}