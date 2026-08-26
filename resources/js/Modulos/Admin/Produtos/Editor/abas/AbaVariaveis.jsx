import React, { useState } from 'react';
import { Icons } from '../../Compartilhado/Icones';

export default function AbaVariaveis({ p, setP }) {
    const vars = p.variaveis || [];

    const handleAddVariacao = () => {
        const nova = {
            sku: '',
            nome: '',
            preco: p.preco || '',
            estoque: 0,
            status: 'ATIVO'
        };
        setP({...p, variaveis: [...vars, nova]});
    };

    const handleRemove = (index) => {
        const nv = [...vars];
        nv.splice(index, 1);
        setP({...p, variaveis: nv});
    };

    const handleChange = (index, campo, valor) => {
        const nv = [...vars];
        nv[index][campo] = valor;
        setP({...p, variaveis: nv});
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Grade de Variações</h3>
                        <p className="text-xs text-slate-500 mt-1">Gerencie produtos com diferentes cores, tamanhos, etc.</p>
                    </div>
                    <button 
                        onClick={handleAddVariacao}
                        className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                        <Icons.Plus className="w-4 h-4" /> Adicionar Variação Manual
                    </button>
                </div>

                {vars.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                        <Icons.Layers className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm font-medium text-slate-500">Este produto é simples e não possui variações.</p>
                        <p className="text-xs text-slate-400 mt-1">Adicione variações caso ele possua opções como Cor ou Tamanho.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">Imagem</th>
                                    <th className="px-4 py-3 min-w-[150px]">Opção/Combinação *</th>
                                    <th className="px-4 py-3">SKU</th>
                                    <th className="px-4 py-3">Preço (R$)</th>
                                    <th className="px-4 py-3">Estoque</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {vars.map((v, index) => (
                                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-2">
                                            <div className="w-10 h-10 rounded border border-slate-200 bg-slate-100 flex items-center justify-center cursor-pointer hover:border-blue-400 group overflow-hidden">
                                                {v.img ? (
                                                    <img src={v.img} alt="Var" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Icons.Image className="w-4 h-4 text-slate-300 group-hover:text-blue-400" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <input 
                                                type="text" 
                                                value={v.nome} 
                                                onChange={e => handleChange(index, 'nome', e.target.value)}
                                                placeholder="Ex: Preto - P"
                                                className="w-full bg-transparent border-b border-dashed border-slate-300 pb-1 outline-none focus:border-blue-500 font-medium text-slate-800 text-sm"
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <input 
                                                type="text" 
                                                value={v.sku} 
                                                onChange={e => handleChange(index, 'sku', e.target.value.toUpperCase())}
                                                placeholder="SKU"
                                                className="w-24 bg-transparent border-b border-dashed border-slate-300 pb-1 outline-none focus:border-blue-500 font-mono text-xs"
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <input 
                                                type="number" 
                                                value={v.preco} 
                                                onChange={e => handleChange(index, 'preco', e.target.value)}
                                                className="w-24 bg-transparent border-b border-dashed border-slate-300 pb-1 outline-none focus:border-blue-500 font-medium text-sm"
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <input 
                                                type="number" 
                                                value={v.estoque} 
                                                onChange={e => handleChange(index, 'estoque', e.target.value)}
                                                className="w-20 bg-transparent border-b border-dashed border-slate-300 pb-1 outline-none focus:border-blue-500 text-sm"
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <select 
                                                value={v.status} 
                                                onChange={e => handleChange(index, 'status', e.target.value)}
                                                className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 cursor-pointer"
                                            >
                                                <option value="ATIVO">Ativo</option>
                                                <option value="INATIVO">Inativo</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <button 
                                                onClick={() => handleRemove(index)}
                                                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors"
                                            >
                                                <Icons.Trash className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}