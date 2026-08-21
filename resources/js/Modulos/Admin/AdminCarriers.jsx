// ============================================================================
// FICHEIRO: resources/js/Modulos/Admin/AdminCarriers.jsx
// ARQUITETURA: SaaS Premium In-Screen Forms | Token Sync | Netflix Cards
// ============================================================================

import React, { useState, useEffect, Component } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient, QueryClientProvider, QueryClient } from '@tanstack/react-query';
import api from '../../api';

// =========================================================
// CONFIGURAÇÃO REACT QUERY & ERROR BOUNDARY
// =========================================================
const queryClient = new QueryClient({
    defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 1000 * 60 * 5 } },
});

class ErrorBoundary extends Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null, errorInfo: null }; }
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(error, errorInfo) { this.setState({ error, errorInfo }); console.error("Erro:", error); }
    render() {
        if (this.state.hasError) return (
            <div className="p-8 m-8 bg-rose-50 border border-rose-200 rounded-[24px] shadow-sm"><h2 className="text-xl font-black text-rose-600 mb-4">Erro de Renderização</h2><p className="text-sm">{String(this.state.error)}</p></div>
        );
        return this.props.children;
    }
}

// =========================================================
// ÍCONES BLINDADOS
// =========================================================
const Icons = {
    Truck: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
    Plus: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
    Edit: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    Trash: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    ArrowLeft: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
    Upload: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>,
    Spinner: ({className="w-5 h-5"}) => <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>,
    Refresh: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    MapPin: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Lock: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    CheckCircle: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    PowerOff: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 11-12.728 0M12 3v9" /></svg>,
    Key: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
};

// =========================================================
// COMPONENTES AUXILIARES DE ANIMAÇÃO
// =========================================================
const CarriersSkeleton = () => (
    <div className="animate-pulse space-y-6 w-full">
        <div className="h-14 bg-slate-200 rounded-xl w-full max-w-md"></div>
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-6 space-y-4">
            {[1,2,3].map(i => (
                <div key={i} className="h-20 bg-slate-50 rounded-xl border border-slate-100 flex items-center px-6 gap-6">
                    <div className="h-12 w-12 bg-slate-200 rounded-xl"></div>
                    <div className="h-4 w-1/3 bg-slate-200 rounded"></div>
                    <div className="h-8 w-24 bg-slate-200 rounded-lg ml-auto"></div>
                </div>
            ))}
        </div>
    </div>
);

