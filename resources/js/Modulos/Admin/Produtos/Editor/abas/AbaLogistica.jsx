import React from 'react';
import { Icons } from '../../Compartilhado/Icones';

export default function AbaLogistica({ p, setP }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-4">Peso e Dimensões</h3>
                <p className="text-xs text-slate-500 mb-6">Usados para calcular o valor do frete na loja.</p>

                <div className="space-y-5">
                    <div className="group/input">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Peso Bruto (kg)</label>
                        <input 
                            type="number" 
                            step="0.001"
                            placeholder="0.000"
                            value={p.peso || ''} 
                            onChange={e => setP({...p, peso: e.target.value})} 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                        />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                        <div className="group/input">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Largura (cm)</label>
                            <input 
                                type="number" 
                                step="0.1"
                                placeholder="0.0"
                                value={p.largura || ''} 
                                onChange={e => setP({...p, largura: e.target.value})} 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                            />
                        </div>
                        <div className="group/input">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Altura (cm)</label>
                            <input 
                                type="number" 
                                step="0.1"
                                placeholder="0.0"
                                value={p.altura || ''} 
                                onChange={e => setP({...p, altura: e.target.value})} 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                            />
                        </div>
                        <div className="group/input">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Compr. (cm)</label>
                            <input 
                                type="number" 
                                step="0.1"
                                placeholder="0.0"
                                value={p.comp || ''} 
                                onChange={e => setP({...p, comp: e.target.value})} 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-4">Opções Logísticas</h3>
                
                <div className="space-y-4">
                    <label className="flex items-center gap-3 p-4 bg-slate-50/50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                        <input 
                            type="checkbox" 
                            checked={p.agrupavel !== false} 
                            onChange={e => setP({...p, agrupavel: e.target.checked})}
                            className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                        />
                        <div>
                            <div className="text-sm font-bold text-slate-800">Agrupável no Carrinho</div>
                            <div className="text-xs text-slate-500">Permite colocar vários na mesma caixa no envio.</div>
                        </div>
                    </label>

                    <div className="group/input mt-4">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Prazo adicional de manuseio (dias)</label>
                        <input 
                            type="number" 
                            placeholder="Ex: 2"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}