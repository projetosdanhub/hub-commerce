import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Icons } from '../../Compartilhado/Icones';

export default function ModalGeradorVariaveis({ isOpen, onClose, onGenerate }) {
    const [atributos, setAtributos] = useState([{ nome: '', valores: '' }]);

    if (!isOpen) return null;

    const handleAddAtributo = () => {
        setAtributos([...atributos, { nome: '', valores: '' }]);
    };

    const handleRemoveAtributo = (index) => {
        const novos = [...atributos];
        novos.splice(index, 1);
        setAtributos(novos);
    };

    const handleChangeAtributo = (index, campo, valor) => {
        const novos = [...atributos];
        novos[index][campo] = valor;
        setAtributos(novos);
    };

    const generateCartesianProduct = (arrays) => {
        return arrays.reduce((acc, curr) => {
            return acc.flatMap(c => curr.map(n => [...c, n]));
        }, [[]]);
    };

    const handleConfirm = () => {
        const validAtributos = atributos.filter(a => a.nome.trim() !== '' && a.valores.trim() !== '');
        if (validAtributos.length === 0) {
            onClose();
            return;
        }

        const matrix = validAtributos.map(a => 
            a.valores.split(',').map(v => v.trim()).filter(v => v !== '')
        );

        const combinacoes = generateCartesianProduct(matrix);

        const novasVariaveis = combinacoes.map(comb => {
            return {
                nome: comb.join(' - '),
                sku: '',
                preco: '',
                estoque: 0,
                status: 'ATIVO'
            };
        });

        onGenerate(novasVariaveis);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={onClose}
            />
            
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <Icons.Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Gerador em Massa</h3>
                            <p className="text-sm text-slate-500">Crie combinações automaticamente (ex: Cor x Tamanho)</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                        <Icons.Close className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="space-y-4">
                        {atributos.map((atrib, index) => (
                            <div key={index} className="flex gap-4 items-start bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="flex-1 space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Propriedade</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Tamanho"
                                        value={atrib.nome}
                                        onChange={e => handleChangeAtributo(index, 'nome', e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div className="flex-[2] space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Valores (separados por vírgula)</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: P, M, G, GG"
                                        value={atrib.valores}
                                        onChange={e => handleChangeAtributo(index, 'valores', e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <button 
                                    onClick={() => handleRemoveAtributo(index)}
                                    className="mt-7 w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0"
                                    title="Remover Propriedade"
                                >
                                    <Icons.Trash className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={handleAddAtributo}
                        className="mt-4 px-4 py-2 border border-dashed border-slate-300 rounded-xl text-sm font-bold text-slate-600 flex items-center justify-center gap-2 w-full hover:bg-slate-50 hover:border-slate-400 transition-colors"
                    >
                        <Icons.Plus className="w-4 h-4" /> Adicionar Propriedade
                    </button>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleConfirm}
                        className="px-6 py-2.5 rounded-xl font-bold text-sm bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Icons.Check className="w-4 h-4" /> Gerar Combinações
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
