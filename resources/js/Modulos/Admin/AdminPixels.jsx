// ============================================================================
// FICHEIRO: resources/js/Modulos/Admin/AdminPixels.jsx
// ARQUITETURA: Tracking Hub Enterprise (Auto-Refresh Silencioso, Filtro CRM)
// ============================================================================
import React, { useState, useEffect, useRef, Component, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { QueryClientProvider, QueryClient, useQuery } from '@tanstack/react-query'; 

import { 
    Activity, Code2, Zap, CheckCircle2, Filter, Plus, Save, Info, BookOpen, 
    Trash2, Edit, Calendar, ArrowLeft, MousePointer2, Globe, ArrowDownToLine, 
    Clock, Eye, EyeOff, Lock, Unlock, Settings2, AppWindow, Database, 
    BookMarked, AlertTriangle, MousePointerClick, Check, ListFilter, Target, 
    X, Loader2, ChevronLeft, ChevronRight, Users, UserPlus, DollarSign, 
    TrendingUp, ShoppingCart, CreditCard, RotateCcw, Fingerprint, Server,
    Power, PowerOff
} from 'lucide-react';

import api from '../../api';

// 🟢 INICIALIZAÇÃO DO QUERY CLIENT
const queryClient = new QueryClient({
    defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 1000 * 60 * 5 } },
});

const Icons = {
    Spinner: ({ className }) => <Loader2 className={`animate-spin ${className}`} />,
    Filter: ({ className }) => <ListFilter className={className} />,
    Calendar: ({ className }) => <Calendar className={className} />,
    Info: ({ className }) => <Info className={className} />
};

// --- COMPONENTE PREMIUM: TOOLTIP SEGURO COM QUEBRA DE LINHA ---
const SafeTooltip = ({ children, text, title }) => (
    <div className="group relative flex items-center justify-center cursor-help">
        {children || <Icons.Info className="w-4 h-4 text-slate-400 hover:text-blue-500 transition-colors" />}
        <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[99999] w-max max-w-[250px] whitespace-normal bg-slate-800 text-white text-[10px] font-bold px-3 py-2 rounded-lg shadow-xl flex flex-col items-center text-center leading-relaxed border border-slate-700">
            {title && <span className="text-blue-300 mb-1 border-b border-slate-600 pb-1 w-full uppercase tracking-widest text-[9px]">{title}</span>}
            <span className="font-mono text-slate-200">{text}</span>
            <svg className="absolute text-slate-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
        </div>
    </div>
);

// --- COMPONENTE PREMIUM: BOTÃO DE SALVAR COM ANIMAÇÃO ---
const PremiumSaveButton = ({ onClick, loading, text, icon: Icon = Save, disabled = false, className = '' }) => (
    <button 
        type={onClick ? "button" : "submit"} 
        onClick={onClick} 
        disabled={loading || disabled} 
        className={`group relative overflow-hidden bg-slate-900 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70 ${className}`}
    >
        {loading ? <Icons.Spinner className="w-4 h-4 text-white" /> : <Icon className="w-4 h-4 group-hover:scale-110 transition-transform"/>}
        <span className="relative z-10">{loading ? "Processando..." : text}</span>
        {loading && <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2, ease: "linear", repeat: Infinity }} className="absolute left-0 bottom-0 h-1 bg-blue-500 z-0" />}
    </button>
);

const formatDateBR = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
};

const CustomStyles = () => (
    <style dangerouslySetInnerHTML={{__html: `
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .smart-flex-container { display: flex; flex-wrap: wrap; width: 100%; gap: 1px; }
        .smart-flex-item { flex: 1 1 240px; min-width: 200px; }
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
    `}} />
);

const tabTransition = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeInOut" } }
};

