// ============================================================================
// FICHEIRO: resources/js/Modulos/Admin/AdminCarriers.jsx
// ============================================================================

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';

const Icons = {
    Truck: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
    Plus: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
    Edit: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    Trash: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    Close: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
    Upload: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
};

export default function AdminCarriers() {
    const queryClient = useQueryClient();
    const [modalOpen, setModalOpen] = useState(false);
    
    // Estado inicial padrão
    const defaultCarrier = { id: null, nome: '', tempo_entrega: '', status: 'ATIVA', imagemUrl: null, file: null };
    const [carrierEmEdicao, setCarrierEmEdicao] = useState(defaultCarrier);

    // Fetch Simulado (Trocar por api.get real quando o backend estiver pronto)
    const { data: transportadoras = [], isLoading } = useQuery({
        queryKey: ['adminCarriers'],
        queryFn: async () => {
            // const res = await api.get('/admin/carriers'); return res.data.data;
            return [
                { id: 1, nome: "Correios SEDEX", tempo_entrega: "1 a 3 dias úteis", status: "ATIVA", imagem: "https://logospng.org/download/correios/logo-correios-2048.png" },
                { id: 2, nome: "Melhor Envio (PAC)", tempo_entrega: "5 a 10 dias úteis", status: "ATIVA", imagem: "https://melhorenvio.com.br/images/logo-melhor-envio-azul.svg" }
            ];
        }
    });

    const abrirNovo = () => { setCarrierEmEdicao(defaultCarrier); setModalOpen(true); };
    
    const abrirEdicao = (c) => { 
        setCarrierEmEdicao({ id: c.id, nome: c.nome, tempo_entrega: c.tempo_entrega, status: c.status, imagemUrl: c.imagem, file: null }); 
        setModalOpen(true); 
    };

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCarrierEmEdicao({ ...carrierEmEdicao, file, imagemUrl: URL.createObjectURL(file) });
        }
    };

    const salvar = () => {
        if (!carrierEmEdicao.nome || !carrierEmEdicao.tempo_entrega) return alert("Preencha o nome e a previsão de entrega.");
        // const formData = new FormData(); ...
        // api.post('/admin/carriers', formData);
        alert("Simulação: Transportadora salva com sucesso!");
        setModalOpen(false);
    };

    return (
        <div className="w-full pb-20 font-sans">
            <Helmet><title>Transportadoras | HUB ADMIN</title></Helmet>
            
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 px-4 sm:px-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Transportadoras</h1>
                    <p className="text-slate-500 text-sm mt-1">Gerencie os métodos de envio e os prazos logísticos manuais.</p>
                </div>
                <button onClick={abrirNovo} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl flex items-center gap-2 shadow-sm transition-colors">
                    <Icons.Plus /> Adicionar Transportadora
                </button>
            </div>

            <div className="px-4 sm:px-8">
                <div className="bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-hidden relative">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                <th className="p-5 pl-8">Logo & Transportadora</th>
                                <th className="p-5 text-center">Tempo Médio</th>
                                <th className="p-5 text-center">Status</th>
                                <th className="p-5 pr-8 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr><td colSpan="4" className="p-16 text-center text-slate-400 font-bold animate-pulse">A carregar transportadoras...</td></tr>
                            ) : transportadoras.map(t => (
                                <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="p-5 pl-8 flex items-center gap-4">
                                        <div className="w-14 h-14 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-2 shadow-sm">
                                            {t.imagem ? <img src={t.imagem} className="w-full h-full object-contain mix-blend-multiply" alt=""/> : <Icons.Truck className="w-6 h-6 text-slate-300"/>}
                                        </div>
                                        <span className="font-bold text-slate-800 text-sm">{t.nome}</span>
                                    </td>
                                    <td className="p-5 text-center font-bold text-slate-600">{t.tempo_entrega}</td>
                                    <td className="p-5 text-center">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${t.status === 'ATIVA' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="p-5 pr-8 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => abrirEdicao(t)} className="w-9 h-9 flex items-center justify-center bg-sky-50 text-sky-600 rounded-xl hover:bg-sky-100 transition-colors border border-sky-100 shadow-sm"><Icons.Edit /></button>
                                            <button className="w-9 h-9 flex items-center justify-center bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-colors border border-rose-100 shadow-sm"><Icons.Trash /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {modalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-[24px] shadow-2xl p-8 w-full max-w-md relative z-10 border border-slate-200">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-slate-900">{carrierEmEdicao.id ? 'Editar Transportadora' : 'Nova Transportadora'}</h3>
                                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700"><Icons.Close /></button>
                            </div>
                            
                            <div className="space-y-5 mb-8">
                                <div className="flex items-center gap-5">
                                    <label className="w-20 h-20 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors relative overflow-hidden group shadow-sm">
                                        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                                        {carrierEmEdicao.imagemUrl ? (
                                            <>
                                                <img src={carrierEmEdicao.imagemUrl} className="w-full h-full object-contain p-2 mix-blend-multiply absolute inset-0" alt=""/>
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><span className="text-[9px] text-white font-bold uppercase">Trocar</span></div>
                                            </>
                                        ) : (
                                            <><Icons.Upload className="w-5 h-5 text-slate-400 mb-1"/><span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Logo</span></>
                                        )}
                                    </label>
                                    <div className="flex-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Nome Oficial *</label>
                                        <input type="text" value={carrierEmEdicao.nome} onChange={e => setCarrierEmEdicao({...carrierEmEdicao, nome: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-inner" placeholder="Ex: Correios SEDEX" />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Prazo Médio de Entrega *</label>
                                    <input type="text" value={carrierEmEdicao.tempo_entrega} onChange={e => setCarrierEmEdicao({...carrierEmEdicao, tempo_entrega: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-inner" placeholder="Ex: 3 a 5 dias úteis" />
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Status</label>
                                    <select value={carrierEmEdicao.status} onChange={e => setCarrierEmEdicao({...carrierEmEdicao, status: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all cursor-pointer shadow-sm">
                                        <option value="ATIVA">Ativa</option>
                                        <option value="INATIVA">Desativada</option>
                                    </select>
                                </div>
                            </div>
                            
                            <button onClick={salvar} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors shadow-sm text-sm">
                                Salvar Transportadora
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}