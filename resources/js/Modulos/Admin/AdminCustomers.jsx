// ============================================================================
// FICHEIRO: resources/js/Modulos/Admin/AdminCustomers.jsx
// ARQUITETURA: CRM Inteligente Modularizado (Dashboard, In-Page Profile)
// STATUS: 100% Blindado | Acessibilidade (a11y) | Preparado para API Backend
// UI/UX: Premium Minimal SaaS | Soft Light | Customer 360 View | Netflix Cards
// ============================================================================

import React, { useState, useMemo, useRef, useEffect, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import api from '../../api';
import AdminPerfilCRM from './AdminPerfilCRM';

// Instância global do React Query (Mantém os dados em cache)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, 
      staleTime: 1000 * 60 * 5, // Cache dura 5 minutos
    },
  },
});

// ==========================================
// 1. DICIONÁRIO COMPLETO DE ÍCONES (a11y)
// ==========================================
const Icons = {
    Search: ({className="w-4 h-4"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Calendar: ({className="w-4 h-4"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    EyeOpen: ({className="w-5 h-5"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    EyeOff: ({className="w-5 h-5"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>,
    Filter: ({className="w-4 h-4"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>,
    Eye: ({className="w-4 h-4"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    Close: ({className="w-5 h-5"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
    ChevronLeft: ({className="w-5 h-5"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>,
    ChevronRight: ({className="w-5 h-5"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>,
    Package: ({className="w-5 h-5"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    Box: ({className="w-4 h-4"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    Trophy: ({className="w-5 h-5"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
    UsersIcon: ({className="w-5 h-5"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    UserCircle: ({className="w-4 h-4"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    WhatsApp: ({className="w-4 h-4"}) => <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
    AlertTriangle: ({className="w-5 h-5"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    MapPin: ({className="w-5 h-5"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Activity: ({className="w-5 h-5"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    TrendingUp: ({className="w-5 h-5"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    TrendingDown: ({className="w-5 h-5"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" /></svg>,
    CreditCard: ({className="w-4 h-4"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    Info: ({className="w-5 h-5"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    SettingsIcon: ({className="w-6 h-6 text-slate-400"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Spinner: ({className="w-4 h-4"}) => <svg aria-hidden="true" className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>,
    Star: ({className="w-5 h-5"}) => <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
    Check: ({className="w-5 h-5"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>,
    Coin: ({className="w-4 h-4"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08-.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Tag: ({className="w-4 h-4"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
    FileText: ({className="w-4 h-4"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    Edit3: ({className="w-4 h-4"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    Trash: ({className="w-4 h-4"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    Plus: ({className="w-4 h-4"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
    Upload: ({className="w-4 h-4"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>,
    HelpCircle: ({className="w-5 h-5"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093V14m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Repeat: ({className="w-5 h-5"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    Mail: ({className="w-4 h-4"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    Key: ({className="w-4 h-4"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>,
    Download: ({className="w-4 h-4"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
    Crown: ({className="w-4 h-4"}) => <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>,
    Refresh: ({className="w-5 h-5"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
};

// ==========================================
// 2. ERROR BOUNDARY
// ==========================================
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) {
    this.setState({ error: error, errorInfo: errorInfo });
    console.error("Erro no CRM interceptado:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 m-8 bg-rose-50 border border-rose-200 rounded-3xl shadow-sm" role="alert">
          <h2 className="text-xl font-black text-rose-600 mb-4 flex items-center gap-2">
            <Icons.AlertTriangle className="w-6 h-6" /> Erro de Renderização Contido
          </h2>
          <p className="text-slate-700 mb-4 text-sm font-medium leading-relaxed">
            Ocorreu uma falha ao tentar processar esta tela. O sistema blindou a aplicação para evitar o bloqueio total.
          </p>
          <div className="bg-white p-4 rounded-xl border border-rose-100 overflow-auto text-[10px] font-mono text-slate-800 shadow-inner max-h-48 mb-4">
            <p className="font-bold text-rose-500 mb-2">{this.state.error && this.state.error.toString()}</p>
            <p className="whitespace-pre-wrap text-slate-500">{this.state.errorInfo && this.state.errorInfo.componentStack}</p>
          </div>
          <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition-colors shadow-sm">Recarregar Página</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ==========================================
// 3. UTILS E FORMATAÇÃO GLOBAIS
// ==========================================
const GlobalStyles = () => (
  <style dangerouslySetInnerHTML={{__html: `
      .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      input[type="number"]::-webkit-inner-spin-button, input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      input[type="number"] { -moz-appearance: textfield; }
  `}} />
);

const safeNum = (val) => { const n = Number(val); return isNaN(n) ? 0 : n; };
const safeStr = (val) => { if (val === null || val === undefined) return ''; return String(val); };
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
const parseCommaFloat = (val) => {
    if (val === null || val === undefined || val === '') return 0;
    const str = String(val).replace(',', '.');
    const n = parseFloat(str);
    return isNaN(n) ? 0 : n;
};
const formatCommaFloat = (val) => {
    if (val === null || val === undefined) return '0';
    return String(val).replace('.', ',');
};
const formatSmartCurrency = (value, forceFull = false) => {
  const num = safeNum(value);
  if (forceFull) return `R$ ${num.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  if (num >= 1000000000) return `R$ ${(num / 1000000000).toFixed(2).replace('.', ',')}B`;
  if (num >= 1000000) return `R$ ${(num / 1000000).toFixed(2).replace('.', ',')}M`;
  if (num >= 1000) return `R$ ${(num / 1000).toFixed(1).replace('.', ',')}k`;
  return `R$ ${num.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
};
const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safeNum(value));

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

// ==========================================
// 4. COMPONENTES UI COMPARTILHADOS
// ==========================================
const AnimatedToggle = ({ label, active, onChange, activeColor = "#3B82F6", hintText }) => {
    return (
        <div className="flex justify-between items-center bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-sm transition-all hover:border-blue-300">
            <div className="flex flex-col pr-4">
              <span className="text-sm font-bold text-slate-800 leading-tight">{label}</span>
              {hintText && <span className="text-[10px] text-slate-500 font-medium mt-1.5 leading-relaxed">{hintText}</span>}
            </div>
            <button type="button" aria-pressed={active} aria-label={label} onClick={() => onChange(!active)} className="relative w-11 h-11 flex items-center justify-center rounded-full outline-none flex-shrink-0 bg-white border border-slate-200 shadow-sm overflow-hidden transition-all focus:ring-2 focus:ring-blue-500/20">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r="20" fill="none" stroke="transparent" strokeWidth="2" />
                    <motion.circle cx="22" cy="22" r="20" fill="none" stroke={active ? activeColor : "transparent"} strokeWidth="4" initial={{ pathLength: 0 }} animate={{ pathLength: active ? 1 : 0 }} transition={{ duration: 0.4 }} />
                </svg>
                <AnimatePresence mode="wait">
                    {active ? <motion.div key="1" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-white z-10" style={{ color: activeColor }}><Icons.Check className="w-5 h-5" /></motion.div>
                            : <motion.div key="0" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="w-3 h-3 rounded-full bg-slate-300 z-10" />}
                </AnimatePresence>
            </button>
        </div>
    );
};

const FadeIn = React.forwardRef(({ children, className = "", ...props }, ref) => (
  <motion.div ref={ref} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3, ease: "easeOut" }} className={className} {...props}>
      {children}
  </motion.div>
));
FadeIn.displayName = 'FadeIn';

const HoverProgressRoundButton = ({ text, onClick, loading, icon: Icon, ariaLabel }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
      <motion.button 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileTap={loading ? {} : { scale: 0.95 }} 
          onClick={onClick} 
          aria-label={ariaLabel}
          disabled={loading}
          animate={{ width: isHovered ? 'auto' : 48 }}
          className={`relative overflow-hidden h-12 rounded-full bg-white border border-slate-200 shadow-sm flex items-center pl-[14px] pr-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-80 transition-colors ${isHovered ? 'hover:border-blue-300 hover:bg-slate-50' : ''}`}
      >
          {loading && (
             <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 48 48">
                 <motion.circle cx="24" cy="24" r="22" fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="138" initial={{ strokeDashoffset: 138 }} animate={{ strokeDashoffset: 0 }} transition={{ duration: 1.5, ease: "linear" }} />
             </svg>
          )}
          <div className="relative z-10 flex items-center gap-2 whitespace-nowrap">
              {loading ? <Icons.Spinner className="w-5 h-5 text-blue-500 shrink-0" /> : <Icon className="w-5 h-5 text-slate-500 group-hover:text-blue-600 shrink-0 transition-colors" />}
              <AnimatePresence>
                  {isHovered && !loading && (
                      <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="text-xs font-bold text-slate-700 truncate pr-2">
                          {text}
                      </motion.span>
                  )}
              </AnimatePresence>
          </div>
      </motion.button>
    );
};

const ProgressButton = ({ onClick, loading, text, loadingText, className, disabled, icon: Icon, ariaLabel }) => (
    <button type="button" onClick={onClick} disabled={loading || disabled} aria-label={ariaLabel || text} className={`relative overflow-hidden ${className} disabled:opacity-90 disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20`}>
        {loading && <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5, ease: "linear" }} className="absolute left-0 top-0 h-full bg-black/10 z-0" />}
        <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? <><Icons.Spinner className="w-4 h-4" /> {loadingText}</> : <>{Icon && <Icon className="w-4 h-4" />} {text}</>}
        </span>
    </button>
);

const DateFilterPopup = ({ dateRange, setDateRange, onApply, onClear, loading, isOpen, onClose }) => {
  const ref = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) { if (ref.current && !ref.current.contains(event.target)) onClose(); }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} ref={ref} className="absolute right-0 mt-2 bg-white border border-slate-200 rounded-3xl shadow-2xl p-5 w-80 z-[100]" role="dialog" aria-modal="true" aria-label="Filtrar Período">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2"><Icons.Filter className="w-4 h-4"/> Filtrar Período</p>
          <div className="space-y-4">
            <div><label className="block text-xs font-bold text-slate-700 mb-1.5">Data Inicial</label><input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-800 transition-all" /></div>
            <div><label className="block text-xs font-bold text-slate-700 mb-1.5">Data Final</label><input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-800 transition-all" /></div>
            <div className="pt-2 flex gap-2">
              <button type="button" onClick={onClear} className="w-1/3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm py-2.5 rounded-xl border border-slate-200 shadow-sm transition-colors">Limpar</button>
              <button type="button" onClick={onApply} disabled={loading} className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 rounded-xl shadow-sm transition-colors">{loading ? 'Aplicando...' : 'Aplicar Filtro'}</button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const AnimatedNotification = ({ show, status, titulo }) => (
  <AnimatePresence>
      {show && (
          <motion.div initial={{ opacity: 0, y: -50, scale: 0.9 }} animate={{ opacity: 1, y: 20, scale: 1 }} exit={{ opacity: 0, y: -50, scale: 0.9 }} className="fixed top-4 right-4 z-[99999] bg-white rounded-2xl shadow-xl border border-slate-200 p-3 flex items-center gap-4 min-w-[300px]" role="alert">
              <div className="relative w-10 h-10 flex-shrink-0 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center">
                  {status === 'loading' ? <Icons.Spinner className="w-5 h-5 text-blue-500" /> : <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-500"><Icons.Check className="w-5 h-5"/></motion.div>}
              </div>
              <div className="pr-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{status === 'loading' ? 'A Processar...' : 'Concluído'}</p>
                  <p className="text-sm font-black text-slate-800 line-clamp-1">{status === 'loading' ? 'Aguarde um momento...' : titulo}</p>
              </div>
          </motion.div>
      )}
  </AnimatePresence>
);

// ============================================================================
// 5. COMPONENTE PRINCIPAL (AdminCustomersContent)
// ============================================================================
const AdminCustomersContent = ({ mainTab, setMainTab }) => {
  const queryClientLocal = useQueryClient(); // Para invalidar dados pós-mutação

  // ============================================================================
  // 🟢 FUNÇÕES DE NAVEGAÇÃO DA URL (Sync de Cliente e CRM)
  // ============================================================================
  const [searchParams, setSearchParams] = useSearchParams();

  // ==========================================
  // 5.1. ESTADOS GLOBAIS E DE UI
  // ==========================================
  const [savingState, setSavingState] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [showRevenue, setShowRevenue] = useState(false);
  const [showMetricsHelp, setShowMetricsHelp] = useState(false);
  const [showConfigHelp, setShowConfigHelp] = useState(false);

  // Filtros Globais Dashboard
  const [dashDateOpen, setDashDateOpen] = useState(false);
  const [dashDateRange, setDashDateRange] = useState({ start: '', end: '' });
  const [dashFilterText, setDashFilterText] = useState('Todo o Período');
  
  // Filtros Ranking VIP
  const [rankDateOpen, setRankDateOpen] = useState(false);
  const [rankDateRange, setRankDateRange] = useState({ start: '', end: '' });
  const [topClientsCount, setTopClientsCount] = useState(5);
  const [maxLTVFiltro, setMaxLTVFiltro] = useState(''); 
  const [qtdProdutosFiltro, setQtdProdutosFiltro] = useState('');
  
  // Filtros Recentes
  const [recentDateOpen, setRecentDateOpen] = useState(false);
  const [recentDateRange, setRecentDateRange] = useState({ start: '', end: '' });
  const [ultimasMaxCompra, setUltimasMaxCompra] = useState('');
  const [ultimasQtdProd, setUltimasQtdProd] = useState('');

  // Filtros Listagem Principal
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatusCRM, setFiltroStatusCRM] = useState('TODOS');
  const [filtroMesAniv, setFiltroMesAniv] = useState('TODOS');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); 
  const [registrosPage, setRegistrosPage] = useState(1);
  const [registrosPerPage, setRegistrosPerPage] = useState(10);
  
  // Estados Dinâmicos VIP e Configs
  const defaultVIP = { id: 0, nome: '', gastoRequisito: "0", comprasRequisito: 0, multCoins: "1,0", descFrete: "0", descProdutos: "0", imagem: null, frequenciaUso: 'ILIMITADO', limiteUso: 0, acumulaFrete: false, isDefault: false };
  const [modalVIP, setModalVIP] = useState({ isOpen: false, isNovo: true, data: defaultVIP });
  const [config, setConfig] = useState({ permiteCadastro: true, aprovarComentarios: false, bloquearForaDoPais: false, loginApenasConvite: false });
  const [customRankImages, setCustomRankImages] = useState({});

  // ==========================================
  // 5.2. ESTADOS DO IN-PAGE CRM (Visão 360º)
  // ==========================================
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  // ==========================================
  // 5.3. FETCH DE DADOS (USEQUERY)
  // ==========================================
  const { data: listaClientesDaApi = [], isLoading: carregandoClientes, isFetching: isFetchingClients, refetch: refetchClients } = useQuery({
      queryKey: ['clientesCRM'], 
      queryFn: async () => {
          const response = await api.get('/admin/customers');
          return response.data.data; 
      },
      refetchInterval: 15000, 
  });

  const { data: metricasReais } = useQuery({
      queryKey: ['dashboardMetrics'],
      queryFn: async () => {
          const res = await api.get('/admin/customers/metrics');
          return res.data;
      }
  });

  const { data: niveisVIPDaApi = [] } = useQuery({
      queryKey: ['vipLevels'],
      queryFn: async () => {
          const res = await api.get('/admin/customers/vip-levels');
          return res.data.data;
      }
  });

  const { data: configDaApi } = useQuery({
      queryKey: ['crmSettings'],
      queryFn: async () => {
          const res = await api.get('/admin/customers/settings');
          return res.data.data;
      }
  });

  // ==========================================
  // 5.4. EFEITOS DE SINCRONIZAÇÃO E CRONÔMETROS
  // ==========================================
  useEffect(() => {
      if (clienteSelecionado && listaClientesDaApi.length > 0) {
          const clienteAtualizado = listaClientesDaApi.find(c => c.id === clienteSelecionado.id);
          if (clienteAtualizado && JSON.stringify(clienteAtualizado) !== JSON.stringify(clienteSelecionado)) {
              setClienteSelecionado(clienteAtualizado);
          }
      }
  }, [listaClientesDaApi]);

  useEffect(() => {
      if (configDaApi) {
          setConfig({
              permiteCadastro: Boolean(configDaApi.permite_cadastro),
              loginApenasConvite: Boolean(configDaApi.login_apenas_convite),
              aprovarComentarios: Boolean(configDaApi.aprovar_comentarios),
              bloquearForaDoPais: Boolean(configDaApi.bloquear_fora_do_pais)
          });
      }
  }, [configDaApi]);

  // ==========================================
  // 5.5. HELPERS DE AÇÃO E NOTIFICAÇÃO
  // ==========================================
  const showToast = (message, status = 'success') => {
      setToast({ show: true, message, status });
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  const triggerAcao = (actionId, successMessage) => {
    if (savingState) return;
    setSavingState(actionId);
    setTimeout(() => {
      setSavingState(null);
      if (successMessage) showToast(successMessage, 'success');
    }, 1200); 
  };

  // ==========================================
  // 5.6. INTEGRAÇÃO BACKEND: MUTAÇÕES (useMutation)
  // ==========================================
  const mutacaoSalvarVip = useMutation({
      mutationFn: async (payload) => {
          const formData = new FormData();
          if (payload.id) formData.append('id', payload.id);
          formData.append('nome', payload.nome);
          formData.append('is_default', payload.is_default ? 1 : 0);
          formData.append('gasto_requisito', payload.gasto_requisito);
          formData.append('compras_requisito', payload.compras_requisito);
          formData.append('mult_coins', payload.mult_coins);
          formData.append('desc_frete', payload.desc_frete);
          formData.append('desc_produtos', payload.desc_produtos);
          formData.append('acumula_frete', payload.acumula_frete ? 1 : 0);
          formData.append('frequencia_uso', payload.frequencia_uso);
          formData.append('limite_uso', payload.limite_uso);
          if (payload.imagemFile) formData.append('imagem', payload.imagemFile);

          return await api.post('/admin/customers/vip-levels', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
      },
      onSuccess: () => {
          queryClientLocal.invalidateQueries({ queryKey: ['vipLevels'] }); 
          showToast('Nível VIP salvo com sucesso!');
          setModalVIP({ isOpen: false, isNovo: true, data: defaultVIP, imagemFile: null });
      },
      onError: (error) => alert('Erro ao salvar VIP: ' + (error.response?.data?.message || error.message))
  });

  const mutacaoExcluirVip = useMutation({
      mutationFn: async (id) => await api.delete(`/admin/customers/vip-levels/${id}`),
      onSuccess: () => {
          queryClientLocal.invalidateQueries({ queryKey: ['vipLevels'] });
          showToast('Nível VIP excluído com sucesso!');
      },
      onError: (error) => alert('Erro ao excluir VIP: ' + (error.response?.data?.message || error.message))
  });

  const mutacaoSalvarConfig = useMutation({
      mutationFn: async (payload) => await api.put('/admin/customers/settings', payload),
      onSuccess: () => {
          queryClientLocal.invalidateQueries({ queryKey: ['crmSettings'] }); 
          showToast('Configurações do CRM atualizadas!');
      },
      onError: (error) => alert('Erro ao salvar configurações: ' + (error.response?.data?.message || error.message))
  });

  // ==========================================
  // 5.7. FUNÇÕES DE AÇÃO E FLUXOS
  // ==========================================
  const handleSearchChange = (e) => { setSearchTerm(e.target.value); setCurrentPage(1); };

  // 🟢 NAVEGAÇÃO DE ABERTURA E FECHAMENTO DO CRM SINCRONIZADA COM A URL
  const abrirPerfilCliente = (cliente) => {
      setClienteSelecionado(cliente);
      
      const newParams = new URLSearchParams(searchParams);
      newParams.set('maintab', 'CLIENTES (CRM)');
      newParams.set('id', cliente.id);
      setSearchParams(newParams);

      if (typeof window !== 'undefined') { window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };

  const fecharPerfilCliente = () => {
      setClienteSelecionado(null);
      
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('id');
      newParams.delete('tab'); 
      setSearchParams(newParams);
  };

  const isDateInRange = (dateStr, range) => {
      if (!range.start || !range.end || !dateStr || dateStr === '-') return true;
      const d = new Date(dateStr).getTime();
      const s = new Date(range.start).getTime();
      const e = new Date(range.end).getTime() + 86399999; 
      return d >= s && d <= e;
  };

  const salvarVIPReal = () => {
      const data = modalVIP.data;
      if (!data.nome.trim()) return alert("O nome do nível é obrigatório.");

      const payload = {
          id: modalVIP.isNovo ? null : data.id,
          nome: data.nome,
          is_default: data.isDefault,
          gasto_requisito: parseCommaFloat(data.gastoRequisito),
          compras_requisito: safeNum(data.comprasRequisito),
          mult_coins: parseCommaFloat(data.multCoins),
          desc_frete: parseCommaFloat(data.descFrete),
          desc_produtos: parseCommaFloat(data.descProdutos),
          acumula_frete: data.acumulaFrete,
          frequencia_uso: data.frequenciaUso,
          limite_uso: safeNum(data.limiteUso),
          imagemFile: modalVIP.imagemFile
      };

      setSavingState('saveVip');
      mutacaoSalvarVip.mutate(payload, { onSettled: () => setSavingState(null) });
  };

  const excluirVIPReal = (id) => {
      if (window.confirm("Deseja realmente excluir este nível?")) mutacaoExcluirVip.mutate(id);
  };

  const salvarConfiguracoesReais = () => {
      const payload = {
          permite_cadastro: config.permiteCadastro,
          login_apenas_convite: config.loginApenasConvite,
          aprovar_comentarios: config.aprovarComentarios,
          bloquear_fora_do_pais: config.bloquearForaDoPais
      };
      setSavingState('saveConfig');
      mutacaoSalvarConfig.mutate(payload, { onSettled: () => setSavingState(null) });
  };

  const abrirNovoVIP = () => setModalVIP({ isOpen: true, isNovo: true, data: { ...defaultVIP, id: Date.now() } });
  const editarVIP = (nivel) => setModalVIP({ isOpen: true, isNovo: false, data: { ...nivel } });
  const fecharModalVIP = () => setModalVIP({ isOpen: false, isNovo: true, data: defaultVIP });
  const handleVIPImageUpload = (e) => {
      const file = e.target.files[0];
      if(file) setModalVIP(prev => ({ ...prev, imagemFile: file, data: { ...prev.data, imagem: URL.createObjectURL(file) } }));
  };

  // ==========================================
  // 5.8. CÁLCULOS E FILTRAGENS (USEMEMO)
  // ==========================================
  const niveisVIPConvertidos = useMemo(() => {
      if (!niveisVIPDaApi) return [];
      return niveisVIPDaApi.map(nivel => ({
          id: nivel.id,
          nome: nivel.nome,
          isDefault: Boolean(nivel.is_default),
          gastoRequisito: formatCommaFloat(nivel.gasto_requisito),
          comprasRequisito: nivel.compras_requisito,
          multCoins: formatCommaFloat(nivel.mult_coins),
          descFrete: formatCommaFloat(nivel.desc_frete),
          descProdutos: formatCommaFloat(nivel.desc_produtos),
          acumulaFrete: Boolean(nivel.acumula_frete),
          frequenciaUso: nivel.frequencia_uso,
          limiteUso: nivel.limite_uso,
          imagem: nivel.imagem
      }));
  }, [niveisVIPDaApi]);

  const clientesFiltrados = useMemo(() => {
    return listaClientesDaApi.filter(c => {
      const matchBusca = safeStr(c?.nome).toLowerCase().includes(safeStr(searchTerm).toLowerCase()) || 
                         safeStr(c?.email).toLowerCase().includes(safeStr(searchTerm).toLowerCase()) ||
                         safeStr(c?.cpf).includes(safeStr(searchTerm)) || 
                         safeStr(c?.telefone).includes(safeStr(searchTerm));
      const matchStatus = filtroStatusCRM === 'TODOS' || safeStr(c?.status) === filtroStatusCRM;
      
      let matchAniversario = true;
      if (filtroMesAniv !== 'TODOS') {
          if (c.nascimento && c.nascimento !== '-') {
              const mesCliente = c.nascimento.split('-')[1]; 
              matchAniversario = (mesCliente === filtroMesAniv);
          } else {
              matchAniversario = false;
          }
      }
      return matchBusca && matchStatus && matchAniversario;
    });
  }, [listaClientesDaApi, searchTerm, filtroStatusCRM, filtroMesAniv]);

  const totalPages = Math.ceil((clientesFiltrados?.length || 0) / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const clientesPaginados = (clientesFiltrados || []).slice(indexOfFirstItem, indexOfLastItem);

  const ultimasComprasListFiltrada = useMemo(() => {
    return listaClientesDaApi
      .filter(c => safeNum(c?.compras) > 0 && safeNum(c?.ultimaCompraValor) >= 1) 
      .filter(c => ultimasMaxCompra === '' ? true : safeNum(c?.ultimaCompraValor) <= safeNum(ultimasMaxCompra))
      .filter(c => ultimasQtdProd === '' ? true : safeNum(c?.produtosComprados) <= safeNum(ultimasQtdProd))
      .filter(c => isDateInRange(c.ultimaCompra, recentDateRange))
      .sort((a, b) => new Date(safeStr(b?.ultimaCompra)).getTime() - new Date(safeStr(a?.ultimaCompra)).getTime() || safeNum(b?.id) - safeNum(a?.id));
  }, [listaClientesDaApi, ultimasMaxCompra, ultimasQtdProd, recentDateRange]);

  const totalRegistrosPages = Math.ceil((ultimasComprasListFiltrada?.length || 0) / registrosPerPage) || 1;
  const registrosPaginados = (ultimasComprasListFiltrada || []).slice((registrosPage - 1) * registrosPerPage, registrosPage * registrosPerPage);

  const ltvMedioCRM = listaClientesDaApi.length > 0 ? (listaClientesDaApi.reduce((acc, c) => acc + safeNum(c?.ltv), 0) / listaClientesDaApi.length) : 0;
  const comprasTotaisCRM = listaClientesDaApi.reduce((acc, c) => acc + safeNum(c?.compras), 0);

  // ==========================================
  // 5.9. RENDERIZADORES DE TABELAS (HELPERS UI)
  // ==========================================
  const getAvatarInitials = (nome) => {
    if (!nome || typeof nome !== 'string') return 'N';
    const split = nome.trim().split(' ');
    if (split.length > 1 && split[1].length > 0) return (safeStr(split[0]).charAt(0) + safeStr(split[1]).charAt(0)).toUpperCase();
    return safeStr(nome).substring(0, 2).toUpperCase();
  };

  const getStatusClienteBadge = (status) => {
    if (status === 'ATIVO') return <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-bold uppercase rounded-lg shadow-sm">ATIVO</span>;
    if (status === 'INATIVO') return <span className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-bold uppercase rounded-lg shadow-sm">BLOQUEADA</span>;
    if (status === 'AFILIADO') return <span className="px-2.5 py-1 bg-purple-50 border border-purple-200 text-purple-600 text-[10px] font-bold uppercase rounded-lg shadow-sm">AFILIADO</span>;
    return <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-bold uppercase rounded-lg shadow-sm">{safeStr(status) || 'ND'}</span>;
  };

  const getRankIndicator = (rankNome) => {
      const rank = niveisVIPDaApi.find(n => safeStr(n.nome).toLowerCase() === safeStr(rankNome).toLowerCase());
      if (rank && rank.imagem) {
          return (
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 w-max shadow-sm">
                <img src={rank.imagem} alt={rank.nome} className="w-3.5 h-3.5 rounded-full object-cover" />
                {rank.nome}
            </span>
          );
      }
      return (
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 w-max shadow-sm">
            <Icons.Star className="w-3.5 h-3.5 text-yellow-500" />
            {safeStr(rankNome) || 'Sem Rank'}
        </span>
      );
  };

  const renderClienteCell = (c) => (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-500 border border-slate-200 shrink-0 shadow-sm overflow-hidden">
          {c?.avatar ? (
              <img src={c.avatar} alt={safeStr(c?.nome)} className="w-full h-full object-cover" />
          ) : (
              getAvatarInitials(c?.nome)
          )}
      </div>
      <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{safeStr(c?.nome)}</span>
              <span className="text-[11px] font-medium text-slate-500">{safeStr(c?.email)}</span>
          </div>
          <div className="flex items-center gap-2">
              {getStatusClienteBadge(c?.status)}
              {getRankIndicator(c?.rank)}
          </div>
      </div>
    </div>
  );

// ============================================================================
// 6. RENDERIZADORES DE TELAS (PÁGINAS)
// ============================================================================

  // ==========================================
  // TELA 1: DASHBOARD PAINEL
  // ==========================================
  const renderPainel = () => {
    if (carregandoClientes) return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Icons.Spinner className="w-10 h-10 text-blue-600" />
        <p className="text-slate-500 font-bold animate-pulse">Sincronizando Dashboard com o Servidor HUB...</p>
      </div>
    );

    return (
    <FadeIn key="painel" className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-50">
         <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Inteligência de Clientes</h2>
              <button onClick={() => refetchClients()} className={`ml-4 w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center transition-all ${isFetchingClients ? 'animate-spin text-blue-500 border-blue-300' : ''}`} title="Sincronizar Manualmente">
                  <Icons.Refresh className="w-4 h-4"/>
              </button>
              <button onClick={() => setShowMetricsHelp(true)} aria-label="Dicionário de Métricas" className="p-1.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100 shadow-sm" title="Dicionário de Métricas">
                <Icons.Info className="w-5 h-5"/>
              </button>
            </div>
            <p className="text-sm font-medium text-slate-500 mt-1">Visão completa da saúde do seu e-commerce e retenção de base.</p>
         </div>
         <div className="relative shrink-0 z-[100]">
            <HoverProgressRoundButton 
                text={dashDateRange.start ? `${formatDateBR(dashDateRange.start)} até ${formatDateBR(dashDateRange.end)}` : 'Todo o Período'}
                onClick={() => setDashDateOpen(!dashDateOpen)} 
                icon={Icons.Calendar} 
                ariaLabel="Filtrar Período do Dashboard"
                loading={savingState === 'filtroDash'}
            />
            <DateFilterPopup 
                isOpen={dashDateOpen} onClose={() => setDashDateOpen(false)} dateRange={dashDateRange} setDateRange={setDashDateRange} loading={savingState === 'filtroDash'}
                onClear={() => { setDashDateRange({start:'',end:''}); setDashFilterText('Todo o Período'); setDashDateOpen(false); }}
                onApply={() => { 
                  if(dashDateRange.start && dashDateRange.end) {
                    triggerAcao('filtroDash', 'Métricas atualizadas!');
                    setDashFilterText(`${formatDateBR(dashDateRange.start)} até ${formatDateBR(dashDateRange.end)}`);
                    setDashDateOpen(false);
                  }
                }}
            />
         </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col xl:flex-row divide-y xl:divide-y-0 xl:divide-x divide-slate-100 overflow-hidden relative z-10">
          <div className="flex-[1.5] p-6 bg-gradient-to-br from-blue-50/50 to-white relative overflow-hidden flex flex-col justify-center">
              <div className="absolute top-0 right-0 transform translate-x-6 -translate-y-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex items-center justify-between relative z-10 mb-2">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1.5"><Icons.Activity className="w-3.5 h-3.5"/> Receita Bruta Total</span>
                  <button onClick={() => setShowRevenue(!showRevenue)} aria-label="Alternar Visão" className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-700 transition-colors flex items-center justify-center shrink-0 shadow-sm border border-blue-100">
                      {showRevenue ? <Icons.EyeOpen className="w-4 h-4"/> : <Icons.EyeOff className="w-4 h-4"/>}
                  </button>
              </div>
              <div className="relative z-10 my-2">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight whitespace-nowrap overflow-x-auto custom-scrollbar pb-1">
                    {formatSmartCurrency(metricasReais?.receita_bruta || 0, showRevenue)}
                </h3>
              </div>
              <div className="pt-3 border-t border-blue-100/50 flex items-center justify-between relative z-10 mt-auto">
                <div>
                    <p className="text-[11px] text-slate-500 font-medium">Ticket Médio Geral</p>
                    <p className="text-sm font-bold text-slate-800">
                        {formatCurrency(metricasReais?.ticket_medio || 0)}
                    </p>
                </div>
                {metricasReais?.crescimento !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border shadow-sm ${
                        metricasReais.crescimento >= 0 
                            ? 'text-emerald-600 bg-emerald-50 border-emerald-100' 
                            : 'text-rose-600 bg-rose-50 border-rose-100'        
                    }`}>
                        {metricasReais.crescimento >= 0 
                            ? <Icons.TrendingUp className="w-3.5 h-3.5" /> 
                            : <Icons.TrendingDown className="w-3.5 h-3.5" />
                        }
                        {metricasReais.crescimento > 0 ? '+' : ''}{Number(metricasReais.crescimento).toFixed(1)}%
                    </div>
                )}
              </div>
          </div>
          <div className="flex-1 p-6 flex flex-col justify-center hover:bg-slate-50/50 transition-colors">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Clientes Totais</span>
              <span className="text-3xl font-black text-slate-800">{Number(listaClientesDaApi.length).toLocaleString('pt-BR')}</span>
              <p className="text-[10px] text-slate-500 mt-1 font-medium flex items-center gap-1">
                  <span className="text-emerald-600 font-bold">+{metricasReais?.novos_clientes_pct?.toFixed(1) || 0}%</span> este mês
              </p>
          </div>
          <div className="flex-1 p-6 flex flex-col justify-center hover:bg-slate-50/50 transition-colors">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Pedidos Totais</span>
              <span className="text-3xl font-black text-slate-800">{Number(comprasTotaisCRM).toLocaleString('pt-BR')}</span>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">Histórico global</p>
          </div>
          <div className="flex-1 p-6 flex flex-col justify-center hover:bg-slate-50/50 transition-colors">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">LTV Médio</span>
              <span className="text-3xl font-black text-emerald-600">{formatSmartCurrency(ltvMedioCRM)}</span>
              <p className="text-[10px] text-slate-500 mt-1 font-medium flex items-center gap-1">
                  {metricasReais?.diferenca_ltv >= 0 ? (
                      <span className="text-emerald-600 font-bold">+{formatCurrency(metricasReais?.diferenca_ltv || 0)}</span>
                  ) : (
                      <span className="text-rose-600 font-bold">{formatCurrency(metricasReais?.diferenca_ltv || 0)}</span>
                  )}
                  vs mês ant.
              </p>
          </div>
      </div>

      <AnimatePresence>
          {showMetricsHelp && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMetricsHelp(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                  <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-xl relative z-10 border border-slate-200">
                      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                         <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Icons.Info className="w-6 h-6 text-blue-500"/> Dicionário de Métricas do CRM</h3>
                         <button onClick={() => setShowMetricsHelp(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors"><Icons.Close className="w-5 h-5"/></button>
                      </div>
                      <div className="space-y-4 text-sm font-medium text-slate-600 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                             <p className="font-bold text-slate-800">Receita Bruta Total</p>
                             <p className="text-xs text-slate-500 mt-1">Soma do valor bruto de todas as vendas aprovadas na loja dentro do período selecionado.</p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                             <p className="font-bold text-slate-800">LTV Médio (Lifetime Value)</p>
                             <p className="text-xs text-slate-500 mt-1">Valor médio total acumulado que cada cliente já gastou em sua loja desde a primeira compra.</p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                             <p className="font-bold text-slate-800">Clientes Totais vs. Pedidos Totais</p>
                             <p className="text-xs text-slate-500 mt-1">A proporção entre a base total de usuários cadastrados e o volume de compras convertido no e-commerce.</p>
                          </div>
                      </div>
                      <button onClick={() => setShowMetricsHelp(false)} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm">Entendido</button>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>

      <section className="bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col relative z-20 min-h-[600px]">
        <header className="p-6 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-slate-50/50 relative z-[90] rounded-t-3xl">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-3"><span className="text-blue-500"><Icons.Package className="w-5 h-5"/></span> Registros de Compra</h3>
            <p className="text-xs text-slate-500 mt-1">Visão em tempo real das conversões mais recentes.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <button onClick={() => refetchClients()} className={`w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 shadow-sm flex items-center justify-center transition-all ${isFetchingClients ? 'animate-spin text-blue-500 border-blue-300' : ''}`} title="Sincronizar Manualmente">
                <Icons.Refresh className="w-4 h-4"/>
            </button>
            <div className="relative z-[100]">
              <HoverProgressRoundButton 
                  text={recentDateRange.start ? `${formatDateBR(recentDateRange.start)} até ${formatDateBR(recentDateRange.end)}` : 'Filtrar Tabela'}
                  onClick={() => setRecentDateOpen(!recentDateOpen)} 
                  icon={Icons.Calendar} ariaLabel="Filtrar Período Recentes" loading={savingState === 'filtroRecent'} 
              />
              <DateFilterPopup 
                isOpen={recentDateOpen} onClose={() => setRecentDateOpen(false)}
                dateRange={recentDateRange} setDateRange={setRecentDateRange} loading={savingState === 'filtroRecent'}
                onClear={() => { setRecentDateRange({start:'',end:''}); setRecentDateOpen(false); }}
                onApply={() => { triggerAcao('filtroRecent', 'Lista Atualizada!'); setRecentDateOpen(false); }}
              />
            </div>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl shadow-sm flex-1 sm:flex-auto">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Exibir:</span>
                <select value={registrosPerPage} onChange={(e) => {setRegistrosPerPage(Number(e.target.value)); setRegistrosPage(1);}} className="bg-transparent text-sm font-bold text-slate-800 outline-none cursor-pointer">
                    <option value={10}>10</option><option value={20}>20</option><option value={30}>30</option><option value={50}>50</option>
                </select>
            </div>
          </div>
        </header>
        
        <div className="overflow-x-auto w-full custom-scrollbar relative z-0 flex-1 flex flex-col">
          <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap min-w-[1200px]">
            <thead className="bg-slate-50/50 text-slate-500 uppercase font-bold text-[10px] tracking-widest border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Cliente / Status</th>
                <th className="px-6 py-4 text-right">Valor Compra</th>
                <th className="px-6 py-4 text-center">Qtd. Produtos</th>
                <th className="px-6 py-4">Data Compra</th>
                <th className="px-6 py-4 text-center">Pagamento</th>
                <th className="px-6 py-4 text-center">Cupons</th>
                <th className="px-6 py-4 text-right">Desc. Frete</th>
                <th className="px-6 py-4 text-right">Desc. Loja</th>
                <th className="px-6 py-4 text-center">Reembolsos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence mode="wait">
                  {registrosPaginados.length > 0 ? registrosPaginados.map(c => (
                    <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={`uc-${c.id}`} className="hover:bg-slate-50 cursor-pointer transition-colors group" onClick={() => abrirPerfilCliente(c)}>
                      <td className="px-6 py-4">{renderClienteCell(c)}</td>
                      <td className="px-6 py-4 text-right font-black text-emerald-600 text-base">{formatCurrency(c?.ultimaCompraValor)}</td>
                      <td className="px-6 py-4 text-center font-bold text-slate-800">{safeNum(c?.produtosComprados)}</td>
                      <td className="px-6 py-4 text-slate-500 font-medium">{formatDateBR(c?.ultimaCompra)}</td>
                      <td className="px-6 py-4 text-center"><span className="text-[10px] font-black uppercase bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center justify-center gap-1 w-max mx-auto shadow-sm"><Icons.CreditCard className="w-3 h-3"/> {safeStr(c?.ultimaCompraPagamento) || 'ND'}</span></td>
                      <td className="px-6 py-4 text-center font-bold text-slate-700">{safeNum(c?.cuponsUsados) > 0 ? safeNum(c?.cuponsUsados) : '-'}</td>
                      <td className="px-6 py-4 text-right text-rose-500 font-medium">{safeNum(c?.descontoFrete) > 0 ? formatCurrency(c.descontoFrete) : '-'}</td>
                      <td className="px-6 py-4 text-right text-rose-500 font-medium">{safeNum(c?.descontoLoja) > 0 ? formatCurrency(c.descontoLoja) : '-'}</td>
                      <td className="px-6 py-4 text-center">
                          {c?.reembolsado ? <span className="px-2.5 py-1 bg-rose-50 text-rose-600 font-bold text-[10px] rounded-lg border border-rose-200 uppercase shadow-sm">Reembolsado</span> : <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 font-bold text-[10px] rounded-lg border border-emerald-200 uppercase shadow-sm">Sem Reembolso</span>}
                      </td>
                    </motion.tr>
                  )) : (<motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}><td colSpan="9" className="p-16 text-center text-slate-500 font-medium">Nenhum registo atende aos filtros atuais.</td></motion.tr>)}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {ultimasComprasListFiltrada.length > 0 && (
            <footer className="mt-auto p-6 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center text-xs font-bold text-slate-500 gap-4 rounded-b-3xl">
                <span className="ml-4">Página {registrosPage} de {totalRegistrosPages}</span>
                <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                        <button type="button" aria-label="Página Anterior" onClick={() => setRegistrosPage(p => Math.max(1, p - 1))} disabled={registrosPage === 1} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"><Icons.ChevronLeft className="w-4 h-4" /></button>
                        <button type="button" aria-label="Próxima Página" onClick={() => setRegistrosPage(p => Math.min(totalRegistrosPages, p + 1))} disabled={registrosPage === totalRegistrosPages} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"><Icons.ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
            </footer>
        )}
      </section>
    </FadeIn>
    );
  };

  // ==========================================
  // TELA 2: LISTA DE CLIENTES CRM
  // ==========================================
  const renderClientesCRMLista = () => {
    if (carregandoClientes) return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Icons.Spinner className="w-10 h-10 text-blue-600" />
        <p className="text-slate-500 font-bold animate-pulse">Buscando Clientes no Servidor HUB...</p>
      </div>
    );

    return (
    <FadeIn key="diretorio" className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col min-h-[600px] relative z-0">
        <header className="p-6 border-b border-slate-200 bg-slate-50/50 rounded-t-3xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
                <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3"><span className="text-blue-500"><Icons.UsersIcon className="w-5 h-5"/></span> Diretório de Clientes</h3>
                <button onClick={() => refetchClients()} className={`w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 shadow-sm flex items-center justify-center transition-all ${isFetchingClients ? 'animate-spin text-blue-500 border-blue-300' : ''}`} title="Atualizar Diretório">
                    <Icons.Refresh className="w-4 h-4"/>
                </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">Gerencie cadastros, LTV e carteiras virtuais detalhadamente.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="relative w-full sm:w-80 group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"><Icons.Search className="w-4 h-4 text-slate-400" /></div>
              <input type="text" placeholder="Buscar por Nome, E-mail, CPF..." value={searchTerm} onChange={handleSearchChange} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" />
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium shrink-0">
              <label htmlFor="filtroStatusCRM">Status:</label>
              <select id="filtroStatusCRM" value={filtroStatusCRM} onChange={(e) => { setFiltroStatusCRM(e.target.value); setCurrentPage(1); }} className="bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm cursor-pointer transition-all">
                <option value="TODOS">Todos</option><option value="ATIVO">Ativos</option><option value="INATIVO">Bloqueados</option>
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium shrink-0">
              <label htmlFor="filtroMesAniv">Aniversário:</label>
              <select id="filtroMesAniv" value={filtroMesAniv} onChange={(e) => { setFiltroMesAniv(e.target.value); setCurrentPage(1); }} className="bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm cursor-pointer transition-all">
                <option value="TODOS">Todos os Meses</option>
                <option value="01">Janeiro</option><option value="02">Fevereiro</option>
                <option value="03">Março</option><option value="04">Abril</option>
                <option value="05">Maio</option><option value="06">Junho</option>
                <option value="07">Julho</option><option value="08">Agosto</option>
                <option value="09">Setembro</option><option value="10">Outubro</option>
                <option value="11">Novembro</option><option value="12">Dezembro</option>
              </select>
            </div>
          </div>
        </header>
        
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap min-w-[1000px]">
            <thead className="bg-slate-50/50 text-slate-500 uppercase font-bold text-[10px] tracking-widest border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Cliente / Status</th>
                <th className="px-6 py-4 text-center">Compras</th>
                <th className="px-6 py-4 text-right">LTV (Gasto Total)</th>
                <th className="px-6 py-4 text-center">Cashback / Hub Coins</th>
                <th className="px-6 py-4 text-center">Última Compra</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <motion.tbody variants={containerVariants} initial="hidden" animate="show" className="divide-y divide-slate-100">
              {clientesPaginados.length > 0 ? clientesPaginados.map(c => (
                <motion.tr variants={itemVariants} key={c.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => abrirPerfilCliente(c)}>
                  <td className="p-6 py-4">{renderClienteCell(c)}</td>
                  <td className="px-6 py-4 text-center font-bold text-slate-800">{safeNum(c?.compras)}</td>
                  <td className="px-6 py-4 text-right font-black text-emerald-600">{formatCurrency(c?.ltv)}</td>
                  <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center justify-center">
                          <span className="font-black text-emerald-600 text-xs">{formatCurrency(c?.cashback)}</span>
                          <span className="font-bold text-yellow-600 text-[10px] mt-0.5">{safeNum(c?.coins)} Coins</span>
                      </div>
                  </td>
                  <td className="px-6 py-4 text-center text-slate-500 font-medium">{formatDateBR(c?.ultimaCompra)}</td>
                  <td className="px-6 py-4 text-center">
                      <button onClick={(e) => { e.stopPropagation(); abrirPerfilCliente(c); }} className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 hover:border-blue-300 rounded-xl text-[11px] font-black uppercase shadow-sm mx-auto text-slate-500 hover:text-blue-600 transition-colors" title="Analisar Perfil">
                          <Icons.Eye className="w-4 h-4" />
                      </button>
                  </td>
                </motion.tr>
              )) : (<tr><td colSpan="6" className="p-16 text-center text-slate-500 text-base font-medium">Nenhum cliente encontrado.</td></tr>)}
            </motion.tbody>
          </table>
        </div>

        {clientesFiltrados.length > 0 && (
          <footer className="p-6 border-t border-slate-200 rounded-b-3xl flex flex-col sm:flex-row justify-between items-center text-xs font-bold text-slate-500 bg-slate-50/50 shadow-sm gap-4">
              <span>Mostrando <strong className="text-slate-800">{indexOfFirstItem + 1}</strong> até <strong className="text-slate-800">{Math.min(indexOfLastItem, clientesFiltrados.length)}</strong> de <strong className="text-slate-800">{clientesFiltrados.length}</strong> clientes</span>
              <div className="flex items-center gap-4">
                  <span>Página {currentPage} de {totalPages || 1}</span>
                  <div className="flex gap-2">
                      <button type="button" aria-label="Página Anterior" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"><Icons.ChevronLeft className="w-4 h-4" /></button>
                      <button type="button" aria-label="Próxima Página" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"><Icons.ChevronRight className="w-4 h-4" /></button>
                  </div>
              </div>
          </footer>
        )}
      </div>
    </FadeIn>
    );
  };

  // ============================================================================
  // 6.4. RENDER MODULAR: BENEFÍCIOS (ESTILO NETFLIX CARDS)
  // ============================================================================
  const renderBeneficios = () => {
    const getRegraEntradaVisual = (gasto, compras, isDefault) => {
        if (isDefault) return "Benefício Principal (Garantido no Cadastro)";
        const g = parseCommaFloat(gasto);
        const c = safeNum(compras);
        if (g > 0 && c > 0) return "Ambos (Tem que ter o Gasto E a Qtd de Compras)";
        if (g > 0) return "Apenas por Valor de Gasto";
        if (c > 0) return "Apenas por Quantidade de Pedidos";
        return "Defina uma regra válida";
    };

    return (
    <FadeIn key="beneficios" className="space-y-6">
      <header className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <div className="text-yellow-500"><Icons.Star className="w-6 h-6"/></div>
                Regras e Níveis VIP
            </h3>
            <p className="text-sm font-medium text-slate-500 mt-2">Crie os seus próprios níveis, defina badges e estabeleça os benefícios de cada um.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
            <button onClick={abrirNovoVIP} className="bg-white border border-slate-200 text-slate-700 hover:text-blue-600 font-bold px-6 py-3 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"><Icons.Plus className="w-4 h-4"/> Criar Nível</button>
            <ProgressButton onClick={() => triggerAcao('saveVip', 'Novos benefícios aplicados na loja!')} loading={savingState === 'saveVip'} text="Salvar Alterações" loadingText="Gravando..." className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-sm transition-colors" />
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {niveisVIPConvertidos.map((nivel) => (
              <article key={nivel.id} className={`bg-white border ${nivel.isDefault ? 'border-yellow-400 ring-4 ring-yellow-50' : 'border-slate-200'} rounded-3xl shadow-sm overflow-hidden flex flex-col relative group hover:shadow-lg transition-all hover:-translate-y-1`}>
                  
                  {nivel.isDefault && <span className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl z-20 shadow-sm">👑 Principal</span>}

                  <div className="h-28 bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 relative p-4 flex justify-between items-start z-10">
                      <span className="bg-white/80 backdrop-blur-md text-slate-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm border border-white/50">Nível #{nivel.id}</span>
                      
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => editarVIP(nivel)} aria-label="Editar VIP" className="p-2 bg-white/90 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl shadow-md transition-colors"><Icons.Edit3 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => excluirVIPReal(nivel.id)} aria-label="Excluir VIP" className="p-2 bg-white/90 text-rose-500 hover:bg-rose-600 hover:text-white rounded-xl shadow-md transition-colors"><Icons.Trash className="w-3.5 h-3.5" /></button>
                      </div>
                  </div>

                  <div className="flex flex-col items-center -mt-12 px-6 pb-6 pt-0 flex-1 z-10">
                      <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center mb-3 relative overflow-hidden">
                          {nivel.imagem ? (
                              <img src={nivel.imagem} alt={nivel.nome} className="w-full h-full object-cover" />
                          ) : (
                              <Icons.Star className="w-8 h-8 text-yellow-500" />
                          )}
                      </div>
                      
                      <h4 className="text-xl font-black text-slate-900 mb-1 text-center">{nivel.nome}</h4>
                      
                      <div className="w-full space-y-2 text-xs font-medium text-slate-600 mt-2 border-t border-slate-100 pt-3">
                          <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Requisitos:</p>
                          {nivel.isDefault ? (
                              <div className="text-center py-2 bg-yellow-50 border border-yellow-100 rounded-lg text-yellow-800 font-bold text-[10px] uppercase tracking-wider">Automático (No Cadastro)</div>
                          ) : (
                              <>
                                <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Gasto Total:</span><strong className="text-slate-800">{parseCommaFloat(nivel.gastoRequisito) > 0 ? formatCurrency(parseCommaFloat(nivel.gastoRequisito)) : '-'}</strong></div>
                                <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Pedidos Totais:</span><strong className="text-slate-800">{safeNum(nivel.comprasRequisito) > 0 ? `${nivel.comprasRequisito} und` : '-'}</strong></div>
                              </>
                          )}
                      </div>

                      <div className="w-full space-y-2 text-xs font-medium text-slate-600 mt-4 border-t border-slate-100 pt-3">
                          <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Benefícios:</p>
                          <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Multiplicador:</span><strong className="text-blue-600 bg-blue-50 px-2 rounded">{nivel.multCoins}x Coins</strong></div>
                          <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Desc Produtos:</span><strong className="text-emerald-600 bg-emerald-50 px-2 rounded">{nivel.descProdutos}% OFF</strong></div>
                          <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Desc Frete:</span><strong className="text-emerald-600 bg-emerald-50 px-2 rounded">{nivel.descFrete}% OFF</strong></div>
                      </div>

                      <div className="w-full space-y-2 text-[10px] font-medium text-slate-500 mt-4 border-t border-slate-100 pt-3">
                          <div className="flex items-center gap-1.5">
                             <Icons.Repeat className="w-3.5 h-3.5 text-slate-400"/> 
                             {nivel.frequenciaUso === 'ILIMITADO' ? 'Ilimitado (Sempre)' : `${nivel.limiteUso}x por ${nivel.frequenciaUso === 'SEMANAL' ? 'Semana' : 'Mês'}`}
                          </div>
                      </div>
                  </div>
              </article>
          ))}
      </div>

      <AnimatePresence>
          {modalVIP.isOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="modal-vip-title">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={fecharModalVIP} className="absolute inset-0 bg-slate-900/50 backdrop-blur-md" />
                  <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl relative z-10 border border-slate-200 flex flex-col max-h-[92vh]">
                      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 flex-shrink-0">
                         <h3 id="modal-vip-title" className="text-xl font-black text-slate-800">{modalVIP.isNovo ? 'Criar Novo Nível VIP' : 'Editar Nível VIP'}</h3>
                         <button onClick={fecharModalVIP} className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"><Icons.Close className="w-5 h-5"/></button>
                      </div>
                      
                      <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2 pb-4 flex-1">
                          <div className="flex gap-6 items-center">
                              <label className="w-24 h-24 flex-shrink-0 bg-slate-50 border-2 border-dashed border-blue-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 relative overflow-hidden group shadow-sm transition-all">
                                  <input type="file" accept="image/*" className="hidden" onChange={handleVIPImageUpload} />
                                  {modalVIP.data?.imagem ? (
                                      <>
                                          <img src={modalVIP.data.imagem} className="absolute inset-0 w-full h-full object-cover" alt="" />
                                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><span className="text-white text-[9px] font-bold border border-white px-2 py-1 rounded">Trocar</span></div>
                                      </>
                                  ) : <><Icons.Upload className="w-5 h-5 text-blue-500 mb-1"/><span className="text-[9px] font-bold text-blue-600">Badge (1:1)</span></>}
                              </label>
                              <div className="flex-1">
                                  <label className="text-xs font-bold text-slate-700 block mb-2">Nome do Nível * <span className="text-rose-500">(Obrigatório)</span></label>
                                  <input type="text" value={modalVIP.data?.nome || ''} onChange={e=>setModalVIP({...modalVIP, data:{...modalVIP.data, nome: e.target.value}})} placeholder="Ex: Sócio Fundador" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-800 transition-all shadow-sm" />
                              </div>
                          </div>

                          <div className="border-t border-slate-100 pt-4">
                              <AnimatedToggle 
                                  label="Benefício Principal (Padrão para Novos Clientes)" 
                                  hintText="Atribui automaticamente este nível a todos os novos clientes cadastrados. Só pode existir um Nível Principal na loja."
                                  active={modalVIP.data?.isDefault} 
                                  onChange={(v) => setModalVIP({...modalVIP, data: {...modalVIP.data, isDefault: v}})}
                                  activeColor="#EAB308"
                              />
                          </div>

                          <div className={`border rounded-2xl p-6 transition-all ${modalVIP.data?.isDefault ? 'bg-slate-100/50 border-slate-200 opacity-60 pointer-events-none' : 'bg-slate-50 border-slate-200'}`}>
                              <div className="flex justify-between items-end mb-4">
                                <p className="text-xs font-bold text-slate-800">Requisitos de Entrada <span className="text-slate-400 font-medium">(Coloque 0 se não quiser usar a regra)</span></p>
                                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg shadow-sm border ${modalVIP.data?.isDefault ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-white text-slate-500 border-slate-200'}`}>
                                   Regra Lógica: {getRegraEntradaVisual(modalVIP.data?.gastoRequisito, modalVIP.data?.comprasRequisito, modalVIP.data?.isDefault)}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Total Gasto (R$)</label>
                                      <div className="relative">
                                          <span className="absolute left-3.5 top-3 text-xs font-bold text-slate-400">R$</span>
                                          <input type="text" disabled={modalVIP.data?.isDefault} value={formatCommaFloat(modalVIP.data?.gastoRequisito)} onChange={e=>setModalVIP({...modalVIP, data:{...modalVIP.data, gastoRequisito: e.target.value}})} className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 shadow-sm transition-all disabled:bg-slate-100" placeholder="Ex: 500" />
                                      </div>
                                  </div>
                                  <div>
                                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Qtd de Pedidos (Inteiro)</label>
                                      <input type="number" disabled={modalVIP.data?.isDefault} step="1" min="0" value={modalVIP.data?.comprasRequisito ?? 0} onChange={e=>setModalVIP({...modalVIP, data:{...modalVIP.data, comprasRequisito: safeNum(e.target.value)}})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 shadow-sm transition-all disabled:bg-slate-100" placeholder="Ex: 5" />
                                  </div>
                              </div>
                          </div>

                          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6">
                              <p className="text-xs font-bold text-blue-800 mb-4">Benefícios do Nível VIP</p>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                  <div>
                                      <label className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-2">Multiplicador (Coins)</label>
                                      <div className="relative">
                                          <input type="text" value={formatCommaFloat(modalVIP.data?.multCoins)} onChange={e=>setModalVIP({...modalVIP, data:{...modalVIP.data, multCoins: e.target.value}})} className="w-full bg-white border border-blue-200 rounded-xl pl-4 pr-8 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 shadow-sm transition-all" placeholder="1,5" />
                                          <span className="absolute right-3.5 top-3 text-xs font-black text-blue-500">x</span>
                                      </div>
                                  </div>
                                  <div>
                                      <label className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-2">Desc. Frete (%)</label>
                                      <div className="relative">
                                          <input type="text" value={formatCommaFloat(modalVIP.data?.descFrete)} onChange={e=>setModalVIP({...modalVIP, data:{...modalVIP.data, descFrete: e.target.value}})} className="w-full bg-white border border-blue-200 rounded-xl pl-4 pr-8 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 shadow-sm transition-all" placeholder="10" />
                                          <span className="absolute right-3.5 top-3 text-xs font-black text-blue-500">%</span>
                                      </div>
                                  </div>
                                  <div>
                                      <label className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-2">Desc. Produtos (%)</label>
                                      <div className="relative">
                                          <input type="text" value={formatCommaFloat(modalVIP.data?.descProdutos)} onChange={e=>setModalVIP({...modalVIP, data:{...modalVIP.data, descProdutos: e.target.value}})} className="w-full bg-white border border-blue-200 rounded-xl pl-4 pr-8 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 shadow-sm transition-all" placeholder="10" />
                                          <span className="absolute right-3.5 top-3 text-xs font-black text-blue-500">%</span>
                                      </div>
                                  </div>
                              </div>
                              
                              <div className="mt-5 pt-5 border-t border-blue-100/50">
                                  <AnimatedToggle 
                                      label="Acumular Desconto de Frete VIP" 
                                      hintText="Permite acumular o desconto no frete até o limite do preço do frete, desde que não haja frete grátis já incluso ou cupom de frete grátis ativo."
                                      active={modalVIP.data?.acumulaFrete} 
                                      onChange={(v) => setModalVIP({...modalVIP, data: {...modalVIP.data, acumulaFrete: v}})}
                                      activeColor="#3B82F6"
                                  />
                              </div>
                          </div>

                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                              <p className="text-xs font-bold text-slate-800 mb-4">Limites de Utilização <span className="text-slate-400 font-medium">(Aplica-se apenas aos descontos Frete/Loja. O Multiplicador de Coins é sempre Ilimitado).</span></p>
                              <div className="flex flex-col sm:flex-row gap-4">
                                  <div className="flex-1">
                                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Frequência de Uso</label>
                                      <select value={modalVIP.data?.frequenciaUso} onChange={e=>setModalVIP({...modalVIP, data:{...modalVIP.data, frequenciaUso: e.target.value}})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm">
                                          <option value="ILIMITADO">Em Todas as Compras (Ilimitado)</option>
                                          <option value="SEMANAL">Restrito por Semana</option>
                                          <option value="MENSAL">Restrito por Mês</option>
                                      </select>
                                  </div>
                                  {modalVIP.data?.frequenciaUso !== 'ILIMITADO' && (
                                    <div className="w-full sm:w-1/3">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Quantas Vezes?</label>
                                        <input type="number" min="1" step="1" value={modalVIP.data?.limiteUso} onChange={e=>setModalVIP({...modalVIP, data:{...modalVIP.data, limiteUso: safeNum(e.target.value)}})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 shadow-sm transition-all" />
                                    </div>
                                  )}
                              </div>
                          </div>

                      </div>

                      <div className="flex gap-4 mt-6 pt-6 border-t border-slate-100 flex-shrink-0">
                          <button onClick={fecharModalVIP} className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 font-bold py-3.5 rounded-xl hover:bg-slate-100 transition-colors shadow-sm">Cancelar</button>
                          <button onClick={salvarVIPReal} disabled={savingState === 'saveVip'} className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-70">
                            {savingState === 'saveVip' ? 'Salvando...' : 'Salvar Regra VIP'}
                          </button>
                      </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>
    </FadeIn>
    );
  };

  // ============================================================================
  // 6.5. RENDER MODULAR: CONFIGURAÇÕES (CARDS SAAS / NETFLIX STYLE)
  // ============================================================================
  const renderConfiguracoes = () => (
    <FadeIn key="configuracoes" className="space-y-6 max-w-4xl mx-auto">
       <header className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                  <Icons.SettingsIcon className="w-6 h-6 text-blue-500"/>
                  Configurações do CRM e Loja
              </h3>
              <p className="text-sm font-medium text-slate-500 mt-1">Gerencie os acessos, restrições e comportamento global da plataforma.</p>
            </div>
            <button onClick={() => setShowConfigHelp(true)} className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-2">
                <Icons.HelpCircle className="w-4 h-4"/> Dicionário de Configurações
            </button>
       </header>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <article className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-blue-200 transition-all">
               <div>
                   <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                       <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl"><Icons.UsersIcon className="w-5 h-5"/></div>
                       <div>
                           <h4 className="font-bold text-slate-800 text-base">Regras de Cadastro</h4>
                           <p className="text-[11px] text-slate-400 font-medium">Fluxo de registro e login</p>
                       </div>
                   </div>
                   <div className="space-y-4">
                       <AnimatedToggle 
                           label="Permitir Registro Aberto de Novos Clientes" 
                           active={config.permiteCadastro} 
                           onChange={(v) => setConfig({...config, permiteCadastro: v})} 
                       />
                       <AnimatedToggle 
                           label="Loja Fechada (Login Apenas por Convite)" 
                           active={config.loginApenasConvite} 
                           onChange={(v) => setConfig({...config, loginApenasConvite: v})} 
                           activeColor="#A855F7"
                       />
                   </div>
               </div>
           </article>

           <article className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-blue-200 transition-all">
               <div>
                   <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                       <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl"><Icons.AlertTriangle className="w-5 h-5"/></div>
                       <div>
                           <h4 className="font-bold text-slate-800 text-base">Segurança & Interações</h4>
                           <p className="text-[11px] text-slate-400 font-medium">Moderação e restrição geográfica</p>
                       </div>
                   </div>
                   <div className="space-y-4">
                       <AnimatedToggle 
                           label="Aprovar Comentários Manualmente" 
                           active={config.aprovarComentarios} 
                           onChange={(v) => setConfig({...config, aprovarComentarios: v})} 
                       />
                       <AnimatedToggle 
                           label="Bloquear Compras Fora do País Origem" 
                           active={config.bloquearForaDoPais} 
                           onChange={(v) => setConfig({...config, bloquearForaDoPais: v})} 
                           activeColor="#EF4444"
                       />
                   </div>
               </div>
           </article>
       </div>

       <div className="flex justify-end pt-4">
           <ProgressButton onClick={salvarConfiguracoesReais} loading={savingState === 'saveConfig'} text="Salvar Alterações" loadingText="Salvando..." className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-sm transition-colors" />
       </div>

       <AnimatePresence>
          {showConfigHelp && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-config-help">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowConfigHelp(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                  <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-xl relative z-10 border border-slate-200">
                      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                         <h3 id="modal-config-help" className="text-xl font-black text-slate-800 flex items-center gap-2"><Icons.HelpCircle className="w-6 h-6 text-blue-500"/> Guia das Configurações</h3>
                         <button onClick={() => setShowConfigHelp(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors"><Icons.Close className="w-5 h-5"/></button>
                      </div>
                      <div className="space-y-4 text-sm font-medium text-slate-600 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                             <p className="font-bold text-slate-800">Permitir Registro Aberto</p>
                             <p className="text-xs text-slate-500 mt-1">Qualquer visitante do e-commerce pode criar uma conta sem aprovação prévia.</p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                             <p className="font-bold text-slate-800">Loja Fechada (Apenas Convite)</p>
                             <p className="text-xs text-slate-500 mt-1">Ideal para e-commerces B2B ou VIP. O acesso aos preços e checkout exige aprovação prévia.</p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                             <p className="font-bold text-slate-800">Aprovar Comentários Manualmente</p>
                             <p className="text-xs text-slate-500 mt-1">Garante que todas as avaliações passem pelo painel de aprovação antes de ficarem públicas.</p>
                          </div>
                      </div>
                      <button onClick={() => setShowConfigHelp(false)} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm">Fechar Guia</button>
                  </motion.div>
              </div>
          )}
       </AnimatePresence>
    </FadeIn>
  );

  // ============================================================================
  // 6.6. MAIN RENDER (AdminCustomersContent)
  // ============================================================================
  return (
      <>
        <AnimatedNotification show={toast.show} status={toast.status} titulo={toast.message} />
        <AnimatePresence mode="wait">
          {mainTab === 'PAINEL' && renderPainel()}
          {mainTab === 'CLIENTES (CRM)' && !clienteSelecionado && renderClientesCRMLista()}
          
          {mainTab === 'CLIENTES (CRM)' && clienteSelecionado && (
              <AdminPerfilCRM 
                  cliente={clienteSelecionado}
                  clienteSelecionado={clienteSelecionado} 
                  setClienteSelecionado={setClienteSelecionado} 
                  onBack={fecharPerfilCliente} 
                  onVoltar={fecharPerfilCliente} 
                  niveisVIPDaApi={niveisVIPDaApi} 
                  refetchClients={refetchClients} 
                  isFetchingClients={isFetchingClients}
                  triggerAcaoGlob={triggerAcao}
                  showToastGlob={showToast}
              />
          )}

          {mainTab === 'BENEFÍCIOS' && renderBeneficios()}
          {mainTab === 'CONFIGURAÇÕES' && renderConfiguracoes()}
        </AnimatePresence>
      </>
  );
};

// ============================================================================
// 7. COMPONENTE ROOT
// ============================================================================
export default function AdminCustomers() {
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Lê a aba principal da URL ou usa 'PAINEL' como padrão
    const mainTabUrl = searchParams.get('maintab') || 'PAINEL';
    
    // Lê se existe um cliente aberto
    const customerIdUrl = searchParams.get('id');

    const abasDisponiveis = ['PAINEL', 'CLIENTES (CRM)', 'BENEFÍCIOS', 'CONFIGURAÇÕES'];

    // GARANTE QUE SE TIVER UM ID NA URL, A ABA É A DE CRM
    React.useEffect(() => {
        if (customerIdUrl && mainTabUrl !== 'CLIENTES (CRM)') {
            const newParams = new URLSearchParams(searchParams);
            newParams.set('maintab', 'CLIENTES (CRM)');
            setSearchParams(newParams);
        }
    }, [customerIdUrl, mainTabUrl, searchParams, setSearchParams]);

    // FUNÇÃO INTELIGENTE DE TROCA DE ABAS
    const handleMainTabChange = (tab) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('maintab', tab);
        
        // Se sair da aba de CRM, removemos o ID do cliente da URL
        if (tab !== 'CLIENTES (CRM)') {
            newParams.delete('id');
            newParams.delete('tab'); 
        }
        
        setSearchParams(newParams);
    };

    return (
        <QueryClientProvider client={queryClient}>
            <ErrorBoundary>
                <div className="w-full min-h-screen bg-slate-50 pb-20 relative font-sans">
                    <GlobalStyles />

                    <header className="mb-6 pt-4 px-4 md:px-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">CRM DE CLIENTES</h1>
                                <p className="text-sm font-medium text-slate-500 mt-1">Gestão 360º de base de dados, LTV e funil de vendas.</p>
                            </div>
                        </div>
                        
                        <nav className="flex gap-8 border-b border-slate-200 mt-8 overflow-x-auto no-scrollbar relative w-full" aria-label="Navegação do CRM">
                            {abasDisponiveis.map(tab => (
                                <button 
                                    type="button" 
                                    key={tab} 
                                    aria-label={`Aba ${tab}`} 
                                    aria-current={mainTabUrl === tab ? "page" : undefined} 
                                    onClick={() => handleMainTabChange(tab)} 
                                    className={`relative pb-4 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${mainTabUrl === tab ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    {tab}
                                    {mainTabUrl === tab && (
                                        <motion.div layoutId="activeTabIndicatorAdminMain" className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-t-full" />
                                    )}
                                </button>
                            ))}
                        </nav>
                    </header>

                    <main className="flex-1 min-w-0 px-4 md:px-8 relative pt-2">
                       <AdminCustomersContent mainTab={mainTabUrl} setMainTab={handleMainTabChange} />
                    </main>
                </div>
            </ErrorBoundary>
        </QueryClientProvider>
    );
}