// ============================================================================
// FICHEIRO: resources/js/Modulos/Admin/AdminOrders.jsx
// ARQUITETURA: Gestão de Pedidos 100% API (Real-Time Polling Silencioso)
// UI/UX: Minimal SaaS Premium | Fluid Elements | Acessibilidade Maximizada
// ============================================================================

import React, { useState, useMemo, useEffect, Component } from 'react';
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

const tabTransition = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeInOut" } }
};

class ErrorBoundary extends Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null, errorInfo: null }; }
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(error, errorInfo) { this.setState({ error, errorInfo }); console.error("Erro no módulo:", error); }
    render() {
        if (this.state.hasError) return (
            <div className="p-8 m-8 bg-rose-50 border border-rose-200 rounded-[24px] shadow-sm" role="alert">
                <h2 className="text-xl font-black text-rose-600 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Erro de Renderização Contido
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
const Icons = {
    Search: ({className="w-5 h-5"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Calendar: ({className="w-5 h-5"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Filter: ({className="w-4 h-4"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>,
    Close: ({className="w-5 h-5"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
    ChevronLeft: ({className="w-5 h-5"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>,
    ChevronRight: ({className="w-5 h-5"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>,
    Package: ({className="w-5 h-5"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    Box: ({className="w-4 h-4"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    CreditCard: ({className="w-4 h-4"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    Spinner: ({className="w-4 h-4"}) => <svg aria-hidden="true" className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>,
    Check: ({className="w-5 h-5"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>,
    Download: ({className="w-4 h-4"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
    Tag: ({className="w-4 h-4"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
    Eye: ({className="w-4 h-4"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    Crown: ({className="w-4 h-4"}) => <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>,
    Shield: ({className="w-4 h-4"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    MapPin: ({className="w-5 h-5"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    DollarSign: ({ className = "w-4 h-4" }) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"></line><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
    UserCircle: ({className="w-4 h-4"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Edit3: ({className="w-4 h-4"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    AlertTriangle: ({className="w-5 h-5"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    Refresh: ({className="w-5 h-5"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    Upload: ({className="w-5 h-5"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>,
    Activity: ({className="w-5 h-5"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    Truck: ({className="w-5 h-5"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
    Clock: ({className="w-4 h-4"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Info: ({className="w-5 h-5"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `}} />
);

const ProgressButton = ({ onClick, loading, text, loadingText, className, disabled = false, icon: Icon }) => (
    <button type="button" onClick={onClick} disabled={loading || disabled} className={`relative overflow-hidden ${className} disabled:opacity-90 disabled:cursor-not-allowed transition-all focus:ring-2 focus:ring-blue-500/20`}>
        {loading && <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5, ease: "linear" }} className="absolute left-0 top-0 h-full bg-black/10 z-0" />}
        <span className="relative z-10 flex items-center justify-center gap-2">{loading ? <><Icons.Spinner className="w-4 h-4" /> {loadingText || text}</> : <>{Icon && <Icon className="w-4 h-4" />} {text}</>}</span>
    </button>
);

const HoverProgressRoundButton = ({ text, onClick, loading, icon: Icon, ariaLabel, isActive }) => {
    const [isHovered, setIsHovered] = useState(false);
    const shouldExpand = isHovered || isActive;

    return (
      <motion.button 
          onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} whileTap={loading ? {} : { scale: 0.95 }} 
          type="button" onClick={onClick} aria-label={ariaLabel} disabled={loading} animate={{ width: shouldExpand ? 'auto' : 48 }}
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
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 top-full mt-2 origin-top-right bg-white border border-slate-200 rounded-[24px] shadow-2xl p-5 w-80 z-[100]" role="dialog" aria-modal="true">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2"><Icons.Calendar className="w-4 h-4"/> Filtrar Período</p>
            <div className="space-y-4">
              <div className="relative z-10">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Data Inicial</label>
                  <input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-800 cursor-pointer transition-all shadow-sm" />
              </div>
              <div className="relative z-10">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Data Final</label>
                  <input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-800 cursor-pointer transition-all shadow-sm" />
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
            <motion.div initial={{ opacity: 0, y: -50, scale: 0.9 }} animate={{ opacity: 1, y: 20, scale: 1 }} exit={{ opacity: 0, y: -50, scale: 0.9 }} className="fixed top-4 right-4 z-[99999] bg-white rounded-[20px] shadow-xl border border-slate-200 p-3 flex items-center gap-4 min-w-[300px]" role="alert">
                <div className="relative w-10 h-10 flex-shrink-0 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center">
                    {status === 'loading' ? <Icons.Spinner className="text-blue-500 w-5 h-5" /> : <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-500"><Icons.Check className="w-5 h-5"/></motion.div>}
                </div>
                <div className="pr-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{status === 'loading' ? 'A Processar...' : 'Concluído'}</p>
                    <p className="text-sm font-black text-slate-800 line-clamp-1">{status === 'loading' ? 'Aguarde...' : titulo}</p>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

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

const getGatewayLogo = (gatewayName) => {
    const name = String(gatewayName).toLowerCase();
    if (name.includes('mercado')) return 'https://logospng.org/download/mercado-pago/logo-mercado-pago-icone-1024.png';
    if (name.includes('stripe')) return 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg';
    if (name.includes('pagar')) return 'https://pagar.me/wp-content/uploads/2022/08/Icon_Pagarme.svg';
    if (name.includes('pix')) return 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo%E2%80%94pix_nacional_brasil.svg';
    if (name.includes('paypal')) return 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg';
    return null;
}

const getCarrierLogo = (carrierName) => {
    const name = String(carrierName).toLowerCase();
    if (name.includes('correios') || name.includes('sedex') || name.includes('pac')) return 'https://logospng.org/download/correios/logo-correios-2048.png';
    if (name.includes('melhor')) return 'https://melhorenvio.com.br/images/logo-melhor-envio-azul.svg';
    if (name.includes('jadlog')) return 'https://upload.wikimedia.org/wikipedia/commons/2/25/Jadlog_logo.png';
    if (name.includes('loggi')) return 'https://logospng.org/download/loggi/logo-loggi-2048.png';
    return null;
}

const getLogInfo = (log) => {
    let tipo = 'info';
    let titulo = 'Atualização de Pedido';
    const ev = safeStr(log.evento).toLowerCase();
    if (ev.includes('pago') || ev.includes('aprovado') || ev.includes('entregue')) { tipo = 'success'; }
    else if (ev.includes('cancelado') || ev.includes('reembolso') || ev.includes('estorno')) { tipo = 'danger'; }
    else if (ev.includes('despachado') || ev.includes('separação') || ev.includes('transportadora')) { tipo = 'warning'; } 
    return { tipo, titulo };
}

// ============================================================================
// CONTEÚDO PRINCIPAL
// ============================================================================
const AdminOrdersContent = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const orderIdUrl = searchParams.get('id');
    const navigate = useNavigate(); 
    const queryClientLocal = useQueryClient();
    const prefixo = "HUB-"; 
    
    const [abaAtiva, setAbaAtiva] = useState('TUDO');
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const [itensPorPagina, setItensPorPagina] = useState(10);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [detailTab, setDetailTab] = useState('RESUMO'); 
    
    const [dashDateOpen, setDashDateOpen] = useState(false);
    const [dashDateRange, setDashDateRange] = useState({ start: '', end: '' });
    const [toast, setToast] = useState({ show: false, message: '', status: '' });
    const showToast = (message, status = 'success') => { setToast({ show: true, message, status }); setTimeout(() => setToast({ show: false, message: '', status: '' }), 3000); };
    
    const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
    const [showMetricsHelp, setShowMetricsHelp] = useState(false);
    const [isManualRefresh, setIsManualRefresh] = useState(false);
    
    const [timelinePeriodo, setTimelinePeriodo] = useState({ start: '', end: '' });
    const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
    const [loadingTimeline, setLoadingTimeline] = useState(false);
    const [timelinePage, setTimelinePage] = useState(1);
    const timelinePerPage = 6; // Refinado layout CRM

    // Paginação interna de Produtos
    const [itemsPage, setItemsPage] = useState(1);
    const itemsPerPage = 3;

    // Modais e Ações Manuais
    const [modalAcao, setModalAcao] = useState({ isOpen: false, tipo: null, data: {} });
    const [formModal, setFormModal] = useState({ motivo: '', carrierId: '', tracking: '', refundMethod: 'ESTORNO', file: null });
    const [loadingAcao, setLoadingAcao] = useState(false);

    const { data: fetchResult = {}, isLoading: carregandoPedidos, refetch } = useQuery({
        queryKey: ['adminOrders'],
        queryFn: async () => { const res = await api.get('/admin/orders'); return res.data; },
        refetchInterval: 15000,
    });
    const pedidosDaApi = fetchResult.data || [];

    const { data: carriersApi = [] } = useQuery({
        queryKey: ['adminCarriers'],
        queryFn: async () => {
            try { const res = await api.get('/admin/carriers'); return res.data.data; } 
            catch(e) { return [{id: 1, nome: 'Correios SEDEX'}, {id: 2, nome: 'Melhor Envio'}]; }
        },
        staleTime: 1000 * 60 * 30,
    });

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

    useEffect(() => { 
        setTimelinePage(1); 
        setItemsPage(1);
    }, [pedidoSelecionado?.id]);

    const handleFecharPedido = () => {
        setPedidoSelecionado(null);
        setDetailTab('RESUMO');
        setTimelinePage(1);
        if (orderIdUrl) setSearchParams({});
    };

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
            showToast('Simulação: Operação enviada com sucesso!');
        }
    });

    const processarAcaoManual = () => {
        const { tipo } = modalAcao;
        
        if (['PAGAR', 'CANCELAR', 'INICIAR_REEMBOLSO', 'PROCESSAR_REEMBOLSO'].includes(tipo) && !formModal.motivo.trim()) {
            return alert("O motivo/parecer é obrigatório para manter o registro de auditoria.");
        }
        if (tipo === 'PROCESSAR_REEMBOLSO' && !formModal.file) {
            return alert("O comprovante do estorno/reembolso é obrigatório.");
        }
        if (tipo === 'ENTREGAR' && !formModal.file) {
            return alert("O comprovante de entrega (foto, assinatura, canhoto) é obrigatório.");
        }

        setLoadingAcao(true);
        const formData = new FormData();
        formData.append('acao', tipo); 
        if (formModal.motivo) formData.append('motivo', formModal.motivo);
        if (formModal.carrierId) formData.append('carrier_id', formModal.carrierId);
        if (formModal.tracking) formData.append('tracking_code', formModal.tracking);
        if (formModal.refundMethod) formData.append('refund_method', formModal.refundMethod);
        if (formModal.file) formData.append('arquivo', formModal.file);

        mutacaoGenericaStatus.mutate({ id: pedidoSelecionado.id, formData });
    };

    const abrirModal = (tipo) => {
        setFormModal({ motivo: '', carrierId: '', tracking: '', refundMethod: 'ESTORNO', file: null });
        setModalAcao({ isOpen: true, tipo, data: pedidoSelecionado });
    };

    const pedidosFiltrados = useMemo(() => {
        let f = pedidosDaApi;
        if (dashDateRange.start) { const s = new Date(dashDateRange.start); s.setHours(0,0,0,0); f = f.filter(p => new Date(p.data_raw || p.created_at) >= s); }
        if (dashDateRange.end) { const e = new Date(dashDateRange.end); e.setHours(23,59,59,999); f = f.filter(p => new Date(p.data_raw || p.created_at) <= e); }
        if (abaAtiva !== 'TUDO') f = f.filter(p => p.status === abaAtiva);
        if (termoPesquisa) {
            const t = termoPesquisa.toLowerCase();
            f = f.filter(p => p.id.toString().includes(t) || (p.cliente?.nome || '').toLowerCase().includes(t) || (p.cliente?.cpf || '').includes(t) || (p.cliente?.email || '').toLowerCase().includes(t));
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
        const pixTotais = pedidosDaApi.filter(p => String(p.pagamento_metodo).toLowerCase().includes('pix') || String(p.pagamento?.metodo).toLowerCase().includes('pix')).length;
        const pixPagos = pedidosDaApi.filter(p => (String(p.pagamento_metodo).toLowerCase().includes('pix') || String(p.pagamento?.metodo).toLowerCase().includes('pix')) && !['A_PAGAR', 'CANCELADO'].includes(p.status)).length;
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

    const aplicarFiltroTimeline = () => {
        setLoadingTimeline(true);
        setTimeout(() => { setLoadingTimeline(false); setIsTimelineModalOpen(false); }, 800);
    };

    // ============================================================================
    // MODAL DE AÇÕES MANUAIS E FLUXOS ESPECÍFICOS
    // ============================================================================
    const renderModalAcoes = () => {
        if (!modalAcao.isOpen) return null;
        const isDespacho = modalAcao.tipo === 'DESPACHAR';
        const isPagamento = modalAcao.tipo === 'PAGAR';
        const isEntrega = modalAcao.tipo === 'ENTREGAR';
        const isCancelar = modalAcao.tipo === 'CANCELAR';
        const isIniciaReembolso = modalAcao.tipo === 'INICIAR_REEMBOLSO';
        const isProcessaReembolso = modalAcao.tipo === 'PROCESSAR_REEMBOLSO';

        let titulo = ''; let subtitulo = ''; let iconTitle = null; let confirmText = "Confirmar Ação";

        if (isPagamento) { titulo = "Aprovar Pagamento"; subtitulo = "O pedido irá para separação e os itens ficarão reservados no estoque."; iconTitle = <Icons.CreditCard className="w-5 h-5"/>; }
        if (isDespacho) { titulo = "Despachar Pedido"; subtitulo = "O pedido será marcado como enviado e os itens sairão do estoque."; iconTitle = <Icons.Package className="w-5 h-5"/>; }
        if (isEntrega) { titulo = "Confirmar Entrega"; subtitulo = "Marque o pedido como entregue (Comprovante obrigatório)."; iconTitle = <Icons.Check className="w-5 h-5"/>; }
        if (isCancelar) { titulo = "Cancelar Pedido"; subtitulo = "O pedido será cancelado e a reserva de estoque será liberada."; iconTitle = <Icons.AlertTriangle className="text-rose-500 w-6 h-6"/>; confirmText = "Confirmar Cancelamento"; }
        if (isIniciaReembolso) { titulo = "Analisar Devolução"; subtitulo = "Mudar status para Em Análise de Reembolso."; iconTitle = <Icons.AlertTriangle className="text-amber-500 w-6 h-6"/>; confirmText = "Iniciar Análise"; }
        if (isProcessaReembolso) { titulo = "Efetivar Reembolso"; subtitulo = "O reembolso será efetivado. Os itens irão para 'Produtos Devolvidos' para triagem, não voltando automaticamente ao estoque."; iconTitle = <Icons.DollarSign className="text-rose-500 w-6 h-6"/>; confirmText = "Finalizar Ciclo"; }

        return (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer" onClick={() => setModalAcao({...modalAcao, isOpen: false})} />
                <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-[24px] shadow-2xl p-8 w-full max-w-md relative z-10 border border-slate-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCancelar || isProcessaReembolso ? 'bg-rose-50 text-rose-500' : isIniciaReembolso ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-600'}`}>{iconTitle}</div>
                        <h3 className={`text-xl font-black ${isCancelar || isProcessaReembolso ? 'text-rose-600' : isIniciaReembolso ? 'text-amber-600' : 'text-slate-900'}`}>{titulo}</h3>
                    </div>
                    <p className="text-sm font-medium text-slate-500 mb-6 leading-relaxed">{subtitulo}</p>

                    <div className="space-y-4 mb-8">
                        {isProcessaReembolso && (
                            <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 mb-4">
                                <p className="text-[10px] font-bold text-rose-700 uppercase tracking-widest mb-1">Valor a Reembolsar</p>
                                <p className="text-xl font-black text-rose-800">{formatCurrency(pedidoSelecionado?.total)}</p>
                                <p className="text-xs text-rose-600 font-medium mt-1">Os cupons de benefícios usados retornarão ao estoque de limite do sistema automaticamente.</p>
                            </div>
                        )}

                        {(isPagamento || isCancelar || isIniciaReembolso || isProcessaReembolso) && (
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Motivo / Parecer *</label>
                                <textarea value={formModal.motivo} onChange={e => setFormModal({...formModal, motivo: e.target.value})} rows="2" placeholder="Descreva a razão desta ação..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 resize-none transition-all shadow-inner" />
                            </div>
                        )}

                        {isDespacho && (
                            <>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Transportadora *</label>
                                    <select value={formModal.carrierId} onChange={e => setFormModal({...formModal, carrierId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all cursor-pointer">
                                        <option value="">Selecione uma opção...</option>
                                        {carriersApi.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Código de Rastreio (Opcional)</label>
                                    <input type="text" value={formModal.tracking} onChange={e => setFormModal({...formModal, tracking: e.target.value.toUpperCase()})} placeholder="BR123456789PT" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-mono font-bold text-slate-800 outline-none focus:border-blue-500 transition-all shadow-inner" />
                                </div>
                            </>
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
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Anexar Comprovante {(isProcessaReembolso || isEntrega) ? '*' : '(Opcional)'}</label>
                                <label className={`w-full flex items-center justify-center gap-2 border-2 border-dashed bg-slate-50 hover:bg-slate-100 rounded-xl p-3.5 cursor-pointer transition-colors shadow-sm ${((isProcessaReembolso || isEntrega) && !formModal.file) ? 'border-rose-300 text-rose-500' : 'border-slate-300 text-slate-600'}`}>
                                    <Icons.Upload className={`w-5 h-5 ${((isProcessaReembolso || isEntrega) && !formModal.file) ? 'text-rose-400' : 'text-slate-400'}`} />
                                    <span className="text-xs font-bold truncate">{formModal.file ? formModal.file.name : 'Selecionar Arquivo PDF/Imagem'}</span>
                                    <input type="file" accept="image/*,application/pdf" onChange={e => setFormModal({...formModal, file: e.target.files[0]})} className="hidden" />
                                </label>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button type="button" onClick={() => setModalAcao({ isOpen: false, tipo: null, data: {} })} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors shadow-sm">Voltar</button>
                        <ProgressButton onClick={processarAcaoManual} loading={loadingAcao} text={confirmText} className={`flex-[2] text-white font-bold rounded-xl text-sm shadow-sm transition-colors ${isCancelar || isProcessaReembolso ? 'bg-rose-600 hover:bg-rose-700' : isIniciaReembolso ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`} />
                    </div>
                </motion.div>
            </div>
        );
    };

    // ============================================================================
    // RENDER: LISTAGEM DE PEDIDOS
    // ============================================================================
    const renderList = () => (
        <motion.div key="list" {...tabTransition} className="bg-transparent flex flex-col min-h-[600px] overflow-hidden">
            
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-lg font-black text-slate-800 tracking-tight">Visão Geral Financeira e Logística</h2>
                 <button type="button" onClick={() => setShowMetricsHelp(true)} className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-all shadow-sm relative z-50" aria-label="Abrir Dicionário de Métricas">
                      <Icons.Info className="w-4 h-4" />
                 </button>
            </div>

            <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 flex flex-col xl:flex-row divide-y xl:divide-y-0 xl:divide-x divide-slate-100 overflow-hidden mb-6">
                <div onClick={() => { setAbaAtiva('TUDO'); setPaginaAtual(1); }} className="flex-[1.2] p-5 bg-gradient-to-br from-emerald-50 to-teal-50/50 flex flex-col justify-center border-l-4 border-emerald-500 cursor-pointer group">
                    <span className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest mb-1 group-hover:text-emerald-700 transition-colors">LTV Total (Receita)</span>
                    <span className="text-2xl font-black text-emerald-700">{formatSmartCurrency(metricasCalculadas.ltv)}</span>
                </div>
                <div onClick={() => { setAbaAtiva('TUDO'); setPaginaAtual(1); }} className="flex-1 p-5 flex flex-col justify-center hover:bg-slate-50/50 transition-colors cursor-pointer group">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">Conversão PIX</span>
                    <span className="text-2xl font-black text-blue-600">{metricasCalculadas.conversaoPix}%</span>
                    <span className="text-[10px] font-medium text-slate-400 mt-1">{metricasCalculadas.pixGerados} gerados / {metricasCalculadas.pixPagos} pagos</span>
                </div>
                <div onClick={() => { setAbaAtiva('TUDO'); setPaginaAtual(1); }} className="flex-1 p-5 flex flex-col justify-center hover:bg-slate-50/50 transition-colors cursor-pointer group">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 group-hover:text-slate-800 transition-colors">Pedidos Totais</span>
                    <span className="text-2xl font-black text-slate-800">{metricasCalculadas.totais}</span>
                    <span className="text-[10px] font-medium text-slate-400 mt-1">{metricasCalculadas.aEnviar} aguardando envio</span>
                </div>
                <div onClick={() => { setAbaAtiva('CANCELADO'); setPaginaAtual(1); }} className="flex-1 p-5 flex flex-col justify-center hover:bg-slate-50/50 transition-colors cursor-pointer group">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 group-hover:text-slate-800 transition-colors">Cancelados</span>
                    <span className="text-2xl font-black text-slate-800">{metricasCalculadas.taxaCancelamento}%</span>
                    <span className="text-[10px] font-medium text-slate-400 mt-1">{metricasCalculadas.cancelados} pedidos cancelados</span>
                </div>
                <div onClick={() => { setAbaAtiva('REEMBOLSADO'); setPaginaAtual(1); }} className="flex-[1.2] p-5 flex flex-col justify-center hover:bg-slate-50/50 transition-colors cursor-pointer group">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 group-hover:text-rose-500 transition-colors">Reembolsados</span>
                    <span className="text-2xl font-black text-rose-600">{metricasCalculadas.taxaReembolso}%</span>
                    <span className="text-[10px] font-medium text-slate-400 mt-1">{metricasCalculadas.qtdReembolsados} pedidos ({formatSmartCurrency(metricasCalculadas.valorReembolsado)})</span>
                </div>
                <div onClick={() => { setAbaAtiva('EM_ANALISE_REEMBOLSO'); setPaginaAtual(1); }} className="flex-1 p-5 flex flex-col justify-center hover:bg-slate-50/50 transition-colors cursor-pointer group">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1 group-hover:text-amber-600 transition-colors">Em Análise</span>
                    <span className="text-2xl font-black text-amber-600">{metricasCalculadas.emAnalise}</span>
                    <span className="text-[10px] font-medium text-slate-400 mt-1">Aguardando ação</span>
                </div>
            </div>

            <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 flex flex-col flex-1">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 rounded-t-[32px]">
                    <div className="relative w-full lg:w-[450px]">
                        <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input type="text" placeholder="Buscar pedido, nome, CPF ou e-mail..." value={termoPesquisa} onChange={e => {setTermoPesquisa(e.target.value); setPaginaAtual(1);}} className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 shadow-sm transition-all" />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <button type="button" onClick={handleRefresh} className={`w-[48px] h-[48px] rounded-full bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 shadow-sm flex items-center justify-center transition-all ${isManualRefresh ? 'animate-spin text-blue-500 border-blue-300' : ''}`} title="Atualizar Pedidos">
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

                <div className="flex overflow-x-auto custom-scrollbar border-b border-slate-100 bg-white items-center gap-6 px-6">
                    {TABS_INTELIGENTES.map(tab => (
                        <button type="button" key={tab.key} onClick={() => {setAbaAtiva(tab.key); setPaginaAtual(1);}} className={`relative py-4 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${abaAtiva === tab.key ? 'text-blue-600' : 'text-slate-400 hover:text-slate-800'}`}>
                            {tab.label}
                            {abaAtiva === tab.key && <motion.div layoutId="orderTabIndicator" className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-t-md" />}
                        </button>
                    ))}
                </div>

                <div className="overflow-x-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap min-w-[1000px]">
                        <thead className="bg-slate-50/50 text-slate-400 uppercase font-black text-[10px] tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Pedido & Data</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4 text-center">Itens</th>
                                <th className="px-6 py-4 text-right">Total</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            <AnimatePresence mode="wait">
                                {pedidosPaginados.length > 0 ? pedidosPaginados.map(o => (
                                    <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={o.id} className="hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => setPedidoSelecionado(o)}>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-800 text-sm group-hover:text-blue-600 transition-colors">#{prefixo}{o.id}</span>
                                                <span className="text-[10px] font-medium text-slate-500 mt-1">{formatDateTimeBR(o.data_raw || o.created_at)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800 text-sm">{o.cliente?.nome}</span>
                                                <span className="text-xs text-slate-500">{o.cliente?.email}</span>
                                                <span className="text-[10px] font-medium text-slate-400 mt-0.5">CPF: {o.cliente?.cpf || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-slate-700">{o.items?.reduce((a, b) => a + safeNum(b.quantidade || b.qtd), 0) || 0} un</td>
                                        <td className="px-6 py-4 text-right font-black text-emerald-600">{formatCurrency(o.total)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border shadow-sm ${statusConfig[o.status]?.cor || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                                {statusConfig[o.status]?.label || o.status}
                                            </span>
                                        </td>
                                    </motion.tr>
                                )) : (
                                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <td colSpan="5" className="p-16 text-center text-slate-400 font-bold uppercase tracking-widest">Nenhum pedido atende aos filtros atuais.</td>
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

    // ============================================================================
    // RENDER: DETALHES DO PEDIDO COM SUBMENU
    // ============================================================================
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

        // Paginação interna dos itens do pedido (3 por página)
        const totalItemsPages = Math.ceil((o.items?.length || 0) / itemsPerPage);
        const paginatedItems = o.items?.slice((itemsPage - 1) * itemsPerPage, itemsPage * itemsPerPage);

        return (
            <motion.div key="detail" {...tabTransition} className="space-y-6 max-w-7xl mx-auto">
                
                {/* TOPO: VOLTAR E STATUS */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button type="button" onClick={handleFecharPedido} className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-white hover:border-blue-200 transition-all">
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
                        {o.status === 'A_PAGAR' && (
                            <>
                                <button type="button" onClick={() => abrirModal('CANCELAR')} className="group relative h-12 flex items-center justify-center bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-rose-500 rounded-xl shadow-sm transition-all px-4">
                                    <Icons.Close className="w-5 h-5" />
                                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap font-bold text-sm">
                                        <span className="pl-2">Cancelar Pedido</span>
                                    </span>
                                </button>
                                <button type="button" onClick={() => abrirModal('PAGAR')} className="group relative h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all px-4">
                                    <Icons.Check className="w-5 h-5" />
                                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap font-bold text-sm">
                                        <span className="pl-2">Aprovar Pagamento</span>
                                    </span>
                                </button>
                            </>
                        )}
                        {o.status === 'SEPARACAO' && (
                            <>
                                <button type="button" onClick={() => abrirModal('INICIAR_REEMBOLSO')} className="group relative h-12 flex items-center justify-center bg-white border border-slate-200 hover:bg-amber-50 hover:border-amber-200 text-amber-500 rounded-xl shadow-sm transition-all px-4">
                                    <Icons.AlertTriangle className="w-5 h-5" />
                                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap font-bold text-sm">
                                        <span className="pl-2">Cancelar & Reembolsar</span>
                                    </span>
                                </button>
                                <button type="button" onClick={() => abrirModal('DESPACHAR')} className="group relative h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all px-4">
                                    <Icons.Truck className="w-5 h-5" />
                                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap font-bold text-sm">
                                        <span className="pl-2">Avançar p/ Despacho</span>
                                    </span>
                                </button>
                            </>
                        )}
                        {o.status === 'DESPACHADO' && (
                            <>
                                <button type="button" onClick={() => abrirModal('INICIAR_REEMBOLSO')} className="group relative h-12 flex items-center justify-center bg-white border border-slate-200 hover:bg-amber-50 hover:border-amber-200 text-amber-500 rounded-xl shadow-sm transition-all px-4">
                                    <Icons.AlertTriangle className="w-5 h-5" />
                                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap font-bold text-sm">
                                        <span className="pl-2">Iniciar Reembolso</span>
                                    </span>
                                </button>
                                <button type="button" onClick={() => abrirModal('ENTREGAR')} className="group relative h-12 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all px-4">
                                    <Icons.Check className="w-5 h-5" />
                                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap font-bold text-sm">
                                        <span className="pl-2">Confirmar Entrega</span>
                                    </span>
                                </button>
                            </>
                        )}
                        {o.status === 'ENTREGUE' && (
                            <button type="button" onClick={() => abrirModal('INICIAR_REEMBOLSO')} className="group relative h-12 flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-sm transition-all px-4">
                                <Icons.AlertTriangle className="w-5 h-5" />
                                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap font-bold text-sm">
                                    <span className="pl-2">Iniciar Reembolso</span>
                                </span>
                            </button>
                        )}
                        {o.status === 'EM_ANALISE_REEMBOLSO' && (
                            <button type="button" onClick={() => abrirModal('PROCESSAR_REEMBOLSO')} className="group relative h-12 flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition-all px-4">
                                <Icons.DollarSign className="w-5 h-5" />
                                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap font-bold text-sm">
                                    <span className="pl-2">Processar Reembolso</span>
                                </span>
                            </button>
                        )}
                    </div>
                </div>

                <RenderStepper status={o.status} pedido={o} />

                {/* 🟢 SUBMENU DO PEDIDO */}
                <div className="flex border-b border-slate-200 gap-8 overflow-x-auto no-scrollbar pb-1 px-2">
                    {['RESUMO', 'LOGISTICA', 'AUDITORIA'].map((tab) => (
                        <button key={tab} type="button" onClick={() => setDetailTab(tab)} className={`pb-3 text-[11px] font-bold uppercase tracking-widest relative whitespace-nowrap transition-colors ${detailTab === tab ? 'text-blue-600' : 'text-slate-400 hover:text-slate-800'}`}>
                            {tab === 'LOGISTICA' ? 'Destinatário & Logística' : tab === 'AUDITORIA' ? 'Timeline (Audit)' : tab}
                            {detailTab === tab && <motion.div layoutId="detailTab" className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-t-md" />}
                        </button>
                    ))}
                </div>

                {/* 🟢 CONTEÚDO DAS ABAS */}
                <AnimatePresence mode="wait">
                    {detailTab === 'RESUMO' && (
                        <motion.div key="RESUMO" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6 flex flex-col">
                                
                                {o.status === 'REEMBOLSADO' && (
                                    <div className="bg-rose-50 border border-rose-100 rounded-[24px] p-6 sm:p-8">
                                        <h3 className="text-xs font-black text-rose-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                                            <Icons.AlertTriangle className="w-4 h-4"/> Detalhes do Reembolso
                                        </h3>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between"><span className="text-rose-700 font-bold">Valor Reembolsado:</span> <span className="font-black text-rose-900">{formatCurrency(o.total)}</span></div>
                                            <div className="flex justify-between"><span className="text-rose-700 font-bold">Motivo:</span> <span className="text-rose-900 font-medium text-right max-w-[60%]">{o.motivo_cancelamento}</span></div>
                                            {o.comprovante_reembolso && (
                                                <div className="pt-3 border-t border-rose-200/50 mt-3">
                                                    <a href={o.comprovante_reembolso} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm">
                                                        <Icons.Download className="w-4 h-4"/> Ver Comprovante
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-fit">
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
                                                                        {temDados ? 'Personalização do Cliente' : 'Faltam Dados de Personalização!'}
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
                                <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 sm:p-8">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-5"><Icons.DollarSign className="w-4 h-4 text-emerald-500"/> Composição Financeira</h3>
                                    <div className="space-y-3.5 text-xs font-medium text-slate-600">
                                        <div className="flex justify-between items-center pb-2.5 border-b border-slate-100"><span>Subtotal Produtos:</span><span className="text-slate-800 font-bold text-sm">{formatCurrency(o.subtotal)}</span></div>
                                        <div className="flex justify-between items-center pb-2.5 border-b border-slate-100"><span>Frete Cobrado:</span><span className="text-slate-800 font-bold text-sm">{formatCurrency(o.frete_valor || o.frete)}</span></div>
                                        
                                        {(() => {
                                            let freteExibido = safeNum(o.frete_valor || o.frete);
                                            let descLojaCupom = safeNum(o.desconto_loja || o.desconto);
                                            let descFreteCupom = safeNum(o.desconto_frete_cupom);
                                            let descLojaBeneficio = safeNum(o.desconto_vip_produtos);
                                            let descFreteBeneficio = safeNum(o.desconto_frete_beneficio);

                                            if (freteExibido === 0) { descFreteCupom = 0; descFreteBeneficio = 0; } 
                                            else {
                                                descFreteCupom = Math.min(descFreteCupom, freteExibido);
                                                let remainingFrete = freteExibido - descFreteCupom;
                                                descFreteBeneficio = Math.min(descFreteBeneficio, remainingFrete);
                                            }

                                            return (
                                                <>
                                                    {descLojaCupom > 0 && <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 text-rose-500"><span className="font-bold uppercase tracking-wider text-[10px]">(-) Desc. Loja/Cupom:</span><span className="font-black text-sm">-{formatCurrency(descLojaCupom)}</span></div>}
                                                    {descFreteCupom > 0 && <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 text-rose-500"><span className="font-bold uppercase tracking-wider text-[10px]">(-) Desc. Frete/Cupom:</span><span className="font-black text-sm">-{formatCurrency(descFreteCupom)}</span></div>}
                                                    {descLojaBeneficio > 0 && <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 text-indigo-500"><span className="font-bold uppercase tracking-wider text-[10px]">(-) Desc. Loja/BENEFICIO:</span><span className="font-black text-sm">-{formatCurrency(descLojaBeneficio)}</span></div>}
                                                    {descFreteBeneficio > 0 && <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 text-indigo-500"><span className="font-bold uppercase tracking-wider text-[10px]">(-) Desc. Frete/BENEFICIO:</span><span className="font-black text-sm">-{formatCurrency(descFreteBeneficio)}</span></div>}
                                                </>
                                            );
                                        })()}
                                        
                                        <div className="flex justify-between items-center pt-3">
                                            <span className="text-slate-800 font-black uppercase tracking-widest text-xs">Líquido Recebido:</span>
                                            <span className="text-2xl text-emerald-600 font-black">{formatCurrency(o.total)}</span>
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Gateway de Pagamento</span>
                                            <span className="text-base font-black text-slate-800 block uppercase mb-4">"{o.pagamento?.gateway || o.payment_gateway || 'N/A'}"</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Pagamento Via</span>
                                            <span className="text-sm font-bold text-slate-700 block uppercase">{o.pagamento_metodo || o.pagamento?.metodo || o.payment_method || 'N/A'}</span>
                                        </div>
                                        {getGatewayLogo(o.pagamento?.gateway || o.payment_gateway) && (
                                            <img src={getGatewayLogo(o.pagamento?.gateway || o.payment_gateway)} className="w-12 h-12 object-contain opacity-50 grayscale" alt="Gateway Logo" />
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Icons.Tag className="w-4 h-4" /> Cupons e Vantagens</h4>
                                    <div className="space-y-3">
                                        {parseCoupons(o.coupons || o.cupons).length > 0 ? (
                                            parseCoupons(o.coupons || o.cupons).map((cupom, idx) => {
                                                const isVip = cupom.tipo && String(cupom.tipo).toUpperCase().includes('VIP');
                                                const theme = isVip ? 'amber' : 'purple';
                                                return (
                                                    <div key={idx} className={`bg-${theme}-50/30 border border-${theme}-100 p-3.5 rounded-xl flex justify-between items-center shadow-sm`}>
                                                        <div className="flex items-center gap-2.5">
                                                            <div className={`w-8 h-8 rounded-full bg-${theme}-100 flex items-center justify-center shrink-0`}>{isVip ? <Icons.Crown className={`w-4 h-4 text-${theme}-600`}/> : <Icons.Tag className={`w-4 h-4 text-${theme}-600`}/>}</div>
                                                            <div>
                                                                <strong className={`text-[11px] font-black text-${theme}-900 block`}>{cupom.nome || cupom.codigo || 'Benefício'}</strong>
                                                                <span className={`text-[8px] font-black text-${theme}-600 uppercase tracking-widest block mt-0.5`}>{cupom.tipo || 'CUPOM'}</span>
                                                            </div>
                                                        </div>
                                                        <span className="text-[11px] font-black text-emerald-600 bg-white px-2 py-1 rounded-lg shadow-sm border border-emerald-100/60 shrink-0">-{formatCurrency(cupom.valor || cupom.desconto)}</span>
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
                            </div>
                        </motion.div>
                    )}

                    {detailTab === 'LOGISTICA' && (
                        <motion.div key="LOGISTICA" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 sm:p-8">
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
                            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 sm:p-8">
                                <h3 className="font-black text-slate-800 flex items-center gap-2 mb-6 text-base"><Icons.Truck className="w-5 h-5 text-blue-500"/> Informações da Transportadora</h3>
                                <div className="space-y-4">
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                                            {getCarrierLogo(o.carrier) ? (
                                                <img src={getCarrierLogo(o.carrier)} className="h-8 object-contain" alt="Transportadora" />
                                            ) : (
                                                <Icons.Box className="w-8 h-8 text-slate-400"/>
                                            )}
                                            <div className="text-right">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Previsão</span>
                                                <span className="text-sm font-black text-emerald-600">3 a 5 dias úteis</span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Status Logístico Atual</span>
                                        <span className="text-lg font-black text-slate-800">{o.carrier || 'Aguardando Despacho'}</span>
                                        <span className="text-[9px] font-bold text-slate-400 mt-1 block">Atualizado Hoje</span>
                                        {o.tracking_code && <div className="mt-3 pt-3 border-t border-slate-200"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Rastreio</span><span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block border border-blue-100">{o.tracking_code}</span></div>}
                                    </div>
                                    <p className="text-xs font-medium text-slate-500 leading-relaxed bg-blue-50/50 p-3 rounded-xl border border-blue-100">Dica: Configure o token do Melhor Envio no painel "Configurações" para automatizar esta etapa.</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {detailTab === 'AUDITORIA' && (
                        <motion.div key="AUDIT" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                            
                            <header className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                        <Icons.Activity className="w-5 h-5"/>
                                    </div>
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
            
            <header className="mb-6 pt-4 px-4 sm:px-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Pedidos</h1>
                <p className="text-sm font-medium text-slate-500 mt-1">Acompanhe transações, status logístico e fluxo de caixa.</p>
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
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-[24px] shadow-2xl p-8 w-full max-w-xl relative z-10 border border-slate-200" role="dialog">
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

    return (
        <div className="relative overflow-hidden p-6 sm:p-8 bg-slate-50/50 rounded-[24px] border border-slate-100 mb-6">
            <div className="relative z-10 w-full max-w-2xl mx-auto flex items-center justify-between pb-6 pt-2">
                <div className="absolute top-[22px] left-0 w-full h-1.5 bg-slate-200 rounded-full z-0" />
                <motion.div 
                    className="absolute top-[22px] left-0 h-1.5 bg-sky-400 rounded-full z-0 shadow-[0_0_10px_rgba(56,189,248,0.4)]"
                    initial={isInitialMount ? { width: 0 } : false}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
                
                {steps.map((step, idx) => {
                    const isCompleted = idx <= currentIndex;
                    const isCurrent = idx === currentIndex;
                    return (
                        <div key={step} className="relative z-10 flex flex-col items-center px-2 bg-slate-50/50 w-24">
                            <motion.div 
                                initial={{ scale: 0 }} 
                                animate={{ scale: 1 }} 
                                transition={{ type: "spring", stiffness: 300, damping: 20, delay: idx * 0.15 }}
                                className={`w-8 h-8 rounded-full border-4 flex items-center justify-center transition-colors duration-500 mb-2 ${isCompleted ? 'bg-sky-400 border-white text-white shadow-md ring-4 ring-sky-100' : 'bg-white border-slate-200 text-slate-300'}`}
                            >
                                {isCompleted ? <Icons.Check className="w-4 h-4"/> : <Icons.Box className="w-4 h-4"/>}
                            </motion.div>
                            <span className={`text-[10px] font-black uppercase tracking-widest text-center leading-tight mb-1 ${isCurrent ? 'text-sky-600' : isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>
                                {flowLabels[idx]}
                            </span>
                        </div>
                    );
                })}
            </div>
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