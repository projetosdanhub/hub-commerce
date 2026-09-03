import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDateBR } from '../../Produtos/Compartilhado/ComponentesUI';
import { Icons } from './PedidosIcons';

export const OrdersSkeleton = () => (
    <div className="animate-pulse flex flex-col min-h-[600px] w-full">
        <div className="flex justify-between items-center mb-4">
            <div className="h-6 w-64 bg-slate-200 rounded-lg"></div>
            <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col xl:flex-row divide-y xl:divide-y-0 xl:divide-x divide-slate-100 overflow-hidden mb-6 h-[100px]">
            {[1,2,3,4,5,6].map(i => <div key={i} className="flex-1 bg-slate-100/50 p-5"></div>)}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col flex-1 p-6">
            <div className="h-12 bg-slate-100 rounded-xl mb-6 flex justify-between px-4 items-center">
                <div className="h-6 w-1/3 bg-slate-200 rounded-lg"></div>
                <div className="h-8 w-24 bg-slate-200 rounded-lg"></div>
            </div>
            <div className="space-y-4">
                {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-16 bg-slate-50 rounded-xl border border-slate-100 flex items-center px-6 gap-6">
                        <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
                        <div className="h-4 w-1/4 bg-slate-200 rounded"></div>
                        <div className="h-4 w-1/4 bg-slate-200 rounded"></div>
                        <div className="h-6 w-20 bg-slate-200 rounded-lg ml-auto"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const ProgressButton = ({ onClick, loading, text, className, disabled = false }) => (
    <button type="button" onClick={onClick} disabled={loading || disabled} className={`relative overflow-hidden ${className} disabled:opacity-90 disabled:cursor-not-allowed transition-all focus:ring-2 focus:ring-blue-500/20 rounded-lg`}>
        {loading && <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.24, ease: "linear" }} className="absolute left-0 top-0 h-full bg-black/10 z-0" />}
        <span className="relative z-10 flex items-center justify-center gap-2">{loading ? <><Icons.Spinner className="w-4 h-4" /> Processando...</> : text}</span>
    </button>
);

export const HoverProgressRoundButton = ({ text, onClick, loading, icon: Icon, ariaLabel, isActive }) => {
    const [isHovered, setIsHovered] = useState(false);
    const shouldExpand = isHovered || isActive;

    return (
      <motion.button 
          onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} whileTap={loading ? {} : { scale: 0.95 }} 
          type="button" onClick={onClick} aria-label={ariaLabel} disabled={loading} animate={{ width: shouldExpand ? 'auto' : 48 }}
          className={`relative overflow-hidden h-[38px] rounded-full bg-white border shadow-sm flex items-center pl-[14px] pr-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-80 transition-colors z-10 ${shouldExpand ? 'border-blue-300 bg-blue-50' : 'border-slate-200'}`}
      >
          {loading && (
             <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 38 38">
                 <motion.circle cx="19" cy="19" r="17" fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="106" initial={{ strokeDashoffset: 106 }} animate={{ strokeDashoffset: 0 }} transition={{ duration: 0.24, ease: "linear" }} />
             </svg>
          )}
          <div className="relative z-10 flex items-center gap-2 whitespace-nowrap">
              {loading ? <Icons.Spinner className="w-5 h-5 text-blue-500 shrink-0" /> : <Icon className={`w-5 h-5 shrink-0 transition-colors ${shouldExpand ? 'text-blue-600' : 'text-slate-500'}`} />}
              <AnimatePresence>
                  {shouldExpand && !loading && (
                      <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.18 }} className="text-[11px] font-bold text-slate-700 truncate pr-2">
                          {text}
                      </motion.span>
                  )}
              </AnimatePresence>
          </div>
      </motion.button>
    );
};

