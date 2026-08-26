import React from 'react';
import { Icons } from '../../Compartilhado/Icones';

export default function AbaEstoque({ p, setP }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-4">Gestão de Inventário</h3>
                    <div className="space-y-4">
                        <label className="flex items-center gap-3 p-4 bg-slate-50/50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                            <input 
                                type="checkbox" 
                                checked={p.controlarEstoque !== false} 
                                onChange={e => setP({...p, controlarEstoque: e.target.checked})}
                                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                            />
                            <div>
                                <div className="text-sm font-bold text-slate-800">Controlar Estoque Físico</div>
                                <div className="text-xs text-slate-500">Se desativado, o produto sempre estará disponível.</div>
                            </div>
                        </label>

                        {p.controlarEstoque !== false && (
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="group/input">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Quantidade Disponível</label>
                                    <input 
                                        type="number" 
                                        value={p.estoque !== undefined ? p.estoque : ''} 
                                        onChange={e => setP({...p, estoque: e.target.value})} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-base font-black text-slate-800 outline-none focus:bg-white focus:ring-4 focus:border-blue-400"
                                    />
                                </div>
                                <div className="group/input">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Alerta de Estoque Baixo</label>
                                    <input 
                                        type="number" 
                                        value={p.alertaEstoque || 5} 
                                        onChange={e => setP({...p, alertaEstoque: e.target.value})} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-base font-bold text-amber-600 outline-none focus:bg-white focus:ring-4 focus:border-amber-400"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-4">Venda e Encomenda</h3>
                    <div className="space-y-4">
                        <label className="flex items-center gap-3 p-4 bg-slate-50/50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                            <input 
                                type="checkbox" 
                                checked={p.preVenda || false} 
                                onChange={e => setP({...p, preVenda: e.target.checked})}
                                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                            />
                            <div>
                                <div className="text-sm font-bold text-slate-800">Vender sem estoque (Sob Encomenda / Pré-venda)</div>
                                <div className="text-xs text-slate-500">Permite compras mesmo com estoque zerado.</div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}