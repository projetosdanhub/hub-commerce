// ============================================================================
// FICHEIRO: resources/js/Modulos/Admin/AdminMarketing.jsx
// ARQUITETURA: Fix Cupons Crash, Notificações, UI "Netflix Style" nas Lojas
// ============================================================================

import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';

// --- ÍCONES OTIMIZADOS E COMPLETOS (BLINDADOS ANTI-CRASH) ---
const Icons = {
    Search: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Close: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
    Plus: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
    Edit: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    Trash: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    Spinner: ({className="w-4 h-4"}) => <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>,
    Check: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>,
    Back: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
    Ticket: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>,
    Coin: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08-.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Star: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
    Store: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    Upload: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>,
    User: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    Calendar: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    TrendingUp: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    Play: ({className="w-5 h-5"}) => <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>,
    Lock: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    Mail: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    AtSymbol: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>,
    Heart: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
    Trophy: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
    Chat: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    Link: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
    Info: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
};

// --- CSS GLOBAIS & SCROLLBAR ---
const inputNumberStyle = { WebkitAppearance: 'none', MozAppearance: 'textfield' };
const GlobalStyles = () => (
    <style dangerouslySetInnerHTML={{__html: `
        input[type="number"]::-webkit-inner-spin-button, input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
    `}} />
);

// --- COMPONENTES AUXILIARES & TRANSIÇÕES ---
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
                    {active ? <motion.div key="1" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-emerald-500 z-10"><Icons.Check /></motion.div>
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
                        <svg className="w-6 h-6 -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                            <motion.circle cx="18" cy="18" r="14" fill="none" stroke="#10B981" strokeWidth="3" strokeDasharray="88" initial={{ strokeDashoffset: 88 }} animate={{ strokeDashoffset: 0 }} transition={{ duration: 1.5, ease: "linear" }} />
                        </svg>
                    ) : (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-400"><Icons.Check /></motion.div>
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
        <span className="relative z-10 flex items-center justify-center gap-2">{loading ? <><Icons.Spinner /> {loadingText}</> : <>{icon} {text}</>}</span>
    </button>
);

// Conversor de data
const parseDataParaFiltro = (dataStr) => {
    if (!dataStr) return 0;
    const partes = dataStr.split('/');
    if (partes.length !== 3) return 0;
    return new Date(partes[2], partes[1] - 1, partes[0]).getTime();
};

