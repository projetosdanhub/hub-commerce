// ============================================================================
// FICHEIRO: resources/js/Modulos/Admin/Pixels/Acionadores/AcionadoresPersonalizados.jsx
// Tabela de acionadores customizados (GTM) com paginação
// ============================================================================
import React from 'react';
import {
    AppWindow, Plus, Edit, Trash2, Target,
    MousePointer2, Globe, ArrowDownToLine, Clock,
    Eye, ArrowLeft, Zap, ChevronLeft, ChevronRight
} from 'lucide-react';

const AcionadoresPersonalizados = ({
    acionadoresPaginados,
    paginaAtual,
    setPaginaAtual,
    totalPaginas,
    itensPorPagina,
    setItensPorPagina,
    onEdit,
    onDelete,
    onNovaRegra,
}) => {
    return (
        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center"><AppWindow className="w-6 h-6" /></div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Acionadores Personalizados (GTM)</h2>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Disparos manuais que exigem verificação de Domínio Alvo.</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
                    {/* Paginação */}
                    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm">
                        <span className="text-xs text-slate-500 font-medium px-2">Pág {paginaAtual} de {totalPaginas || 1}</span>
                        <select 
                            value={itensPorPagina} 
                            onChange={(e) => { setItensPorPagina(Number(e.target.value)); setPaginaAtual(1); }}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none text-slate-600 focus:border-blue-500 transition-colors cursor-pointer"
                        >
                            <option value={10}>10 p/ pág</option>
                            <option value={20}>20 p/ pág</option>
                            <option value={30}>30 p/ pág</option>
                            <option value={50}>50 p/ pág</option>
                        </select>
                        <div className="flex gap-1 border-l border-slate-200 pl-2">
                            <button onClick={() => setPaginaAtual(prev => Math.max(1, prev - 1))} disabled={paginaAtual === 1} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-30 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                            <button onClick={() => setPaginaAtual(prev => Math.min(totalPaginas, prev + 1))} disabled={paginaAtual === totalPaginas || totalPaginas === 0} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-30 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                    
                    <button onClick={onNovaRegra} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 w-full sm:w-auto whitespace-nowrap">
                        <Plus className="w-4 h-4"/> Nova Regra
                    </button>
                </div>
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
                                        <button onClick={() => onEdit(acionador)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4"/></button>
                                        <button onClick={() => onDelete(acionador.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {acionadoresPaginados.length === 0 && <tr><td colSpan="6" className="p-10 text-center text-slate-400 text-sm">Nenhuma regra customizada. Vá em frente e crie a primeira!</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AcionadoresPersonalizados;
