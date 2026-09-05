// ============================================================================
// FICHEIRO: resources/js/Modulos/Admin/AdminPixels.jsx
// ARQUITETURA: Tracking Hub Enterprise (Orquestrador)
// ============================================================================
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'; 
import { Activity, BookMarked, CircleAlert, RefreshCw } from 'lucide-react';
import api from '../../../api';
import { PageHeader } from '../DesignSystem/patterns/PageHeader';
import { SectionTabs } from '../DesignSystem/patterns/SectionTabs';
import { Button } from '../DesignSystem/primitives/Button';
import { IconButton } from '../DesignSystem/primitives/IconButton';
import { Skeleton } from '../DesignSystem/primitives/Skeleton';

// Imports de Submódulos

import { MetricsDictionaryModal, PixelErrorBoundary, PixelNotification } from './Compartilhado/ModaisPixels';
import DashboardPixels from './Painel/DashboardPixels';
import AppStorePixels from './Integracoes/AppStorePixels';
import DataLayerPixels from './Acionadores/DataLayerPixels';

const queryClient = new QueryClient({
    defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 1000 * 60 * 5 } },
});

const PIXEL_SECTIONS = [
    { value: 'PAINEL', label: 'Funil e métricas' },
    { value: 'INTEGRACOES', label: 'Integrações' },
    { value: 'ACIONADORES', label: 'Acionadores' },
];

const TrackingSkeleton = () => (
    <section className="hub-metric-skeleton-grid" role="status" aria-live="polite" aria-label="Carregando central de tracking" aria-busy="true">
        {Array.from({ length: 6 }, (_, index) => <Skeleton key={`pixel-skeleton-${index}`} />)}
    </section>
);

const TrackingUnavailable = ({ onRetry }) => (
    <section className="hub-surface hub-error-state" role="alert">
        <div>
            <CircleAlert aria-hidden="true" size={24} />
            <h2 className="hub-panel-title">Central de tracking indisponível</h2>
            <p>Não foi possível carregar as integrações, métricas e acionadores. Nenhum dado estimado é exibido.</p>
            <Button className="mt-5" variant="secondary" onClick={onRetry}>Tentar novamente</Button>
        </div>
    </section>
);

const AdminPixelsContent = () => {
    // ------------------------------------------------------------------------
    // ESTADOS GLOBAIS
    // ------------------------------------------------------------------------
    const [activeTab, setActiveTab] = useState('PAINEL');
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false); 
    const [isSaving, setIsSaving] = useState(false);
    const [loadError, setLoadError] = useState(false);
    
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

    const [eventosNativos, setEventosNativos] = useState({});
    
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
    const [triggerForm, setTriggerForm] = useState({ id: null, nome: '', evento_selecionado: 'Contact', evento_custom: '', tipo_gatilho: 'click', valor_gatilho: '', url_alvo: '*', status: false, payload: {} });

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
        if (!isBackground) {
            setIsLoading(true);
            setLoadError(false);
        }
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
            if (!isBackground) setLoadError(true); 
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
            await carregarTudo(dashDateRange, activeProvider, true, false);
            showToast('Alterações salvas e sincronizadas com o servidor.');
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
        setIsSaving(true);
        try {
            await api.put(`/admin/tracking/triggers/${id}`, { status: !currentStatus });
            await carregarTudo(dashDateRange, activeProvider, true, false);
            showToast('Status atualizado e sincronizado.');
        } catch (error) {
            showToast('Erro ao atualizar status.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleExcluirAcionador = async (id) => {
        setIsSaving(true);
        try {
            await api.delete(`/admin/tracking/triggers/${id}`);
            await carregarTudo(dashDateRange, activeProvider, true, false);
            showToast('Regra excluída e lista atualizada.');
        } catch (error) {
            showToast('Erro ao excluir regra.', 'error');
            throw error;
        } finally {
            setIsSaving(false);
        }
    };

    // ------------------------------------------------------------------------
    // PREPARAÇÃO DE DADOS (PAGINAÇÃO, ETC)
    // ------------------------------------------------------------------------
    const indiceInicial = (paginaAtual - 1) * itensPorPagina;
    const acionadoresPaginados = acionadores.slice(indiceInicial, indiceInicial + itensPorPagina);
    const totalPaginas = Math.ceil(acionadores.length / itensPorPagina);
    const isAllNativosAtivos = Object.keys(eventosNativos).length > 0 && Object.values(eventosNativos).every(v => v === true);

    const toggleAllNativos = (forceValue) => {
        const novos = { ...eventosNativos };
        Object.keys(novos).forEach(k => novos[k] = forceValue);
        setEventosNativos(novos);
    };

    // ------------------------------------------------------------------------
    // RENDERIZAÇÃO
    // ------------------------------------------------------------------------
    return (
        <PixelErrorBoundary>
            <div className="hub-layout-container">
                <Helmet><title>Central de Tracking | HUB Admin</title></Helmet>
                <PixelNotification show={toast.show} status={toast.status} titulo={toast.message} />
                <MetricsDictionaryModal isOpen={isDictOpen} onClose={() => setIsDictOpen(false)} />

                <PageHeader
                    eyebrow="Dados e conversões"
                    title="Central de Tracking"
                    icon={Activity}
                    description="Acompanhe eventos, conecte plataformas e gerencie regras de disparo com dados atualizados."
                    actions={<>
                        <IconButton icon={RefreshCw} label="Sincronizar dados" loading={isManualRefresh || isLoading} onClick={handleRefreshManual} />
                        <Button variant="secondary" icon={BookMarked} onClick={() => setIsDictOpen(true)}>Catálogo</Button>
                    </>}
                />

                <SectionTabs
                    ariaLabel="Seções da Central de Tracking"
                    items={PIXEL_SECTIONS}
                    value={activeTab}
                    onChange={(nextTab) => { setActiveTab(nextTab); setTriggerView('LIST'); }}
                />

                <div className="px-4 sm:px-0">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div key="tab-skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                                <TrackingSkeleton />
                            </motion.div>
                        ) : loadError ? <TrackingUnavailable onRetry={handleRefreshManual} /> : (
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