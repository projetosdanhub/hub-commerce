// ============================================================================
// FICHEIRO: resources/js/Modulos/Admin/AdminCustomers.jsx
// ARQUITETURA: CRM Inteligente Modularizado (Dashboard, In-Page Profile)
// STATUS: 100% Blindado | Acessibilidade (a11y) | Preparado para API Backend
// UI/UX: Premium Minimal SaaS | Soft Light | Customer 360 View | Netflix Cards
// ============================================================================

import React, { useState, useMemo, useRef, useEffect, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  StarFull: ({className="w-4 h-4"}) => <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
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
  Download: ({className="w-4 h-4"}) => <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
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
// 3. UTILS E FORMATAÇÃO E CSS
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
// COMPONENTES DE UI COMPARTILHADOS
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

// ==========================================
// 4. MOCK DE DADOS ENRIQUECIDOS (CRM)
// ==========================================
const gerarClientes = () => {
  const clientes = [];
  
  // Cliente Modelo Completo
  clientes.push({
    id: 1, nome: 'João Silva', email: 'joao.silva@email.com', telefone: '+55 11 98888-7777', cpf: '111.222.333-44', nascimento: '1985-10-20',
    dataCadastro: '2025-11-15', origem: 'Busca Orgânica', ultimaCompra: '2026-08-25', compras: 5, produtosComprados: 12,
    cuponsUsados: 2, descontoFrete: 15.50, descontoLoja: 50.00, ltv: 2450.00, coins: 450, cashback: 25.50,
    reembolsosPagos: 1, produtosReembolsados: 2,
    status: 'ATIVO', rank: 'Ouro', ultimaCompraValor: 350.00, ultimaCompraPagamento: 'PIX', primeiraCompraFeita: true, reembolsado: false,
    tags: ['Cliente Fiel', 'Amante de Eletrônicos'], notas: 'O cliente prefere entregas no período da manhã.',
    enderecos: [
        { padrao: true, uf: 'SP', cidade: 'São Paulo', rua: 'Avenida Paulista', num: '1000', bairro: 'Bela Vista', complemento: 'Apt 150', referencia: 'Próximo ao MASP', cep: '01310-100' },
        { padrao: false, uf: 'RJ', cidade: 'Rio de Janeiro', rua: 'Rua das Flores', num: '22', bairro: 'Copacabana', complemento: 'Casa 2', referencia: '', cep: '22000-000' }
    ],
    auditLogs: [
        { id: 1, data: '2026-08-25T14:30:00Z', titulo: 'Pedido Finalizado no Checkout', desc: 'Transação confirmada via PIX.', tipo: 'success' },
        { id: 2, data: '2026-08-25T14:15:00Z', titulo: 'Sessão iniciada', desc: 'Login efetuado via Dispositivo Mobile (iPhone).', tipo: 'info' },
        { id: 3, data: '2026-05-10T10:00:00Z', titulo: 'Alteração de Endereço', desc: 'Cliente adicionou novo endereço RJ.', tipo: 'warning' },
        { id: 4, data: '2025-11-15T09:00:00Z', titulo: 'Conta de Cliente Criada', desc: 'Cadastro efetuado na loja (Busca Orgânica).', tipo: 'default' }
    ]
  });

  // Clientes Aleatórios
  for (let i = 2; i <= 65; i++) {
    const hasBought = i % 3 !== 0;
    let rank = 'Bronze';
    if(hasBought) {
        if (i % 5 === 0) rank = 'Diamante';
        else if (i % 4 === 0) rank = 'Platina';
        else if (i % 3 === 0) rank = 'Ouro';
        else rank = 'Prata';
    }

    clientes.push({
      id: i, nome: `Cliente Demo ${i}`, email: `cliente${i}@email.com`, telefone: `+55 11 98888-${String(i).padStart(4, '0')}`,
      cpf: `111.222.333-${String(i).padStart(2, '0')}`, nascimento: `199${i%9}-01-01`, dataCadastro: `2025-11-${String((i % 28) + 1).padStart(2, '0')}`, origem: 'Orgânico',
      ultimaCompra: hasBought ? `2026-08-${String((i % 28) + 1).padStart(2, '0')}` : '-', compras: hasBought ? (i % 8) + 1 : 0,
      produtosComprados: hasBought ? (i % 12) + 2 : 0, cuponsUsados: hasBought ? (i % 4) : 0,
      descontoFrete: hasBought ? i * 2.50 : 0, descontoLoja: hasBought ? i * 5.00 : 0, ltv: hasBought ? 250.00 * (i * 1.2) : 0,
      reembolsosPagos: hasBought && i % 6 === 0 ? 1 : 0, produtosReembolsados: hasBought && i % 6 === 0 ? 1 : 0,
      coins: hasBought ? 50 * i : 0, cashback: hasBought ? 15.50 * i : 0, status: i % 7 === 0 ? 'INATIVO' : 'ATIVO',
      rank: rank,
      ultimaCompraValor: hasBought ? 120.00 * ((i % 3) + 1) : 0, ultimaCompraPagamento: i % 2 === 0 ? 'Cartão' : 'PIX',
      primeiraCompraFeita: hasBought, reembolsado: hasBought && i % 6 === 0,
      tags: hasBought ? ['Comprador Ativo'] : ['Lead'], notas: '',
      enderecos: hasBought ? [{ padrao: true, uf: 'MG', cidade: 'Belo Horizonte', rua: 'Rua Exemplo', num: '123', bairro: 'Centro', complemento: '', referencia: '', cep: '30000-000' }] : [],
      auditLogs: hasBought ? [
        { id: 1, data: `2026-08-${String((i % 28) + 1).padStart(2, '0')}T10:00:00Z`, titulo: 'Pedido Finalizado', desc: 'Compra realizada no sistema.', tipo: 'success' },
        { id: 2, data: `2025-11-${String((i % 28) + 1).padStart(2, '0')}T09:00:00Z`, titulo: 'Conta Criada', desc: 'Cadastro pelo site.', tipo: 'default' }
      ] : [{ id: 1, data: `2025-11-${String((i % 28) + 1).padStart(2, '0')}T09:00:00Z`, titulo: 'Conta Criada', desc: 'Cadastro pelo site.', tipo: 'default' }]
    });
  }
  return clientes;
};

const mockClientesGerais = gerarClientes();
const MAX_LTV_GERAL = mockClientesGerais.length > 0 ? Math.max(...mockClientesGerais.map(c => safeNum(c.ltv))) : 0;
const MAX_COMPRA_GERAL = mockClientesGerais.length > 0 ? Math.max(...mockClientesGerais.map(c => safeNum(c.ultimaCompraValor))) : 0;

// ============================================================================
// COMPONENTE CORE: CONTEÚDO PRINCIPAL MODULAR
// ============================================================================
const AdminCustomersContent = ({ mainTab, setMainTab }) => {
  // CRM In-Page State
  const [crmSubTab, setCrmSubTab] = useState('RESUMO');
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [novaTag, setNovaTag] = useState('');
  
  // Modais State (First Page UX)
  const [perfilEmEdicao, setPerfilEmEdicao] = useState(false);
  
// --- LÓGICA DE SEGURANÇA, EDIÇÃO IN-PAGE E AUDITORIA ---
  // Fluxo de E-mail
  const [emailFlow, setEmailFlow] = useState({ ativo: false, step: 1, novoEmail: '', motivo: '' });
  const [emailEditFlow, setEmailEditFlow] = useState({ cooldown: 0, attempts: 0, lockedUntil: null }); // Relógio e travas

  // Fluxo de Telefone
  const [phoneFlow, setPhoneFlow] = useState({ novoTelefone: '', motivo: '' });

  // Fluxo de Senha Provisória (com expiração)
  const [senhaTemp, setSenhaTemp] = useState({ codigo: null, expiraEm: null });

  // Relógio ao vivo para a Senha Provisória
  const [tempoRestanteSenha, setTempoRestanteSenha] = useState('');

  useEffect(() => {
      if (!senhaTemp.expiraEm) return;

      const atualizaCronometro = () => {
          const agora = new Date().getTime();
          const distancia = senhaTemp.expiraEm.getTime() - agora;

          if (distancia <= 0) {
              setTempoRestanteSenha('Expirada');
              // Opcional: apagar a senha se o tempo zerar
              // setSenhaTemp({ codigo: null, expiraEm: null });
          } else {
              const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
              const segundos = Math.floor((distancia % (1000 * 60)) / 1000);
              // Formata para ter sempre 2 dígitos (ex: 06m 09s)
              setTempoRestanteSenha(`${String(minutos).padStart(2, '0')}m ${String(segundos).padStart(2, '0')}s`);
          }
      };

      atualizaCronometro(); // Atualiza na hora
      const interval = setInterval(atualizaCronometro, 1000); // Desce a cada segundo
      return () => clearInterval(interval);
  }, [senhaTemp.expiraEm]);
  
  // Fluxo de Dados Sensíveis
  const [docSensivel, setDocSensivel] = useState({ cpf: '', nascimento: '', arquivo: null });

  // Função Central de Auditoria (Gera Logs automaticamente)
  const registrarLog = (titulo, desc, tipo = 'default') => {
      const newLog = {
          id: Date.now(),
          data: new Date().toISOString(), // Data e horário atual
          titulo: titulo,
          desc: `${desc} (Admin Responsável: Gestor Padrão)`,
          tipo: tipo
      };
      setClienteSelecionado(prev => ({...prev, auditLogs: [newLog, ...(prev.auditLogs || [])]}));
  };

// Cronômetro para o botão de E-mail (Corrigido para descer exatos 1s)
  useEffect(() => {
      if (emailEditFlow.cooldown > 0) {
          const timer = setTimeout(() => {
              setEmailEditFlow(prev => ({ ...prev, cooldown: prev.cooldown - 1 }));
          }, 1000);
          return () => clearTimeout(timer);
      }
  }, [emailEditFlow.cooldown]);
// --- FUNÇÕES DE SEGURANÇA E AÇÕES ---

  // 1. Ações de E-mail
  const avancarEmailStep2 = () => {
      if (!emailFlow.motivo.trim()) return alert("Obrigatório: Preencha o motivo da alteração.");
      setEmailFlow(prev => ({ ...prev, step: 2 }));
  };

  const enviarCodigoEmail = () => {
      if (emailEditFlow.lockedUntil && new Date() < emailEditFlow.lockedUntil) {
          return alert("Sistema de segurança ativo. Aguarde 5 minutos para tentar novamente.");
      }
      if (!emailFlow.novoEmail.trim() || !emailFlow.novoEmail.includes('@')) {
          return alert("Digite um e-mail válido.");
      }

      const novasTentativas = emailEditFlow.attempts + 1;
      triggerAcao('envioEmailCode', 'Código enviado para o novo e-mail!');
      registrarLog('Envio de Código de E-mail', `Tentativa ${novasTentativas}: Código enviado para ${emailFlow.novoEmail}. Motivo: ${emailFlow.motivo}`, 'info');

      if (novasTentativas >= 3) {
          const tempoBloqueio = new Date(new Date().getTime() + 5 * 60000); // Bloqueia por 5 min
          setEmailEditFlow({ cooldown: 0, attempts: 0, lockedUntil: tempoBloqueio });
          registrarLog('Alerta de Segurança: E-mail', `Bloqueio automático após 3 tentativas de envio para ${emailFlow.novoEmail}.`, 'warning');
      } else {
          setEmailEditFlow(prev => ({ ...prev, cooldown: 45, attempts: novasTentativas }));
      }
  };

  // 2. Ações de Telefone
  const salvarTelefone = () => {
      if (!phoneFlow.motivo.trim()) return alert("Obrigatório: Preencha o motivo da alteração.");
      if (!phoneFlow.novoTelefone.trim()) return alert("Digite o novo telefone.");

      triggerAcao('savePhone', 'Telefone atualizado com sucesso!');
      registrarLog('Alteração de Telefone/WhatsApp', `De: ${clienteSelecionado.telefone} Para: ${phoneFlow.novoTelefone}. Motivo: ${phoneFlow.motivo}`, 'warning');
      setClienteSelecionado(prev => ({ ...prev, telefone: phoneFlow.novoTelefone }));
      setPhoneFlow({ novoTelefone: '', motivo: '' }); // reseta
  };

  // 3. Ações de Dados Sensíveis (CPF / Nasc)
  const salvarDadosSensiveis = () => {
      if (!docSensivel.arquivo) return alert("Obrigatório: Anexe o documento oficial para validar a alteração sensível.");
      
      triggerAcao('saveDocs', 'Dados sensíveis atualizados mediante documento.');
      registrarLog('Alteração de Dados Sensíveis', `CPF ou Nascimento alterados. Documento anexado: ${docSensivel.arquivo.name}.`, 'warning');
      
      if(docSensivel.cpf) setClienteSelecionado(prev => ({ ...prev, cpf: docSensivel.cpf }));
      if(docSensivel.nascimento) setClienteSelecionado(prev => ({ ...prev, nascimento: docSensivel.nascimento }));
      setDocSensivel({ cpf: '', nascimento: '', arquivo: null }); // reseta
  };

  // 4. Ações de Senha e Recuperação
  const gerarSenhaProvisoria = () => {
      triggerAcao('gerarSenha', 'Senha gerada! Expira em 7 minutos.');
      const novaSenha = 'HUB' + Math.floor(1000 + Math.random() * 9000) + '@#';
      const expiraEm = new Date(new Date().getTime() + 7 * 60000); // <-- Alterado para 7 minutos
      setSenhaTemp({ codigo: novaSenha, expiraEm });
      registrarLog('Senha Provisória Gerada', 'Nova credencial temporária gerada (Validade: 7 minutos). Cliente forçado a trocar.', 'warning');
  };

  const enviarLinkRecuperacao = () => {
      triggerAcao('recuperaEmail', 'E-mail de recuperação enviado!');
      registrarLog('Recuperação de Senha Enviada', `Link enviado direto para o e-mail: ${clienteSelecionado.email}`, 'info');
  };

  const copiarLinkRecuperacao = () => {
      triggerAcao('copiaLink', 'Link copiado para a área de transferência!');
      registrarLog('Link de Recuperação Gerado', `Link copiado manualmente pelo gestor.`, 'info');
  };
  // Filtro de Aniversário no Diretório
  const [filtroMesAniv, setFiltroMesAniv] = useState('TODOS');
  const [modalSuspensao, setModalSuspensao] = useState({ isOpen: false, acao: 'SUSPENDER', motivo: '', arquivo: null }); // acao pode ser 'SUSPENDER' ou 'REATIVAR'
  
  // States Globais de UI
  const [savingState, setSavingState] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [showRevenue, setShowRevenue] = useState(false);
  const [showMetricsHelp, setShowMetricsHelp] = useState(false);
  const [showConfigHelp, setShowConfigHelp] = useState(false);

  // Filtros Dashboard Principal
  const [dashDateOpen, setDashDateOpen] = useState(false);
  const [dashDateRange, setDashDateRange] = useState({ start: '', end: '' });
  const [dashFilterText, setDashFilterText] = useState('Todo o Período');

  // Filtros Ranking
  const [rankDateOpen, setRankDateOpen] = useState(false);
  const [rankDateRange, setRankDateRange] = useState({ start: '', end: '' });
  const [topClientsCount, setTopClientsCount] = useState(5);
  const [maxLTVFiltro, setMaxLTVFiltro] = useState(''); 
  const [qtdProdutosFiltro, setQtdProdutosFiltro] = useState('');

  // Filtros Últimas Compras
  const [recentDateOpen, setRecentDateOpen] = useState(false);
  const [recentDateRange, setRecentDateRange] = useState({ start: '', end: '' });
  const [ultimasMaxCompra, setUltimasMaxCompra] = useState('');
  const [ultimasQtdProd, setUltimasQtdProd] = useState('');

  // Tabelas Globais
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatusCRM, setFiltroStatusCRM] = useState('TODOS');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); 
  const [registrosPage, setRegistrosPage] = useState(1);
  const [registrosPerPage, setRegistrosPerPage] = useState(10);

  // Paginacao da Timeline (Audit Log)
  const [timelinePage, setTimelinePage] = useState(1);
  const timelinePerPage = 10;
  const [timelineDateOpen, setTimelineDateOpen] = useState(false);
  const [timelineDateRange, setTimelineDateRange] = useState({ start: '', end: '' });

  // Estados Dinâmicos: Benefícios (Níveis VIP)
  const [niveisVIP, setNiveisVIP] = useState([
      { id: 1, nome: 'Bronze', gastoRequisito: "0", comprasRequisito: 0, multCoins: "1,0", descFrete: "0", descProdutos: "0", imagem: null, frequenciaUso: 'ILIMITADO', limiteUso: 0, acumulaFrete: false, isDefault: true },
      { id: 2, nome: 'Prata', gastoRequisito: "1000", comprasRequisito: 4, multCoins: "1,5", descFrete: "0", descProdutos: "5", imagem: null, frequenciaUso: 'ILIMITADO', limiteUso: 0, acumulaFrete: false, isDefault: false },
      { id: 3, nome: 'Ouro', gastoRequisito: "2500", comprasRequisito: 6, multCoins: "2,0", descFrete: "50", descProdutos: "10", imagem: null, frequenciaUso: 'MENSAL', limiteUso: 2, acumulaFrete: false, isDefault: false },
      { id: 4, nome: 'Diamante', gastoRequisito: "5000", comprasRequisito: 10, multCoins: "3,0", descFrete: "100", descProdutos: "15", imagem: null, frequenciaUso: 'MENSAL', limiteUso: 5, acumulaFrete: true, isDefault: false }
  ]);
  const defaultVIP = { id: 0, nome: '', gastoRequisito: "0", comprasRequisito: 0, multCoins: "1,0", descFrete: "0", descProdutos: "0", imagem: null, frequenciaUso: 'ILIMITADO', limiteUso: 0, acumulaFrete: false, isDefault: false };
  const [modalVIP, setModalVIP] = useState({ isOpen: false, isNovo: true, data: defaultVIP });

  // Estados Dinâmicos: Configurações Gerais
  const [config, setConfig] = useState({ permiteCadastro: true, aprovarComentarios: false, bloquearForaDoPais: false, loginApenasConvite: false });

  const handleSearchChange = (e) => { setSearchTerm(e.target.value); setCurrentPage(1); };
  const handleItemsPerPageChange = (e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); };

  // Trigger UX de Sucesso
  const triggerAcao = (actionId, successMessage) => {
    if (savingState) return;
    setSavingState(actionId);
    setTimeout(() => {
      setSavingState(null);
      setToast({ show: true, message: successMessage, status: 'success' });
      setTimeout(() => setToast({ show: false, message: '' }), 3000);
    }, 1500); 
  };

  const abrirPerfilCliente = (cliente) => {
      setClienteSelecionado(cliente);
      setCrmSubTab('RESUMO');
      setMainTab('CLIENTES (CRM)');
      setPerfilEmEdicao(false);
      setTimelinePage(1);
      setTimelineDateRange({start:'', end:''});
      if (typeof window !== 'undefined') { window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };
// --- LÓGICA DO CRONÔMETRO DE E-MAIL ---
  useEffect(() => {
      let timer;
      if (emailEditFlow.cooldown > 0) {
          timer = setInterval(() => {
              setEmailEditFlow(prev => ({ ...prev, cooldown: prev.cooldown - 1 }));
          }, 1000);
      }
      return () => clearInterval(timer);
  }, [emailEditFlow.cooldown]);
  // ==========================================
  // LÓGICA DE DADOS (FILTROS)
  // ==========================================
  const isDateInRange = (dateStr, range) => {
      if (!range.start || !range.end || !dateStr || dateStr === '-') return true;
      const d = new Date(dateStr).getTime();
      const s = new Date(range.start).getTime();
      const e = new Date(range.end).getTime() + 86399999; 
      return d >= s && d <= e;
  };

const clientesFiltrados = useMemo(() => {
    return mockClientesGerais.filter(c => {
      const matchBusca = safeStr(c?.nome).toLowerCase().includes(safeStr(searchTerm).toLowerCase()) || 
                         safeStr(c?.email).toLowerCase().includes(safeStr(searchTerm).toLowerCase()) ||
                         safeStr(c?.cpf).includes(safeStr(searchTerm)) || 
                         safeStr(c?.telefone).includes(safeStr(searchTerm));
      const matchStatus = filtroStatusCRM === 'TODOS' || safeStr(c?.status) === filtroStatusCRM;
      
      // Nova Lógica de Aniversário
      let matchAniversario = true;
      if (filtroMesAniv !== 'TODOS') {
          if (c.nascimento && c.nascimento !== '-') {
              // c.nascimento é YYYY-MM-DD, então quebramos e pegamos o Mês [1]
              const mesCliente = c.nascimento.split('-')[1]; 
              matchAniversario = (mesCliente === filtroMesAniv);
          } else {
              matchAniversario = false; // Se não tem data, não entra no filtro do mês
          }
      }

      return matchBusca && matchStatus && matchAniversario;
    });
  }, [searchTerm, filtroStatusCRM, filtroMesAniv]); // <-- Não esqueça de adicionar a dependência aqui

  const totalPages = Math.ceil((clientesFiltrados?.length || 0) / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const clientesPaginados = (clientesFiltrados || []).slice(indexOfFirstItem, indexOfLastItem);

  const rankingClientesList = useMemo(() => {
    return mockClientesGerais
      .filter(c => safeNum(c?.ltv) >= 1) 
      .filter(c => maxLTVFiltro === '' ? true : safeNum(c?.ltv) <= safeNum(maxLTVFiltro))
      .filter(c => safeNum(c?.produtosComprados) >= 1) 
      .filter(c => qtdProdutosFiltro === '' ? true : safeNum(c?.produtosComprados) <= safeNum(qtdProdutosFiltro))
      .filter(c => isDateInRange(c.ultimaCompra, rankDateRange))
      .sort((a, b) => safeNum(b?.ltv) - safeNum(a?.ltv))
      .slice(0, safeNum(topClientsCount) || 5);
  }, [topClientsCount, maxLTVFiltro, qtdProdutosFiltro, rankDateRange]);

  const ultimasComprasListFiltrada = useMemo(() => {
    return mockClientesGerais
      .filter(c => c?.primeiraCompraFeita && safeNum(c?.ultimaCompraValor) >= 1) 
      .filter(c => ultimasMaxCompra === '' ? true : safeNum(c?.ultimaCompraValor) <= safeNum(ultimasMaxCompra))
      .filter(c => safeNum(c?.produtosComprados) >= 1) 
      .filter(c => ultimasQtdProd === '' ? true : safeNum(c?.produtosComprados) <= safeNum(ultimasQtdProd))
      .filter(c => isDateInRange(c.ultimaCompra, recentDateRange))
      .sort((a, b) => new Date(safeStr(b?.ultimaCompra)).getTime() - new Date(safeStr(a?.ultimaCompra)).getTime() || safeNum(b?.id) - safeNum(a?.id));
  }, [ultimasMaxCompra, ultimasQtdProd, recentDateRange]);

  const totalRegistrosPages = Math.ceil((ultimasComprasListFiltrada?.length || 0) / registrosPerPage) || 1;
  const registrosPaginados = (ultimasComprasListFiltrada || []).slice((registrosPage - 1) * registrosPerPage, registrosPage * registrosPerPage);

  const ltvMedioCRM = mockClientesGerais.length > 0 ? (mockClientesGerais.reduce((acc, c) => acc + safeNum(c?.ltv), 0) / mockClientesGerais.length) : 0;
  const comprasTotaisCRM = mockClientesGerais.reduce((acc, c) => acc + safeNum(c?.compras), 0);
  const cashbackTotalCRM = mockClientesGerais.reduce((acc, c) => acc + safeNum(c?.cashback), 0);
  const coinsTotaisCRM = mockClientesGerais.reduce((acc, c) => acc + safeNum(c?.coins), 0);

  // Lógica Timeline Cliente
  const auditLogsFiltrados = useMemo(() => {
      if(!clienteSelecionado || !clienteSelecionado.auditLogs) return [];
      return clienteSelecionado.auditLogs
        .filter(log => {
            // A data do log vem em formato ISO, cortamos apenas o YYYY-MM-DD para o filtro básico
            const dateStr = log.data.split('T')[0];
            return isDateInRange(dateStr, timelineDateRange);
        })
        .sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [clienteSelecionado, timelineDateRange]);

  const totalTimelinePages = Math.ceil(auditLogsFiltrados.length / timelinePerPage) || 1;
  const auditLogsPaginados = auditLogsFiltrados.slice((timelinePage - 1) * timelinePerPage, timelinePage * timelinePerPage);

  // ==========================================
  // HELPERS UI E RENDERIZADORES COMPARTILHADOS
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
      const rank = niveisVIP.find(n => safeStr(n.nome).toLowerCase() === safeStr(rankNome).toLowerCase());
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
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-500 border border-slate-200 shrink-0 shadow-sm">{getAvatarInitials(c?.nome)}</div>
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

  // ==========================================
  // FUNÇÕES DE AÇÕES DO PERFIL (Tags, Bloqueio, VIP)
  // ==========================================
  const adicionarTag = () => {
      if (novaTag.trim() && clienteSelecionado) {
          if (!clienteSelecionado.tags.includes(novaTag.trim())) {
              setClienteSelecionado(prev => ({ ...prev, tags: [...prev.tags, novaTag.trim()] }));
          }
          setNovaTag('');
      }
  };
  const removerTag = (tag) => {
      if (clienteSelecionado) {
          setClienteSelecionado(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
      }
  };

  const handleConfirmarSuspensao = () => {
      if (!modalSuspensao.motivo.trim()) return alert("O motivo é obrigatório para manter o registro de auditoria.");
      
      const novoStatus = modalSuspensao.acao === 'SUSPENDER' ? 'INATIVO' : 'ATIVO';
      triggerAcao('bloqueio', modalSuspensao.acao === 'SUSPENDER' ? 'Conta suspensa e log registrado.' : 'Conta reativada com sucesso.');
      
      setTimeout(() => { 
          // Adiciona log na timeline mock
          const newLog = {
              id: Date.now(),
              data: new Date().toISOString(),
              titulo: modalSuspensao.acao === 'SUSPENDER' ? 'Conta Suspensa / Bloqueada' : 'Conta Reativada pelo Admin',
              desc: `Motivo: ${modalSuspensao.motivo}`,
              tipo: modalSuspensao.acao === 'SUSPENDER' ? 'warning' : 'success'
          };
          setClienteSelecionado(prev => ({ 
              ...prev, 
              status: novoStatus,
              auditLogs: [newLog, ...prev.auditLogs]
          })); 
          setModalSuspensao({ isOpen: false, acao: 'SUSPENDER', motivo: '', arquivo: null });
      }, 1500);
  };

  // Funções VIP Modal
  const abrirNovoVIP = () => setModalVIP({ isOpen: true, isNovo: true, data: { ...defaultVIP, id: Date.now() } });
  const editarVIP = (nivel) => setModalVIP({ isOpen: true, isNovo: false, data: { ...nivel } });
  const fecharModalVIP = () => setModalVIP({ isOpen: false, isNovo: true, data: defaultVIP });

  const handleVIPImageUpload = (e) => {
      const file = e.target.files[0];
      if(file) setModalVIP(prev => ({ ...prev, data: { ...prev.data, imagem: URL.createObjectURL(file) } }));
  };

  const salvarVIP = () => {
      const data = modalVIP.data;
      if (!data.nome.trim()) return alert("O nome do nível é obrigatório.");
      
      const gasto = parseCommaFloat(data.gastoRequisito);
      const compras = safeNum(data.comprasRequisito);

      if (!data.isDefault && gasto <= 0 && compras <= 0) {
          return alert("Regra inválida. Defina pelo menos um requisito maior que zero (Valor em Gastos ou Qtd de Compras).");
      }
      const hasDuplicate = niveisVIP.some(n => n.id !== data.id && parseCommaFloat(n.gastoRequisito) === gasto && safeNum(n.comprasRequisito) === compras);
      if (hasDuplicate) {
          return alert("Conflito de Regras: Já existe um Nível VIP com exatamente esses mesmos requisitos.");
      }

      let updatedList = [...niveisVIP];
      if (data.isDefault) updatedList = updatedList.map(n => ({ ...n, isDefault: false }));

      if (modalVIP.isNovo) updatedList.push(data);
      else updatedList = updatedList.map(n => n.id === data.id ? data : n);

      updatedList.sort((a,b) => parseCommaFloat(a.gastoRequisito) - parseCommaFloat(b.gastoRequisito));
      setNiveisVIP(updatedList);
      fecharModalVIP();
  };

  const excluirVIP = (id) => {
      if(window.confirm("Deseja realmente excluir este nível de Benefício?")) {
          setNiveisVIP(niveisVIP.filter(n => n.id !== id));
      }
  };


  // ============================================================================
  // RENDER MODULAR: DASHBOARD PAINEL
  // ============================================================================
  const renderPainel = () => (
    <FadeIn key="painel" className="space-y-6">
      
      {/* Cabeçalho Isolado */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-50">
         <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Inteligência de Clientes</h2>
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

      {/* HORIZONTAL KPI CARD GROUP LAYOUT */}
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
                      {showRevenue ? formatSmartCurrency(12345000, true) : formatSmartCurrency(12345000, false)}
                  </h3>
              </div>
              <div className="pt-3 border-t border-blue-100/50 flex items-center justify-between relative z-10 mt-auto">
                  <div>
                      <p className="text-[11px] text-slate-500 font-medium">Ticket Médio Geral</p>
                      <p className="text-sm font-bold text-slate-800">R$ 145,00</p>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 shadow-sm">
                      <Icons.TrendingUp className="w-3.5 h-3.5" /> +18.4%
                  </div>
              </div>
          </div>
          <div className="flex-1 p-6 flex flex-col justify-center hover:bg-slate-50/50 transition-colors">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Clientes Totais</span>
              <span className="text-3xl font-black text-slate-800">{Number(8249).toLocaleString('pt-BR')}</span>
              <p className="text-[10px] text-slate-500 mt-1 font-medium flex items-center gap-1"><span className="text-emerald-600 font-bold">+12%</span> este mês</p>
          </div>
          <div className="flex-1 p-6 flex flex-col justify-center hover:bg-slate-50/50 transition-colors">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Pedidos Totais</span>
              <span className="text-3xl font-black text-slate-800">{Number(24500).toLocaleString('pt-BR')}</span>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">Histórico global</p>
          </div>
          <div className="flex-1 p-6 flex flex-col justify-center hover:bg-slate-50/50 transition-colors">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">LTV Médio</span>
              <span className="text-3xl font-black text-emerald-600">{formatSmartCurrency(842.50)}</span>
              <p className="text-[10px] text-slate-500 mt-1 font-medium flex items-center gap-1"><span className="text-emerald-600 font-bold">+R$ 24,00</span> vs mês ant.</p>
          </div>
      </div>

      {/* Ranking Top LTV */}
      <section className="bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden relative z-0">
        <header className="p-6 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-3">
                <span className="text-yellow-500"><Icons.Trophy className="w-5 h-5"/></span> Ranking de Clientes (Maior LTV)
            </h3>
            <p className="text-xs text-slate-500 mt-1">Visão detalhada de consumo dos melhores parceiros.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="relative z-50">
                <HoverProgressRoundButton 
                    text={rankDateRange.start ? `${formatDateBR(rankDateRange.start)} até ${formatDateBR(rankDateRange.end)}` : 'Todo o Período'}
                    onClick={() => setRankDateOpen(!rankDateOpen)} 
                    icon={Icons.Calendar} 
                    ariaLabel="Filtrar Período Ranking"
                    loading={savingState === 'filtroRank'} 
                />
                <DateFilterPopup 
                    isOpen={rankDateOpen} onClose={() => setRankDateOpen(false)}
                    dateRange={rankDateRange} setDateRange={setRankDateRange} loading={savingState === 'filtroRank'}
                    onClear={() => { setRankDateRange({start:'',end:''}); setRankDateOpen(false); }}
                    onApply={() => { triggerAcao('filtroRank', 'Ranking Atualizado!'); setRankDateOpen(false); }}
                />
            </div>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl shadow-sm flex-1 sm:flex-auto">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Qtd Até:</span>
              <input type="number" placeholder="Ilimitado" min="1" value={qtdProdutosFiltro} onChange={(e) => setQtdProdutosFiltro(e.target.value)} className="w-16 text-xs font-bold text-slate-900 bg-transparent outline-none focus:border-blue-500" />
            </div>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl shadow-sm flex-1 sm:flex-auto">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">LTV Até R$:</span>
              <input type="number" placeholder={`Máx: ${MAX_LTV_GERAL}`} min="1" value={maxLTVFiltro} onChange={(e) => setMaxLTVFiltro(e.target.value)} className="w-24 text-xs font-bold text-slate-900 bg-transparent outline-none focus:border-blue-500" title="Digita o valor máximo de LTV para filtrar" />
            </div>
            <select aria-label="Quantidade de Clientes do Ranking" value={topClientsCount} onChange={(e) => setTopClientsCount(Number(e.target.value))} className="bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer shadow-sm transition-all">
              <option value={5}>Exibir 5</option><option value={10}>Exibir 10</option>
            </select>
          </div>
        </header>
        <div className="overflow-x-auto w-full custom-scrollbar">
          <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap min-w-[1000px]">
            <thead className="bg-slate-50/50 text-slate-500 uppercase font-bold text-[10px] tracking-widest border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Cliente / Status</th>
                <th className="px-6 py-4 text-right">Valor de Compra</th>
                <th className="px-6 py-4 text-center">Qtd. Produtos</th>
                <th className="px-6 py-4">Última Compra</th>
                <th className="px-6 py-4 text-center">Cupons Usados</th>
                <th className="px-6 py-4 text-right">Desc. Frete</th>
                <th className="px-6 py-4 text-right">Desc. Loja</th>
                <th className="px-6 py-4 text-right">Coins Ganhos</th>
              </tr>
            </thead>
            <motion.tbody variants={containerVariants} initial="hidden" animate="show" className="divide-y divide-slate-100">
              {rankingClientesList.length > 0 ? rankingClientesList.map((c, idx) => (
                <motion.tr variants={itemVariants} key={c.id} className="hover:bg-slate-50 cursor-pointer transition-colors group" onClick={() => abrirPerfilCliente(c)}>
                  <td className="px-6 py-4">{renderClienteCell(c)}</td>
                  <td className="px-6 py-4 text-right font-black text-emerald-600 text-base">{formatCurrency(c?.ltv)}</td>
                  <td className="px-6 py-4 text-center font-bold text-slate-800">{safeNum(c?.produtosComprados)}</td>
                  <td className="px-6 py-4 text-slate-500 font-medium">{formatDateBR(c?.ultimaCompra)}</td>
                  <td className="px-6 py-4 text-center font-bold text-slate-700">{safeNum(c?.cuponsUsados)}</td>
                  <td className="px-6 py-4 text-right text-rose-500 font-medium">{formatCurrency(c?.descontoFrete)}</td>
                  <td className="px-6 py-4 text-right text-rose-500 font-medium">{formatCurrency(c?.descontoLoja)}</td>
                  <td className="px-6 py-4 text-right font-black text-yellow-600">+{safeNum(c?.coins)}</td>
                </motion.tr>
              )) : (<tr><td colSpan="8" className="p-16 text-center text-slate-500 font-medium">Nenhum cliente atende aos filtros atuais.</td></tr>)}
            </motion.tbody>
          </table>
        </div>
      </section>

      {/* Tabela de Últimas Compras */}
      <section className="bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden relative z-0">
        <header className="p-6 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-3"><span className="text-blue-500"><Icons.Package className="w-5 h-5"/></span> Registros de Compra</h3>
            <p className="text-xs text-slate-500 mt-1">Visão em tempo real das conversões mais recentes.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="relative z-50">
              <HoverProgressRoundButton 
                  text={recentDateRange.start ? `${formatDateBR(recentDateRange.start)} até ${formatDateBR(recentDateRange.end)}` : 'Todo o Período'}
                  onClick={() => setRecentDateOpen(!recentDateOpen)} 
                  icon={Icons.Calendar} 
                  ariaLabel="Filtrar Período Recentes"
                  loading={savingState === 'filtroRecent'} 
              />
              <DateFilterPopup 
                isOpen={recentDateOpen} onClose={() => setRecentDateOpen(false)}
                dateRange={recentDateRange} setDateRange={setRecentDateRange} loading={savingState === 'filtroRecent'}
                onClear={() => { setRecentDateRange({start:'',end:''}); setRecentDateOpen(false); }}
                onApply={() => { triggerAcao('filtroRecent', 'Lista Atualizada!'); setRecentDateOpen(false); }}
              />
            </div>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl shadow-sm flex-1 sm:flex-auto">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Qtd Até:</span>
              <input type="number" placeholder="Ilimitado" min="1" value={ultimasQtdProd} onChange={(e) => setUltimasQtdProd(e.target.value)} className="w-16 text-xs font-bold text-slate-900 bg-transparent outline-none focus:border-blue-500" />
            </div>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl shadow-sm flex-1 sm:flex-auto">
              <label htmlFor="compra_ultimas" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Valor Até R$:</label>
              <input id="compra_ultimas" type="number" placeholder={`Máx: ${MAX_COMPRA_GERAL}`} min="1" value={ultimasMaxCompra} onChange={(e) => setUltimasMaxCompra(e.target.value)} className="w-24 text-xs font-bold text-slate-900 bg-transparent outline-none focus:border-blue-500" />
            </div>
          </div>
        </header>
        
        <div className="overflow-x-auto w-full custom-scrollbar">
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
            <motion.tbody variants={containerVariants} initial="hidden" animate="show" className="divide-y divide-slate-100">
              {registrosPaginados.length > 0 ? registrosPaginados.map(c => (
                <motion.tr variants={itemVariants} key={`uc-${c.id}`} className="hover:bg-slate-50 cursor-pointer transition-colors group" onClick={() => abrirPerfilCliente(c)}>
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
              )) : (<tr><td colSpan="9" className="p-16 text-center text-slate-500 font-medium">Nenhum registo atende aos filtros atuais.</td></tr>)}
            </motion.tbody>
          </table>
        </div>

        {ultimasComprasListFiltrada.length > 0 && (
            <footer className="p-6 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center text-xs font-bold text-slate-500 gap-4">
                <div className="flex items-center gap-2">
                    <span>Exibir:</span>
                    <select value={registrosPerPage} onChange={(e) => {setRegistrosPerPage(Number(e.target.value)); setRegistrosPage(1);}} className="bg-white border border-slate-200 text-slate-700 rounded-lg px-2 py-1 outline-none cursor-pointer focus:border-blue-500 transition-all shadow-sm">
                        <option value={10}>10</option><option value={20}>20</option><option value={30}>30</option><option value={50}>50</option>
                    </select>
                    <span className="ml-4">Mostrando <strong className="text-slate-800">{((registrosPage - 1) * registrosPerPage) + 1}</strong> até <strong className="text-slate-800">{Math.min(registrosPage * registrosPerPage, ultimasComprasListFiltrada.length)}</strong> de <strong className="text-slate-800">{ultimasComprasListFiltrada.length}</strong> compras</span>
                </div>
                <div className="flex items-center gap-4">
                    <span>Página {registrosPage} de {totalRegistrosPages}</span>
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

  // ============================================================================
  // RENDER MODULAR: LISTA CRM (DIRETÓRIO)
  // ============================================================================
  const renderClientesCRMLista = () => (
    <FadeIn key="diretorio" className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col min-h-[600px] relative z-0">
        <header className="p-6 border-b border-slate-200 bg-slate-50/50 rounded-t-3xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3"><span className="text-blue-500"><Icons.UsersIcon className="w-5 h-5"/></span> Diretório de Clientes</h3>
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

  // ============================================================================
  // RENDER MODULAR: PERFIL CRM (CUSTOMER 360 VIEW)
  // ============================================================================
  const renderClientesCRMPerfil = () => (
    <FadeIn key="crm_perfil" className="space-y-6">
      
      <div className="flex items-center gap-4">
          <button onClick={() => setClienteSelecionado(null)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 font-bold text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors">
              <Icons.ChevronLeft className="w-4 h-4" /> Voltar ao Diretório
          </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative z-0">
        <div className="h-24 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100 relative">
             {clienteSelecionado?.status === 'INATIVO' && <div className="absolute inset-0 bg-rose-500/10"></div>}
        </div>
        <header className="px-8 pb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 relative -mt-12">
          <div className="flex items-end gap-6">
            <div className="w-24 h-24 rounded-3xl bg-white border-4 border-white flex items-center justify-center font-black text-4xl text-blue-600 shadow-md">
              {getAvatarInitials(clienteSelecionado?.nome)}
            </div>
            <div className="pb-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {getStatusClienteBadge(clienteSelecionado?.status)}
                {getRankIndicator(clienteSelecionado?.rank)}
                {clienteSelecionado?.tags?.map((tag, i) => (
                   <span key={i} className="flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm"><Icons.Tag className="w-3 h-3"/> {tag} <button onClick={()=>removerTag(tag)} aria-label="Remover Tag" className="ml-1 text-slate-400 hover:text-rose-500"><Icons.Close className="w-3 h-3"/></button></span>
                ))}
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{safeStr(clienteSelecionado?.nome)}</h2>
              <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-4">
                  <span>{safeStr(clienteSelecionado?.email)}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span>Membro desde {formatDateBR(clienteSelecionado?.dataCadastro)}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 pb-1 w-full lg:w-auto">
            <button 
                onClick={() => {
                    setCrmSubTab('RESUMO'); // Direciona para a aba certa
                    setPerfilEmEdicao(!perfilEmEdicao); // Alterna o modo de edição
                }} 
                className={`flex-1 lg:flex-none px-4 py-2.5 bg-white border ${perfilEmEdicao ? 'border-blue-300 text-blue-600 bg-blue-50' : 'border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600'} rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2`}
            >
                {perfilEmEdicao ? <Icons.Close className="w-4 h-4" /> : <Icons.Edit3 className="w-4 h-4" />} 
                {perfilEmEdicao ? 'Cancelar Edição' : 'Editar Perfil'}
            </button>
             {clienteSelecionado?.status === 'INATIVO' ? (
                 <ProgressButton 
                    onClick={() => setModalSuspensao({ isOpen: true, acao: 'REATIVAR', motivo: '', arquivo: null })} 
                    text="Reativar Conta" 
                    icon={Icons.Check}
                    className="flex-1 lg:flex-none px-4 py-2.5 bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-50 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
                 />
             ) : (
                 <ProgressButton 
                    onClick={() => setModalSuspensao({ isOpen: true, acao: 'SUSPENDER', motivo: '', arquivo: null })} 
                    text="Suspender" 
                    icon={Icons.AlertTriangle}
                    className="flex-1 lg:flex-none px-4 py-2.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
                 />
             )}
          </div>
        </header>

        <nav className="flex px-8 border-t border-slate-100 bg-slate-50/50 shrink-0 overflow-x-auto custom-scrollbar relative" aria-label="Abas do Perfil">
          {['RESUMO', 'CARTEIRAS (LIVRO RAZÃO)', 'ENDEREÇOS', 'TIMELINE (AUDIT)'].map((tab) => (
            <button type="button" key={tab} aria-label={`Aba ${tab}`} aria-current={crmSubTab === tab ? "page" : undefined} onClick={() => setCrmSubTab(tab)} className={`relative px-6 py-5 text-xs font-bold tracking-wider whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 ${crmSubTab === tab ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>
              {tab}
              {crmSubTab === tab && <motion.div layoutId="crmActiveTab" className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-500 rounded-t-full" />}
            </button>
          ))}
        </nav>
      </div>
      <AnimatePresence mode="wait">

        {crmSubTab === 'RESUMO' && !perfilEmEdicao && (
          <motion.section key="RESUMO_READ" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col lg:flex-row gap-6">
            
            {/* SIDEBAR DO PERFIL */}
            <div className="w-full lg:w-1/3 flex flex-col gap-6">
                <article className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2"><Icons.UserCircle className="w-5 h-5 text-slate-400" /> Sobre o Cliente</h4>
                    <div className="space-y-4">
                        <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Telefone / WhatsApp:</p><p className="text-sm font-bold text-slate-800 mt-1">{safeStr(clienteSelecionado?.telefone)}</p></div>
                        <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CPF:</p><p className="text-sm font-bold text-slate-800 mt-1">{safeStr(clienteSelecionado?.cpf)}</p></div>
                        <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Data de Nascimento:</p><p className="text-sm font-bold text-slate-800 mt-1">{formatDateBR(clienteSelecionado?.nascimento)}</p></div>
                        {/* NOVO CAMPO DE SEXO AQUI */}
                        <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sexo:</p><p className="text-sm font-bold text-slate-800 mt-1">{safeStr(clienteSelecionado?.sexo) || 'Não informado'}</p></div>
                        
                        <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Origem:</p><p className="text-sm font-bold text-slate-800 mt-1">{safeStr(clienteSelecionado?.origem)}</p></div>
                    </div>
                    
                    <div className="mt-6 pt-5 border-t border-slate-100">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Etiquetas (Tags Manuais)</label>
                        <div className="flex gap-2">
                           <input type="text" placeholder="Nova tag..." value={novaTag} onChange={(e)=>setNovaTag(e.target.value)} onKeyPress={(e)=> e.key === 'Enter' && adicionarTag()} aria-label="Adicionar Tag" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800" />
                           <button onClick={adicionarTag} aria-label="Adicionar" className="bg-blue-50 text-blue-600 border border-blue-200 rounded-xl px-3 text-xs font-bold hover:bg-blue-100 transition-colors shadow-sm">Add</button>
                        </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-slate-100">
                        <a href={`https://wa.me/${safeStr(clienteSelecionado?.telefone).replace(/\D/g, '')}`} target="_blank" rel="noreferrer" aria-label="Falar no WhatsApp" className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#25D366] hover:bg-[#1ebd5a] text-white text-sm font-bold rounded-xl shadow-sm transition-colors"><Icons.WhatsApp className="w-5 h-5"/> Falar no WhatsApp</a>
                    </div>
                </article>

                <article className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Icons.FileText className="w-5 h-5 text-slate-400" /> Anotações Internas</h4>
                        <ProgressButton onClick={() => triggerAcao('notas', 'Anotações salvas com sucesso!')} loading={savingState === 'notas'} text="Salvar" loadingText="..." className="text-blue-600 hover:text-white font-bold bg-blue-50 hover:bg-blue-600 border border-blue-200 hover:border-transparent px-3 py-1.5 rounded-lg transition-colors text-xs shadow-sm" />
                    </div>
                    <textarea 
                        className="w-full flex-1 min-h-[120px] bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none shadow-inner" 
                        defaultValue={clienteSelecionado?.notas} 
                        onChange={(e) => setClienteSelecionado({...clienteSelecionado, notas: e.target.value})}
                        aria-label="Anotações Internas"
                        placeholder="Adicione observações sobre este cliente. Visível apenas para gestores."
                    />
                </article>
            </div>

            {/* ÁREA PRINCIPAL DO PERFIL */}
            <div className="w-full lg:w-2/3 flex flex-col gap-6">
                
                {/* Mini Dashboard Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <article className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
                      <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl pointer-events-none"></div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Gasto Total (LTV)</p>
                      <p className="text-3xl font-black text-emerald-600 relative z-10">{formatCurrency(clienteSelecionado?.ltv)}</p>
                      <p className="text-[10px] text-slate-500 mt-2 font-medium">Ticket Médio: <span className="font-bold text-slate-700">{formatCurrency(safeNum(clienteSelecionado?.ltv) / (safeNum(clienteSelecionado?.compras) || 1))}</span></p>
                   </article>
                   <article className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pedidos Finalizados</p>
                      <p className="text-3xl font-black text-slate-800">{safeNum(clienteSelecionado?.compras)}</p>
                      <p className="text-[10px] text-slate-500 mt-2 font-medium">Última compra: <span className="font-bold text-slate-700">{formatDateBR(clienteSelecionado?.ultimaCompra)}</span></p>
                   </article>
                   <article className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Uso de Benefícios</p>
                      <div className="mt-1 space-y-1">
                          <p className="text-xs text-slate-600 font-medium flex justify-between">Cupons: <strong className="text-slate-800">{safeNum(clienteSelecionado?.cuponsUsados)}</strong></p>
                          <p className="text-xs text-slate-600 font-medium flex justify-between">Desc Frete: <strong className="text-emerald-600">{formatCurrency(clienteSelecionado?.descontoFrete)}</strong></p>
                          <p className="text-xs text-slate-600 font-medium flex justify-between">Desc Loja: <strong className="text-emerald-600">{formatCurrency(clienteSelecionado?.descontoLoja)}</strong></p>
                      </div>
                   </article>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                  <article className="bg-gradient-to-br from-blue-50/50 to-white p-6 rounded-3xl border border-blue-100 shadow-sm flex flex-col relative overflow-hidden">
                     <div className="absolute right-0 bottom-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
                     <h4 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2 relative z-10">Classificação Automática CRM</h4>
                     <div className="flex items-center gap-2 mt-3 mb-4 relative z-10">
                       {getRankIndicator(clienteSelecionado?.rank)}
                     </div>
                     <p className="text-[11px] text-slate-600 leading-relaxed font-medium mt-auto relative z-10">O nível do cliente é atribuído automaticamente pelo algoritmo com base nos requisitos da loja. O cliente possui os benefícios associados a esta badge.</p>
                  </article>
                  
                  <article className="bg-rose-50/30 p-6 rounded-3xl border border-rose-100 shadow-sm flex flex-col">
                     <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-rose-800 flex items-center gap-2"><Icons.AlertTriangle className="w-5 h-5 text-rose-500"/> Alertas de Risco</h4>
                     </div>
                     <p className="text-[11px] text-slate-600 mb-4 leading-relaxed font-medium">Comportamento de compra avaliado. O sistema detecta automaticamente padrões de fraude.</p>
                     
                     <div className="bg-white rounded-xl p-3 border border-rose-100 mb-4 shadow-sm">
                         <div className="flex justify-between items-center mb-1">
                             <span className="text-[10px] uppercase font-bold text-slate-400">Risco Chargeback</span>
                             <span className="text-xs font-black text-emerald-600">Baixo</span>
                         </div>
                         <div className="flex justify-between items-center border-t border-slate-50 pt-1 mt-1">
                             <span className="text-[10px] font-bold text-slate-400">Produtos Reembolsados</span>
                             <span className="text-xs font-bold text-slate-700">{safeNum(clienteSelecionado?.produtosReembolsados)} un.</span>
                         </div>
                         <div className="flex justify-between items-center border-t border-slate-50 pt-1 mt-1">
                             <span className="text-[10px] font-bold text-slate-400">Total Pago (Reembolsos)</span>
                             <span className="text-xs font-bold text-rose-500">{formatCurrency(clienteSelecionado?.reembolsosPagos * 120)}</span>
                         </div>
                     </div>

                     <div className="mt-auto border-t border-rose-100/50 pt-4">
                        <ProgressButton 
                           onClick={() => setModalSuspensao({ isOpen: true, acao: 'SUSPENDER', motivo: 'Suspeita de Fraude Identificada pelo Gestor', arquivo: null })}
                           text="Relatar Fraude / Bloquear Conta" icon={Icons.AlertTriangle} 
                           className="w-full px-5 py-2.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold rounded-xl text-xs shadow-sm transition-colors flex items-center justify-center gap-2" 
                        />
                     </div>
                  </article>
                </div>
            </div>

            {/* OVERLAY: MODAL DE SUSPENSÃO / REATIVAÇÃO MANTIDO NESTA TELA */}
            <AnimatePresence>
                {modalSuspensao.isOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="modal-suspend-title">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalSuspensao({...modalSuspensao, isOpen: false})} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-lg relative z-10 border border-slate-200">
                            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${modalSuspensao.acao === 'SUSPENDER' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                    {modalSuspensao.acao === 'SUSPENDER' ? <Icons.AlertTriangle className="w-6 h-6" /> : <Icons.Check className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 id="modal-suspend-title" className="text-xl font-black text-slate-800">
                                        {modalSuspensao.acao === 'SUSPENDER' ? 'Suspender Conta do Cliente' : 'Reativar Conta do Cliente'}
                                    </h3>
                                    <p className="text-[11px] text-slate-500 font-medium mt-1">Esta ação exige um motivo formal e ficará salva no Audit Log.</p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 block mb-2">Motivo Obrigatório *</label>
                                    <textarea 
                                        value={modalSuspensao.motivo} 
                                        onChange={(e) => setModalSuspensao({...modalSuspensao, motivo: e.target.value})}
                                        className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none shadow-inner"
                                        placeholder={`Especifique detalhadamente por que a conta está sendo ${modalSuspensao.acao === 'SUSPENDER' ? 'suspensa/bloqueada' : 'reativada'}...`}
                                    />
                                </div>

                                {modalSuspensao.acao === 'SUSPENDER' && (
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 block mb-2">Anexar Prova / Print (Opcional, máx 3MB)</label>
                                        <label className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 rounded-xl p-6 cursor-pointer transition-colors shadow-sm">
                                            <Icons.Upload className="w-6 h-6 text-slate-400" />
                                            <span className="text-sm font-bold text-slate-600">Clique para selecionar imagem</span>
                                            <span className="text-[10px] text-slate-400">Suporta JPG, PNG. O arquivo será higienizado e comprimido.</span>
                                            <input type="file" accept="image/*" className="hidden" />
                                        </label>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 mt-8 pt-6 border-t border-slate-100">
                                <button onClick={() => setModalSuspensao({...modalSuspensao, isOpen: false})} className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 font-bold py-3.5 rounded-xl hover:bg-slate-100 transition-colors shadow-sm">Cancelar</button>
                                <ProgressButton 
                                    onClick={handleConfirmarSuspensao} 
                                    loading={savingState === 'bloqueio'} 
                                    text={modalSuspensao.acao === 'SUSPENDER' ? 'Confirmar Suspensão' : 'Confirmar Reativação'} 
                                    loadingText="Registrando..." 
                                    className={`flex-1 text-white font-bold py-3.5 rounded-xl shadow-sm transition-colors ${modalSuspensao.acao === 'SUSPENDER' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`} 
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
          </motion.section>
        )}

{crmSubTab === 'RESUMO' && perfilEmEdicao && (
          <motion.section key="EDITAR_PERFIL" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 w-full max-w-4xl mx-auto flex flex-col">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                  <div>
                      <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Icons.Edit3 className="w-6 h-6 text-blue-500" /> Editar Informações do Cliente</h3>
                      <p className="text-xs text-slate-500 font-medium mt-1">Atualize os dados sensíveis, contatos e preferências do cliente diretamente no perfil.</p>
                  </div>
              </div>

              <div className="space-y-8">
                {/* Info Leitura */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 relative">
                      <div className="absolute top-4 right-5 hidden sm:block">
                          <span className="text-[9px] bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg font-bold uppercase">Bloqueado no CRM</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-1">
                          <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nome Completo</label>
                              <input type="text" value={clienteSelecionado?.nome || ''} disabled className="w-full bg-transparent border-none p-0 text-base font-black text-slate-700 focus:ring-0 cursor-not-allowed" />
                          </div>
                          <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Gênero</label>
                              <input type="text" value={clienteSelecionado?.sexo || 'Não informado'} disabled className="w-full bg-transparent border-none p-0 text-base font-black text-slate-700 focus:ring-0 cursor-not-allowed" />
                          </div>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 mt-3 pt-3 border-t border-slate-200"><Icons.Info className="w-3 h-3 inline mr-1" /> Apenas o cliente pode alterar esses dados no próprio painel.</p>
                  </div>

                  {/* FLUXO 1: E-MAIL */}
                  <div className="border-t border-slate-100 pt-8">
                      <div className="flex items-center justify-between mb-4">
                          <label className="text-sm font-bold text-slate-800">Autenticação (E-mail Principal)</label>
                          {!emailFlow.ativo && (
                              <button onClick={() => setEmailFlow(prev => ({...prev, ativo: true}))} className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">Solicitar Alteração</button>
                          )}
                      </div>
                      
                      {!emailFlow.ativo ? (
                          <p className="text-sm font-medium text-slate-600">{clienteSelecionado?.email}</p>
                      ) : (
                          <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl space-y-4">
                              {emailFlow.step === 1 ? (
                                  <div className="flex gap-3 items-end">
                                      <div className="flex-1">
                                          <label className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block mb-1.5">Passo 1: Motivo da Alteração *</label>
                                          <input type="text" value={emailFlow.motivo} onChange={e => setEmailFlow({...emailFlow, motivo: e.target.value})} placeholder="Ex: Cliente perdeu acesso ao e-mail antigo" className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-800 shadow-sm" />
                                      </div>
                                      <ProgressButton onClick={avancarEmailStep2} text="Prosseguir" icon={Icons.ChevronRight} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-sm transition-colors" />
                                  </div>
                              ) : (
                                  <div className="space-y-4">
                                      <div className="flex gap-3 items-end">
                                          <div className="flex-1">
                                              <label className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block mb-1.5">Passo 2: Novo E-mail do Cliente</label>
                                              <input type="email" value={emailFlow.novoEmail} onChange={e => setEmailFlow({...emailFlow, novoEmail: e.target.value})} placeholder="novo@email.com" className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-800 shadow-sm" />
                                          </div>
                                          <ProgressButton 
                                              onClick={enviarCodigoEmail} 
                                              loading={savingState === 'envioEmailCode'} 
                                              disabled={emailEditFlow.cooldown > 0 || (emailEditFlow.lockedUntil && new Date() < emailEditFlow.lockedUntil)}
                                              text={(emailEditFlow.lockedUntil && new Date() < emailEditFlow.lockedUntil) ? 'Bloqueado (5m)' : emailEditFlow.cooldown > 0 ? `Aguarde ${emailEditFlow.cooldown}s` : 'Enviar Código'} 
                                              loadingText="..." 
                                              icon={emailEditFlow.cooldown > 0 ? Icons.Spinner : Icons.Mail} 
                                              className={`py-2.5 px-5 font-bold rounded-xl text-xs shadow-sm transition-colors ${emailEditFlow.cooldown > 0 ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`} 
                                          />
                                      </div>
                                      <p className="text-[10px] text-blue-600 font-medium leading-tight"><Icons.Info className="w-3 h-3 inline mr-1" />O cliente receberá um link neste novo e-mail para validar. A alteração no painel ocorrerá instantaneamente após a confirmação do cliente.</p>
                                  </div>
                              )}
                          </div>
                      )}
                  </div>

                  {/* FLUXO 2: TELEFONE */}
                  <div className="border-t border-slate-100 pt-8">
                      <label className="text-sm font-bold text-slate-800 block mb-4">Contato Telefônico (WhatsApp)</label>
                      <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Novo Número</label>
                              <input type="text" value={phoneFlow.novoTelefone} onChange={e => setPhoneFlow({...phoneFlow, novoTelefone: e.target.value})} placeholder={clienteSelecionado?.telefone} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-800 transition-all shadow-sm" />
                          </div>
                          <div className="flex-[2]">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Motivo Obrigatório p/ Auditoria *</label>
                              <div className="flex gap-2">
                                  <input type="text" value={phoneFlow.motivo} onChange={e => setPhoneFlow({...phoneFlow, motivo: e.target.value})} placeholder="Ex: Cliente mudou de linha" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-800 transition-all shadow-sm" />
                                  <ProgressButton onClick={salvarTelefone} loading={savingState === 'savePhone'} text="Salvar" loadingText="..." className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-sm transition-colors" />
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* FLUXO 3: SENHA E SEGURANÇA */}
                  <div className="border-t border-slate-100 pt-8">
                      <label className="text-sm font-bold text-slate-800 block mb-3">Segurança e Recuperação</label>
                      <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full">
                          <ProgressButton onClick={enviarLinkRecuperacao} loading={savingState === 'recuperaEmail'} text="Enviar Recuperação ao E-mail" loadingText="..." icon={Icons.Mail} className="bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-200 font-bold py-3 px-4 rounded-xl text-xs shadow-sm transition-colors flex-1" />
                          <ProgressButton onClick={copiarLinkRecuperacao} loading={savingState === 'copiaLink'} text="Gerar Link Direto" loadingText="..." icon={Icons.Key} className="bg-white border border-slate-200 text-slate-700 hover:text-emerald-600 hover:border-emerald-200 font-bold py-3 px-4 rounded-xl text-xs shadow-sm transition-colors flex-1" />
                          
                          <div className="flex-1 min-w-[250px] relative">
                              {senhaTemp.codigo ? (
                                  <div className="flex gap-2 w-full">
                                      {/* Caixa com a Senha Atual */}
                                      <div className="bg-amber-50 border border-amber-200 text-amber-800 font-mono font-bold py-3 px-4 rounded-xl text-center text-sm flex items-center justify-between shadow-sm flex-1">
                                          <span>{senhaTemp.codigo}</span> 
                                          <div className="flex flex-col items-end">
                                           <span className={`text-[10px] font-bold mt-0.5 ${tempoRestanteSenha === 'Expirada' ? 'text-rose-600' : 'text-amber-700'}`}>
                                              {tempoRestanteSenha === 'Expirada' ? 'Expirada' : `Restam ${tempoRestanteSenha}`}
                                          </span>
                                          </div>
                                      </div>
                                      {/* Botão de Regerar ao Lado */}
                                      <button 
                                          onClick={gerarSenhaProvisoria} 
                                          title="Gerar Outra Senha Provisória" 
                                          className="w-14 flex items-center justify-center bg-white border border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700 rounded-xl shadow-sm transition-colors shrink-0"
                                      >
                                          <Icons.Repeat className="w-5 h-5" />
                                      </button>
                                  </div>
                              ) : (
                                  <ProgressButton onClick={gerarSenhaProvisoria} loading={savingState === 'gerarSenha'} text="Gerar Senha Provisória (10min)" loadingText="..." icon={Icons.AlertTriangle} className="w-full bg-white border border-amber-200 text-amber-600 hover:bg-amber-50 font-bold py-3 px-4 rounded-xl text-xs shadow-sm transition-colors" />
                              )}
                          </div>
                      </div>
                  </div>

                  {/* FLUXO 4: DADOS SENSÍVEIS (CPF E NASCIMENTO) */}
                  <div className="border-t border-slate-100 pt-8">
                      <div className="flex items-center justify-between mb-4">
                          <label className="text-sm font-bold text-slate-800">Dados Pessoais Sensíveis</label>
                          <ProgressButton onClick={salvarDadosSensiveis} loading={savingState === 'saveDocs'} text="Analisar e Salvar Documento" loadingText="..." className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg text-[11px] uppercase tracking-wider shadow-sm transition-colors" />
                      </div>
                      <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl mb-6 text-xs text-yellow-800 font-medium flex gap-3 items-center">
                          <Icons.Info className="w-5 h-5 shrink-0" />
                          <p>Para alterar CPF ou Nascimento, preencha os novos dados e <strong>anexe obrigatoriamente a foto legível do RG ou CNH</strong> (Máx 3MB).</p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Novo CPF / NIF</label>
                              <input type="text" value={docSensivel.cpf} onChange={e => setDocSensivel({...docSensivel, cpf: e.target.value})} placeholder={clienteSelecionado?.cpf} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-800 transition-all shadow-sm mb-4" />
                          </div>
                          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Nova Data de Nascimento</label>
                              <input type="date" value={docSensivel.nascimento} onChange={e => setDocSensivel({...docSensivel, nascimento: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-800 transition-all shadow-sm mb-4" />
                          </div>
                      </div>

                      <div className="mt-4">
                          <label className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 rounded-xl p-4 cursor-pointer transition-colors shadow-sm">
                              <Icons.Upload className="w-5 h-5 text-slate-400" />
                              <span className="text-sm font-bold text-slate-600">{docSensivel.arquivo ? docSensivel.arquivo.name : 'Clique para Anexar Comprovante (Obrigatório)'}</span>
                              <input type="file" accept="image/*,application/pdf" onChange={e => setDocSensivel({...docSensivel, arquivo: e.target.files[0]})} className="hidden" />
                          </label>
                      </div>
                  </div>
              </div>

              <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-slate-100 flex-shrink-0">
                  <button onClick={() => setPerfilEmEdicao(false)} className="px-8 bg-slate-50 border border-slate-200 text-slate-700 font-bold py-3.5 rounded-xl hover:bg-slate-100 transition-colors shadow-sm">Cancelar</button>
                  <ProgressButton onClick={() => { 
                      triggerAcao('savePerfil', 'Perfil atualizado e Log de Auditoria registrado!'); 
                      setTimeout(() => {
                          setSenhaProvisoria(null); // Reseta a senha provisória ao fechar
                          setPerfilEmEdicao(false);
                      }, 1500); 
                  }} loading={savingState === 'savePerfil'} text="Salvar Alterações Seguras" loadingText="Gravando Audit Log..." className="px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-sm transition-colors" />
              </div>
          </motion.section>
        )}

        {crmSubTab === 'CARTEIRAS (LIVRO RAZÃO)' && (
          <motion.section key="CARTEIRAS" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 max-w-4xl mx-auto w-full">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <article className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-sm text-white border-0 relative overflow-hidden">
                   <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
                   <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-2 relative z-10">Saldo Atual (Coins)</p>
                   <p className="text-5xl font-black text-white relative z-10">{safeNum(clienteSelecionado?.coins)}</p>
                </article>
                <article className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cashback Disponível</p>
                   <p className="text-5xl font-black text-emerald-600">{formatCurrency(clienteSelecionado?.cashback)}</p>
                </article>
             </div>
             <article className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h4 className="text-lg font-bold text-slate-800 mb-2">Livro Razão: Adicionar Transação Manual</h4>
                <p className="text-sm font-medium text-slate-500 mb-6">Adicione saldo como pedido de desculpas ou bônus. O sistema gravará um registro imutável (Audit Log) para garantir a segurança financeira.</p>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-1/3">
                      <label className="text-xs font-bold text-slate-700 block mb-2">Tipo de Saldo</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"><option>Hub Coins</option><option>Cashback (R$)</option></select>
                    </div>
                    <div className="w-full sm:w-2/3">
                      <label className="text-xs font-bold text-slate-700 block mb-2">Valor</label>
                      <input type="number" placeholder="Ex: 50" min="1" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-2">Motivo da Transação (Obrigatório para Auditoria)</label>
                    <input type="text" placeholder="Ex: Bônus de aniversário (Manual)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" />
                  </div>
                  <ProgressButton 
                    onClick={() => triggerAcao('transacao', 'Transação registrada no Livro Razão e Audit Log.')}
                    loading={savingState === 'transacao'} text="Processar Transação Segura" loadingText="Registrando..." className="w-full mt-2 flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors disabled:opacity-70" 
                  />
                </div>
             </article>
          </motion.section>
        )}

        {crmSubTab === 'ENDEREÇOS' && (
          <motion.section key="ENDEREÇOS" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-5xl mx-auto w-full">
             {(!clienteSelecionado?.enderecos || clienteSelecionado.enderecos.length === 0) ? (
                <div className="bg-white p-16 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-center">
                    <p className="text-sm font-bold text-slate-500">Nenhum endereço cadastrado na conta deste cliente.</p>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {clienteSelecionado.enderecos.map((end, idx) => (
                        <article key={idx} className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden group hover:border-blue-300 transition-colors">
                            {/* Decorative Top Bar for Netflix Style */}
                            <div className="h-1 w-full bg-gradient-to-r from-blue-400 to-indigo-500 absolute top-0 left-0"></div>
                            
                            <div className="p-8 pb-6 relative">
                                {end.padrao && <span className="absolute top-6 right-6 bg-blue-50 text-blue-600 border border-blue-100 text-[10px] px-2.5 py-1 rounded-lg font-black uppercase shadow-sm">Entrega Padrão</span>}
                                
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm"><Icons.MapPin className="w-6 h-6"/></div>
                                
                                <h5 className="text-lg font-black text-slate-800 mb-1 leading-tight">{safeStr(end.rua)}, {safeStr(end.num)}</h5>
                                <p className="text-sm font-medium text-slate-500 mb-4">{safeStr(end.bairro)}</p>

                                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Cidade / Estado</p>
                                        <p className="text-xs font-bold text-slate-700">{safeStr(end.cidade)} - {safeStr(end.uf)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">CEP</p>
                                        <p className="text-xs font-mono font-bold text-slate-700">{safeStr(end.cep)}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Complemento</p>
                                        <p className="text-xs font-medium text-slate-600">{safeStr(end.complemento) || '-'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Ponto de Referência</p>
                                        <p className="text-xs font-medium text-slate-600">{safeStr(end.referencia) || '-'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 px-8 py-3 border-t border-slate-100 mt-auto flex justify-end">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registrado no CRM</span>
                            </div>
                        </article>
                    ))}
                </div>
             )}
          </motion.section>
        )}

        {crmSubTab === 'TIMELINE (AUDIT)' && (
          <motion.section key="TIMELINE" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm w-full flex flex-col overflow-hidden">
             
             <header className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                 <div>
                     <h3 className="text-xl font-black text-slate-800 flex items-center gap-3"><Icons.Activity className="w-6 h-6 text-blue-500"/> Registro de Auditoria (Logs)</h3>
                     <p className="text-xs text-slate-500 mt-1 font-medium">Histórico imutável de ações, transações e segurança desta conta.</p>
                 </div>
                 <div className="flex items-center gap-3 w-full sm:w-auto relative">
                     <div className="relative shrink-0 z-[50]">
                         <HoverProgressRoundButton 
                             text={timelineDateRange.start ? `${formatDateBR(timelineDateRange.start)} até ${formatDateBR(timelineDateRange.end)}` : 'Filtrar Data'}
                             onClick={() => setTimelineDateOpen(!timelineDateOpen)} 
                             icon={Icons.Calendar} 
                             ariaLabel="Filtrar Período Audit"
                             loading={savingState === 'filtroAudit'}
                         />
                         <DateFilterPopup 
                             isOpen={timelineDateOpen} onClose={() => setTimelineDateOpen(false)} dateRange={timelineDateRange} setDateRange={setTimelineDateRange} loading={savingState === 'filtroAudit'}
                             onClear={() => { setTimelineDateRange({start:'',end:''}); setTimelineDateOpen(false); setTimelinePage(1); }}
                             onApply={() => { triggerAcao('filtroAudit', 'Timeline filtrada!'); setTimelineDateOpen(false); setTimelinePage(1); }}
                         />
                     </div>
                     <ProgressButton 
                        onClick={() => triggerAcao('exportPdf', 'Download do Relatório Iniciado.')} 
                        loading={savingState === 'exportPdf'}
                        text="Exportar PDF" icon={Icons.Download} 
                        className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-200 hover:bg-slate-50 font-bold rounded-xl text-xs shadow-sm transition-colors flex items-center gap-2" 
                     />
                 </div>
             </header>

             <div className="p-8 sm:p-12 relative flex-1">
                 <div className="absolute left-[59px] top-12 bottom-12 w-[2px] bg-slate-100 hidden sm:block"></div>
                 <div className="space-y-8 relative z-10">
                    {auditLogsPaginados.length > 0 ? auditLogsPaginados.map((log) => (
                        <article key={log.id} className="relative sm:pl-16">
                           <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full ring-4 ring-white shadow-sm flex items-center justify-center hidden sm:flex ${
                               log.tipo === 'success' ? 'bg-emerald-500' : 
                               log.tipo === 'warning' ? 'bg-amber-500' : 
                               log.tipo === 'info' ? 'bg-blue-500' : 'bg-slate-400'
                           }`}>
                               <div className="w-2 h-2 bg-white rounded-full"></div>
                           </div>
                           
                           <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-blue-200 hover:shadow-md transition-all group">
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{formatDateTimeBR(log.data)}</p>
                               <h5 className="text-sm font-black text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">{log.titulo}</h5>
                               <p className="text-xs text-slate-600 mt-1.5 font-medium leading-relaxed">{log.desc}</p>
                           </div>
                        </article>
                    )) : (
                        <div className="py-12 text-center text-slate-500 font-medium">Nenhum registro de auditoria encontrado neste período.</div>
                    )}
                 </div>
             </div>

             {auditLogsFiltrados.length > 0 && (
                <footer className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center text-xs font-bold text-slate-500 gap-4 mt-auto">
                    <span>Mostrando {(timelinePage - 1) * timelinePerPage + 1} até {Math.min(timelinePage * timelinePerPage, auditLogsFiltrados.length)} de {auditLogsFiltrados.length} logs</span>
                    <div className="flex items-center gap-4">
                        <span>Página {timelinePage} de {totalTimelinePages}</span>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setTimelinePage(p => Math.max(1, p - 1))} disabled={timelinePage === 1} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"><Icons.ChevronLeft className="w-4 h-4" /></button>
                            <button type="button" onClick={() => setTimelinePage(p => Math.min(totalTimelinePages, p + 1))} disabled={timelinePage === totalTimelinePages} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"><Icons.ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                </footer>
             )}

          </motion.section>
        )}
      </AnimatePresence>
    </FadeIn>
  );

  // ============================================================================
  // RENDER MODULAR: BENEFÍCIOS (ESTILO NETFLIX CARDS)
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

      {/* Grid de Cards Estilo Netflix / SaaS Moderno */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {niveisVIP.map((nivel) => (
              <article key={nivel.id} className={`bg-white border ${nivel.isDefault ? 'border-yellow-400 ring-4 ring-yellow-50' : 'border-slate-200'} rounded-3xl shadow-sm overflow-hidden flex flex-col relative group hover:shadow-lg transition-all hover:-translate-y-1`}>
                  
                  {nivel.isDefault && <span className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl z-20 shadow-sm">👑 Principal</span>}

                  <div className="h-28 bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 relative p-4 flex justify-between items-start z-10">
                      <span className="bg-white/80 backdrop-blur-md text-slate-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm border border-white/50">Nível #{nivel.id}</span>
                      
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => editarVIP(nivel)} aria-label="Editar VIP" className="p-2 bg-white/90 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl shadow-md transition-colors"><Icons.Edit3 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => excluirVIP(nivel.id)} aria-label="Excluir VIP" className="p-2 bg-white/90 text-rose-500 hover:bg-rose-600 hover:text-white rounded-xl shadow-md transition-colors"><Icons.Trash className="w-3.5 h-3.5" /></button>
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
                          <button onClick={salvarVIP} className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-sm hover:bg-blue-700 transition-colors">Salvar Regra VIP</button>
                      </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>
    </FadeIn>
    );
  };

  // ============================================================================
  // RENDER MODULAR: CONFIGURAÇÕES (CARDS SAAS / NETFLIX STYLE)
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
           <ProgressButton onClick={() => triggerAcao('saveConfig', 'Configurações de CRM salvas com sucesso!')} loading={savingState === 'saveConfig'} text="Salvar Alterações" loadingText="Salvando..." className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-sm transition-colors" />
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
                             <p className="text-xs text-slate-500 mt-1">Garante que todas as avaliações passem pelo painel de "Avaliações" antes de ficarem públicas.</p>
                          </div>
                      </div>
                      <button onClick={() => setShowConfigHelp(false)} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm">Fechar Guia</button>
                  </motion.div>
              </div>
          )}
       </AnimatePresence>
    </FadeIn>
  );

  return (
      <>
        <AnimatedNotification show={toast.show} status={toast.status} titulo={toast.message} />
        <AnimatePresence mode="wait">
          {mainTab === 'PAINEL' && renderPainel()}
          {mainTab === 'CLIENTES (CRM)' && !clienteSelecionado && renderClientesCRMLista()}
          {mainTab === 'CLIENTES (CRM)' && clienteSelecionado && renderClientesCRMPerfil()}
          {mainTab === 'BENEFÍCIOS' && renderBeneficios()}
          {mainTab === 'CONFIGURAÇÕES' && renderConfiguracoes()}
        </AnimatePresence>
      </>
  );
};

// ============================================================================
// COMPONENTE ROOT
// ============================================================================
export default function AdminCustomers() {
  const [mainTab, setMainTab] = useState('PAINEL');
  const abasDisponiveis = ['PAINEL', 'CLIENTES (CRM)', 'BENEFÍCIOS', 'CONFIGURAÇÕES'];

  return (
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
            
            {/* O MENU FLUIDO ADICIONADO AQUI! (Textos com o hover animado do framer-motion) */}
            <nav className="flex gap-8 border-b border-slate-200 mt-8 overflow-x-auto no-scrollbar relative w-full" aria-label="Navegação do CRM">
                {abasDisponiveis.map(tab => (
                    <button 
                      type="button" key={tab} aria-label={`Aba ${tab}`} aria-current={mainTab === tab ? "page" : undefined} onClick={() => setMainTab(tab)} 
                      className={`relative pb-4 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${mainTab === tab ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        {tab}
                        {mainTab === tab && (
                            <motion.div layoutId="activeTabIndicatorAdminMain" className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-t-full" />
                        )}
                    </button>
                ))}
            </nav>
        </header>

        <main className="flex-1 min-w-0 px-4 md:px-8 relative pt-2">
           <AdminCustomersContent mainTab={mainTab} setMainTab={setMainTab} />
        </main>
      </div>
    </ErrorBoundary>
  );
}