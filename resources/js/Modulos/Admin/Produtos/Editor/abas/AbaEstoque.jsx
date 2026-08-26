import React from 'react';
import { Icons } from '../../Compartilhado/Icones';

export default function AbaEstoque({ p, setP }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1024px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="hub-card">
                    <h3 className="hub-card-title">Gestão de Inventário</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'var(--hub-surface-subtle)', border: '1px solid var(--hub-border-subtle)', borderRadius: 'var(--hub-radius-lg)', cursor: 'pointer', transition: 'background-color 0.2s' }}>
                            <input 
                                type="checkbox" 
                                checked={p.controlarEstoque !== false} 
                                onChange={e => setP({...p, controlarEstoque: e.target.checked})}
                                style={{ width: '20px', height: '20px', borderRadius: '4px', accentColor: 'var(--hub-primary)' }}
                            />
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--hub-text-primary)' }}>Controlar Estoque Físico</div>
                                <div style={{ fontSize: '12px', color: 'var(--hub-text-secondary)' }}>Se desativado, o produto sempre estará disponível.</div>
                            </div>
                        </label>

                        {p.controlarEstoque !== false && (
                            <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                                <div className="hub-field" style={{ flex: 1 }}>
                                    <label className="hub-label">Quantidade Disponível</label>
                                    <input 
                                        type="number" 
                                        value={p.estoque !== undefined ? p.estoque : ''} 
                                        onChange={e => setP({...p, estoque: e.target.value})} 
                                        className="hub-input"
                                        style={{ fontSize: '16px', fontWeight: '900' }}
                                    />
                                </div>
                                <div className="hub-field" style={{ flex: 1 }}>
                                    <label className="hub-label">Alerta de Estoque Baixo</label>
                                    <input 
                                        type="number" 
                                        value={p.alertaEstoque || 5} 
                                        onChange={e => setP({...p, alertaEstoque: e.target.value})} 
                                        className="hub-input"
                                        style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--hub-warning)' }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="hub-card">
                    <h3 className="hub-card-title">Venda e Encomenda</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'var(--hub-surface-subtle)', border: '1px solid var(--hub-border-subtle)', borderRadius: 'var(--hub-radius-lg)', cursor: 'pointer', transition: 'background-color 0.2s' }}>
                            <input 
                                type="checkbox" 
                                checked={p.preVenda || false} 
                                onChange={e => setP({...p, preVenda: e.target.checked})}
                                style={{ width: '20px', height: '20px', borderRadius: '4px', accentColor: 'var(--hub-primary)' }}
                            />
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--hub-text-primary)' }}>Vender sem estoque (Sob Encomenda / Pré-venda)</div>
                                <div style={{ fontSize: '12px', color: 'var(--hub-text-secondary)' }}>Permite compras mesmo com estoque zerado.</div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}