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
        <div className="hub-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '32px' }}>
            <div className="hub-dashboard-header" style={{ padding: '24px', backgroundColor: 'var(--hub-surface-hover)', borderBottom: '1px solid var(--hub-border-subtle)', marginBottom: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', backgroundColor: '#d1fae5', color: '#059669', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><CheckCircle2 style={{ width: '24px', height: '24px' }} /></div>
                    <div>
                        <h2 className="hub-card-title">Eventos Nativos do Catálogo</h2>
                        <p className="hub-page-subtitle" style={{ fontSize: '12px', marginTop: '2px' }}>Controlados globalmente pela plataforma. Não requerem instalação de código.</p>
                    </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
                    <button 
                        onClick={() => onToggleAll(!isAllNativosAtivos)} 
                        style={{ padding: '10px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid', backgroundColor: isAllNativosAtivos ? '#fff1f2' : '#ecfdf5', color: isAllNativosAtivos ? '#e11d48' : '#059669', borderColor: isAllNativosAtivos ? '#fecdd3' : '#a7f3d0', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        {isAllNativosAtivos ? <><PowerOff style={{ width: '16px', height: '16px' }}/> Desligar Todos</> : <><Power style={{ width: '16px', height: '16px' }}/> Ligar Todos</>}
                    </button>
                    <PremiumSaveButton onClick={onSave} loading={isSaving} text="Salvar Alterações" />
                </div>
            </div>
            <div style={{ padding: 0, overflowX: 'auto' }}>
                <table className="hub-table" style={{ width: '100%', minWidth: '900px' }}>
                    <thead>
                        <tr className="hub-table-header">
                            <th className="hub-table-cell" style={{ paddingLeft: '24px' }}>Evento Oficial</th>
                            <th className="hub-table-cell">Quando é disparado?</th>
                            <th className="hub-table-cell" style={{ textAlign: 'center' }}>Data Layer Completo</th>
                            <th className="hub-table-cell" style={{ textAlign: 'center', paddingRight: '24px' }}>Ativo?</th>
                        </tr>
                    </thead>
                    <tbody>
                        {nativeEventsList.map((evt, idx) => (
                            <tr key={evt.key} className="hub-table-row" style={{ backgroundColor: idx % 2 === 0 ? 'var(--hub-background)' : 'var(--hub-surface-hover)' }}>
                                <td className="hub-table-cell" style={{ paddingLeft: '24px', fontWeight: 'bold', color: 'var(--hub-text-primary)', fontFamily: 'monospace', fontSize: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {evt.nome}
                                        {['Purchase', 'AddToCart', 'InitiateCheckout'].includes(evt.nome) && <span style={{ backgroundColor: '#ffedd5', color: '#c2410c', fontSize: '8px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Core</span>}
                                    </div>
                                </td>
                                <td className="hub-table-cell" style={{ fontSize: '12px' }}>{evt.desc}</td>
                                <td className="hub-table-cell" style={{ textAlign: 'center' }}>
                                    <SafeTooltip text={`Parâmetros da documentação oficial: ${evt.layer}`} title="Payload Garantido na CAPI" />
                                    <span style={{ backgroundColor: 'var(--hub-text-primary)', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '9px', fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase', marginLeft: '8px' }}>Payload VIP</span>
                                </td>
                                <td className="hub-table-cell" style={{ textAlign: 'center', paddingRight: '24px', display: 'flex', justifyContent: 'center' }}>
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
