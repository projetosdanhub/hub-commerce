import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CarriersIcons, screenTransition } from '../Shared/CarriersUI';
import { TopActionBar, ScrollToTopButton } from '../../Shared/TopActionBar';

export default function CarrierEditor({ carrierToEdit, onCancel, onSave, isSaving }) {
    const defaultCarrier = { id: null, nome: '', tempo_entrega: '', status: 'ATIVA', imagemUrl: null, file: null, cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', referencia: '', vehicle_plate: '', vehicle_model: '', vehicle_type: '', document_rg_front_file: null, document_rg_back_file: null, document_cnh_file: null };
    const [carrierForm, setCarrierForm] = useState(defaultCarrier);
    const [isFetchingCep, setIsFetchingCep] = useState(false);

    useEffect(() => {
        if (carrierToEdit) {
            setCarrierForm({
                id: carrierToEdit.id,
                nome: carrierToEdit.nome,
                tempo_entrega: carrierToEdit.tempo_entrega,
                status: carrierToEdit.status,
                imagemUrl: carrierToEdit.imagem,
                file: null,
                cep: carrierToEdit.cep || '',
                rua: carrierToEdit.rua || '',
                numero: carrierToEdit.numero || '',
                complemento: carrierToEdit.complemento || '',
                bairro: carrierToEdit.bairro || '',
                cidade: carrierToEdit.cidade || '',
                uf: carrierToEdit.uf || '',
                referencia: carrierToEdit.referencia || '',
                vehicle_plate: carrierToEdit.vehicle_plate || '',
                vehicle_model: carrierToEdit.vehicle_model || '',
                vehicle_type: carrierToEdit.vehicle_type || '',
                document_rg_front_file: null,
                document_rg_back_file: null,
                document_cnh_file: null
            });
        }
    }, [carrierToEdit]);

    const fetchCepData = async (cepStr) => {
        const novoCep = cepStr.replace(/\D/g, '');
        setCarrierForm(prev => ({ ...prev, cep: novoCep }));
        
        if (novoCep.length === 8) {
            setIsFetchingCep(true);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${novoCep}/json/`);
                const data = await response.json();
                if (!data.erro) { 
                    setCarrierForm(prev => ({ ...prev, rua: data.logradouro, bairro: data.bairro, cidade: data.localidade, uf: data.uf })); 
                } 
            } catch (error) { 
                console.error("Erro CEP", error); 
            } finally { 
                setIsFetchingCep(false); 
            }
        }
    };

    const handleSave = () => {
        if (!carrierForm.nome || !carrierForm.tempo_entrega) {
            return alert("Preencha o Nome e o Prazo de Entrega.");
        }
        
        const formData = new FormData();
        Object.keys(carrierForm).forEach(key => { 
            if (key !== 'file' && key !== 'imagemUrl' && carrierForm[key] !== null) {
                formData.append(key, carrierForm[key]); 
            }
        });
        
        if (carrierForm.file) formData.append('arquivo', carrierForm.file);
        if (carrierForm.document_rg_front_file) formData.append('file_rg_front', carrierForm.document_rg_front_file);
        if (carrierForm.document_rg_back_file) formData.append('file_rg_back', carrierForm.document_rg_back_file);
        if (carrierForm.document_cnh_file) formData.append('file_cnh', carrierForm.document_cnh_file);
        
        onSave(formData);
    };

    return (
        <div className="w-full bg-slate-50/50 sm:rounded-2xl rounded-t-2xl overflow-hidden flex flex-col min-h-[600px] relative">
            <TopActionBar 
                onSave={handleSave} 
                onCancel={onCancel} 
                isSaving={isSaving} 
                saveText={carrierForm.id ? 'Atualizar Transportadora' : 'Registrar Transportadora'}
            >
                <div className="flex items-center gap-4">
                    <button onClick={onCancel} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm"><CarriersIcons.ArrowLeft className="w-4 h-4"/></button>
                    <div>
                        <h2 className="text-xl font-black text-slate-800">{carrierForm.id ? 'Editar Parceiro Logístico' : 'Novo Parceiro Logístico'}</h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Configuração de transportadora manual</p>
                    </div>
                </div>
            </TopActionBar>

            <div className="p-6 sm:p-8 flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto space-y-8 pb-10">
                    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 opacity-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-8 flex items-center gap-2 relative z-10"><CarriersIcons.Truck className="w-5 h-5 text-blue-500"/> Identificação Principal</h3>
                        <div className="flex flex-col sm:flex-row gap-8 relative z-10">
                            <label className="w-32 h-32 bg-slate-50 border-2 border-dashed border-slate-300 rounded-[20px] flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors relative overflow-hidden group shadow-sm shrink-0">
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files[0]; if(f) setCarrierForm({...carrierForm, file: f, imagemUrl: URL.createObjectURL(f)}); }} />
                                {carrierForm.imagemUrl ? (
                                    <><img src={carrierForm.imagemUrl} className="w-full h-full object-contain p-3 mix-blend-multiply absolute inset-0" alt=""/><div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><span className="text-[10px] text-white font-bold uppercase tracking-widest">Trocar</span></div></>
                                ) : (
                                    <><CarriersIcons.Upload className="w-8 h-8 text-slate-400 mb-2"/><span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Subir Logo</span></>
                                )}
                            </label>
                            <div className="flex-1 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Nome da Transportadora *</label><input type="text" value={carrierForm.nome} onChange={e => setCarrierForm({...carrierForm, nome: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner" placeholder="Ex: Transportes Rápidos Lda" /></div>
                                    <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Prazo Médio Simulado *</label><input type="text" value={carrierForm.tempo_entrega} onChange={e => setCarrierForm({...carrierForm, tempo_entrega: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner" placeholder="Ex: 2 a 4 dias úteis" /></div>
                                </div>
                                <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Status no Checkout</label><select value={carrierForm.status} onChange={e => setCarrierForm({...carrierForm, status: e.target.value})} className="w-full sm:w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer shadow-inner"><option value="ATIVA">Transportadora Ativa (Visível)</option><option value="INATIVA">Desativada (Oculta)</option></select></div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 opacity-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-8 flex items-center gap-2 relative z-10"><CarriersIcons.MapPin className="w-5 h-5 text-emerald-500"/> Sede / Endereço de Coleta</h3>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 relative z-10">
                            <div className="md:col-span-2 relative"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">CEP (Automático)</label><input type="text" maxLength={8} value={carrierForm.cep} onChange={(e) => fetchCepData(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-mono font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner" placeholder="00000000" />{isFetchingCep && <div className="absolute right-4 top-10"><CarriersIcons.Spinner className="text-emerald-500 w-5 h-5"/></div>}</div>
                            <div className="md:col-span-3"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Rua / Logradouro</label><div className="flex gap-3"><input type="text" value={carrierForm.rua} onChange={e => setCarrierForm({...carrierForm, rua: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner" placeholder="Nome da Rua" /><input type="text" value={carrierForm.numero} onChange={e => setCarrierForm({...carrierForm, numero: e.target.value})} className="w-28 bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner text-center" placeholder="Nº" /></div></div>
                            <div className="md:col-span-3"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Complemento</label><input type="text" value={carrierForm.complemento} onChange={e => setCarrierForm({...carrierForm, complemento: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner" placeholder="Galpão 3, Sala 2..." /></div>
                            <div className="md:col-span-3"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Bairro</label><input type="text" value={carrierForm.bairro} onChange={e => setCarrierForm({...carrierForm, bairro: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner" /></div>
                            <div className="md:col-span-3"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Cidade / Estado (UF)</label><div className="flex gap-3"><input type="text" value={carrierForm.cidade} onChange={e => setCarrierForm({...carrierForm, cidade: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner" placeholder="Cidade" /><input type="text" value={carrierForm.uf} maxLength={2} onChange={e => setCarrierForm({...carrierForm, uf: e.target.value.toUpperCase()})} className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner uppercase text-center" placeholder="UF" /></div></div>
                            <div className="md:col-span-6"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Ponto de Referência</label><input type="text" value={carrierForm.referencia} onChange={e => setCarrierForm({...carrierForm, referencia: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner" placeholder="Próximo ao viaduto..." /></div>
                        </div>
                    </div>
                    
                    {/* SEÇÃO VEÍCULO E DOCUMENTOS (OPCIONAL) */}
                    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 opacity-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-8 flex items-center gap-2 relative z-10">
                            <CarriersIcons.FileText className="w-5 h-5 text-amber-500"/> Veículo & Documentos (Opcional)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 mb-8">
                            <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Placa do Veículo</label><input type="text" value={carrierForm.vehicle_plate} onChange={e => setCarrierForm({...carrierForm, vehicle_plate: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition-all shadow-inner uppercase" placeholder="ABC-1234" /></div>
                            <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Modelo / Marca</label><input type="text" value={carrierForm.vehicle_model} onChange={e => setCarrierForm({...carrierForm, vehicle_model: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition-all shadow-inner" placeholder="Fiorino, Kangoo..." /></div>
                            <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Tipo de Veículo</label><select value={carrierForm.vehicle_type} onChange={e => setCarrierForm({...carrierForm, vehicle_type: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:border-amber-500 focus:bg-white transition-all cursor-pointer shadow-inner"><option value="">Selecione...</option><option value="MOTO">Motocicleta</option><option value="CARRO">Carro / Passeio</option><option value="VAN">Van / Utilitário</option><option value="CAMINHAO">Caminhão</option></select></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 border-t border-slate-100 pt-8">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">CNH (Frente e Verso)</label>
                                <label className="w-full h-32 bg-slate-50 border-2 border-dashed border-slate-300 rounded-[20px] flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors relative overflow-hidden group shadow-sm">
                                    <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => { const f = e.target.files[0]; if(f) setCarrierForm({...carrierForm, document_cnh_file: f}); }} />
                                    {carrierForm.document_cnh_file ? (
                                        <div className="text-center p-4"><CarriersIcons.FileText className="w-8 h-8 text-amber-500 mx-auto mb-2"/><span className="text-[10px] font-bold text-slate-700 break-all">{carrierForm.document_cnh_file.name}</span></div>
                                    ) : (
                                        <><CarriersIcons.Upload className="w-8 h-8 text-slate-400 mb-2"/><span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Anexar CNH</span></>
                                    )}
                                </label>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">RG (Frente)</label>
                                <label className="w-full h-32 bg-slate-50 border-2 border-dashed border-slate-300 rounded-[20px] flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors relative overflow-hidden group shadow-sm">
                                    <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => { const f = e.target.files[0]; if(f) setCarrierForm({...carrierForm, document_rg_front_file: f}); }} />
                                    {carrierForm.document_rg_front_file ? (
                                        <div className="text-center p-4"><CarriersIcons.FileText className="w-8 h-8 text-amber-500 mx-auto mb-2"/><span className="text-[10px] font-bold text-slate-700 break-all">{carrierForm.document_rg_front_file.name}</span></div>
                                    ) : (
                                        <><CarriersIcons.Upload className="w-8 h-8 text-slate-400 mb-2"/><span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Anexar RG Frente</span></>
                                    )}
                                </label>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">RG (Verso)</label>
                                <label className="w-full h-32 bg-slate-50 border-2 border-dashed border-slate-300 rounded-[20px] flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors relative overflow-hidden group shadow-sm">
                                    <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => { const f = e.target.files[0]; if(f) setCarrierForm({...carrierForm, document_rg_back_file: f}); }} />
                                    {carrierForm.document_rg_back_file ? (
                                        <div className="text-center p-4"><CarriersIcons.FileText className="w-8 h-8 text-amber-500 mx-auto mb-2"/><span className="text-[10px] font-bold text-slate-700 break-all">{carrierForm.document_rg_back_file.name}</span></div>
                                    ) : (
                                        <><CarriersIcons.Upload className="w-8 h-8 text-slate-400 mb-2"/><span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Anexar RG Verso</span></>
                                    )}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <ScrollToTopButton />
        </div>
    );
}