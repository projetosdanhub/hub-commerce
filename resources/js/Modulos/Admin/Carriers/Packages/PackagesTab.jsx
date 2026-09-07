import React from 'react';
import { motion } from 'framer-motion';
import { CarriersIcons, TableSkeleton } from '../Shared/CarriersUI';

export default function PackagesTab({ embalagens, loadingPackages, onEdit, onDelete }) {
    return (
        <motion.div key="TAB_EMBALAGENS" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2"><CarriersIcons.Box className="w-6 h-6 text-blue-500"/> Minhas Caixas e Embalagens</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Crie as embalagens que você mais usa</p>
            </div>
            {loadingPackages ? (
                <TableSkeleton />
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="bg-white border-b border-slate-200 text-[10px] text-slate-500 uppercase tracking-widest font-black">
                                <th className="p-5 pl-8">Identificação</th>
                                <th className="p-5 text-center">Dimensões (A x L x C)</th>
                                <th className="p-5 text-center">Peso Vazia</th>
                                <th className="p-5 text-center">Padrão?</th>
                                <th className="p-5 pr-8 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {embalagens.length === 0 ? (
                                <tr><td colSpan="5" className="p-16 text-center text-slate-400 font-bold uppercase tracking-wider">Nenhuma embalagem cadastrada.</td></tr>
                            ) : embalagens.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="p-5 pl-8 font-black text-slate-800 text-sm">{p.nome}</td>
                                <td className="p-5 text-center font-mono font-bold text-slate-600">{p.altura} x {p.largura} x {p.comprimento} cm</td>
                                <td className="p-5 text-center font-bold text-slate-600">{p.peso_vazio} kg</td>
                                <td className="p-5 text-center">
                                    {p.is_default ? <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[9px] font-black uppercase px-2 py-1 rounded shadow-sm">Padrão</span> : <span className="text-slate-300">-</span>}
                                </td>
                                <td className="p-5 pr-8 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => onEdit(p)} className="w-9 h-9 flex items-center justify-center bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition-colors border border-sky-100 shadow-sm"><CarriersIcons.Edit /></button>
                                        <button onClick={() => window.confirm('Deseja excluir esta caixa?') && onDelete(p.id)} className="w-9 h-9 flex items-center justify-center bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition-colors border border-rose-100 shadow-sm"><CarriersIcons.Trash /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </motion.div>
    );
}
