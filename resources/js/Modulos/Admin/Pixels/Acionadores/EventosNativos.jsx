// ============================================================================
// FICHEIRO: resources/js/Modulos/Admin/Pixels/Acionadores/EventosNativos.jsx
// Tabela de 18 eventos nativos da plataforma com toggles
// ============================================================================
import React from 'react';
import { CheckCircle2, Power, PowerOff } from 'lucide-react';
import { nativeEventsList } from '../Compartilhado/ConstantesPixels';
import { AnimatedToggle, SafeTooltip, PremiumSaveButton } from '../Compartilhado/ComponentesUIPixels';

const EventosNativos = ({ eventosNativos, setEventosNativos, isSaving, onSave, isAllNativosAtivos, onToggleAll }) => {
    return (
        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0"><CheckCircle2 className="w-6 h-6" /></div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Eventos Nativos do Catálogo</h2>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Controlados globalmente pela plataforma. Não requerem instalação de código.</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button 
                        onClick={() => onToggleAll(!isAllNativosAtivos)} 
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 border ${isAllNativosAtivos ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'}`}
                    >
                        {isAllNativosAtivos ? <><PowerOff className="w-4 h-4"/> Desligar Todos</> : <><Power className="w-4 h-4"/> Ligar Todos</>}
                    </button>
                    <PremiumSaveButton onClick={onSave} loading={isSaving} text="Salvar Alterações" className="!py-2.5 !text-xs !bg-blue-600 hover:!bg-blue-700" />
                </div>
            </div>
            <div className="p-0 overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse min-w-[900px]">
                    <thead>
                        <tr className="bg-white border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                            <th className="p-4 pl-6">Evento Oficial</th>
                            <th className="p-4">Quando é disparado?</th>
                            <th className="p-4 text-center">Data Layer Completo</th>
                            <th className="p-4 pr-6 text-center">Ativo?</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-slate-600">
                        {nativeEventsList.map((evt, idx) => (
                            <tr key={evt.key} className={`transition-colors ${idx % 2 === 0 ? 'bg-white hover:bg-slate-50/50' : 'bg-slate-50/30 hover:bg-slate-50/80'}`}>
                                <td className="p-4 pl-6 font-bold text-slate-800 font-mono tracking-tight text-xs flex items-center gap-2">
                                    {evt.nome}
                                    {['Purchase', 'AddToCart', 'InitiateCheckout'].includes(evt.nome) && <span className="bg-orange-100 text-orange-700 text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">Core</span>}
                                </td>
                                <td className="p-4 text-xs">{evt.desc}</td>
                                <td className="p-4 text-center">
                                    <SafeTooltip text={`Parâmetros da documentação oficial: ${evt.layer}`} title="Payload Garantido na CAPI" />
                                    <span className="bg-slate-800 text-white px-2.5 py-1 rounded text-[9px] font-mono tracking-widest uppercase shadow-sm ml-2">Payload VIP</span>
                                </td>
                                <td className="p-4 pr-6 flex justify-center">
                                    <AnimatedToggle active={eventosNativos[evt.key] ?? true} onChange={(val) => setEventosNativos({...eventosNativos, [evt.key]: val})} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EventosNativos;
