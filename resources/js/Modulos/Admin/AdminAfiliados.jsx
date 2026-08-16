// ============================================================================
// FICHEIRO: resources/js/Modulos/Admin/AdminAfiliados.jsx
// ARQUITETURA: Programa de Afiliados (Layout Original Extraído do Monólito)
// ============================================================================

import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';

// --- ÍCONES ORIGINAIS (BLINDADOS) ---
const Icons = {
    Search: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Close: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
    Check: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>,
    Spinner: ({className="w-4 h-4"}) => <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>,
    Users: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    Wallet: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
    Link: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
    Settings: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    TrendingUp: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    Eye: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    EyeOff: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.018 10.018 0 014.122-.863c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" /></svg>,
    Refresh: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    Upload: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>,
    Receipt: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    Edit: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    Ticket: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>,
    Calendar: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Plus: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
    Trash: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    Box: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    Info: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
};

// --- CSS GLOBAIS ---
const inputNumberStyle = { WebkitAppearance: 'none', MozAppearance: 'textfield' };
const GlobalStyles = () => (
    <style dangerouslySetInnerHTML={{__html: `
        input[type="number"]::-webkit-inner-spin-button, input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `}} />
);

// --- COMPONENTES DE ANIMAÇÃO E UX ---
const FadeIn = React.forwardRef(({ children, className = "", ...props }, ref) => (
    <motion.div ref={ref} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3, ease: "easeOut" }} className={className} {...props}>
        {children}
    </motion.div>
));
FadeIn.displayName = 'FadeIn';

const AnimatedToggle = ({ label, active, onChange, activeColor = "#10B981", isDark = false }) => {
    return (
        <div className={`flex justify-between items-center p-4 sm:p-5 rounded-[20px] shadow-sm transition-all ${isDark ? 'bg-slate-800/50 border border-slate-700 hover:border-slate-600' : 'bg-white border border-gray-100 hover:border-gray-200'}`}>
            <span className={`text-sm font-bold ${isDark ? 'text-gray-100' : 'text-gray-700'}`}>{label}</span>
            <button type="button" onClick={() => onChange(!active)} className={`relative w-11 h-11 flex items-center justify-center rounded-full outline-none flex-shrink-0 shadow-sm border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'}`}>
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r="20" fill="none" stroke={isDark ? "#334155" : "#F1F5F9"} strokeWidth="2" />
                    <motion.circle cx="22" cy="22" r="20" fill="none" stroke={active ? activeColor : "transparent"} strokeWidth="4" initial={{ pathLength: 0 }} animate={{ pathLength: active ? 1 : 0 }} transition={{ duration: 0.4 }} />
                </svg>
                <AnimatePresence mode="wait">
                    {active ? <motion.div key="1" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-emerald-500 z-10"><Icons.Check className="w-5 h-5" /></motion.div>
                            : <motion.div key="0" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className={`w-3 h-3 rounded-full z-10 ${isDark ? 'bg-slate-600' : 'bg-gray-300'}`} />}
                </AnimatePresence>
            </button>
        </div>
    );
};

