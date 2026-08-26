// ============================================================================
// FICHEIRO: resources/js/Modulos/Admin/Pixels/Compartilhado/ModaisPixels.jsx
// Modais específicos do módulo de Tracking
// ============================================================================
import React, { useState, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, X, Check, Info, BookMarked, AlertTriangle, Calendar } from 'lucide-react';
import { dictionaryData } from './ConstantesPixels';
import { PixelIcons } from './ComponentesUIPixels';

// --- Modal de Configuração de Métricas do Dashboard ---
export const ConfigMetricsModal = ({ isOpen, onClose, config, setConfig, cardProps }) => {
    const [hoveredMetric, setHoveredMetric] = useState(null);

    const toggleMetric = (key) => {
        if (config.includes(key)) setConfig(config.filter(k => k !== key));
        else setConfig([...config, key]);
    };

    const moveMetric = (index, direction, e) => {
        e.stopPropagation();
        const newConfig = [...config];
        if (direction === 'up' && index > 0) {
            [newConfig[index - 1], newConfig[index]] = [newConfig[index], newConfig[index - 1]];
            setConfig(newConfig);
        } else if (direction === 'down' && index < config.length - 1) {
            [newConfig[index + 1], newConfig[index]] = [newConfig[index], newConfig[index + 1]];
            setConfig(newConfig);
        }
    };

    const unselectedKeys = Object.keys(cardProps).filter(k => !config.includes(k));
    const displayKeys = [...config, ...unselectedKeys];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <div
                        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 16 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 16 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '1024px', height: 'min(600px, calc(100vh - 32px))', backgroundColor: 'var(--hub-background)', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', overflow: 'hidden' }}
                        className="modal-responsive-flex"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Coluna esquerda — lista de métricas */}
                        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--hub-border)', minHeight: 0 }} className="modal-col-left">
                            <div style={{ padding: '20px', borderBottom: '1px solid var(--hub-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--hub-surface)', flexShrink: 0 }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--hub-text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                    <Settings2 size={20} style={{ color: '#2563eb' }} /> Métricas e Eventos Ativos
                                </h2>
                                <button onClick={onClose} className="md-hidden" style={{ padding: '4px', color: 'var(--hub-text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '50%' }}>
                                    <X size={20}/>
                                </button>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }} className="custom-scrollbar">
                                {displayKeys.map(key => {
                                    if (!cardProps[key]) return null;
                                    const conf = cardProps[key];
                                    const isChecked = config.includes(key);
                                    const configIndex = config.indexOf(key);

                                    return (
                                        <div
                                            key={key}
                                            onMouseEnter={() => setHoveredMetric(key)}
                                            onClick={() => toggleMetric(key)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', border: `1px solid ${isChecked ? '#bfdbfe' : 'var(--hub-border)'}`, backgroundColor: isChecked ? '#eff6ff' : 'var(--hub-background)' }}
                                        >
                                            <div style={{ width: '20px', height: '20px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${isChecked ? '#2563eb' : 'var(--hub-border)'}`, backgroundColor: isChecked ? '#2563eb' : 'var(--hub-background)' }}>
                                                {isChecked && <Check size={12} style={{ color: '#fff' }} />}
                                            </div>
                                            <span style={{ fontSize: '14px', fontWeight: 'bold', flex: 1, color: isChecked ? '#1e3a8a' : 'var(--hub-text-primary)' }}>{conf.label}</span>
                                            {conf.icon && <conf.icon size={16} style={{ color: isChecked ? '#3b82f6' : 'var(--hub-text-secondary)' }} />}
                                            {isChecked && (
                                                <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '8px', borderLeft: '1px solid #bfdbfe', paddingLeft: '8px' }} onClick={e => e.stopPropagation()}>
                                                    <button
                                                        onClick={(e) => moveMetric(configIndex, 'up', e)}
                                                        disabled={configIndex === 0}
                                                        style={{ padding: '2px', borderRadius: '4px', background: 'transparent', border: 'none', cursor: configIndex === 0 ? 'not-allowed' : 'pointer', color: configIndex === 0 ? '#cbd5e1' : '#2563eb' }}
                                                    >
                                                        <svg style={{ width: '12px', height: '12px', transform: 'rotate(180deg)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                                                    </button>
                                                    <button
                                                        onClick={(e) => moveMetric(configIndex, 'down', e)}
                                                        disabled={configIndex === config.length - 1}
                                                        style={{ padding: '2px', borderRadius: '4px', background: 'transparent', border: 'none', cursor: configIndex === config.length - 1 ? 'not-allowed' : 'pointer', color: configIndex === config.length - 1 ? '#cbd5e1' : '#2563eb' }}
                                                    >
                                                        <svg style={{ width: '12px', height: '12px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Coluna direita — preview da métrica */}
                        <div className="modal-col-right md-flex" style={{ flex: '1', backgroundColor: 'var(--hub-surface)', padding: '32px', display: 'none', flexDirection: 'column', justifyContent: 'center', position: 'relative', minHeight: 0, overflowY: 'auto' }}>
                            <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', padding: '8px', color: 'var(--hub-text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '50%' }}>
                                <X size={20}/>
                            </button>
                            <AnimatePresence mode="wait">
                                {hoveredMetric && cardProps[hoveredMetric] ? (
                                    <motion.div
                                        key={hoveredMetric}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.15 }}
                                        style={{ display: 'flex', flexDirection: 'column' }}
                                    >
                                        <div style={{ width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #fff', backgroundColor: '#fff', color: '#0f172a' }} className={cardProps[hoveredMetric].color}>
                                            {cardProps[hoveredMetric].icon && React.createElement(cardProps[hoveredMetric].icon, { size: 28 })}
                                        </div>
                                        <h3 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--hub-text-primary)', marginBottom: '8px', margin: 0 }}>{cardProps[hoveredMetric].label}</h3>
                                        <p style={{ color: 'var(--hub-text-secondary)', lineHeight: 1.6, fontSize: '14px', marginBottom: '24px', margin: 0 }}>{cardProps[hoveredMetric].tooltip}</p>
                                        <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px', borderRadius: '12px' }}>
                                            <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Cálculo Interno / Fonte</span>
                                            <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#1e3a8a', fontWeight: 'bold' }}>{cardProps[hoveredMetric].formula}</span>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.5 }}
                                    >
                                        <Info size={48} style={{ color: 'var(--hub-text-secondary)', marginBottom: '16px' }} />
                                        <p style={{ color: 'var(--hub-text-secondary)', fontWeight: 500, margin: 0 }}>Passe o mouse sobre uma métrica para ver sua definição e cálculo exato.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// --- Modal do Catálogo de Métricas (Dicionário de Dados) ---
export const MetricsDictionaryModal = ({ isOpen, onClose }) => {
    const [hoveredItem, setHoveredItem] = useState(null);
    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} style={{ position: 'relative', backgroundColor: 'var(--hub-background)', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', width: '100%', maxWidth: '1024px', overflow: 'hidden', display: 'flex', height: '600px' }} className="modal-responsive-flex">
                
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--hub-border)' }} className="modal-col-left">
                    <div style={{ padding: '20px', borderBottom: '1px solid var(--hub-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--hub-surface)' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--hub-text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}><BookMarked size={20} style={{ color: '#2563eb' }} /> Catálogo de Métricas</h2>
                        <button onClick={onClose} className="md-hidden" style={{ padding: '4px', color: 'var(--hub-text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '50%' }}><X size={20}/></button>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }} className="custom-scrollbar">
                        {['KPIs Executivos', 'Funil & Conversão', 'Tracking Health'].map(group => (
                            <div key={group}>
                                <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--hub-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', padding: '0 8px', margin: '0 0 8px 0' }}>{group}</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {dictionaryData.filter(d => d.group === group).map(item => (
                                        <div 
                                            key={item.id} 
                                            onMouseEnter={() => setHoveredItem(item)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid var(--hub-border)', backgroundColor: 'var(--hub-background)' }}
                                            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--hub-border-subtle)'; e.currentTarget.style.backgroundColor = 'var(--hub-surface)'; }}
                                            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--hub-border)'; e.currentTarget.style.backgroundColor = 'var(--hub-background)'; }}
                                        >
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6', flexShrink: 0 }}></div>
                                            <span style={{ fontSize: '14px', fontWeight: 'bold', flex: 1, color: 'var(--hub-text-primary)' }}>{item.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="modal-col-right md-flex" style={{ flex: '1', backgroundColor: 'var(--hub-surface)', padding: '32px', display: 'none', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
                    <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', padding: '8px', color: 'var(--hub-text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '50%' }}><X size={20}/></button>
                    <AnimatePresence mode="wait">
                        {hoveredItem ? (
                            <motion.div key={hoveredItem.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid var(--hub-border-subtle)', backgroundColor: 'var(--hub-background)' }}>
                                    <BookMarked size={28} style={{ color: '#2563eb' }} />
                                </div>
                                <h3 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--hub-text-primary)', marginBottom: '8px', margin: 0 }}>{hoveredItem.title}</h3>
                                <p style={{ color: 'var(--hub-text-secondary)', lineHeight: 1.6, fontSize: '14px', marginBottom: '24px', margin: 0 }}>{hoveredItem.desc}</p>
                                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px', borderRadius: '12px' }}>
                                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Cálculo Interno / Fórmula</span>
                                    <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#1e3a8a', fontWeight: 'bold' }}>{hoveredItem.formula}</span>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.5 }}>
                                <Info size={48} style={{ color: 'var(--hub-text-secondary)', marginBottom: '16px' }} />
                                <p style={{ color: 'var(--hub-text-secondary)', fontWeight: 500, margin: 0 }}>Passe o mouse sobre um item do catálogo para ver sua definição detalhada.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

// --- Popup de Filtro de Data ---
export const DateFilterPopup = ({ dateRange, setDateRange, onApply, onClear, loading, isOpen, onClose }) => {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={(e) => { e.stopPropagation(); onClose(); }} aria-hidden="true"></div>
          <motion.div 
             initial={{ opacity: 0, y: 10, scale: 0.95 }} 
             animate={{ opacity: 1, y: 0, scale: 1 }} 
             exit={{ opacity: 0, y: 10, scale: 0.95 }} 
             transition={{ duration: 0.2, ease: "easeOut" }}
             style={{ position: 'absolute', right: 0, top: '100%', marginTop: '8px', transformOrigin: 'top right', backgroundColor: 'var(--hub-background)', border: '1px solid var(--hub-border)', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', padding: '20px', width: '320px', zIndex: 100 }} 
             role="dialog" aria-modal="true" aria-label="Filtrar Período"
          >
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--hub-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0' }}><Calendar size={16}/> Filtrar Período</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ position: 'relative', zIndex: 10 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--hub-text-primary)', marginBottom: '6px' }}>Data Inicial</label>
                  <input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} style={{ width: '100%', backgroundColor: 'var(--hub-surface)', border: '1px solid var(--hub-border)', borderRadius: '12px', padding: '8px 12px', fontSize: '14px', outline: 'none', fontWeight: 500, color: 'var(--hub-text-primary)', transition: 'all 0.2s', cursor: 'pointer' }} />
              </div>
              <div style={{ position: 'relative', zIndex: 10 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--hub-text-primary)', marginBottom: '6px' }}>Data Final</label>
                  <input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} style={{ width: '100%', backgroundColor: 'var(--hub-surface)', border: '1px solid var(--hub-border)', borderRadius: '12px', padding: '8px 12px', fontSize: '14px', outline: 'none', fontWeight: 500, color: 'var(--hub-text-primary)', transition: 'all 0.2s', cursor: 'pointer' }} />
              </div>
              <div style={{ paddingTop: '8px', display: 'flex', gap: '8px', position: 'relative', zIndex: 10 }}>
                <button type="button" onClick={onClear} disabled={loading} style={{ width: '33.33%', backgroundColor: 'var(--hub-surface)', color: 'var(--hub-text-primary)', fontWeight: 'bold', fontSize: '14px', padding: '10px', borderRadius: '12px', border: '1px solid var(--hub-border)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'background-color 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40px', cursor: 'pointer' }}>
                    Limpar
                </button>
                <button type="button" onClick={onApply} disabled={loading} style={{ width: '66.66%', backgroundColor: 'var(--hub-accent)', color: '#fff', fontWeight: 'bold', fontSize: '14px', padding: '10px', borderRadius: '12px', border: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'background-color 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40px', cursor: 'pointer' }}>
                    {loading ? <PixelIcons.Spinner size={20} style={{ color: 'rgba(255,255,255,0.8)' }} /> : 'Aplicar Filtro'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- Notificação Animada (Toast) ---
export const PixelNotification = ({ show, status, titulo }) => (
    <AnimatePresence>
        {show && (
            <motion.div initial={{ opacity: 0, y: -50, scale: 0.9 }} animate={{ opacity: 1, y: 20, scale: 1 }} exit={{ opacity: 0, y: -50, scale: 0.9 }} style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 999999, backgroundColor: 'var(--hub-background)', borderRadius: '20px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', border: '1px solid var(--hub-border)', padding: '12px', display: 'flex', alignItems: 'center', gap: '16px', minWidth: '300px' }} role="alert">
                <div style={{ position: 'relative', width: '40px', height: '40px', flexShrink: 0, backgroundColor: 'var(--hub-surface)', border: '1px solid var(--hub-border-subtle)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {status === 'loading' ? <PixelIcons.Spinner style={{ color: '#3b82f6', width: '20px', height: '20px' }} /> : status === 'error' ? <AlertTriangle size={20} style={{ color: '#f43f5e' }}/> : <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ color: '#10b981' }}><Check size={20}/></motion.div>}
                </div>
                <div style={{ paddingRight: '16px' }}>
                    <p style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--hub-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 2px 0' }}>{status === 'loading' ? 'A Processar...' : status === 'error' ? 'Atenção' : 'Concluído'}</p>
                    <p style={{ fontSize: '14px', fontWeight: 900, color: 'var(--hub-text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{titulo}</p>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

// --- Error Boundary específico de Pixels ---
export class PixelErrorBoundary extends Component {
    constructor(props) { super(props); this.state = { hasError: false, errorInfo: null }; }
    static getDerivedStateFromError(error) { return { hasError: true }; }
    componentDidCatch(error, errorInfo) { this.setState({ errorInfo: error.toString() }); }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '32px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '16px', textAlign: 'center', marginTop: '24px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <AlertTriangle size={48} style={{ color: '#f43f5e', margin: '0 auto 16px auto' }} />
                    <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#881337', marginBottom: '8px', margin: '0 0 8px 0' }}>Erro de Renderização do Tracking</h3>
                    <p style={{ fontSize: '14px', color: '#be123c', maxWidth: '32rem', margin: '0 auto 24px auto' }}>Encontramos uma falha estrutural. Verifique a base de dados ou tente novamente.<br/><code style={{ backgroundColor: '#fff', padding: '4px 8px', borderRadius: '4px', marginTop: '8px', display: 'block', fontSize: '12px', overflow: 'auto', border: '1px solid #ffe4e6' }}>{this.state.errorInfo}</code></p>
                    <button onClick={() => window.location.reload()} style={{ backgroundColor: '#e11d48', color: '#fff', fontWeight: 'bold', padding: '10px 24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', cursor: 'pointer', border: 'none' }}>Recarregar</button>
                </div>
            );
        }
        return this.props.children;
    }
}

