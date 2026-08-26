import React from 'react';
import { Icons } from '../../Compartilhado/Icones';

export default function AbaGeral({ p, setP, erros, setErros, categorias }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-4">Informações Básicas</h3>
                    <div className="space-y-4">
                        <div className="group/input">
                            <label className="text-[10px] font-bold text-slate-500 group-focus-within/input:text-blue-600 uppercase block mb-1.5 transition-colors">
                                Nome do Produto *
                            </label>
                            <input 
                                type="text" 
                                value={p.nome} 
                                onChange={e => { setErros({...erros, nome: false}); setP({...p, nome: e.target.value}); }} 
                                placeholder="Ex: Cadeira Ergônomica..."
                                className={`w-full bg-slate-50/50 border ${erros.nome ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-blue-500/20'} rounded-xl px-5 py-3.5 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:ring-4 focus:border-blue-400 transition-all shadow-sm`} 
                            />
                            {erros.nome && <span className="text-[10px] text-rose-500 font-bold mt-1 block">O nome é obrigatório</span>}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="group/input">
                                <label className="text-[10px] font-bold text-slate-500 group-focus-within/input:text-blue-600 uppercase block mb-1.5 transition-colors">
                                    SKU Principal (Mestre)
                                </label>
                                <div className="flex">
                                    <div className="bg-slate-100 border border-slate-200 border-r-0 rounded-l-xl px-4 py-3.5 text-sm font-bold text-slate-500 flex items-center shadow-sm">
                                        <input type="text" value={p.skuRef} onChange={e => setP({...p, skuRef: e.target.value.toUpperCase()})} placeholder="REF" className="w-16 bg-transparent outline-none text-center" />
                                        <span>-</span>
                                    </div>
                                    <input type="text" value={p.skuSufixo} onChange={e => setP({...p, skuSufixo: e.target.value.toUpperCase()})} placeholder="SUFIXO (Automático se vazio)" className="flex-1 min-w-0 bg-slate-50/50 border border-slate-200 rounded-r-xl px-5 py-3.5 text-sm font-mono font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all shadow-sm" />
                                </div>
                            </div>
                            <div className="group/input">
                                <label className="text-[10px] font-bold text-slate-500 group-focus-within/input:text-blue-600 uppercase block mb-1.5 transition-colors">
                                    Status
                                </label>
                                <select value={p.status} onChange={e => setP({...p, status: e.target.value})} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-5 py-3.5 text-sm font-black text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all shadow-sm cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_16px_center] bg-no-repeat pr-10">
                                    <option value="ATIVO">ATIVO - Visível na loja</option>
                                    <option value="INATIVO">INATIVO - Oculto</option>
                                </select>
                            </div>
                        </div>
                        <div className="group/input">
                            <label className="text-[10px] font-bold text-slate-500 group-focus-within/input:text-blue-600 uppercase block mb-1.5 transition-colors">
                                Categoria Principal *
                            </label>
                            <select 
                                value={p.categoriaPrincipal} 
                                onChange={e => { setErros({...erros, categoriaPrincipal: false}); setP({...p, categoriaPrincipal: e.target.value}); }}
                                className={`w-full bg-slate-50/50 border ${erros.categoriaPrincipal ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-blue-500/20'} rounded-xl px-5 py-3.5 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:ring-4 focus:border-blue-400 transition-all shadow-sm cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_16px_center] bg-no-repeat pr-10`}
                            >
                                <option value="">Selecione uma categoria...</option>
                                {categorias.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                            </select>
                            {erros.categoriaPrincipal && <span className="text-[10px] text-rose-500 font-bold mt-1 block">Selecione a categoria</span>}
                        </div>
                        <div className="group/input">
                            <label className="text-[10px] font-bold text-slate-500 group-focus-within/input:text-blue-600 uppercase block mb-1.5 transition-colors">
                                Descrição Completa
                            </label>
                            <textarea 
                                value={p.descricao} 
                                onChange={e => setP({...p, descricao: e.target.value})} 
                                rows="6" 
                                placeholder="Descreva os detalhes, características e diferenciais do produto..."
                                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all shadow-sm resize-y min-h-[120px]" 
                            ></textarea>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-4">Preço</h3>
                    <div className="space-y-4">
                        <div className="group/input">
                            <label className="text-[10px] font-bold text-slate-500 group-focus-within/input:text-blue-600 uppercase block mb-1.5 transition-colors">
                                Preço de Venda *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="text-slate-400 font-bold text-sm">R$</span>
                                </div>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    min="0"
                                    value={p.preco} 
                                    onChange={e => { setErros({...erros, preco: false}); setP({...p, preco: e.target.value}); }} 
                                    className={`w-full bg-slate-50/50 border ${erros.preco ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-blue-500/20'} rounded-xl pl-10 pr-4 py-3.5 text-base font-black text-slate-800 outline-none focus:bg-white focus:ring-4 focus:border-blue-400 transition-all shadow-sm`} 
                                />
                            </div>
                            {erros.preco && <span className="text-[10px] text-rose-500 font-bold mt-1 block">Preço inválido</span>}
                        </div>
                        <div className="group/input">
                            <label className="text-[10px] font-bold text-slate-500 group-focus-within/input:text-blue-600 uppercase block mb-1.5 transition-colors">
                                Preço Promocional (Opcional)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="text-emerald-500 font-bold text-sm">R$</span>
                                </div>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    min="0"
                                    value={p.precoPromo} 
                                    onChange={e => setP({...p, precoPromo: e.target.value})} 
                                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-4 py-3.5 text-base font-black text-emerald-600 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all shadow-sm placeholder:text-emerald-300 placeholder:font-medium" 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}