const AnimatedNotification = ({ show, status, titulo }) => (
    <AnimatePresence>
        {show && (
            <motion.div initial={{ opacity: 0, y: -50, scale: 0.9 }} animate={{ opacity: 1, y: 20, scale: 1 }} exit={{ opacity: 0, y: -50, scale: 0.9 }} className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 flex items-center gap-4 min-w-[300px]">
                <div className="relative w-10 h-10 flex-shrink-0 bg-slate-900 rounded-xl flex items-center justify-center">
                    {status === 'loading' ? (
                        <Icons.Spinner className="w-5 h-5 text-emerald-400" />
                    ) : (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-400"><Icons.Check className="w-5 h-5" /></motion.div>
                    )}
                </div>
                <div className="pr-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{status === 'loading' ? 'A Sincronizar...' : 'Concluído'}</p>
                    <p className="text-sm font-black text-gray-900 line-clamp-1">{status === 'loading' ? 'Processando dados...' : titulo}</p>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

const ProgressButton = ({ onClick, loading, text, loadingText, className, disabled, icon }) => (
    <button type="button" onClick={onClick} disabled={loading || disabled} className={`relative overflow-hidden ${className} disabled:opacity-90 disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0`}>
        {loading && <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5, ease: "linear" }} className="absolute left-0 top-0 h-full bg-emerald-500/80 z-0" />}
        <span className="relative z-10 flex items-center justify-center gap-2">{loading ? <><Icons.Spinner className="w-4 h-4" /> {loadingText}</> : <>{icon} {text}</>}</span>
    </button>
);

const formatSmartCurrency = (val, forceFull = false) => {
    if (val === null || val === undefined) return "R$ 0,00";
    const num = Number(val) || 0;
    if (forceFull) return `R$ ${num.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    if (num >= 1000000) return `R$ ${(num / 1000000).toFixed(2)}M`;
    if (num >= 100000) return `R$ ${(num / 1000).toFixed(1)}k`;
    return `R$ ${num.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
};

// ============================================================================
// COMPONENTE MESTRE: ADMIN AFILIADOS (Com Menu Original)
// ============================================================================
const AdminAfiliados = () => {
    // --- ESTADOS GLOBAIS DE NAVEGAÇÃO ---
    // Abas Originais: PAINEL, AFILIADOS, PRODUTOS_AFI, CUPONS_AFI, SAQUES, CONFIGURAÇÕES
    const [mainTab, setMainTab] = useState('PAINEL'); 
    const [loadingAcao, setLoadingAcao] = useState(null);
    const [notif, setNotif] = useState({ show: false, status: 'loading', titulo: '' });

    // Modais
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [periodoFiltro, setPeriodoFiltro] = useState({ inicio: '01/08/2026', fim: '31/08/2026' });
    const [revelarValores, setRevelarValores] = useState(false);

    // --- MOCKS DE DADOS ---
    const [afiliados, setAfiliados] = useState([
        { id: 1, clienteId: 101, nome: "BlogTech Review", email: "contato@blogtech.com", identificador: "blogtech10", cupom: "BLOGTECH10", vendas: 45, receitaGerada: 1250000.00, comissaoTotal: 125000.00, saldoDisponivel: 45000.00, status: 'ATIVO', taxaPersonalizada: null, historicoRecusas: [] },
        { id: 2, clienteId: 999, nome: "Influencer Maria", email: "maria.influencer@email.com", identificador: "mariavip", cupom: "MARIAVIP", vendas: 12, receitaGerada: 3400.00, comissaoTotal: 510.00, saldoDisponivel: 0, status: 'PENDENTE', taxaPersonalizada: 15, historicoRecusas: [] },
        { id: 3, clienteId: 888, nome: "Canal Ofertas", email: "ofertas@canal.com", identificador: "ofertas10", cupom: "", vendas: 8, receitaGerada: 1100.00, comissaoTotal: 110.00, saldoDisponivel: 110.00, status: 'BLOQUEADO', taxaPersonalizada: null, historicoRecusas: [{ data: '2026-08-20', motivo: 'Atividade suspeita de cliques automatizados.' }] }
    ]);

    const [afiliadoEmEdicao, setAfiliadoEmEdicao] = useState(null); 
    const [modalHistoricoAfiliado, setModalHistoricoAfiliado] = useState(null);
    const [modalRecusarAfiliado, setModalRecusarAfiliado] = useState({ isOpen: false, afiliadoId: null, motivo: '' });
    const [modalReavaliarAfiliado, setModalReavaliarAfiliado] = useState({ isOpen: false, afiliadoId: null, motivoInterno: '' });

    const [saques, setSaques] = useState([
        { id: 501, afiliadoId: 1, afiliadoNome: "BlogTech Review", valor: 450.00, chavePix: "contato@blogtech.com", tipoPix: "E-MAIL", titular: "João Silva", dataSolicitacao: '2026-08-28', status: 'PENDENTE', comprovante: null },
        { id: 502, afiliadoId: 3, afiliadoNome: "Canal Ofertas", valor: 110.00, chavePix: "123.456.789-00", tipoPix: "CPF", titular: "Canal Ofertas LTDA", dataSolicitacao: '2026-08-20', status: 'RECUSADO', motivo: "Fraude detectada nos cliques.", comprovante: null }
    ]);
    
    const [modalSaqueUpload, setModalSaqueUpload] = useState({ isOpen: false, saque: null, previewUrl: null });

    const [produtosAfiliados, setProdutosAfiliados] = useState([
        { id: 1, nome: "Smartwatch Pro Max 9", sku: "HUB-SWM9", comissaoProduto: null, status: 'ATIVO' },
        { id: 2, nome: "Caneca Mágica Família", sku: "CUS-CAN-FAM", comissaoProduto: 20, status: 'ATIVO' },
        { id: 3, nome: "Auscultadores Bluetooth", sku: "AUD-BT-01", comissaoProduto: null, status: 'BLOQUEADO' }
    ]);
    const [prodAfiEdit, setProdAfiEdit] = useState(null);
    const [modalAddProduto, setModalAddProduto] = useState({ isOpen: false, produtoNome: '', sku: '', comissao: '' });

    const [cuponsAfiliados, setCuponsAfiliados] = useState([
        { id: 1, codigo: 'BLOGTECH10', afiliadoId: 1, afiliadoNome: "BlogTech Review", tipo: 'PERCENTUAL', valor: 10, escopo: 'LOJA', utilizacoes: 45, descontoConcedido: 1250.00, receitaGerada: 12500.00, produtosVendidos: 48, status: 'ATIVO' },
        { id: 2, codigo: 'MARIAVIP', afiliadoId: 2, afiliadoNome: "Influencer Maria", tipo: 'FIXO', valor: 20, escopo: 'FRETE', utilizacoes: 12, descontoConcedido: 240.00, receitaGerada: 3400.00, produtosVendidos: 15, status: 'ATIVO' }
    ]);
    const [cupomAfiEdit, setCupomAfiEdit] = useState(null); 

    const rankingProdutosAfiliados = useMemo(() => [
        { id: 1, nome: "Smartwatch Pro Max 9", comCupom: 32, semCupom: 13, total: 45, receita: 8900.00 },
        { id: 2, nome: "Caneca Mágica Família", comCupom: 18, semCupom: 7, total: 25, receita: 1250.00 },
        { id: 3, nome: "Fone Bluetooth TWS", comCupom: 10, semCupom: 2, total: 12, receita: 2400.00 }
    ], []);

    const [config, setConfig] = useState({
        taxaGlobal: 10,
        diasCookie: 30,
        minimoSaque: 100.00,
        autoAprovar: false,
        afiliacaoGlobal: true, 
        parametroRastreio: 'ref', 
        rastrearPix: true 
    });
    const [configEdit, setConfigEdit] = useState({...config});

    // --- FILTROS E PAGINAÇÃO ---
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('TODOS');
    const [itensPorPagina, setItensPorPagina] = useState(10);
    const [paginaAtual, setPaginaAtual] = useState(1);

    useEffect(() => { setPaginaAtual(1); setTermoPesquisa(''); setFiltroStatus('TODOS'); }, [mainTab]);

    const paginar = (lista) => {
        const iUltimo = paginaAtual * itensPorPagina;
        const iPrimeiro = iUltimo - itensPorPagina;
        return lista.slice(iPrimeiro, iUltimo);
    };

    const afiliadosFiltrados = useMemo(() => {
        return afiliados.filter(a => {
            const search = (termoPesquisa || '').toLowerCase();
            const matchBusca = (a?.nome || '').toLowerCase().includes(search) || (a?.identificador || '').toLowerCase().includes(search);
            const matchStatus = filtroStatus === 'TODOS' || a?.status === filtroStatus;
            return matchBusca && matchStatus;
        });
    }, [afiliados, termoPesquisa, filtroStatus]);

    // --- FUNÇÕES DE AÇÃO GLOBAIS ---
    const salvarConfiguracoes = () => {
        setNotif({ show: true, status: 'loading', titulo: 'Salvando configurações...' });
        setLoadingAcao('salvar_config');
        setTimeout(() => {
            setConfig({...configEdit});
            setNotif({ show: true, status: 'success', titulo: 'Regras do programa atualizadas!' });
            setTimeout(() => { setLoadingAcao(null); setNotif({ show: false, status: 'loading', titulo: '' }); }, 1000);
        }, 1500);
    };

    const confirmarRecusaAfiliado = () => {
        if (!modalRecusarAfiliado.motivo.trim()) { alert("Informe o motivo da recusa."); return; }
        setLoadingAcao('recusar_afi');
        setTimeout(() => {
            setAfiliados(prev => prev.map(a => {
                if (a.id === modalRecusarAfiliado.afiliadoId) {
                    const recusalog = { data: new Date().toISOString().split('T')[0], motivo: modalRecusarAfiliado.motivo };
                    return { ...a, status: 'BLOQUEADO', historicoRecusas: [...(a.historicoRecusas || []), recusalog] };
                }
                return a;
            }));
            setModalRecusarAfiliado({ isOpen: false, afiliadoId: null, motivo: '' });
            setLoadingAcao(null);
            setNotif({ show: true, status: 'success', titulo: 'Afiliado Recusado e Motivo Registado!' });
            setTimeout(() => setNotif({ show: false, status: '', titulo: '' }), 1500);
        }, 800);
    };

    const confirmarReavaliacaoAfiliado = () => {
        if (!modalReavaliarAfiliado.motivoInterno.trim()) { alert("Informe o motivo interno."); return; }
        setLoadingAcao('reavaliar_afi');
        setTimeout(() => {
            setAfiliados(prev => prev.map(a => a.id === modalReavaliarAfiliado.afiliadoId ? { ...a, status: 'ATIVO' } : a));
            setModalReavaliarAfiliado({ isOpen: false, afiliadoId: null, motivoInterno: '' });
            setLoadingAcao(null);
            setNotif({ show: true, status: 'success', titulo: 'Afiliado Aprovado via Reavaliação!' });
            setTimeout(() => setNotif({ show: false, status: '', titulo: '' }), 1500);
        }, 800);
    };

    const recusarSaque = (id) => {
        const motivo = window.prompt("Motivo da recusa (Obrigatório para o histórico do afiliado):");
        if (!motivo) return;
        setSaques(prev => prev.map(s => s.id === id ? { ...s, status: 'RECUSADO', motivo } : s));
    };

    const confirmarPagamentoSaque = () => {
        if (!modalSaqueUpload.previewUrl) { alert("É obrigatório anexar o comprovante de pagamento."); return; }
        setLoadingAcao('pagar_saque');
        setTimeout(() => {
            setSaques(prev => prev.map(s => s.id === modalSaqueUpload.saque?.id ? { ...s, status: 'PAGO', comprovante: modalSaqueUpload.previewUrl } : s));
            setAfiliados(prev => prev.map(a => a.id === modalSaqueUpload.saque?.afiliadoId ? { ...a, saldoDisponivel: Math.max(0, (a.saldoDisponivel || 0) - modalSaqueUpload.saque.valor) } : a));
            setModalSaqueUpload({ isOpen: false, saque: null, previewUrl: null });
            setLoadingAcao(null);
            setNotif({ show: true, status: 'success', titulo: 'Saque Pago e Comprovante Salvo!' });
            setTimeout(() => setNotif({ show: false, status: '', titulo: '' }), 2000);
        }, 1500);
    };

    const alterarStatusAfiliado = (id, novoStatus) => {
        setAfiliados(prev => prev.map(a => a.id === id ? { ...a, status: novoStatus } : a));
    };

    const salvarConfigAfiliado = () => {
        setLoadingAcao('salvar_afi');
        setTimeout(() => {
            setAfiliados(prev => prev.map(a => a.id === afiliadoEmEdicao?.id ? afiliadoEmEdicao : a));
            setAfiliadoEmEdicao(null);
            setLoadingAcao(null);
            setNotif({ show: true, status: 'success', titulo: 'Configurações de Afiliado salvas!' });
            setTimeout(() => setNotif({ show: false, status: '', titulo: '' }), 1500);
        }, 800);
    };

    const adicionarNovoProdutoElegivel = () => {
        if (!modalAddProduto.produtoNome || !modalAddProduto.sku) { alert("Preencha o Nome e o SKU do produto."); return; }
        setLoadingAcao('add_prod');
        setTimeout(() => {
            const novo = { id: Date.now(), nome: modalAddProduto.produtoNome, sku: modalAddProduto.sku.toUpperCase(), comissaoProduto: modalAddProduto.comissao ? Number(modalAddProduto.comissao) : null, status: 'ATIVO' };
            setProdutosAfiliados([novo, ...produtosAfiliados]);
            setModalAddProduto({ isOpen: false, produtoNome: '', sku: '', comissao: '' });
            setLoadingAcao(null);
            setNotif({ show: true, status: 'success', titulo: 'Produto adicionado ao programa!' });
            setTimeout(() => setNotif({ show: false, status: '', titulo: '' }), 1500);
        }, 800);
    };

    const removerProdutoElegivel = (prod) => {
        if (window.confirm(`Remover "${prod?.nome}" da lista de afiliação?`)) {
            setProdutosAfiliados(prev => prev.filter(p => p.id !== prod.id));
        }
    };

    const salvarCupomAfiliado = () => {
        if (!cupomAfiEdit?.codigo || !cupomAfiEdit?.afiliadoId || !cupomAfiEdit?.valor) { alert("Preencha o Código, o Afiliado e o Valor do desconto."); return; }
        setLoadingAcao('salvar_cupom_afi');
        setTimeout(() => {
            const afiObj = afiliados.find(a => a.id === Number(cupomAfiEdit.afiliadoId));
            const atualizado = { ...cupomAfiEdit, codigo: cupomAfiEdit.codigo.toUpperCase().trim(), afiliadoNome: afiObj ? afiObj.nome : 'Afiliado', valor: Number(cupomAfiEdit.valor) };
            if (cupomAfiEdit.isNovo) { setCuponsAfiliados([atualizado, ...cuponsAfiliados]); } 
            else { setCuponsAfiliados(prev => prev.map(c => c.id === atualizado.id ? atualizado : c)); }
            setCupomAfiEdit(null);
            setLoadingAcao(null);
            setNotif({ show: true, status: 'success', titulo: 'Cupom de Afiliado salvo!' });
            setTimeout(() => setNotif({ show: false, status: '', titulo: '' }), 1500);
        }, 1000);
    };

    // ============================================================================
    // RENDERIZAÇÕES DAS ABAS (Layout Original Extraído do Monólito)
    // ============================================================================
    
    const renderPainel = () => {
        const totalReceitaAfiliados = afiliados.reduce((acc, a) => acc + (a?.receitaGerada || 0), 0);
        const comissoesPendentes = saques.filter(s => s.status === 'PENDENTE').reduce((acc, s) => acc + (s?.valor || 0), 0);
        const totalUsoCuponsAfi = cuponsAfiliados.reduce((acc, c) => acc + (c?.utilizacoes || 0), 0);
        const totalDescCuponsAfi = cuponsAfiliados.reduce((acc, c) => acc + (c?.descontoConcedido || 0), 0);

        return (
            <FadeIn key="painel" className="space-y-6 pb-10">
                <div className="bg-white p-5 sm:p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
                    <div className="flex items-center gap-3">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                Visão Geral do Programa
                                <button type="button" onClick={() => setInfoModalOpen(true)} className="text-gray-400 hover:text-sky-500 transition-colors" title="Como estas métricas são calculadas?">
                                    <Icons.Info className="w-5 h-5" />
                                </button>
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Métricas de performance e adesão dos parceiros de vendas.</p>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button type="button" onClick={() => setIsDateModalOpen(true)} className="w-full bg-gray-50 border border-gray-200 text-sm font-bold text-gray-700 rounded-xl px-5 sm:px-6 py-3 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap">
                            <Icons.Calendar className="w-4 h-4" /> {periodoFiltro.inicio} a {periodoFiltro.fim}
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                    <div className="flex-[1.2] p-6 hover:bg-sky-50 transition-colors flex flex-col justify-center min-w-0">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest truncate">Prod. Elegíveis</span>
                            <Icons.Box className="w-4 h-4 text-sky-400" />
                        </div>
                        <p className="text-xl sm:text-2xl font-black text-sky-700 truncate">{produtosAfiliados.filter(p => p.status === 'ATIVO').length}</p>
                    </div>

                    <div className="flex-1 p-6 hover:bg-emerald-50 transition-colors flex flex-col justify-center min-w-0">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest truncate">Afiliados Ativos</span>
                            <Icons.Check className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-emerald-700 truncate">{afiliados.filter(a=>a.status==='ATIVO').length}</p>
                    </div>

                    <div className="flex-1 p-6 hover:bg-purple-50 transition-colors flex flex-col justify-center min-w-0">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest truncate">Vendas (Ref)</span>
                            <Icons.Link className="w-4 h-4 text-purple-500" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-purple-700 truncate">{afiliados.reduce((acc,a)=>acc+(a?.vendas||0),0)}</p>
                    </div>

                    <div className="flex-1 p-6 hover:bg-orange-50 transition-colors flex flex-col justify-center min-w-0">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest truncate">Saques Pend.</span>
                            <Icons.Wallet className="w-4 h-4 text-orange-500" />
                        </div>
                        <p className="text-xl sm:text-2xl font-black text-orange-700 truncate">{formatSmartCurrency(comissoesPendentes, revelarValores)}</p>
                    </div>

                    <div className="flex-[1.5] p-6 bg-slate-900 relative overflow-hidden group flex flex-col justify-center min-w-0">
                        <div className="absolute -right-4 -top-4 w-32 h-32 bg-emerald-500 opacity-20 rounded-full blur-3xl group-hover:opacity-40 transition-opacity"></div>
                        <div className="flex justify-between items-center mb-2 relative z-10">
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest truncate">Receita Afiliados</span>
                            <button type="button" onClick={() => setRevelarValores(!revelarValores)} className="text-emerald-400 hover:text-white" title="Alternar Exibição">
                                {revelarValores ? <Icons.EyeOff className="w-4 h-4" /> : <Icons.Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-xl sm:text-3xl font-black text-white relative z-10 truncate">{formatSmartCurrency(totalReceitaAfiliados, revelarValores)}</p>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100 rounded-[24px] p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-sky-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/30"><Icons.Ticket className="w-6 h-6" /></div>
                        <div>
                            <span className="text-[10px] font-bold text-sky-800 uppercase tracking-widest block">Usos de Cupons Afiliados</span>
                            <span className="text-2xl font-black text-sky-900">{totalUsoCuponsAfi} vezes</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-sky-200/60 pt-4 md:pt-0 md:pl-6">
                        <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30"><Icons.TrendingUp className="w-6 h-6" /></div>
                        <div>
                            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block">Desconto Subsidiado</span>
                            <span className="text-2xl font-black text-emerald-900">R$ {totalDescCuponsAfi.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-sky-200/60 pt-4 md:pt-0 md:pl-6">
                        <div className="w-12 h-12 bg-purple-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30"><Icons.Box className="w-6 h-6" /></div>
                        <div>
                            <span className="text-[10px] font-bold text-purple-800 uppercase tracking-widest block">Top Produto Indicação</span>
                            <span className="text-base font-black text-purple-900 truncate block max-w-[200px]">{rankingProdutosAfiliados[0]?.nome || 'N/D'}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mt-6">
                    <div className="bg-white border border-gray-100 rounded-[24px] shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2"><Icons.TrendingUp className="w-5 h-5" /> Top 10 Afiliados</h3>
                        </div>
                        <div className="p-0 max-h-[500px] overflow-y-auto custom-scrollbar divide-y divide-gray-50">
                            {[...afiliados].sort((a,b) => (b?.receitaGerada||0) - (a?.receitaGerada||0)).slice(0,10).map((afi, idx) => (
                                <div key={afi.id} className="flex justify-between items-center p-4 hover:bg-sky-50/30 transition-colors cursor-pointer" onClick={() => setModalHistoricoAfiliado(afi)}>
                                    <div className="flex items-center gap-4">
                                        <span className="font-black text-gray-300 text-base w-6 text-center">{idx + 1}º</span>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{afi?.nome}</p>
                                            <p className="text-[10px] font-mono text-gray-500">/?ref={afi?.identificador}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-emerald-600">R$ {(afi?.receitaGerada || 0).toLocaleString('pt-BR', {minimumFractionDigits:2})}</p>
                                        <p className="text-[10px] font-bold text-gray-400">{afi?.vendas || 0} vendas</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </FadeIn>
        );
    };

    const renderAfiliados = () => {
        const paginados = paginar(afiliadosFiltrados);
        return (
            <FadeIn key="afiliados" className="pb-10">
                <div className="bg-white p-6 rounded-t-[24px] border border-b-0 border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-[350px]">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Icons.Search className="w-4 h-4" /></div>
                        <input type="text" placeholder="Buscar por Nome ou /ref=..." value={termoPesquisa} onChange={e=>setTermoPesquisa(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-sky-500 transition-all" />
                    </div>
                    <select value={filtroStatus} onChange={e=>setFiltroStatus(e.target.value)} className="w-full sm:w-auto bg-gray-50 border border-gray-200 text-sm font-bold text-gray-600 rounded-xl px-4 py-3 outline-none cursor-pointer">
                        <option value="TODOS">Todos Status</option>
                        <option value="ATIVO">Ativos</option>
                        <option value="PENDENTE">Pendentes (Avaliação)</option>
                        <option value="BLOQUEADO">Bloqueados / Recusados</option>
                    </select>
                </div>

                <div className="bg-white border border-gray-100 shadow-sm overflow-x-auto w-full custom-scrollbar pb-16">
                    <table className="w-full text-left border-collapse min-w-[1100px]">
                        <thead>
                            <tr className="bg-white border-b border-gray-100 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                                <th className="p-5 pl-8">Parceiro</th>
                                <th className="p-5 text-center">Comissão (%)</th>
                                <th className="p-5 text-center">Vendas</th>
                                <th className="p-5 text-right">Comissões (Total/Disponível)</th>
                                <th className="p-5 text-center">Status</th>
                                <th className="p-5 pr-8 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginados.map(a => (
                                <tr key={a.id} className="hover:bg-sky-50/30 transition-colors group">
                                    <td className="p-5 pl-8">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 text-sm">{a?.nome}</span>
                                            <div className="flex flex-col gap-0.5 mt-1">
                                                <span className="text-[10px] font-mono text-sky-600 flex items-center gap-1"><Icons.Link className="w-3 h-3" /> /?ref={a?.identificador}</span>
                                                {a?.cupom && <span className="text-[9px] font-mono text-gray-400 bg-gray-100 px-1 py-0.5 rounded w-max border border-gray-200">Cupom: {a.cupom}</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5 text-center">
                                        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border inline-block ${a?.taxaPersonalizada ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-sm' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                            {a?.taxaPersonalizada ? `${a.taxaPersonalizada}% (VIP)` : `${config.taxaGlobal}% (Padrão)`}
                                        </span>
                                    </td>
                                    <td className="p-5 text-center"><span className="text-sm font-black text-gray-700">{a?.vendas || 0}</span></td>
                                    <td className="p-5 text-right">
                                        <div className="flex flex-col items-end gap-0.5">
                                            <span className="text-[10px] font-bold text-gray-400">Total: R$ {(a?.comissaoTotal || 0).toFixed(2)}</span>
                                            <span className="font-black text-emerald-600 text-sm flex items-center gap-1"><Icons.Wallet className="w-4 h-4" /> R$ {(a?.saldoDisponivel || 0).toFixed(2)}</span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-center">
                                        <span className={`text-[9px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider border block w-max mx-auto ${a?.status==='ATIVO'?'bg-emerald-50 text-emerald-600 border-emerald-100':a?.status==='PENDENTE'?'bg-orange-50 text-orange-600 border-orange-100':'bg-red-50 text-red-600 border-red-100'}`}>{a?.status}</span>
                                    </td>
                                    <td className="p-5 pr-8 text-right">
                                        {a?.status === 'PENDENTE' ? (
                                            <div className="flex justify-end gap-2">
                                                <button type="button" onClick={() => alterarStatusAfiliado(a.id, 'ATIVO')} className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-4 py-2 rounded-xl text-xs font-bold transition-colors border border-emerald-100 shadow-sm flex items-center gap-1"><Icons.Check className="w-4 h-4" /> Aprovar</button>
                                                <button type="button" onClick={() => setModalRecusarAfiliado({ isOpen: true, afiliadoId: a.id, motivo: '' })} className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl text-xs font-bold transition-colors border border-red-100 shadow-sm flex items-center gap-1"><Icons.Close className="w-4 h-4" /> Recusar</button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-end gap-2 opacity-100 lg:opacity-50 group-hover:opacity-100 transition-opacity">
                                                {a?.status === 'BLOQUEADO' && (
                                                    <button type="button" onClick={() => setModalReavaliarAfiliado({ isOpen: true, afiliadoId: a.id, motivoInterno: '' })} className="bg-sky-50 text-sky-600 hover:bg-sky-100 px-3 py-2 rounded-xl text-xs font-bold transition-colors border border-sky-100 flex items-center gap-1 shadow-sm" title="Reavaliar e Aprovar">
                                                        <Icons.Refresh className="w-4 h-4" /> Reavaliar
                                                    </button>
                                                )}
                                                {a?.status === 'ATIVO' && (
                                                    <button type="button" onClick={() => alterarStatusAfiliado(a.id, 'BLOQUEADO')} className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-xl text-xs font-bold transition-colors border border-red-100 shadow-sm">
                                                        Bloquear
                                                    </button>
                                                )}
                                                <button type="button" onClick={() => setModalHistoricoAfiliado(a)} className="w-9 h-9 flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors shadow-sm" title="Histórico 360°"><Icons.Eye className="w-4 h-4" /></button>
                                                <button type="button" onClick={() => setAfiliadoEmEdicao(a)} className="w-9 h-9 flex items-center justify-center text-sky-600 bg-sky-50 hover:bg-sky-100 border border-sky-100 rounded-xl transition-colors shadow-sm" title="Configurações VIP (Cupom / Taxa)"><Icons.Settings className="w-5 h-5" /></button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {paginados.length === 0 && <tr><td colSpan="6" className="p-16 text-center text-gray-400 text-base font-medium">Nenhum afiliado encontrado.</td></tr>}
                        </tbody>
                    </table>
                </div>

                {afiliadosFiltrados.length > 0 && (
                    <div className="bg-white p-5 border-t border-gray-100 rounded-b-[24px] flex flex-col sm:flex-row justify-between items-center text-xs font-bold text-gray-600 shadow-sm gap-4">
                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                            <span>Itens por página:</span>
                            <select value={itensPorPagina} onChange={(e) => setItensPorPagina(Number(e.target.value))} className="bg-gray-50 border border-gray-200 rounded-lg px-2 sm:px-3 py-1 sm:py-2 outline-none cursor-pointer">
                                <option value={10}>10</option><option value={20}>20</option><option value={30}>30</option><option value={50}>50</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                            <span>Página {paginaAtual} de {Math.ceil(afiliadosFiltrados.length / itensPorPagina) || 1}</span>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setPaginaAtual(p => Math.max(1, p - 1))} disabled={paginaAtual === 1} className="w-8 h-8 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-50 transition-colors">&lt;</button>
                                <button type="button" onClick={() => setPaginaAtual(p => Math.min(Math.ceil(afiliadosFiltrados.length / itensPorPagina), p + 1))} disabled={paginaAtual === Math.ceil(afiliadosFiltrados.length / itensPorPagina)} className="w-8 h-8 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-50 transition-colors">&gt;</button>
                            </div>
                        </div>
                    </div>
                )}
            </FadeIn>
        );
    };

    const renderProdutosAfiliados = () => {
        const filtrados = produtosAfiliados.filter(p => (p?.nome || '').toLowerCase().includes(termoPesquisa.toLowerCase()) || (p?.sku || '').toLowerCase().includes(termoPesquisa.toLowerCase()));
        const paginados = paginar(filtrados);

        return (
            <FadeIn key="produtos_afi" className="pb-10">
                <div className="bg-white p-6 rounded-t-[24px] border border-b-0 border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-gray-900">Produtos Elegíveis & Comissões</h2>
                        <p className="text-sm text-gray-500 mt-1">Defina se um produto paga a comissão global da loja ou tem uma comissão diferente.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative w-full sm:w-[250px]">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Icons.Search className="w-4 h-4" /></div>
                            <input type="text" placeholder="Buscar Produto ou SKU..." value={termoPesquisa} onChange={e=>setTermoPesquisa(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-sky-500 transition-all" />
                        </div>
                        <button type="button" onClick={() => setModalAddProduto({ isOpen: true, produtoNome: '', sku: '', comissao: '' })} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-colors whitespace-nowrap">
                            <Icons.Plus className="w-5 h-5" /> Adicionar Produto
                        </button>
                    </div>
                </div>

                <div className="bg-white border border-gray-100 shadow-sm overflow-x-auto w-full custom-scrollbar pb-16">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-white border-b border-gray-100 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                                <th className="p-5 pl-8">Produto (SKU)</th>
                                <th className="p-5 text-center">Comissão Deste Produto</th>
                                <th className="p-5 text-center">Afiliação Permitida?</th>
                                <th className="p-5 pr-8 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginados.map(p => (
                                <tr key={p.id} className="hover:bg-sky-50/30 transition-colors group">
                                    <td className="p-5 pl-8">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 text-sm">{p?.nome}</span>
                                            <span className="text-[10px] font-mono text-gray-500 mt-0.5">SKU: {p?.sku}</span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-center">
                                        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border inline-block ${p?.comissaoProduto ? 'bg-orange-50 text-orange-700 border-orange-200 shadow-sm' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                            {p?.comissaoProduto ? `${p.comissaoProduto}% (Específica)` : `Padrão (${config.taxaGlobal}%)`}
                                        </span>
                                    </td>
                                    <td className="p-5 text-center">
                                        <span className={`text-[9px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider border block w-max mx-auto ${p?.status==='ATIVO'?'bg-emerald-50 text-emerald-600 border-emerald-100':'bg-red-50 text-red-600 border-red-100'}`}>{p?.status === 'ATIVO' ? 'Permitida' : 'Bloqueada'}</span>
                                    </td>
                                    <td className="p-5 pr-8 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button type="button" onClick={() => setProdAfiEdit(p)} className="w-9 h-9 flex items-center justify-center text-sky-600 bg-sky-50 hover:bg-sky-100 border border-sky-100 rounded-xl transition-colors shadow-sm" title="Editar Comissão"><Icons.Edit className="w-5 h-5" /></button>
                                            <button type="button" onClick={() => removerProdutoElegivel(p)} className="w-9 h-9 flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-colors shadow-sm" title="Remover da Afiliação"><Icons.Trash className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {paginados.length === 0 && <tr><td colSpan="4" className="p-16 text-center text-gray-400 text-base font-medium">Nenhum produto cadastrado na afiliação.</td></tr>}
                        </tbody>
                    </table>
                </div>
                
                {filtrados.length > 0 && (
                    <div className="bg-white p-5 border-t border-gray-100 rounded-b-[24px] flex flex-col sm:flex-row justify-between items-center text-xs font-bold text-gray-600 shadow-sm gap-4">
                        <div className="flex items-center gap-3">
                            <span>Itens por página:</span>
                            <select value={itensPorPagina} onChange={(e) => setItensPorPagina(Number(e.target.value))} className="bg-gray-50 border border-gray-200 rounded-lg px-2 sm:px-3 py-1 sm:py-2 outline-none cursor-pointer">
                                <option value={10}>10</option><option value={20}>20</option><option value={30}>30</option><option value={50}>50</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-4">
                            <span>Página {paginaAtual} de {Math.ceil(filtrados.length / itensPorPagina) || 1}</span>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setPaginaAtual(p => Math.max(1, p - 1))} disabled={paginaAtual === 1} className="w-8 h-8 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-50 transition-colors">&lt;</button>
                                <button type="button" onClick={() => setPaginaAtual(p => Math.min(Math.ceil(filtrados.length / itensPorPagina), p + 1))} disabled={paginaAtual === Math.ceil(filtrados.length / itensPorPagina)} className="w-8 h-8 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-50 transition-colors">&gt;</button>
                            </div>
                        </div>
                    </div>
                )}
            </FadeIn>
        );
    };

    const renderCuponsAfiliados = () => {
        const paginados = paginar(cuponsAfiliados);
        return (
            <FadeIn key="cupons_afi" className="pb-10">
                <div className="bg-white p-6 rounded-t-[24px] border border-b-0 border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-gray-900">Cupons de Afiliados</h2>
                        <p className="text-sm text-gray-500 mt-1">Crie cupons de Loja ou Frete e atribua diretamente a um parceiro para divulgação.</p>
                    </div>
                    <button type="button" onClick={() => setCupomAfiEdit({ id: Date.now(), isNovo: true, codigo: '', afiliadoId: '', tipo: 'PERCENTUAL', valor: '', escopo: 'LOJA' })} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-colors whitespace-nowrap">
                        <Icons.Plus className="w-5 h-5" /> Criar Cupom de Afiliado
                    </button>
                </div>

                <div className="bg-white border border-gray-100 shadow-sm overflow-x-auto w-full custom-scrollbar pb-16">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-white border-b border-gray-100 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                                <th className="p-5 pl-8">Cupom & Afiliado</th>
                                <th className="p-5 text-center">Desconto</th>
                                <th className="p-5 text-center">Usos</th>
                                <th className="p-5 text-right">Desconto Subsidiado</th>
                                <th className="p-5 text-right">Receita Gerada</th>
                                <th className="p-5 pr-8 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginados.map(c => (
                                <tr key={c.id} className="hover:bg-sky-50/30 transition-colors group">
                                    <td className="p-5 pl-8">
                                        <div className="flex flex-col">
                                            <span className="font-mono text-sm font-black text-sky-600 bg-sky-50 px-2 py-0.5 rounded w-max border border-sky-100">{c?.codigo}</span>
                                            <span className="text-xs font-bold text-gray-900 mt-1">{c?.afiliadoNome}</span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-center">
                                        <span className="font-black text-emerald-600 text-sm">{c?.tipo === 'PERCENTUAL' ? `${c?.valor}% OFF` : `R$ ${Number(c?.valor||0).toFixed(2)}`}</span>
                                        <span className="block text-[9px] font-bold text-gray-400 mt-0.5">{c?.escopo}</span>
                                    </td>
                                    <td className="p-5 text-center"><span className="text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">{c?.utilizacoes || 0}</span></td>
                                    <td className="p-5 text-right"><span className="font-bold text-red-500 text-sm">- R$ {(c?.descontoConcedido || 0).toFixed(2)}</span></td>
                                    <td className="p-5 text-right"><span className="font-black text-emerald-600 text-sm">R$ {(c?.receitaGerada || 0).toFixed(2)}</span></td>
                                    <td className="p-5 pr-8 text-right">
                                        <button type="button" onClick={() => setCupomAfiEdit({ ...c, isNovo: false })} className="w-9 h-9 flex items-center justify-center text-sky-600 bg-sky-50 hover:bg-sky-100 border border-sky-100 rounded-xl transition-colors shadow-sm ml-auto" title="Editar Cupom"><Icons.Edit className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                            {paginados.length === 0 && <tr><td colSpan="6" className="p-16 text-center text-gray-400 text-base font-medium">Nenhum cupom de afiliado cadastrado.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </FadeIn>
        );
    };

    const renderSaques = () => {
        return (
            <FadeIn key="saques" className="pb-10">
                <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm overflow-x-auto w-full custom-scrollbar">
                    <div className="mb-6 border-b border-gray-100 pb-5">
                        <h2 className="text-xl font-black text-gray-900">Solicitações de Saque</h2>
                        <p className="text-sm text-gray-500 mt-1">Aprove e pague os afiliados via PIX. Após o pagamento efetuado no seu banco, marque aqui como "Pago" e anexe o comprovante.</p>
                    </div>
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-white border-b border-gray-100 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                                <th className="p-5 pl-8">Afiliado</th>
                                <th className="p-5 text-center">Data</th>
                                <th className="p-5 text-right">Valor a Pagar</th>
                                <th className="p-5">Chave PIX / IBAN</th>
                                <th className="p-5 text-center">Status</th>
                                <th className="p-5 pr-8 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {saques.map(s => (
                                <tr key={s.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="p-5 pl-8 font-bold text-gray-900 text-sm">{s?.afiliadoNome}</td>
                                    <td className="p-5 text-center font-mono text-xs text-gray-500">{(s?.dataSolicitacao||'').split('-').reverse().join('/')}</td>
                                    <td className="p-5 text-right"><span className="font-black text-emerald-600 text-lg">R$ {(s?.valor||0).toFixed(2)}</span></td>
                                    <td className="p-5">
                                        <div className="flex flex-col">
                                            <span className="font-mono text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded w-max border border-sky-100">{s?.chavePix}</span>
                                            <span className="text-[9px] text-gray-400 mt-1">{s?.tipoPix} - Titular: {s?.titular}</span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-center">
                                        <span className={`text-[9px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider border block w-max mx-auto ${s?.status==='PAGO'?'bg-emerald-50 text-emerald-600 border-emerald-100':s?.status==='PENDENTE'?'bg-orange-50 text-orange-600 border-orange-100':'bg-red-50 text-red-600 border-red-100'}`}>{s?.status}</span>
                                        {s?.status === 'RECUSADO' && <span className="block text-[9px] text-red-500 font-bold mt-1 max-w-[150px] truncate mx-auto" title={s?.motivo}>{s?.motivo}</span>}
                                    </td>
                                    <td className="p-5 pr-8 text-right">
                                        {s?.status === 'PENDENTE' && (
                                            <div className="flex justify-end gap-2">
                                                <button type="button" onClick={() => setModalSaqueUpload({ isOpen: true, saque: s, previewUrl: null })} className="bg-[#0F172A] text-white hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"><Icons.Check className="w-4 h-4"/> Aprovar</button>
                                                <button type="button" onClick={() => recusarSaque(s.id)} className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl text-xs font-bold transition-colors border border-red-100">Recusar</button>
                                            </div>
                                        )}
                                        {s?.status === 'PAGO' && s?.comprovante && (
                                            <a href={s.comprovante} target="_blank" rel="noreferrer" className="text-sky-600 bg-sky-50 hover:bg-sky-100 px-4 py-2 rounded-xl text-xs font-bold transition-colors border border-sky-100 inline-flex items-center gap-1.5 shadow-sm"><Icons.Receipt className="w-4 h-4" /> Recibo</a>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {saques.length === 0 && <tr><td colSpan="6" className="p-16 text-center text-gray-400 text-base font-medium">Nenhum saque pendente.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </FadeIn>
        );
    };

    const renderConfiguracoes = () => {
        return (
            <FadeIn key="configs" className="pb-20 space-y-8 max-w-5xl mx-auto">
                <div className="flex justify-between items-center bg-white/90 backdrop-blur-md p-5 rounded-[24px] border border-gray-200 shadow-sm sticky top-4 z-50">
                    <div>
                        <h2 className="text-xl font-black text-gray-900">Regras do Programa</h2>
                        <p className="text-xs font-medium text-gray-500 mt-1">Configurações globais de comissionamento, saque e rastreio.</p>
                    </div>
                    <ProgressButton onClick={salvarConfiguracoes} loading={loadingAcao === 'salvar_config'} text="Salvar Regras" loadingText="Salvando..." icon={<Icons.Check className="w-5 h-5" />} className="bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-xl shadow-slate-900/20 transition-colors" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[24px] border border-gray-200 shadow-sm col-span-1 md:col-span-2">
                        <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2"><Icons.TrendingUp className="w-5 h-5" /> Comissionamento e Cookies</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-widest block mb-3 flex items-center">Comissão Padrão (%)</label>
                                <div className="relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-sky-500 text-xl">%</div>
                                    <input type="number" min="0" value={configEdit.taxaGlobal} onChange={e=>setConfigEdit({...configEdit, taxaGlobal: e.target.value})} style={inputNumberStyle} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-5 py-4 text-xl font-black text-sky-700 outline-none focus:border-sky-500" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-widest block mb-3 flex items-center">Dias de Cookie</label>
                                <input type="number" min="1" value={configEdit.diasCookie} onChange={e=>setConfigEdit({...configEdit, diasCookie: e.target.value})} style={inputNumberStyle} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-xl font-black text-gray-700 outline-none focus:border-sky-500" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-widest block mb-3 flex items-center">Saque Mínimo (R$)</label>
                                <div className="relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-emerald-500 text-xl">R$</div>
                                    <input type="number" min="0" step="10" value={configEdit.minimoSaque} onChange={e=>setConfigEdit({...configEdit, minimoSaque: e.target.value})} style={inputNumberStyle} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-14 pr-5 py-4 text-xl font-black text-emerald-700 outline-none focus:border-emerald-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-8 rounded-[24px] shadow-2xl relative overflow-hidden flex flex-col justify-between">
                        <AnimatedToggle label={<div className="flex flex-col"><span className="text-white font-black text-base">Aprovação Automática</span><span className="text-[10px] text-slate-400 font-medium mt-1">Se ativo, clientes viram afiliados instantaneamente. Se inativo, vai para 'Pendentes'.</span></div>} active={configEdit.autoAprovar} onChange={val => setConfigEdit({...configEdit, autoAprovar: val})} activeColor="#10B981" isDark={true} />
                    </div>

                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-8 rounded-[24px] shadow-2xl relative overflow-hidden flex flex-col justify-between">
                        <AnimatedToggle label={<div className="flex flex-col"><span className="text-white font-black text-base flex items-center gap-1">Afiliação Global</span><span className="text-[10px] text-slate-400 font-medium mt-1">Se desligar, apenas os produtos listados em PRODUTOS ELEGÍVEIS geram comissões.</span></div>} active={configEdit.afiliacaoGlobal} onChange={val => setConfigEdit({...configEdit, afiliacaoGlobal: val})} activeColor="#A855F7" isDark={true} />
                    </div>

                    <div className="bg-white p-8 rounded-[24px] border border-gray-200 shadow-sm col-span-1 md:col-span-2">
                        <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2"><Icons.Link className="w-5 h-5" /> Parâmetros de Rastreio (Tracking API)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-widest block mb-3 flex items-center">Parâmetro de URL (UTM)</label>
                                <div className="flex items-center gap-0">
                                    <span className="bg-gray-100 border border-gray-200 border-r-0 rounded-l-xl px-4 py-4 text-sm font-bold text-gray-500">sualoja.com/?</span>
                                    <input type="text" value={configEdit.parametroRastreio} onChange={e=>setConfigEdit({...configEdit, parametroRastreio: e.target.value.toLowerCase()})} className="w-full bg-white border border-gray-200 rounded-r-xl px-4 py-4 text-sm font-black font-mono text-sky-600 outline-none focus:border-sky-500 shadow-inner" />
                                </div>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                                <AnimatedToggle label={<div className="flex flex-col"><span className="text-emerald-900 font-black text-sm flex items-center gap-1">Rastrear Conversão PIX API</span><span className="text-[10px] text-emerald-700 font-medium mt-1">Garante a comissão injetando parâmetros no Webhook.</span></div>} active={configEdit.rastrearPix} onChange={val => setConfigEdit({...configEdit, rastrearPix: val})} activeColor="#10B981" />
                            </div>
                        </div>
                    </div>
                </div>
            </FadeIn>
        );
    };

    // ============================================================================
    // MODAIS ESPECÍFICOS DOS AFILIADOS
    // ============================================================================
    const renderModaisAfiliados = () => (
        <>
            <AnimatePresence>
                {modalRecusarAfiliado.isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalRecusarAfiliado({ isOpen: false, afiliadoId: null, motivo: '' })} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-[24px] shadow-2xl p-6 sm:p-8 w-full max-w-md relative z-10">
                            <h3 className="text-xl font-black text-gray-900 mb-2">Recusar Afiliado</h3>
                            <p className="text-xs font-semibold text-gray-500 mb-6">Informe o motivo da recusa. Este texto ficará registrado e estará visível para o parceiro.</p>
                            <textarea value={modalRecusarAfiliado.motivo} onChange={e => setModalRecusarAfiliado({...modalRecusarAfiliado, motivo: e.target.value})} placeholder="Ex: Perfil não atende aos requisitos." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs font-medium outline-none focus:border-red-500 min-h-[100px] mb-6" />
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setModalRecusarAfiliado({ isOpen: false, afiliadoId: null, motivo: '' })} className="flex-1 py-3.5 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold rounded-xl text-sm">Cancelar</button>
                                <ProgressButton onClick={confirmarRecusaAfiliado} loading={loadingAcao === 'recusar_afi'} text="Confirmar Recusa" loadingText="Gravando..." className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm" />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {modalReavaliarAfiliado.isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalReavaliarAfiliado({ isOpen: false, afiliadoId: null, motivoInterno: '' })} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-[24px] shadow-2xl p-6 sm:p-8 w-full max-w-md relative z-10">
                            <h3 className="text-xl font-black text-gray-900 mb-2">Reavaliar e Aprovar Afiliado</h3>
                            <p className="text-xs font-semibold text-gray-500 mb-6">Informe o motivo interno. <span className="font-bold text-sky-600">NÃO será exibido para o cliente.</span></p>
                            <textarea value={modalReavaliarAfiliado.motivoInterno} onChange={e => setModalReavaliarAfiliado({...modalReavaliarAfiliado, motivoInterno: e.target.value})} placeholder="Ex: Parceiro enviou documentação." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs font-medium outline-none focus:border-sky-500 min-h-[100px] mb-6" />
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setModalReavaliarAfiliado({ isOpen: false, afiliadoId: null, motivoInterno: '' })} className="flex-1 py-3.5 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold rounded-xl text-sm">Cancelar</button>
                                <ProgressButton onClick={confirmarReavaliacaoAfiliado} loading={loadingAcao === 'reavaliar_afi'} text="Aprovar Parceiro" loadingText="Gravando..." className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-sm" />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {modalHistoricoAfiliado && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalHistoricoAfiliado(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-[24px] shadow-2xl p-6 sm:p-8 w-full max-w-2xl relative z-10 flex flex-col max-h-[90vh]">
                            <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">{modalHistoricoAfiliado?.nome}</h3>
                                    <p className="text-xs font-mono text-sky-600 mt-1">Ref: /?ref={modalHistoricoAfiliado?.identificador} | E-mail: {modalHistoricoAfiliado?.email}</p>
                                </div>
                                <button type="button" onClick={() => setModalHistoricoAfiliado(null)} className="text-gray-400 hover:text-red-500"><Icons.Close className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-sky-50 p-4 rounded-2xl border border-sky-100 text-center">
                                        <span className="text-[10px] font-bold text-sky-700 uppercase tracking-widest block">Receita Gerada</span>
                                        <span className="text-lg font-black text-sky-900">R$ {modalHistoricoAfiliado?.receitaGerada?.toFixed(2)}</span>
                                    </div>
                                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
                                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block">Comissão Total</span>
                                        <span className="text-lg font-black text-emerald-900">R$ {modalHistoricoAfiliado?.comissaoTotal?.toFixed(2)}</span>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 text-center">
                                        <span className="text-[10px] font-bold text-purple-700 uppercase tracking-widest block">Vendas Concluídas</span>
                                        <span className="text-lg font-black text-purple-900">{modalHistoricoAfiliado?.vendas}</span>
                                    </div>
                                </div>
                                {modalHistoricoAfiliado?.historicoRecusas?.length > 0 && (
                                    <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                                        <h4 className="text-xs font-bold text-red-700 uppercase tracking-widest mb-2">Histórico de Recusas</h4>
                                        <div className="space-y-2">
                                            {modalHistoricoAfiliado.historicoRecusas.map((item, idx) => (
                                                <p key={idx} className="text-xs text-red-900"><strong className="font-mono">{item.data}:</strong> {item.motivo}</p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="mt-6 pt-4 border-t border-gray-100 flex-shrink-0">
                                <button type="button" onClick={() => setModalHistoricoAfiliado(null)} className="w-full bg-[#0F172A] text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-colors">Fechar Histórico</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {modalAddProduto.isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalAddProduto({ isOpen: false, produtoNome: '', sku: '', comissao: '' })} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-[24px] shadow-2xl p-6 sm:p-8 w-full max-w-md relative z-10">
                            <h3 className="text-xl font-black text-gray-900 mb-2">Adicionar Produto Elegível</h3>
                            <p className="text-xs font-semibold text-gray-500 mb-6">Cadastre um item do catálogo para participar do programa.</p>
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-700 block mb-2">Nome do Produto *</label>
                                    <input type="text" value={modalAddProduto.produtoNome} onChange={e=>setModalAddProduto({...modalAddProduto, produtoNome: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-sky-500" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-700 block mb-2">SKU do Produto *</label>
                                    <input type="text" value={modalAddProduto.sku} onChange={e=>setModalAddProduto({...modalAddProduto, sku: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-black font-mono uppercase outline-none focus:border-sky-500" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-700 block mb-2">Comissão Exclusiva % (Opcional)</label>
                                    <input type="number" min="0" value={modalAddProduto.comissao} onChange={e=>setModalAddProduto({...modalAddProduto, comissao: e.target.value})} style={inputNumberStyle} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-sky-500" />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setModalAddProduto({ isOpen: false, produtoNome: '', sku: '', comissao: '' })} className="flex-1 py-3.5 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold rounded-xl text-sm">Cancelar</button>
                                <ProgressButton onClick={adicionarNovoProdutoElegivel} loading={loadingAcao === 'add_prod'} text="Adicionar" loadingText="Gravando..." className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm" />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {cupomAfiEdit && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCupomAfiEdit(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-[24px] shadow-2xl p-6 sm:p-8 w-full max-w-md relative z-10">
                            <h3 className="text-xl font-black text-gray-900 mb-2">{cupomAfiEdit.isNovo ? 'Criar Cupom de Afiliado' : 'Editar Cupom'}</h3>
                            <p className="text-xs font-semibold text-gray-500 mb-6">Atribua um código promocional exclusivo a um parceiro.</p>
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-700 block mb-2">Selecione o Afiliado *</label>
                                    <select value={cupomAfiEdit.afiliadoId} onChange={e=>setCupomAfiEdit({...cupomAfiEdit, afiliadoId: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-sky-500">
                                        <option value="">Escolha um Afiliado...</option>
                                        {afiliados.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-700 block mb-2">Código do Cupom *</label>
                                    <input type="text" value={cupomAfiEdit.codigo} onChange={e=>setCupomAfiEdit({...cupomAfiEdit, codigo: e.target.value.toUpperCase()})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-black font-mono uppercase outline-none focus:border-sky-500" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-gray-700 block mb-2">Escopo</label>
                                        <select value={cupomAfiEdit.escopo} onChange={e=>setCupomAfiEdit({...cupomAfiEdit, escopo: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-xs font-bold outline-none focus:border-sky-500">
                                            <option value="LOJA">Loja (%)</option>
                                            <option value="FRETE">Frete (R$)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-700 block mb-2">Valor *</label>
                                        <input type="number" min="0" value={cupomAfiEdit.valor} onChange={e=>setCupomAfiEdit({...cupomAfiEdit, valor: e.target.value})} style={inputNumberStyle} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-sky-500" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setCupomAfiEdit(null)} className="flex-1 py-3.5 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold rounded-xl text-sm">Cancelar</button>
                                <ProgressButton onClick={salvarCupomAfiliado} loading={loadingAcao === 'salvar_cupom_afi'} text="Salvar Cupom" loadingText="Gravando..." className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-sm" />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {modalSaqueUpload.isOpen && modalSaqueUpload.saque && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalSaqueUpload({ isOpen: false, saque: null, previewUrl: null })} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-[24px] shadow-2xl p-8 w-full max-w-md relative z-10">
                            <h3 className="text-xl font-black text-gray-900 mb-2">Aprovar Pagamento</h3>
                            <p className="text-xs font-semibold text-gray-500 mb-6">A aprovar o saque de <span className="font-black text-emerald-600">R$ {modalSaqueUpload.saque?.valor?.toFixed(2)}</span>.</p>
                            <div className="space-y-6">
                                <div className="bg-sky-50 p-4 rounded-xl border border-sky-100">
                                    <p className="text-[10px] font-bold text-sky-700 uppercase tracking-widest mb-1">Dados de Pagamento</p>
                                    <p className="text-sm font-black text-gray-900">{modalSaqueUpload.saque?.chavePix} ({modalSaqueUpload.saque?.tipoPix})</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-700 block mb-3">Anexar Comprovante (Obrigatório)</label>
                                    <label className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-sky-300 bg-sky-50 rounded-2xl cursor-pointer hover:bg-sky-100 transition-colors relative overflow-hidden group">
                                        <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) setModalSaqueUpload(prev => ({...prev, previewUrl: URL.createObjectURL(file)}));
                                        }} />
                                        {modalSaqueUpload.previewUrl ? (
                                            <div className="flex flex-col items-center">
                                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2"><Icons.Check className="w-6 h-6" /></div>
                                                <span className="text-xs font-bold text-emerald-700">Comprovante Anexado</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <Icons.Upload className="w-8 h-8 text-sky-400 mb-2" />
                                                <span className="text-xs font-bold text-sky-700">Clique para enviar ficheiro</span>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3">
                                <button type="button" onClick={() => setModalSaqueUpload({ isOpen: false, saque: null, previewUrl: null })} className="flex-1 bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl text-sm">Cancelar</button>
                                <ProgressButton onClick={confirmarPagamentoSaque} loading={loadingAcao === 'pagar_saque'} disabled={!modalSaqueUpload.previewUrl} text="Confirmar Pagamento" loadingText="Registrando..." className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-lg text-sm" />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {afiliadoEmEdicao && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAfiliadoEmEdicao(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-[24px] shadow-2xl p-6 sm:p-8 w-full max-w-md relative z-10">
                            <h3 className="text-xl font-black text-gray-900 mb-2">Configurações VIP do Afiliado</h3>
                            <p className="text-xs font-semibold text-gray-500 mb-6">Atribua taxas exclusivas para <strong className="text-sky-600">{afiliadoEmEdicao.nome}</strong> que sobrepõem as regras globais.</p>
                            
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-700 block mb-2">Taxa Personalizada (%)</label>
                                    <input type="number" min="0" placeholder={`Ex: ${config.taxaGlobal} (Deixe vazio para padrão)`} value={afiliadoEmEdicao.taxaPersonalizada || ''} onChange={e=>setAfiliadoEmEdicao({...afiliadoEmEdicao, taxaPersonalizada: e.target.value ? Number(e.target.value) : null})} style={inputNumberStyle} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-sky-500" />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button type="button" onClick={() => setAfiliadoEmEdicao(null)} className="flex-1 py-3.5 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold rounded-xl text-sm">Cancelar</button>
                                <ProgressButton onClick={salvarConfigAfiliado} loading={loadingAcao === 'salvar_afi'} text="Salvar Regras" loadingText="Gravando..." className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-sm" />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );

    return (
        <div className="w-full min-h-screen bg-[#F8FAFC] pb-20 relative font-sans">
            <Helmet><title>Programa de Afiliados | HUB ADMIN</title></Helmet>
            <GlobalStyles />
            
            <AnimatedNotification show={notif.show} status={notif.status} titulo={notif.titulo} />
            {renderModaisAfiliados()}

            <div className="mb-6 pt-4 px-4 md:px-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Programa de Afiliados</h1>
                        <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1">Gestão de parceiros, comissões, cupons e pagamentos PIX.</p>
                    </div>
                </div>
                
                {/* O MENU ORIGINAL EXATAMENTE COMO PEDIU (COM A LINHA AZUL POR BAIXO) */}
                <div className="flex gap-4 border-b border-gray-200 mt-8 overflow-x-auto no-scrollbar">
                    {['PAINEL', 'AFILIADOS', 'PRODUTOS_AFI', 'CUPONS_AFI', 'SAQUES', 'CONFIGURAÇÕES'].map(tab => (
                        <button type="button" key={tab} onClick={() => setMainTab(tab)} className={`pb-3 sm:pb-4 text-xs sm:text-sm font-bold uppercase tracking-widest relative whitespace-nowrap transition-colors flex-shrink-0 ${mainTab === tab ? 'text-sky-600' : 'text-gray-400 hover:text-gray-800'}`}>
                            {tab === 'PRODUTOS_AFI' ? 'PRODUTOS ELEGÍVEIS' : tab === 'CUPONS_AFI' ? 'CUPONS AFILIADOS' : tab}
                            {mainTab === tab && <motion.div layoutId="mainTabAfiliadosOriginal" className="absolute bottom-0 left-0 right-0 h-[3px] bg-sky-500 rounded-t-full" />}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-4 md:px-8">
                <AnimatePresence mode="wait">
                    {mainTab === 'PAINEL' && renderPainel()}
                    {mainTab === 'AFILIADOS' && renderAfiliados()}
                    {mainTab === 'PRODUTOS_AFI' && renderProdutosAfiliados()}
                    {mainTab === 'CUPONS_AFI' && renderCuponsAfiliados()}
                    {mainTab === 'SAQUES' && renderSaques()}
                    {mainTab === 'CONFIGURAÇÕES' && renderConfiguracoes()}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminAfiliados;