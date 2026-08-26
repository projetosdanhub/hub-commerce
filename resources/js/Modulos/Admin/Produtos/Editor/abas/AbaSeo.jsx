import React from 'react';
import { Icons } from '../../Compartilhado/Icones';

export default function AbaSeo({ p, setP }) {
    const calcularProgresso = (texto, max) => {
        if (!texto) return 0;
        return Math.min(100, (texto.length / max) * 100);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-4">Otimização (SEO)</h3>
                    <div className="space-y-5">
                        <div className="group/input">
                            <div className="flex justify-between items-end mb-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Meta Title</label>
                                <span className={`text-[10px] font-bold ${(p.metaTitle?.length || 0) > 60 ? 'text-amber-500' : 'text-slate-400'}`}>
                                    {p.metaTitle?.length || 0}/60
                                </span>
                            </div>
                            <input 
                                type="text" 
                                value={p.metaTitle || ''} 
                                onChange={e => setP({...p, metaTitle: e.target.value})} 
                                placeholder="Título para mecanismos de busca"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                            />
                            <div className="h-1 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                                <div className={`h-full ${(p.metaTitle?.length || 0) > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${calcularProgresso(p.metaTitle, 60)}%` }}></div>
                            </div>
                        </div>

                        <div className="group/input">
                            <div className="flex justify-between items-end mb-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Meta Description</label>
                                <span className={`text-[10px] font-bold ${(p.metaDesc?.length || 0) > 160 ? 'text-amber-500' : 'text-slate-400'}`}>
                                    {p.metaDesc?.length || 0}/160
                                </span>
                            </div>
                            <textarea 
                                rows="3"
                                value={p.metaDesc || ''} 
                                onChange={e => setP({...p, metaDesc: e.target.value})} 
                                placeholder="Resumo do produto para os resultados do Google..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 resize-none"
                            ></textarea>
                            <div className="h-1 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                                <div className={`h-full ${(p.metaDesc?.length || 0) > 160 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${calcularProgresso(p.metaDesc, 160)}%` }}></div>
                            </div>
                        </div>

                        <div className="group/input">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Slug da URL</label>
                            <div className="flex bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:bg-white focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                                <div className="px-3 py-3 text-slate-400 text-sm border-r border-slate-200 select-none bg-slate-100/50">
                                    /produto/
                                </div>
                                <input 
                                    type="text" 
                                    value={p.slug || ''} 
                                    onChange={e => setP({...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})} 
                                    placeholder="nome-do-produto"
                                    className="flex-1 min-w-0 bg-transparent px-3 py-3 text-sm text-slate-700 font-medium outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-4">Preview no Google</h3>
                    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm max-w-sm">
                        <div className="text-[#1a0dab] text-lg font-normal truncate hover:underline cursor-pointer">
                            {p.metaTitle || p.nome || 'Título do Produto'}
                        </div>
                        <div className="text-[#006621] text-sm truncate mt-0.5">
                            https://sualoja.com.br/produto/{p.slug || 'nome-do-produto'}
                        </div>
                        <div className="text-[#545454] text-sm mt-1 line-clamp-2">
                            {p.metaDesc || p.descricao?.substring(0, 160) || 'Forneça uma meta descrição atrativa para aumentar a taxa de clique dos usuários nos mecanismos de busca.'}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-4">Google Merchant / Shopping</h3>
                    <div className="space-y-4">
                        <div className="group/input">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Condição do Item</label>
                            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10">
                                <option value="new">Novo</option>
                                <option value="refurbished">Recondicionado</option>
                                <option value="used">Usado</option>
                            </select>
                        </div>
                        <div className="group/input">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Categoria Google (Opcional)</label>
                            <input 
                                type="text" 
                                placeholder="ID ou Caminho da Categoria Google"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}