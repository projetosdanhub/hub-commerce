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
            <div className="hub-dashboard-header">
                <div>
                    <h2 className="hub-card-title">Seu Dashboard Personalizado</h2>
                    <p className="hub-page-subtitle">Acompanhe as métricas de performance e funil da operação em tempo real.</p>
                </div>
                <div className="hub-dashboard-filters">
                    <select 
                        value={activeProvider} 
                        onChange={(e) => aplicarFiltroData(dashDateRange, e.target.value)}
                        className="hub-select"
                        style={{ width: '100%', minWidth: '200px' }}
                    >
                        <option value="all">Todos os Provedores</option>
                        <option value="meta">Meta Pixel</option>
                        <option value="google">Google Analytics</option>
                        <option value="tiktok">TikTok Pixel</option>
                        <option value="pinterest">Pinterest Tag</option>
                    </select>

                    <div style={{ position: 'relative', width: '100%', zIndex: 100 }}>
                        <button onClick={() => setDashDateOpen(!dashDateOpen)} className="hub-btn hub-btn-outline" style={{ width: '100%' }}>
                            <Calendar style={{ width: '16px', height: '16px', color: 'var(--hub-text-muted)' }} />
                            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{dashFilterText || "Definir período"}</span>
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

                    <button onClick={() => setIsConfigDashOpen(true)} className="hub-btn hub-btn-outline hub-btn-icon" title="Personalizar Painel">
                        <Settings2 style={{ width: '16px', height: '16px' }}/>
                    </button>
                </div>
            </div>

            {/* MetricsRail */}
            <div className="hub-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="hub-metrics-rail thin-scroll">
                    {/* EMQ Cell */}
                    <div className="hub-metric-item" style={{ width: '200px', backgroundColor: 'var(--hub-surface)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--hub-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>EMQ</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${credenciais?.meta_access_token ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                {credenciais?.meta_access_token ? '10/10' : '0/10'}
                            </span>
                        </div>
                        <p style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--hub-text-primary)', lineHeight: 1, marginBottom: '4px', margin: 0 }}>
                            {credenciais?.meta_access_token ? 'Extrema' : 'Baixa'}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--hub-text-secondary)', margin: 0 }}>
                            {credenciais?.meta_access_token ? 'CAPI conectada' : 'Token faltando'}
                        </p>
                    </div>

                    {/* Skeleton */}
                    {isManualRefresh && dashboardConfig.map(key => (
                        <div key={`sk-${key}`} style={{ flexShrink: 0, width: '200px', padding: '16px 24px', backgroundColor: 'var(--hub-surface)' }} className="animate-pulse">
                            <div style={{ height: '12px', backgroundColor: 'var(--hub-border)', borderRadius: '4px', width: '50%', marginBottom: '12px' }} />
                            <div style={{ height: '24px', backgroundColor: 'var(--hub-border-subtle)', borderRadius: '4px', width: '75%', marginBottom: '8px' }} />
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
                                className={`hub-metric-item ${clickable ? 'is-clickable' : ''} ${isActive ? 'is-active' : ''} ${metricFilter && !isActive ? 'is-dimmed' : ''}`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeMetricBar"
                                        className="hub-metric-active-bar"
                                    />
                                )}

                                <div className="hub-metric-title-wrap">
                                    <IconComp style={{ width: '14px', height: '14px', flexShrink: 0, color: isActive ? 'var(--hub-brand-primary)' : 'inherit' }} />
                                    <span className="hub-metric-title">
                                        {conf.label}
                                    </span>
                                </div>

                                <p className="hub-metric-value" style={{ color: isActive ? 'var(--hub-brand-primary)' : 'inherit' }}>
                                    {conf.valor}
                                </p>

                                {clickable && !isActive && (
                                    <span style={{ position: 'absolute', bottom: '8px', right: '12px', fontSize: '10px', color: 'var(--hub-text-muted)', opacity: 0 }} className="hub-hover-show transition-opacity">
                                        Filtro ↵
                                    </span>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Funil Real de Eventos */}
            <div className="hub-card">
                <h3 className="hub-card-title" style={{ marginBottom: '24px' }}>
                    <Filter style={{ width: '20px', height: '20px', color: 'var(--hub-brand-primary)' }} /> Funil Real de Eventos
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {funnelData.map((etapa, idx) => {
                        const widthPct = Math.max(5, ((etapa.total || 0) / maxEventos) * 100);
                        const isStandard = standardFunnelEvents.includes(etapa.evento);
                        
                        // Removendo baseColors do tailwind e aplicando cores em hexadecimal baseadas no padrão original
                        const colorsHex = [
                            { bg: 'rgba(219,234,254,0.5)', border: '#3b82f6', text: '#1d4ed8' }, // blue
                            { bg: 'rgba(209,250,229,0.5)', border: '#10b981', text: '#047857' }, // emerald
                            { bg: 'rgba(255,237,213,0.5)', border: '#f97316', text: '#c2410c' }, // orange
                            { bg: 'rgba(243,232,255,0.5)', border: '#a855f7', text: '#7e22ce' }  // purple
                        ];
                        const corSelecionada = isStandard ? colorsHex[idx % colorsHex.length] : { bg: 'var(--hub-bg-body)', border: 'var(--hub-text-secondary)', text: 'var(--hub-text-primary)' };
                        const isHighlighted = isFunnelHighlighted(etapa);

                        return (
                            <div key={idx} className="hub-funnel-row" style={{ opacity: isHighlighted ? 1 : 0.3 }}>
                                <div className="hub-funnel-label-col">
                                    {!isStandard && <span style={{ fontSize: '8px', backgroundColor: 'var(--hub-text-primary)', color: 'var(--hub-text-inverse)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}>Custom</span>}
                                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--hub-text-secondary)', fontFamily: 'monospace', letterSpacing: '-0.025em' }}>{etapa.evento}</span>
                                </div>
                                <div className="hub-funnel-bar-wrap">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${widthPct}%` }} transition={{ duration: 0.32, delay: idx * 0.05 }} className="hub-funnel-bar-fill" style={{ backgroundColor: corSelecionada.bg, borderColor: corSelecionada.border }} />
                                    <span style={{ position: 'relative', zIndex: 10, marginLeft: '16px', fontWeight: '900', fontSize: '14px', color: corSelecionada.text }}>{etapa.total || 0}</span>
                                </div>
                            </div>
                        );
                    })}
                    {funnelData.length === 0 && <p style={{ textAlign: 'center', color: 'var(--hub-text-muted)', fontSize: '14px', padding: '16px 0' }}>Nenhum evento captado pela base de dados.</p>}
                </div>
            </div>
        </motion.div>
    );
};

export default DashboardPixels;