const screenTransition = {
    initial: { opacity: 0, x: 20, scale: 0.98 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -20, scale: 0.98 },
    transition: { type: "spring", stiffness: 300, damping: 25 }
};

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================
const AdminCarriersContent = () => {
    const queryClientLocal = useQueryClient();
    
    // VIEWS: 'LIST' | 'FORM_MANUAL'
    const [currentView, setCurrentView] = useState('LIST');
    const [activeTab, setActiveTab] = useState('MANUAIS'); // MANUAIS ou MELHOR_ENVIO
    const [isManualRefresh, setIsManualRefresh] = useState(false);

    // Overlay de Sucesso 2.5s
    const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

    // Estado do Formulário da Transportadora Manual
    const defaultCarrier = { id: null, nome: '', tempo_entrega: '', status: 'ATIVA', imagemUrl: null, file: null, cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', referencia: '' };
    const [carrierForm, setCarrierForm] = useState(defaultCarrier);
    const [isFetchingCep, setIsFetchingCep] = useState(false);

    // Dicionário Visual Master do Melhor Envio (Logos e Cores Estilo Netflix)
    const dicMelhorEnvio = [
        { id: '1', key: 'Correios PAC', logo: 'https://logospng.org/download/correios/logo-correios-2048.png', color: 'from-yellow-400 to-yellow-500' },
        { id: '2', key: 'Correios SEDEX', logo: 'https://logospng.org/download/correios/logo-correios-2048.png', color: 'from-blue-500 to-blue-600' },
        { id: '3', key: 'Jadlog', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Jadlog_logo.png', color: 'from-red-600 to-red-700' },
        { id: '4', key: 'Loggi', logo: 'https://logospng.org/download/loggi/logo-loggi-2048.png', color: 'from-sky-400 to-sky-500' },
        { id: '5', key: 'Azul Cargo', logo: 'https://www.azulcargoexpress.com.br/images/logo.png', color: 'from-indigo-600 to-indigo-800' },
        { id: '6', key: 'LATAM Cargo', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/05/LATAM_Cargo_logo.svg', color: 'from-red-700 to-red-900' }
    ];

    // Estado do Melhor Envio
    const [meTokenInput, setMeTokenInput] = useState('');
    const [meCarriersAtivas, setMeCarriersAtivas] = useState([]);
    const [isAuthenticatedME, setIsAuthenticatedME] = useState(false);
    const [isAuthenticatingME, setIsAuthenticatingME] = useState(false);

    // 🟢 FETCH TRANSPORTADORAS MANUAIS (Polling 15s)
    const { data: fetchResult, isLoading, refetch } = useQuery({
        queryKey: ['adminCarriers'],
        queryFn: async () => { const res = await api.get('/admin/carriers'); return res.data; },
        refetchInterval: 15000,
    });
    const transportadoras = fetchResult?.data || [];

    // 🟢 FETCH CONFIGURAÇÕES DO MELHOR ENVIO
    const { data: meResult, refetch: refetchME } = useQuery({
        queryKey: ['melhorEnvioSettings'],
        queryFn: async () => { const res = await api.get('/admin/melhorenvio/settings'); return res.data; }
    });

    useEffect(() => {
        if (meResult?.data) {
            // Mescla as configurações do banco com o nosso Dicionário Visual Master
            const carriersAtivasBanco = meResult.data.carriers_ativas || [];
            const mergedCarriers = dicMelhorEnvio.map(masterItem => {
                const found = carriersAtivasBanco.find(c => c.id === masterItem.id || c.nome === masterItem.key);
                return { id: masterItem.id, nome: masterItem.key, ativo: found ? found.ativo : false, logo: masterItem.logo, color: masterItem.color };
            });

            setMeCarriersAtivas(mergedCarriers);
            setIsAuthenticatedME(meResult.data.is_authenticated);
            setMeTokenInput(''); // Limpa o input se já estiver autenticado
        } else {
            setMeCarriersAtivas(dicMelhorEnvio.map(m => ({ id: m.id, nome: m.key, ativo: false, logo: m.logo, color: m.color })));
        }
    }, [meResult]);

    const handleRefresh = async () => {
        setIsManualRefresh(true);
        if (activeTab === 'MANUAIS') await refetch();
        if (activeTab === 'MELHOR_ENVIO') await refetchME();
        setTimeout(() => setIsManualRefresh(false), 800);
    };

    // 🟢 MUTAÇÕES MANUAIS
    const mutacaoSalvar = useMutation({
        mutationFn: async (formData) => await api.post('/admin/carriers', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
        onSuccess: () => {
            queryClientLocal.invalidateQueries({ queryKey: ['adminCarriers'] });
            setCurrentView('LIST');
        }
    });

    const mutacaoDeletar = useMutation({
        mutationFn: async (id) => await api.delete(`/admin/carriers/${id}`),
        onSuccess: () => queryClientLocal.invalidateQueries({ queryKey: ['adminCarriers'] })
    });

    // 🟢 MUTAÇÕES MELHOR ENVIO
    const mutacaoVerifyToken = useMutation({
        mutationFn: async (token) => await api.post('/admin/melhorenvio/verify-token', { access_token: token }),
        onSuccess: () => {
            // Exibe o Overlay FullScreen animado de Sucesso por 2.5s
            setShowSuccessOverlay(true);
            setTimeout(() => {
                setShowSuccessOverlay(false);
                queryClientLocal.invalidateQueries({ queryKey: ['melhorEnvioSettings'] });
                setIsAuthenticatedME(true);
            }, 2500);
        },
        onError: (err) => {
            alert(err.response?.data?.message || "Token inválido.");
            setIsAuthenticatingME(false);
        }
    });

    const mutacaoSaveCarriersME = useMutation({
        mutationFn: async (carriers) => await api.post('/admin/melhorenvio/carriers', { carriers_ativas: carriers }),
        onSuccess: () => { queryClientLocal.invalidateQueries({ queryKey: ['melhorEnvioSettings'] }); }
    });

    const mutacaoDesconectarME = useMutation({
        mutationFn: async () => await api.post('/admin/melhorenvio/disconnect'),
        onSuccess: () => { 
            queryClientLocal.invalidateQueries({ queryKey: ['melhorEnvioSettings'] }); 
            setIsAuthenticatedME(false);
            setMeTokenInput('');
        }
    });

    // 🟢 HANDLERS DE TELA
    const abrirNovo = () => { setCarrierForm(defaultCarrier); setCurrentView('FORM_MANUAL'); };
    const abrirEdicao = (c) => { 
        setCarrierForm({ id: c.id, nome: c.nome, tempo_entrega: c.tempo_entrega, status: c.status, imagemUrl: c.imagem, file: null, cep: c.cep||'', rua: c.rua||'', numero: c.numero||'', complemento: c.complemento||'', bairro: c.bairro||'', cidade: c.cidade||'', uf: c.uf||'', referencia: c.referencia||'' }); 
        setCurrentView('FORM_MANUAL'); 
    };

    const salvarManual = () => {
        if (!carrierForm.nome || !carrierForm.tempo_entrega) return alert("Preencha o Nome e o Prazo de Entrega.");
        const formData = new FormData();
        Object.keys(carrierForm).forEach(key => {
            if (key !== 'file' && key !== 'imagemUrl' && carrierForm[key] !== null) {
                formData.append(key, carrierForm[key]);
            }
        });
        if (carrierForm.file) formData.append('arquivo', carrierForm.file);
        mutacaoSalvar.mutate(formData);
    };

    const handleSincronizarME = () => {
        if (!meTokenInput) return alert("Cole o seu Personal Access Token gerado no Melhor Envio.");
        setIsAuthenticatingME(true);
        mutacaoVerifyToken.mutate(meTokenInput);
    };

    const handleDesconectarME = () => {
        if (window.confirm("Deseja realmente desconectar sua conta do Melhor Envio? As cotações automáticas pararão de funcionar imediatamente.")) {
            mutacaoDesconectarME.mutate();
        }
    };

    const toggleMeCarrier = (id) => {
        const novosCarriers = meCarriersAtivas.map(c => c.id === id ? { ...c, ativo: !c.ativo } : c);
        setMeCarriersAtivas(novosCarriers);
        mutacaoSaveCarriersME.mutate(novosCarriers); // Salva silenciosamente em background
    };

    const handleCepChange = async (e) => {
        const novoCep = e.target.value.replace(/\D/g, '');
        setCarrierForm(prev => ({ ...prev, cep: novoCep }));
        if (novoCep.length === 8) {
            setIsFetchingCep(true);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${novoCep}/json/`);
                const data = await response.json();
                if (!data.erro) { setCarrierForm(prev => ({ ...prev, rua: data.logradouro, bairro: data.bairro, cidade: data.localidade, uf: data.uf })); } 
            } catch (error) { console.error("Erro CEP", error); } 
            finally { setIsFetchingCep(false); }
        }
    };

    // ============================================================================
    // RENDER: OVERLAY DE SUCESSO (2.5 Segundos)
    // ============================================================================
    const renderSuccessOverlay = () => (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
            <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-[32px] p-10 max-w-md w-full text-center shadow-2xl flex flex-col items-center relative overflow-hidden"
            >
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                    <Icons.CheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">Conectado com Sucesso!</h2>
                <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
                    A sua loja virtual já está sincronizada e autorizada a realizar cotações e gerar etiquetas de forma automatizada.
                </p>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 2.2, ease: "linear" }} className="h-full bg-emerald-500" />
                </div>
            </motion.div>
        </motion.div>
    );

    // ============================================================================
    // RENDER: LISTA E ABAS
    // ============================================================================
    const renderListaTabs = () => (
        <motion.div key="LIST" {...screenTransition} className="w-full">
            
            {/* Abas e Filtros */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner w-full sm:w-auto border border-slate-200/60">
                    <button onClick={() => setActiveTab('MANUAIS')} className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-black tracking-wide transition-all ${activeTab === 'MANUAIS' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                        Parceiros Manuais
                    </button>
                    <button onClick={() => setActiveTab('MELHOR_ENVIO')} className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-black tracking-wide transition-all flex items-center justify-center gap-2 ${activeTab === 'MELHOR_ENVIO' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-500 hover:text-blue-600'}`}>
                        <Icons.Truck className="w-5 h-5" /> Melhor Envio
                    </button>
                </div>
                
                {activeTab === 'MANUAIS' && (
                    <button onClick={abrirNovo} className="bg-slate-900 hover:bg-black text-white font-bold py-3.5 px-6 rounded-xl flex items-center gap-2 shadow-sm transition-colors w-full sm:w-auto justify-center">
                        <Icons.Plus /> Nova Transportadora
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {/* ========================================================= */}
                {/* ABA: PARCEIROS MANUAIS */}
                {/* ========================================================= */}
                {activeTab === 'MANUAIS' && (
                    <motion.div key="TAB_MANUAIS" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-hidden">
                        <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-xl font-black text-slate-800">Cotação Própria</h2>
                            <p className="text-sm font-medium text-slate-500 mt-1">Configure tabelas de prazo e frete para motoboys ou transportadoras avulsas.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-white border-b border-slate-200 text-[10px] text-slate-500 uppercase tracking-widest font-black">
                                        <th className="p-5 pl-8">Logo & Detalhes</th>
                                        <th className="p-5 text-center">Tempo Médio</th>
                                        <th className="p-5 text-center">Status</th>
                                        <th className="p-5 pr-8 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {isLoading ? (
                                        <tr><td colSpan="4" className="p-16"><CarriersSkeleton /></td></tr>
                                    ) : transportadoras.length === 0 ? (
                                        <tr><td colSpan="4" className="p-16 text-center text-slate-400 font-bold uppercase tracking-wider">Nenhuma transportadora manual cadastrada.</td></tr>
                                    ) : transportadoras.map(t => (
                                        <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="p-5 pl-8 flex items-center gap-4">
                                                <div className="w-14 h-14 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-2 shadow-sm shrink-0">
                                                    {t.imagem ? <img src={t.imagem} className="w-full h-full object-contain mix-blend-multiply" alt=""/> : <Icons.Truck className="w-6 h-6 text-slate-300"/>}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-black text-slate-800 text-sm truncate">{t.nome}</span>
                                                    {t.cidade && <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-0.5 truncate"><Icons.MapPin className="w-3 h-3"/> {t.cidade} - {t.uf}</span>}
                                                </div>
                                            </td>
                                            <td className="p-5 text-center font-bold text-slate-600">{t.tempo_entrega}</td>
                                            <td className="p-5 text-center">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${t.status === 'ATIVA' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                            <td className="p-5 pr-8 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => abrirEdicao(t)} className="w-10 h-10 flex items-center justify-center bg-sky-50 text-sky-600 rounded-xl hover:bg-sky-100 transition-colors border border-sky-100 shadow-sm" title="Editar"><Icons.Edit /></button>
                                                    <button onClick={() => window.confirm('Deseja excluir?') && mutacaoDeletar.mutate(t.id)} className="w-10 h-10 flex items-center justify-center bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-colors border border-rose-100 shadow-sm" title="Excluir"><Icons.Trash /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* ========================================================= */}
                {/* ABA: MELHOR ENVIO (Token Único & Netflix Cards) */}
                {/* ========================================================= */}
                {activeTab === 'MELHOR_ENVIO' && (
                    <motion.div key="TAB_MELHOR_ENVIO" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        
                        {/* Se NÃO estiver autenticado */}
                        {!isAuthenticatedME ? (
                            <div className="bg-slate-900 rounded-[32px] p-8 sm:p-10 shadow-xl text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-96 h-96 bg-blue-500 opacity-20 blur-[100px] rounded-full pointer-events-none"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-3"><Icons.Lock className="w-8 h-8 text-blue-400"/> Integração Melhor Envio</h2>
                                    </div>
                                    <p className="text-sm text-slate-300 mb-8 max-w-3xl leading-relaxed">
                                        Gere o seu <strong>Token de Acesso Pessoal (Bearer Token)</strong> no painel de controle do Melhor Envio e cole-o abaixo. Esta integração elimina redirecionamentos complexos e estabelece uma comunicação robusta e permanente em 1 clique.
                                    </p>
                                    
                                    <div className="mb-8">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 flex items-center gap-2"><Icons.Key className="w-4 h-4"/> Personal Access Token</label>
                                        <input 
                                            type="text" 
                                            autoComplete="off"
                                            value={meTokenInput} 
                                            onChange={e=>setMeTokenInput(e.target.value)} 
                                            className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-5 py-4 text-sm font-mono outline-none focus:border-blue-400 focus:bg-slate-800 transition-all placeholder-slate-600 shadow-inner" 
                                            placeholder="eyJ0eXAiOiJKV1QiLCJhbGci..." 
                                        />
                                    </div>

                                    <button onClick={handleSincronizarME} disabled={isAuthenticatingME} className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-14 px-10 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 w-full md:w-auto">
                                        {isAuthenticatingME ? <><Icons.Spinner className="text-white"/> Validando Token...</> : 'Sincronizar Melhor Envio'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Painel Conectado (Netflix Cards) */
                            <div className="space-y-6">
                                
                                {/* Header Conectado */}
                                <div className="bg-white border border-slate-200 rounded-[24px] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
                                    <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
                                    <div className="relative z-10">
                                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                                            Transportadoras Parceiras
                                            <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] uppercase tracking-widest px-2.5 py-1 rounded shadow-sm flex items-center gap-1.5 ml-2">
                                                <Icons.CheckCircle className="w-3.5 h-3.5"/> Conectado e Sincronizado
                                            </span>
                                        </h2>
                                        <p className="text-sm font-medium text-slate-500 mt-1">Ative as transportadoras que deseja disponibilizar no checkout da loja.</p>
                                    </div>
                                    <button onClick={handleDesconectarME} disabled={mutacaoDesconectarME.isPending} className="relative z-10 flex items-center gap-2 bg-white hover:bg-rose-50 text-rose-500 font-bold px-6 py-3.5 rounded-xl transition-colors border border-rose-200 shadow-sm shrink-0">
                                        {mutacaoDesconectarME.isPending ? <Icons.Spinner className="w-4 h-4"/> : <Icons.PowerOff className="w-4 h-4"/>} Desconectar Conta
                                    </button>
                                </div>

                                {/* Grelha Netflix */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {meCarriersAtivas.map(c => (
                                        <div 
                                            key={c.id} 
                                            onClick={() => toggleMeCarrier(c.id)}
                                            className={`relative aspect-[16/9] rounded-[24px] overflow-hidden cursor-pointer group transition-all duration-500 border-4 shadow-sm hover:shadow-xl ${c.ativo ? 'border-blue-500' : 'border-transparent bg-white'}`}
                                        >
                                            {/* Fundo Gradiente ou Branco */}
                                            <div className={`absolute inset-0 transition-opacity duration-500 ${c.ativo ? `bg-gradient-to-br ${c.color}` : 'bg-slate-100 group-hover:bg-slate-200'}`}></div>
                                            
                                            {/* Logo Centralizada */}
                                            <div className="absolute inset-0 flex items-center justify-center p-8 z-10 mix-blend-multiply">
                                                {c.logo ? (
                                                    <img src={c.logo} alt={c.nome} className={`max-w-full max-h-full object-contain transition-all duration-500 ${c.ativo ? 'scale-110 filter brightness-0 invert opacity-90' : 'grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105'}`} />
                                                ) : (
                                                    <span className={`text-2xl font-black ${c.ativo ? 'text-white' : 'text-slate-400'}`}>{c.nome}</span>
                                                )}
                                            </div>

                                            {/* Overlay Dark Escurecendo a base para ler o texto */}
                                            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 transition-opacity duration-500 ${c.ativo ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}></div>

                                            {/* Barra Inferior com Toggle */}
                                            <div className="absolute bottom-0 left-0 right-0 p-5 z-20 flex justify-between items-end transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                                <div>
                                                    <span className={`block text-[10px] uppercase tracking-widest font-bold mb-0.5 ${c.ativo ? 'text-white/70' : 'text-slate-400'}`}>Transportadora</span>
                                                    <span className={`block text-lg font-black leading-tight ${c.ativo ? 'text-white' : 'text-slate-800'}`}>{c.nome}</span>
                                                </div>
                                                
                                                {/* Toggle Switch */}
                                                <div className={`relative w-12 h-6 rounded-full transition-colors duration-300 shadow-inner border border-transparent ${c.ativo ? 'bg-white border-white/20' : 'bg-slate-300'}`}>
                                                    <motion.div layout className={`absolute top-1 w-4 h-4 rounded-full shadow-sm ${c.ativo ? 'bg-blue-600 right-1' : 'bg-white left-1'}`} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );

    // ============================================================================
    // RENDER: FORMULÁRIO IN-SCREEN PREMIUM (MANUAL)
    // ============================================================================
    const renderFormManual = () => (
        <motion.div key="FORM" {...screenTransition} className="w-full bg-white border border-slate-200 rounded-[32px] shadow-2xl overflow-hidden flex flex-col min-h-[600px] absolute inset-x-0 top-0 z-50">
            {/* Header Form */}
            <header className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentView('LIST')} className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm">
                        <Icons.ArrowLeft />
                    </button>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-800">{carrierForm.id ? 'Editar Parceiro Logístico' : 'Novo Parceiro Logístico'}</h2>
                        <p className="text-xs font-medium text-slate-500 mt-1">Configuração de transportadora e rotas manuais.</p>
                    </div>
                </div>
            </header>

            {/* Body Form */}
            <div className="p-6 sm:p-8 flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto space-y-8 pb-10">
                    
                    {/* Bloco 1: Identificação */}
                    <div className="bg-white p-6 sm:p-8 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 opacity-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-8 flex items-center gap-2 relative z-10"><Icons.Truck className="w-5 h-5 text-blue-500"/> Identificação Principal</h3>
                        <div className="flex flex-col sm:flex-row gap-8 relative z-10">
                            <label className="w-32 h-32 bg-slate-50 border-2 border-dashed border-slate-300 rounded-[20px] flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors relative overflow-hidden group shadow-sm shrink-0">
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files[0]; if(f) setCarrierForm({...carrierForm, file: f, imagemUrl: URL.createObjectURL(f)}); }} />
                                {carrierForm.imagemUrl ? (
                                    <><img src={carrierForm.imagemUrl} className="w-full h-full object-contain p-3 mix-blend-multiply absolute inset-0" alt=""/><div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><span className="text-[10px] text-white font-bold uppercase tracking-widest">Trocar</span></div></>
                                ) : (
                                    <><Icons.Upload className="w-8 h-8 text-slate-400 mb-2"/><span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Subir Logo</span></>
                                )}
                            </label>
                            <div className="flex-1 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Nome da Transportadora *</label>
                                        <input type="text" value={carrierForm.nome} onChange={e => setCarrierForm({...carrierForm, nome: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner" placeholder="Ex: Transportes Rápidos Lda" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Prazo Médio Simulado *</label>
                                        <input type="text" value={carrierForm.tempo_entrega} onChange={e => setCarrierForm({...carrierForm, tempo_entrega: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner" placeholder="Ex: 2 a 4 dias úteis" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Status no Checkout</label>
                                    <select value={carrierForm.status} onChange={e => setCarrierForm({...carrierForm, status: e.target.value})} className="w-full sm:w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer shadow-inner">
                                        <option value="ATIVA">Transportadora Ativa (Visível)</option>
                                        <option value="INATIVA">Desativada (Oculta)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bloco 2: Endereço Sede (Auto-CEP) */}
                    <div className="bg-white p-6 sm:p-8 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 opacity-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-8 flex items-center gap-2 relative z-10"><Icons.MapPin className="w-5 h-5 text-emerald-500"/> Sede / Endereço de Coleta</h3>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 relative z-10">
                            <div className="md:col-span-2 relative">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">CEP (Automático)</label>
                                <input type="text" maxLength={8} value={carrierForm.cep} onChange={handleCepChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-mono font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner" placeholder="00000000" />
                                {isFetchingCep && <div className="absolute right-4 top-10"><Icons.Spinner className="text-emerald-500 w-5 h-5"/></div>}
                            </div>
                            <div className="md:col-span-3">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Rua / Logradouro</label>
                                <div className="flex gap-3">
                                    <input type="text" value={carrierForm.rua} onChange={e => setCarrierForm({...carrierForm, rua: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner" placeholder="Nome da Rua" />
                                    <input type="text" value={carrierForm.numero} onChange={e => setCarrierForm({...carrierForm, numero: e.target.value})} className="w-28 bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner text-center" placeholder="Nº" />
                                </div>
                            </div>
                            <div className="md:col-span-3">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Complemento</label>
                                <input type="text" value={carrierForm.complemento} onChange={e => setCarrierForm({...carrierForm, complemento: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner" placeholder="Galpão 3, Sala 2..." />
                            </div>
                            <div className="md:col-span-3">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Bairro</label>
                                <input type="text" value={carrierForm.bairro} onChange={e => setCarrierForm({...carrierForm, bairro: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner" />
                            </div>
                            <div className="md:col-span-3">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Cidade / Estado (UF)</label>
                                <div className="flex gap-3">
                                    <input type="text" value={carrierForm.cidade} onChange={e => setCarrierForm({...carrierForm, cidade: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner" placeholder="Cidade" />
                                    <input type="text" value={carrierForm.uf} maxLength={2} onChange={e => setCarrierForm({...carrierForm, uf: e.target.value.toUpperCase()})} className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner uppercase text-center" placeholder="UF" />
                                </div>
                            </div>
                            <div className="md:col-span-6">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Ponto de Referência</label>
                                <input type="text" value={carrierForm.referencia} onChange={e => setCarrierForm({...carrierForm, referencia: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner" placeholder="Próximo ao viaduto..." />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Form */}
            <footer className="p-6 sm:p-8 border-t border-slate-100 bg-white flex justify-end gap-4 sticky bottom-0 z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
                <button onClick={() => setCurrentView('LIST')} className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors shadow-sm">Cancelar</button>
                <button onClick={salvarManual} disabled={mutacaoSalvar.isPending} className="px-10 py-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md disabled:opacity-70">
                    {mutacaoSalvar.isPending ? <Icons.Spinner className="text-white w-5 h-5"/> : <Icons.CheckCircle className="w-5 h-5"/>}
                    {carrierForm.id ? 'Atualizar Transportadora' : 'Registrar Transportadora'}
                </button>
            </footer>
        </motion.div>
    );

    return (
        <div className="w-full min-h-screen pb-20 font-sans relative">
            <Helmet><title>Transportadoras | HUB ADMIN</title></Helmet>
            
            <AnimatePresence>
                {showSuccessOverlay && renderSuccessOverlay()}
            </AnimatePresence>

            <header className="mb-8 pt-4 px-4 sm:px-8 flex justify-between items-end relative z-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Logística & Envios</h1>
                    <p className="text-slate-500 text-sm mt-1">Gerencie transportadoras próprias ou configure a integração Melhor Envio.</p>
                </div>
                {currentView === 'LIST' && (
                    <button onClick={handleRefresh} className={`w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:text-blue-600 shadow-sm transition-all ${isManualRefresh ? 'animate-spin border-blue-400 text-blue-500' : ''}`} title="Atualizar Dados">
                        <Icons.Refresh className="w-5 h-5" />
                    </button>
                )}
            </header>

            <div className="px-4 sm:px-8 relative">
                <AnimatePresence mode="wait">
                    {currentView === 'LIST' && renderListaTabs()}
                    {currentView === 'FORM_MANUAL' && renderFormManual()}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default function AdminCarriers() {
    return (
        <QueryClientProvider client={queryClient}>
            <ErrorBoundary>
                <AdminCarriersContent />
            </ErrorBoundary>
        </QueryClientProvider>
    );
}