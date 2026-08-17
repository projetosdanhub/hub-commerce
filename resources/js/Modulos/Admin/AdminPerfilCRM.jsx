import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';

// ==========================================
// 1. ÍCONES E UTILITÁRIOS LOCAIS
// ==========================================
const Icons = {
    Search: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Calendar: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    EyeOff: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>,
    Eye: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    Close: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
    ChevronLeft: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>,
    ChevronRight: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>,
    Package: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    Box: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    Trophy: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
    WhatsApp: ({className="w-4 h-4"}) => <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
    AlertTriangle: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    MapPin: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Activity: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    CreditCard: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    Info: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Spinner: ({className="w-4 h-4"}) => <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>,
    Check: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>,
    Tag: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
    FileText: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    Edit3: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    Plus: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
    Upload: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>,
    Repeat: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    Mail: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    Key: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>,
    Download: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
    Crown: ({className="w-4 h-4"}) => <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>,
    Refresh: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    UserCircle: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Shield: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
};

const safeNum = (val) => { const n = Number(val); return isNaN(n) ? 0 : n; };
const safeStr = (val) => { if (val === null || val === undefined) return ''; return String(val); };
const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safeNum(val));
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

const FadeIn = React.forwardRef(({ children, className = "", ...props }, ref) => (
  <motion.div 
      ref={ref} 
      initial={{ opacity: 0, x: -20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: 20 }} 
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }} 
      className={`flex flex-col h-full w-full ${className}`} 
      {...props}
  >
      {children}
  </motion.div>
));
FadeIn.displayName = 'FadeIn';

const ProgressButton = ({ onClick, loading, text, loadingText, className, disabled, icon: Icon, ariaLabel }) => (
    <button type="button" onClick={onClick} disabled={loading || disabled} aria-label={ariaLabel || text} className={`relative overflow-hidden ${className} disabled:opacity-90 disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20`}>
        {loading && <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5, ease: "linear" }} className="absolute left-0 top-0 h-full bg-black/10 z-0" />}
        <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? <><Icons.Spinner className="w-4 h-4" /> {loadingText || 'Aguarde'}</> : <>{Icon && <Icon className="w-4 h-4" />} {text}</>}
        </span>
    </button>
);

// ============================================================================
// COMPONENTE PRINCIPAL (O PERFIL DO CLIENTE ISOLADO)
// ============================================================================

// 🟢 ANIMAÇÕES SUAVES PADRONIZADAS PARA AS ABAS E TRANSIÇÕES
const tabTransition = {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] } },
        exit: { opacity: 0, transition: { duration: 0.2, ease: "easeInOut" } }
    };
