import React from 'react';
import { motion } from 'framer-motion';
import { CarriersIcons, TableSkeleton, CardsSkeleton } from '../Compartilhado/CarriersUI';

export default function PartnersTab({ transportadoras, isLoading, onEdit, onDetail, onDelete, onToggleStatus }) {
    const handleToggleStatus = (t, e) => {
        e.stopPropagation();
        const action = t.status === 'ATIVA' ? 'desativar' : 'reativar';
        const reason = window.prompt(`Qual o motivo para ${action} a transportadora ${t.nome}?`);
        if (reason !== null && reason.trim() !== '') {
            onToggleStatus(t.id, { status: t.status === 'ATIVA' ? 'INATIVA' : 'ATIVA', status_reason: reason });
        } else if (reason !== null) {
            alert('O motivo é obrigatório.');
        }
    };

    return (
        <motion.div key="TAB_MANUAIS" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[500px]">
            <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">Cotação Própria</h2>
                    <p className="text-sm text-slate-500 mt-1">Configure transportadoras avulsas para opções manuais de despacho.</p>
                </div>
            </div>
            
            {isLoading ? (
                <div className="p-6 sm:p-8">
                    <CardsSkeleton />
                </div>
            ) : (
                <div className="flex flex-col divide-y divide-slate-100">
                    {transportadoras.length === 0 ? (
                        <div className="m-6 sm:m-8 p-16 text-center text-slate-400 font-bold uppercase tracking-wider border-2 border-dashed border-slate-200 rounded-2xl">Nenhuma transportadora manual cadastrada.</div>
                    ) : (
                        transportadoras.map(t => (
                            <div 
                                key={t.id} 
                                    onClick={() => onDetail(t)}
                                    className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 transition-all cursor-pointer group ${t.status === 'ATIVA' ? 'hover:bg-blue-50/50' : 'opacity-70 grayscale-[0.5] hover:bg-slate-100/50'}`}
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2 shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                                            {t.imagem ? <img src={t.imagem} className="max-w-full max-h-full object-contain mix-blend-multiply" alt=""/> : <CarriersIcons.Truck className="w-6 h-6 text-slate-300"/>}
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="font-black text-slate-800 text-base group-hover:text-blue-700 transition-colors">{t.nome}</span>
                                                <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${t.status === 'ATIVA' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                    {t.status}
                                                </div>
                                            </div>
                                            {t.created_at && <span className="text-[10px] font-bold text-slate-400">Adicionada em {new Date(t.created_at).toLocaleDateString('pt-BR')}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-6 w-full sm:w-auto mt-4 sm:mt-0 border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
                                        <div className="flex flex-col items-start sm:items-end">
                                            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">Envios</span>
                                            <span className="font-black text-slate-700 text-sm">{t.pedidos_count || 0}</span>
                                        </div>
                                        <div className="flex flex-col items-start sm:items-end">
                                            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">Prazo</span>
                                            <span className="font-bold text-blue-600 text-xs bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded shadow-sm">{t.tempo_entrega}</span>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4 border-l border-slate-200 pl-4">
                                            <button onClick={(e) => { e.stopPropagation(); onEdit(t); }} className="w-8 h-8 flex items-center justify-center bg-white text-slate-500 rounded-lg hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200 transition-colors border border-slate-200 shadow-sm" title="Editar"><CarriersIcons.Edit className="w-3.5 h-3.5" /></button>
                                            
                                            {(t.pedidos_count > 0 || t.status === 'INATIVA') ? (
                                                <button onClick={(e) => handleToggleStatus(t, e)} className="w-8 h-8 flex items-center justify-center bg-white text-slate-500 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200 shadow-sm" title={t.status === 'ATIVA' ? "Desativar" : "Reativar"}>
                                                    {t.status === 'ATIVA' ? <CarriersIcons.AlertTriangle className="w-3.5 h-3.5" /> : <CarriersIcons.Refresh className="w-3.5 h-3.5" />}
                                                </button>
                                            ) : (
                                                <button onClick={(e) => { e.stopPropagation(); window.confirm('Deseja excluir?') && onDelete(t.id); }} className="w-8 h-8 flex items-center justify-center bg-white text-slate-500 rounded-lg hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-colors border border-slate-200 shadow-sm" title="Excluir"><CarriersIcons.Trash className="w-3.5 h-3.5" /></button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                        ))
                    )}
                </div>
            )}
        </motion.div>
    );
}
