import React from 'react';
import { Icons } from '../../Compartilhado/Icones';

export default function AbaFichaTecnica({ p, setP }) {
    const ficha = p.fichaTecnica || [];

    const handleAddAtributo = () => {
        setP({ ...p, fichaTecnica: [...ficha, { atributo: '', valor: '' }] });
    };

    const handleRemoveAtributo = (index) => {
        const novaFicha = [...ficha];
        novaFicha.splice(index, 1);
        setP({ ...p, fichaTecnica: novaFicha });
    };

    const handleChangeAtributo = (index, campo, valor) => {
        const novaFicha = [...ficha];
        novaFicha[index][campo] = valor;
        setP({ ...p, fichaTecnica: novaFicha });
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Ficha Técnica</h3>
                    <p className="text-xs text-slate-500 mt-1">Defina características detalhadas (material, cor, voltagem, etc.)</p>
                </div>
                <button 
                    onClick={handleAddAtributo}
                    className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors"
                >
                    <Icons.Plus className="w-4 h-4" /> Adicionar Atributo
                </button>
            </div>

            {ficha.length === 0 ? (
                <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    <Icons.Layout className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-500">Nenhum atributo cadastrado.</p>
                    <p className="text-xs text-slate-400 mt-1">Adicione atributos para enriquecer os detalhes do produto.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="grid grid-cols-12 gap-4 px-4 pb-2 border-b border-slate-100">
                        <div className="col-span-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Atributo</div>
                        <div className="col-span-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valor</div>
                        <div className="col-span-1"></div>
                    </div>
                    {ficha.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-4 items-center group">
                            <div className="col-span-5">
                                <input 
                                    type="text" 
                                    placeholder="Ex: Material"
                                    value={item.atributo}
                                    onChange={(e) => handleChangeAtributo(index, 'atributo', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                />
                            </div>
                            <div className="col-span-6">
                                <input 
                                    type="text" 
                                    placeholder="Ex: Algodão"
                                    value={item.valor}
                                    onChange={(e) => handleChangeAtributo(index, 'valor', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                />
                            </div>
                            <div className="col-span-1 flex justify-end">
                                <button 
                                    onClick={() => handleRemoveAtributo(index)}
                                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="Remover"
                                >
                                    <Icons.Trash className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}