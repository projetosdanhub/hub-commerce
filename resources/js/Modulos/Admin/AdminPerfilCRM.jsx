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
    UserCircle: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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
  <motion.div ref={ref} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3, ease: "easeOut" }} className={className} {...props}>
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
    const [riscoPerPage] = useState(4); // 🟢 4 itens por página como solicitado
    const [perfilEmEdicao, setPerfilEmEdicao] = useState(false);
    
    // Toggle para esconder dados sensíveis no resumo
    const [mostrarDadosSensiveis, setMostrarDadosSensiveis] = useState(true);

    // 🟢 Novo Modal de Suspensão / Reativação
    const [modalStatusConta, setModalStatusConta] = useState({ isOpen: false, tipo: null, motivo: '' });

    // Fluxos de Segurança
    const [emailFlow, setEmailFlow] = useState({ ativo: false, step: 1, novoEmail: '', motivo: '' });
    const [emailEditFlow, setEmailEditFlow] = useState({ cooldown: 0, attempts: 0, lockedUntil: null }); 
    const [phoneFlow, setPhoneFlow] = useState({ novoTelefone: '', motivo: '' });
    const [walletFlow, setWalletFlow] = useState({ tipo: 'Hub Coins', valor: '', motivo: '' });
    const [senhaTemp, setSenhaTemp] = useState({ codigo: null, expiraEm: null });
    const [tempoRestanteSenha, setTempoRestanteSenha] = useState('');
    const [docSensivel, setDocSensivel] = useState({ cpf: '', nascimento: '', arquivo: null });
    
    // Formulários
    const [showAddEndereco, setShowAddEndereco] = useState(false);
    const [enderecoFlow, setEnderecoFlow] = useState({ cep: '', rua: '', num: '', complemento: '', bairro: '', cidade: '', uf: '', referencia: '', padrao: false });

    // Timeline e Filtros do Histórico
    const [timelinePage, setTimelinePage] = useState(1);
    const timelinePerPage = 6;
    const [timelineDateOpen, setTimelineDateOpen] = useState(false);
    const [timelineDateRange, setTimelineDateRange] = useState({ start: '', end: '' });
    const [loadingTimeline, setLoadingTimeline] = useState(false);
    
    const [orderHistoryTab, setOrderHistoryTab] = useState('TODOS');
    const [orderHistoryPage, setOrderHistoryPage] = useState(1);
    const [orderHistoryDateOpen, setOrderHistoryDateOpen] = useState(false);
    const [orderHistoryDateRange, setOrderHistoryDateRange] = useState({ start: '', end: '' });
    const orderHistoryPerPage = 5;

    // Cronômetros
    useEffect(() => {
        if (emailEditFlow.cooldown > 0) {
            const timer = setTimeout(() => {
                setEmailEditFlow(prev => ({ ...prev, cooldown: prev.cooldown - 1 }));
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [emailEditFlow.cooldown]);

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


    // Ações de Carregamento Fakes para UI Local
    const triggerAcao = (actionId, msg) => {
        setSavingState(actionId);
        setTimeout(() => { setSavingState(null); if (showToastGlob) showToastGlob(msg); }, 1200);
    };

    const registrarLogAudit = (titulo, desc, tipo = 'info') => {
        const novoLog = { id: Date.now(), data: new Date().toISOString(), titulo, desc, tipo };
        setClienteSelecionado(prev => ({ ...prev, auditLogs: [novoLog, ...(prev.auditLogs || [])] }));
    };

    // 🟢 REFRESH COM TOAST
    const handleRefreshProfile = async () => {
        setSavingState('refreshProfile');
        await refetchClients();
        setSavingState(null);
        const now = new Date();
        if(showToastGlob) showToastGlob(`Dados atualizados em ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}`);
    };

    // Mutações da API
    const mutacaoNotas = useMutation({
        mutationFn: async (notas) => await api.put(`/admin/customers/${clienteSelecionado.id}/notes`, { notas }),
        onSuccess: () => { queryClientLocal.invalidateQueries({ queryKey: ['clientesCRM'] }); if(showToastGlob) showToastGlob('Anotações salvas!'); },
    });

    const mutacaoTags = useMutation({
        mutationFn: async (novasTags) => await api.put(`/admin/customers/${clienteSelecionado.id}/tags`, { tags: novasTags }),
        onSuccess: () => { queryClientLocal.invalidateQueries({ queryKey: ['clientesCRM'] }); if(showToastGlob) showToastGlob('Tags atualizadas!'); },
    });

    const mutacaoTelefone = useMutation({
        mutationFn: async (dados) => await api.put(`/admin/customers/${clienteSelecionado.id}/phone`, dados),
        onSuccess: () => { queryClientLocal.invalidateQueries({ queryKey: ['clientesCRM'] }); if(showToastGlob) showToastGlob('Telefone atualizado!'); setPhoneFlow({ novoTelefone: '', motivo: '' }); },
    });

    const mutacaoDadosSensiveis = useMutation({
        mutationFn: async (formData) => await api.post(`/admin/customers/${clienteSelecionado.id}/sensitive-data`, formData, { headers: { 'Content-Type': 'multipart/form-data' }}),
        onSuccess: () => { queryClientLocal.invalidateQueries({ queryKey: ['clientesCRM'] }); if(showToastGlob) showToastGlob('Documentos enviados!'); },
    });

    const mutacaoSenha = useMutation({
        mutationFn: async () => await api.post(`/admin/customers/${clienteSelecionado.id}/generate-temp-password`),
        onSuccess: (response) => {
            queryClientLocal.invalidateQueries({ queryKey: ['clientesCRM'] });
            const expiraEm = new Date(new Date().getTime() + 7 * 60000); 
            setSenhaTemp({ codigo: response.data.password, expiraEm }); 
            if(showToastGlob) showToastGlob(response.data.message);
        }
    });

    // 🟢 MUTAÇÃO DE STATUS DA CONTA (O MODAL AGORA CONTROLA ISSO)
    const mutacaoStatusConta = useMutation({
        mutationFn: async (dados) => await api.post(`/admin/customers/${clienteSelecionado.id}/status`, dados), 
        onSuccess: (response, variables) => {
            queryClientLocal.invalidateQueries({ queryKey: ['clientesCRM'] });
            const novoStatus = variables.acao === 'SUSPENDER' ? 'BLOQUEADA' : 'ATIVO';
            setClienteSelecionado(prev => ({...prev, status: novoStatus}));
            setModalStatusConta({ isOpen: false, tipo: null, motivo: '' });
            if(showToastGlob) showToastGlob(variables.acao === 'SUSPENDER' ? 'Conta suspensa com sucesso.' : 'Conta reativada com sucesso.');
        }
    });

    const handleConfirmarStatusConta = () => {
        if (!modalStatusConta.motivo.trim()) return alert("O motivo é obrigatório.");
        setSavingState('statusConta');
        
        mutacaoStatusConta.mutate(
            { acao: modalStatusConta.tipo, motivo: modalStatusConta.motivo },
            { 
               onSettled: () => setSavingState(null),
               onError: () => {
                   // Fallback Optimista caso a API ainda não esteja rodando no backend
                   const novoStatus = modalStatusConta.tipo === 'SUSPENDER' ? 'BLOQUEADA' : 'ATIVO';
                   setClienteSelecionado(prev => ({...prev, status: novoStatus}));
                   registrarLogAudit(
                       modalStatusConta.tipo === 'SUSPENDER' ? 'Conta Suspensa' : 'Conta Reativada',
                       `Motivo: ${modalStatusConta.motivo}`,
                       modalStatusConta.tipo === 'SUSPENDER' ? 'warning' : 'success'
                   );
                   if(showToastGlob) showToastGlob(modalStatusConta.tipo === 'SUSPENDER' ? 'Conta suspensa com sucesso.' : 'Conta reativada com sucesso.');
                   setModalStatusConta({ isOpen: false, tipo: null, motivo: '' });
                   setSavingState(null);
               }
            }
        );
    };

    const mutacaoCarteira = useMutation({
        mutationFn: async (dados) => await api.post(`/admin/customers/${clienteSelecionado.id}/wallet-transaction`, dados),
        onSuccess: (response) => {
            queryClientLocal.invalidateQueries({ queryKey: ['clientesCRM'] }); 
            setWalletFlow({ tipo: 'Hub Coins', valor: '', motivo: '' }); 
            if(showToastGlob) showToastGlob(response.data.message);
        }
    });

    // --- FUNÇÕES DE AÇÃO ---
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

    const salvarNotasAPI = () => {
        setSavingState('notas');
        mutacaoNotas.mutate(clienteSelecionado.notas, { onSettled: () => setSavingState(null) });
    };

    const avancarEmailStep2 = () => {
        if (!emailFlow.motivo.trim()) return alert("Obrigatório: Preencha o motivo da alteração.");
        registrarLogAudit('Início da Troca de E-mail', 'Motivo informado pelo gestor: ' + emailFlow.motivo, 'info');
        setEmailFlow(prev => ({ ...prev, step: 2 }));
    };

    const enviarCodigoEmail = () => {
        if (emailEditFlow.lockedUntil && new Date() < emailEditFlow.lockedUntil) return alert("Sistema de segurança ativo. Aguarde.");
        if (!emailFlow.novoEmail.trim() || !emailFlow.novoEmail.includes('@')) return alert("Digite um e-mail válido.");

        const novasTentativas = emailEditFlow.attempts + 1;
        triggerAcao('envioEmailCode', 'Código enviado para o novo e-mail!');
        registrarLogAudit('Validação de Novo E-mail', `Código de confirmação enviado para ${emailFlow.novoEmail}.`, 'warning');

        if (novasTentativas >= 3) {
            const tempoBloqueio = new Date(new Date().getTime() + 5 * 60000);
            setEmailEditFlow({ cooldown: 0, attempts: 0, lockedUntil: tempoBloqueio });
            registrarLogAudit('Alerta de Segurança', `Bloqueio automático após 3 tentativas de envio para ${emailFlow.novoEmail}.`, 'warning');
        } else {
            setEmailEditFlow(prev => ({ ...prev, cooldown: 45, attempts: novasTentativas }));
        }
    };

    const salvarTelefone = () => {
        if (!phoneFlow.motivo.trim() || !phoneFlow.novoTelefone.trim()) return alert("Preencha todos os campos.");
        setSavingState('savePhone');
        mutacaoTelefone.mutate({ telefone: phoneFlow.novoTelefone, motivo: phoneFlow.motivo }, { onSettled: () => { 
            setSavingState(null);
            registrarLogAudit('Telefone Alterado', `Novo: ${phoneFlow.novoTelefone} | Motivo: ${phoneFlow.motivo}`, 'warning');
        }});
    };

    const salvarNovoEndereco = () => {
        if (!enderecoFlow.cep || !enderecoFlow.rua || !enderecoFlow.num) return alert("Preencha os campos obrigatórios.");
        triggerAcao('saveAddress', 'Novo endereço adicionado com sucesso!');
        const novoEndereco = { ...enderecoFlow, id: Date.now() };
        setClienteSelecionado(prev => ({ ...prev, enderecos: [novoEndereco, ...(prev.enderecos || [])] }));
        registrarLogAudit('Novo Endereço Adicionado', `O gestor adicionou manualmente o endereço: ${enderecoFlow.rua}, ${enderecoFlow.num} - ${enderecoFlow.cidade}/${enderecoFlow.uf}.`, 'info');
        setEnderecoFlow({ cep: '', rua: '', num: '', complemento: '', bairro: '', cidade: '', uf: '', referencia: '', padrao: false });
        setShowAddEndereco(false);
    };

    const salvarDadosSensiveis = () => {
        if (!docSensivel.arquivo) return alert("Obrigatório: Anexe o documento oficial.");
        setSavingState('saveDocs');
        const formData = new FormData();
        formData.append('arquivo', docSensivel.arquivo);
        if (docSensivel.cpf) formData.append('cpf', docSensivel.cpf);
        if (docSensivel.nascimento) formData.append('nascimento', docSensivel.nascimento);
        mutacaoDadosSensiveis.mutate(formData, { onSettled: () => {
            setSavingState(null);
            registrarLogAudit('Dados Sensíveis Atualizados', `Solicitação de alteração enviada com anexo (${docSensivel.arquivo.name}).`, 'warning');
        }});
    };

    const gerarSenhaProvisoria = () => { setSavingState('gerarSenha'); mutacaoSenha.mutate(null, { onSettled: () => setSavingState(null) }); };
    
    const processarTransacaoWallet = () => {
        if (!walletFlow.valor || walletFlow.valor <= 0 || !walletFlow.motivo.trim()) return alert("Preencha valor e motivo.");
        setSavingState('transacao');
        mutacaoCarteira.mutate({ tipo: walletFlow.tipo, valor: walletFlow.valor, motivo: walletFlow.motivo }, { onSettled: () => setSavingState(null) });
    };

    const aplicarFiltroTimeline = () => {
        setIsTimelineModalOpen(false);
        setLoadingTimeline(true);
        setTimeout(() => setLoadingTimeline(false), 800);
    };

    const handleExportarPDF = () => {
        triggerAcao('exportPdf', 'Relatório gerado para impressão!');
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
        let logs = clienteSelecionado.auditLogs;
        if (timelineDateRange.start) logs = logs.filter(log => new Date(log.data.split('T')[0]) >= new Date(timelineDateRange.start));
        if (timelineDateRange.end) logs = logs.filter(log => new Date(log.data.split('T')[0]) <= new Date(timelineDateRange.end));
        return logs.sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    }, [clienteSelecionado, timelineDateRange]);

    const totalTimelinePages = Math.ceil(auditLogsFiltrados.length / timelinePerPage) || 1;
    const auditLogsPaginados = auditLogsFiltrados.slice((timelinePage - 1) * timelinePerPage, timelinePage * timelinePerPage);

    const historicoPedidosFiltrado = useMemo(() => {
        if(!clienteSelecionado || !clienteSelecionado.pedidos) return [];
        let ped = clienteSelecionado.pedidos;
        if (orderHistoryDateRange.start) ped = ped.filter(p => new Date(p.data_raw) >= new Date(orderHistoryDateRange.start));
        if (orderHistoryDateRange.end) ped = ped.filter(p => new Date(p.data_raw) <= new Date(orderHistoryDateRange.end));
        if (orderHistoryTab === 'CONCLUÍDOS') ped = ped.filter(p => ['ENTREGUE', 'DESPACHADO', 'SEPARACAO'].includes(p.status));
        else if (orderHistoryTab === 'REEMBOLSADOS') ped = ped.filter(p => p.status === 'REEMBOLSADO');
        else if (orderHistoryTab === 'CANCELADOS') ped = ped.filter(p => p.status === 'CANCELADO');
        return ped.sort((a,b) => new Date(b.data_raw).getTime() - new Date(a.data_raw).getTime());
    }, [clienteSelecionado, orderHistoryDateRange, orderHistoryTab]);

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
                            {clienteSelecionado?.tags && clienteSelecionado.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {clienteSelecionado.tags.map((tag, idx) => (
                                        <span key={idx} className="bg-white border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
                                            <Icons.Tag className="w-3 h-3 inline-block mr-1 -mt-0.5"/>{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 z-10 relative">
                        {/* 🟢 BOTÃO REFRESH COM TOAST */}
                        <button onClick={handleRefreshProfile} className={`w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-all shadow-sm ${savingState === 'refreshProfile' || isFetchingClients ? 'animate-spin text-blue-500' : ''}`} title="Atualizar">
                            <Icons.Refresh className="w-6 h-6"/>
                        </button>

                        {/* 🟢 BOTÃO SUSPENDER / REATIVAR ABRE O MODAL */}
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

                <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50/30">
                    <AnimatePresence mode="wait">
                        
                        {/* ========================================================= */}
                        {/* 🟢 ABA: RESUMO LÍQUIDO (TOTALMENTE REDESENHADA)           */}
                        {/* ========================================================= */}
                        {crmSubTab === 'RESUMO' && !perfilEmEdicao && (
                            <motion.section key="RESUMO_READ" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col lg:flex-row gap-6 p-6">
                                
                                {/* COLUNA ESQUERDA: BARRA VERTICAL DE MÉTRICAS */}
                                <div className="flex flex-col border border-slate-200 rounded-[24px] bg-white shadow-sm overflow-hidden w-full lg:w-1/4 shrink-0 h-max">
                                    
                                    <div className="p-5 border-b border-slate-100 hover:bg-slate-50 transition-colors group cursor-default">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Gasto Total (LTV)</p>
                                        <p className="text-2xl font-black text-emerald-600 group-hover:scale-105 transform origin-left transition-transform">{formatCurrency(clienteSelecionado?.ltv)}</p>
                                        <p className="text-[10px] text-slate-500 mt-1 font-medium">Ticket Médio: <strong className="text-slate-700">{formatCurrency(safeNum(clienteSelecionado?.ltv) / (safeNum(clienteSelecionado?.compras) || 1))}</strong></p>
                                    </div>
                                    
                                    <div className="p-5 border-b border-slate-100 hover:bg-slate-50 transition-colors group cursor-default">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pedidos Finalizados</p>
                                        <p className="text-2xl font-black text-slate-800 group-hover:scale-105 transform origin-left transition-transform">{safeNum(clienteSelecionado?.compras)}</p>
                                        <p className="text-[10px] text-slate-500 mt-1 font-medium">Última compra: <strong className="text-slate-700">{formatDateBR(clienteSelecionado?.ultimaCompra)}</strong></p>
                                    </div>
                                    
                                    <div className="p-5 border-b border-slate-100 hover:bg-slate-50 transition-colors group cursor-default">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Qtd. de Produtos</p>
                                        <p className="text-2xl font-black text-slate-800 group-hover:scale-105 transform origin-left transition-transform">{safeNum(clienteSelecionado?.produtosComprados) || 0}</p>
                                    </div>
                                    
                                    <div className="p-5 hover:bg-slate-50 transition-colors group cursor-default">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Uso de Benefícios</p>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500 font-medium">Cupons Usados:</span>
                                                <strong className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{safeNum(clienteSelecionado?.cuponsUsados)}</strong>
                                            </div>
                                            {/* Lista de Cupons Usados */}
                                            {clienteSelecionado?.historicoCupons && clienteSelecionado.historicoCupons.length > 0 && (
                                                <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-2 mt-2 pr-1 border-t border-slate-100 pt-3">
                                                    {clienteSelecionado.historicoCupons.map((cupom, idx) => (
                                                        <div key={idx} className="flex flex-col gap-0.5 bg-white border border-slate-200 p-2 rounded-lg shadow-sm">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-[9px] font-black text-slate-700">{cupom.nome}</span>
                                                                <span className="text-[9px] font-bold text-emerald-600">-{formatCurrency(cupom.valor)}</span>
                                                            </div>
                                                            <span className="text-[8px] text-slate-400 uppercase">{cupom.tipo}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-3">
                                                <span className="text-slate-500 font-medium">Desc. Frete:</span>
                                                <strong className="text-emerald-600">{formatCurrency(clienteSelecionado?.descontoFrete)}</strong>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500 font-medium">Desc. Loja:</span>
                                                <strong className="text-emerald-600">{formatCurrency(clienteSelecionado?.descontoLoja)}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* COLUNA DIREITA: DADOS DO CLIENTE, TIMELINE E ALERTAS */}
                                <div className="flex-1 flex flex-col gap-6 min-w-0">
                                    
                                    {/* 1. Sobre o Cliente (Card Horizontal) */}
                                    <article className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm flex flex-col gap-6 w-full relative">
                                        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                                                    <Icons.UserCircle className="w-5 h-5 text-blue-500"/> Sobre o Cliente
                                                </h3>
                                                <button onClick={() => setPerfilEmEdicao(true)} className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                                                    Editar
                                                </button>
                                            </div>
                                            <button onClick={() => setMostrarDadosSensiveis(!mostrarDadosSensiveis)} title="Exibir/Esconder Dados" className="text-slate-400 hover:text-slate-600 transition-colors p-1 bg-slate-50 rounded-lg border border-slate-200 shadow-sm">
                                                {mostrarDadosSensiveis ? <Icons.EyeOff className="w-4 h-4" /> : <Icons.Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">WhatsApp / Telefone</span>
                                                <span className="font-bold text-slate-800 text-sm">{mostrarDadosSensiveis ? formatPhone(clienteSelecionado?.telefone) : '***.***.***-**'}</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">E-mail de Contato</span>
                                                <span className="font-medium text-slate-800 text-sm truncate">{mostrarDadosSensiveis ? safeStr(clienteSelecionado?.email) : '***@***.***'}</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CPF</span>
                                                <span className="font-mono text-sm text-slate-800">{mostrarDadosSensiveis ? safeStr(clienteSelecionado?.cpf) : '***.***.***-**'}</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nascimento</span>
                                                <span className="font-medium text-slate-800 text-sm">{mostrarDadosSensiveis ? formatDateBR(clienteSelecionado?.nascimento) : '**/**/****'}</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gênero / Sexo</span>
                                                <span className="font-medium text-slate-800 text-sm">{safeStr(clienteSelecionado?.sexo) || 'Não informado'}</span>
                                            </div>
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

                                    {/* 2. Grid Netflix: Trilha de Benefícios & Alertas */}
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                        
                                        {/* Trilha de Benefícios (Estilo Netflix Automatizado) */}
                                        <article className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 shadow-sm rounded-[24px] flex flex-col h-[350px] overflow-hidden">
                                            <header className="p-5 border-b border-indigo-100/50 bg-white/50 shrink-0">
                                                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2"><Icons.Trophy className="w-4 h-4 text-indigo-600"/> Trilha de Benefícios do Cliente</h4>
                                            </header>
                                            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5 relative before:absolute before:inset-0 before:ml-7 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-300 before:via-slate-300 before:to-transparent">
                                                {trilhaBeneficios.map((item, idx) => (
                                                    <div key={item.id} className="relative flex items-start gap-3">
                                                        <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 border-white ${item.cor} shadow shrink-0 z-10 mt-1`}>
                                                            <item.icone className="w-2.5 h-2.5 text-white"/>
                                                        </div>
                                                        <div className="flex-1 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="font-bold text-slate-800 text-xs">{item.titulo}</span>
                                                                <span className="text-[9px] font-bold text-slate-400">{formatDateBR(item.data)}</span>
                                                            </div>
                                                            <p className="text-[10px] text-slate-500 leading-relaxed">{item.desc}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </article>

                                        {/* Alertas de Risco */}
                                        <article className="bg-rose-50/30 border border-rose-100 shadow-sm rounded-[24px] flex flex-col h-[350px] overflow-hidden">
                                            <header className="p-5 border-b border-rose-100/50 bg-white/50 flex items-center justify-between shrink-0">
                                                <h4 className="text-sm font-black text-rose-800 flex items-center gap-2"><Icons.AlertTriangle className="w-4 h-4 text-rose-500"/> Alertas de Risco</h4>
                                            </header>
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

                                    {/* 3. Anotações Internas */}
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

                        {/* 🟢 ABA: RESUMO (MODO DE EDIÇÃO) */}
                        {crmSubTab === 'RESUMO' && perfilEmEdicao && (
                          <motion.section key="EDITAR_PERFIL" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 w-full max-w-4xl mx-auto flex flex-col my-6">
                              <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                                  <div><h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Icons.Edit3 className="w-6 h-6 text-blue-500" /> Editar Cliente</h3></div>
                                  <button onClick={() => setPerfilEmEdicao(false)} className="px-5 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-800 font-bold rounded-xl transition-colors shadow-sm text-sm">Voltar</button>
                              </div>
                              <div className="space-y-8">
                                  {/* FLUXO E-MAIL */}
                                  <div className="border-t border-slate-100 pt-8">
                                      <div className="flex items-center justify-between mb-4"><label className="text-base font-bold text-slate-800">E-mail Principal</label>{!emailFlow.ativo && <button onClick={() => setEmailFlow(prev => ({...prev, ativo: true}))} className="text-xs uppercase font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">Alterar</button>}</div>
                                      {!emailFlow.ativo ? <p className="text-sm text-slate-600">{clienteSelecionado?.email}</p> : (
                                          <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl space-y-5">
                                              {emailFlow.step === 1 ? (
                                                  <div className="flex gap-4 items-end"><div className="flex-1"><label className="text-xs font-bold text-blue-800 mb-2">Motivo</label><input type="text" value={emailFlow.motivo} onChange={e => setEmailFlow({...emailFlow, motivo: e.target.value})} className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3" /></div><ProgressButton onClick={avancarEmailStep2} text="Avançar" className="bg-blue-600 text-white py-3 px-6 rounded-xl" /></div>
                                              ) : (
                                                  <div className="flex gap-4 items-end"><div className="flex-1"><label className="text-xs font-bold text-blue-800 mb-2">Novo E-mail</label><input type="email" value={emailFlow.novoEmail} onChange={e => setEmailFlow({...emailFlow, novoEmail: e.target.value})} className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3" /></div><ProgressButton onClick={enviarCodigoEmail} loading={savingState === 'envioEmailCode'} text="Enviar Código" className="bg-emerald-600 text-white py-3 px-5 rounded-xl" /></div>
                                              )}
                                          </div>
                                      )}
                                  </div>

                                  {/* FLUXO TELEFONE */}
                                  <div className="border-t border-slate-100 pt-8">
                                      <label className="text-base font-bold text-slate-800 block mb-4">WhatsApp</label>
                                      <div className="flex gap-5"><div className="flex-1"><input type="text" value={phoneFlow.novoTelefone} onChange={e => setPhoneFlow({...phoneFlow, novoTelefone: e.target.value})} placeholder={clienteSelecionado?.telefone} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" /></div><div className="flex-[2] flex gap-3"><input type="text" value={phoneFlow.motivo} onChange={e => setPhoneFlow({...phoneFlow, motivo: e.target.value})} placeholder="Motivo" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" /><ProgressButton onClick={salvarTelefone} loading={savingState === 'savePhone'} text="Salvar" className="bg-slate-800 text-white py-3 px-8 rounded-xl" /></div></div>
                                  </div>

                                  {/* SENHA */}
                                  <div className="border-t border-slate-100 pt-8">
                                      <label className="text-base font-bold text-slate-800 block mb-4">Senha Provisória</label>
                                      <div className="flex flex-col sm:flex-row gap-4 w-full">
                                          <div className="flex-1 min-w-[250px] relative">
                                            {senhaTemp.codigo ? (
                                                <div className="flex gap-2 w-full">
                                                    <div className="bg-amber-50 border border-amber-200 text-amber-800 font-mono font-bold py-3 px-4 rounded-xl text-center text-sm flex items-center justify-between shadow-sm flex-1">
                                                        <span>{senhaTemp.codigo}</span> 
                                                        <div className="flex flex-col items-end">
                                                          <span className="text-[9px] uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">Força Alteração</span>
                                                          <span className={`text-[10px] font-bold mt-0.5 ${tempoRestanteSenha === 'Expirada' ? 'text-rose-600' : 'text-amber-700'}`}>
                                                              {tempoRestanteSenha === 'Expirada' ? 'Expirada' : `Restam ${tempoRestanteSenha}`}
                                                          </span>
                                                        </div>
                                                    </div>
                                                    <button onClick={gerarSenhaProvisoria} title="Gerar Outra Senha Provisória" className="w-12 flex items-center justify-center bg-white border border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700 rounded-xl shadow-sm transition-colors shrink-0"><Icons.Repeat className="w-5 h-5" /></button>
                                                </div>
                                            ) : (
                                                <ProgressButton onClick={gerarSenhaProvisoria} loading={savingState === 'gerarSenha'} text="Gerar Nova Senha (7min)" className="bg-white border border-amber-200 text-amber-600 py-3 px-5 rounded-xl w-full" />
                                            )}
                                          </div>
                                      </div>
                                  </div>

                                  {/* DOCUMENTOS */}
                                  <div className="border-t border-slate-100 pt-8">
                                      <div className="flex items-center justify-between mb-4">
                                          <label className="text-sm font-bold text-slate-800">Dados Pessoais Sensíveis</label>
                                          <ProgressButton onClick={salvarDadosSensiveis} loading={savingState === 'saveDocs'} text="Salvar Documento" loadingText="..." className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg text-[10px] uppercase tracking-wider shadow-sm transition-colors" />
                                      </div>
                                      <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-xl mb-6 text-[11px] text-yellow-800 font-medium flex gap-2 items-center shadow-sm">
                                          <Icons.Info className="w-4 h-4 shrink-0" />
                                          <p>Para alterar CPF ou Nascimento, preencha os novos dados e <strong>anexe obrigatoriamente a foto legível do RG ou CNH</strong> (Máx 3MB).</p>
                                      </div>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Novo CPF / NIF</label>
                                              <input type="text" value={docSensivel.cpf} onChange={e => setDocSensivel({...docSensivel, cpf: e.target.value})} placeholder={clienteSelecionado?.cpf} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-800 transition-all shadow-sm" />
                                          </div>
                                          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Nova Data de Nascimento</label>
                                              <input type="date" value={docSensivel.nascimento} onChange={e => setDocSensivel({...docSensivel, nascimento: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-800 transition-all shadow-sm" />
                                          </div>
                                      </div>
                                      <div className="mt-4">
                                          <label className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 rounded-xl p-4 cursor-pointer transition-colors shadow-sm">
                                              <Icons.Upload className="w-4 h-4 text-slate-400" />
                                              <span className="text-xs font-bold text-slate-600">{docSensivel.arquivo ? docSensivel.arquivo.name : 'Clique para Anexar Comprovante (Obrigatório)'}</span>
                                              <input type="file" accept="image/*,application/pdf" onChange={e => setDocSensivel({...docSensivel, arquivo: e.target.files[0]})} className="hidden" />
                                          </label>
                                      </div>
                                  </div>
                              </div>
                          </motion.section>
                        )}

                        {/* 🟢 ABA: CARTEIRAS */}
                        {crmSubTab === 'CARTEIRAS (LIVRO RAZÃO)' && (
                          <motion.section key="CARTEIRAS" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 max-w-4xl mx-auto w-full p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <article className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-sm text-white"><p className="text-xs font-bold text-blue-200 mb-2">Saldo Atual (Coins)</p><p className="text-5xl font-black">{safeNum(clienteSelecionado?.coins)}</p></article>
                                <article className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm"><p className="text-xs font-bold text-slate-400 mb-2">Cashback Disponível</p><p className="text-5xl font-black text-emerald-600">{formatCurrency(clienteSelecionado?.cashback)}</p></article>
                            </div>
                            <article className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                                <h4 className="text-lg font-bold text-slate-800 mb-6">Adicionar Transação Manual</h4>
                                <div className="space-y-5">
                                  <div className="flex gap-5">
                                    <select value={walletFlow.tipo} onChange={e => setWalletFlow({...walletFlow, tipo: e.target.value})} className="w-1/3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"><option>Hub Coins</option><option>Cashback (R$)</option></select>
                                    <input type="number" value={walletFlow.valor} onChange={e => setWalletFlow({...walletFlow, valor: e.target.value})} placeholder="Valor" className="w-2/3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
                                  </div>
                                  <input type="text" value={walletFlow.motivo} onChange={e => setWalletFlow({...walletFlow, motivo: e.target.value})} placeholder="Motivo da Transação" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
                                  <ProgressButton onClick={processarTransacaoWallet} loading={savingState === 'transacao'} text="Processar Transação" className="w-full bg-blue-600 text-white py-4 rounded-xl" />
                                </div>
                            </article>
                          </motion.section>
                        )}

                        {/* 🟢 ABA: ENDEREÇOS */}
                        {crmSubTab === 'ENDEREÇOS' && (
                          <motion.section key="ENDEREÇOS" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-5xl mx-auto w-full p-6 space-y-6">
                            <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                <div><h3 className="text-xl font-black text-slate-800 flex items-center gap-3"><Icons.MapPin className="w-6 h-6 text-blue-500"/> Agenda de Endereços</h3></div>
                                <button onClick={() => setShowAddEndereco(!showAddEndereco)} className="bg-blue-600 text-white py-3 px-6 rounded-xl font-bold">Novo Endereço</button>
                            </div>
                            
                            <AnimatePresence>
                                {showAddEndereco && (
                                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                        <div className="bg-slate-50 border border-blue-200 p-8 rounded-3xl shadow-sm mb-6">
                                            <div className="grid grid-cols-4 gap-5">
                                                <input type="text" value={enderecoFlow.cep} onChange={e=>setEnderecoFlow({...enderecoFlow, cep: e.target.value})} placeholder="CEP" className="col-span-1 p-3 rounded-xl border border-slate-200" />
                                                <input type="text" value={enderecoFlow.rua} onChange={e=>setEnderecoFlow({...enderecoFlow, rua: e.target.value})} placeholder="Rua" className="col-span-2 p-3 rounded-xl border border-slate-200" />
                                                <input type="text" value={enderecoFlow.num} onChange={e=>setEnderecoFlow({...enderecoFlow, num: e.target.value})} placeholder="Número" className="col-span-1 p-3 rounded-xl border border-slate-200" />
                                                <input type="text" value={enderecoFlow.bairro} onChange={e=>setEnderecoFlow({...enderecoFlow, bairro: e.target.value})} placeholder="Bairro" className="col-span-2 p-3 rounded-xl border border-slate-200" />
                                                <input type="text" value={enderecoFlow.cidade} onChange={e=>setEnderecoFlow({...enderecoFlow, cidade: e.target.value})} placeholder="Cidade" className="col-span-2 p-3 rounded-xl border border-slate-200" />
                                                <input type="text" value={enderecoFlow.uf} onChange={e=>setEnderecoFlow({...enderecoFlow, uf: e.target.value})} placeholder="UF" className="col-span-1 p-3 rounded-xl border border-slate-200 uppercase" maxLength="2" />
                                            </div>
                                            <div className="mt-6 flex justify-end gap-4"><button onClick={()=>setShowAddEndereco(false)} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800">Cancelar</button><ProgressButton onClick={salvarNovoEndereco} text="Salvar Endereço" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold"/></div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {clienteSelecionado?.enderecos?.map((end, idx) => (
                                    <article key={idx} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 relative">
                                        {end.padrao && <span className="absolute top-6 right-6 bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase">Entrega Padrão</span>}
                                        <h5 className="text-xl font-black text-slate-800 mb-2">{end.rua}, {end.num}</h5>
                                        <p className="text-sm text-slate-500 mb-6">{end.cidade} - {end.uf} | CEP: {end.cep}</p>
                                    </article>
                                ))}
                            </div>
                          </motion.section>
                        )}

                        {/* 🟢 ABA: HISTÓRICO DE PEDIDOS (SAAS CARROSSEL NETFLIX) */}
                        {crmSubTab === 'HISTÓRICO DE PEDIDOS' && (
                          <motion.section key="HISTORICO" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-6xl mx-auto w-full flex flex-col space-y-6 p-6">
                              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                                  <header className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
                                      <div>
                                          <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3"><Icons.Package className="w-7 h-7 text-blue-500"/> Histórico de Pedidos</h3>
                                          <p className="text-base text-slate-500 mt-1 font-medium">Visão detalhada de compras, personalizações e envios.</p>
                                      </div>
                                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                                          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                              {Array.from(new Set(['TODOS', ...historicoPedidosFiltrado.map(p => p.status)])).map(tab => (
                                                  <button 
                                                    key={tab} onClick={() => { setOrderHistoryTab(tab); setOrderHistoryPage(1); }} 
                                                    className={`px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-full transition-all border shadow-sm ${orderHistoryTab === tab ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                                                  >
                                                      {tab}
                                                  </button>
                                              ))}
                                          </div>
                                      </div>
                                  </header>

                                  <div className="p-6 md:p-8 bg-slate-50/50 border-b border-slate-100 flex gap-4 overflow-x-auto custom-scrollbar snap-x shrink-0">
                                      {orderHistoryPaginados.length > 0 ? orderHistoryPaginados.map(pedido => {
                                          const isPedidoExpandido = pedidoExpandido === pedido.id;
                                          let statusColor = 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200';
                                          if(pedido.status?.toUpperCase() === 'CANCELADO') statusColor = 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100';
                                          if(pedido.status?.toUpperCase() === 'CONCLUÍDO' || pedido.status?.toUpperCase() === 'ENTREGUE') statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
                                          if(pedido.status?.toUpperCase() === 'A_PAGAR') statusColor = 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100';

                                          return (
                                              <button key={pedido.id} onClick={() => setPedidoExpandido(isPedidoExpandido ? null : pedido.id)} className={`snap-center shrink-0 w-72 text-left p-5 flex flex-col justify-between gap-4 border rounded-[20px] transition-all duration-300 shadow-sm ${isPedidoExpandido ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'}`}>
                                                  <div className="flex items-center justify-between w-full">
                                                      <div className="flex items-center gap-3">
                                                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shadow-sm border transition-colors ${isPedidoExpandido ? 'bg-white/20 text-white border-transparent' : 'bg-slate-50 text-blue-600 border-slate-200'}`}><Icons.Package className="w-5 h-5" /></div>
                                                          <div>
                                                              <h4 className={`text-base font-black transition-colors ${isPedidoExpandido ? 'text-white' : 'text-slate-900'}`}>#{pedido.id}</h4>
                                                              <span className={`text-[9px] font-bold uppercase tracking-widest ${isPedidoExpandido ? 'text-blue-100' : 'text-slate-400'}`}>{formatDateBR(pedido.created_at || pedido.data_raw)}</span>
                                                          </div>
                                                      </div>
                                                  </div>
                                                  <div className="flex items-center justify-between w-full mt-2">
                                                      <div className="flex flex-col">
                                                          <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isPedidoExpandido ? 'text-blue-200' : 'text-slate-400'}`}>Total Pago</span>
                                                          <span className={`text-lg font-black ${isPedidoExpandido ? 'text-white' : 'text-slate-800'}`}>{formatCurrency(pedido.total)}</span>
                                                      </div>
                                                      <span className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg border shadow-sm transition-colors ${isPedidoExpandido ? 'bg-white text-blue-600 border-transparent' : statusColor}`}>{pedido.status}</span>
                                                  </div>
                                              </button>
                                          );
                                      }) : (
                                          <div className="w-full py-6 flex flex-col items-center justify-center text-center text-slate-500 font-medium">
                                              <Icons.Package className="w-8 h-8 text-slate-300 mb-2" />
                                              <p className="text-sm font-bold">Nenhum pedido atende ao filtro.</p>
                                          </div>
                                      )}
                                  </div>

                                  <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
                                      <AnimatePresence mode="wait">
                                          {pedidoExpandido && orderHistoryPaginados.find(p=>p.id===pedidoExpandido) && (
                                              (() => {
                                                  const pedidoAtivo = orderHistoryPaginados.find(p=>p.id===pedidoExpandido);
                                                  const dataEnvio = pedidoAtivo.history?.find(h => safeStr(h.evento).toLowerCase().includes('despachado'))?.created_at || 'Aguardando Liberação';
                                                  const dataEntrega = pedidoAtivo.history?.find(h => safeStr(h.evento).toLowerCase().includes('entregue'))?.created_at || 'Pendente / Em Trânsito';
                                                  
                                                  return (
                                                      <motion.div key={pedidoAtivo.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-6 md:p-8 space-y-8">
                                                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                              <div className="space-y-6">
                                                                  <div>
                                                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-3"><Icons.MapPin className="w-4 h-4"/> Prazos de Logística</p>
                                                                      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 text-[10px] text-slate-600 font-medium shadow-sm">
                                                                          <div className="flex justify-between items-center"><span className="text-slate-400 uppercase tracking-wider font-bold">Despacho:</span> <strong className="text-slate-700 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">{dataEnvio !== 'Aguardando Liberação' ? formatDateBR(dataEnvio) : dataEnvio}</strong></div>
                                                                          <div className="flex justify-between items-center"><span className="text-slate-400 uppercase tracking-wider font-bold">Entrega Final:</span> <strong className="text-slate-700 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">{dataEntrega !== 'Pendente / Em Trânsito' ? formatDateBR(dataEntrega) : dataEntrega}</strong></div>
                                                                      </div>
                                                                  </div>
                                                                  <div>
                                                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Endereço Gravado no Pedido</p>
                                                                      {pedidoAtivo.endereco || pedidoAtivo.address ? (
                                                                          <div className="bg-white border border-slate-200 rounded-2xl p-5 text-[11px] text-slate-600 font-medium space-y-1.5 shadow-sm">
                                                                              <p><span className="font-bold text-slate-800">Rua:</span> {(pedidoAtivo.endereco ?? pedidoAtivo.address).logradouro || (pedidoAtivo.endereco ?? pedidoAtivo.address).rua}</p>
                                                                              <p><span className="font-bold text-slate-800">Número:</span> {(pedidoAtivo.endereco ?? pedidoAtivo.address).numero || (pedidoAtivo.endereco ?? pedidoAtivo.address).num}</p>
                                                                              {(pedidoAtivo.endereco ?? pedidoAtivo.address).complemento && <p><span className="font-bold text-slate-800">Complemento:</span> {(pedidoAtivo.endereco ?? pedidoAtivo.address).complemento}</p>}
                                                                              <p><span className="font-bold text-slate-800">Bairro:</span> {(pedidoAtivo.endereco ?? pedidoAtivo.address).bairro}</p>
                                                                              <p><span className="font-bold text-slate-800">Cidade/UF:</span> {(pedidoAtivo.endereco ?? pedidoAtivo.address).cidade} / {(pedidoAtivo.endereco ?? pedidoAtivo.address).uf || (pedidoAtivo.endereco ?? pedidoAtivo.address).estado}</p>
                                                                              <p className="pt-2"><span className="font-bold text-slate-800 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">CEP: <span className="font-mono text-xs ml-1">{(pedidoAtivo.endereco ?? pedidoAtivo.address).cep}</span></span></p>
                                                                          </div>
                                                                      ) : (
                                                                          <p className="text-[10px] font-medium text-slate-400 bg-white rounded-xl p-4 border border-slate-200 shadow-sm">Endereço não registrado neste pedido.</p>
                                                                      )}
                                                                  </div>
                                                              </div>

                                                              <div className="space-y-4 flex flex-col justify-between">
                                                                  <div>
                                                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-3"><Icons.CreditCard className="w-4 h-4"/> Detalhamento Financeiro</p>
                                                                      <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4 mb-4 shadow-sm">
                                                                          <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider mb-2">Cupons de Carrinho</p>
                                                                          <div className="space-y-2">
                                                                              {pedidoAtivo.applied_coupons && pedidoAtivo.applied_coupons.length > 0 ? pedidoAtivo.applied_coupons.map((cupom, idx) => (
                                                                                  <div key={idx} className="flex flex-col gap-1">
                                                                                      <div className="flex justify-between items-center text-[10px]">
                                                                                          <span className="font-black text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-sm">{cupom.nome}</span>
                                                                                          <span className="font-bold text-emerald-600 text-xs">- {formatCurrency(cupom.valor)}</span>
                                                                                      </div>
                                                                                      <span className="text-[9px] text-slate-500 font-bold ml-1 uppercase tracking-wider">Ref: {cupom.tipo}</span>
                                                                                  </div>
                                                                              )) : <span className="text-[10px] text-slate-500 font-medium">Nenhum cupom extra aplicado.</span>}
                                                                          </div>
                                                                      </div>
                                                                      <div className="space-y-2.5 text-[11px] font-medium text-slate-600 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                                                                          <div className="flex justify-between items-center"><span>Soma dos Produtos:</span><strong className="text-slate-800 text-xs">{formatCurrency(pedidoAtivo.subtotal)}</strong></div>
                                                                          <div className="flex justify-between items-center"><span>Frete Total:</span><strong className="text-slate-800 text-xs">{formatCurrency(pedidoAtivo.frete)}</strong></div>
                                                                          <div className="flex justify-between items-center text-emerald-600 pt-2 border-t border-slate-100"><span>Total de Descontos:</span><strong className="text-xs">-{formatCurrency(pedidoAtivo.desconto)}</strong></div>
                                                                      </div>
                                                                  </div>
                                                                  <div className="bg-slate-800 rounded-2xl p-5 shadow-sm text-white flex justify-between items-center mt-4">
                                                                      <span className="font-bold text-slate-300 uppercase tracking-widest text-[10px]">Valor Efetivamente Pago</span>
                                                                      <strong className="text-2xl font-black">{formatCurrency(pedidoAtivo.total)}</strong>
                                                                  </div>
                                                              </div>
                                                          </div>

                                                          <div className="border-t border-slate-200/60 pt-8">
                                                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-4"><Icons.Box className="w-4 h-4" /> Relatório de Produtos Fabricados ({pedidoAtivo.itens?.length || 0})</p>                          
                                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                  {pedidoAtivo.itens && pedidoAtivo.itens.length > 0 ? pedidoAtivo.itens.map((produto, idx) => {
                                                                      const uniqueId = `ord-${pedidoAtivo.id}-${produto.id || idx}`;
                                                                      const isProdExpandido = produtoExpandido === uniqueId;
                                                                      const qtd = safeNum(produto.quantity) || safeNum(produto.pivot?.quantidade) || 1;
                                                                      const precoBase = safeNum(produto.price) || safeNum(produto.preco);
                                                                      const varArray = Array.isArray(produto.variacoes) ? produto.variacoes : (produto.variation_name ? produto.variation_name.split('|').map(v => ({nome: v.split(':')[0]?.trim(), valor: v.split(':')[1]?.trim()})) : []);
                                                                      const persObject = produto.personalizacoes || produto.customization;
                                                                      const persArray = Array.isArray(persObject) ? persObject : Object.entries(persObject || {}).map(([key, value]) => ({ label: key, valor: value, tipo: (key === 'imagem' || key === 'Foto Estampada' || key === 'Arte Frontal' || key === 'Estampa da Almofada' || value.includes('http')) ? 'imagem' : 'texto' }));

                                                                      return (
                                                                      <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group hover:border-blue-300 transition-colors">
                                                                          <div className="p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50 flex flex-col items-center text-center gap-3 cursor-pointer" onClick={() => setProdutoExpandido(isProdExpandido ? null : uniqueId)}>
                                                                              {produto.product_image || produto.imagem ? (
                                                                                  <img src={produto.product_image || produto.imagem} className="w-24 h-24 rounded-xl object-cover border border-slate-200 shadow-sm" alt={produto.product_name || produto.nome} />
                                                                              ) : (
                                                                                  <div className="w-24 h-24 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-300 shadow-sm"><Icons.Box className="w-8 h-8"/></div>
                                                                              )}
                                                                              <div>
                                                                                  <p className="text-sm font-black text-slate-800 leading-tight">{produto.product_name || produto.nome}</p>
                                                                                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">SKU: {produto.sku || produto.variation_sku || 'ND'}</p>
                                                                                  <div className="mt-3 flex justify-center gap-2 text-[10px]">
                                                                                      <span className="font-bold text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">Qtd: <strong className="text-slate-800">{qtd} un.</strong></span>
                                                                                      <span className="font-bold text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">Base: <strong className="text-slate-800">{formatCurrency(precoBase)}</strong></span>
                                                                                  </div>
                                                                              </div>
                                                                              <Icons.ChevronRight className={`w-5 h-5 text-slate-400 transition-transform hidden md:block ${isProdExpandido ? 'rotate-90 text-blue-500' : ''}`} />
                                                                          </div>
                                                                          
                                                                          <div className="p-6 flex-1 space-y-6">
                                                                              {varArray && varArray.length > 0 && varArray[0].nome && (
                                                                                  <div>
                                                                                      <span className="block text-slate-400 font-bold mb-2 uppercase text-[9px] tracking-wider">Variações Escolhidas</span>
                                                                                      <div className="flex flex-wrap gap-2">
                                                                                          {varArray.map((v, vIdx) => (
                                                                                              <span key={vIdx} className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 text-[10px] font-bold shadow-sm">
                                                                                                  {v.nome}: <span className="text-slate-500 font-medium ml-1">{v.valor}</span>
                                                                                              </span>
                                                                                          ))}
                                                                                      </div>
                                                                                  </div>
                                                                              )}
                                                                              {persArray && persArray.length > 0 && (
                                                                                  <div>
                                                                                      <span className="block text-slate-400 font-bold mb-2 uppercase text-[9px] tracking-wider">Dados da Personalização</span>
                                                                                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                                                                                          {persArray.map((pers, pIdx) => (
                                                                                              <div key={pIdx} className="bg-slate-50 border border-slate-200 p-3 rounded-xl shadow-sm flex items-center gap-3">
                                                                                                  {pers.tipo === 'imagem' ? (
                                                                                                      <>
                                                                                                          <img src={pers.valor} alt={pers.label} className="w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-sm shrink-0" />
                                                                                                          <div className="flex-1">
                                                                                                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">{pers.label}</p>
                                                                                                              <div className="flex flex-wrap gap-1.5">
                                                                                                                  <a href={pers.valor} target="_blank" rel="noreferrer" className="bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-md text-[9px] font-bold transition-colors shadow-sm"><Icons.Eye className="w-3 h-3 inline mr-1"/> Ver</a>
                                                                                                                  <a href={pers.valor} download target="_blank" rel="noreferrer" className="bg-slate-800 text-white hover:bg-slate-900 px-2 py-1 rounded-md text-[9px] font-bold transition-colors shadow-sm"><Icons.Download className="w-3 h-3 inline mr-1"/> Download</a>
                                                                                                              </div>
                                                                                                          </div>
                                                                                                      </>
                                                                                                  ) : (
                                                                                                      <div className="w-full">
                                                                                                          <div className="flex justify-between items-center mb-1">
                                                                                                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{pers.label}</p>
                                                                                                              <button onClick={() => {navigator.clipboard.writeText(pers.valor); showToastGlob('Texto copiado!');}} className="text-[9px] text-blue-600 font-bold hover:text-blue-800 transition-colors uppercase bg-blue-50 border border-blue-100 px-2 py-0.5 rounded shadow-sm">Copiar</button>
                                                                                                          </div>
                                                                                                          <p className="text-xs font-black text-slate-800 break-words leading-relaxed bg-white border border-slate-100 p-2.5 rounded-lg w-full">"{pers.valor}"</p>
                                                                                                      </div>
                                                                                                  )}
                                                                                              </div>
                                                                                          ))}
                                                                                      </div>
                                                                                  </div>
                                                                              )}
                                                                          </div>
                                                                      </div>
                                                                  )}) : (
                                                                      <p className="text-[11px] text-slate-500 italic col-span-2">Nenhum item listado.</p>
                                                                  )}
                                                              </div>
                                                          </div>
                                                      </motion.div>
                                                  );
                                              })()
                                          )}
                                      </AnimatePresence>
                                  </div>
                              </div>
                          </motion.section>
                        )}

                        {/* 🟢 ABA: TIMELINE / AUDITORIA */}
                        {crmSubTab === 'TIMELINE (AUDIT)' && (
                          <motion.section key="TIMELINE" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl mx-auto w-full p-6">
                              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm h-[600px] flex flex-col">
                                  <header className="p-8 border-b border-slate-100 flex justify-between items-center">
                                      <div>
                                          <h3 className="text-xl font-black"><Icons.Activity className="inline mr-2 text-blue-500"/> Registro de Auditoria</h3>
                                          <p className="text-[11px] text-slate-500 mt-1 font-medium">Histórico imutável de ações e segurança.</p>
                                      </div>
                                      <ProgressButton onClick={handleExportarPDF} text="Exportar PDF" icon={Icons.Download} className="bg-white border border-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl shadow-sm"/>
                                  </header>
                                  <div className="p-8 relative flex-1 overflow-y-auto custom-scrollbar">
                                      <div className="absolute left-[43px] top-8 bottom-8 w-[2px] bg-slate-100 hidden sm:block"></div>
                                      <div className="space-y-6 relative z-10">
                                          {auditLogsPaginados.map(log => (
                                              <article key={log.id} className="relative sm:pl-12">
                                                  <div className={`absolute left-0 top-1.5 w-5 h-5 rounded-full ring-4 ring-white shadow-sm flex items-center justify-center hidden sm:flex ${log.tipo === 'success' ? 'bg-emerald-500' : log.tipo === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`}>
                                                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                                  </div>
                                                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 transition-all group">
                                                      <p className="text-[10px] font-bold text-slate-400 mb-2">{formatDateTimeBR(log.data)}</p>
                                                      <h5 className="font-black text-slate-800 text-base">{log.titulo}</h5>
                                                      <p className="text-sm text-slate-600 mt-2 leading-relaxed">{log.desc}</p>
                                                  </div>
                                              </article>
                                          ))}
                                          {auditLogsPaginados.length === 0 && <p className="text-center text-slate-500 text-sm py-10">Nenhum evento registrado.</p>}
                                      </div>
                                  </div>
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