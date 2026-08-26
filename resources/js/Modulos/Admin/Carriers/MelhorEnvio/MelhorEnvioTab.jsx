import React from 'react';
import { motion } from 'framer-motion';
import { CarriersIcons, CardsSkeleton } from '../Compartilhado/CarriersUI';
import { SecureInput, NeumorphicToggle } from '../../Compartilhado/UIComponents';

export default function MelhorEnvioTab({ 
    isAuthenticatedME, 
    meTokenInput, 
    setMeTokenInput, 
    isAuthenticatingME, 
    handleSincronizarME, 
    handleDesconectarME, 
    isDisconnecting, 
    meCarriersAtivas, 
    toggleMeCarrier,
    isLoading
}) {
    return (
        <motion.div key="TAB_MELHOR_ENVIO" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[500px]">
            {!isAuthenticatedME ? (
                <div className="bg-slate-900 p-8 sm:p-10 text-white relative h-full min-h-[500px] flex flex-col justify-center">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-96 h-96 bg-blue-500 opacity-20 blur-[100px] rounded-full pointer-events-none"></div>
                    <div className="relative z-10 max-w-4xl mx-auto w-full">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-3"><CarriersIcons.Lock className="w-8 h-8 text-blue-400"/> Integração Melhor Envio</h2>
                        </div>
                        <p className="text-sm text-slate-300 mb-8 max-w-3xl leading-relaxed">Gere o seu <strong>Token de Acesso Pessoal (Bearer Token)</strong> no painel de controle do Melhor Envio e cole-o abaixo. Esta integração elimina redirecionamentos complexos e estabelece comunicação permanente.</p>
                        <div className="mb-8">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 flex items-center gap-2"><CarriersIcons.Key className="w-4 h-4"/> Personal Access Token</label>
                            <SecureInput 
                                value={meTokenInput} 
                                onChange={setMeTokenInput} 
                                placeholder="eyJ0eXAiOiJKV1QiLCJhbGci..." 
                                isToken={true}
                            />
                        </div>
                        <button onClick={handleSincronizarME} disabled={isAuthenticatingME} className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-14 px-10 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 w-full md:w-auto">
                            {isAuthenticatingME ? <><CarriersIcons.Spinner className="text-white w-5 h-5"/> Validando...</> : 'Sincronizar Melhor Envio'}
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
                        <div className="relative z-10">
                            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 tracking-tight">
                                Transportadoras Parceiras
                                <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] uppercase tracking-widest px-2.5 py-1 rounded shadow-sm flex items-center gap-1.5 ml-2"><CarriersIcons.CheckCircle className="w-3.5 h-3.5"/> Sincronizado</span>
                            </h2>
                            <p className="text-sm font-medium text-slate-500 mt-1">Ative as transportadoras que deseja disponibilizar para cotação na hora do despacho.</p>
                        </div>
                        <button onClick={handleDesconectarME} disabled={isDisconnecting} className="relative z-10 flex items-center gap-2 bg-white hover:bg-rose-50 text-rose-500 font-bold px-6 py-3.5 rounded-xl transition-colors border border-rose-200 shadow-sm shrink-0">
                            {isDisconnecting ? <CarriersIcons.Spinner className="w-4 h-4"/> : <CarriersIcons.PowerOff className="w-4 h-4"/>} Desconectar
                        </button>
                    </div>
                    {isLoading ? (
                        <div className="p-6 sm:p-8">
                            <CardsSkeleton />
                        </div>
                    ) : (
                        <div className="flex flex-col divide-y divide-slate-100">
                            {meCarriersAtivas.map(c => (
                                <div 
                                    key={c.id} 
                                    onClick={() => toggleMeCarrier(c.id)} 
                                    className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 cursor-pointer transition-colors group ${c.ativo ? 'bg-blue-50/30 hover:bg-blue-50/50' : 'bg-white hover:bg-slate-50'}`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center p-2.5 transition-all duration-300 border ${c.ativo ? 'bg-white border-blue-200 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-70 grayscale group-hover:grayscale-0 group-hover:opacity-100'}`}>
                                            {c.logo ? <img src={c.logo} alt={c.nome} className="max-w-full max-h-full object-contain mix-blend-multiply" /> : <span className="font-black text-slate-400">{c.nome}</span>}
                                        </div>
                                        <div>
                                            <span className="block text-[9px] uppercase tracking-widest font-bold text-slate-400 mb-0.5">Transportadora Parceira</span>
                                            <span className={`block text-lg font-black transition-colors ${c.ativo ? 'text-blue-700' : 'text-slate-800'}`}>{c.nome}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 sm:mt-0 flex items-center">
                                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${c.ativo ? 'border-blue-500 bg-blue-500 text-white shadow-sm' : 'border-slate-200 text-slate-300 group-hover:border-slate-300 group-hover:text-slate-400'}`}>
                                            <CarriersIcons.CheckCircle className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </motion.div>
    );
}