export const DateFilterPopup = ({ dateRange, setDateRange, onApply, onClear, loading, isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={(e) => { e.stopPropagation(); onClose(); }} aria-hidden="true"></div>
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 top-full mt-2 origin-top-right bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 w-80 z-[100]" role="dialog" aria-modal="true" aria-label="Filtro de Data">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2"><Icons.Calendar className="w-4 h-4"/> Filtrar Período</p>
            <div className="space-y-4">
              <div className="relative z-10">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="data-inicio">Data Inicial</label>
                  <input id="data-inicio" type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 font-bold text-slate-800 cursor-pointer transition-all shadow-sm" />
              </div>
              <div className="relative z-10">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="data-fim">Data Final</label>
                  <input id="data-fim" type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 font-bold text-slate-800 cursor-pointer transition-all shadow-sm" />
              </div>
              <div className="pt-2 flex gap-2 relative z-10">
                <button type="button" onClick={onClear} className="w-1/3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs py-2.5 rounded-lg border border-slate-200 shadow-sm transition-colors">Limpar</button>
                <button type="button" onClick={onApply} disabled={loading} className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs py-2.5 rounded-lg shadow-sm transition-colors">{loading ? 'Aplicando...' : 'Aplicar Filtro'}</button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const AnimatedNotification = ({ show, status, titulo }) => (
    <AnimatePresence>
        {show && (
            <motion.div initial={{ opacity: 0, y: -50, scale: 0.9 }} animate={{ opacity: 1, y: 20, scale: 1 }} exit={{ opacity: 0, y: -50, scale: 0.9 }} className="fixed top-4 right-4 z-[99999] bg-white rounded-[20px] shadow-xl border border-slate-200 p-3 flex items-center gap-4 min-w-[300px]" role="alert">
                <div className="relative w-10 h-10 flex-shrink-0 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center">
                    {status === 'loading' ? <Icons.Spinner className="text-blue-500 w-5 h-5" /> : status === 'error' ? <Icons.AlertTriangle className="text-rose-500 w-5 h-5"/> : <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-500"><Icons.Check className="w-5 h-5"/></motion.div>}
                </div>
                <div className="pr-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{status === 'loading' ? 'A Processar...' : status === 'error' ? 'Atenção' : 'Concluído'}</p>
                    <p className="text-sm font-black text-slate-800 line-clamp-1">{titulo}</p>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

export const RenderStepper = ({ status, pedido, getLogDate }) => {
    const [isInitialMount, setIsInitialMount] = useState(true);
    useEffect(() => { setIsInitialMount(false); }, []);

    const steps = ['A_PAGAR', 'SEPARACAO', 'SEPARADO', 'DESPACHADO', 'ENTREGUE'];
    const flowLabels = ['A Pagar', 'Em Separação', 'Separado', 'Enviado', 'Entregue'];
    
    let currentIndex = steps.indexOf(status);
    if (currentIndex === -1 && ['CANCELADO', 'REEMBOLSADO', 'EM_ANALISE_REEMBOLSO'].includes(status)) currentIndex = 0; 
    
    const progressPercentage = currentIndex === -1 ? 0 : (currentIndex / (steps.length - 1)) * 100;

    if (status === 'EM_ANALISE_REEMBOLSO') return (
        <div className="text-amber-700 font-bold text-sm bg-amber-50 p-6 rounded-2xl border border-amber-200 text-center shadow-sm mb-6">
            <span className="text-amber-600 font-black uppercase text-xs tracking-widest block mb-2 flex items-center justify-center gap-2"><Icons.AlertTriangle className="w-5 h-5"/> Reembolso Em Análise</span>
            Motivo Solicitado: {pedido?.motivo_cancelamento || 'Aguardando justificativa.'}
        </div>
    );

    if (['CANCELADO', 'REEMBOLSADO'].includes(status)) {
        const isReembolsado = status === 'REEMBOLSADO';
        const metodo = pedido?.metodo_reembolso === 'CASHBACK' ? 'CASHBACK' : 'TRANSFERÊNCIA';
        const isCashback = pedido?.metodo_reembolso === 'CASHBACK';

        let dataAcao = '-';
        let horaAcao = '-';
        if (pedido?.timeline) {
            const logEvent = pedido.timeline.slice().reverse().find(l =>
                String(l.evento || l.desc).toLowerCase().includes('reembolso') || String(l.evento || l.desc).toLowerCase().includes('cancelado')
            );
            if (logEvent) {
                const dateParts = (logEvent.data || '').split(' ');
                dataAcao = dateParts[0] || '-';
                horaAcao = dateParts[1] || '-';
            }
        }

        return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-rose-50 border border-rose-200 rounded-2xl p-6 sm:p-8 mb-6 shadow-sm flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4 text-rose-500 shadow-sm"><Icons.AlertTriangle className="w-8 h-8" /></div>
                <h3 className="text-xl font-black text-rose-700 mb-2">Pedido Cancelado / Devolvido</h3>
                <p className="text-sm font-medium text-rose-600 max-w-2xl leading-relaxed mb-6">O pedido foi cancelado e o pagamento aprovado. Confira a área de devoluções.</p>
                
                {(isReembolsado || pedido?.comprovante_reembolso) && (
                    <div className="bg-white p-5 rounded-2xl border border-rose-100 w-full max-w-3xl flex flex-col sm:flex-row items-center justify-between gap-6 text-left shadow-sm">
                        <div className="flex-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Detalhes do Reembolso</span>
                            <p className="text-sm font-bold text-slate-700 leading-relaxed">
                                O valor do reembolso foi realizado no dia <span className="text-slate-900">{dataAcao}</span> horário <span className="text-slate-900">{horaAcao}</span><br/>
                                POR MEIO DE <span className="text-blue-600 font-black uppercase">{metodo}</span> NO VALOR DE <span className="text-emerald-600 font-black">{formatCurrency(pedido?.total)}</span>
                                {isCashback && <span className="text-amber-600 font-bold"> na conta para compras na loja</span>}.
                            </p>
                        </div>
                        {pedido?.comprovante_reembolso && (
                            <a href={pedido.comprovante_reembolso} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-3.5 rounded-xl font-bold text-xs transition-colors shadow-sm shrink-0">
                                <Icons.Download className="w-4 h-4" /> Baixar Comprovante
                            </a>
                        )}
                    </div>
                )}
            </motion.div>
        );
    }

    return (
        <div className="relative overflow-hidden p-6 sm:p-8 bg-slate-50/50 rounded-2xl border border-slate-100 mb-6">
            <div className="relative z-10 w-full max-w-3xl mx-auto flex items-start justify-between pb-8 pt-2">
                <div className="absolute top-[18px] left-0 w-full h-1 bg-slate-200 rounded-full z-0" />
                <motion.div className="absolute top-[18px] left-0 h-1 bg-sky-400 rounded-full z-0 shadow-[0_0_10px_rgba(56,189,248,0.4)]" initial={isInitialMount ? { width: 0 } : false} animate={{ width: `${progressPercentage}%` }} transition={{ duration: 0.24, ease: "easeOut" }} />
                {steps.map((step, idx) => {
                    const isCompleted = idx <= currentIndex;
                    const isCurrent = idx === currentIndex;
                    
                    let dateStr = null;
                    if (isCompleted) {
                        if (idx === 0) dateStr = formatDateBR(pedido?.data_raw || pedido?.created_at);
                        if (idx === 1) dateStr = getLogDate('PAGAMENTO|PAGO|SEPARA');
                        if (idx === 2) dateStr = getLogDate('SEPARADO|EXPEDIÇÃO|MELHOR ENVIO');
                        if (idx === 3) dateStr = getLogDate('DESPACHADO|ENVIADO');
                        if (idx === 4) dateStr = getLogDate('ENTREGUE');
                    }

                    return (
                        <div key={step} className="relative z-10 flex flex-col items-center px-2 bg-slate-50/50 w-24">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20, delay: idx * 0.15 }} className={`w-8 h-8 rounded-full border-4 flex items-center justify-center transition-colors duration-200 mb-2 ${isCompleted ? 'bg-sky-400 border-white text-white shadow-md ring-4 ring-sky-100' : 'bg-white border-slate-200 text-slate-300'}`}>
                                {isCompleted ? <Icons.Check className="w-4 h-4"/> : <Icons.Box className="w-4 h-4"/>}
                            </motion.div>
                            <span className={`text-[10px] font-black uppercase tracking-widest text-center leading-tight mb-1 ${isCurrent ? 'text-sky-600' : isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>{flowLabels[idx]}</span>
                            {dateStr && <span className="text-[9px] font-bold text-slate-400 text-center">{dateStr}</span>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

