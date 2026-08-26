// ============================================================================
// FICHEIRO: resources/js/Modulos/Admin/AdminPixels.jsx
// ARQUITETURA: Tracking Hub Enterprise (Orquestrador)
// ============================================================================
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'; 
import { Activity, RotateCcw, BookMarked } from 'lucide-react';
import api from '../../api';

// Imports de Submódulos
import { CustomStyles, AnimatedNotification } from './Pixels/Compartilhado/ComponentesUIPixels';
import { MetricsDictionaryModal, PixelErrorBoundary } from './Pixels/Compartilhado/ModaisPixels';
import DashboardPixels from './Pixels/Painel/DashboardPixels';
import AppStorePixels from './Pixels/Integracoes/AppStorePixels';
import DataLayerPixels from './Pixels/Acionadores/DataLayerPixels';

const queryClient = new QueryClient({
    defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 1000 * 60 * 5 } },
});

const AdminPixelsContent = () => {
    // ------------------------------------------------------------------------
    // ESTADOS GLOBAIS
    // ------------------------------------------------------------------------
    const [activeTab, setActiveTab] = useState('PAINEL');
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false); 
    const [isSaving, setIsSaving] = useState(false);
    
    const [toast, setToast] = useState({ show: false, message: '', status: '' });
    const showToast = (message, status = 'success') => { 
        setToast({ show: true, message, status }); 
        setTimeout(() => setToast({ show: false, message: '', status: '' }), 3000); 
    };
    
    const [credenciais, setCredenciais] = useState({ 
        meta_pixel_id: '', meta_access_token: '', 
        ga4_measurement_id: '', tiktok_pixel_id: '',
        pinterest_pixel_id: '', pinterest_access_token: ''
    });

    const initNativos = { pageView: true, viewContent: true, addToCart: true, addToWishlist: true, initiateCheckout: true, addPaymentInfo: true, purchase: true, completeRegistration: true, lead: true, contact: true, search: true, donate: true, customizeProduct: true, findLocation: true, schedule: true, startTrial: true, submitApplication: true, subscribe: true };
    const [eventosNativos, setEventosNativos] = useState(initNativos);
    
    const [dashboardData, setDashboardData] = useState({ funil: [], metrics: {} });
    const [acionadores, setAcionadores] = useState([]);
    
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [itensPorPagina, setItensPorPagina] = useState(10);
    const [metricFilter, setMetricFilter] = useState(null);
    
    const [dashDateOpen, setDashDateOpen] = useState(false);
    const [dashDateRange, setDashDateRange] = useState({ start: '', end: '' });
    const [dashFilterText, setDashFilterText] = useState('Período Total');
    const [activeProvider, setActiveProvider] = useState('all');
    const [isDictOpen, setIsDictOpen] = useState(false);
    const [isManualRefresh, setIsManualRefresh] = useState(false);
    
    const [dashboardConfig, setDashboardConfig] = useState(() => {
        try {
            const saved = localStorage.getItem('@hub_dashboard_config');
            if (saved) return JSON.parse(saved);
        } catch(e) {}
        return ['receita_bruta', 'pedidos', 'taxa_conversao', 'ticket_medio', 'abandono_carrinho', 'abandono_checkout'];
    });
    const [isConfigDashOpen, setIsConfigDashOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('@hub_dashboard_config', JSON.stringify(dashboardConfig));
    }, [dashboardConfig]);

    const [triggerView, setTriggerView] = useState('LIST'); 
    const [triggerForm, setTriggerForm] = useState({ id: null, nome: '', evento_selecionado: 'Contact', evento_custom: '', tipo_gatilho: 'click', valor_gatilho: '', url_alvo: '*', status: true, payload: {} });

    // ------------------------------------------------------------------------
    // FUNÇÕES DE DADOS (FETCH/SAVE)
    // ------------------------------------------------------------------------
    const formatDateBR = (dateStr) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return dateStr;
    };

    const carregarTudo = async (datas, provedor = 'all', isBackground = false, isSilent = false, callback) => {
        if (!isBackground) setIsLoading(true);
        if (!isSilent) setIsUpdating(true);
        try {
            let dataInicio = '', dataFim = '';
            if (datas.start && datas.end && datas.start.includes('-')) {
                dataInicio = `${datas.start}T00:00:00.000Z`;
                dataFim = `${datas.end}T23:59:59.999Z`;
            }

            const [reqSettings, reqDash, reqTriggers] = await Promise.all([
                api.get('/admin/tracking/settings'),
                api.get(`/admin/tracking/dashboard?inicio=${dataInicio}&fim=${dataFim}&provedor=${provedor}`),
                api.get('/admin/tracking/triggers')
            ]);

            if (reqSettings.data?.data) {
                setCredenciais(reqSettings.data.data.credentials || {});
                if (Object.keys(reqSettings.data.data.settings || {}).length > 0) {
                    setEventosNativos(reqSettings.data.data.settings);
                }
            }
            if (reqDash.data) setDashboardData({ funil: Array.isArray(reqDash.data.funil) ? reqDash.data.funil : [], metrics: reqDash.data.metrics || {} });
            if (reqTriggers.data?.data) {
                setAcionadores(Array.isArray(reqTriggers.data.data) ? reqTriggers.data.data : []);
                if (!isBackground) setPaginaAtual(1);
            }
        } catch (error) { 
            console.error("Erro na API", error); 
        } finally { 
            if (!isBackground) setIsLoading(false); 
            if (!isSilent) setIsUpdating(false);
            if(callback) callback(); 
        }
    };

    useEffect(() => {
        const initRange = { start: '', end: '' };
        setDashDateRange(initRange);
        setDashFilterText('Período Total');
        carregarTudo(initRange, 'all', false, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    useEffect(() => {
        const interval = setInterval(() => { carregarTudo(dashDateRange, activeProvider, true, true); }, 15000);
        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dashDateRange, activeProvider]);

    const aplicarFiltroData = (novoRange, provedor = activeProvider, callback) => {
        setDashDateRange(novoRange);
        setActiveProvider(provedor);
        setDashDateOpen(false);
        if (novoRange.start && novoRange.end) {
            setDashFilterText(`${formatDateBR(novoRange.start)} até ${formatDateBR(novoRange.end)}`);
        } else {
            setDashFilterText('Período Total');
        }
        carregarTudo(novoRange, provedor, true, true, callback);
    };

    const handleRefreshManual = () => {
        setIsManualRefresh(true);
        carregarTudo(dashDateRange, activeProvider, false, false, () => {
            showToast('Dados sincronizados com o servidor!');
            setIsManualRefresh(false);
        });
    };

    const handleSaveIntegrações = async (e) => {
        if(e) e.preventDefault();
        setIsSaving(true);
        try {
            await api.post('/admin/tracking/settings', { credentials: credenciais, settings: eventosNativos });
            showToast('Alterações salvas com sucesso na arquitetura Enterprise!');
        } catch (error) { 
            showToast('Erro ao salvar as configurações.', 'error'); 
        } finally { setIsSaving(false); }
    };

    const handleSalvarAcionador = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const eventoFinal = triggerForm.evento_selecionado === 'CUSTOM' ? triggerForm.evento_custom : triggerForm.evento_selecionado;
            if (!eventoFinal) { showToast('Informe o nome do Evento.', 'error'); setIsSaving(false); return; }
            
            if (triggerForm.tipo_gatilho !== 'exit_intent' && !triggerForm.valor_gatilho.trim()) {
                showToast('O parâmetro do gatilho é obrigatório para esta regra.', 'error');
                setIsSaving(false); return;
            }

            const payloadData = typeof triggerForm.payload === 'string' ? JSON.parse(triggerForm.payload) : triggerForm.payload;

            const payloadRequest = {
                nome: triggerForm.nome,
                evento: eventoFinal,
                tipo_gatilho: triggerForm.tipo_gatilho,
                valor_gatilho: triggerForm.valor_gatilho || null,
                url_alvo: triggerForm.url_alvo || '*',
                status: triggerForm.status,
                payload: payloadData
            };

            if (triggerForm.id) {
                await api.put(`/admin/tracking/triggers/${triggerForm.id}`, payloadRequest);
                showToast('Regra atualizada com sucesso!');
            } else {
                await api.post('/admin/tracking/triggers', payloadRequest);
                showToast('Regra criada com sucesso!');
            }

            await carregarTudo(dashDateRange, activeProvider, true, false);
            setTriggerView('LIST');
        } catch (error) {
            console.error("Erro ao salvar:", error);
            showToast('Erro ao salvar o acionador. Verifique o JSON Payload.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleAcionador = async (id, currentStatus) => {
        try {
            await api.put(`/admin/tracking/triggers/${id}`, { status: !currentStatus });
            setAcionadores(prev => prev.map(a => a.id === id ? { ...a, status: !currentStatus } : a));
            showToast('Status atualizado.');
        } catch (error) {
            showToast('Erro ao atualizar status.', 'error');
        }
    };

    const handleExcluirAcionador = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir esta regra? Esta ação é irreversível.')) return;
        try {
            await api.delete(`/admin/tracking/triggers/${id}`);
            setAcionadores(prev => prev.filter(a => a.id !== id));
            showToast('Regra excluída.');
        } catch (error) {
            showToast('Erro ao excluir regra.', 'error');
        }
    };

    // ------------------------------------------------------------------------
    // PREPARAÇÃO DE DADOS (PAGINAÇÃO, ETC)
    // ------------------------------------------------------------------------
    const indiceInicial = (paginaAtual - 1) * itensPorPagina;
    const acionadoresPaginados = acionadores.slice(indiceInicial, indiceInicial + itensPorPagina);
    const totalPaginas = Math.ceil(acionadores.length / itensPorPagina);
    const isAllNativosAtivos = Object.values(eventosNativos).every(v => v === true);

    const toggleAllNativos = (forceValue) => {
        const novos = { ...eventosNativos };
        Object.keys(novos).forEach(k => novos[k] = forceValue);
        setEventosNativos(novos);
    };

    const TabSkeleton = () => (
        <div className="space-y-6 animate-pulse p-4">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="space-y-2">
                    <div className="h-6 w-48 bg-slate-200 rounded-lg" />
                    <div className="h-4 w-72 bg-slate-100 rounded-lg" />
                </div>
                <div className="flex gap-2">
                    <div className="h-10 w-32 bg-slate-200 rounded-xl" />
                    <div className="h-10 w-10 bg-slate-200 rounded-xl" />
                </div>
            </div>
            <div className="flex flex-wrap gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex-1 min-w-[200px] h-32 bg-slate-100 rounded-2xl p-5 flex flex-col justify-between">
                        <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                        <div className="space-y-1.5">
                            <div className="h-2.5 bg-slate-200 rounded w-3/4" />
                            <div className="h-7 bg-slate-200 rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // ------------------------------------------------------------------------
    // RENDERIZAÇÃO
    // ------------------------------------------------------------------------
    return (
        <PixelErrorBoundary>
            <div className="w-full max-w-7xl mx-auto pb-16 relative">
                <Helmet><title>Central de Tracking | HUB Admin</title></Helmet>
                <CustomStyles />
                <AnimatedNotification show={toast.show} status={toast.status} titulo={toast.message} />
                <MetricsDictionaryModal isOpen={isDictOpen} onClose={() => setIsDictOpen(false)} />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 px-4 sm:px-0">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                            <Activity className="w-6 h-6 text-blue-600" /> Tracking Hub (CDP)
                        </h1>
                        <p className="text-slate-500 mt-1 text-sm">Plataforma de coleta, validação e distribuição inteligente de eventos.</p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button onClick={handleRefreshManual} disabled={isManualRefresh || isLoading} className="flex items-center justify-center w-10 h-10 bg-white text-slate-600 rounded-lg shadow-sm hover:text-blue-600 border border-slate-200 hover:border-blue-300 transition-all focus:ring-2 focus:ring-blue-500/20" title="Sincronizar Agora">
                            <RotateCcw className={`w-4 h-4 ${(isManualRefresh || isLoading) ? 'animate-spin text-blue-600' : ''}`} />
                        </button>
                        <button onClick={() => setIsDictOpen(true)} className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:border-blue-200 transition-all focus:ring-2 focus:ring-blue-500/20">
                            <BookMarked className="w-4 h-4" /> Catálogo
                        </button>
                    </div>
                </div>

                <div className="flex overflow-x-auto no-scrollbar bg-slate-100/80 p-1 rounded-xl mb-8 w-max max-w-full border border-slate-200/50 mx-4 sm:mx-0">
                    {[
                        { id: 'PAINEL', label: 'Funil e Métricas' },
                        { id: 'INTEGRACOES', label: 'App Store' },
                        { id: 'ACIONADORES', label: 'Data Layer' }
                    ].map((tab) => (
                        <button key={tab.id} onClick={() => { setActiveTab(tab.id); setTriggerView('LIST'); }} className={`relative px-5 py-2.5 rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap outline-none ${activeTab === tab.id ? 'bg-white text-slate-800 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
                            {activeTab === tab.id && <motion.div layoutId="activeTabPixels" className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/50" transition={{ type: "spring", bounce: 0, duration: 0.2 }} />}
                            <span className="relative z-10">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="px-4 sm:px-0">
                    <AnimatePresence mode="wait">
                        {(isManualRefresh || (isLoading && dashboardData.funil.length === 0)) ? (
                            <motion.div
                                key="tab-skeleton"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <TabSkeleton />
                            </motion.div>
                        ) : (
                            <React.Fragment key={activeTab}>
                                {activeTab === 'PAINEL' && (
                                    <DashboardPixels 
                                        dashboardData={dashboardData}
                                        dashboardConfig={dashboardConfig}
                                        setDashboardConfig={setDashboardConfig}
                                        isConfigDashOpen={isConfigDashOpen}
                                        setIsConfigDashOpen={setIsConfigDashOpen}
                                        credenciais={credenciais}
                                        acionadores={acionadores}
                                        activeProvider={activeProvider}
                                        setActiveProvider={setActiveProvider}
                                        metricFilter={metricFilter}
                                        setMetricFilter={setMetricFilter}
                                        dashDateOpen={dashDateOpen}
                                        setDashDateOpen={setDashDateOpen}
                                        dashDateRange={dashDateRange}
                                        setDashDateRange={setDashDateRange}
                                        dashFilterText={dashFilterText}
                                        aplicarFiltroData={aplicarFiltroData}
                                        isManualRefresh={isManualRefresh}
                                        isUpdating={isUpdating}
                                    />
                                )}
                                {activeTab === 'INTEGRACOES' && (
                                    <AppStorePixels 
                                        credenciais={credenciais}
                                        setCredenciais={setCredenciais}
                                        onSave={handleSaveIntegrações}
                                        isSaving={isSaving}
                                    />
                                )}
                                {activeTab === 'ACIONADORES' && (
                                    <DataLayerPixels 
                                        triggerView={triggerView}
                                        setTriggerView={setTriggerView}
                                        
                                        eventosNativos={eventosNativos}
                                        setEventosNativos={setEventosNativos}
                                        isAllNativosAtivos={isAllNativosAtivos}
                                        onToggleAllNativos={toggleAllNativos}
                                        
                                        acionadoresPaginados={acionadoresPaginados}
                                        paginaAtual={paginaAtual}
                                        setPaginaAtual={setPaginaAtual}
                                        totalPaginas={totalPaginas}
                                        itensPorPagina={itensPorPagina}
                                        setItensPorPagina={setItensPorPagina}
                                        
                                        triggerForm={triggerForm}
                                        setTriggerForm={setTriggerForm}
                                        
                                        onSalvarAcionador={handleSalvarAcionador}
                                        onDeleteTrigger={handleExcluirAcionador}
                                        onEditTrigger={(acionador) => { setTriggerForm(acionador); setTriggerView('FORM'); }}
                                        onSaveIntegracoes={handleSaveIntegrações}
                                        isSaving={isSaving}
                                    />
                                )}
                            </React.Fragment>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </PixelErrorBoundary>
    );
};

export default function AdminPixels() {
    return (
        <QueryClientProvider client={queryClient}>
            <AdminPixelsContent />
        </QueryClientProvider>
    );
}