// ============================================================================
// FICHEIRO: resources/js/Modulos/Admin/AdminCarriers.jsx
// ARQUITETURA: SaaS Premium In-Screen Forms | Auto-CEP | Melhor Envio OAuth2
// ============================================================================

import React, { useState, useEffect, Component } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient, QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import api from '../../api';

// =========================================================
// CONFIGURAÇÃO REACT QUERY & ERROR BOUNDARY
// =========================================================
const queryClient = new QueryClient({
    defaultOptions: {
        queries: { refetchOnWindowFocus: false, staleTime: 1000 * 60 * 5 },
    },
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
    PowerOff: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 11-12.728 0M12 3v9" /></svg>
};

// =========================================================
// SKELETON LOADER
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

// Transições In-Screen Premium
const screenTransition = {
    initial: { opacity: 0, x: 20, scale: 0.98 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -20, scale: 0.98 },
    transition: { type: "spring", stiffness: 300, damping: 25 }
};

const AdminCarriersContent = () => {
    const queryClientLocal = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    
    // VIEWS: 'LIST' | 'FORM_MANUAL'
    const [currentView, setCurrentView] = useState('LIST');
    const [activeTab, setActiveTab] = useState('MANUAIS'); // MANUAIS ou MELHOR_ENVIO
    const [isManualRefresh, setIsManualRefresh] = useState(false);

    // Remove parâmetros de sucesso da URL se voltarmos do Melhor Envio
    useEffect(() => {
        if (searchParams.get('me_auth') === 'success') {
            setActiveTab('MELHOR_ENVIO');
            setSearchParams({}); // Limpa a URL
        }
    }, [searchParams]);

    // Estado do Formulário da Transportadora Manual
    const defaultCarrier = { id: null, nome: '', tempo_entrega: '', status: 'ATIVA', imagemUrl: null, file: null, cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', referencia: '' };
    const [carrierForm, setCarrierForm] = useState(defaultCarrier);
    const [isFetchingCep, setIsFetchingCep] = useState(false);

    // Estado do Melhor Envio
    const [meForm, setMeForm] = useState({ client_id: '', client_secret: '', carriers_ativas: [] });
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
            setMeForm({
                client_id: meResult.data.client_id || '',
                client_secret: meResult.data.client_secret || '',
                carriers_ativas: meResult.data.carriers_ativas || []
            });
            setIsAuthenticatedME(meResult.data.is_authenticated);
        }
    }, [meResult]);

    const handleRefresh = async () => {
        setIsManualRefresh(true);
        if (activeTab === 'MANUAIS') await refetch();
        if (activeTab === 'MELHOR_ENVIO') await refetchME();
        setTimeout(() => setIsManualRefresh(false), 800);
    };

    // 🟢 VIA CEP
    const handleCepChange = async (e) => {
        const novoCep = e.target.value.replace(/\D/g, '');
        setCarrierForm(prev => ({ ...prev, cep: novoCep }));
        if (novoCep.length === 8) {
            setIsFetchingCep(true);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${novoCep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setCarrierForm(prev => ({ ...prev, rua: data.logradouro, bairro: data.bairro, cidade: data.localidade, uf: data.uf }));
                } else { alert("CEP não encontrado."); }
            } catch (error) { console.error("Erro CEP", error); } 
            finally { setIsFetchingCep(false); }
        }
    };

    // 🟢 MUTAÇÕES MANUAIS
    const mutacaoSalvar = useMutation({
        mutationFn: async (formData) => await api.post('/admin/carriers', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
        onSuccess: () => {
            queryClientLocal.invalidateQueries({ queryKey: ['adminCarriers'] });
            setCurrentView('LIST');
            alert("Transportadora salva com sucesso!");
        },
        onError: (err) => alert("Erro ao salvar: " + (err.response?.data?.message || err.message))
    });

    const mutacaoDeletar = useMutation({
        mutationFn: async (id) => await api.delete(`/admin/carriers/${id}`),
        onSuccess: () => queryClientLocal.invalidateQueries({ queryKey: ['adminCarriers'] })
    });

    // 🟢 MUTAÇÕES MELHOR ENVIO
    const mutacaoSalvarME = useMutation({
        mutationFn: async (data) => await api.post('/admin/melhorenvio/settings', data),
        onSuccess: () => { queryClientLocal.invalidateQueries({ queryKey: ['melhorEnvioSettings'] }); },
        onError: (err) => alert("Erro ao salvar: " + (err.response?.data?.message || err.message))
    });

    const mutacaoDesconectarME = useMutation({
        mutationFn: async () => await api.post('/admin/melhorenvio/disconnect'),
        onSuccess: () => { 
            queryClientLocal.invalidateQueries({ queryKey: ['melhorEnvioSettings'] }); 
            alert("Conta do Melhor Envio desconectada com sucesso.");
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

    const handleMelhorEnvioAuth = async () => {
        if (!meForm.client_id || !meForm.client_secret) return alert("Preencha as credenciais da API do Melhor Envio.");
        setIsAuthenticatingME(true);
        
        try {
            // Primeiro, salva as credenciais digitadas
            await api.post('/admin/melhorenvio/settings', meForm);
            
            // Depois, pega a URL de autorização
            const res = await api.get('/admin/melhorenvio/auth-url');
            
            // Redireciona o usuário para o Melhor Envio
            window.location.href = res.data.url;
        } catch (error) {
            setIsAuthenticatingME(false);
            alert("Falha ao gerar link de autenticação.");
        }
    };

    const handleDesconectarME = () => {
        if (window.confirm("Deseja realmente desconectar sua conta do Melhor Envio? As cotações automáticas pararão de funcionar.")) {
            mutacaoDesconectarME.mutate();
        }
    };

    const toggleMeCarrier = (id) => {
        const novosCarriers = meForm.carriers_ativas.map(c => c.id === id ? { ...c, ativo: !c.ativo } : c);
        setMeForm({ ...meForm, carriers_ativas: novosCarriers });
        
        // Salva silenciosamente em background
        mutacaoSalvarME.mutate({ ...meForm, carriers_ativas: novosCarriers });
    };

    // ============================================================================
    // RENDER: LISTA E ABAS
    // ============================================================================
    const renderListaTabs = () => (
        <motion.div key="LIST" {...screenTransition} className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner w-full sm:w-auto">
                    <button onClick={() => setActiveTab('MANUAIS')} className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'MANUAIS' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        Parceiros Manuais
                    </button>
                    <button onClick={() => setActiveTab('MELHOR_ENVIO')} className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'MELHOR_ENVIO' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-blue-500'}`}>
                        <Icons.Truck className="w-4 h-4" /> Melhor Envio
                    </button>
                </div>
                
                {activeTab === 'MANUAIS' && (
                    <button onClick={abrirNovo} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl flex items-center gap-2 shadow-sm transition-colors w-full sm:w-auto justify-center">
                        <Icons.Plus /> Nova Transportadora
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'MANUAIS' && (
                    <motion.div key="TAB_MANUAIS" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
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
                                                <div className="w-14 h-14 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-2 shadow-sm">
                                                    {t.imagem ? <img src={t.imagem} className="w-full h-full object-contain mix-blend-multiply" alt=""/> : <Icons.Truck className="w-6 h-6 text-slate-300"/>}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800 text-sm">{t.nome}</span>
                                                    {t.cidade && <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-0.5"><Icons.MapPin className="w-3 h-3"/> {t.cidade} - {t.uf}</span>}
                                                </div>
                                            </td>
                                            <td className="p-5 text-center font-bold text-slate-600">{t.tempo_entrega}</td>
                                            <td className="p-5 text-center">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${t.status === 'ATIVA' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                            <td className="p-5 pr-8 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => abrirEdicao(t)} className="w-9 h-9 flex items-center justify-center bg-sky-50 text-sky-600 rounded-xl hover:bg-sky-100 transition-colors border border-sky-100 shadow-sm" title="Editar"><Icons.Edit /></button>
                                                    <button onClick={() => window.confirm('Deseja excluir?') && mutacaoDeletar.mutate(t.id)} className="w-9 h-9 flex items-center justify-center bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-colors border border-rose-100 shadow-sm" title="Excluir"><Icons.Trash /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'MELHOR_ENVIO' && (
                    <motion.div key="TAB_MELHOR_ENVIO" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        
                        {/* Auth Card */}
                        <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-[24px] p-8 shadow-xl text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10"><Icons.Truck className="w-64 h-64" /></div>
                            <div className="relative z-10">
                                
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="text-2xl font-black flex items-center gap-3"><Icons.Lock className="w-6 h-6 text-blue-400"/> Autenticação Melhor Envio</h2>
                                    {isAuthenticatedME && (
                                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                                            <Icons.CheckCircle className="w-4 h-4"/> Conectado via OAuth2
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-blue-200 mb-8 max-w-2xl">Configure o seu Client ID e Secret obtidos no painel do Melhor Envio para gerar as etiquetas de frete diretamente pelo nosso sistema.</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="text-[10px] font-bold text-blue-300 uppercase tracking-widest block mb-1.5">Client ID</label>
                                        <input type="text" value={meForm.client_id} onChange={e=>setMeForm({...meForm, client_id: e.target.value})} disabled={isAuthenticatedME} className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 h-12 text-sm font-mono outline-none focus:border-blue-400 focus:bg-white/20 transition-all placeholder-white/30 disabled:opacity-50" placeholder="Ex: 1234" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-blue-300 uppercase tracking-widest block mb-1.5">Client Secret</label>
                                        <input type="password" value={meForm.client_secret} onChange={e=>setMeForm({...meForm, client_secret: e.target.value})} disabled={isAuthenticatedME} className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 h-12 text-sm font-mono outline-none focus:border-blue-400 focus:bg-white/20 transition-all placeholder-white/30 disabled:opacity-50" placeholder="****************" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-bold text-blue-300 uppercase tracking-widest block mb-1.5">URL de Callback (Insira isso no Painel do Melhor Envio)</label>
                                        <input type="text" readOnly value={window.location.origin + '/admin/melhorenvio/callback'} className="w-full bg-black/20 border border-black/30 text-blue-200 rounded-xl px-4 h-12 text-sm font-mono outline-none cursor-not-allowed" />
                                    </div>
                                </div>

                                {isAuthenticatedME ? (
                                    <button onClick={handleDesconectarME} disabled={mutacaoDesconectarME.isPending} className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold h-12 px-8 rounded-xl transition-all flex items-center justify-center gap-2">
                                        {mutacaoDesconectarME.isPending ? <Icons.Spinner className="text-rose-300"/> : <Icons.PowerOff className="w-4 h-4"/>} Desconectar Conta
                                    </button>
                                ) : (
                                    <button onClick={handleMelhorEnvioAuth} disabled={isAuthenticatingME} className="bg-blue-500 hover:bg-blue-400 text-white font-bold h-12 px-8 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
                                        {isAuthenticatingME ? <><Icons.Spinner className="text-white"/> Conectando...</> : 'Autenticar (OAuth2)'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Serviços Ativos Toggles */}
                        <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm">
                            <h3 className="text-lg font-black text-slate-800 mb-6 border-b border-slate-100 pb-4">Serviços Habilitados na Vitrine</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {meForm.carriers_ativas.map(c => (
                                    <div key={c.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${c.ativo ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
                                        <span className={`text-sm font-bold ${c.ativo ? 'text-blue-800' : 'text-slate-500'}`}>{c.nome}</span>
                                        <button onClick={() => toggleMeCarrier(c.id)} className={`relative w-12 h-6 rounded-full transition-colors ${c.ativo ? 'bg-blue-500' : 'bg-slate-300'}`}>
                                            <motion.div layout className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm ${c.ativo ? 'right-1' : 'left-1'}`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );

    // ============================================================================
    // RENDER: FORMULÁRIO IN-SCREEN PREMIUM (MANUAL)
    // ============================================================================
    const renderFormManual = () => (
        <motion.div key="FORM" {...screenTransition} className="w-full bg-white border border-slate-200 rounded-[24px] shadow-2xl overflow-hidden flex flex-col min-h-[600px]">
            {/* Header Form */}
            <header className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentView('LIST')} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm">
                        <Icons.ArrowLeft />
                    </button>
                    <div>
                        <h2 className="text-xl font-black text-slate-800">{carrierForm.id ? 'Editar Parceiro Logístico' : 'Novo Parceiro Logístico'}</h2>
                        <p className="text-xs font-medium text-slate-500 mt-1">Configuração de transportadora e rotas manuais.</p>
                    </div>
                </div>
            </header>

            {/* Body Form */}
            <div className="p-6 sm:p-8 flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto space-y-8">
                    
                    {/* Bloco 1: Identificação */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-6 flex items-center gap-2"><Icons.Truck className="w-4 h-4 text-blue-500"/> Identificação</h3>
                        <div className="flex flex-col sm:flex-row gap-6">
                            <label className="w-24 h-24 sm:w-28 sm:h-28 bg-white border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors relative overflow-hidden group shadow-sm shrink-0">
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files[0]; if(f) setCarrierForm({...carrierForm, file: f, imagemUrl: URL.createObjectURL(f)}); }} />
                                {carrierForm.imagemUrl ? (
                                    <><img src={carrierForm.imagemUrl} className="w-full h-full object-contain p-2 mix-blend-multiply absolute inset-0" alt=""/><div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><span className="text-[10px] text-white font-bold uppercase">Trocar</span></div></>
                                ) : (
                                    <><Icons.Upload className="w-6 h-6 text-slate-400 mb-1"/><span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Logo</span></>
                                )}
                            </label>
                            <div className="flex-1 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Nome da Transportadora *</label>
                                        <input type="text" value={carrierForm.nome} onChange={e => setCarrierForm({...carrierForm, nome: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 transition-all shadow-sm" placeholder="Ex: Transportes Rápidos Lda" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Prazo Médio Simulado *</label>
                                        <input type="text" value={carrierForm.tempo_entrega} onChange={e => setCarrierForm({...carrierForm, tempo_entrega: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 transition-all shadow-sm" placeholder="Ex: 2 a 4 dias úteis" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Status no Checkout</label>
                                    <select value={carrierForm.status} onChange={e => setCarrierForm({...carrierForm, status: e.target.value})} className="w-full sm:w-1/2 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all cursor-pointer shadow-sm">
                                        <option value="ATIVA">Transportadora Ativa</option>
                                        <option value="INATIVA">Desativada / Oculta</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bloco 2: Endereço Sede (Auto-CEP) */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-6 flex items-center gap-2"><Icons.MapPin className="w-4 h-4 text-emerald-500"/> Sede / Endereço de Coleta</h3>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div className="md:col-span-2 relative">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">CEP</label>
                                <input type="text" maxLength={8} value={carrierForm.cep} onChange={handleCepChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono font-bold text-slate-800 outline-none focus:border-emerald-500 transition-all shadow-sm" placeholder="00000000" />
                                {isFetchingCep && <div className="absolute right-3 top-9"><Icons.Spinner className="text-emerald-500 w-4 h-4"/></div>}
                            </div>
                            <div className="md:col-span-3">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Rua / Nº</label>
                                <div className="flex gap-2">
                                    <input type="text" value={carrierForm.rua} onChange={e => setCarrierForm({...carrierForm, rua: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 transition-all shadow-sm" placeholder="Nome da Rua" />
                                    <input type="text" value={carrierForm.numero} onChange={e => setCarrierForm({...carrierForm, numero: e.target.value})} className="w-24 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 transition-all shadow-sm" placeholder="Nº" />
                                </div>
                            </div>
                            <div className="md:col-span-3">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Complemento</label>
                                <input type="text" value={carrierForm.complemento} onChange={e => setCarrierForm({...carrierForm, complemento: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 transition-all shadow-sm" placeholder="Galpão 3, Sala 2..." />
                            </div>
                            <div className="md:col-span-3">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Bairro</label>
                                <input type="text" value={carrierForm.bairro} onChange={e => setCarrierForm({...carrierForm, bairro: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 transition-all shadow-sm" />
                            </div>
                            <div className="md:col-span-3">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Cidade / UF</label>
                                <div className="flex gap-2">
                                    <input type="text" value={carrierForm.cidade} onChange={e => setCarrierForm({...carrierForm, cidade: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 transition-all shadow-sm" placeholder="Cidade" />
                                    <input type="text" value={carrierForm.uf} maxLength={2} onChange={e => setCarrierForm({...carrierForm, uf: e.target.value.toUpperCase()})} className="w-20 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 transition-all shadow-sm uppercase text-center" placeholder="UF" />
                                </div>
                            </div>
                            <div className="md:col-span-6">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Ponto de Referência</label>
                                <input type="text" value={carrierForm.referencia} onChange={e => setCarrierForm({...carrierForm, referencia: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 transition-all shadow-sm" placeholder="Próximo ao viaduto..." />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Form */}
            <footer className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 sticky bottom-0 z-20">
                <button onClick={() => setCurrentView('LIST')} className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors shadow-sm">Cancelar</button>
                <button onClick={salvarManual} disabled={mutacaoSalvar.isPending} className="px-8 py-3.5 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md disabled:opacity-70">
                    {mutacaoSalvar.isPending ? <Icons.Spinner className="text-white w-4 h-4"/> : <Icons.CheckCircle className="w-4 h-4"/>}
                    {carrierForm.id ? 'Atualizar Dados' : 'Registrar Transportadora'}
                </button>
            </footer>
        </motion.div>
    );

    return (
        <div className="w-full min-h-screen pb-20 font-sans relative">
            <Helmet><title>Transportadoras | HUB ADMIN</title></Helmet>
            
            <header className="mb-6 pt-4 px-4 sm:px-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Logística & Envios</h1>
                    <p className="text-slate-500 text-sm mt-1">Gerencie transportadoras próprias ou configure a integração Melhor Envio.</p>
                </div>
                {currentView === 'LIST' && (
                    <button onClick={handleRefresh} className={`w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:text-blue-600 shadow-sm transition-all ${isManualRefresh ? 'animate-spin border-blue-400 text-blue-500' : ''}`} title="Atualizar Dados">
                        <Icons.Refresh className="w-4 h-4" />
                    </button>
                )}
            </header>

            <div className="px-4 sm:px-8">
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