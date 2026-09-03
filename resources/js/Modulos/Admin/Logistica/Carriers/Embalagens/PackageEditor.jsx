import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CarriersIcons, screenTransition } from '../Compartilhado/CarriersUI';

export default function PackageEditor({ packageToEdit, onCancel, onSave, isSaving }) {
    const defaultPackage = { id: null, nome: '', altura: '', largura: '', comprimento: '', peso_vazio: '', is_default: false };
    const [packageForm, setPackageForm] = useState(defaultPackage);

    useEffect(() => {
        if (packageToEdit) {
            setPackageForm({ ...packageToEdit });
        } else {
            setPackageForm(defaultPackage);
        }
    }, [packageToEdit]);

    const handleSave = () => {
        if (!packageForm.nome || !packageForm.altura || !packageForm.largura || !packageForm.comprimento || !packageForm.peso_vazio) {
            return alert("Preencha todas as dimensões da caixa.");
        }
        onSave(packageForm);
    };

    return (
        <div className="w-full bg-white sm:rounded-[32px] rounded-t-[32px] overflow-hidden flex flex-col min-h-[500px]">
            <header className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button onClick={onCancel} className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm"><CarriersIcons.ArrowLeft /></button>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-800">{packageForm.id ? 'Editar Embalagem' : 'Cadastrar Embalagem'}</h2>
                        <p className="text-xs font-medium text-slate-500 mt-1">Defina as caixas que você utiliza com mais frequência na sua loja.</p>
                    </div>
                </div>
            </header>
            <div className="p-6 sm:p-8 flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-3xl mx-auto space-y-6 pb-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Nome da Embalagem *</label>
                            <input type="text" value={packageForm.nome} onChange={e => setPackageForm({...packageForm, nome: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 shadow-inner" placeholder="Ex: Caixa Padrão Média" />
                        </div>
                        <div className="relative">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Altura (cm) *</label>
                            <input type="number" min="1" step="0.1" value={packageForm.altura} onChange={e => setPackageForm({...packageForm, altura: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-5 pr-10 py-4 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 shadow-inner" placeholder="Ex: 10" />
                            <span className="absolute right-4 top-[38px] text-[10px] text-slate-400 font-bold">cm</span>
                        </div>
                        <div className="relative">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Largura (cm) *</label>
                            <input type="number" min="11" step="0.1" value={packageForm.largura} onChange={e => setPackageForm({...packageForm, largura: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-5 pr-10 py-4 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 shadow-inner" placeholder="Mín: 11" />
                            <span className="absolute right-4 top-[38px] text-[10px] text-slate-400 font-bold">cm</span>
                        </div>
                        <div className="relative">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Comprimento (cm) *</label>
                            <input type="number" min="16" step="0.1" value={packageForm.comprimento} onChange={e => setPackageForm({...packageForm, comprimento: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-5 pr-10 py-4 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 shadow-inner" placeholder="Mín: 16" />
                            <span className="absolute right-4 top-[38px] text-[10px] text-slate-400 font-bold">cm</span>
                        </div>
                        <div className="relative">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Peso da Caixa Vazia (kg) *</label>
                            <input type="number" min="0" step="0.001" value={packageForm.peso_vazio} onChange={e => setPackageForm({...packageForm, peso_vazio: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-5 pr-10 py-4 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 shadow-inner" placeholder="Ex: 0.150" />
                            <span className="absolute right-4 top-[38px] text-[10px] text-slate-400 font-bold">kg</span>
                        </div>
                        <div className="md:col-span-2 pt-2">
                            <label className="flex items-center gap-3 cursor-pointer p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl hover:bg-emerald-50 transition-colors">
                                <input type="checkbox" checked={packageForm.is_default} onChange={e => setPackageForm({...packageForm, is_default: e.target.checked})} className="accent-emerald-600 w-5 h-5 shrink-0" />
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-emerald-900">Embalagem Padrão</span>
                                    <span className="text-[10px] text-emerald-700">Ao marcar, esta caixa virá pré-selecionada na tela de despacho de pedidos.</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <footer className="p-6 sm:p-8 border-t border-slate-100 bg-white flex justify-end gap-4 sticky bottom-0 z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
                <button onClick={onCancel} className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors shadow-sm">Cancelar</button>
                <button onClick={handleSave} disabled={isSaving} className="px-10 py-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md disabled:opacity-70">{isSaving ? <CarriersIcons.Spinner className="text-white w-5 h-5"/> : <CarriersIcons.CheckCircle className="w-5 h-5"/>} Salvar Embalagem</button>
            </footer>
        </div>
    );
}
