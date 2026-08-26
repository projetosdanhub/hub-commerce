import React from 'react';
import { Icons } from '../../Compartilhado/Icones';

export default function AbaLogistica({ p, setP }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1024px', margin: '0 auto' }}>
            <div className="hub-card">
                <h3 className="hub-card-title">Peso e Dimensões</h3>
                <p style={{ fontSize: '12px', color: 'var(--hub-text-secondary)', marginBottom: '24px' }}>Usados para calcular o valor do frete na loja.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="hub-field">
                        <label className="hub-label">Peso Bruto (kg)</label>
                        <input 
                            type="number" 
                            step="0.001"
                            placeholder="0.000"
                            value={p.peso || ''} 
                            onChange={e => setP({...p, peso: e.target.value})} 
                            className="hub-input"
                            style={{ fontWeight: 'bold' }}
                        />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        <div className="hub-field">
                            <label className="hub-label">Largura (cm)</label>
                            <input 
                                type="number" 
                                step="0.1"
                                placeholder="0.0"
                                value={p.largura || ''} 
                                onChange={e => setP({...p, largura: e.target.value})} 
                                className="hub-input"
                                style={{ fontWeight: 'bold' }}
                            />
                        </div>
                        <div className="hub-field">
                            <label className="hub-label">Altura (cm)</label>
                            <input 
                                type="number" 
                                step="0.1"
                                placeholder="0.0"
                                value={p.altura || ''} 
                                onChange={e => setP({...p, altura: e.target.value})} 
                                className="hub-input"
                                style={{ fontWeight: 'bold' }}
                            />
                        </div>
                        <div className="hub-field">
                            <label className="hub-label">Compr. (cm)</label>
                            <input 
                                type="number" 
                                step="0.1"
                                placeholder="0.0"
                                value={p.comp || ''} 
                                onChange={e => setP({...p, comp: e.target.value})} 
                                className="hub-input"
                                style={{ fontWeight: 'bold' }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="hub-card">
                <h3 className="hub-card-title">Opções Logísticas</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'var(--hub-surface-subtle)', border: '1px solid var(--hub-border-subtle)', borderRadius: 'var(--hub-radius-lg)', cursor: 'pointer', transition: 'background-color 0.2s' }}>
                        <input 
                            type="checkbox" 
                            checked={p.agrupavel !== false} 
                            onChange={e => setP({...p, agrupavel: e.target.checked})}
                            style={{ width: '20px', height: '20px', borderRadius: '4px', accentColor: 'var(--hub-primary)' }}
                        />
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--hub-text-primary)' }}>Agrupável no Carrinho</div>
                            <div style={{ fontSize: '12px', color: 'var(--hub-text-secondary)' }}>Permite colocar vários na mesma caixa no envio.</div>
                        </div>
                    </label>

                    <div className="hub-field" style={{ marginTop: '16px' }}>
                        <label className="hub-label">Prazo adicional de manuseio (dias)</label>
                        <input 
                            type="number" 
                            placeholder="Ex: 2"
                            className="hub-input"
                            style={{ fontWeight: 'bold' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}