// ============================================================================
// COMPONENTE PRINCIPAL MESTRE
// ============================================================================
const AdminMarketing = () => {
    // --- ESTADOS GLOBAIS ---
    const [mainTab, setMainTab] = useState('PAINEL');
    const [loadingAcao, setLoadingAcao] = useState(null);
    const [notif, setNotif] = useState({ show: false, status: 'loading', titulo: '' });

    // --- ESTADOS: MODAIS ---
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [infoTab, setInfoTab] = useState('PRINCIPAIS');
    const [periodoFiltro, setPeriodoFiltro] = useState({ inicio: '01/08/2026', fim: '31/08/2026' });

    // --- ESTADOS: HUB COINS ---
    const [isCoinConfigLocked, setIsCoinConfigLocked] = useState(true);
    const [moedaConfig, setMoedaConfig] = useState({ nome: 'Hub Coins', valorPorCoin: '0.05' });
    const [moedaEditada, setMoedaEditada] = useState({...moedaConfig});

    // --- ESTADOS: RECOMPENSAS (Gamificação) ---
    const [recompensas, setRecompensas] = useState([
        { id: 1, acao: 'Foto de Perfil', descricao: 'Confirma se o cliente adicionou uma foto válida.', moedas: 10, status: 'ATIVO', icone: 'Upload', condicao: 'Possui imagem de perfil' },
        { id: 2, acao: 'Confirmar E-mail', descricao: 'O cliente validou o endereço de e-mail.', moedas: 25, status: 'ATIVO', icone: 'Mail', condicao: 'E-mail status: Verificado' },
        { id: 3, acao: 'Conectar Rede Social', descricao: 'O cliente vinculou no mínimo uma rede social.', moedas: 20, status: 'ATIVO', icone: 'AtSymbol', condicao: 'Possui auth_provider_id' },
        { id: 4, acao: 'Perfil 100% Completo', descricao: 'Preencheu todos os dados base de identificação.', moedas: 150, status: 'INATIVO', icone: 'User', condicao: 'Todos os campos base preenchidos' },
        { id: 5, acao: 'Primeira Compra', descricao: 'Cliente finalizou a sua primeira compra válida.', moedas: 100, status: 'ATIVO', icone: 'Ticket', condicao: 'compras_validas === 1' },
        { id: 6, acao: 'Segunda Compra', descricao: 'O cliente voltou para a sua segunda compra.', moedas: 120, status: 'ATIVO', icone: 'Store', condicao: 'compras_validas === 2' },
        { id: 7, acao: 'Mais de 5 Compras', descricao: 'Cliente atingiu a marca de 6 compras válidas.', moedas: 300, status: 'ATIVO', icone: 'Trophy', condicao: 'compras_validas === 6' },
        { id: 8, acao: 'Mais de 20 Compras', descricao: 'Cliente atingiu a marca de 21 compras.', moedas: 1000, status: 'INATIVO', icone: 'Star', condicao: 'compras_validas === 21' },
        { id: 9, acao: 'Primeira Avaliação', descricao: 'Cliente submeteu a primeira avaliação de produto.', moedas: 50, status: 'ATIVO', icone: 'Chat', condicao: 'avaliacoes_count === 1' },
        { id: 10, acao: '3 Avaliações', descricao: 'O cliente já avaliou 3 produtos.', moedas: 150, status: 'ATIVO', icone: 'Heart', condicao: 'avaliacoes_count === 3' },
        { id: 11, acao: '10 Avaliações', descricao: 'O cliente já avaliou 10 produtos diferentes.', moedas: 500, status: 'INATIVO', icone: 'Star', condicao: 'avaliacoes_count === 10' },
        { id: 12, acao: 'Compra por Indicação', descricao: 'Uma pessoa indicada pelo cliente realizou uma compra.', moedas: 200, status: 'ATIVO', icone: 'Link', condicao: 'afiliados_vendas === 1' },
    ]);
    const [recEmEdicao, setRecEmEdicao] = useState(null);

    // --- ESTADOS: CUPONS ---
    const [cupons, setCupons] = useState([
        { id: 1, codigo: 'BEMVINDO10', tipo: 'PERCENTUAL', valor: 10, escopo: 'LOJA', utilizacoes: 145, limite: 200, validade: '2026-12-31', status: 'ATIVO', naLoja: true, custoCoins: 0, descontoConcedido: 2450.00, receitaGerada: 22050.00, dataCriacao: '2026-08-01', ultimoUso: '2026-08-28' },
        { id: 2, codigo: 'FRETEFREE', tipo: 'FIXO', valor: 25, escopo: 'FRETE', utilizacoes: 320, limite: null, validade: '2026-08-30', status: 'ATIVO', naLoja: false, custoCoins: 500, descontoConcedido: 8000.00, receitaGerada: 45000.00, dataCriacao: '2026-07-15', ultimoUso: '2026-08-29' },
        { id: 3, codigo: 'INVERNO26', tipo: 'PERCENTUAL', valor: 15, escopo: 'LOJA', utilizacoes: 50, limite: 50, validade: '2026-07-31', status: 'ESGOTADO', naLoja: true, custoCoins: 100, descontoConcedido: 950.00, receitaGerada: 5380.00, dataCriacao: '2026-05-10', ultimoUso: '2026-07-30' },
        { id: 4, codigo: 'VIP50', tipo: 'FIXO', valor: 50, escopo: 'LOJA', utilizacoes: 12, limite: 100, validade: null, status: 'ATIVO', naLoja: true, custoCoins: 1000, descontoConcedido: 600.00, receitaGerada: 4200.00, dataCriacao: '2026-08-10', ultimoUso: '2026-08-25' }
    ]);

    const [cupomEmEdicao, setCupomEmEdicao] = useState(null);
    const [errosForm, setErrosForm] = useState({});

    // Modal de Edição Rápida na Loja
    const [cupomEditCoins, setCupomEditCoins] = useState({ isOpen: false, cupomId: null, novoValor: '', codigo: '' });

    // Filtros e Paginação
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('TODOS');
    const [filtroStatus, setFiltroStatus] = useState('TODOS');
    const [itensPorPagina, setItensPorPagina] = useState(10);
    const [paginaAtual, setPaginaAtual] = useState(1);

    useEffect(() => { setPaginaAtual(1); }, [termoPesquisa, filtroTipo, filtroStatus, periodoFiltro, itensPorPagina, mainTab]);

    const cuponsFiltrados = useMemo(() => {
        const dataInicio = parseDataParaFiltro(periodoFiltro.inicio);
        const dataFim = parseDataParaFiltro(periodoFiltro.fim);

        return cupons.filter(c => {
            const search = termoPesquisa.toLowerCase();
            const matchBusca = c.codigo.toLowerCase().includes(search);
            const matchTipo = filtroTipo === 'TODOS' || c.escopo === filtroTipo;
            const matchStatus = filtroStatus === 'TODOS' || c.status === filtroStatus;
            
            let matchData = true;
            if (c.dataCriacao) {
                const dataCupom = parseDataParaFiltro(c.dataCriacao.split('-').reverse().join('/'));
                matchData = dataCupom >= dataInicio && dataCupom <= dataFim;
            }

            return matchBusca && matchTipo && matchStatus && matchData;
        });
    }, [cupons, termoPesquisa, filtroTipo, filtroStatus, periodoFiltro]);

    const indexUltimoItem = paginaAtual * itensPorPagina;
    const indexPrimeiroItem = indexUltimoItem - itensPorPagina;
    const cuponsPaginados = cuponsFiltrados.slice(indexPrimeiroItem, indexUltimoItem);
    const totalPaginas = Math.ceil(cuponsFiltrados.length / itensPorPagina);


    // --- FUNÇÕES: AÇÕES DE CUPONS ---
    const fecharEditor = () => {
        setErrosForm({});
        setMainTab('CUPONS');
        // Usa setTimeout para evitar tela branca enquanto a animação fecha
        setTimeout(() => {
            setCupomEmEdicao(null);
        }, 300);
    };

    const abrirNovoCupom = () => {
        setCupomEmEdicao({
            id: Date.now(), isNovo: true, codigo: '', tipo: 'PERCENTUAL', valor: '', escopo: 'LOJA', 
            utilizacoes: 0, limite: '', validade: '', status: 'ATIVO', naLoja: false, custoCoins: 0, 
            descontoConcedido: 0, receitaGerada: 0, ultimoUso: null, dataCriacao: new Date().toISOString().split('T')[0]
        });
        setErrosForm({});
        setMainTab('EDITOR_CUPOM');
    };

    const abrirEdicaoCupom = (cupom) => {
        setCupomEmEdicao({ ...cupom, isNovo: false });
        setErrosForm({});
        setMainTab('EDITOR_CUPOM');
    };

    const salvarCupom = () => {
        const erros = {};
        if (!cupomEmEdicao?.codigo?.trim()) erros.codigo = true;
        if (!cupomEmEdicao?.valor || Number(cupomEmEdicao.valor) <= 0) erros.valor = true;

        const duplicado = cupons.find(c => c.codigo === cupomEmEdicao?.codigo && c.id !== cupomEmEdicao?.id && c.status === 'ATIVO');
        if (duplicado) {
            alert("Já existe um cupom ATIVO com este código.");
            return;
        }

        if (Object.keys(erros).length > 0) {
            setErrosForm(erros);
            return;
        }

        const tituloSucesso = cupomEmEdicao.isNovo ? "Cupom criado com sucesso!" : "Cupom atualizado com sucesso!";
        setNotif({ show: true, status: 'loading', titulo: tituloSucesso });
        setLoadingAcao('salvar');

        setTimeout(() => {
            const p = { 
                ...cupomEmEdicao, 
                codigo: cupomEmEdicao.codigo.toUpperCase().trim(),
                valor: parseFloat(cupomEmEdicao.valor),
                limite: cupomEmEdicao.limite ? parseInt(cupomEmEdicao.limite) : null,
                custoCoins: cupomEmEdicao.custoCoins ? parseInt(cupomEmEdicao.custoCoins) : 0
            };

            if (p.isNovo) setCupons([p, ...cupons]);
            else setCupons(prev => prev.map(c => c.id === p.id ? p : c));
            
            setNotif(prev => ({ ...prev, status: 'success' }));
            setMainTab('CUPONS');
            
            setTimeout(() => {
                setLoadingAcao(null);
                setCupomEmEdicao(null);
                setNotif({ show: false, status: 'loading', titulo: '' });
            }, 500);
        }, 1500);
    };

    const deletarCupom = (cupom) => {
        if (cupom.utilizacoes > 0) {
            if(window.confirm(`ATENÇÃO: Este cupom já concedeu descontos (${cupom.utilizacoes} usos).\nPara proteger os relatórios financeiros, ele será apenas INATIVADO. Confirmar?`)) {
                setCupons(prev => prev.map(c => c.id === cupom.id ? { ...c, status: 'INATIVO', naLoja: false } : c));
            }
        } else {
            if(window.confirm("Cupom nunca utilizado. Deseja excluir permanentemente?")) {
                setCupons(prev => prev.filter(c => c.id !== cupom.id));
            }
        }
    };

    const toggleStatusCupom = (id) => {
        setCupons(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'ATIVO' ? 'INATIVO' : 'ATIVO', naLoja: c.status === 'ATIVO' ? false : c.naLoja } : c));
    };

    const processarEdicaoRapidaCoins = () => {
        setNotif({ show: true, status: 'loading', titulo: 'A atualizar Loja...' });
        setLoadingAcao('salvar_coins');
        setTimeout(() => {
            setCupons(prev => prev.map(c => c.id === cupomEditCoins.cupomId ? { ...c, custoCoins: Number(cupomEditCoins.novoValor) } : c));
            setLoadingAcao(null);
            setCupomEditCoins({ isOpen: false, cupomId: null, novoValor: '', codigo: '' });
            setNotif({ show: true, status: 'success', titulo: 'Custo atualizado!' });
            setTimeout(() => setNotif({ show: false, status: '', titulo: '' }), 2000);
        }, 1000);
    };

    // --- FUNÇÕES: MOEDAS E RECOMPENSAS ---
    const salvarMoedaConfig = () => {
        const valNum = parseFloat(moedaEditada.valorPorCoin);
        if (!moedaEditada.nome.trim() || isNaN(valNum) || valNum <= 0) {
            alert("Preencha o nome e um valor em Reais maior que zero (Ex: 0.05).");
            return;
        }
        setNotif({ show: true, status: 'loading', titulo: 'A guardar regras...' });
        setLoadingAcao('salvar_moeda');

        setTimeout(() => {
            setMoedaConfig({...moedaEditada, valorPorCoin: valNum.toString()});
            setIsCoinConfigLocked(true);
            setNotif(prev => ({ ...prev, status: 'success', titulo: 'Regras de moeda salvas!' }));
            setTimeout(() => {
                setLoadingAcao(null);
                setNotif({ show: false, status: 'loading', titulo: '' });
            }, 1500);
        }, 1000);
    };

    const toggleRecompensaStatus = (id) => setRecompensas(prev => prev.map(r => r.id === id ? { ...r, status: r.status === 'ATIVO' ? 'INATIVO' : 'ATIVO' } : r));
    const updateRecompensaMoedas = (id, val) => setRecompensas(prev => prev.map(r => r.id === id ? { ...r, moedas: val } : r));

    const salvarEdicaoRecompensa = () => {
        setNotif({ show: true, status: 'loading', titulo: 'A guardar recompensa...' });
        setLoadingAcao('salvar_rec');
        setTimeout(() => {
            setRecEmEdicao(null);
            setLoadingAcao(null);
            setNotif({ show: true, status: 'success', titulo: 'Recompensa atualizada!' });
            setTimeout(() => setNotif({ show: false, status: '', titulo: '' }), 1500);
        }, 800);
    };


    // ============================================================================
    // RENDER: PAINEL (DASHBOARD ANALÍTICO EM BARRA UNIFICADA)
    // ============================================================================
    const renderPainel = () => {
        const ativos = cuponsFiltrados.filter(c => c.status === 'ATIVO').length;
        const inativos = cuponsFiltrados.filter(c => c.status === 'INATIVO').length;
        const expirados = cuponsFiltrados.filter(c => c.status === 'EXPIRADO').length;
        const descontoConcedido = cuponsFiltrados.reduce((acc, c) => acc + (c.descontoConcedido || 0), 0);
        const freteSubsidiado = cuponsFiltrados.filter(c => c.escopo === 'FRETE').reduce((acc, c) => acc + (c.descontoConcedido || 0), 0);
        const receitaGeradaTotal = cuponsFiltrados.reduce((acc, c) => acc + (c.receitaGerada || 0), 0);

        return (
            <FadeIn key="painel" className="space-y-6 pb-10">
                
                {/* Header do Painel com Central de Ajuda */}
                <div className="bg-white p-5 sm:p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
                    <div className="flex items-center gap-3">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                Dashboard de Performance
                                <button type="button" onClick={() => setInfoModalOpen(true)} className="text-gray-400 hover:text-sky-500 transition-colors" title="Ver explicação das métricas">
                                    <Icons.Info className="w-5 h-5" />
                                </button>
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Análise do impacto dos cupons no período selecionado.</p>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button type="button" onClick={() => setIsDateModalOpen(true)} className="w-full bg-gray-50 border border-gray-200 text-sm font-bold text-gray-700 rounded-xl px-5 sm:px-6 py-3 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap">
                            <Icons.Calendar className="w-4 h-4" /> {periodoFiltro.inicio} a {periodoFiltro.fim}
                        </button>
                    </div>
                </div>

                {/* Barra de Métricas Unificada (Estilo Pedidos) */}
                <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                    
                    {/* Bloco 1: Ativos */}
                    <div className="flex-1 p-6 hover:bg-emerald-50 transition-colors flex flex-col justify-center min-w-0">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest truncate">Ativos</span>
                            <Icons.Check className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-emerald-700 truncate">{ativos}</p>
                    </div>

                    {/* Bloco 2: Inativos/Expirados */}
                    <div className="flex-1 p-6 hover:bg-red-50 transition-colors flex flex-col justify-center min-w-0">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest truncate">Inat./Exp.</span>
                            <Icons.Close className="w-4 h-4 text-red-500" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-red-700 truncate">{inativos + expirados}</p>
                    </div>

                    {/* Bloco 3: Sub Frete */}
                    <div className="flex-1 p-6 hover:bg-purple-50 transition-colors flex flex-col justify-center min-w-0">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest truncate">Sub. Frete</span>
                            <Icons.Store className="w-4 h-4 text-purple-500" />
                        </div>
                        <p className="text-xl font-black text-purple-700 truncate">R$ {freteSubsidiado.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                    </div>

                    {/* Bloco 4: Descontos */}
                    <div className="flex-1 p-6 hover:bg-sky-50 transition-colors flex flex-col justify-center min-w-0">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest truncate">Descontos</span>
                            <Icons.TrendingUp className="w-4 h-4 text-sky-500" />
                        </div>
                        <p className="text-xl font-black text-sky-700 truncate">R$ {descontoConcedido.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                    </div>

                    {/* Bloco 5: Receita (Destaque Dark) */}
                    <div className="flex-[1.5] p-6 bg-slate-900 relative overflow-hidden group flex flex-col justify-center min-w-0">
                        <div className="absolute -right-4 -top-4 w-32 h-32 bg-emerald-500 opacity-20 rounded-full blur-3xl group-hover:opacity-40 transition-opacity"></div>
                        <div className="flex justify-between items-center mb-2 relative z-10">
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest truncate">Receita Gerada</span>
                            <Icons.TrendingUp className="w-4 h-4 text-emerald-400" />
                        </div>
                        <p className="text-xl sm:text-3xl font-black text-white relative z-10 truncate">R$ {receitaGeradaTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                    </div>
                </div>

                {/* Performance Detalhada (Tabela limpa de Tooltips) */}
                <div className="bg-white border border-gray-100 rounded-[24px] shadow-sm overflow-hidden mt-6">
                    <div className="p-5 sm:p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div>
                            <h3 className="text-lg font-black text-gray-900">Performance Detalhada</h3>
                            <p className="text-xs text-gray-500 mt-1">Acompanhe as métricas financeiras e taxas de utilização de cada cupom.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <div className="relative w-full sm:w-[250px]">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Icons.Search className="w-4 h-4" /></div>
                                <input type="text" placeholder="Buscar Código..." value={termoPesquisa} onChange={e=>setTermoPesquisa(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-sky-500 transition-all shadow-sm" />
                            </div>
                            <select value={filtroStatus} onChange={e=>setFiltroStatus(e.target.value)} className="w-full sm:w-auto bg-white border border-gray-200 text-xs font-bold text-gray-600 rounded-xl px-4 py-3 outline-none cursor-pointer shadow-sm">
                                <option value="TODOS">Todos os Status</option>
                                <option value="ATIVO">Ativos</option>
                                <option value="INATIVO">Inativos</option>
                                <option value="EXPIRADO">Expirados</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto w-full custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-white border-b border-gray-100 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                                    <th className="p-4 sm:p-5 pl-6 sm:pl-8">Código & Regra</th>
                                    <th className="p-4 sm:p-5 text-center">Usos / Limite</th>
                                    <th className="p-4 sm:p-5 text-right">Desconto Gerado</th>
                                    <th className="p-4 sm:p-5 text-right">Receita Bruta</th>
                                    <th className="p-4 sm:p-5 text-center">Último Uso</th>
                                    <th className="p-4 sm:p-5 pr-6 sm:pr-8 text-center whitespace-nowrap">Status / Loja</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {cuponsPaginados.map(c => {
                                    const taxaUso = c.limite ? ((c.utilizacoes / c.limite) * 100).toFixed(0) : 0;
                                    
                                    return (
                                    <tr key={c.id} className="hover:bg-sky-50/30 transition-colors group">
                                        <td className="p-4 sm:p-5 pl-6 sm:pl-8">
                                            <div className="flex items-center gap-3 sm:gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 ${c.status === 'ATIVO' ? 'bg-sky-500 text-white' : 'bg-gray-200 text-gray-500'}`}><Icons.Ticket className="w-5 h-5" /></div>
                                                <div className="flex flex-col">
                                                    <span className="font-mono text-xs sm:text-sm font-black text-gray-900 tracking-wider">{c.codigo}</span>
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <span className="font-black text-emerald-600 text-[10px] sm:text-[11px]">{c.tipo === 'PERCENTUAL' ? `${c.valor || 0}% OFF` : `R$ ${Number(c.valor || 0).toFixed(2)}`}</span>
                                                        <span className="text-gray-300">•</span>
                                                        <span className={`text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded uppercase whitespace-nowrap ${c.escopo === 'LOJA' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>Em {c.escopo}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 sm:p-5 text-center">
                                            <div className="flex flex-col items-center justify-center gap-1.5">
                                                <div className="flex items-center gap-1">
                                                    <span className="font-bold text-gray-900 text-sm">{c.utilizacoes}</span>
                                                    <span className="text-gray-400 text-xs">/</span>
                                                    <span className="text-[10px] font-semibold text-gray-500">{c.limite ? c.limite : '∞'}</span>
                                                </div>
                                                {c.limite && (
                                                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className={`h-full ${taxaUso >= 90 ? 'bg-red-500' : 'bg-sky-500'}`} style={{ width: `${taxaUso}%` }}></div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 sm:p-5 text-right">
                                            <span className="font-bold text-red-500 text-sm whitespace-nowrap">- R$ {Number(c.descontoConcedido || 0).toLocaleString('pt-BR', {minimumFractionDigits:2})}</span>
                                        </td>
                                        <td className="p-4 sm:p-5 text-right">
                                            <span className="font-black text-emerald-600 text-base flex justify-end items-center gap-1.5 whitespace-nowrap"><Icons.TrendingUp className="w-4 h-4" /> R$ {Number(c.receitaGerada || 0).toLocaleString('pt-BR', {minimumFractionDigits:2})}</span>
                                        </td>
                                        <td className="p-4 sm:p-5 text-center">
                                            <span className="font-mono text-xs font-bold text-gray-800">{c.ultimoUso ? c.ultimoUso.split('-').reverse().join('/') : '-'}</span>
                                        </td>
                                        <td className="p-4 sm:p-5 pr-6 sm:pr-8 text-center">
                                            <div className="flex flex-col items-center gap-1.5 whitespace-nowrap">
                                                <span className={`text-[8px] sm:text-[9px] font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg uppercase tracking-wider border block w-max mx-auto ${c.status==='ATIVO'?'bg-emerald-50 text-emerald-600 border-emerald-100':c.status==='INATIVO'?'bg-gray-100 text-gray-500 border-gray-200':c.status==='ESGOTADO'?'bg-orange-50 text-orange-600 border-orange-100':'bg-red-50 text-red-600 border-red-100'}`}>{c.status}</span>
                                                {c.naLoja ? (
                                                    <span className="text-[9px] font-bold text-sky-600 flex items-center justify-center gap-1"><Icons.Store className="w-3 h-3" /> Público</span>
                                                ) : (
                                                    <span className="text-[9px] font-bold text-gray-400">Privado</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )})}
                                {cuponsPaginados.length === 0 && <tr><td colSpan="6" className="p-10 sm:p-16 text-center text-gray-400 text-sm sm:text-base font-medium">Nenhum cupom atende aos filtros atuais.</td></tr>}
                            </tbody>
                        </table>
                    </div>

                    {cuponsFiltrados.length > 0 && (
                        <div className="bg-white p-4 sm:p-5 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center text-xs font-bold text-gray-600 gap-4">
                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                                <span>Itens por página:</span>
                                <select value={itensPorPagina} onChange={(e) => setItensPorPagina(Number(e.target.value))} className="bg-gray-50 border border-gray-200 rounded-lg px-2 sm:px-3 py-1 sm:py-2 outline-none cursor-pointer">
                                    <option value={10}>10</option><option value={20}>20</option><option value={30}>30</option><option value={50}>50</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                <span>Página {paginaAtual} de {totalPaginas || 1}</span>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setPaginaAtual(p => Math.max(1, p - 1))} disabled={paginaAtual === 1} className="w-8 h-8 sm:w-9 h-9 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-50 transition-colors">&lt;</button>
                                    <button type="button" onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))} disabled={paginaAtual === totalPaginas || totalPaginas === 0} className="w-8 h-8 sm:w-9 h-9 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-50 transition-colors">&gt;</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </FadeIn>
        );
    };

    // ============================================================================
    // RENDER: HUB COINS
    // ============================================================================
    const renderHubCoins = () => {
        return (
            <FadeIn key="hubcoins" className="pb-10 space-y-8">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 sm:p-8 rounded-[24px] shadow-2xl relative overflow-hidden flex flex-col lg:flex-row gap-8 items-center border border-slate-700">
                    <div className="absolute -left-6 -top-6 w-64 h-64 bg-yellow-400 opacity-10 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <div className="flex-1 relative z-10 w-full">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-yellow-500/20 text-yellow-400 rounded-xl flex items-center justify-center"><Icons.Coin className="w-5 h-5" /></div>
                            <h2 className="text-2xl sm:text-3xl font-black text-white">Hub Coins</h2>
                        </div>
                        <p className="text-sm text-slate-400 mb-8">Defina o nome da sua moeda virtual e qual o valor financeiro exato de 1 moeda. O valor fica bloqueado para evitar alterações acidentais na matemática da loja.</p>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Nome Personalizado na Loja</label>
                                <input type="text" disabled={isCoinConfigLocked} value={moedaEditada.nome || ''} onChange={e=>setMoedaEditada({...moedaEditada, nome: e.target.value})} className="w-full sm:w-1/2 bg-slate-900/50 border border-slate-600 rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base font-bold text-white outline-none focus:border-yellow-400 shadow-inner disabled:opacity-70 transition-all" />
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Valor Real da Moeda (1 {moedaEditada.nome || 'Coin'} = R$)</label>
                                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/50 border border-slate-600 p-4 sm:p-5 rounded-2xl w-full lg:w-3/4 shadow-inner">
                                    <div className="flex-1 w-full bg-slate-800 rounded-xl py-3 sm:py-4 flex flex-col items-center justify-center border border-slate-700">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">1 {moedaEditada.nome || 'Moeda'}</span>
                                        <span className="text-xl sm:text-2xl font-black text-yellow-400"><Icons.Coin className="w-6 h-6" /></span>
                                    </div>
                                    <div className="text-slate-500 font-black text-xl sm:text-2xl mt-2 sm:mt-0">=</div>
                                    <div className="flex-[2] w-full">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 text-center">Desconto Gerado (R$)</label>
                                        <div className="relative">
                                            <div className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 font-black text-emerald-600/50 text-lg sm:text-xl">R$</div>
                                            <input 
                                                type="number" min="0" step="0.01" 
                                                disabled={isCoinConfigLocked} 
                                                value={moedaEditada.valorPorCoin ?? ''} 
                                                onChange={e => setMoedaEditada({...moedaEditada, valorPorCoin: e.target.value})} 
                                                style={inputNumberStyle} 
                                                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-12 sm:pl-14 pr-12 py-3 sm:py-4 text-xl sm:text-2xl font-black text-emerald-400 outline-none focus:border-emerald-500 shadow-sm disabled:opacity-70 transition-all" 
                                            />
                                            {isCoinConfigLocked && (
                                                <button type="button" onClick={() => setIsCoinConfigLocked(false)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-yellow-400 transition-colors z-20" title="Editar Valor">
                                                    <Icons.Edit className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Simulador de Visão do Cliente */}
                    <div className="w-full lg:w-[350px] flex flex-col items-center justify-center p-6 sm:p-8 bg-slate-800/50 rounded-[24px] border border-slate-700/50 relative z-10 shadow-inner">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 sm:mb-5 text-center">Simulador no Checkout</p>
                        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xl w-full flex flex-col gap-4 border border-gray-100">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Saldo do Cliente</span>
                                    <span className="text-sm sm:text-base font-black text-yellow-500 flex items-center gap-1.5 mt-1"><Icons.Coin className="w-4 h-4" /> 5.000</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] sm:text-xs font-bold text-gray-600">Poder de Desconto</span>
                                <span className="text-base sm:text-lg font-black text-emerald-600 bg-emerald-50 px-2 sm:px-3 py-1 rounded-lg">R$ {(5000 * (parseFloat(moedaEditada.valorPorCoin) || 0)).toFixed(2)}</span>
                            </div>
                        </div>
                        {!isCoinConfigLocked ? (
                            <ProgressButton onClick={salvarMoedaConfig} loading={loadingAcao === 'salvar_moeda'} text="Salvar Nova Regra" loadingText="Salvando..." icon={<Icons.Check className="w-5 h-5" />} className="w-full mt-6 sm:mt-8 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-black py-3 sm:py-4 rounded-xl transition-colors shadow-lg shadow-yellow-500/20 text-xs sm:text-sm" />
                        ) : (
                            <div className="w-full mt-6 sm:mt-8 flex items-center justify-center gap-2 text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest py-3 sm:py-4 border border-slate-700 rounded-xl bg-slate-800/50">
                                <Icons.Lock className="w-4 h-4" /> Valor Bloqueado
                            </div>
                        )}
                    </div>
                </div>
            </FadeIn>
        );
    };

    // ============================================================================
    // RENDER: RECOMPENSAS (Gamificação Premium c/ Nova UI de Edição)
    // ============================================================================
    const renderRecompensas = () => {
        return (
            <FadeIn key="recompensas" className="pb-10">
                <div className="bg-white p-5 sm:p-8 rounded-[24px] border border-gray-100 shadow-sm">
                    <div className="mb-6 sm:mb-8 border-b border-gray-100 pb-4 sm:pb-5">
                        <h2 className="text-lg sm:text-xl font-black text-gray-900">Como Ganhar {moedaConfig.nome}</h2>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">Defina a quantidade de moedas que o cliente ganha ao realizar ações no sistema de gamificação.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
                        {recompensas.map(rec => {
                            const isEditing = recEmEdicao === rec.id;
                            return (
                                <div key={rec.id} className={`p-5 sm:p-6 rounded-[24px] border-2 transition-all relative flex flex-col group ${rec.status === 'ATIVO' ? 'border-sky-200 bg-sky-50/30 shadow-sm hover:shadow-md hover:border-sky-300' : 'border-gray-100 bg-gray-50'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0 ${rec.status === 'ATIVO' ? 'bg-sky-500 text-white shadow-sky-500/30' : 'bg-gray-200 text-gray-500'}`}>
                                            {rec.icone === 'Star' && <Icons.Star className="w-5 h-5" />}
                                            {rec.icone === 'Edit' && <Icons.Edit className="w-5 h-5" />}
                                            {rec.icone === 'Upload' && <Icons.Upload className="w-5 h-5" />}
                                            {rec.icone === 'User' && <Icons.User className="w-5 h-5" />}
                                            {rec.icone === 'Play' && <Icons.Play className="w-5 h-5" />}
                                            {rec.icone === 'Mail' && <Icons.Mail className="w-5 h-5" />}
                                            {rec.icone === 'AtSymbol' && <Icons.AtSymbol className="w-5 h-5" />}
                                            {rec.icone === 'Heart' && <Icons.Heart className="w-5 h-5" />}
                                            {rec.icone === 'Trophy' && <Icons.Trophy className="w-5 h-5" />}
                                            {rec.icone === 'Ticket' && <Icons.Ticket className="w-5 h-5" />}
                                            {rec.icone === 'Store' && <Icons.Store className="w-5 h-5" />}
                                            {rec.icone === 'Link' && <Icons.Link className="w-5 h-5" />}
                                            {rec.icone === 'Chat' && <Icons.Chat className="w-5 h-5" />}
                                        </div>
                                        <button type="button" onClick={() => toggleRecompensaStatus(rec.id)} className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-colors whitespace-nowrap flex-shrink-0 ${rec.status === 'ATIVO' ? 'bg-sky-100 text-sky-700 hover:bg-red-100 hover:text-red-600' : 'bg-gray-200 text-gray-500 hover:bg-emerald-100 hover:text-emerald-600'}`}>
                                            {rec.status === 'ATIVO' ? 'Ligado' : 'Desligado'}
                                        </button>
                                    </div>
                                    
                                    <h3 className={`text-base sm:text-lg font-black mb-1 sm:mb-2 ${rec.status === 'ATIVO' ? 'text-gray-900' : 'text-gray-400'}`}>{rec.acao}</h3>
                                    <p className="text-[11px] sm:text-xs text-gray-500 mb-6 flex-1 min-h-[40px] font-medium leading-relaxed">{rec.descricao}</p>
                                    
                                    {/* Novo Bloco de Edição Alinhado (Estilo Loja de Cupons) */}
                                    <div className="bg-white border border-gray-200 rounded-2xl p-3 sm:p-4 flex flex-col shadow-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recompensa</span>
                                            {rec.status === 'ATIVO' && (
                                                <button type="button" onClick={() => isEditing ? setRecEmEdicao(null) : setRecEmEdicao(rec.id)} className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-[10px] font-bold border ${isEditing ? 'text-gray-500 bg-gray-50 border-gray-200 hover:bg-gray-100' : 'text-sky-600 bg-sky-50 border-sky-200 hover:bg-sky-100 shadow-sm hover:shadow'}`}>
                                                    {isEditing ? <><Icons.Close className="w-3 h-3" /> Cancelar</> : <><Icons.Edit className="w-3 h-3" /> Editar</>}
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-50/50 to-white border border-yellow-100 rounded-xl px-3 py-2 w-max">
                                            <Icons.Coin className="w-5 h-5 text-yellow-500" />
                                            {isEditing ? (
                                                <input 
                                                    type="number" min="0" 
                                                    value={rec.moedas || ''} 
                                                    onChange={e => updateRecompensaMoedas(rec.id, e.target.value)} 
                                                    style={inputNumberStyle} 
                                                    className="w-20 text-xl font-black outline-none transition-all rounded-lg bg-white text-yellow-700 border border-yellow-300 px-2 py-0.5 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 shadow-inner" 
                                                />
                                            ) : (
                                                <span className="text-xl font-black text-yellow-600">{rec.moedas}</span>
                                            )}
                                        </div>

                                        <AnimatePresence>
                                            {isEditing && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-3">
                                                    <ProgressButton onClick={salvarEdicaoRecompensa} loading={loadingAcao === 'salvar_rec'} text="Confirmar Valor" loadingText="Gravando" icon={<Icons.Check className="w-4 h-4" />} className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors shadow-sm" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="text-[9px] font-mono text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100 mt-3 truncate" title={rec.condicao}>
                                            Critério: {rec.condicao}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </FadeIn>
        );
    };

    // ============================================================================
    // RENDER: LISTA DE CUPONS (GESTÃO OPERACIONAL)
    // ============================================================================
    const renderListaCupons = () => {
        return (
            <FadeIn key="listacupons" className="pb-10">
                <div className="bg-white p-5 sm:p-6 rounded-t-[24px] border border-b-0 border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-[350px]">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Icons.Search className="w-4 h-4" /></div>
                        <input type="text" placeholder="Buscar Código..." value={termoPesquisa} onChange={e=>setTermoPesquisa(e.target.value)} className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:border-sky-500 transition-all" />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <select value={filtroTipo} onChange={e=>setFiltroTipo(e.target.value)} className="w-full sm:w-auto bg-gray-50 border border-gray-200 text-xs sm:text-sm font-bold text-gray-600 rounded-xl px-4 py-3 sm:py-2 outline-none cursor-pointer">
                            <option value="TODOS">Todos os Escopos</option>
                            <option value="LOJA">Apenas Loja</option>
                            <option value="FRETE">Apenas Frete</option>
                        </select>
                        <select value={filtroStatus} onChange={e=>setFiltroStatus(e.target.value)} className="w-full sm:w-auto bg-gray-50 border border-gray-200 text-xs sm:text-sm font-bold text-gray-600 rounded-xl px-4 py-3 sm:py-2 outline-none cursor-pointer">
                            <option value="TODOS">Todos Status</option>
                            <option value="ATIVO">Ativos</option>
                            <option value="INATIVO">Inativos</option>
                            <option value="EXPIRADO">Expirados</option>
                        </select>
                        <button type="button" onClick={abrirNovoCupom} className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-colors whitespace-nowrap">
                            <Icons.Plus className="w-5 h-5" /> Novo Cupom
                        </button>
                    </div>
                </div>

                <div className="bg-white border border-gray-100 shadow-sm overflow-x-auto w-full custom-scrollbar pb-10">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-white border-b border-gray-100 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                                <th className="p-4 sm:p-5 pl-6 sm:pl-8">Código</th>
                                <th className="p-4 sm:p-5 text-right">Benefício</th>
                                <th className="p-4 sm:p-5 text-center">Usos / Limite</th>
                                <th className="p-4 sm:p-5 text-center">Validade</th>
                                <th className="p-4 sm:p-5 text-center whitespace-nowrap">Status / Loja</th>
                                <th className="p-4 sm:p-5 pr-6 sm:pr-8 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {cuponsPaginados.map(c => (
                                <tr key={c.id} className="hover:bg-sky-50/30 transition-colors group">
                                    <td className="p-4 sm:p-5 pl-6 sm:pl-8">
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 ${c.status === 'ATIVO' ? 'bg-sky-500 text-white' : 'bg-gray-200 text-gray-500'}`}><Icons.Ticket className="w-5 h-5" /></div>
                                            <div className="flex flex-col">
                                                <span className="font-mono text-xs sm:text-sm font-black text-gray-900 tracking-wider">{c.codigo}</span>
                                                <span className={`text-[8px] sm:text-[9px] font-bold px-1.5 sm:px-2 py-0.5 rounded uppercase mt-1 w-max ${c.escopo === 'LOJA' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>Aplicar em: {c.escopo}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 sm:p-5 text-right">
                                        <span className="font-black text-emerald-600 text-sm sm:text-base">{c.tipo === 'PERCENTUAL' ? `${c.valor || 0}% OFF` : `R$ ${Number(c.valor || 0).toFixed(2)}`}</span>
                                    </td>
                                    <td className="p-4 sm:p-5 text-center">
                                        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                                            <span className="font-bold text-gray-900 text-sm">{c.utilizacoes}</span>
                                            <span className="text-gray-400 text-xs">/</span>
                                            <span className="text-[10px] sm:text-xs font-semibold text-gray-500">{c.limite ? c.limite : '∞'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 sm:p-5 text-center font-mono text-[10px] sm:text-xs font-bold text-gray-600">{c.validade ? c.validade.split('-').reverse().join('/') : 'Sem validade'}</td>
                                    <td className="p-4 sm:p-5 text-center">
                                        <div className="flex flex-col items-center gap-1 whitespace-nowrap">
                                            <span className={`text-[8px] sm:text-[9px] font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg uppercase tracking-wider border block w-max mx-auto ${c.status==='ATIVO'?'bg-emerald-50 text-emerald-600 border-emerald-100':c.status==='INATIVO'?'bg-gray-100 text-gray-500 border-gray-200':c.status==='ESGOTADO'?'bg-orange-50 text-orange-600 border-orange-100':'bg-red-50 text-red-600 border-red-100'}`}>{c.status}</span>
                                            {c.naLoja ? (
                                                <span className="text-[8px] font-bold text-sky-600 uppercase mt-1 flex items-center justify-center gap-1"><Icons.Store className="w-3 h-3" /> Público</span>
                                            ) : (
                                                <span className="text-[8px] font-bold text-gray-400">Privado</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 sm:p-5 pr-6 sm:pr-8 text-right">
                                        <div className="flex justify-end gap-2 opacity-100 lg:opacity-50 group-hover:opacity-100 transition-opacity">
                                            <button type="button" onClick={() => toggleStatusCupom(c.id)} className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl transition-colors border shadow-sm ${c.status === 'ATIVO' ? 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'}`} title={c.status === 'ATIVO' ? "Desativar" : "Ativar"}>
                                                {c.status === 'ATIVO' ? <Icons.Close className="w-4 h-4" /> : <Icons.Check className="w-4 h-4" />}
                                            </button>
                                            <button type="button" onClick={() => abrirEdicaoCupom(c)} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-sky-600 bg-sky-50 hover:bg-sky-100 border border-sky-100 rounded-xl transition-colors shadow-sm"><Icons.Edit className="w-4 h-4" /></button>
                                            <button type="button" onClick={() => deletarCupom(c)} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-colors shadow-sm"><Icons.Trash className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {cuponsPaginados.length === 0 && <tr><td colSpan="6" className="p-10 sm:p-16 text-center text-gray-400 text-sm sm:text-base font-medium">Nenhum cupom atende aos filtros atuais.</td></tr>}
                        </tbody>
                    </table>
                </div>

                {cuponsFiltrados.length > 0 && (
                    <div className="bg-white p-4 sm:p-5 border-t border-gray-100 rounded-b-[24px] flex flex-col sm:flex-row justify-between items-center text-xs font-bold text-gray-600 shadow-sm gap-4">
                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                            <span>Itens por página:</span>
                            <select value={itensPorPagina} onChange={(e) => setItensPorPagina(Number(e.target.value))} className="bg-gray-50 border border-gray-200 rounded-lg px-2 sm:px-3 py-1 sm:py-2 outline-none cursor-pointer">
                                <option value={10}>10</option><option value={20}>20</option><option value={30}>30</option><option value={50}>50</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                            <span>Página {paginaAtual} de {totalPaginas || 1}</span>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setPaginaAtual(p => Math.max(1, p - 1))} disabled={paginaAtual === 1} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-50 transition-colors">&lt;</button>
                                <button type="button" onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))} disabled={paginaAtual === totalPaginas || totalPaginas === 0} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-50 transition-colors">&gt;</button>
                            </div>
                        </div>
                    </div>
                )}
            </FadeIn>
        );
    };

    // ============================================================================
    // RENDER: LOJA DE CUPONS (PÚBLICOS COM EDIÇÃO RÁPIDA DE COINS ALINHADA)
    // ============================================================================
    const renderLojaCupons = () => {
        const cuponsPublicos = cupons.filter(c => c.naLoja && c.status === 'ATIVO');
        
        return (
            <FadeIn key="loja" className="pb-10 space-y-6">
                
                {/* Modal Edição Rápida Coins */}
                <AnimatePresence>
                    {cupomEditCoins.isOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCupomEditCoins({ isOpen: false, cupomId: null, novoValor: '', codigo: '' })} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-[24px] shadow-2xl p-6 sm:p-8 w-full max-w-sm relative z-10">
                                <h3 className="text-xl font-black text-gray-900 mb-2">Atenção!</h3>
                                <p className="text-xs font-semibold text-gray-500 mb-6 leading-relaxed">Você está prestes a alterar o custo em Coins do cupom <span className="font-bold text-sky-600">{cupomEditCoins?.codigo}</span>. Essa alteração afetará o valor necessário para os novos clientes resgatarem o cupom.</p>
                                
                                <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl mb-6">
                                    <label className="text-[10px] font-bold text-sky-800 uppercase tracking-widest block mb-2">Novo Custo (Coins)</label>
                                    <input type="number" min="0" value={cupomEditCoins?.novoValor ?? ''} onChange={e=>setCupomEditCoins({...cupomEditCoins, novoValor: e.target.value})} style={inputNumberStyle} className="w-full bg-white border border-sky-200 rounded-xl px-4 py-3 text-lg font-black outline-none focus:border-sky-500" />
                                </div>
                                
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setCupomEditCoins({ isOpen: false, cupomId: null, novoValor: '', codigo: '' })} className="flex-1 py-3 sm:py-3.5 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold rounded-xl text-sm transition-colors">Cancelar</button>
                                    <ProgressButton onClick={processarEdicaoRapidaCoins} loading={loadingAcao === 'salvar_coins'} text="Confirmar" loadingText="Gravando" icon={<Icons.Check className="w-4 h-4" />} className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-sm transition-colors shadow-sm" />
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <div className="bg-white p-6 sm:p-8 rounded-[24px] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 flex items-center gap-3"><Icons.Store className="w-6 h-6" /> Loja de Cupons VIP</h2>
                        <p className="text-sm text-gray-500 mt-1">Estes cupons estão visíveis para os clientes comprarem com {moedaConfig.nome} na área da loja virtual.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {cuponsPublicos.map(c => (
                        <div key={c.id} className="bg-gradient-to-br from-white to-sky-50/30 border border-sky-100 rounded-[24px] p-6 sm:p-8 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                            <div className="absolute -right-10 -top-10 w-32 h-32 bg-sky-400 opacity-10 rounded-full blur-3xl pointer-events-none"></div>
                            
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/30 flex-shrink-0"><Icons.Ticket className="w-6 h-6" /></div>
                                <span className={`text-[9px] sm:text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider ${c.escopo === 'LOJA' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{c.escopo}</span>
                            </div>
                            
                            <div className="mb-6 relative z-10">
                                <h3 className="text-2xl font-black text-gray-900">{c.tipo === 'PERCENTUAL' ? `${c.valor || 0}% OFF` : `R$ ${Number(c.valor || 0).toFixed(2)}`}</h3>
                                <p className="text-xs font-bold text-gray-500 mt-2">CÓDIGO: <span className="font-mono text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 tracking-wider">{c.codigo}</span></p>
                            </div>

                            {/* UI Alinhada: Custo na esquerda, Editar na direita */}
                            <div className="bg-white border border-yellow-200 rounded-2xl p-4 flex flex-col shadow-sm mb-6 mt-4 relative z-10">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-bold text-yellow-800 uppercase tracking-widest">Custo ao Cliente</span>
                                    <button type="button" onClick={() => setCupomEditCoins({ isOpen: true, cupomId: c.id, novoValor: c.custoCoins, codigo: c.codigo })} className="px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-[10px] font-bold text-sky-600 bg-sky-50 border border-sky-200 hover:bg-sky-100 shadow-sm hover:shadow">
                                        <Icons.Edit className="w-3 h-3" /> Editar
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-50/50 to-white border border-yellow-100 rounded-xl px-3 py-2 w-max mt-1">
                                    <Icons.Coin className="w-5 h-5 text-yellow-500" />
                                    <span className="text-xl font-black text-yellow-600">{c.custoCoins || 0}</span>
                                </div>
                            </div>

                            <div className="space-y-2 text-[10px] sm:text-xs font-medium text-gray-600 border-t border-sky-100/50 pt-4 sm:pt-5 relative z-10">
                                <div className="flex justify-between"><span>Validade:</span><span className="font-bold text-gray-900">{c.validade ? c.validade.split('-').reverse().join('/') : 'Eterno'}</span></div>
                                <div className="flex justify-between"><span>Resgates Disponíveis:</span><span className="font-bold text-gray-900">{c.limite ? c.limite - c.utilizacoes : 'Ilimitado'}</span></div>
                            </div>

                            <button type="button" onClick={() => { setCupons(prev => prev.map(cup => cup.id === c.id ? {...cup, naLoja: false} : cup)); }} className="w-full mt-6 sm:mt-8 bg-white border border-gray-200 text-gray-700 font-bold py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm relative z-10">
                                Ocultar da Loja
                            </button>
                        </div>
                    ))}
                    {cuponsPublicos.length === 0 && (
                        <div className="col-span-full p-10 sm:p-16 border-2 border-dashed border-gray-200 rounded-[24px] text-center bg-white/50">
                            <Icons.Store className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-base sm:text-lg font-black text-gray-900 mb-1">Nenhum cupom público</h3>
                            <p className="text-xs sm:text-sm text-gray-500">Vá à aba de Cupons, edite um cupom e ative a opção "Loja de Cupons".</p>
                        </div>
                    )}
                </div>
            </FadeIn>
        );
    };

    // ============================================================================
    // RENDER: EDITOR DE CUPOM (INLINE E BLINDADO OPTIONAL CHAINING)
    // ============================================================================
    const renderEditorCupom = () => {
        if (!cupomEmEdicao) return null; 
        
        return (
            <FadeIn key="editor_cupom" className="pb-20 w-full max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center bg-white/90 backdrop-blur-md p-4 sm:p-5 rounded-[24px] border border-gray-200 shadow-sm mb-6 sm:mb-8 sticky top-4 z-50 gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button type="button" onClick={fecharEditor} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-gray-100 hover:shadow-sm transition-all flex-shrink-0"><Icons.Back className="w-5 h-5" /></button>
                        <div>
                            <h2 className="text-lg sm:text-xl font-black text-gray-900">{cupomEmEdicao?.isNovo ? 'Criar Novo Cupom' : 'Editar Cupom'}</h2>
                            {!cupomEmEdicao?.isNovo && <p className="text-[10px] sm:text-xs text-sky-600 font-mono font-bold bg-sky-50 px-2 py-0.5 rounded inline-block mt-1">CÓDIGO: {cupomEmEdicao?.codigo}</p>}
                        </div>
                    </div>
                    <ProgressButton onClick={salvarCupom} loading={loadingAcao === 'salvar'} text="Salvar Cupom" loadingText="Salvando..." icon={<Icons.Check className="w-5 h-5" />} className="w-full sm:w-auto bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-6 sm:px-8 py-3.5 rounded-xl shadow-xl shadow-slate-900/20 transition-colors flex-shrink-0" />
                </div>

                <div className="space-y-6 sm:space-y-8">
                    {/* INFO BÁSICA */}
                    <div className="bg-white p-6 sm:p-8 rounded-[24px] border border-gray-200 shadow-sm">
                        <h3 className="text-base sm:text-lg font-black text-gray-900 mb-6">Regras de Desconto</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                            <div className={`col-span-1 md:col-span-2 ${errosForm.codigo ? 'p-4 border border-red-400 rounded-2xl bg-red-50' : ''}`}>
                                <label className="text-xs sm:text-sm font-bold text-gray-700 block mb-3">Código do Cupom *</label>
                                <input type="text" value={cupomEmEdicao?.codigo || ''} onChange={e=>setCupomEmEdicao({...cupomEmEdicao, codigo: e.target.value.toUpperCase()})} placeholder="Ex: BLACKFRIDAY" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg font-black font-mono tracking-widest outline-none focus:border-sky-500 focus:bg-white uppercase transition-colors" />
                                {errosForm.codigo && <p className="text-[10px] sm:text-xs font-bold text-red-500 mt-2">Código é obrigatório.</p>}
                            </div>

                            <div>
                                <label className="text-xs sm:text-sm font-bold text-gray-700 block mb-3">Tipo de Desconto</label>
                                <div className="flex gap-2 sm:gap-3">
                                    <button type="button" onClick={()=>setCupomEmEdicao({...cupomEmEdicao, tipo: 'PERCENTUAL'})} className={`flex-1 py-3 sm:py-4 rounded-xl text-xs sm:text-sm font-bold border transition-colors whitespace-nowrap ${cupomEmEdicao?.tipo === 'PERCENTUAL' ? 'bg-sky-50 border-sky-300 text-sky-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>Percentual (%)</button>
                                    <button type="button" onClick={()=>setCupomEmEdicao({...cupomEmEdicao, tipo: 'FIXO'})} className={`flex-1 py-3 sm:py-4 rounded-xl text-xs sm:text-sm font-bold border transition-colors whitespace-nowrap ${cupomEmEdicao?.tipo === 'FIXO' ? 'bg-sky-50 border-sky-300 text-sky-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>Fixo (R$)</button>
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-xs sm:text-sm font-bold text-gray-700 block mb-3">Onde Aplicar?</label>
                                <div className="flex gap-2 sm:gap-3">
                                    <button type="button" onClick={()=>setCupomEmEdicao({...cupomEmEdicao, escopo: 'LOJA'})} className={`flex-1 py-3 sm:py-4 rounded-xl text-xs sm:text-sm font-bold border transition-colors whitespace-nowrap ${cupomEmEdicao?.escopo === 'LOJA' ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>Na Compra</button>
                                    <button type="button" onClick={()=>setCupomEmEdicao({...cupomEmEdicao, escopo: 'FRETE'})} className={`flex-1 py-3 sm:py-4 rounded-xl text-xs sm:text-sm font-bold border transition-colors whitespace-nowrap ${cupomEmEdicao?.escopo === 'FRETE' ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>No Frete</button>
                                </div>
                            </div>

                            <div className={`col-span-1 md:col-span-2 ${errosForm.valor ? 'p-4 border border-red-400 rounded-2xl bg-red-50' : ''}`}>
                                <label className="text-xs sm:text-sm font-bold text-gray-700 block mb-3">Valor do Desconto *</label>
                                <div className="relative">
                                    <div className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 font-black text-gray-400 text-lg sm:text-xl">{cupomEmEdicao?.tipo === 'FIXO' ? 'R$' : '%'}</div>
                                    <input type="number" min="0" step={cupomEmEdicao?.tipo === 'FIXO' ? "0.01" : "1"} value={cupomEmEdicao?.valor || ''} onChange={e=>setCupomEmEdicao({...cupomEmEdicao, valor: e.target.value})} style={inputNumberStyle} placeholder="Ex: 15" className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 sm:pl-14 pr-4 sm:pr-5 py-3 sm:py-4 text-xl sm:text-2xl font-black text-emerald-600 outline-none focus:border-emerald-500 transition-colors" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* LIMITES E VALIDADE */}
                    <div className="bg-white p-6 sm:p-8 rounded-[24px] border border-gray-200 shadow-sm">
                        <h3 className="text-base sm:text-lg font-black text-gray-900 mb-6">Limites e Validade</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                            <div>
                                <label className="text-xs sm:text-sm font-bold text-gray-700 block mb-3">Limite de Usos Globais</label>
                                <input type="number" min="1" value={cupomEmEdicao?.limite || ''} onChange={e=>setCupomEmEdicao({...cupomEmEdicao, limite: e.target.value})} style={inputNumberStyle} placeholder="Ex: 100 (Ilimitado se vazio)" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-bold outline-none focus:border-sky-500" />
                            </div>
                            <div>
                                <label className="text-xs sm:text-sm font-bold text-gray-700 block mb-3">Validade (Expira em)</label>
                                <input type="date" value={cupomEmEdicao?.validade || ''} onChange={e=>setCupomEmEdicao({...cupomEmEdicao, validade: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-bold outline-none focus:border-sky-500" />
                            </div>
                        </div>
                    </div>

                    {/* STATUS E LOJA DE CUPONS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-6 sm:p-8 rounded-[24px] shadow-2xl relative overflow-hidden flex flex-col justify-between">
                            <div className="absolute -left-6 -top-6 w-32 h-32 bg-emerald-500 opacity-10 rounded-full blur-3xl pointer-events-none"></div>
                            <AnimatedToggle 
                                label={
                                    <div className="flex flex-col">
                                        <span className="text-white font-black text-sm sm:text-base">Ativar Cupom</span>
                                        <span className="text-[10px] sm:text-xs text-slate-400 font-medium mt-1">Desligue para invalidar instantaneamente.</span>
                                    </div>
                                } 
                                active={cupomEmEdicao?.status === 'ATIVO'} 
                                onChange={val => setCupomEmEdicao({...cupomEmEdicao, status: val ? 'ATIVO' : 'INATIVO'})} 
                                activeColor="#10B981" 
                                isDark={true}
                            />
                        </div>

                        <div className="bg-gradient-to-br from-white to-sky-50/50 border border-sky-100 p-6 sm:p-8 rounded-[24px] shadow-sm relative overflow-hidden flex flex-col gap-6">
                            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-sky-400 opacity-10 rounded-full blur-3xl pointer-events-none"></div>
                            <AnimatedToggle 
                                label={
                                    <div className="flex flex-col">
                                        <span className="text-gray-900 font-black text-sm sm:text-base">Loja de Cupons</span>
                                        <span className="text-[10px] sm:text-xs text-gray-500 font-medium mt-1">Exibe este cupom na vitrine da loja.</span>
                                    </div>
                                } 
                                active={cupomEmEdicao?.naLoja || false} 
                                onChange={val => setCupomEmEdicao({...cupomEmEdicao, naLoja: val})} 
                                activeColor="#0284C7" 
                            />
                            
                            <AnimatePresence>
                                {cupomEmEdicao?.naLoja && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-sky-200 pt-6 overflow-hidden relative z-10">
                                        <label className="text-xs font-bold text-sky-800 uppercase tracking-widest block mb-3">Custo em {moedaConfig.nome}</label>
                                        <div className="relative">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-yellow-500"><Icons.Coin className="w-5 h-5" /></div>
                                            <input type="number" min="0" value={cupomEmEdicao?.custoCoins || ''} onChange={e=>setCupomEmEdicao({...cupomEmEdicao, custoCoins: e.target.value})} style={inputNumberStyle} placeholder="Ex: 500" className="w-full bg-white border border-sky-200 rounded-xl pl-12 pr-5 py-4 text-xl font-black text-sky-900 outline-none focus:border-sky-500 shadow-sm" />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </FadeIn>
        );
    };

    // --- MODAL DE DATAS E CENTRAL DE AJUDA ---
    const renderModaisGlobais = () => (
        <AnimatePresence>
            {isDateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDateModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                    <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-[24px] shadow-2xl p-6 sm:p-8 w-full max-w-sm relative z-10">
                        <h3 className="text-xl font-black text-gray-900 mb-6">Filtrar por Período</h3>
                        <div className="space-y-5">
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-2">Data Inicial *</label>
                                <input type="date" value={periodoFiltro.inicio.split('/').reverse().join('-')} onChange={e=>setPeriodoFiltro({...periodoFiltro, inicio: e.target.value.split('-').reverse().join('/')})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-2">Data Final *</label>
                                <input type="date" value={periodoFiltro.fim.split('/').reverse().join('-')} onChange={e=>setPeriodoFiltro({...periodoFiltro, fim: e.target.value.split('-').reverse().join('/')})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold outline-none" />
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <button type="button" onClick={() => setIsDateModalOpen(false)} className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-emerald-600 transition-colors">Aplicar Filtro</button>
                        </div>
                    </motion.div>
                </div>
            )}
            
            {/* Modal de Informação das Métricas (Help) */}
            {infoModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setInfoModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                    <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-[24px] shadow-2xl p-6 sm:p-8 w-full max-w-md relative z-10 flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6 flex-shrink-0">
                            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2"><Icons.Info className="w-6 h-6 text-sky-500" /> Métricas</h3>
                            <button type="button" onClick={() => setInfoModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors"><Icons.Close className="w-5 h-5" /></button>
                        </div>
                        
                        <div className="flex gap-4 border-b border-gray-100 mb-4 flex-shrink-0">
                            <button type="button" onClick={() => setInfoTab('PRINCIPAIS')} className={infoTab === 'PRINCIPAIS' ? 'text-sky-600 border-b-2 border-sky-500 pb-2 font-bold text-xs uppercase' : 'text-gray-400 pb-2 font-bold text-xs uppercase transition-colors'}>Métricas do Painel</button>
                            <button type="button" onClick={() => setInfoTab('SECUNDARIAS')} className={infoTab === 'SECUNDARIAS' ? 'text-sky-600 border-b-2 border-sky-500 pb-2 font-bold text-xs uppercase' : 'text-gray-400 pb-2 font-bold text-xs uppercase transition-colors'}>Métricas da Tabela</button>
                        </div>

                        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                            {infoTab === 'PRINCIPAIS' && (
                                <>
                                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                                        <p className="text-sm font-black text-emerald-400 mb-1">Receita Gerada</p>
                                        <p className="text-xs text-gray-300 leading-relaxed">Faturamento bruto gerado exclusivamente em pedidos que utilizaram algum cupom na loja.</p>
                                    </div>
                                    <div className="bg-sky-50 p-4 rounded-xl border border-sky-100">
                                        <p className="text-sm font-black text-sky-700 mb-1">Descontos Concedidos</p>
                                        <p className="text-xs text-gray-600 leading-relaxed">Valor financeiro total abatido dos pedidos devido ao uso de cupons de produto/carrinho.</p>
                                    </div>
                                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                        <p className="text-sm font-black text-emerald-900 mb-1">Ativos</p>
                                        <p className="text-xs text-emerald-700 leading-relaxed">Quantidade de cupons que estão atualmente com status Ativo e válidos na loja.</p>
                                    </div>
                                    <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                        <p className="text-sm font-black text-red-900 mb-1">Inat./Exp.</p>
                                        <p className="text-xs text-red-700 leading-relaxed">Soma de cupons que foram desativados pelo lojista ou cuja validade expirou.</p>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                        <p className="text-sm font-black text-purple-900 mb-1">Sub. Frete</p>
                                        <p className="text-xs text-purple-700 leading-relaxed">Dinheiro que a loja deixou de receber no frete devido a cupons de envio gratuito.</p>
                                    </div>
                                </>
                            )}
                            {infoTab === 'SECUNDARIAS' && (
                                <>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <p className="text-sm font-black text-gray-900 mb-1">Código & Regra</p>
                                        <p className="text-xs text-gray-600 leading-relaxed">O código digitado pelo cliente no checkout e a regra de desconto associada (ex: 10% OFF ou R$ 15 Fixo).</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <p className="text-sm font-black text-gray-900 mb-1">Usos / Limite</p>
                                        <p className="text-xs text-gray-600 leading-relaxed">Quantidade de vezes que o cupom já foi usado comparado ao limite máximo estabelecido pelo lojista.</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <p className="text-sm font-black text-gray-900 mb-1">Desconto Gerado</p>
                                        <p className="text-xs text-gray-600 leading-relaxed">Valor financeiro que a loja concedeu em descontos aos clientes através deste cupom específico.</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <p className="text-sm font-black text-gray-900 mb-1">Receita & Ticket Médio</p>
                                        <p className="text-xs text-gray-600 leading-relaxed">A receita bruta faturada em vendas associadas a este cupom e a média gasta por cada pedido.</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <p className="text-sm font-black text-gray-900 mb-1">Último Uso</p>
                                        <p className="text-xs text-gray-600 leading-relaxed">Data cronológica da última compra onde este cupom foi aplicado na loja.</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <p className="text-sm font-black text-gray-900 mb-1">Status / Loja</p>
                                        <p className="text-xs text-gray-600 leading-relaxed">Indica se o cupom está ativo para uso e se os clientes o podem adquirir na vitrine pública (Loja de Cupons).</p>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-100 flex-shrink-0">
                            <button type="button" onClick={() => setInfoModalOpen(false)} className="w-full bg-[#0F172A] text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-colors">Entendi</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return (
        <div className="w-full min-h-screen bg-[#F8FAFC] pb-20 relative font-sans">
            <Helmet><title>Marketing & Coins | HUB ADMIN</title></Helmet>
            <GlobalStyles />
            
            <AnimatedNotification show={notif.show} status={notif.status} titulo={notif.titulo} />
            {renderModaisGlobais()}

            {mainTab !== 'EDITOR_CUPOM' && (
                <div className="mb-6 pt-4 px-4 md:px-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Marketing & Coins</h1>
                            <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1">O motor de fidelização, recompensas e cupões da sua loja.</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-6 sm:gap-8 border-b border-gray-200 mt-6 sm:mt-8 overflow-x-auto no-scrollbar">
                        {['PAINEL', 'HUB_COINS', 'RECOMPENSAS', 'CUPONS', 'LOJA_CUPONS'].map(tab => (
                            <button type="button" key={tab} onClick={() => setMainTab(tab)} className={`pb-3 sm:pb-4 text-xs sm:text-sm font-bold uppercase tracking-widest relative whitespace-nowrap transition-colors flex-shrink-0 ${mainTab === tab ? 'text-sky-600' : 'text-gray-400 hover:text-gray-800'}`}>
                                {tab.replace('_', ' ')}
                                {mainTab === tab && <motion.div layoutId="mainTabMarketing" className="absolute bottom-0 left-0 right-0 h-[3px] bg-sky-500 rounded-t-full" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="px-4 md:px-8">
                <AnimatePresence mode="wait">
                    {mainTab === 'PAINEL' && renderPainel()}
                    {mainTab === 'HUB_COINS' && renderHubCoins()}
                    {mainTab === 'RECOMPENSAS' && renderRecompensas()}
                    {mainTab === 'CUPONS' && renderListaCupons()}
                    {mainTab === 'LOJA_CUPONS' && renderLojaCupons()}
                    {mainTab === 'EDITOR_CUPOM' && renderEditorCupom()}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminMarketing;