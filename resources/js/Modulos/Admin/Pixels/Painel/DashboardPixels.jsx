// ============================================================================
// FICHEIRO: resources/js/Modulos/Admin/Pixels/Painel/DashboardPixels.jsx
// Aba "Painel" — Dashboard personalizado, MetricsRail e Funil de Eventos
// ============================================================================
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, Filter, Calendar, Zap, Check, AlertTriangle } from 'lucide-react';
import { tabTransition, standardEvents, buildBaseCardProps } from '../Compartilhado/ConstantesPixels';
import { SafeTooltip } from '../Compartilhado/ComponentesUIPixels';
import { ConfigMetricsModal, DateFilterPopup } from '../Compartilhado/ModaisPixels';

const DashboardPixels = ({
    dashboardData,
    dashboardConfig,
    setDashboardConfig,
    credenciais,
    acionadores,
    activeProvider,
    setActiveProvider,
    metricFilter,
    setMetricFilter,
    dashDateRange,
    setDashDateRange,
    dashDateOpen,
    setDashDateOpen,
    dashFilterText,
    isUpdating,
    isManualRefresh,
    isConfigDashOpen,
    setIsConfigDashOpen,
    aplicarFiltroData,
}) => {
    const met = dashboardData?.metrics || {};

    // --- Build card props (base + custom de acionadores) ---
    const cardProps = useMemo(() => {
        const base = buildBaseCardProps(met);

        // Adiciona métricas custom de acionadores
        (acionadores || []).forEach(ac => {
            if (!standardEvents.includes(ac.evento)) {
                const metData = dashboardData?.funil?.find(f => f.evento === ac.evento);
                base[`custom_${ac.evento}`] = {
                    label: `Custom: ${ac.evento}`,
                    valor: metData ? metData.total : 0,
                    icon: Zap,
                    color: 'text-purple-500',
                    tooltip: `Total de disparos rastreados da regra: ${ac.nome}`,
                    formula: `COUNT(event) WHERE event = '${ac.evento}'`
                };
            }
        });

        return base;
    }, [met, acionadores, dashboardData?.funil]);

    // --- Verificar se métrica é clicável (tem correspondência no funil) ---
    const isMetricClickable = (key, conf) => {
        if (!conf?.formula || !Array.isArray(dashboardData?.funil)) return false;
        const formulaStr = conf.formula.toLowerCase();
        return dashboardData.funil.some(f => {
            const evStr = f.evento.toLowerCase();
            if (key === `custom_${f.evento}`) return true;
            if (key === 'taxa_conversao' && ['pageview', 'purchase'].includes(evStr)) return true;
            if (key === 'abandono_carrinho' && ['addtocart', 'purchase'].includes(evStr)) return true;
            if (key === 'abandono_checkout' && ['initiatecheckout', 'purchase'].includes(evStr)) return true;
            return formulaStr.includes(evStr);
        });
    };

    // --- Verificar se etapa do funil está highlighted ---
    const isFunnelHighlighted = (etapa) => {
        if (!metricFilter) return true;
        const conf = cardProps[metricFilter];
        if (!conf?.formula) return false;
        const formulaStr = conf.formula.toLowerCase();
        const evStr = etapa.evento.toLowerCase();
        if (metricFilter === `custom_${etapa.evento}`) return true;
        if (metricFilter === 'taxa_conversao' && ['pageview', 'purchase'].includes(evStr)) return true;
        if (metricFilter === 'abandono_carrinho' && ['addtocart', 'purchase'].includes(evStr)) return true;
        if (metricFilter === 'abandono_checkout' && ['initiatecheckout', 'purchase'].includes(evStr)) return true;
        if (['sessoes', 'novos_clientes', 'clientes_recorrentes', 'cac', 'roas', 'ltv', 'margem_bruta', 'receita_bruta', 'receita_liquida', 'pedidos', 'ticket_medio', 'itens_vendidos'].includes(metricFilter) && evStr === 'purchase') return true;
        return formulaStr.includes(evStr);
    };

    const funnelData = Array.isArray(dashboardData?.funil) ? dashboardData.funil : [];
    const maxEventos = Math.max(...(funnelData.map(f => f.total || 0) || [1]), 1);
    const baseColors = ['bg-blue-100 border-blue-500 text-blue-700', 'bg-emerald-100 border-emerald-500 text-emerald-700', 'bg-orange-100 border-orange-500 text-orange-700', 'bg-purple-100 border-purple-500 text-purple-700'];
    const standardFunnelEvents = ['PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'AddPaymentInfo', 'Purchase', 'Lead', 'CompleteRegistration', 'Search', 'AddToWishlist'];

    return (
        <motion.div {...tabTransition} className="space-y-8">
            <ConfigMetricsModal isOpen={isConfigDashOpen} onClose={() => setIsConfigDashOpen(false)} config={dashboardConfig} setConfig={setDashboardConfig} cardProps={cardProps} />

            {/* Header com filtros */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-200 pb-4 gap-4">
                <div>
                    <h2 className="text-xl font-black text-slate-800">Seu Dashboard Personalizado</h2>
                    <p className="text-sm text-slate-500 mt-1">Acompanhe as métricas de performance e funil da operação em tempo real.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
                    <select 
                        value={activeProvider} 
                        onChange={(e) => aplicarFiltroData(dashDateRange, e.target.value)}
                        className="bg-white border border-slate-200 text-slate-600 font-bold text-xs rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all cursor-pointer h-10 w-full sm:w-auto"
                    >
                        <option value="all">Todos os Provedores</option>
                        <option value="meta">Meta Pixel</option>
                        <option value="google">Google Analytics</option>
                        <option value="tiktok">TikTok Pixel</option>
                        <option value="pinterest">Pinterest Tag</option>
                    </select>

                    <div className="relative w-full sm:w-auto shrink-0 z-[100]">
                        <button onClick={() => setDashDateOpen(!dashDateOpen)} className="flex items-center justify-center gap-2 px-4 h-10 bg-white border border-slate-200 rounded-xl shadow-sm hover:text-blue-600 hover:border-blue-300 transition-all w-full">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-bold text-slate-600">{dashFilterText || "Definir período"}</span>
                        </button>
                        <DateFilterPopup 
                            isOpen={dashDateOpen} 
                            onClose={() => setDashDateOpen(false)} 
                            dateRange={dashDateRange} 
                            setDateRange={setDashDateRange} 
                            loading={isUpdating && dashDateOpen}
                            onClear={() => aplicarFiltroData({ start: '', end: '' })}
                            onApply={() => { 
                              if(dashDateRange.start && dashDateRange.end) {
                                aplicarFiltroData(dashDateRange);
                              }
                            }}
                        />
                    </div>

                    <button onClick={() => setIsConfigDashOpen(true)} className="flex items-center justify-center w-10 h-10 bg-white text-slate-600 rounded-xl border border-slate-200 shadow-sm hover:text-blue-600 hover:border-blue-300 transition-all flex-shrink-0" title="Personalizar Painel">
                        <Settings2 className="w-4 h-4"/>
                    </button>
                </div>
            </div>

            {/* MetricsRail */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm w-full overflow-hidden">
                <div className="flex overflow-x-auto thin-scroll divide-x divide-slate-100">
                    {/* EMQ Cell */}
                    <div className="flex flex-col justify-center px-6 py-4 shrink-0 w-[200px] bg-white relative">
                        <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">EMQ</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${credenciais?.meta_access_token ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                {credenciais?.meta_access_token ? '10/10' : '0/10'}
                            </span>
                        </div>
                        <p className="text-xl font-bold text-slate-900 leading-none mb-1">
                            {credenciais?.meta_access_token ? 'Extrema' : 'Baixa'}
                        </p>
                        <p className="text-xs text-slate-500">
                            {credenciais?.meta_access_token ? 'CAPI conectada' : 'Token faltando'}
                        </p>
                    </div>

                    {/* Skeleton */}
                    {isManualRefresh && dashboardConfig.map(key => (
                        <div key={`sk-${key}`} className="shrink-0 w-[200px] px-6 py-4 animate-pulse bg-white">
                            <div className="h-3 bg-slate-200 rounded w-1/2 mb-3" />
                            <div className="h-6 bg-slate-100 rounded w-3/4 mb-2" />
                        </div>
                    ))}

                    {/* Métricas */}
                    {!isManualRefresh && dashboardConfig.map((key) => {
                        const conf = cardProps[key];
                        if (!conf) return null;
                        const IconComp = conf.icon;
                        const isActive = metricFilter === key;
                        const clickable = isMetricClickable(key, conf);

                        return (
                            <motion.div
                                key={key}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => clickable ? setMetricFilter(isActive ? null : key) : null}
                                title={conf.tooltip}
                                className={[
                                    'group relative shrink-0 w-[200px] px-6 py-4 bg-white transition-all duration-200 overflow-hidden',
                                    clickable ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-sm z-10' : 'cursor-default',
                                    isActive ? 'bg-blue-50/50' : '',
                                    metricFilter && !isActive ? 'opacity-50' : '',
                                ].join(' ')}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeMetricBar"
                                        className="absolute top-0 left-0 right-0 h-1 bg-blue-500"
                                    />
                                )}

                                <div className="flex items-center gap-1.5 mb-2">
                                    <IconComp className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-500' : conf.color}`} />
                                    <span className={`text-xs font-semibold uppercase tracking-wider ${isActive ? 'text-blue-700' : 'text-slate-500 group-hover:text-slate-700'}`}>
                                        {conf.label}
                                    </span>
                                </div>

                                <p className={`text-xl font-bold tracking-tight leading-none truncate ${isActive ? 'text-blue-700' : 'text-slate-900'}`}>
                                    {conf.valor}
                                </p>

                                {clickable && !isActive && (
                                    <span className="absolute bottom-2 right-3 text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        Filtro ↵
                                    </span>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Funil Real de Eventos */}
            <div className="bg-white p-6 md:p-8 rounded-[24px] border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-blue-500" /> Funil Real de Eventos
                </h3>
                <div className="flex flex-col gap-4">
                    {funnelData.map((etapa, idx) => {
                        const widthPct = Math.max(5, ((etapa.total || 0) / maxEventos) * 100);
                        const isStandard = standardFunnelEvents.includes(etapa.evento);
                        const corSelecionada = isStandard ? baseColors[idx % baseColors.length] : 'bg-slate-100 border-slate-500 text-slate-700';
                        const isHighlighted = isFunnelHighlighted(etapa);

                        return (
                            <div key={idx} className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 transition-opacity duration-300 ${isHighlighted ? 'opacity-100' : 'opacity-30'}`}>
                                <div className="w-full sm:w-56 text-left sm:text-right flex-shrink-0 flex items-center sm:justify-end gap-2">
                                    {!isStandard && <span className="text-[8px] bg-slate-800 text-white px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Custom</span>}
                                    <span className="text-xs font-bold text-slate-600 font-mono tracking-tight">{etapa.evento}</span>
                                </div>
                                <div className="flex-1 h-10 bg-slate-50 rounded-lg sm:rounded-r-xl flex items-center relative overflow-hidden shadow-inner">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${widthPct}%` }} transition={{ duration: 0.32, delay: idx * 0.05 }} className={`absolute left-0 top-0 h-full border-r-4 ${corSelecionada.split(' ')[0]} ${corSelecionada.split(' ')[1]}`} />
                                    <span className={`relative z-10 ml-4 font-black text-sm ${corSelecionada.split(' ')[2]}`}>{etapa.total || 0}</span>
                                </div>
                            </div>
                        );
                    })}
                    {funnelData.length === 0 && <p className="text-center text-slate-400 text-sm py-4">Nenhum evento captado pela base de dados.</p>}
                </div>
            </div>
        </motion.div>
    );
};

export default DashboardPixels;