export default function AdminPerfilCRM({ 
    clienteSelecionado, 
    setClienteSelecionado, 
    onBack, 
    niveisVIPDaApi, 
    refetchClients, 
    isFetchingClients,
    triggerAcaoGlob,
    showToastGlob
}) {
    const queryClientLocal = useQueryClient();
    
    // Estados Locais e Exclusivos deste Componente
    const [savingState, setSavingState] = useState(null);
    const [crmSubTab, setCrmSubTab] = useState('RESUMO');
    const [pedidoExpandido, setPedidoExpandido] = useState(null);
    const [produtoExpandido, setProdutoExpandido] = useState(null);
    const [novaTag, setNovaTag] = useState('');                      
    const [riscoPage, setRiscoPage] = useState(1);                  
    const [riscoPerPage] = useState(4); 
    const [perfilEmEdicao, setPerfilEmEdicao] = useState(false);
    
    // Toggle para esconder dados sensíveis no resumo
    const [mostrarDadosSensiveis, setMostrarDadosSensiveis] = useState(true);

    // 🟢 Estados dos Formulários de Edição (Modo Editar)
    const [editMode, setEditMode] = useState({ basico: false, sensivel: false, email: 'idle', senha: 'idle', telefone: false });
    const [formEdit, setFormEdit] = useState({
        nome: '', sexo: '', nascimento: '', cpf: '', telefone: '', email: '', motivo: '', arquivo: null
    });

    const [modalStatusConta, setModalStatusConta] = useState({ isOpen: false, tipo: null, motivo: '' });
    const [walletFlow, setWalletFlow] = useState({ tipo: 'Hub Coins', valor: '', motivo: '' });
    const [senhaTemp, setSenhaTemp] = useState({ codigo: null, expiraEm: null });
    const [tempoRestanteSenha, setTempoRestanteSenha] = useState('');

    // Timeline e Histórico
    const [timelinePage, setTimelinePage] = useState(1);
    const timelinePerPage = 6;
    
    const [orderHistoryTab, setOrderHistoryTab] = useState('TODOS');
    const [orderHistoryPage, setOrderHistoryPage] = useState(1);
    const orderHistoryPerPage = 5;

    // Cronômetros de Senha Temporária
    useEffect(() => {
        if (!senhaTemp.expiraEm) return;
        const atualizaCronometro = () => {
            const agora = new Date().getTime();
            const distancia = senhaTemp.expiraEm.getTime() - agora;

            if (distancia <= 0) {
                setTempoRestanteSenha('Expirada');
            } else {
                const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
                const segundos = Math.floor((distancia % (1000 * 60)) / 1000);
                setTempoRestanteSenha(`${String(minutos).padStart(2, '0')}m ${String(segundos).padStart(2, '0')}s`);
            }
        };
        atualizaCronometro();
        const interval = setInterval(atualizaCronometro, 1000);
        return () => clearInterval(interval);
    }, [senhaTemp.expiraEm]);


    // 🟢 REFRESH COM TOAST
    const handleRefreshProfile = async () => {
        setSavingState('refreshProfile');
        await refetchClients();
        setSavingState(null);
        const now = new Date();
        if(showToastGlob) showToastGlob(`Dados atualizados em ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}`);
    };

    const abrirEdicao = () => {
        setFormEdit({
            nome: clienteSelecionado?.nome || '',
            sexo: clienteSelecionado?.sexo || '',
            nascimento: clienteSelecionado?.nascimento || '',
            cpf: clienteSelecionado?.cpf || '',
            telefone: clienteSelecionado?.telefone || '',
            email: '', motivo: '', arquivo: null
        });
        setEditMode({ basico: false, sensivel: false, email: 'idle', senha: 'idle', telefone: false });
        setPerfilEmEdicao(true);
    };

    // ==========================================
    // 🟢 MUTAÇÕES REAIS DA API (SALVANDO NO BANCO)
    // ==========================================

    const mutacaoBasicos = useMutation({
        mutationFn: async (dados) => await api.put(`/admin/customers/${clienteSelecionado.id}/basics`, dados),
        onSuccess: () => {
            queryClientLocal.invalidateQueries({ queryKey: ['clientesCRM'] });
            refetchClients();
            if(showToastGlob) showToastGlob('Dados pessoais atualizados!');
            setEditMode(prev => ({...prev, basico: false}));
            setFormEdit(prev => ({...prev, motivo: ''}));
        },
        onError: (err) => alert('Erro: ' + (err.response?.data?.message || err.message))
    });

    const mutacaoSensivel = useMutation({
        mutationFn: async (formData) => await api.post(`/admin/customers/${clienteSelecionado.id}/sensitive-data`, formData, { headers: { 'Content-Type': 'multipart/form-data' }}),
        onSuccess: () => {
            queryClientLocal.invalidateQueries({ queryKey: ['clientesCRM'] });
            refetchClients();
            if(showToastGlob) showToastGlob('Documentos enviados e atualizados!');
            setEditMode(prev => ({...prev, sensivel: false}));
            setFormEdit(prev => ({...prev, motivo: '', arquivo: null}));
        },
        onError: (err) => alert('Erro: ' + (err.response?.data?.message || err.message))
    });

    const mutacaoTelefone = useMutation({
        mutationFn: async (dados) => await api.put(`/admin/customers/${clienteSelecionado.id}/phone`, dados),
        onSuccess: () => {
            queryClientLocal.invalidateQueries({ queryKey: ['clientesCRM'] });
            refetchClients();
            if(showToastGlob) showToastGlob('Telefone atualizado!');
            setEditMode(prev => ({...prev, telefone: false}));
            setFormEdit(prev => ({...prev, motivo: ''}));
        },
        onError: (err) => alert('Erro: ' + (err.response?.data?.message || err.message))
    });

    const mutacaoLinkEmail = useMutation({
        mutationFn: async (dados) => await api.post(`/admin/customers/${clienteSelecionado.id}/email-link`, dados),
        onSuccess: () => {
            if(showToastGlob) showToastGlob('Link enviado para o novo e-mail do cliente!');
            setEditMode(prev => ({...prev, email: 'idle'}));
            setFormEdit(prev => ({...prev, email: ''}));
        },
        onError: (err) => alert('Erro: ' + (err.response?.data?.message || err.message))
    });

    const mutacaoForcarEmail = useMutation({
        mutationFn: async (dados) => await api.put(`/admin/customers/${clienteSelecionado.id}/force-email`, dados),
        onSuccess: () => {
            queryClientLocal.invalidateQueries({ queryKey: ['clientesCRM'] });
            refetchClients();
            if(showToastGlob) showToastGlob('E-mail alterado forçadamente!');
            setEditMode(prev => ({...prev, email: 'idle'}));
            setFormEdit(prev => ({...prev, email: '', motivo: ''}));
        },
        onError: (err) => alert('Erro: ' + (err.response?.data?.message || err.message))
    });

    const mutacaoSenha = useMutation({
        mutationFn: async () => await api.post(`/admin/customers/${clienteSelecionado.id}/generate-temp-password`),
        onSuccess: (response) => {
            queryClientLocal.invalidateQueries({ queryKey: ['clientesCRM'] });
            const expiraEm = new Date(new Date().getTime() + 7 * 60000); 
            setSenhaTemp({ codigo: response.data.password, expiraEm }); 
            if(showToastGlob) showToastGlob(response.data.message);
            setEditMode(prev => ({...prev, senha: 'temp'}));
        },
        onError: (err) => alert('Erro: ' + (err.response?.data?.message || err.message))
    });

    const mutacaoLinkSenha = useMutation({
        mutationFn: async () => await api.post(`/admin/customers/${clienteSelecionado.id}/password-link`),
        onSuccess: () => {
            if(showToastGlob) showToastGlob('Link de redefinição enviado ao e-mail atual do cliente!');
            setEditMode(prev => ({...prev, senha: 'idle'}));
        },
        onError: (err) => alert('Erro: ' + (err.response?.data?.message || err.message))
    });

    const mutacaoStatusConta = useMutation({
        mutationFn: async (dados) => await api.post(`/admin/customers/${clienteSelecionado.id}/status`, dados), 
        onSuccess: (response, variables) => {
            queryClientLocal.invalidateQueries({ queryKey: ['clientesCRM'] });
            refetchClients();
            setModalStatusConta({ isOpen: false, tipo: null, motivo: '' });
            if(showToastGlob) showToastGlob(variables.acao === 'SUSPENDER' ? 'Conta suspensa com sucesso.' : 'Conta reativada com sucesso.');
        },
        onError: (err) => alert('Erro: ' + (err.response?.data?.message || err.message))
    });

    const mutacaoNotas = useMutation({
        mutationFn: async (notas) => await api.put(`/admin/customers/${clienteSelecionado.id}/notes`, { notas }),
        onSuccess: () => { 
            queryClientLocal.invalidateQueries({ queryKey: ['clientesCRM'] }); 
            refetchClients();
            if(showToastGlob) showToastGlob('Anotações salvas com sucesso!'); 
        },
        onError: (err) => alert('Erro: ' + (err.response?.data?.message || err.message))
    });

    const mutacaoTags = useMutation({
        mutationFn: async (novasTags) => await api.put(`/admin/customers/${clienteSelecionado.id}/tags`, { tags: novasTags }),
        onSuccess: () => { 
            queryClientLocal.invalidateQueries({ queryKey: ['clientesCRM'] }); 
            refetchClients();
            if(showToastGlob) showToastGlob('Tags atualizadas!'); 
        },
        onError: (err) => alert('Erro: ' + (err.response?.data?.message || err.message))
    });

    const mutacaoCarteira = useMutation({
        mutationFn: async (dados) => await api.post(`/admin/customers/${clienteSelecionado.id}/wallet-transaction`, dados),
        onSuccess: (response) => {
            queryClientLocal.invalidateQueries({ queryKey: ['clientesCRM'] }); 
            refetchClients();
            setWalletFlow({ tipo: 'Hub Coins', valor: '', motivo: '' }); 
            if(showToastGlob) showToastGlob(response.data.message);
        },
        onError: (err) => alert('Erro: ' + (err.response?.data?.message || err.message))
    });


    // ==========================================
    // 🟢 FUNÇÕES QUE DISPARAM AS MUTAÇÕES ACIMA
    // ==========================================

    const salvarDadosBasicos = () => {
        if(!formEdit.motivo.trim() || !formEdit.nome.trim()) return alert("Nome e motivo são obrigatórios.");
        setSavingState('saveBasico');
        mutacaoBasicos.mutate({ nome: formEdit.nome, sexo: formEdit.sexo, motivo: formEdit.motivo }, { onSettled: () => setSavingState(null) });
    };

    const salvarDadosSensiveis = () => {
        if(!formEdit.motivo.trim() || !formEdit.arquivo) return alert("Obrigatório: Anexe o documento RG/CNH legível e informe o motivo.");
        setSavingState('saveSensivel');
        const formData = new FormData();
        formData.append('arquivo', formEdit.arquivo);
        if (formEdit.cpf) formData.append('cpf', formEdit.cpf);
        if (formEdit.nascimento) formData.append('nascimento', formEdit.nascimento);
        formData.append('motivo', formEdit.motivo);
        mutacaoSensivel.mutate(formData, { onSettled: () => setSavingState(null) });
    };

    const salvarTelefone = () => {
        if(!formEdit.motivo.trim() || !formEdit.telefone.trim()) return alert("Telefone e Motivo são obrigatórios.");
        setSavingState('savePhone');
        mutacaoTelefone.mutate({ telefone: formEdit.telefone, motivo: formEdit.motivo }, { onSettled: () => setSavingState(null) });
    };

    const enviarLinkEmail = () => {
        if(!formEdit.email.trim() || !formEdit.email.includes('@')) return alert("Digite um novo e-mail válido.");
        setSavingState('emailLink');
        mutacaoLinkEmail.mutate({ email: formEdit.email }, { onSettled: () => setSavingState(null) });
    };

    const forcarTrocaEmail = () => {
        if(!formEdit.motivo.trim() || !formEdit.email.trim() || !formEdit.email.includes('@')) return alert("Motivo e Novo E-mail são obrigatórios na troca forçada.");
        setSavingState('emailForce');
        mutacaoForcarEmail.mutate({ email: formEdit.email, motivo: formEdit.motivo }, { onSettled: () => setSavingState(null) });
    };

    const enviarLinkSenha = () => {
        setSavingState('senhaLink');
        mutacaoLinkSenha.mutate(null, { onSettled: () => setSavingState(null) });
    };

    const gerarSenhaProvisoria = () => {
        setSavingState('senhaTemp');
        mutacaoSenha.mutate(null, { onSettled: () => setSavingState(null) });
    };

    const salvarNotasAPI = () => {
        setSavingState('notas');
        mutacaoNotas.mutate(clienteSelecionado.notas, { onSettled: () => setSavingState(null) });
    };

    const adicionarTag = () => {
        if (novaTag.trim() && clienteSelecionado) {
            const tagFormatada = novaTag.trim();
            const tagsAtuais = clienteSelecionado.tags || [];
            if (!tagsAtuais.includes(tagFormatada)) {
                const novasTags = [...tagsAtuais, tagFormatada];
                setClienteSelecionado(prev => ({ ...prev, tags: novasTags }));
                mutacaoTags.mutate(novasTags);
            }
            setNovaTag('');
        }
    };

    const removerTag = (tagParaRemover) => {
        const novasTags = (clienteSelecionado.tags || []).filter(t => t !== tagParaRemover);
        setClienteSelecionado(prev => ({ ...prev, tags: novasTags }));
        mutacaoTags.mutate(novasTags);
    };

    const handleConfirmarStatusConta = () => {
        if (!modalStatusConta.motivo.trim()) return alert("O motivo é obrigatório.");
        setSavingState('statusConta');
        mutacaoStatusConta.mutate(
            { acao: modalStatusConta.tipo, motivo: modalStatusConta.motivo },
            { onSettled: () => setSavingState(null) }
        );
    };

    const processarTransacaoWallet = () => {
        if (!walletFlow.valor || walletFlow.valor <= 0 || !walletFlow.motivo.trim()) return alert("Preencha valor e motivo.");
        setSavingState('transacao');
        mutacaoCarteira.mutate({ tipo: walletFlow.tipo, valor: walletFlow.valor, motivo: walletFlow.motivo }, { onSettled: () => setSavingState(null) });
    };

    const handleExportarPDF = () => {
        if(showToastGlob) showToastGlob("Relatório gerado para impressão!");
        setTimeout(() => {
            const janela = window.open('', '', 'width=900,height=700');
            janela.document.write(`
                <html><head><title>Auditoria CRM - ${clienteSelecionado?.nome}</title>
                <style>body{font-family:sans-serif;padding:40px;color:#334155;} h1{color:#0f172a;font-size:24px;} table{width:100%;border-collapse:collapse;margin-top:20px;} th,td{border:1px solid #cbd5e1;padding:12px;text-align:left;font-size:12px;} th{background-color:#f8fafc;}</style>
                </head><body>
                <h1>Relatório de Auditoria CRM</h1>
                <p><strong>Cliente:</strong> ${clienteSelecionado?.nome} (CPF: ${clienteSelecionado?.cpf || 'ND'})</p>
                <table><thead><tr><th width="150">Data</th><th>Status</th><th>Ação</th><th>Motivo</th></tr></thead><tbody>
                ${auditLogsFiltrados.map(log => `<tr><td>${formatDateTimeBR(log.data)}</td><td>${log.tipo}</td><td><strong>${log.titulo}</strong></td><td>${log.desc}</td></tr>`).join('')}
                </tbody></table><script>window.onload=function(){window.print();window.close();}</script></body></html>
            `);
            janela.document.close();
        }, 1500);
    };

    // --- CÁLCULOS E FILTRAGENS (MEMOS) ---
    const auditLogsFiltrados = useMemo(() => {
        if(!clienteSelecionado || !clienteSelecionado.auditLogs) return [];
        return clienteSelecionado.auditLogs.sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    }, [clienteSelecionado]);
    const totalTimelinePages = Math.ceil(auditLogsFiltrados.length / timelinePerPage) || 1;
    const auditLogsPaginados = auditLogsFiltrados.slice((timelinePage - 1) * timelinePerPage, timelinePage * timelinePerPage);

    const historicoPedidosFiltrado = useMemo(() => {
        if(!clienteSelecionado || !clienteSelecionado.pedidos) return [];
        let ped = clienteSelecionado.pedidos;
        if (orderHistoryTab === 'CONCLUÍDOS') ped = ped.filter(p => ['ENTREGUE', 'DESPACHADO', 'SEPARACAO'].includes(p.status));
        else if (orderHistoryTab === 'REEMBOLSADOS') ped = ped.filter(p => p.status === 'REEMBOLSADO');
        else if (orderHistoryTab === 'CANCELADOS') ped = ped.filter(p => p.status === 'CANCELADO');
        return ped.sort((a,b) => new Date(b.data_raw).getTime() - new Date(a.data_raw).getTime());
    }, [clienteSelecionado, orderHistoryTab]);
    const totalOrderHistoryPages = Math.ceil(historicoPedidosFiltrado.length / orderHistoryPerPage) || 1;
    const orderHistoryPaginados = historicoPedidosFiltrado.slice((orderHistoryPage - 1) * orderHistoryPerPage, orderHistoryPage * orderHistoryPerPage);

    const alertasDoCliente = clienteSelecionado?.alertasRisco || [
        { id: 1, titulo: 'Risco Chargeback', nivel: 'Baixo', item1: 'Produtos Reembolsados', valor1: `${safeNum(clienteSelecionado?.produtosReembolsados)} un.`, item2: 'Total Pago (Reembolsos)', valor2: formatCurrency(clienteSelecionado?.reembolsosPagos * 120) },
    ];
    const totalRiscoPages = Math.ceil(alertasDoCliente.length / riscoPerPage) || 1;
    const alertasPaginados = alertasDoCliente.slice((riscoPage - 1) * riscoPerPage, riscoPage * riscoPerPage);

    // 🟢 Trilha de Benefícios (Mock para visualização baseada no status)
    const trilhaBeneficios = useMemo(() => {
        const trilha = [];
        trilha.push({
            id: 'cadastro', icone: Icons.UserCircle, cor: 'bg-slate-600',
            titulo: 'Conta Criada (Iniciante)', data: clienteSelecionado?.dataCadastro || clienteSelecionado?.created_at,
            desc: 'O cliente realizou o cadastro na loja.'
        });
        if (safeNum(clienteSelecionado?.compras) > 0) {
            trilha.push({
                id: 'primeira_compra', icone: Icons.Package, cor: 'bg-blue-500',
                titulo: 'Primeira Compra', data: clienteSelecionado?.ultimaCompra,
                desc: 'Cliente ativou sua primeira compra com sucesso.'
            });
        }
        if (clienteSelecionado?.rank && clienteSelecionado.rank !== 'Iniciante') {
            trilha.push({
                id: 'rank_up', icone: Icons.Trophy, cor: 'bg-amber-500',
                titulo: `Evoluiu para ${clienteSelecionado.rank}`, data: new Date().toISOString(),
                desc: `Adquiriu novos benefícios e multiplicadores da loja.`
            });
        }
        return trilha.reverse(); // Mais recente primeiro
    }, [clienteSelecionado]);

    const getAvatarInitials = (nome) => {
        if (!nome || typeof nome !== 'string') return 'N';
        const split = nome.trim().split(' ');
        if (split.length > 1 && split[1].length > 0) return (safeStr(split[0]).charAt(0) + safeStr(split[1]).charAt(0)).toUpperCase();
        return safeStr(nome).substring(0, 2).toUpperCase();
    };

    const getStatusClienteBadge = (status) => {
        if (status === 'ATIVO') return <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-bold uppercase rounded-lg shadow-sm">ATIVO</span>;
        if (status === 'INATIVO' || status === 'BLOQUEADA') return <span className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-bold uppercase rounded-lg shadow-sm">SUSPENSA</span>;
        return <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-bold uppercase rounded-lg shadow-sm">{safeStr(status) || 'ND'}</span>;
    };

    // 🟢 LÓGICA DO GRADIENTE DO CABEÇALHO
    const sexoStr = clienteSelecionado?.sexo?.toLowerCase() || '';
    let headerGradient = 'from-slate-200 to-transparent';
    if (sexoStr === 'feminino' || sexoStr === 'f') headerGradient = 'from-pink-200 to-transparent';
    else if (sexoStr === 'masculino' || sexoStr === 'm') headerGradient = 'from-sky-200 to-transparent';

    // ==========================================
    // RENDERIZAÇÃO PRINCIPAL DO PERFIL
    // ==========================================
    return (
        <FadeIn key="crm_perfil" className="space-y-6 flex flex-col h-full">
            <div className="flex items-center gap-4 shrink-0">
                <button onClick={onBack} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 font-bold text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors">
                    <Icons.ChevronLeft className="w-4 h-4" /> Voltar ao Diretório
                </button>
            </div>

            <div className={`bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px] flex-1 relative`}>  
                
                {/* 🟢 GRADIENTE INTELIGENTE APLICADO AQUI */}
                <div className={`absolute top-0 left-0 w-full h-32 opacity-30 pointer-events-none bg-gradient-to-b ${headerGradient}`}></div>
                
                {/* CABEÇALHO DO CLIENTE */}
                <header className="p-8 border-b border-slate-200 bg-slate-50/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10 shrink-0">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-black text-3xl text-slate-700 shadow-sm overflow-hidden shrink-0 z-10 relative">
                            {clienteSelecionado?.avatar ? <img src={clienteSelecionado.avatar} className="w-full h-full object-cover" alt="Avatar"/> : getAvatarInitials(clienteSelecionado?.nome)}
                        </div>
                        <div className="z-10 relative">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                {safeStr(clienteSelecionado?.nome)}
                            </h2>
                            <div className="flex items-center gap-3 mt-2.5">
                                {getStatusClienteBadge(clienteSelecionado?.status)}
                                
                                {/* TAG DO BENEFÍCIO (RANK VIP) */}
                                {(() => {
                                    const rankInfo = niveisVIPDaApi?.find(n => safeStr(n.nome).toLowerCase() === safeStr(clienteSelecionado?.rank).toLowerCase());
                                    return (
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">
                                            {rankInfo && rankInfo.imagem ? <img src={rankInfo.imagem} alt="Rank" className="w-3.5 h-3.5 rounded-full object-cover" /> : <Icons.Crown className="w-3.5 h-3.5 text-yellow-500" />}
                                            {clienteSelecionado?.rank || 'Sem Rank'}
                                        </div>
                                    );
                                })()}  

                                <span className="text-sm font-medium text-slate-500 border-l border-slate-300 pl-3">Membro desde {formatDateBR(clienteSelecionado?.dataCadastro)}</span>
                            </div>
                            {/* 🟢 TAGS NO CABEÇALHO COM HOVER ELEGANTE PARA REMOVER */}
                            {clienteSelecionado?.tags && clienteSelecionado.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {clienteSelecionado.tags.map((tag, idx) => (
                                        <span key={idx} className="group relative flex items-center gap-1 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm transition-all hover:pr-6 cursor-default">
                                            <Icons.Tag className="w-3 h-3 inline-block text-indigo-500 -mt-0.5"/>
                                            {tag}
                                            <button onClick={() => removerTag(tag)} className="absolute right-1 opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 transition-opacity">
                                                <Icons.Close className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 z-10 relative">
                        <button onClick={handleRefreshProfile} className={`w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-all shadow-sm ${savingState === 'refreshProfile' || isFetchingClients ? 'animate-spin text-blue-500' : ''}`} title="Atualizar">
                            <Icons.Refresh className="w-6 h-6"/>
                        </button>

                        {clienteSelecionado?.status === 'INATIVO' || clienteSelecionado?.status === 'BLOQUEADA' ? (
                            <button onClick={() => setModalStatusConta({ isOpen: true, tipo: 'REATIVAR', motivo: '' })} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 border border-emerald-600 text-white rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-1.5">
                                <Icons.Check className="w-4 h-4"/> Reativar Conta
                            </button>
                        ) : (
                            <button onClick={() => setModalStatusConta({ isOpen: true, tipo: 'SUSPENDER', motivo: '' })} className="px-6 py-3 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-1.5">
                                <Icons.AlertTriangle className="w-4 h-4"/> Suspender Conta
                            </button>
                        )}
                    </div>
                </header>

                {/* NAVEGAÇÃO DE ABAS */}
                <nav className="flex px-8 border-t border-slate-100 bg-slate-50/50 shrink-0 overflow-x-auto custom-scrollbar relative z-10">
                    {['RESUMO', 'CARTEIRAS (LIVRO RAZÃO)', 'ENDEREÇOS','HISTÓRICO DE PEDIDOS','TIMELINE (AUDIT)'].map((tab) => (
                        <button key={tab} onClick={() => { setCrmSubTab(tab); refetchClients(); }} className={`relative px-6 py-5 text-xs font-bold tracking-wider whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${crmSubTab === tab ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>
                        {tab}
                        {crmSubTab === tab && <motion.div layoutId="crmActiveTab" className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-500 rounded-t-full" />}
                        </button>
                    ))}
                </nav>

                {/* O SEGREDO ESTÁ AQUI: scrollbarGutter: 'stable' reserva o espaço da barra de rolagem */}
                <div 
                    className="flex-1 min-h-0 overflow-y-auto bg-slate-50/30 custom-scrollbar relative"
                    style={{ scrollbarGutter: 'stable' }} 
                >
                    <AnimatePresence mode="wait">
                        
                        {/* ========================================================= */}
                        {/* 🟢 ABA: RESUMO LÍQUIDO                                    */}
                        {/* ========================================================= */}
                        {crmSubTab === 'RESUMO' && !perfilEmEdicao && (
                            <motion.section key="RESUMO_READ" {...tabTransition} className="flex flex-col lg:flex-row gap-6 p-6">
                                {/* ... conteúdo do resumo ... */}
                                {/* COLUNA ESQUERDA: BARRA VERTICAL DE MÉTRICAS E DEMONSTRATIVO DE LTV */}
                            <div className="flex flex-col border border-slate-200 rounded-[24px] bg-white shadow-sm overflow-hidden w-full lg:w-1/4 shrink-0 h-max">
                                
                            {/* 1. Demonstrativo Financeiro / LTV Líquido */}
                            <div className="p-5 border-b border-slate-100 hover:bg-slate-50/60 transition-colors group cursor-default">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">LTV Líquido (Gasto Real)</p>
                                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md shadow-sm">
                                        Receita Real
                                    </span>
                                </div>

                                {/* Valor Final do LTV */}
                                <p className="text-3xl font-black text-emerald-600 tracking-tight">
                                    {formatCurrency(clienteSelecionado?.ltv)}
                                </p>

                                {/* Ticket Médio baseado no LTV real */}
                                <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                                    <span className="font-medium">Ticket Médio Líquido:</span>
                                    <strong className="text-slate-800 font-black">
                                        {formatCurrency(safeNum(clienteSelecionado?.ltv) / (safeNum(clienteSelecionado?.compras) || 1))}
                                    </strong>
                                </div>

                                {/* Detalhamento do Subtotal x Descontos Separados */}
                                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-[10px]">
                                    {/* Subtotal Bruto recalculado somando todos os descontos reais do histórico */}
                                    <div className="flex justify-between items-center text-slate-500 mb-2">
                                        <span>Subtotal Bruto (Produtos):</span>
                                        <span className="font-black text-slate-700">
                                            {formatCurrency(
                                                safeNum(clienteSelecionado?.ltv) + 
                                                safeNum(clienteSelecionado?.descontoLoja) + 
                                                safeNum(clienteSelecionado?.descontoVipProdutos) +
                                                safeNum(clienteSelecionado?.descontoVipFrete) +
                                                safeNum(clienteSelecionado?.descontoFrete)
                                            )}
                                        </span>
                                    </div>
                                    
                                    {/* Descontos de Cupons em Produtos */}
                                    <div className="flex justify-between items-center text-rose-500 font-medium">
                                        <span>(-) Descontos de Loja/Cupons:</span>
                                        <span className="font-bold">
                                            -{formatCurrency(clienteSelecionado?.descontoLoja)}
                                        </span>
                                    </div>

                                    {/* Desconto VIP em Produtos */}
                                    <div className="flex justify-between items-center text-indigo-600 font-medium">
                                        <span>(-) Desconto VIP (Produtos):</span>
                                        <span className="font-bold">
                                            -{formatCurrency(clienteSelecionado?.descontoVipProdutos)}
                                        </span>
                                    </div>

                                    {/* Desconto VIP em Frete */}
                                    <div className="flex justify-between items-center text-indigo-600 font-medium">
                                        <span>(-) Desconto VIP (Frete):</span>
                                        <span className="font-bold">
                                            -{formatCurrency(clienteSelecionado?.descontoVipFrete)}
                                        </span>
                                    </div>

                                    {/* Desconto de Frete por Cupons */}
                                    <div className="flex justify-between items-center text-rose-500 font-medium">
                                        <span>(-) Subsídio/Desc. Frete (Cupons):</span>
                                        <span className="font-bold">
                                            -{formatCurrency(clienteSelecionado?.descontoFrete)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                                {/* 2. Pedidos Concluídos */}
                                <div className="p-5 border-b border-slate-100 hover:bg-slate-50/60 transition-colors group cursor-default">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Pedidos Concluídos</p>
                                    <p className="text-2xl font-black text-slate-800 tracking-tight">{safeNum(clienteSelecionado?.compras)}</p>
                                    <p className="text-[10px] text-slate-500 mt-1 font-medium flex justify-between items-center">
                                        <span>Última compra:</span> 
                                        <strong className="text-slate-700 font-bold">{formatDateBR(clienteSelecionado?.ultimaCompra)}</strong>
                                    </p>
                                </div>

                                {/* 3. Produtos Comprados & Cupons Resgatados (Métricas Alinhadas no Mesmo Tamanho) */}
                                <div className="p-5 border-b border-slate-100 hover:bg-slate-50/60 transition-colors group cursor-default space-y-4">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Qtd. Total de Produtos</p>
                                        <p className="text-2xl font-black text-slate-800 tracking-tight">{safeNum(clienteSelecionado?.produtosComprados) || 0} un.</p>
                                    </div>

                                    <div className="pt-3 border-t border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Cupons Resgatados</p>
                                        <p className="text-2xl font-black text-slate-800 tracking-tight">{safeNum(clienteSelecionado?.cuponsUsados)} un.</p>
                                    </div>
                                </div>

                                {/* 4. Vantagens do Rank VIP (Posicionado no Final da Coluna) */}
                                {(() => {
                                    const rankInfo = niveisVIPDaApi?.find(n => safeStr(n.nome).toLowerCase() === safeStr(clienteSelecionado?.rank).toLowerCase());
                                    const multCoins = rankInfo?.multiplicador_coins || clienteSelecionado?.multiplicadorCoins || clienteSelecionado?.multiplicador || '1x';
                                    const descProd = rankInfo?.desconto_produtos != null ? `${rankInfo.desconto_produtos}%` : (clienteSelecionado?.descontoProdutosVip != null ? `${clienteSelecionado.descontoProdutosVip}%` : '0%');
                                    const descFrete = rankInfo?.desconto_frete != null ? `${rankInfo.desconto_frete}%` : (clienteSelecionado?.descontoFreteVip != null ? `${clienteSelecionado.descontoFreteVip}%` : '0%');

                                    return (
                                        <div className="p-5 bg-indigo-50/40 hover:bg-indigo-50/70 transition-colors group cursor-default">
                                            <div className="flex justify-between items-center mb-3">
                                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-wider flex items-center gap-1.5">
                                                    <Icons.Crown className="w-3.5 h-3.5 text-amber-500"/> Vantagens do Rank VIP
                                                </p>
                                                <span className="text-[10px] font-black text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-sm">
                                                    {clienteSelecionado?.rank || 'Sem Rank'}
                                                </span>
                                            </div>

                                            <div className="space-y-2 text-[11px] font-medium bg-white p-3 rounded-2xl border border-indigo-100/80 shadow-sm">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-500">Multiplicador de Coins:</span>
                                                    <strong className="text-indigo-600 font-black">{multCoins}</strong>
                                                </div>

                                                <div className="flex justify-between items-center border-t border-slate-100 pt-1.5">
                                                    <span className="text-slate-500">Desc. Produtos (%):</span>
                                                    <strong className="text-emerald-600 font-black">{descProd}</strong>
                                                </div>

                                                <div className="flex justify-between items-center border-t border-slate-100 pt-1.5">
                                                    <span className="text-slate-500">Desc. Frete (%):</span>
                                                    <strong className="text-emerald-600 font-black">{descFrete}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                            </div>

                                {/* COLUNA DIREITA */}
                                <div className="flex-1 flex flex-col gap-6 min-w-0">
                                    
                                    <article className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm flex flex-col gap-6 w-full relative">
                                        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                                                    <Icons.UserCircle className="w-5 h-5 text-blue-500"/> Sobre o Cliente
                                                </h3>
                                                <button onClick={abrirEdicao} className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                                                    Editar
                                                </button>
                                            </div>
                                            <button onClick={() => setMostrarDadosSensiveis(!mostrarDadosSensiveis)} title="Exibir/Esconder Dados" className="text-slate-400 hover:text-slate-600 transition-colors p-1 bg-slate-50 rounded-lg border border-slate-200 shadow-sm">
                                                {mostrarDadosSensiveis ? <Icons.EyeOff className="w-4 h-4" /> : <Icons.Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <div className="flex flex-col gap-1"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">WhatsApp / Telefone</span><span className="font-bold text-slate-800 text-sm">{mostrarDadosSensiveis ? formatPhone(clienteSelecionado?.telefone) : '***.***.***-**'}</span></div>
                                            <div className="flex flex-col gap-1"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">E-mail de Contato</span><span className="font-medium text-slate-800 text-sm truncate">{mostrarDadosSensiveis ? safeStr(clienteSelecionado?.email) : '***@***.***'}</span></div>
                                            <div className="flex flex-col gap-1"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CPF</span><span className="font-mono text-sm text-slate-800">{mostrarDadosSensiveis ? safeStr(clienteSelecionado?.cpf) : '***.***.***-**'}</span></div>
                                            <div className="flex flex-col gap-1"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nascimento</span><span className="font-medium text-slate-800 text-sm">{mostrarDadosSensiveis ? formatDateBR(clienteSelecionado?.nascimento) : '**/**/****'}</span></div>
                                            <div className="flex flex-col gap-1"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gênero / Sexo</span><span className="font-medium text-slate-800 text-sm">{safeStr(clienteSelecionado?.sexo) || 'Não informado'}</span></div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-end gap-4 pt-4 border-t border-slate-100">
                                            <a href={`https://wa.me/${safeStr(clienteSelecionado?.telefone).replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="w-full sm:w-auto bg-[#25D366] text-white text-xs font-bold px-6 py-3 rounded-xl flex justify-center items-center gap-2 shadow-sm hover:bg-[#1ebe57] transition-all relative overflow-hidden group">
                                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-in-out"></div>
                                                <Icons.WhatsApp className="w-4 h-4 relative z-10"/> <span className="relative z-10">Falar no WhatsApp</span>
                                            </a>

                                            <div className="flex-1 w-full flex flex-col">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Adicionar Etiqueta de Segmentação</label>
                                                <div className="flex gap-2">
                                                    <input type="text" placeholder="Ex: Cliente VIP..." value={novaTag} onChange={(e) => setNovaTag(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 w-full shadow-sm bg-slate-50" />
                                                    <button onClick={adicionarTag} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm">Adicionar</button>
                                                </div>
                                            </div>
                                        </div>
                                    </article>

                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                        <article className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 shadow-sm rounded-[24px] flex flex-col h-[350px] overflow-hidden">
                                            <header className="p-5 border-b border-indigo-100/50 bg-white/50 shrink-0">
                                                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2"><Icons.Trophy className="w-4 h-4 text-indigo-600"/> Trilha de Benefícios do Cliente</h4>
                                            </header>
                                            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5 relative before:absolute before:inset-0 before:ml-7 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-300 before:via-slate-300 before:to-transparent">
                                                {trilhaBeneficios.map((item, idx) => (
                                                    <div key={item.id} className="relative flex items-start gap-3">
                                                        <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 border-white ${item.cor} shadow shrink-0 z-10 mt-1`}><item.icone className="w-2.5 h-2.5 text-white"/></div>
                                                        <div className="flex-1 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors">
                                                            <div className="flex items-center justify-between mb-1"><span className="font-bold text-slate-800 text-xs">{item.titulo}</span><span className="text-[9px] font-bold text-slate-400">{formatDateBR(item.data)}</span></div>
                                                            <p className="text-[10px] text-slate-500 leading-relaxed">{item.desc}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </article>

                                        <article className="bg-rose-50/30 border border-rose-100 shadow-sm rounded-[24px] flex flex-col h-[350px] overflow-hidden">
                                            <header className="p-5 border-b border-rose-100/50 bg-white/50 flex items-center justify-between shrink-0"><h4 className="text-sm font-black text-rose-800 flex items-center gap-2"><Icons.AlertTriangle className="w-4 h-4 text-rose-500"/> Alertas de Risco</h4></header>
                                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
                                                {alertasPaginados?.map((alerta, i) => (
                                                    <div key={i} className="bg-white rounded-xl p-3.5 border border-rose-100 shadow-sm hover:border-rose-300 transition-colors">
                                                        <div className="flex justify-between items-center mb-1.5"><span className="text-[10px] uppercase font-black text-slate-600">{alerta.titulo}</span><span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{alerta.nivel}</span></div>
                                                        <div className="flex justify-between items-center border-t border-slate-50 pt-1.5 mt-1 text-[10px]"><span className="font-bold text-slate-400">{alerta.item1}</span><span className="font-bold text-slate-700">{alerta.valor1}</span></div>
                                                        <div className="flex justify-between items-center border-t border-slate-50 pt-1.5 mt-1 text-[10px]"><span className="font-bold text-slate-400">{alerta.item2}</span><span className="font-bold text-rose-600">{alerta.valor2}</span></div>
                                                    </div>
                                                ))}
                                                {alertasPaginados?.length === 0 && <p className="text-center text-xs text-slate-400 pt-10">Nenhum alerta registrado.</p>}
                                            </div>
                                            {totalRiscoPages > 1 && (
                                            <footer className="p-3 border-t border-rose-100/50 bg-white/50 shrink-0 flex justify-between items-center text-[10px] font-bold text-slate-500">
                                                <span>Pág {riscoPage} de {totalRiscoPages}</span>
                                                <div className="flex gap-1.5">
                                                    <button onClick={() => setRiscoPage(p => Math.max(1, p - 1))} disabled={riscoPage === 1} className="w-6 h-6 flex items-center justify-center bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 shadow-sm"><Icons.ChevronLeft className="w-3 h-3"/></button>
                                                    <button onClick={() => setRiscoPage(p => Math.min(totalRiscoPages, p + 1))} disabled={riscoPage === totalRiscoPages} className="w-6 h-6 flex items-center justify-center bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 shadow-sm"><Icons.ChevronRight className="w-3 h-3"/></button>
                                                </div>
                                            </footer>
                                            )}
                                        </article>
                                    </div>

                                    <article className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex flex-col">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2"><Icons.FileText className="w-4 h-4 text-slate-400" /> Anotações Internas (Gestão)</h4>
                                            <ProgressButton onClick={salvarNotasAPI} loading={savingState === 'notas'} text="Salvar Anotação" className="text-blue-600 hover:text-white font-bold bg-blue-50 hover:bg-blue-600 border border-blue-200 hover:border-transparent px-4 py-2 rounded-xl transition-colors text-xs shadow-sm" />
                                        </div>
                                        <textarea className="w-full min-h-[120px] bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y shadow-inner" value={clienteSelecionado?.notas || ''} onChange={(e) => setClienteSelecionado({...clienteSelecionado, notas: e.target.value})} placeholder="Adicione observações estratégicas sobre este cliente. Visível apenas para gestores." />
                                    </article>

                                </div>
                            </motion.section>
                        )}

                        {/* 🟢 ABA: RESUMO (MODO DE EDIÇÃO ORGANIZADO EM CARDS) */}
                        {crmSubTab === 'RESUMO' && perfilEmEdicao && (
                          <motion.section key="EDITAR_PERFIL" {...tabTransition} className="p-6">
                              
                              <div className="bg-white border border-slate-200 shadow-sm rounded-[24px] p-6 sm:p-8 w-full max-w-5xl mx-auto flex flex-col">
                                  <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                                      <div>
                                          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Icons.Edit3 className="w-6 h-6 text-blue-500" /> Central de Edição do Cliente</h3>
                                          <p className="text-[11px] text-slate-500 font-medium mt-1">Alterações aqui geram auditoria irreversível no histórico do cliente.</p>
                                      </div>
                                      <button onClick={() => setPerfilEmEdicao(false)} className="px-5 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-800 font-bold rounded-xl transition-colors shadow-sm text-sm">Voltar ao Resumo</button>
                                  </div>

                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                      
                                      {/* CARD: DADOS BÁSICOS */}
                                      <div className="bg-slate-50/50 border border-slate-200 p-6 rounded-2xl shadow-sm transition-all hover:border-blue-200">
                                          <div className="flex justify-between items-center mb-4">
                                              <h4 className="text-sm font-black text-slate-800 flex items-center gap-2"><Icons.UserCircle className="w-4 h-4 text-blue-500"/> Dados Pessoais</h4>
                                              {!editMode.basico && <button onClick={()=>setEditMode({...editMode, basico: true})} className="text-[10px] text-blue-600 font-bold uppercase bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm hover:bg-blue-100 transition-colors">Alterar</button>}
                                          </div>
                                          {!editMode.basico ? (
                                              <div className="grid grid-cols-2 gap-4">
                                                  <div><span className="text-[9px] text-slate-400 block uppercase font-bold tracking-widest">Nome Completo</span><span className="text-sm font-black text-slate-800">{clienteSelecionado?.nome}</span></div>
                                                  <div><span className="text-[9px] text-slate-400 block uppercase font-bold tracking-widest">Gênero</span><span className="text-sm font-black text-slate-800">{clienteSelecionado?.sexo || 'Não informado'}</span></div>
                                              </div>
                                          ) : (
                                              <div className="space-y-4">
                                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                      <div><label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Nome Completo</label><input type="text" value={formEdit.nome} onChange={e=>setFormEdit({...formEdit, nome: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold shadow-sm" /></div>
                                                      <div><label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Gênero</label><select value={formEdit.sexo} onChange={e=>setFormEdit({...formEdit, sexo: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold shadow-sm"><option value="Masculino">Masculino</option><option value="Feminino">Feminino</option><option value="Outro">Outro</option></select></div>
                                                  </div>
                                                  <div>
                                                      <label className="text-[9px] text-rose-500 uppercase font-bold tracking-wider block mb-1">Motivo da Alteração *</label>
                                                      <input type="text" value={formEdit.motivo} onChange={e=>setFormEdit({...formEdit, motivo: e.target.value})} className="w-full bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 text-sm text-rose-800 font-medium placeholder-rose-300" placeholder="Ex: Correção ortográfica..." />
                                                  </div>
                                                  <div className="flex gap-2 justify-end pt-2">
                                                      <button onClick={()=>setEditMode({...editMode, basico: false})} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
                                                      <ProgressButton onClick={salvarDadosBasicos} loading={savingState === 'saveBasico'} text="Confirmar" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition-colors" />
                                                  </div>
                                              </div>
                                          )}
                                      </div>

                                      {/* CARD: DADOS SENSÍVEIS (CPF) */}
                                      <div className="bg-slate-50/50 border border-slate-200 p-6 rounded-2xl shadow-sm transition-all hover:border-blue-200">
                                          <div className="flex justify-between items-center mb-4">
                                              <h4 className="text-sm font-black text-slate-800 flex items-center gap-2"><Icons.Shield className="w-4 h-4 text-emerald-500"/> Documentação (Sensível)</h4>
                                              {!editMode.sensivel && <button onClick={()=>setEditMode({...editMode, sensivel: true})} className="text-[10px] text-emerald-600 font-bold uppercase bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 shadow-sm hover:bg-emerald-100 transition-colors">Alterar Documentos</button>}
                                          </div>
                                          {!editMode.sensivel ? (
                                              <div className="grid grid-cols-2 gap-4">
                                                  <div><span className="text-[9px] text-slate-400 block uppercase font-bold tracking-widest">CPF Registrado</span><span className="text-sm font-mono font-black text-slate-800">{clienteSelecionado?.cpf}</span></div>
                                                  <div><span className="text-[9px] text-slate-400 block uppercase font-bold tracking-widest">Nascimento</span><span className="text-sm font-black text-slate-800">{formatDateBR(clienteSelecionado?.nascimento)}</span></div>
                                              </div>
                                          ) : (
                                              <div className="space-y-4">
                                                  <div className="grid grid-cols-2 gap-4">
                                                      <div><label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Novo CPF</label><input type="text" value={formEdit.cpf} onChange={e=>setFormEdit({...formEdit, cpf: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-mono font-bold shadow-sm" /></div>
                                                      <div><label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Nova Data</label><input type="date" value={formEdit.nascimento} onChange={e=>setFormEdit({...formEdit, nascimento: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold shadow-sm" /></div>
                                                  </div>
                                                  <div>
                                                      <label className="text-[9px] text-emerald-600 uppercase font-bold tracking-wider block mb-1">Anexo Obrigatório (RG/CNH) *</label>
                                                      <label className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 bg-white hover:bg-slate-50 rounded-xl p-3 cursor-pointer transition-colors shadow-sm text-xs font-bold text-slate-500">
                                                          <Icons.Upload className="w-4 h-4 text-slate-400" /> {formEdit.arquivo ? formEdit.arquivo.name : 'Anexar Foto (Máx 3MB)'}
                                                          <input type="file" accept="image/*,.pdf" onChange={e=>setFormEdit({...formEdit, arquivo: e.target.files[0]})} className="hidden" />
                                                      </label>
                                                  </div>
                                                  <div>
                                                      <label className="text-[9px] text-rose-500 uppercase font-bold tracking-wider block mb-1">Motivo da Alteração *</label>
                                                      <input type="text" value={formEdit.motivo} onChange={e=>setFormEdit({...formEdit, motivo: e.target.value})} className="w-full bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 text-sm text-rose-800 font-medium placeholder-rose-300" placeholder="Ex: Cliente corrigindo nome na Receita..." />
                                                  </div>
                                                  <div className="flex gap-2 justify-end pt-2">
                                                      <button onClick={()=>setEditMode({...editMode, sensivel: false})} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
                                                      <ProgressButton onClick={salvarDadosSensiveis} loading={savingState === 'saveSensivel'} text="Confirmar Segurança" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition-colors" />
                                                  </div>
                                              </div>
                                          )}
                                      </div>

                                      {/* CARD: TELEFONE / WHATSAPP */}
                                      <div className="bg-slate-50/50 border border-slate-200 p-6 rounded-2xl shadow-sm transition-all hover:border-blue-200">
                                          <div className="flex justify-between items-center mb-4">
                                              <h4 className="text-sm font-black text-slate-800 flex items-center gap-2"><Icons.WhatsApp className="w-4 h-4 text-[#25D366]"/> Contato (Telefone)</h4>
                                              {!editMode.telefone && <button onClick={()=>setEditMode({...editMode, telefone: true})} className="text-[10px] text-emerald-600 font-bold uppercase bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 shadow-sm hover:bg-emerald-100 transition-colors">Alterar Contato</button>}
                                          </div>
                                          {!editMode.telefone ? (
                                              <div><span className="text-[9px] text-slate-400 block uppercase font-bold tracking-widest">WhatsApp Validado</span><span className="text-sm font-black text-slate-800">{formatPhone(clienteSelecionado?.telefone)}</span></div>
                                          ) : (
                                              <div className="space-y-4">
                                                  <div><label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Novo Telefone / WhatsApp</label><input type="text" value={formEdit.telefone} onChange={e=>setFormEdit({...formEdit, telefone: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold shadow-sm" placeholder="+55 11 99999-9999"/></div>
                                                  <div>
                                                      <label className="text-[9px] text-rose-500 uppercase font-bold tracking-wider block mb-1">Motivo da Alteração *</label>
                                                      <input type="text" value={formEdit.motivo} onChange={e=>setFormEdit({...formEdit, motivo: e.target.value})} className="w-full bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 text-sm text-rose-800 font-medium placeholder-rose-300" placeholder="Ex: Perda do número antigo..." />
                                                  </div>
                                                  <div className="flex gap-2 justify-end pt-2">
                                                      <button onClick={()=>setEditMode({...editMode, telefone: false})} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
                                                      <ProgressButton onClick={salvarTelefone} loading={savingState === 'savePhone'} text="Salvar Telefone" className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition-colors" />
                                                  </div>
                                              </div>
                                          )}
                                      </div>

                                      {/* CARD: AUTENTICAÇÃO (E-MAIL E SENHA) */}
                                      <div className="bg-slate-50/50 border border-slate-200 p-6 rounded-2xl shadow-sm transition-all hover:border-blue-200 flex flex-col justify-between">
                                          <div className="flex justify-between items-center mb-4">
                                              <h4 className="text-sm font-black text-slate-800 flex items-center gap-2"><Icons.Key className="w-4 h-4 text-amber-500"/> Segurança da Conta</h4>
                                          </div>
                                          
                                          {/* E-mail */}
                                          <div className="mb-6 border-b border-slate-100 pb-5">
                                              <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-widest mb-1.5">E-mail Principal de Login</span>
                                              
                                              {editMode.email === 'idle' && (
                                                  <div className="flex items-center justify-between">
                                                      <span className="text-sm font-bold text-slate-800">{clienteSelecionado?.email}</span>
                                                      <div className="flex gap-2">
                                                          <button onClick={() => setEditMode({...editMode, email: 'link'})} title="Enviar Link de Confirmação" className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-100 shadow-sm transition-colors"><Icons.Mail className="w-4 h-4"/></button>
                                                          <button onClick={() => setEditMode({...editMode, email: 'force'})} title="Forçar Troca Manualmente" className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 border border-rose-100 shadow-sm transition-colors"><Icons.AlertTriangle className="w-4 h-4"/></button>
                                                      </div>
                                                  </div>
                                              )}

                                              {editMode.email === 'link' && (
                                                  <div className="space-y-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100 mt-2">
                                                      <div><label className="text-[9px] text-blue-700 uppercase font-bold tracking-wider block mb-1">Disparar link p/ Novo E-mail</label><input type="email" value={formEdit.email} onChange={e=>setFormEdit({...formEdit, email: e.target.value})} className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-xs font-bold shadow-sm" placeholder="novo@email.com"/></div>
                                                      <div className="flex justify-end gap-2"><button onClick={()=>setEditMode({...editMode, email: 'idle'})} className="text-[10px] font-bold text-slate-500 hover:text-slate-800">Cancelar</button><ProgressButton onClick={enviarLinkEmail} text="Enviar Validação" loading={savingState === 'emailLink'} className="bg-blue-600 text-white text-[10px] px-3 py-1.5 rounded-lg shadow-sm font-bold"/></div>
                                                  </div>
                                              )}

                                              {editMode.email === 'force' && (
                                                  <div className="space-y-3 bg-rose-50/50 p-4 rounded-xl border border-rose-100 mt-2">
                                                      <div><label className="text-[9px] text-rose-700 uppercase font-bold tracking-wider block mb-1">Forçar Novo E-mail</label><input type="email" value={formEdit.email} onChange={e=>setFormEdit({...formEdit, email: e.target.value})} className="w-full bg-white border border-rose-200 rounded-lg px-3 py-2 text-xs font-bold shadow-sm" placeholder="novo@email.com"/></div>
                                                      <div><label className="text-[9px] text-rose-700 uppercase font-bold tracking-wider block mb-1">Motivo (Audit) *</label><input type="text" value={formEdit.motivo} onChange={e=>setFormEdit({...formEdit, motivo: e.target.value})} className="w-full bg-white border border-rose-200 rounded-lg px-3 py-2 text-xs shadow-sm" placeholder="Motivo da alteração forçada..."/></div>
                                                      <div className="flex justify-end gap-2"><button onClick={()=>setEditMode({...editMode, email: 'idle'})} className="text-[10px] font-bold text-slate-500 hover:text-slate-800">Cancelar</button><ProgressButton onClick={forcarTrocaEmail} text="Aplicar Troca" loading={savingState === 'emailForce'} className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] px-3 py-1.5 rounded-lg shadow-sm font-bold"/></div>
                                                  </div>
                                              )}
                                          </div>

                                          {/* Senha */}
                                          <div>
                                              <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-widest mb-1.5">Redefinição de Senha</span>
                                              
                                              {editMode.senha === 'idle' && (
                                                  <div className="flex gap-2">
                                                      <ProgressButton onClick={enviarLinkSenha} loading={savingState === 'senhaLink'} text="Enviar Link" icon={Icons.Mail} className="flex-1 bg-white border border-slate-200 text-slate-700 hover:text-blue-600 font-bold py-2 rounded-xl text-[11px] shadow-sm transition-colors" />
                                                      <ProgressButton onClick={gerarSenhaProvisoria} loading={savingState === 'senhaTemp'} text="Gerar Temp (7m)" icon={Icons.Key} className="flex-1 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 font-bold py-2 rounded-xl text-[11px] shadow-sm transition-colors" />
                                                  </div>
                                              )}

                                              {editMode.senha === 'temp' && (
                                                  <div className="flex gap-2 w-full">
                                                      <div className="bg-amber-50 border border-amber-200 text-amber-800 font-mono font-bold py-2 px-4 rounded-xl text-center text-xs flex items-center justify-between shadow-sm flex-1">
                                                          <span className="text-base">{senhaTemp.codigo}</span> 
                                                          <div className="flex flex-col items-end">
                                                            <span className="text-[8px] uppercase bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-black">Temp</span>
                                                            <span className={`text-[9px] font-bold mt-0.5 ${tempoRestanteSenha === 'Expirada' ? 'text-rose-600' : 'text-amber-700'}`}>{tempoRestanteSenha}</span>
                                                          </div>
                                                      </div>
                                                      <button onClick={() => setEditMode({...editMode, senha: 'idle'})} title="Fechar" className="w-10 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:bg-slate-100 rounded-xl shadow-sm transition-colors shrink-0"><Icons.Close className="w-4 h-4" /></button>
                                                  </div>
                                              )}
                                          </div>
                                      </div>

                                  </div>
                              </div>
                          </motion.section>
                        )}
                        {/* 🟢 ABA: ENDEREÇOS (Modo Leitura / Estilo Netflix Clean & Performático) */}
                        {crmSubTab === 'ENDEREÇOS' && (
                        <motion.section key="ENDEREÇOS" {...tabTransition} className="max-w-6xl mx-auto w-full p-6 space-y-6">
                            
                            {/* Cabeçalho */}
                            <div className="flex justify-between items-center bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                                        <Icons.MapPin className="w-6 h-6 text-blue-500"/> Agenda de Endereços
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1 font-medium">Endereços cadastrados pelo cliente. Modo de visualização e auditoria.</p>
                                </div>
                                <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-center">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Registrado</span>
                                    <span className="text-lg font-black text-slate-800 leading-tight">{clienteSelecionado?.enderecos?.length || 0}</span>
                                </div>
                            </div>
                            
                            {/* Container Estilo Netflix (Carrossel Horizontal com Rolagem Fluida) */}
                            <div className="flex gap-5 overflow-x-auto custom-scrollbar snap-x pb-4 pt-1 px-1">
                                {clienteSelecionado?.enderecos?.length > 0 ? (
                                    clienteSelecionado.enderecos.map((end, idx) => (
                                        <article 
                                            key={end.id || idx} 
                                            className="snap-start shrink-0 w-[340px] bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 flex flex-col justify-between transition-all duration-200 hover:border-blue-400 hover:shadow-md group cursor-default"
                                        >
                                            <div>
                                                {/* Topo do Card: Ícone, Título e Badge Padrão Integrado (Sem cortes) */}
                                                <div className="flex items-start justify-between gap-2 mb-4">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors shrink-0">
                                                            <Icons.MapPin className="w-5 h-5"/>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h5 className="text-sm font-black text-slate-800 tracking-wide truncate" title={end.titulo || 'Endereço'}>
                                                                {end.titulo || 'Endereço sem Título'}
                                                            </h5>
                                                            <span className="text-[10px] font-bold text-slate-400 font-mono bg-slate-50 inline-block px-2 py-0.5 rounded-md mt-0.5 border border-slate-100">
                                                                CEP: {end.cep || '-'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Badge "Padrão" integrado dentro do fluxo (Sem sobressair para fora do card) */}
                                                    {end.padrao && (
                                                        <span className="shrink-0 bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider">
                                                            Padrão
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Dados Detalhados do Endereço */}
                                                <div className="space-y-2 text-[11px] text-slate-600 font-medium mb-5 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
                                                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-1.5">
                                                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Rua/Nº:</span> 
                                                        <span className="text-slate-800 font-bold text-right truncate max-w-[190px]" title={`${end.rua}, ${end.num}`}>
                                                            {end.rua ? `${end.rua}, ${end.num}` : '-'}
                                                        </span>
                                                    </div>

                                                    {end.complemento && (
                                                        <div className="flex justify-between items-center border-b border-slate-200/60 pb-1.5">
                                                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Complemento:</span> 
                                                            <span className="text-slate-800 text-right truncate max-w-[170px]" title={end.complemento}>
                                                                {end.complemento}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-1.5">
                                                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Bairro:</span> 
                                                        <span className="text-slate-800 text-right truncate max-w-[190px]" title={end.bairro}>
                                                            {end.bairro || '-'}
                                                        </span>
                                                    </div>

                                                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-1.5">
                                                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Cidade/UF:</span> 
                                                        <span className="text-slate-800 font-bold text-right truncate">
                                                            {end.cidade || '-'}{end.uf ? ` - ${end.uf}` : ''}
                                                        </span>
                                                    </div>

                                                    {end.referencia && (
                                                        <div className="pt-1">
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Ponto de Referência:</span>
                                                            <p className="text-[10px] text-slate-600 italic bg-white p-2 rounded-lg border border-slate-200/80 leading-relaxed break-words">
                                                                "{end.referencia}"
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Rodapé de Auditoria (Data e Hora) */}
                                            <div className="border-t border-slate-100 pt-3 mt-auto space-y-1.5">
                                                <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                                    <span>Criado em:</span> 
                                                    <span className="text-slate-600 font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{formatDateTimeBR(end.created_at || new Date())}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                                    <span>Atualizado:</span> 
                                                    <span className="text-slate-600 font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{formatDateTimeBR(end.updated_at || new Date())}</span>
                                                </div>
                                            </div>
                                        </article>
                                    ))
                                ) : (
                                    <div className="w-full flex flex-col items-center justify-center py-16 bg-white rounded-[24px] border-2 border-slate-200 border-dashed">
                                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 text-slate-300 border border-slate-100">
                                            <Icons.MapPin className="w-7 h-7" />
                                        </div>
                                        <p className="text-sm text-slate-500 font-bold">Nenhum endereço cadastrado por este cliente.</p>
                                    </div>
                                )}
                            </div>
                        </motion.section>
                        )}
                        {/* 🟢 ABA: CARTEIRAS / LIVRO RAZÃO (Estilo Netflix Clean & Performático) */}
                        {crmSubTab === 'CARTEIRAS (LIVRO RAZÃO)' && (
                        <motion.section key="CARTEIRAS" {...tabTransition} className="max-w-6xl mx-auto w-full p-6 space-y-8">
                            
                            {/* Cabeçalho da Seção */}
                            <div className="flex justify-between items-center bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                                        <Icons.CreditCard className="w-6 h-6 text-blue-500"/> Gestão de Carteira & Saldos
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1 font-medium">Visualização e lançamento manual de créditos, moedas e cashback do cliente.</p>
                                </div>
                                <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-center">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Status da Carteira</span>
                                    <span className="text-xs font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200/60 inline-block mt-0.5">Ativa</span>
                                </div>
                            </div>

                            {/* Carrossel Estilo Netflix para os Saldos (Cards Alinhados Lado a Lado) */}
                            <div className="flex gap-5 overflow-x-auto custom-scrollbar snap-x pb-2 pt-1 px-1">
                                
                                {/* Card 1: Hub Coins */}
                                <article className="snap-start shrink-0 w-[320px] bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 p-6 rounded-[24px] shadow-sm text-white flex flex-col justify-between relative overflow-hidden border border-indigo-700/50 transition-all duration-200 hover:border-indigo-400 hover:shadow-md group cursor-default">
                                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
                                    
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest block mb-1">Moeda Interna</span>
                                            <h5 className="text-sm font-black text-white tracking-wide">Hub Coins</h5>
                                        </div>
                                        <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-400 shrink-0">
                                            <Icons.Crown className="w-5 h-5"/>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-3xl font-black text-white tracking-tight">{safeNum(clienteSelecionado?.coins)}</p>
                                        <span className="text-[10px] text-indigo-200/80 font-medium block mt-1">
                                            Moedas acumuladas por compras e engajamento.
                                        </span>
                                    </div>
                                </article>

                                {/* Card 2: Cashback Disponível */}
                                <article className="snap-start shrink-0 w-[320px] bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex flex-col justify-between transition-all duration-200 hover:border-emerald-300 hover:shadow-md group cursor-default">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Saldo em Reais</span>
                                            <h5 className="text-sm font-black text-slate-800 tracking-wide">Cashback Reembolsável</h5>
                                        </div>
                                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                            <Icons.CreditCard className="w-5 h-5"/>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-3xl font-black text-emerald-600 tracking-tight">{formatCurrency(clienteSelecionado?.cashback)}</p>
                                        <span className="text-[10px] text-slate-400 font-medium block mt-1">
                                            Disponível para abatimento no próximo checkout.
                                        </span>
                                    </div>
                                </article>

                                {/* Card 3: Resumo de Uso / Economia */}
                                <article className="snap-start shrink-0 w-[320px] bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex flex-col justify-between transition-all duration-200 hover:border-blue-300 hover:shadow-md group cursor-default">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Economia Gerada</span>
                                            <h5 className="text-sm font-black text-slate-800 tracking-wide">Descontos Utilizados</h5>
                                        </div>
                                        <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                            <Icons.Tag className="w-5 h-5"/>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-3xl font-black text-slate-800 tracking-tight">{formatCurrency(safeNum(clienteSelecionado?.descontoLoja) + safeNum(clienteSelecionado?.descontoFrete))}</p>
                                        <span className="text-[10px] text-slate-400 font-medium block mt-1">
                                            Total economizado com cupons e frete grátis.
                                        </span>
                                    </div>
                                </article>
                            </div>

                            {/* Form de Adicionar Transação Manual (Caixa de Ação da Gestão) */}
                            <article className="bg-white p-6 sm:p-8 rounded-[24px] border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-3 pb-6 border-b border-slate-100 mb-6">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                        <Icons.Plus className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-black text-slate-800">Lançamento de Ajuste Manual</h4>
                                        <p className="text-xs text-slate-500 font-medium">Insira créditos ou debite valores da carteira do cliente com justificativa de auditoria.</p>
                                    </div>
                                </div>

                                <div className="space-y-5 max-w-3xl">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Tipo de Ativo *</label>
                                            <select 
                                                value={walletFlow.tipo} 
                                                onChange={e => setWalletFlow({...walletFlow, tipo: e.target.value})} 
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all"
                                            >
                                                <option>Hub Coins</option>
                                                <option>Cashback (R$)</option>
                                            </select>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Valor Numérico (Positivo ou Negativo) *</label>
                                            <input 
                                                type="number" 
                                                value={walletFlow.valor} 
                                                onChange={e => setWalletFlow({...walletFlow, valor: e.target.value})} 
                                                placeholder="Ex: 50 ou -20" 
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all" 
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block mb-1.5">Motivo da Transação (Obrigatório p/ Auditoria) *</label>
                                        <input 
                                            type="text" 
                                            value={walletFlow.motivo} 
                                            onChange={e => setWalletFlow({...walletFlow, motivo: e.target.value})} 
                                            placeholder="Ex: Bonificação por estorno pendente no pedido #1024..." 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all placeholder:text-slate-400" 
                                        />
                                    </div>

                                    <div className="pt-2 flex justify-end">
                                        <ProgressButton 
                                            onClick={processarTransacaoWallet} 
                                            loading={savingState === 'transacao'} 
                                            text="Processar Transação" 
                                            icon={Icons.Check} 
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl transition-colors shadow-sm text-xs" 
                                        />
                                    </div>
                                </div>
                            </article>
                        </motion.section>
                        )}
                        {/* 🟢 ABA: TIMELINE / AUDITORIA (Log Feed Moderno & Elegante) */}
                        {crmSubTab === 'TIMELINE (AUDIT)' && (
                        <motion.section key="TIMELINE" {...tabTransition} className="max-w-5xl mx-auto w-full p-6">
                            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                                
                                {/* Cabeçalho da Auditoria */}
                                <header className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                            <Icons.Activity className="w-5 h-5"/>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-800">Trilha de Auditoria & Segurança</h3>
                                            <p className="text-xs text-slate-500 font-medium mt-0.5">Histórico imutável de eventos, alterações e logs de segurança do perfil.</p>
                                        </div>
                                    </div>

                                    <ProgressButton 
                                        onClick={handleExportarPDF} 
                                        text="Exportar PDF" 
                                        icon={Icons.Download} 
                                        className="bg-white border border-slate-200 text-slate-700 hover:text-blue-600 font-bold px-4 py-2.5 rounded-xl shadow-sm hover:bg-slate-50 transition-colors text-xs"
                                    />
                                </header>

                                {/* Feed da Linha do Tempo */}
                                <div className="p-6 sm:p-8 relative flex-1 overflow-y-auto custom-scrollbar">
                                    {/* Linha vertical centralizada nos ícones */}
                                    <div className="absolute left-6 sm:left-12 top-8 bottom-8 w-0.5 bg-slate-200/80"></div>

                                    <div className="space-y-6 relative z-10">
                                        {auditLogsPaginados.map(log => {
                                            // Definição de cores e ícones baseados no tipo do evento
                                            let badgeStyle = "bg-blue-50 text-blue-600 border-blue-200";
                                            let dotStyle = "bg-blue-500 ring-blue-100";
                                            
                                            if (log.tipo === 'success' || log.tipo === 'REATIVAR') {
                                                badgeStyle = "bg-emerald-50 text-emerald-600 border-emerald-200";
                                                dotStyle = "bg-emerald-500 ring-emerald-100";
                                            } else if (log.tipo === 'warning' || log.tipo === 'SUSPENDER') {
                                                badgeStyle = "bg-amber-50 text-amber-600 border-amber-200";
                                                dotStyle = "bg-amber-500 ring-amber-100";
                                            } else if (log.tipo === 'danger' || log.tipo === 'ERROR') {
                                                badgeStyle = "bg-rose-50 text-rose-600 border-rose-200";
                                                dotStyle = "bg-rose-500 ring-rose-100";
                                            }

                                            return (
                                                <article key={log.id || Math.random()} className="relative pl-8 sm:pl-14 group">
                                                    {/* Marcador na Linha do Tempo */}
                                                    <div className={`absolute left-0 sm:left-[21px] top-4 w-3.5 h-3.5 rounded-full ring-4 shadow-sm transition-transform duration-200 ${dotStyle}`}></div>

                                                    {/* Card do Evento */}
                                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all duration-200">
                                                        
                                                        {/* Cabeçalho do Log: Título + Badge + Data */}
                                                        <div className="flex flex-wrap justify-between items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                                                            <div className="flex items-center gap-2.5">
                                                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${badgeStyle}`}>
                                                                    {log.tipo || 'EVENTO'}
                                                                </span>
                                                                <h5 className="font-black text-slate-800 text-sm tracking-wide">{log.titulo}</h5>
                                                            </div>
                                                            
                                                            <span className="text-[10px] font-bold text-slate-400 font-mono bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                                                                {formatDateTimeBR(log.data || log.created_at)}
                                                            </span>
                                                        </div>

                                                        {/* Descrição do Evento */}
                                                        <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50/60 p-3 rounded-xl border border-slate-100/80">
                                                            {log.desc || log.motivo || 'Nenhum detalhe adicional fornecido.'}
                                                        </p>

                                                        {/* Autor ou Origem da ação se existir */}
                                                        {log.autor && (
                                                            <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                                <span>Executado por:</span>
                                                                <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{log.autor}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </article>
                                            );
                                        })}

                                        {auditLogsPaginados.length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 text-slate-300 border border-slate-100">
                                                    <Icons.Activity className="w-7 h-7" />
                                                </div>
                                                <p className="text-sm font-bold text-slate-500">Nenhum registro de auditoria encontrado para este cliente.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Rodapé com Paginação */}
                                {totalTimelinePages > 1 && (
                                    <footer className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center text-xs font-bold text-slate-500 gap-3 shrink-0">
                                        <span>Mostrando {auditLogsPaginados.length} de {auditLogsFiltrados.length} registros</span>
                                        <div className="flex items-center gap-3">
                                            <span>Página {timelinePage} de {totalTimelinePages}</span>
                                            <div className="flex gap-1.5">
                                                <button 
                                                    type="button" 
                                                    onClick={() => setTimelinePage(p => Math.max(1, p - 1))} 
                                                    disabled={timelinePage === 1} 
                                                    className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"
                                                >
                                                    <Icons.ChevronLeft className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    type="button" 
                                                    onClick={() => setTimelinePage(p => Math.min(totalTimelinePages, p + 1))} 
                                                    disabled={timelinePage === totalTimelinePages} 
                                                    className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"
                                                >
                                                    <Icons.ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </footer>
                                )}
                            </div>
                        </motion.section>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* MODAL SUSPENSÃO DE CONTA */}
            <AnimatePresence>
                {modalStatusConta.isOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalStatusConta({ ...modalStatusConta, isOpen: false })} />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-[24px] shadow-2xl p-8 w-full max-w-md relative z-10 border border-slate-200">
                            <h3 className={`text-xl font-black mb-2 flex items-center gap-2 ${modalStatusConta.tipo === 'SUSPENDER' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {modalStatusConta.tipo === 'SUSPENDER' ? <><Icons.AlertTriangle/> Suspender Conta</> : <><Icons.Check/> Reativar Conta</>}
                            </h3>
                            <p className="text-sm font-medium text-slate-500 mb-4">
                                {modalStatusConta.tipo === 'SUSPENDER' 
                                    ? 'A suspensão impossibilita o cliente de comprar, receber comissões e editar dados.' 
                                    : 'O cliente voltará a ter acesso total à loja e aos seus benefícios.'}
                            </p>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Motivo Obrigatório *</label>
                            <textarea value={modalStatusConta.motivo} onChange={e => setModalStatusConta({...modalStatusConta, motivo: e.target.value})} rows="3" placeholder="Descreva o motivo desta ação..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 resize-none mb-6 shadow-inner" />
                            <div className="flex gap-3">
                                <button onClick={() => setModalStatusConta({ ...modalStatusConta, isOpen: false })} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors">Cancelar</button>
                                <ProgressButton 
                                    onClick={handleConfirmarStatusConta} 
                                    loading={savingState === 'statusConta'} 
                                    text={modalStatusConta.tipo === 'SUSPENDER' ? 'Confirmar Suspensão' : 'Confirmar Reativação'} 
                                    className={`flex-[2] text-white font-bold rounded-xl text-sm shadow-sm transition-colors ${modalStatusConta.tipo === 'SUSPENDER' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`} 
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </FadeIn>
    );
}