const AnimatedToggle = ({ active, onChange }) => (
    <button type="button" onClick={() => onChange(!active)} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
        <span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${active ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
);

const SecureInput = ({ value, onChange, placeholder, isToken = true }) => {
    const [isLocked, setIsLocked] = useState(true);
    const [showText, setShowText] = useState(false);
    return (
        <div className="relative flex items-center w-full">
            <input type={showText || !isToken ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={isLocked} className={`w-full border rounded-xl pl-4 pr-24 h-12 text-sm outline-none transition-all font-mono ${isLocked ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-blue-400 ring-2 ring-blue-100 text-slate-900'}`} />
            <div className="absolute right-2 flex items-center gap-1">
                {isToken && <button type="button" onClick={() => setShowText(!showText)} className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors">{showText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>}
                <button type="button" onClick={() => setIsLocked(!isLocked)} className={`p-1.5 transition-colors ${isLocked ? 'text-slate-400 hover:text-emerald-600' : 'text-emerald-500 hover:text-slate-500'}`}>{isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}</button>
            </div>
        </div>
    );
};

const HoverProgressRoundButton = ({ text, onClick, loading, icon: Icon, ariaLabel, isActive }) => {
    const [isHovered, setIsHovered] = useState(false);
    const shouldExpand = isHovered || isActive;

    return (
      <motion.button 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileTap={loading ? {} : { scale: 0.95 }} 
          onClick={onClick} 
          aria-label={ariaLabel}
          disabled={loading}
          animate={{ width: shouldExpand ? 'auto' : 48 }}
          className={`relative overflow-hidden h-12 rounded-full bg-white border shadow-sm flex items-center pl-[14px] pr-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-80 transition-colors z-10 ${shouldExpand ? 'border-blue-300 bg-slate-50' : 'border-slate-200'}`}
      >
          {loading && (
             <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 48 48">
                 <motion.circle cx="24" cy="24" r="22" fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="138" initial={{ strokeDashoffset: 138 }} animate={{ strokeDashoffset: 0 }} transition={{ duration: 1.5, ease: "linear" }} />
             </svg>
          )}
          <div className="relative z-10 flex items-center gap-2 whitespace-nowrap">
              {loading ? <Icons.Spinner className="w-5 h-5 text-blue-500 shrink-0" /> : <Icon className={`w-5 h-5 shrink-0 transition-colors ${shouldExpand ? 'text-blue-600' : 'text-slate-500'}`} />}
              <AnimatePresence>
                  {shouldExpand && !loading && (
                      <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="text-xs font-bold text-slate-700 truncate pr-2">
                          {text}
                      </motion.span>
                  )}
              </AnimatePresence>
          </div>
      </motion.button>
    );
};

const DateFilterPopup = ({ dateRange, setDateRange, onApply, onClear, loading, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={(e) => { e.stopPropagation(); onClose(); }} aria-hidden="true"></div>
          <motion.div 
             initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} 
             className="absolute right-0 top-full mt-2 origin-top-right bg-white border border-slate-200 rounded-3xl shadow-2xl p-5 w-80 z-[100]" 
             role="dialog" aria-modal="true" aria-label="Filtrar Período"
          >
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2"><Icons.Filter className="w-4 h-4"/> Filtrar Período</p>
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
                <button type="button" onClick={onClear} className="w-1/3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm py-2.5 rounded-xl border border-slate-200 shadow-sm transition-colors">Limpar</button>
                <button type="button" onClick={onApply} disabled={loading} className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 rounded-xl shadow-sm transition-colors">{loading ? 'Aplicando...' : 'Aplicar Filtro'}</button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const ConfigMetricsModal = ({ isOpen, onClose, config, setConfig, cardProps }) => {
    const [hoveredMetric, setHoveredMetric] = useState(null);
    if (!isOpen) return null;

    const toggleMetric = (key) => {
        if (config.includes(key)) setConfig(config.filter(k => k !== key));
        else setConfig([...config, key]);
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row h-[600px]">
                
                <div className="w-full md:w-1/2 flex flex-col border-r border-slate-100">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2"><Settings2 className="w-5 h-5 text-blue-600" /> Métricas e Eventos Ativos</h2>
                        <button onClick={onClose} className="md:hidden p-1 text-slate-400 hover:bg-slate-200 rounded-full"><X className="w-5 h-5"/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        {Object.keys(cardProps).map(key => {
                            const conf = cardProps[key];
                            const isChecked = config.includes(key);
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
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="w-full md:w-1/2 bg-slate-50 p-8 flex flex-col justify-center relative hidden md:flex">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5"/></button>
                    <AnimatePresence mode="wait">
                        {hoveredMetric && cardProps[hoveredMetric] ? (
                            <motion.div key={hoveredMetric} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col">
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
                            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center flex flex-col items-center opacity-50">
                                <Info className="w-12 h-12 text-slate-400 mb-4" />
                                <p className="text-slate-500 font-medium">Passe o mouse sobre uma métrica para ver sua definição e cálculo exato.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

const MetricsDictionaryModal = ({ isOpen, onClose }) => {
    const [aba, setAba] = useState('executivos');
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-2"><BookMarked className="w-6 h-6 text-blue-600" /> Catálogo de Métricas do Sistema</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5"/></button>
                </div>
                <div className="flex border-b border-slate-100 bg-slate-50/50 overflow-x-auto no-scrollbar">
                    {[{id: 'executivos', label: 'KPIs Executivos'}, {id: 'funil', label: 'Funil & Conversão'}, {id: 'qualidade', label: 'Tracking Health'}].map(tab => (
                        <button key={tab.id} onClick={() => setAba(tab.id)} className={`px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${aba === tab.id ? 'border-blue-600 text-blue-700 bg-white shadow-sm' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>{tab.label}</button>
                    ))}
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white space-y-6">
                    {aba === 'executivos' && (
                        <>
                            <div><h4 className="font-bold text-slate-800 text-sm">Receita Bruta Atribuída</h4><p className="text-sm text-slate-600 mt-1">Soma do valor bruto dos pedidos válidos no período. Não contabiliza pedidos "Cancelados" ou "Reembolsados".</p></div>
                            <div><h4 className="font-bold text-slate-800 text-sm">Receita Líquida</h4><p className="text-sm text-slate-600 mt-1">Receita bruta subtraindo-se o valor de devoluções, cancelamentos e estornos.</p></div>
                            <div><h4 className="font-bold text-slate-800 text-sm">Pedidos (Conversões)</h4><p className="text-sm text-slate-600 mt-1">Quantidade de pedidos confirmados/pagos lidos pelo banco de dados central (Fonte da Verdade).</p></div>
                            <div><h4 className="font-bold text-slate-800 text-sm">Ticket Médio (AOV)</h4><p className="text-sm text-slate-600 mt-1">Receita atribuída dividida pela quantidade de pedidos. Indica o gasto médio de cada cliente.</p></div>
                            <div><h4 className="font-bold text-slate-800 text-sm">CAC e ROAS</h4><p className="text-sm text-slate-600 mt-1">O Custo de Aquisição de Clientes (CAC) cruza o valor investido nas plataformas com os Novos Clientes captados. ROAS é o retorno bruto da campanha.</p></div>
                            <div><h4 className="font-bold text-slate-800 text-sm">LTV (Lifetime Value)</h4><p className="text-sm text-slate-600 mt-1">O valor estimado que cada cliente deixa na loja ao longo de sua vida útil.</p></div>
                        </>
                    )}
                    {aba === 'funil' && (
                        <>
                            <div><h4 className="font-bold text-slate-800 text-sm">Taxa de Conversão</h4><p className="text-sm text-slate-600 mt-1">Fórmula: <code className="bg-slate-100 px-1 rounded">(Compras ÷ PageViews) × 100</code>. Percentual de acessos que se tornaram receita real.</p></div>
                            <div><h4 className="font-bold text-slate-800 text-sm">Cart Abandonment Rate</h4><p className="text-sm text-slate-600 mt-1">Fórmula: <code className="bg-slate-100 px-1 rounded">(1 - (Compras ÷ AddToCart)) × 100</code>. Percentual de carrinhos que não finalizaram a compra.</p></div>
                            <div><h4 className="font-bold text-slate-800 text-sm">Checkout Abandonment</h4><p className="text-sm text-slate-600 mt-1">Fórmula: <code className="bg-slate-100 px-1 rounded">(1 - (Compras ÷ InitiateCheckout)) × 100</code>. Eficiência da página de pagamento.</p></div>
                        </>
                    )}
                    {aba === 'qualidade' && (
                        <>
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">Event Match Quality (EMQ) <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded">Avançado</span></h4>
                                <p className="text-sm text-slate-600 mt-1">Qualidade dos identificadores (E-mail, FBC, FBP) recebidos pelas plataformas. A HUB atinge nota máxima ao utilizar a CAPI Server-Side enriquecida com Hash SHA-256.</p>
                            </div>
                            <div><h4 className="font-bold text-slate-800 text-sm">Event Delivery Rate</h4><p className="text-sm text-slate-600 mt-1">Percentual de eventos processados e entregues com sucesso aos destinos (Meta, TikTok, GA4) driblando AdBlockers.</p></div>
                            <div><h4 className="font-bold text-slate-800 text-sm">Deduplication Rate</h4><p className="text-sm text-slate-600 mt-1">O motor da HUB gera um <code className="bg-slate-100 px-1 rounded">event_id</code> único no Front-End para garantir que disparos Simultâneos de Browser e Server não dupliquem dados no Pixel.</p></div>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

const AnimatedNotification = ({ show, status, titulo }) => (
    <AnimatePresence>
        {show && (
            <motion.div initial={{ opacity: 0, y: -50, scale: 0.9 }} animate={{ opacity: 1, y: 20, scale: 1 }} exit={{ opacity: 0, y: -50, scale: 0.9 }} className="fixed top-4 right-4 z-[999999] bg-white rounded-[20px] shadow-xl border border-slate-200 p-3 flex items-center gap-4 min-w-[300px]" role="alert">
                <div className="relative w-10 h-10 flex-shrink-0 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center">
                    {status === 'loading' ? <Icons.Spinner className="text-blue-500 w-5 h-5" /> : status === 'error' ? <AlertTriangle className="text-rose-500 w-5 h-5"/> : <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-500"><Check className="w-5 h-5"/></motion.div>}
                </div>
                <div className="pr-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{status === 'loading' ? 'A Processar...' : status === 'error' ? 'Atenção' : 'Concluído'}</p>
                    <p className="text-sm font-black text-slate-800 line-clamp-1">{titulo}</p>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

class PixelErrorBoundary extends Component {
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

// ============================================================================
// COMPONENTE PRINCIPAL (ADMIN PIXELS)
// ============================================================================
const AdminPixelsContent = () => {
    const [activeTab, setActiveTab] = useState('PAINEL');
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false); 
    const [isSaving, setIsSaving] = useState(false);
    
    // 🟢 NOTIFICAÇÕES GLOBAIS (TOAST)
    const [toast, setToast] = useState({ show: false, message: '', status: '' });
    const showToast = (message, status = 'success') => { setToast({ show: true, message, status }); setTimeout(() => setToast({ show: false, message: '', status: '' }), 3000); };
    
    const [credenciais, setCredenciais] = useState({ meta_pixel_id: '', meta_access_token: '', ga4_measurement_id: '', tiktok_pixel_id: '' });
    
    // Matriz Inicial de Eventos
    const initNativos = { pageView: true, viewContent: true, addToCart: true, addToWishlist: true, initiateCheckout: true, addPaymentInfo: true, purchase: true, completeRegistration: true, lead: true, contact: true, search: true, donate: true, customizeProduct: true, findLocation: true, schedule: true, startTrial: true, submitApplication: true, subscribe: true };
    const [eventosNativos, setEventosNativos] = useState(initNativos);
    
    const [dashboardData, setDashboardData] = useState({ funil: [], metrics: {} });
    const [acionadores, setAcionadores] = useState([]);
    
    const [paginaAtual, setPaginaAtual] = useState(1);
    const itensPorPagina = 5;
    
    const [dashDateOpen, setDashDateOpen] = useState(false);
    const [dashDateRange, setDashDateRange] = useState({ start: '', end: '' });
    const [dashFilterText, setDashFilterText] = useState('Últimos 7 Dias');
    const [isDictOpen, setIsDictOpen] = useState(false);
    
    // 🟢 SALVANDO CONFIGURAÇÃO DO DASHBOARD NO LOCALSTORAGE
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
    const [triggerForm, setTriggerForm] = useState({ id: null, nome: '', evento_selecionado: 'Lead', evento_custom: '', tipo_gatilho: 'click', valor_gatilho: '', url_alvo: '*', status: true, payload: {} });

    useEffect(() => {
        const hoje = new Date();
        const seteDiasAtras = new Date();
        seteDiasAtras.setDate(hoje.getDate() - 7);
        const formatData = (data) => data.toISOString().split('T')[0];
        
        const initRange = { start: formatData(seteDiasAtras), end: formatData(hoje) };
        setDashDateRange(initRange);
        setDashFilterText(`${formatDateBR(initRange.start)} até ${formatDateBR(initRange.end)}`);
        carregarTudo(initRange, false, false);
    }, []); 

    useEffect(() => {
        if (!dashDateRange.start && !dashDateRange.end) return;
        const interval = setInterval(() => { carregarTudo(dashDateRange, true, true); }, 15000);
        return () => clearInterval(interval);
    }, [dashDateRange]);

    const carregarTudo = async (datas, isBackground = false, isSilent = false, callback) => {
        if (!isBackground) setIsLoading(true);
        if (!isSilent) setIsUpdating(true);
        try {
            let dataInicio, dataFim;
            if (datas.start && datas.start.includes('-')) {
                dataInicio = `${datas.start}T00:00:00.000Z`;
                dataFim = `${datas.end}T23:59:59.999Z`;
            } else {
                 dataInicio = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString();
                 dataFim = new Date().toISOString();
            }

            const [reqSettings, reqDash, reqTriggers] = await Promise.all([
                api.get('/admin/tracking/settings'),
                api.get(`/admin/tracking/dashboard?inicio=${dataInicio}&fim=${dataFim}`),
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
        } catch (error) { console.error("Erro na API", error); } finally { 
            if (!isBackground) setIsLoading(false); 
            if (!isSilent) setIsUpdating(false);
            if(callback) callback(); 
        }
    };

    const aplicarFiltroData = (range, callback) => {
        if (!range.start || !range.end) {
            setDashFilterText('Últimos 7 Dias');
        } else {
            setDashFilterText(`${formatDateBR(range.start)} até ${formatDateBR(range.end)}`);
        }
        setDashDateOpen(false);
        carregarTudo(range, true, false, callback);
    };

    const handleRefreshManual = () => carregarTudo(dashDateRange, true, false);

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
            
            // Validação de Gatilho
            if (triggerForm.tipo_gatilho !== 'exit_intent' && !triggerForm.valor_gatilho.trim()) {
                showToast('O parâmetro do gatilho é obrigatório para esta regra.', 'error');
                setIsSaving(false); return;
            }

            const payload = {
                id: triggerForm.id, nome: triggerForm.nome, evento: eventoFinal.trim(), status: triggerForm.status,
                tipo_gatilho: triggerForm.tipo_gatilho, valor_gatilho: triggerForm.tipo_gatilho === 'exit_intent' ? '' : triggerForm.valor_gatilho, 
                url_alvo: triggerForm.url_alvo, payload: triggerForm.payload
            };
            await api.post('/admin/tracking/triggers', payload);
            setTriggerView('LIST');
            carregarTudo(dashDateRange, true, false);
            showToast('Regra de disparo salva com sucesso!');
        } catch (error) { showToast('Erro ao salvar acionador.', 'error'); } finally { setIsSaving(false); }
    };

    const handleDeletarAcionador = async (id) => {
        if (!window.confirm('Excluir este acionador permanentemente?')) return;
        try { 
            await api.delete(`/admin/tracking/triggers/${id}`); 
            carregarTudo(dashDateRange, true, false); 
            showToast('Acionador removido com sucesso!');
        } catch (error) { showToast('Erro ao deletar.', 'error'); }
    };

    const editTrigger = (acionador) => {
        const standardEvents = ['PageView','ViewContent','Search','AddToWishlist','AddToCart','InitiateCheckout','AddPaymentInfo','Purchase','Subscribe','StartTrial','CompleteRegistration','Contact','FindLocation','Schedule','CustomizeProduct','Donate','SubmitApplication','Lead'];
        const isStandard = standardEvents.includes(acionador.evento);
        setTriggerForm({ 
            ...acionador, 
            evento_selecionado: isStandard ? acionador.evento : 'CUSTOM', 
            evento_custom: isStandard ? '' : acionador.evento,
            url_alvo: acionador.url_alvo || '*',
            payload: acionador.payload || {}
        });
        setTriggerView('FORM');
    };

    // 🟢 FUNÇÃO DO BOTÃO GLOBAL DE EVENTOS NATIVOS
    const toggleAllNativos = (forceStatus) => {
        const chaves = Object.keys(initNativos);
        const novo = {};
        chaves.forEach(k => novo[k] = forceStatus);
        setEventosNativos(novo);
    };
    const isAllNativosAtivos = Object.values(eventosNativos).every(v => v === true);

    const indexUltimoAcionador = paginaAtual * itensPorPagina;
    const indexPrimeiroAcionador = indexUltimoAcionador - itensPorPagina;
    const acionadoresPaginados = acionadores.slice(indexPrimeiroAcionador, indexUltimoAcionador);
    const totalPaginas = Math.ceil(acionadores.length / itensPorPagina);

    // ============================================================================
    // DADOS DE REFERÊNCIA (PAYLOAD & GATILHOS)
    // ============================================================================
    const payloadCategories = [
        {
            title: '📡 Server-Side (CAPI Core)', desc: 'Obrigatórios para envio via servidor.', icon: Server, color: 'text-indigo-600', bg: 'bg-indigo-50/50', border: 'border-indigo-100',
            items: [
                { key: 'event_id', label: 'Event ID', tip: 'Código único para deduplicação (Browser x Server).' }, 
                { key: 'event_time', label: 'Event Time', tip: 'Timestamp UNIX de quando o evento ocorreu.' },
                { key: 'event_source_url', label: 'Source URL', tip: 'A URL exata onde o evento aconteceu.' }, 
                { key: 'action_source', label: 'Action Source', tip: 'Origem da ação (ex: website, app, physical_store).' },
                { key: 'client_ip_address', label: 'Endereço IP', tip: 'IP do cliente. Essencial para match de CAPI.' }, 
                { key: 'client_user_agent', label: 'User Agent', tip: 'Navegador e SO do cliente.' },
                { key: 'fbc', label: 'Click ID (fbc)', tip: 'Cookie do Facebook com o ID do clique do anúncio.' }, 
                { key: 'fbp', label: 'Browser ID (fbp)', tip: 'Cookie do Facebook que identifica o navegador.' },
                { key: 'opt_out', label: 'Opt Out', tip: 'Sinalizador de permissão de rastreamento (LGPD).' }
            ]
        },
        {
            title: '👤 Informações do Cliente', desc: 'Aumenta nota EMQ. Enviado com Hash SHA256.', icon: Fingerprint, color: 'text-emerald-600', bg: 'bg-emerald-50/50', border: 'border-emerald-100',
            items: [
                { key: 'em', label: 'E-mail', tip: 'E-mail do cliente (hasheado).' }, 
                { key: 'ph', label: 'Telefone', tip: 'Número de telefone com DDI (hasheado).' },
                { key: 'fn', label: 'Nome', tip: 'Primeiro nome do cliente.' }, 
                { key: 'ln', label: 'Sobrenome', tip: 'Sobrenome do cliente.' },
                { key: 'ct', label: 'Cidade', tip: 'Cidade do cliente.' }, 
                { key: 'st', label: 'Estado/Província', tip: 'Estado (Ex: SP, RJ).' },
                { key: 'country', label: 'País', tip: 'Código do país (ex: BR, PT).' }, 
                { key: 'zp', label: 'CEP/Zip', tip: 'Código postal do cliente.' },
                { key: 'ge', label: 'Gênero', tip: 'Gênero do cliente (m/f).' }, 
                { key: 'db', label: 'Nascimento', tip: 'Data de nascimento (YYYYMMDD).' },
                { key: 'external_id', label: 'User ID', tip: 'ID interno do cliente no seu banco de dados.' }
            ]
        },
        {
            title: '🛒 E-commerce & Conversão', desc: 'Dados do produto e da transação gerada.', icon: ShoppingCart, color: 'text-orange-600', bg: 'bg-orange-50/50', border: 'border-orange-100',
            items: [
                { key: 'value', label: 'Valor da Conversão', tip: 'Valor monetário do evento.' }, 
                { key: 'currency', label: 'Moeda', tip: 'Moeda da transação (ex: BRL, USD).' },
                { key: 'content_name', label: 'Nome do Item', tip: 'Nome do produto ou conteúdo visualizado.' }, 
                { key: 'content_ids', label: 'SKU / ID', tip: 'ID ou SKU do produto (Array).' },
                { key: 'content_type', label: 'Tipo', tip: 'Ex: product ou product_group.' }, 
                { key: 'num_items', label: 'Qtd. Itens', tip: 'Quantidade de produtos envolvidos na ação.' },
                { key: 'order_id', label: 'Order ID', tip: 'ID único do pedido finalizado.' }, 
                { key: 'search_string', label: 'Termo de Busca', tip: 'O que o usuário pesquisou no site.' },
                { key: 'subscription_id', label: 'ID de Assinatura', tip: 'ID gerado para assinaturas recorrentes.' }
            ]
        }
    ];

    // ============================================================================
    // ABAS DA PLATAFORMA
    // ============================================================================
    const renderPainel = () => {
        const met = dashboardData?.metrics || {};
        const baseCardProps = {
            'receita_bruta': { label: 'Receita Bruta Atribuída', valor: `R$ ${(met.receita_bruta || 0).toLocaleString('pt-BR', {minimumFractionDigits:2})}`, icon: DollarSign, color: 'text-emerald-600', tooltip: 'Faturamento validado dos pedidos do banco de dados.', formula: 'Σ(orders.total) WHERE status NOT IN(CANCELADO, REEMBOLSADO)' },
            'receita_liquida': { label: 'Receita Líquida', valor: `R$ ${(met.receita_liquida || 0).toLocaleString('pt-BR', {minimumFractionDigits:2})}`, icon: Activity, color: 'text-emerald-500', tooltip: 'Receita bruta menos devoluções e cancelamentos.', formula: 'Receita Bruta - Estornos' },
            'pedidos': { label: 'Pedidos Confirmados', valor: met.pedidos || 0, icon: ShoppingCart, color: 'text-blue-600', tooltip: 'Quantidade de checkout aprovados reais.', formula: 'COUNT(orders.id)' },
            'itens_vendidos': { label: 'Itens Vendidos', valor: met.itens_vendidos || 0, icon: Database, color: 'text-blue-500', tooltip: 'Total de produtos físicos vendidos.', formula: 'Σ(order_items.qty)' },
            'ticket_medio': { label: 'Ticket Médio (AOV)', valor: `R$ ${(met.ticket_medio || 0).toLocaleString('pt-BR', {minimumFractionDigits:2})}`, icon: TrendingUp, color: 'text-slate-800', tooltip: 'Média gasta por cliente em cada pedido válido.', formula: 'Receita Bruta ÷ Pedidos' },
            'taxa_conversao': { label: 'Taxa de Conversão (CR)', valor: `${(met.taxa_conversao || 0).toFixed(2)}%`, icon: Filter, color: 'text-slate-800', tooltip: 'Porcentagem de acessos que geraram compra.', formula: '(Pedidos ÷ PageViews) × 100' },
            'novos_clientes': { label: 'Novos Clientes', valor: met.novos_clientes || 0, icon: UserPlus, color: 'text-purple-600', tooltip: 'Clientes na primeira compra.', formula: 'COUNT DISTINCT user_id (first purchase)' },
            'clientes_recorrentes': { label: 'Clientes Recorrentes', valor: met.clientes_recorrentes || 0, icon: Users, color: 'text-purple-500', tooltip: 'Clientes com mais de uma compra.', formula: 'COUNT DISTINCT user_id (repeat purchase)' },
            'cac': { label: 'CAC Estimado', valor: `R$ ${(met.cac || 0).toLocaleString('pt-BR', {minimumFractionDigits:2})}`, icon: Target, color: 'text-rose-500', tooltip: 'Custo de Aquisição de Clientes.', formula: 'Gasto Ads ÷ Novos Clientes' },
            'roas': { label: 'ROAS Geral', valor: `${(met.roas || 0).toFixed(2)}x`, icon: Activity, color: 'text-emerald-600', tooltip: 'Retorno sobre investimento.', formula: 'Receita Atribuída ÷ Investimento' },
            'ltv': { label: 'LTV Médio', valor: `R$ ${(met.ltv || 0).toLocaleString('pt-BR', {minimumFractionDigits:2})}`, icon: Database, color: 'text-indigo-600', tooltip: 'Lifetime Value médio dos clientes.', formula: 'Receita Total ÷ Clientes Únicos' },
            'margem_bruta': { label: 'Margem Bruta (%)', valor: `${(met.margem_bruta || 0).toFixed(2)}%`, icon: TrendingUp, color: 'text-emerald-500', tooltip: 'Margem de lucro sobre os produtos.', formula: '(Lucro Bruto ÷ Receita Líquida) × 100' },
            'sessoes': { label: 'Sessões', valor: met.sessoes || 0, icon: Globe, color: 'text-sky-600', tooltip: 'Sessões únicas na loja.', formula: 'COUNT DISTINCT session_id' },
            'page_views': { label: 'Total PageViews', valor: met.page_views || 0, icon: Globe, color: 'text-sky-500', tooltip: 'Total de visualizações de página rastreadas no Data Layer.', formula: 'COUNT(event) WHERE event = PageView' },
            'view_item': { label: 'View Item (Produtos)', valor: met.view_item || 0, icon: MousePointer2, color: 'text-sky-400', tooltip: 'Visualizações de página de produto.', formula: 'COUNT(event) WHERE event = ViewContent' },
            'add_to_cart': { label: 'Adições ao Carrinho', valor: met.add_to_cart || 0, icon: MousePointerClick, color: 'text-orange-500', tooltip: 'Total de itens que entraram no carrinho.', formula: 'COUNT(event) WHERE event = AddToCart' },
            'begin_checkout': { label: 'Checkouts Iniciados', valor: met.begin_checkout || 0, icon: CreditCard, color: 'text-orange-600', tooltip: 'Checkouts iniciados.', formula: 'COUNT(event) WHERE event = InitiateCheckout' },
            'add_payment_info': { label: 'Info. Pagamento', valor: met.add_payment_info || 0, icon: CreditCard, color: 'text-orange-400', tooltip: 'Eventos de inserção de pagamento.', formula: 'COUNT(event) WHERE event = AddPaymentInfo' },
            'abandono_carrinho': { label: 'Abandono de Carrinho', valor: `${(met.abandono_carrinho || 0).toFixed(2)}%`, icon: AlertTriangle, color: 'text-rose-500', tooltip: 'Usuários que colocaram no carrinho mas não compraram.', formula: '(1 - (Pedidos ÷ AddToCart)) × 100' },
            'abandono_checkout': { label: 'Abandono de Checkout', valor: `${(met.abandono_checkout || 0).toFixed(2)}%`, icon: AlertTriangle, color: 'text-rose-600', tooltip: 'Pessoas que iniciaram pagamento mas abandonaram.', formula: '(1 - (Pedidos ÷ InitiateCheckout)) × 100' },
        };

        acionadores.forEach(ac => {
            const standardEvents = ['PageView','ViewContent','Search','AddToWishlist','AddToCart','InitiateCheckout','AddPaymentInfo','Purchase','Subscribe','StartTrial','CompleteRegistration','Contact','FindLocation','Schedule','CustomizeProduct','Donate','SubmitApplication','Lead'];
            if (!standardEvents.includes(ac.evento)) {
                const metData = dashboardData?.funil?.find(f => f.evento === ac.evento);
                baseCardProps[`custom_${ac.evento}`] = { label: `Custom: ${ac.evento}`, valor: metData ? metData.total : 0, icon: Zap, color: 'text-purple-500', tooltip: `Total de disparos rastreados da regra: ${ac.nome}`, formula: `COUNT(event) WHERE event = '${ac.evento}'` };
            }
        });

        const cardProps = baseCardProps;

        return (
            <motion.div {...tabTransition} className="space-y-8">
                <ConfigMetricsModal isOpen={isConfigDashOpen} onClose={() => setIsConfigDashOpen(false)} config={dashboardConfig} setConfig={setDashboardConfig} cardProps={cardProps} />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-200 pb-4 gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Seu Dashboard Personalizado</h2>
                        <p className="text-sm text-slate-500 mt-1">Acompanhe as métricas de performance e funil da operação em tempo real.</p>
                    </div>
                    <div className="flex gap-3 items-center w-full md:w-auto relative">
                        <button onClick={() => setIsConfigDashOpen(true)} className="flex items-center justify-center w-12 h-12 bg-white text-slate-600 rounded-full shadow-sm hover:text-blue-600 border border-slate-200 hover:border-blue-300 transition-all flex-shrink-0" title="Personalizar Painel">
                            <Settings2 className="w-5 h-5"/>
                        </button>
                        
                        <div className="relative shrink-0 z-[100]">
                            <HoverProgressRoundButton 
                                text={dashFilterText}
                                onClick={() => setDashDateOpen(!dashDateOpen)} 
                                icon={Icons.Calendar} 
                                ariaLabel="Filtrar Período do Dashboard"
                                loading={isUpdating && dashDateOpen} 
                                isActive={dashDateOpen}
                            />
                            <DateFilterPopup 
                                isOpen={dashDateOpen} 
                                onClose={() => setDashDateOpen(false)} 
                                dateRange={dashDateRange} 
                                setDateRange={setDashDateRange} 
                                loading={isUpdating}
                                onClear={() => aplicarFiltroData({ start: '', end: '' }, () => {})}
                                onApply={() => { 
                                  if(dashDateRange.start && dashDateRange.end) {
                                    aplicarFiltroData(dashDateRange, () => {});
                                  }
                                }}
                            />
                         </div>
                    </div>
                </div>

                <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden smart-flex-container">
                    <div className="smart-flex-item p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative group border-r border-b border-slate-100">
                        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-emerald-500 opacity-20 rounded-full blur-3xl group-hover:opacity-40 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="flex items-center mb-2">
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest break-words">Event Match Quality</span>
                                <span className="ml-2 bg-emerald-500/20 text-emerald-300 text-[9px] px-1.5 py-0.5 rounded font-bold">10/10</span>
                            </div>
                            <h3 className="text-3xl font-black">{credenciais?.meta_access_token ? 'Extrema' : 'Baixa'}</h3>
                            <p className="text-[10px] text-slate-400 mt-2">{credenciais?.meta_access_token ? 'API de Conversões Server-Side Conectada.' : 'Atenção: Faltando Token CAPI.'}</p>
                        </div>
                    </div>
                    {dashboardConfig.map(key => {
                        const conf = cardProps[key];
                        if(!conf) return null;
                        const IconComp = conf.icon;
                        return (
                            <div key={key} className="smart-flex-item p-6 hover:bg-slate-50 transition-colors flex flex-col justify-center border-r border-b border-slate-100 min-w-0">
                                <div className="flex items-center mb-2">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest break-words">{conf.label}</span>
                                </div>
                                <div className="flex items-center gap-3 mt-1 min-w-0">
                                    {IconComp && <IconComp className={`w-6 h-6 opacity-30 ${conf.color} flex-shrink-0`} />}
                                    <h3 className={`text-2xl sm:text-3xl font-black ${conf.color} break-words leading-tight`}>{conf.valor}</h3>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="bg-white p-6 md:p-8 rounded-[24px] border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Filter className="w-5 h-5 text-blue-500" /> Funil Real de Eventos
                    </h3>
                    <div className="flex flex-col gap-4">
                        {(Array.isArray(dashboardData?.funil) ? dashboardData.funil : []).map((etapa, idx) => {
                            const maxEventos = Math.max(...(dashboardData?.funil?.map(f => f.total || 0) || [1]));
                            const widthPct = Math.max(5, ((etapa.total || 0) / (maxEventos || 1)) * 100);
                            const baseColors = ['bg-blue-100 border-blue-500 text-blue-700', 'bg-emerald-100 border-emerald-500 text-emerald-700', 'bg-orange-100 border-orange-500 text-orange-700', 'bg-purple-100 border-purple-500 text-purple-700'];
                            const isStandard = ['PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'AddPaymentInfo', 'Purchase', 'Lead', 'CompleteRegistration', 'Search', 'AddToWishlist'].includes(etapa.evento);
                            const corSelecionada = isStandard ? baseColors[idx % baseColors.length] : 'bg-slate-100 border-slate-500 text-slate-700';

                            return (
                                <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                    <div className="w-full sm:w-56 text-left sm:text-right flex-shrink-0 flex items-center sm:justify-end gap-2">
                                        {!isStandard && <span className="text-[8px] bg-slate-800 text-white px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Custom</span>}
                                        <span className="text-xs font-bold text-slate-600 font-mono tracking-tight">{etapa.evento}</span>
                                    </div>
                                    <div className="flex-1 h-10 bg-slate-50 rounded-lg sm:rounded-r-xl flex items-center relative overflow-hidden shadow-inner">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${widthPct}%` }} transition={{ duration: 1, delay: idx * 0.1 }} className={`absolute left-0 top-0 h-full border-r-4 ${corSelecionada.split(' ')[0]} ${corSelecionada.split(' ')[1]}`} />
                                        <span className={`relative z-10 ml-4 font-black text-sm ${corSelecionada.split(' ')[2]}`}>{etapa.total || 0}</span>
                                    </div>
                                </div>
                            );
                        })}
                        {dashboardData?.funil?.length === 0 && <p className="text-center text-slate-400 text-sm py-4">Nenhum evento captado pela base de dados.</p>}
                    </div>
                </div>
            </motion.div>
        );
    };

    const renderIntegracoes = () => (
        <motion.div {...tabTransition}>
            <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-slate-800">App Store & Tokens</h2>
                    <p className="text-sm text-slate-500">Conecte a Loja às maiores redes de publicidade com segurança Server-Side.</p>
                </div>
                <PremiumSaveButton onClick={handleSaveIntegrações} loading={isSaving} text="Salvar Todos os Tokens" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-blue-200 transition-colors">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                        <div className="w-14 h-14 bg-[#E7F3FF] text-[#1877F2] rounded-2xl flex items-center justify-center shadow-inner"><Code2 className="w-7 h-7"/></div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800 leading-tight">Meta Pixel & CAPI</h3>
                            <div className="mt-1 flex items-center gap-2">
                                {(credenciais.meta_pixel_id && credenciais.meta_access_token) ? 
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1"><Check className="w-3 h-3"/> Conexão Ativa</span> : 
                                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Requer Atenção</span>
                                }
                            </div>
                        </div>
                    </div>
                    <div className="p-6 space-y-6 flex-1">
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">ID do Pixel (Browser)</label>
                            <SecureInput value={credenciais.meta_pixel_id || ''} onChange={(v) => setCredenciais({...credenciais, meta_pixel_id: v.replace(/\D/g, '')})} placeholder="Ex: 1029384756" isToken={false} />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 mb-2">
                                Token CAPI (Servidor) 
                                <SafeTooltip text="Gere o token no Gerenciador de Eventos da Meta. Ele resolve perdas por AdBlock." title="Por que usar CAPI?"/>
                            </label>
                            <SecureInput value={credenciais.meta_access_token || ''} onChange={(v) => setCredenciais({...credenciais, meta_access_token: v})} placeholder="EAAI..." />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-orange-200 transition-colors">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                        <div className="w-14 h-14 bg-[#FFF3E0] text-[#F57C00] rounded-2xl flex items-center justify-center shadow-inner"><Activity className="w-7 h-7"/></div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800 leading-tight">Google Analytics 4</h3>
                            <div className="mt-1 flex items-center gap-2">
                                {credenciais.ga4_measurement_id ? 
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1"><Check className="w-3 h-3"/> Conexão Ativa</span> : 
                                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Requer Atenção</span>
                                }
                            </div>
                        </div>
                    </div>
                    <div className="p-6 space-y-6 flex-1">
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Measurement ID</label>
                            <SecureInput value={credenciais.ga4_measurement_id || ''} onChange={(v) => setCredenciais({...credenciais, ga4_measurement_id: v.toUpperCase()})} placeholder="G-XXXXXXXXXX" isToken={false} />
                        </div>
                        <p className="text-xs text-slate-500 bg-orange-50/50 p-4 rounded-xl border border-orange-100 leading-relaxed">A HUB mapeia automaticamente o objeto <code>items[]</code> para e-commerce no padrão oficial do GA4.</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:col-span-2 lg:col-span-1 hover:border-slate-400 transition-colors">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                        <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-inner"><Zap className="w-7 h-7"/></div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800 leading-tight">TikTok For Business</h3>
                            <div className="mt-1 flex items-center gap-2">
                                {credenciais.tiktok_pixel_id ? 
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1"><Check className="w-3 h-3"/> Conexão Ativa</span> : 
                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">Configuração Básica</span>
                                }
                            </div>
                        </div>
                    </div>
                    <div className="p-6 space-y-6 flex-1">
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Pixel ID</label>
                            <SecureInput value={credenciais.tiktok_pixel_id || ''} onChange={(v) => setCredenciais({...credenciais, tiktok_pixel_id: v})} placeholder="Cole o código identificador..." isToken={false} />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const renderAcionadores = () => (
        <motion.div {...tabTransition}>
            <AnimatePresence mode="wait">
                {triggerView === 'LIST' ? (
                    <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                        
                        {/* EVENTOS NATIVOS DA LOJA (Lista Completa) */}
                        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden mb-8">
                            <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0"><CheckCircle2 className="w-6 h-6" /></div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-800">Eventos Nativos do Catálogo</h2>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">Controlados globalmente pela plataforma. Não requerem instalação de código.</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <button 
                                        onClick={() => toggleAllNativos(!isAllNativosAtivos)} 
                                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 border ${isAllNativosAtivos ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'}`}
                                    >
                                        {isAllNativosAtivos ? <><PowerOff className="w-4 h-4"/> Desligar Todos</> : <><Power className="w-4 h-4"/> Ligar Todos</>}
                                    </button>
                                    <PremiumSaveButton onClick={handleSaveIntegrações} loading={isSaving} text="Salvar Alterações" className="!py-2.5 !text-xs !bg-blue-600 hover:!bg-blue-700" />
                                </div>
                            </div>
                            <div className="p-0 overflow-x-auto">
                                <table className="w-full text-left text-sm border-collapse min-w-[900px]">
                                    <thead>
                                        <tr className="bg-white border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                                            <th className="p-4 pl-6">Evento Oficial</th>
                                            <th className="p-4">Quando é disparado?</th>
                                            <th className="p-4 text-center">Data Layer Completo</th>
                                            <th className="p-4 pr-6 text-center">Ativo?</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 text-slate-600">
                                        {[
                                            { key: 'pageView', nome: 'PageView', desc: 'Em todas as páginas do site', layer: 'url, referrer, source' },
                                            { key: 'viewContent', nome: 'ViewContent', desc: 'Visualização da página de Produto', layer: 'content_ids, content_name, value, currency, content_type' },
                                            { key: 'addToCart', nome: 'AddToCart', desc: 'Adição ao Carrinho de compras', layer: 'content_ids, value, currency, num_items' },
                                            { key: 'addToWishlist', nome: 'AddToWishlist', desc: 'Adição a lista de desejos', layer: 'content_ids, value, currency' },
                                            { key: 'initiateCheckout', nome: 'InitiateCheckout', desc: 'Início da finalização de compra', layer: 'content_ids, value, currency, num_items' },
                                            { key: 'addPaymentInfo', nome: 'AddPaymentInfo', desc: 'Dados de pagamento preenchidos', layer: 'value, currency' },
                                            { key: 'purchase', nome: 'Purchase', desc: 'Pedido confirmado e pago', layer: 'transaction_id, order_id, value, currency, content_ids, user_data' },
                                            { key: 'completeRegistration', nome: 'CompleteRegistration', desc: 'Cadastro de nova conta concluído', layer: 'status, currency, value' },
                                            { key: 'lead', nome: 'Lead', desc: 'Formulários captados', layer: 'value, currency' },
                                            { key: 'contact', nome: 'Contact', desc: 'Ações de contato (Botão WhatsApp/Email)', layer: 'value' },
                                            { key: 'search', nome: 'Search', desc: 'Buscas realizadas na barra do topo', layer: 'search_string, content_ids' },
                                            { key: 'donate', nome: 'Donate', desc: 'Gorjetas ou Doações realizadas', layer: 'value, currency' },
                                            { key: 'customizeProduct', nome: 'CustomizeProduct', desc: 'Produto Personalizado', layer: 'content_ids' },
                                            { key: 'findLocation', nome: 'FindLocation', desc: 'Busca de lojas físicas', layer: 'location' },
                                            { key: 'schedule', nome: 'Schedule', desc: 'Agendamentos', layer: 'value' },
                                            { key: 'startTrial', nome: 'StartTrial', desc: 'Início de testes de serviços', layer: 'value, currency' },
                                            { key: 'submitApplication', nome: 'SubmitApplication', desc: 'Aplicações ou formulários VIP', layer: 'value' },
                                            { key: 'subscribe', nome: 'Subscribe', desc: 'Assinatura de plano', layer: 'value, currency' },
                                        ].map((evt, idx) => (
                                            <tr key={evt.key} className={`transition-colors ${idx % 2 === 0 ? 'bg-white hover:bg-slate-50/50' : 'bg-slate-50/30 hover:bg-slate-50/80'}`}>
                                                <td className="p-4 pl-6 font-bold text-slate-800 font-mono tracking-tight text-xs flex items-center gap-2">
                                                    {evt.nome}
                                                    {['Purchase', 'AddToCart', 'InitiateCheckout'].includes(evt.nome) && <span className="bg-orange-100 text-orange-700 text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">Core</span>}
                                                </td>
                                                <td className="p-4 text-xs">{evt.desc}</td>
                                                <td className="p-4 text-center">
                                                    <SafeTooltip text={`Parâmetros da documentação oficial: ${evt.layer}`} title="Payload Garantido na CAPI" />
                                                    <span className="bg-slate-800 text-white px-2.5 py-1 rounded text-[9px] font-mono tracking-widest uppercase shadow-sm ml-2">Payload VIP</span>
                                                </td>
                                                <td className="p-4 pr-6 flex justify-center">
                                                    <AnimatedToggle active={eventosNativos[evt.key] ?? true} onChange={(val) => setEventosNativos({...eventosNativos, [evt.key]: val})} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* ACIONADORES CUSTOMIZADOS */}
                        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center"><AppWindow className="w-6 h-6" /></div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-800">Acionadores Personalizados (GTM)</h2>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">Disparos manuais que exigem verificação de Domínio Alvo.</p>
                                    </div>
                                </div>
                                <button onClick={() => { setTriggerForm({ id: null, nome: '', evento_selecionado: 'Contact', evento_custom: '', tipo_gatilho: 'click', valor_gatilho: '', url_alvo: '*', status: true, payload: {} }); setTriggerView('FORM'); }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-colors flex items-center gap-2 whitespace-nowrap">
                                    <Plus className="w-4 h-4"/> Nova Regra de Disparo
                                </button>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[900px]">
                                    <thead>
                                        <tr className="bg-white border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                                            <th className="p-5 pl-6">Regra Interna</th>
                                            <th className="p-5">Evento (Pixel)</th>
                                            <th className="p-5">Gatilho & Domínio</th>
                                            <th className="p-5 text-center">Enriquecimento</th>
                                            <th className="p-5 text-center">Status</th>
                                            <th className="p-5 pr-6 text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {acionadoresPaginados.map((acionador) => (
                                            <tr key={acionador.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="p-5 pl-6 font-bold text-slate-800 text-sm">{acionador.nome}</td>
                                                <td className="p-5"><span className="bg-slate-900 text-white text-[10px] px-2.5 py-1 rounded font-bold font-mono tracking-wider shadow-sm">{acionador.evento}</span></td>
                                                <td className="p-5">
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                                            {acionador.tipo_gatilho === 'click' && <><MousePointer2 className="w-3.5 h-3.5 text-blue-500"/> HTML Elemento</>}
                                                            {acionador.tipo_gatilho === 'url_contains' && <><Globe className="w-3.5 h-3.5 text-emerald-500"/> URL Contém</>}
                                                            {acionador.tipo_gatilho === 'url_exact' && <><Globe className="w-3.5 h-3.5 text-emerald-500"/> URL Exata</>}
                                                            {acionador.tipo_gatilho === 'scroll' && <><ArrowDownToLine className="w-3.5 h-3.5 text-orange-500"/> Scroll Depth</>}
                                                            {acionador.tipo_gatilho === 'time' && <><Clock className="w-3.5 h-3.5 text-purple-500"/> Time Delay</>}
                                                            {acionador.tipo_gatilho === 'form_submit' && <><Edit className="w-3.5 h-3.5 text-blue-500"/> Form Submit</>}
                                                            {acionador.tipo_gatilho === 'element_visibility' && <><Eye className="w-3.5 h-3.5 text-emerald-500"/> Visibility</>}
                                                            {acionador.tipo_gatilho === 'exit_intent' && <><ArrowLeft className="w-3.5 h-3.5 text-rose-500"/> Exit Intent</>}
                                                            {acionador.tipo_gatilho === 'custom_event' && <><Zap className="w-3.5 h-3.5 text-amber-500"/> Custom Layer</>}
                                                        </div>
                                                        {acionador.valor_gatilho && <span className="text-[10px] font-mono text-slate-500 bg-white border border-slate-100 px-2 py-0.5 rounded truncate max-w-[200px]">{acionador.valor_gatilho}</span>}
                                                        <span className="text-[9px] text-sky-600 flex items-center gap-1"><Target className="w-3 h-3"/> Alvo: {acionador.url_alvo || '*'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-5 text-center text-[10px] font-bold text-slate-500">
                                                    <span className="bg-sky-50 text-sky-700 px-2 py-1 rounded-md border border-sky-100">{Object.values(acionador.payload || {}).filter(v => v).length} Parâmetros</span>
                                                </td>
                                                <td className="p-5 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded uppercase tracking-wider ${acionador.status ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                        {acionador.status ? 'Ativo' : 'Pausado'}
                                                    </span>
                                                </td>
                                                <td className="p-5 pr-6 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => editTrigger(acionador)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4"/></button>
                                                        <button onClick={() => handleDeletarAcionador(acionador.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {acionadoresPaginados.length === 0 && <tr><td colSpan="6" className="p-10 text-center text-slate-400 text-sm">Nenhuma regra customizada. Vá em frente e crie a primeira!</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Paginação */}
                            {totalPaginas > 1 && (
                                <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <span className="text-xs text-slate-500 font-medium">Mostrando página {paginaAtual} de {totalPaginas}</span>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setPaginaAtual(prev => Math.max(1, prev - 1))} 
                                            disabled={paginaAtual === 1}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => setPaginaAtual(prev => Math.min(totalPaginas, prev + 1))} 
                                            disabled={paginaAtual === totalPaginas}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-8 max-w-5xl mx-auto">
                        <button onClick={() => setTriggerView('LIST')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Voltar para a lista
                        </button>
                        
                        <h2 className="text-2xl font-black text-slate-900 mb-2">{triggerForm.id ? 'Editar Regra de Disparo' : 'Criar Regra de Disparo'}</h2>
                        <p className="text-sm text-slate-500 mb-6">Defina nomes livres, determine a URL alvo da loja para validação do pixel e enriqueça com Payload.</p>

                        {/* 🟢 TUTORIAL DINÂMICO PREMIUM */}
                        <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-5 mb-8">
                            <h4 className="font-black text-sky-900 mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4"/> Como configurar o Gatilho?</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs text-sky-800 leading-relaxed">
                                <div><strong className="text-sky-900 block mb-0.5">🖱️ HTML Elemento (Click)</strong> Dispara ao clicar. Ex: coloque <code>.btn-compra</code> (classe) ou <code>#meu-botao</code> (ID).</div>
                                <div><strong className="text-sky-900 block mb-0.5">🔗 URL (Acesso à Página)</strong> Dispara ao visitar. Ex: coloque <code>/carrinho</code> (Contém) ou <code>https://loja.com/promo</code> (Exata).</div>
                                <div><strong className="text-sky-900 block mb-0.5">⏬ Scroll Depth (Rolagem)</strong> Dispara ao descer a tela. Ex: coloque <code>50</code> para disparar na metade da página (%).</div>
                                <div><strong className="text-sky-900 block mb-0.5">⏱️ Time Delay (Tempo)</strong> Dispara após retenção. Ex: coloque <code>15</code> para disparar após 15 segundos na página.</div>
                                <div><strong className="text-sky-900 block mb-0.5">📝 Envio de Formulário</strong> Dispara ao submeter um form. Ex: coloque o id <code>#form-lead</code>.</div>
                                <div><strong className="text-sky-900 block mb-0.5">👁️ Elemento Visível</strong> Dispara quando o elemento aparecer. Ex: <code>.banner-final</code>.</div>
                            </div>
                        </div>

                        <form onSubmit={handleSalvarAcionador} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[12px] font-bold text-slate-700 mb-2 block">Nome Interno</label>
                                    <input type="text" value={triggerForm.nome} onChange={e => setTriggerForm({...triggerForm, nome: e.target.value})} required placeholder="Ex: Lead Botão Header" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 h-12 text-sm outline-none focus:border-blue-500 transition-all" />
                                </div>
                                <div>
                                    <label className="text-[12px] font-bold text-slate-700 mb-2 block">Nome Oficial do Evento</label>
                                    <div className="flex gap-2">
                                        <select value={triggerForm.evento_selecionado} onChange={e => setTriggerForm({...triggerForm, evento_selecionado: e.target.value, evento_custom: e.target.value !== 'CUSTOM' ? '' : triggerForm.evento_custom})} className={`bg-slate-50 border border-slate-200 rounded-xl px-3 h-12 text-sm font-mono outline-none focus:border-blue-500 cursor-pointer transition-all shadow-sm ${triggerForm.evento_selecionado === 'CUSTOM' ? 'w-1/3' : 'w-full'}`}>
                                            <option value="PageView">PageView</option>
                                            <option value="ViewContent">ViewContent</option>
                                            <option value="Search">Search</option>
                                            <option value="AddToWishlist">AddToWishlist</option>
                                            <option value="AddToCart">AddToCart</option>
                                            <option value="InitiateCheckout">InitiateCheckout</option>
                                            <option value="AddPaymentInfo">AddPaymentInfo</option>
                                            <option value="Purchase">Purchase</option>
                                            <option value="Subscribe">Subscribe</option>
                                            <option value="StartTrial">StartTrial</option>
                                            <option value="CompleteRegistration">CompleteRegistration</option>
                                            <option value="Contact">Contact</option>
                                            <option value="FindLocation">FindLocation</option>
                                            <option value="Schedule">Schedule</option>
                                            <option value="CustomizeProduct">CustomizeProduct</option>
                                            <option value="Donate">Donate</option>
                                            <option value="SubmitApplication">SubmitApplication</option>
                                            <option value="Lead">Lead</option>
                                            <option disabled>──────────</option>
                                            <option value="CUSTOM">Customizado...</option>
                                        </select>
                                        {triggerForm.evento_selecionado === 'CUSTOM' && (
                                            <input type="text" value={triggerForm.evento_custom} onChange={e => setTriggerForm({...triggerForm, evento_custom: e.target.value})} required placeholder="NomeLivre" className="w-2/3 bg-white border border-blue-300 rounded-xl px-4 h-12 text-sm font-mono outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-6">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2"><Zap className="w-4 h-4 text-blue-500"/> Regra do Gatilho & Validação</h3>
                                
                                <div>
                                    <label className="text-[12px] font-bold text-slate-700 mb-1 block flex items-center gap-1">
                                        URL de Atuação Alvo <SafeTooltip text="Se vazio ou '*', funcionará em todo o site. Se colocar '/checkout', o gatilho só será disparado caso o cliente esteja nessa página." title="Filtro de Rota" />
                                    </label>
                                    <input type="text" value={triggerForm.url_alvo} onChange={e => setTriggerForm({...triggerForm, url_alvo: e.target.value})} required placeholder="Ex: * ou /categoria/promo" className="w-full bg-white border border-slate-300 rounded-xl px-4 h-12 text-sm outline-none font-mono focus:border-blue-500 shadow-sm" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[12px] font-bold text-slate-700 mb-2 block">Quando a regra deve disparar?</label>
                                        <select value={triggerForm.tipo_gatilho} onChange={e => setTriggerForm({...triggerForm, tipo_gatilho: e.target.value, valor_gatilho: e.target.value === 'exit_intent' ? '' : triggerForm.valor_gatilho})} className="w-full bg-white border border-slate-300 rounded-xl px-4 h-12 text-sm outline-none focus:border-blue-500 cursor-pointer shadow-sm font-medium">
                                            <option value="click">🖱️ Ao clicar num Elemento HTML (Classe/ID)</option>
                                            <option value="url_contains">🔗 Quando a URL conter um texto</option>
                                            <option value="url_exact">🎯 Quando a URL for exatamente igual a</option>
                                            <option value="scroll">⏬ Ao rolar a página (Porcentagem %)</option>
                                            <option value="time">⏱️ Tempo na página (Segundos)</option>
                                            <option value="form_submit">📝 Envio de Formulário (Form Submit)</option>
                                            <option value="element_visibility">👁️ Elemento Visível na Tela (Classe/ID)</option>
                                            <option value="exit_intent">🚪 Intenção de Saída (Mouse fora da tela)</option>
                                            <option value="custom_event">⚡ Evento DataLayer Customizado</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[12px] font-bold text-slate-700 mb-2 block">Condição exata a monitorar</label>
                                        <input 
                                            type={['scroll', 'time'].includes(triggerForm.tipo_gatilho) ? 'number' : 'text'} 
                                            value={triggerForm.valor_gatilho} 
                                            onChange={e => setTriggerForm({...triggerForm, valor_gatilho: e.target.value})} 
                                            required={triggerForm.tipo_gatilho !== 'exit_intent'} 
                                            disabled={triggerForm.tipo_gatilho === 'exit_intent'}
                                            placeholder={
                                                triggerForm.tipo_gatilho === 'click' ? "Ex: .btn-whatsapp ou #meu-form" :
                                                triggerForm.tipo_gatilho === 'url_contains' ? "Ex: /agradecimento" :
                                                triggerForm.tipo_gatilho === 'scroll' ? "Ex: 50" : 
                                                triggerForm.tipo_gatilho === 'time' ? "Ex: 15" :
                                                triggerForm.tipo_gatilho === 'form_submit' ? "Ex: #meu-formulario" :
                                                triggerForm.tipo_gatilho === 'element_visibility' ? "Ex: .banner-final" :
                                                triggerForm.tipo_gatilho === 'custom_event' ? "Ex: view_promotion" :
                                                "Não necessário para Intenção de Saída"
                                            } 
                                            className={`w-full bg-white border border-slate-300 rounded-xl px-4 h-12 text-sm outline-none font-mono shadow-sm ${triggerForm.tipo_gatilho === 'exit_intent' ? 'opacity-50 cursor-not-allowed bg-slate-100' : 'focus:border-blue-500'}`} 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 🟢 PAYLOAD BUILDER CATEGORIZADO */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                <div className="mb-6 border-b border-slate-100 pb-4">
                                    <h3 className="font-black text-slate-800 flex items-center gap-2"><Database className="w-5 h-5 text-blue-600"/> Enriquecimento de Dados (CAPI Payload Builder)</h3>
                                    <p className="text-xs text-slate-500 mt-1">Selecione quais chaves o evento deve extrair do Data Layer e enviar ao Gerenciador de Eventos.</p>
                                </div>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {payloadCategories.map((categoria, idx) => (
                                        <div key={idx} className={`p-5 rounded-xl border ${categoria.bg} ${categoria.border}`}>
                                            <h4 className={`font-bold text-sm flex items-center gap-1.5 mb-1 ${categoria.color}`}>
                                                <categoria.icon className="w-4 h-4" /> {categoria.title}
                                            </h4>
                                            <p className={`text-[10px] mb-4 opacity-70 ${categoria.color}`}>{categoria.desc}</p>
                                            
                                            <div className="space-y-3">
                                                {categoria.items.map(campo => (
                                                    <label key={campo.key} className={`flex items-center gap-2 text-xs font-bold cursor-pointer transition-colors ${triggerForm.payload?.[campo.key] ? categoria.color : 'text-slate-600 hover:text-slate-900'}`}>
                                                        <input 
                                                            type="checkbox" 
                                                            checked={triggerForm.payload?.[campo.key] || false} 
                                                            onChange={e => setTriggerForm({...triggerForm, payload: {...triggerForm.payload, [campo.key]: e.target.checked}})} 
                                                            className="w-4 h-4 rounded border-slate-300" 
                                                            style={{ accentColor: 'currentColor' }}
                                                        /> 
                                                        {campo.label}
                                                        <SafeTooltip text={campo.tip} title="Parâmetro Oficial" />
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-200 pt-6">
                                <div className="flex items-center gap-3">
                                    <AnimatedToggle active={triggerForm.status} onChange={(val) => setTriggerForm({...triggerForm, status: val})} />
                                    <span className="text-sm text-slate-700 font-bold select-none">Regra Ativa</span>
                                </div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setTriggerView('LIST')} className="px-6 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
                                    <PremiumSaveButton loading={isSaving} text="Salvar Regra de Conversão" />
                                </div>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );

    if (isLoading && !isUpdating) return (
        <div className="w-full max-w-7xl mx-auto pb-12 animate-pulse p-4">
            <div className="h-10 bg-slate-200 rounded-lg w-1/3 mb-10"></div>
            <div className="flex gap-4 mb-8">
                <div className="h-10 bg-slate-200 rounded-xl w-40"></div>
                <div className="h-10 bg-slate-200 rounded-xl w-40"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="h-40 bg-slate-200 rounded-3xl"></div>
                <div className="h-40 bg-slate-200 rounded-3xl"></div>
                <div className="h-40 bg-slate-200 rounded-3xl"></div>
            </div>
        </div>
    );

    return (
        <PixelErrorBoundary>
            <div className="w-full max-w-7xl mx-auto pb-16 relative">
                <Helmet><title>Central de Tracking | HUB Admin</title></Helmet>
                <CustomStyles />
                <AnimatedNotification show={toast.show} status={toast.status} titulo={toast.message} />
                <MetricsDictionaryModal isOpen={isDictOpen} onClose={() => setIsDictOpen(false)} />

                <div className="mb-8 flex flex-col md:flex-row justify-between md:items-end gap-4 p-4 sm:p-0">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <Activity className="w-8 h-8 text-blue-600" /> Tracking Hub (CDP)
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium">Plataforma de coleta, validação e distribuição inteligente de eventos.</p>
                    </div>
                    <div className="flex items-center justify-center gap-3 w-full md:w-auto">
                        <button onClick={handleRefreshManual} className="flex items-center justify-center w-12 h-12 bg-white text-slate-600 rounded-full shadow-sm hover:text-blue-600 border border-slate-200 hover:border-blue-300 transition-all flex-shrink-0" title="Sincronizar Agora">
                            <RotateCcw className={`w-5 h-5 ${isUpdating && !dashDateOpen ? 'animate-spin text-blue-600' : ''}`} />
                        </button>
                        <button onClick={() => setIsDictOpen(true)} className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 shadow-sm rounded-full text-sm font-bold text-slate-700 hover:text-blue-600 hover:border-blue-200 transition-all flex-grow md:flex-grow-0">
                            <BookMarked className="w-5 h-5" /> Catálogo de Métricas
                        </button>
                    </div>
                </div>

                <div className="flex overflow-x-auto hide-scroll bg-slate-200/50 p-1.5 rounded-2xl mb-10 w-max max-w-full border border-slate-200/60 shadow-inner mx-4 sm:mx-0">
                    {[
                        { id: 'PAINEL', label: 'Funil e Métricas Reais' },
                        { id: 'INTEGRACOES', label: 'App Store (Tokens)' },
                        { id: 'ACIONADORES', label: 'Data Layer & Regras' }
                    ].map((tab) => (
                        <button key={tab.id} onClick={() => { setActiveTab(tab.id); setTriggerView('LIST'); }} className={`relative px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap outline-none ${activeTab === tab.id ? 'text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
                            {activeTab === tab.id && <motion.div layoutId="activeTabPixels" className="absolute inset-0 bg-white rounded-xl" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
                            <span className="relative z-10">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="px-4 sm:px-0">
                    <AnimatePresence mode="wait">
                        <React.Fragment key={activeTab}>
                            {activeTab === 'PAINEL' && renderPainel()}
                            {activeTab === 'INTEGRACOES' && renderIntegracoes()}
                            {activeTab === 'ACIONADORES' && renderAcionadores()}
                        </React.Fragment>
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