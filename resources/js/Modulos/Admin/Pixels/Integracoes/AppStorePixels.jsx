// ============================================================================
// FICHEIRO: resources/js/Modulos/Admin/Pixels/Integracoes/AppStorePixels.jsx
// Aba "Integrações" — Cards de providers (Meta, GA4, TikTok, Pinterest)
// ============================================================================
import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Activity, Zap, Check, AlertTriangle } from 'lucide-react';
import { tabTransition } from '../Compartilhado/ConstantesPixels';
import { SecureInput, SafeTooltip } from '../Compartilhado/ComponentesUIPixels';
import { PremiumSaveButton } from '../Compartilhado/ComponentesUIPixels';

const AppStorePixels = ({ credenciais, setCredenciais, isSaving, onSave }) => {
    return (
        <motion.div {...tabTransition}>
            <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-slate-800">App Store & Tokens</h2>
                    <p className="text-sm text-slate-500">Conecte a Loja às maiores redes de publicidade com segurança Server-Side.</p>
                </div>
                <PremiumSaveButton onClick={onSave} loading={isSaving} text="Salvar Todos os Tokens" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Meta Pixel & CAPI */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-blue-200 transition-colors">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                        <div className="w-14 h-14 bg-[#E7F3FF] text-[#1877F2] rounded-2xl flex items-center justify-center shadow-inner"><Code2 className="w-7 h-7"/></div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800 leading-tight">Meta Pixel & CAPI</h3>
                            <div className="mt-1 flex items-center gap-2">
                                {(credenciais.meta_pixel_id && credenciais.meta_access_token) ? 
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1"><Check className="w-3 h-3"/> Conexão Ativa</span> : 
                                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Requer Atenção</span>
                                }
                            </div>
                        </div>
                    </div>
                    <div className="p-6 space-y-6 flex-1">
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">ID do Pixel (Browser)</label>
                            <SecureInput value={credenciais.meta_pixel_id || ''} onChange={(v) => setCredenciais({...credenciais, meta_pixel_id: v.replace(/\D/g, '')})} placeholder="Ex: 1029384756" isToken={false} />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 mb-2">
                                Token CAPI (Servidor) 
                                <SafeTooltip text="Gere o token no Gerenciador de Eventos da Meta. Ele resolve perdas por AdBlock." title="Por que usar CAPI?"/>
                            </label>
                            <SecureInput value={credenciais.meta_access_token || ''} onChange={(v) => setCredenciais({...credenciais, meta_access_token: v})} placeholder="EAAI..." />
                        </div>
                    </div>
                </div>

                {/* Google Analytics 4 */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-orange-200 transition-colors">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                        <div className="w-14 h-14 bg-[#FFF3E0] text-[#F57C00] rounded-2xl flex items-center justify-center shadow-inner"><Activity className="w-7 h-7"/></div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800 leading-tight">Google Analytics 4</h3>
                            <div className="mt-1 flex items-center gap-2">
                                {credenciais.ga4_measurement_id ? 
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1"><Check className="w-3 h-3"/> Conexão Ativa</span> : 
                                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Requer Atenção</span>
                                }
                            </div>
                        </div>
                    </div>
                    <div className="p-6 space-y-6 flex-1">
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Measurement ID</label>
                            <SecureInput value={credenciais.ga4_measurement_id || ''} onChange={(v) => setCredenciais({...credenciais, ga4_measurement_id: v.toUpperCase()})} placeholder="G-XXXXXXXXXX" isToken={false} />
                        </div>
                        <p className="text-xs text-slate-500 bg-orange-50/50 p-4 rounded-xl border border-orange-100 leading-relaxed">A HUB mapeia automaticamente o objeto <code>items[]</code> para e-commerce no padrão oficial do GA4.</p>
                    </div>
                </div>

                {/* TikTok For Business */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:col-span-2 lg:col-span-1 hover:border-slate-400 transition-colors">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                        <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-inner"><Zap className="w-7 h-7"/></div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800 leading-tight">TikTok For Business</h3>
                            <div className="mt-1 flex items-center gap-2">
                                {credenciais.tiktok_pixel_id ? 
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1"><Check className="w-3 h-3"/> Conexão Ativa</span> : 
                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">Configuração Básica</span>
                                }
                            </div>
                        </div>
                    </div>
                    <div className="p-6 space-y-6 flex-1">
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Pixel ID</label>
                            <SecureInput value={credenciais.tiktok_pixel_id || ''} onChange={(v) => setCredenciais({...credenciais, tiktok_pixel_id: v})} placeholder="Cole o código identificador..." isToken={false} />
                        </div>
                    </div>
                </div>

                {/* Pinterest API */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-red-200 transition-colors">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shadow-inner">
                            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M12 0a12 12 0 0 0-4.37 23.17c-.07-.63-.13-1.6.03-2.26.14-.6.92-3.86.92-3.86s-.24-.46-.24-1.15c0-1.08.63-1.89 1.4-1.89.66 0 1 .5 1 1.07 0 .66-.42 1.66-.64 2.58-.18.77.4 1.4 1.15 1.4 1.38 0 2.44-1.46 2.44-3.56 0-1.85-1.33-3.14-3.4-3.14-2.4 0-3.8 1.8-3.8 3.65 0 .66.25 1.37.57 1.76.06.07.07.14.05.22l-.19.78c-.03.1-.1.13-.2.08-1.42-.66-2.31-2.73-2.31-4.4 0-3.58 2.6-6.87 7.5-6.87 3.94 0 7 2.8 7 6.54 0 3.92-2.47 7.07-5.9 7.07-1.15 0-2.23-.6-2.6-1.3l-.7 2.68c-.26 1-.7 2.26-1.05 3.03A12 12 0 1 0 12 0z"/></svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800 leading-tight">Pinterest API</h3>
                            <div className="mt-1 flex items-center gap-2">
                                {(credenciais.pinterest_pixel_id && credenciais.pinterest_access_token) ? 
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1"><Check className="w-3 h-3"/> Conexão Ativa</span> : 
                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">Configuração Básica</span>
                                }
                            </div>
                        </div>
                    </div>
                    <div className="p-6 space-y-6 flex-1">
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Ad Account / Pixel ID</label>
                            <SecureInput value={credenciais.pinterest_pixel_id || ''} onChange={(v) => setCredenciais({...credenciais, pinterest_pixel_id: v.replace(/\D/g, '')})} placeholder="Ex: 26123456789" isToken={false} />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Access Token (Server)</label>
                            <SecureInput value={credenciais.pinterest_access_token || ''} onChange={(v) => setCredenciais({...credenciais, pinterest_access_token: v})} placeholder="Cole o token de conversão..." />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AppStorePixels;
