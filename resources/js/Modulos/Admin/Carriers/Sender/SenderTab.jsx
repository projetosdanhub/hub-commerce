import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CarriersIcons, FormSkeleton } from '../Shared/CarriersUI';
import { TopActionBar, ScrollToTopButton } from '../../Shared/TopActionBar';

export default function SenderTab({ senderForm, setSenderForm, onSave, isSaving, isLoading }) {
    const [isFetchingCep, setIsFetchingCep] = useState(false);

    const fetchCepData = async (cepStr) => {
        const novoCep = cepStr.replace(/\D/g, '');
        setSenderForm(prev => ({ ...prev, cep: novoCep }));
        
        if (novoCep.length === 8) {
            setIsFetchingCep(true);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${novoCep}/json/`);
                const data = await response.json();
                if (!data.erro) { 
                    setSenderForm(prev => ({ 
                        ...prev, 
                        rua: data.logradouro, 
                        bairro: data.bairro, 
                        cidade: data.localidade, 
                        uf: data.uf 
                    })); 
                } 
            } catch (error) { 
                console.error("Erro CEP", error); 
            } finally { 
                setIsFetchingCep(false); 
            }
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        onSave();
    };

    return (
        <motion.div key="TAB_REMETENTE" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px] relative">
            <TopActionBar 
                onSave={handleSave} 
                isSaving={isSaving} 
                saveText="Salvar Remetente"
                showCancel={false}
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-blue-500 shadow-sm"><CarriersIcons.User className="w-5 h-5"/></div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Configuração do Remetente (Loja)</h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Dados para geração de etiquetas</p>
                    </div>
                </div>
            </TopActionBar>
            
            <div className="p-6 sm:p-8 flex-1 overflow-y-auto custom-scrollbar">
            {isLoading ? (
                <FormSkeleton />
            ) : (
                <form onSubmit={handleSave} className="max-w-4xl mx-auto space-y-8">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2"><CarriersIcons.User className="w-5 h-5 text-blue-500" /> Dados Principais</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Nome / Razão Social *</label><input type="text" required value={senderForm.nome} onChange={e=>setSenderForm({...senderForm, nome: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner" placeholder="Minha Loja LTDA" /></div>
                            <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">CPF / CNPJ *</label><input type="text" required value={senderForm.documento} onChange={e=>setSenderForm({...senderForm, documento: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner" /></div>
                            <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">E-mail *</label><input type="email" required value={senderForm.email} onChange={e=>setSenderForm({...senderForm, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner" /></div>
                            <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Telefone *</label><input type="text" required value={senderForm.telefone} onChange={e=>setSenderForm({...senderForm, telefone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner" /></div>
                        </div>
                    </div>
                    
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2"><CarriersIcons.MapPin className="w-5 h-5 text-emerald-500" /> Endereço de Coleta</h3>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                            <div className="md:col-span-2 relative">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">CEP (Auto) *</label>
                                <input type="text" required maxLength={8} value={senderForm.cep} onChange={(e) => fetchCepData(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-mono font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner" placeholder="00000000" />
                                {isFetchingCep && <div className="absolute right-4 top-10"><CarriersIcons.Spinner className="text-emerald-500 w-5 h-5"/></div>}
                            </div>
                            <div className="md:col-span-3"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Rua *</label><input type="text" required value={senderForm.rua} onChange={e=>setSenderForm({...senderForm, rua: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner" /></div>
                            <div className="md:col-span-1"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Nº *</label><input type="text" required value={senderForm.numero} onChange={e=>setSenderForm({...senderForm, numero: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner text-center" /></div>
                            <div className="md:col-span-3"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Bairro *</label><input type="text" required value={senderForm.bairro} onChange={e=>setSenderForm({...senderForm, bairro: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner" /></div>
                            <div className="md:col-span-2"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Cidade *</label><input type="text" required value={senderForm.cidade} onChange={e=>setSenderForm({...senderForm, cidade: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner" /></div>
                            <div className="md:col-span-1"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">UF *</label><input type="text" required maxLength={2} value={senderForm.uf} onChange={e=>setSenderForm({...senderForm, uf: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner text-center uppercase" /></div>
                        </div>
                    </div>
                </form>
            )}
            </div>
            <ScrollToTopButton />
        </motion.div>
    );
}