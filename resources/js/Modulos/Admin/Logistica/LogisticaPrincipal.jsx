import React, { useState, useEffect, Component } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient, QueryClientProvider, QueryClient } from '@tanstack/react-query';
import api from '../../../api';

// Components
import { CarriersIcons, screenTransition, SuccessOverlay } from './Carriers/Compartilhado/CarriersUI';
import PartnersTab from './Carriers/Parceiros/PartnersTab';
import CarrierEditor from './Carriers/Parceiros/CarrierEditor';
import CarrierDetail from './Carriers/Parceiros/CarrierDetail';
import MelhorEnvioTab from './Carriers/MelhorEnvio/MelhorEnvioTab';
import SenderTab from './Carriers/Remetente/SenderTab';
import PackagesTab from './Carriers/Embalagens/PackagesTab';
import PackageEditor from './Carriers/Embalagens/PackageEditor';
import CarrierAuditTab from './Carriers/Auditoria/CarrierAuditTab';

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
// COMPONENTE PRINCIPAL
// =========================================================
const AdminCarriersContent = () => {
    const queryClientLocal = useQueryClient();
    
    // VIEWS: 'LIST' | 'FORM_MANUAL' | 'FORM_PACKAGE' | 'CARRIER_DETAIL'
    const [currentView, setCurrentView] = useState('LIST');
    const [activeTab, setActiveTab] = useState('MANUAIS'); // MANUAIS, MELHOR_ENVIO, REMETENTE, EMBALAGENS
    const [isManualRefresh, setIsManualRefresh] = useState(false);
    const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
    const [isOpeningForm, setIsOpeningForm] = useState(false);

    // 🟢 FORMS STATES
    const [carrierToEdit, setCarrierToEdit] = useState(null);
    const [packageToEdit, setPackageToEdit] = useState(null);
    
    const [senderForm, setSenderForm] = useState({ nome: '', documento: '', email: '', telefone: '', cep: '', rua: '', numero: '', bairro: '', cidade: '', uf: '' });

    // Dicionário Visual Master do Melhor Envio
    const dicMelhorEnvio = [
        { id: '1', key: 'Correios PAC', logo: 'https://logospng.org/download/correios/logo-correios-2048.png', color: 'from-yellow-400 to-yellow-500' },
        { id: '2', key: 'Correios SEDEX', logo: 'https://logospng.org/download/correios/logo-correios-2048.png', color: 'from-blue-500 to-blue-600' },
        { id: '3', key: 'Jadlog', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Jadlog_logo.png', color: 'from-red-600 to-red-700' },
        { id: '4', key: 'Loggi', logo: 'https://logospng.org/download/loggi/logo-loggi-2048.png', color: 'from-sky-400 to-sky-500' },
        { id: '5', key: 'Azul Cargo', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Azul_Linhas_Aereas_Brasileiras_logo.svg', color: 'from-indigo-600 to-indigo-800' },
        { id: '6', key: 'LATAM Cargo', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/05/LATAM_Cargo_logo.svg', color: 'from-red-700 to-red-900' }
    ];

    const [meTokenInput, setMeTokenInput] = useState('');
    const [meCarriersAtivas, setMeCarriersAtivas] = useState([]);
    const [isAuthenticatedME, setIsAuthenticatedME] = useState(false);

    // 🟢 FETCH QUERIES
    const { data: fetchResult, isLoading, refetch } = useQuery({ queryKey: ['adminCarriers'], queryFn: async () => { const res = await api.get('/admin/carriers'); return res.data; } });
    const transportadoras = fetchResult?.data || [];

    const { data: meResult, refetch: refetchME } = useQuery({ queryKey: ['melhorEnvioSettings'], queryFn: async () => { const res = await api.get('/admin/melhorenvio/settings'); return res.data; } });

    const { data: packagesResult, isLoading: loadingPackages, refetch: refetchPackages } = useQuery({ queryKey: ['adminPackages'], queryFn: async () => { const res = await api.get('/admin/shipping-packages'); return res.data; } });
    const embalagens = packagesResult?.data || [];

    useEffect(() => {
        if (meResult?.data) {
            const carriersAtivasBanco = meResult.data.carriers_ativas || [];
            const mergedCarriers = dicMelhorEnvio.map(masterItem => {
                const found = carriersAtivasBanco.find(c => c.id === masterItem.id || c.nome === masterItem.key);
                return { id: masterItem.id, nome: masterItem.key, ativo: found ? found.ativo : false, logo: masterItem.logo, color: masterItem.color };
            });

            setMeCarriersAtivas(mergedCarriers);
            setIsAuthenticatedME(meResult.data.is_authenticated);
            setMeTokenInput(''); 
            
            if (meResult.data.sender_info && Object.keys(meResult.data.sender_info).length > 0) {
                setSenderForm(meResult.data.sender_info);
            }
        } else {
            setMeCarriersAtivas(dicMelhorEnvio.map(m => ({ id: m.id, nome: m.key, ativo: false, logo: m.logo, color: m.color })));
        }
    }, [meResult]);

    const handleRefresh = async () => {
        setIsManualRefresh(true);
        if (activeTab === 'MANUAIS') await refetch();
        if (activeTab === 'MELHOR_ENVIO' || activeTab === 'REMETENTE') await refetchME();
        if (activeTab === 'EMBALAGENS') await refetchPackages();
        setTimeout(() => setIsManualRefresh(false), 800);
    };

    // 🟢 MUTAÇÕES MANUAIS
    const mutacaoSalvar = useMutation({ mutationFn: async (formData) => await api.post('/admin/carriers', formData, { headers: { 'Content-Type': 'multipart/form-data' } }), onSuccess: () => { queryClientLocal.invalidateQueries({ queryKey: ['adminCarriers'] }); setCurrentView('LIST'); setCarrierToEdit(null); } });
    const mutacaoDeletar = useMutation({ mutationFn: async (id) => await api.delete(`/admin/carriers/${id}`), onSuccess: () => queryClientLocal.invalidateQueries({ queryKey: ['adminCarriers'] }) });
    const mutacaoToggleStatus = useMutation({ mutationFn: async ({ id, data }) => await api.post(`/admin/carriers/${id}/status`, data), onSuccess: () => queryClientLocal.invalidateQueries({ queryKey: ['adminCarriers'] }) });

    // 🟢 MUTAÇÕES MELHOR ENVIO
    const mutacaoVerifyToken = useMutation({
        mutationFn: async (token) => await api.post('/admin/melhorenvio/verify-token', { access_token: token }),
        onSuccess: () => { setShowSuccessOverlay(true); setTimeout(() => { setShowSuccessOverlay(false); queryClientLocal.invalidateQueries({ queryKey: ['melhorEnvioSettings'] }); setIsAuthenticatedME(true); }, 2500); },
        onError: (err) => { alert(err.response?.data?.message || "Token inválido."); }
    });
    const mutacaoSaveCarriersME = useMutation({ mutationFn: async (carriers) => await api.post('/admin/melhorenvio/carriers', { carriers_ativas: carriers }), onSuccess: () => { queryClientLocal.invalidateQueries({ queryKey: ['melhorEnvioSettings'] }); } });
    const mutacaoDesconectarME = useMutation({ mutationFn: async () => await api.post('/admin/melhorenvio/disconnect'), onSuccess: () => { queryClientLocal.invalidateQueries({ queryKey: ['melhorEnvioSettings'] }); setIsAuthenticatedME(false); setMeTokenInput(''); } });
    
    // 🟢 MUTAÇÕES REMETENTE E EMBALAGENS
    const mutacaoSaveSender = useMutation({ mutationFn: async (dados) => await api.post('/admin/melhorenvio/sender', dados), onSuccess: () => { alert("Remetente atualizado!"); queryClientLocal.invalidateQueries({ queryKey: ['melhorEnvioSettings'] }); } });
    const mutacaoSavePackage = useMutation({ mutationFn: async (dados) => await api.post('/admin/shipping-packages', dados), onSuccess: () => { queryClientLocal.invalidateQueries({ queryKey: ['adminPackages'] }); setCurrentView('LIST'); setPackageToEdit(null); } });
    const mutacaoDeletePackage = useMutation({ mutationFn: async (id) => await api.delete(`/admin/shipping-packages/${id}`), onSuccess: () => queryClientLocal.invalidateQueries({ queryKey: ['adminPackages'] }) });

    // 🟢 HANDLERS DE TELA
    const abrirNovo = () => {
        setIsOpeningForm(true);
        setTimeout(() => {
            setIsOpeningForm(false);
            setCarrierToEdit(null);
            setCurrentView('FORM_MANUAL');
        }, 100);
    };
    const abrirEdicao = (c) => { setCarrierToEdit(c); setCurrentView('FORM_MANUAL'); };
    const abrirDetalhe = (c) => { setCarrierToEdit(c); setCurrentView('CARRIER_DETAIL'); };

    const abrirNovaEmbalagem = () => { setPackageToEdit(null); setCurrentView('FORM_PACKAGE'); };
    const abrirEdicaoEmbalagem = (p) => { setPackageToEdit(p); setCurrentView('FORM_PACKAGE'); };

    const handleSincronizarME = () => { if (!meTokenInput) return alert("Cole o seu Personal Access Token."); mutacaoVerifyToken.mutate(meTokenInput); };
    const handleDesconectarME = () => { if (window.confirm("Deseja realmente desconectar?")) mutacaoDesconectarME.mutate(); };
    const toggleMeCarrier = (id) => { const novosCarriers = meCarriersAtivas.map(c => c.id === id ? { ...c, ativo: !c.ativo } : c); setMeCarriersAtivas(novosCarriers); mutacaoSaveCarriersME.mutate(novosCarriers); };

    // ============================================================================
    // RENDER: LISTA E ABAS
    // ============================================================================
    const renderListaTabs = () => (
        <motion.div key="LIST" {...screenTransition} className="w-full">
            
            {/* Abas Superiores */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex bg-slate-100/80 p-1 rounded-xl w-full lg:w-auto overflow-x-auto no-scrollbar border border-slate-200/50">
                    {[
                        { id: 'MANUAIS', label: 'Parceiros' },
                        { id: 'MELHOR_ENVIO', label: 'Melhor Envio', icon: <CarriersIcons.Truck className="w-3.5 h-3.5 mb-0.5" /> },
                        { id: 'REMETENTE', label: 'Loja / Remetente' },
                        { id: 'EMBALAGENS', label: 'Caixas Salvas', icon: <CarriersIcons.Box className="w-3.5 h-3.5 mb-0.5" /> },
                        { id: 'AUDITORIA', label: 'Auditoria', icon: <CarriersIcons.History className="w-3.5 h-3.5 mb-0.5" /> }
                    ].map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative px-5 py-2.5 rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap outline-none ${activeTab === tab.id ? 'text-blue-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
                            {activeTab === tab.id && <motion.div layoutId="activeTabCarriers" className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/50" transition={{ type: "spring", bounce: 0, duration: 0.2 }} />}
                            <span className="relative z-10 flex items-center gap-1.5">{tab.icon}{tab.label}</span>
                        </button>
                    ))}
                </div>
                
                {activeTab === 'MANUAIS' && (
                    <button onClick={abrirNovo} disabled={isOpeningForm} className="bg-slate-900 hover:bg-black text-white font-bold h-10 px-5 rounded-xl flex items-center gap-2 shadow-sm transition-all w-full sm:w-auto justify-center relative overflow-hidden active:scale-95 disabled:opacity-80">
                        {isOpeningForm ? (
                            <>
                                <div className="absolute inset-0 bg-blue-600/20 w-full animate-pulse" />
                                <CarriersIcons.Spinner className="w-4 h-4" /> <span className="relative z-10 text-xs tracking-widest uppercase">Carregando...</span>
                            </>
                        ) : (
                            <><CarriersIcons.Plus className="w-4 h-4" /> <span className="text-xs tracking-widest uppercase">Nova Transportadora</span></>
                        )}
                    </button>
                )}
                {activeTab === 'EMBALAGENS' && (
                    <button onClick={abrirNovaEmbalagem} className="bg-slate-900 hover:bg-black text-white font-bold h-10 px-5 rounded-xl flex items-center gap-2 shadow-sm transition-all w-full sm:w-auto justify-center active:scale-95">
                        <CarriersIcons.Plus className="w-4 h-4" /> <span className="text-xs tracking-widest uppercase">Nova Embalagem</span>
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'MANUAIS' && (
                    <PartnersTab 
                        transportadoras={transportadoras} 
                        isLoading={isLoading || isManualRefresh} 
                        onEdit={abrirEdicao} 
                        onDetail={abrirDetalhe}
                        onDelete={(id) => mutacaoDeletar.mutate(id)} 
                        onToggleStatus={(id, data) => mutacaoToggleStatus.mutate({ id, data })}
                    />
                )}

                {activeTab === 'MELHOR_ENVIO' && (
                    <MelhorEnvioTab 
                        isAuthenticatedME={isAuthenticatedME}
                        meTokenInput={meTokenInput}
                        setMeTokenInput={setMeTokenInput}
                        isAuthenticatingME={mutacaoVerifyToken.isPending}
                        handleSincronizarME={handleSincronizarME}
                        handleDesconectarME={handleDesconectarME}
                        isDisconnecting={mutacaoDesconectarME.isPending}
                        meCarriersAtivas={meCarriersAtivas}
                        toggleMeCarrier={toggleMeCarrier}
                        isLoading={isManualRefresh}
                    />
                )}

                {activeTab === 'REMETENTE' && (
                    <SenderTab 
                        senderForm={senderForm}
                        setSenderForm={setSenderForm}
                        onSave={() => mutacaoSaveSender.mutate(senderForm)}
                        isSaving={mutacaoSaveSender.isPending}
                        isLoading={isManualRefresh}
                    />
                )}

                {activeTab === 'EMBALAGENS' && (
                    <PackagesTab 
                        embalagens={embalagens}
                        loadingPackages={loadingPackages || isManualRefresh}
                        onEdit={abrirEdicaoEmbalagem}
                        onDelete={(id) => mutacaoDeletePackage.mutate(id)}
                    />
                )}

                {activeTab === 'AUDITORIA' && (
                    <CarrierAuditTab />
                )}
            </AnimatePresence>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8 font-sans text-slate-800 selection:bg-blue-500 selection:text-white">
            <Helmet><title>Transportadoras & Rotas | Hub Commerce</title></Helmet>
            
            <AnimatePresence>
                {showSuccessOverlay && <SuccessOverlay />}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* HEADER */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 sm:p-8 rounded-[32px] shadow-sm border border-slate-200">
                    {currentView !== 'LIST' ? (
                        <div className="flex items-center gap-4">
                            <button onClick={() => setCurrentView('LIST')} className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-2xl transition-all shadow-sm group">
                                <CarriersIcons.ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                                    {currentView === 'FORM_MANUAL' ? (carrierToEdit ? 'Editar Transportadora' : 'Nova Transportadora') : ''}
                                    {currentView === 'CARRIER_DETAIL' ? 'Detalhes da Transportadora' : ''}
                                    {currentView === 'FORM_PACKAGE' ? 'Cadastro de Embalagem' : ''}
                                </h1>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Transportadoras & Logística</h1>
                                <p className="text-sm font-medium text-slate-500 mt-1">Configure suas transportadoras próprias ou integre com o Melhor Envio.</p>
                            </div>
                            <button onClick={handleRefresh} disabled={isManualRefresh} className={`flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 font-bold px-3 py-1.5 text-[11px] uppercase tracking-wider rounded-lg hover:bg-slate-50 transition-all shadow-sm ${isManualRefresh ? 'opacity-50 cursor-wait' : ''}`}>
                                <CarriersIcons.Refresh className={`w-3.5 h-3.5 ${isManualRefresh ? "animate-spin" : ""}`} /> {isManualRefresh ? 'Atualizando' : 'Atualizar Dados'}
                            </button>
                        </>
                    )}
                </header>

                {/* AREA DE CONTEÚDO */}
                <main className="relative">
                    <AnimatePresence mode="wait">
                        {currentView === 'LIST' && renderListaTabs()}
                        
                        {currentView === 'FORM_MANUAL' && (
                            <motion.div 
                                key="FORM_MANUAL"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="w-full"
                            >
                                <CarrierEditor 
                                    carrierToEdit={carrierToEdit} 
                                    onCancel={() => setCurrentView('LIST')} 
                                    onSave={(formData) => mutacaoSalvar.mutate(formData)} 
                                    isSaving={mutacaoSalvar.isPending} 
                                />
                            </motion.div>
                        )}

                        {currentView === 'CARRIER_DETAIL' && (
                            <motion.div 
                                key="CARRIER_DETAIL"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="w-full"
                            >
                                <CarrierDetail 
                                    carrier={carrierToEdit} 
                                    onEdit={() => abrirEdicao(carrierToEdit)}
                                    onBack={() => setCurrentView('LIST')}
                                />
                            </motion.div>
                        )}
                        
                        {/* We will leave FORM_PACKAGE as modal overlay for now, or make it inline too? Let's make it inline. */}
                        {currentView === 'FORM_PACKAGE' && (
                            <motion.div 
                                key="FORM_PACKAGE"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="w-full"
                            >
                                <PackageEditor 
                                    packageToEdit={packageToEdit} 
                                    onCancel={() => setCurrentView('LIST')} 
                                    onSave={(formData) => mutacaoSavePackage.mutate(formData)} 
                                    isSaving={mutacaoSavePackage.isPending} 
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default function AdminCarriers() {
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <AdminCarriersContent />
            </QueryClientProvider>
        </ErrorBoundary>
    );
}
