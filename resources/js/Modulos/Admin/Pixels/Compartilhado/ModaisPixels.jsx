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
                    style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <div
                        style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 16 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 16 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '64rem', height: 'min(600px, calc(100dvh - 2rem))' }}
                        className="bg-white rounded-[24px] shadow-2xl flex flex-col md:flex-row overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Coluna esquerda — lista de métricas */}
                        <div className="w-full md:w-1/2 flex flex-col border-r border-slate-100 min-h-0">
                            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                    <Settings2 className="w-5 h-5 text-blue-600" /> Métricas e Eventos Ativos
                                </h2>
                                <button onClick={onClose} className="md:hidden p-1 text-slate-400 hover:bg-slate-200 rounded-full">
                                    <X className="w-5 h-5"/>
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
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
                                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${isChecked ? 'bg-blue-50/50 border-blue-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                                        >
                                            <div className={`w-5 h-5 rounded flex items-center justify-center border shrink-0 ${isChecked ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                                                {isChecked && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            <span className={`text-sm font-bold flex-1 ${isChecked ? 'text-blue-900' : 'text-slate-700'}`}>{conf.label}</span>
                                            {conf.icon && <conf.icon className={`w-4 h-4 ${isChecked ? 'text-blue-500' : 'text-slate-400'}`} />}
                                            {isChecked && (
                                                <div className="flex flex-col ml-2 border-l border-blue-200 pl-2" onClick={e => e.stopPropagation()}>
                                                    <button
                                                        onClick={(e) => moveMetric(configIndex, 'up', e)}
                                                        disabled={configIndex === 0}
                                                        className={`p-0.5 rounded transition-colors ${configIndex === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
                                                    >
                                                        <svg className="w-3 h-3 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                                                    </button>
                                                    <button
                                                        onClick={(e) => moveMetric(configIndex, 'down', e)}
                                                        disabled={configIndex === config.length - 1}
                                                        className={`p-0.5 rounded transition-colors ${configIndex === config.length - 1 ? 'text-slate-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
                                                    >
                                                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Coluna direita — preview da métrica */}
                        <div className="w-full md:w-1/2 bg-slate-50 p-8 flex-col justify-center relative hidden md:flex min-h-0 overflow-y-auto">
                            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-colors">
                                <X className="w-5 h-5"/>
                            </button>
                            <AnimatePresence mode="wait">
                                {hoveredMetric && cardProps[hoveredMetric] ? (
                                    <motion.div
                                        key={hoveredMetric}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.15 }}
                                        className="flex flex-col"
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-white bg-white ${cardProps[hoveredMetric].color}`}>
                                            {cardProps[hoveredMetric].icon && React.createElement(cardProps[hoveredMetric].icon, { className: "w-7 h-7" })}
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 mb-2">{cardProps[hoveredMetric].label}</h3>
                                        <p className="text-slate-600 leading-relaxed text-sm mb-6">{cardProps[hoveredMetric].tooltip}</p>
                                        <div className="bg-blue-100/50 border border-blue-200 p-4 rounded-xl">
                                            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-widest block mb-1">Cálculo Interno / Fonte</span>
                                            <span className="font-mono text-xs text-blue-900 font-semibold">{cardProps[hoveredMetric].formula}</span>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-center flex flex-col items-center opacity-50"
                                    >
                                        <Info className="w-12 h-12 text-slate-400 mb-4" />
                                        <p className="text-slate-500 font-medium">Passe o mouse sobre uma métrica para ver sua definição e cálculo exato.</p>
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row h-[600px]">
                
                <div className="w-full md:w-1/2 flex flex-col border-r border-slate-100">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2"><BookMarked className="w-5 h-5 text-blue-600" /> Catálogo de Métricas</h2>
                        <button onClick={onClose} className="md:hidden p-1 text-slate-400 hover:bg-slate-200 rounded-full"><X className="w-5 h-5"/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {['KPIs Executivos', 'Funil & Conversão', 'Tracking Health'].map(group => (
                            <div key={group}>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">{group}</h3>
                                <div className="space-y-2">
                                    {dictionaryData.filter(d => d.group === group).map(item => (
                                        <div 
                                            key={item.id} 
                                            onMouseEnter={() => setHoveredItem(item)}
                                            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                                        >
                                            <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
                                            <span className="text-sm font-bold flex-1 text-slate-700">{item.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-full md:w-1/2 bg-slate-50 p-8 flex flex-col justify-center relative hidden md:flex">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5"/></button>
                    <AnimatePresence mode="wait">
                        {hoveredItem ? (
                            <motion.div key={hoveredItem.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-200 bg-white">
                                    <BookMarked className="w-7 h-7 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">{hoveredItem.title}</h3>
                                <p className="text-slate-600 leading-relaxed text-sm mb-6">{hoveredItem.desc}</p>
                                <div className="bg-blue-100/50 border border-blue-200 p-4 rounded-xl">
                                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-widest block mb-1">Cálculo Interno / Fórmula</span>
                                    <span className="font-mono text-xs text-blue-900 font-semibold">{hoveredItem.formula}</span>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center flex flex-col items-center opacity-50">
                                <Info className="w-12 h-12 text-slate-400 mb-4" />
                                <p className="text-slate-500 font-medium">Passe o mouse sobre um item do catálogo para ver sua definição detalhada.</p>
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
          <div className="fixed inset-0 z-[90]" onClick={(e) => { e.stopPropagation(); onClose(); }} aria-hidden="true"></div>
          <motion.div 
             initial={{ opacity: 0, y: 10, scale: 0.95 }} 
             animate={{ opacity: 1, y: 0, scale: 1 }} 
             exit={{ opacity: 0, y: 10, scale: 0.95 }} 
             transition={{ duration: 0.2, ease: "easeOut" }}
             className="absolute right-0 top-full mt-2 origin-top-right bg-white border border-slate-200 rounded-3xl shadow-2xl p-5 w-80 z-[100]" 
             role="dialog" aria-modal="true" aria-label="Filtrar Período"
          >
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2"><Calendar className="w-4 h-4"/> Filtrar Período</p>
            <div className="space-y-4">
              <div className="relative z-10">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Data Inicial</label>
                  <input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-800 transition-all cursor-pointer" />
              </div>
              <div className="relative z-10">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Data Final</label>
                  <input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-800 transition-all cursor-pointer" />
              </div>
              <div className="pt-2 flex gap-2 relative z-10">
                <button type="button" onClick={onClear} disabled={loading} className="w-1/3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm py-2.5 rounded-xl border border-slate-200 shadow-sm transition-colors flex justify-center items-center h-10">
                    Limpar
                </button>
                <button type="button" onClick={onApply} disabled={loading} className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 rounded-xl shadow-sm transition-colors flex justify-center items-center h-10">
                    {loading ? <PixelIcons.Spinner className="w-5 h-5 text-white/80" /> : 'Aplicar Filtro'}
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
            <motion.div initial={{ opacity: 0, y: -50, scale: 0.9 }} animate={{ opacity: 1, y: 20, scale: 1 }} exit={{ opacity: 0, y: -50, scale: 0.9 }} className="fixed top-4 right-4 z-[999999] bg-white rounded-[20px] shadow-xl border border-slate-200 p-3 flex items-center gap-4 min-w-[300px]" role="alert">
                <div className="relative w-10 h-10 flex-shrink-0 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center">
                    {status === 'loading' ? <PixelIcons.Spinner className="text-blue-500 w-5 h-5" /> : status === 'error' ? <AlertTriangle className="text-rose-500 w-5 h-5"/> : <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-500"><Check className="w-5 h-5"/></motion.div>}
                </div>
                <div className="pr-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{status === 'loading' ? 'A Processar...' : status === 'error' ? 'Atenção' : 'Concluído'}</p>
                    <p className="text-sm font-black text-slate-800 line-clamp-1">{titulo}</p>
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
                <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center mt-6 shadow-sm">
                    <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-rose-900 mb-2">Erro de Renderização do Tracking</h3>
                    <p className="text-sm text-rose-700 max-w-lg mx-auto mb-6">Encontramos uma falha estrutural. Verifique a base de dados ou tente novamente.<br/><code className="bg-white px-2 py-1 rounded mt-2 block text-xs overflow-auto border border-rose-100">{this.state.errorInfo}</code></p>
                    <button onClick={() => window.location.reload()} className="bg-rose-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md hover:bg-rose-700 transition-colors">Recarregar</button>
                </div>
            );
        }
        return this.props.children;
    }
}
