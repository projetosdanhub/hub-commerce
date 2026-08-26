import React from 'react';
import { Icons } from '../../Compartilhado/Icones';

export default function AbaGeral({ p, setP, erros, setErros, categorias }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {/* Column 1 (2/3 width on large screens) */}
                <div style={{ gridColumn: 'span 2 / span 2', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="hub-card">
                        <h3 className="hub-card-title">Informações Básicas</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="hub-field">
                                <label className="hub-label">
                                    Nome do Produto *
                                </label>
                                <input 
                                    type="text" 
                                    value={p.nome} 
                                    onChange={e => { setErros({...erros, nome: false}); setP({...p, nome: e.target.value}); }} 
                                    placeholder="Ex: Cadeira Ergônomica..."
                                    className={`hub-input ${erros.nome ? 'error' : ''}`} 
                                />
                                {erros.nome && <span className="hub-error-text">O nome é obrigatório</span>}
                            </div>
                            
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div className="hub-field" style={{ flex: 1 }}>
                                    <label className="hub-label">
                                        SKU Principal (Mestre)
                                    </label>
                                    <div style={{ display: 'flex' }}>
                                        <div style={{ 
                                            backgroundColor: 'var(--hub-surface-subtle)', 
                                            border: '1px solid var(--hub-border)', 
                                            borderRight: 'none', 
                                            borderRadius: 'var(--hub-radius-md) 0 0 var(--hub-radius-md)', 
                                            padding: '12px 16px', 
                                            fontSize: '14px', 
                                            fontWeight: 'bold', 
                                            color: 'var(--hub-text-secondary)', 
                                            display: 'flex', 
                                            alignItems: 'center' 
                                        }}>
                                            <input type="text" value={p.skuRef} onChange={e => setP({...p, skuRef: e.target.value.toUpperCase()})} placeholder="REF" style={{ width: '64px', backgroundColor: 'transparent', outline: 'none', textAlign: 'center', border: 'none', color: 'inherit', fontWeight: 'inherit', padding: 0 }} />
                                            <span>-</span>
                                        </div>
                                        <input type="text" value={p.skuSufixo} onChange={e => setP({...p, skuSufixo: e.target.value.toUpperCase()})} placeholder="SUFIXO (Automático)" className="hub-input" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, flex: 1, minWidth: 0, fontFamily: 'monospace' }} />
                                    </div>
                                </div>
                                <div className="hub-field" style={{ flex: 1 }}>
                                    <label className="hub-label">
                                        Status
                                    </label>
                                    <select value={p.status} onChange={e => setP({...p, status: e.target.value})} className="hub-input hub-select">
                                        <option value="ATIVO">ATIVO - Visível na loja</option>
                                        <option value="INATIVO">INATIVO - Oculto</option>
                                    </select>
                                </div>
                            </div>

                            <div className="hub-field">
                                <label className="hub-label">
                                    Categoria Principal *
                                </label>
                                <select 
                                    value={p.categoriaPrincipal} 
                                    onChange={e => { setErros({...erros, categoriaPrincipal: false}); setP({...p, categoriaPrincipal: e.target.value}); }}
                                    className={`hub-input hub-select ${erros.categoriaPrincipal ? 'error' : ''}`}
                                >
                                    <option value="">Selecione uma categoria...</option>
                                    {categorias.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                                </select>
                                {erros.categoriaPrincipal && <span className="hub-error-text">Selecione a categoria</span>}
                            </div>
                            <div className="hub-field">
                                <label className="hub-label">
                                    Descrição Completa
                                </label>
                                <textarea 
                                    value={p.descricao} 
                                    onChange={e => setP({...p, descricao: e.target.value})} 
                                    rows="6" 
                                    placeholder="Descreva os detalhes, características e diferenciais do produto..."
                                    className="hub-input"
                                    style={{ resize: 'vertical', minHeight: '120px' }}
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Column 2 (1/3 width on large screens) */}
                <div style={{ gridColumn: 'span 1 / span 1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="hub-card">
                        <h3 className="hub-card-title">Preço</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="hub-field">
                                <label className="hub-label">
                                    Preço de Venda *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, paddingLeft: '16px', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                                        <span style={{ color: 'var(--hub-text-secondary)', fontWeight: 'bold', fontSize: '14px' }}>R$</span>
                                    </div>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        min="0"
                                        value={p.preco} 
                                        onChange={e => { setErros({...erros, preco: false}); setP({...p, preco: e.target.value}); }} 
                                        className={`hub-input ${erros.preco ? 'error' : ''}`}
                                        style={{ paddingLeft: '40px', fontWeight: '900', fontSize: '16px' }}
                                    />
                                </div>
                                {erros.preco && <span className="hub-error-text">Preço inválido</span>}
                            </div>
                            <div className="hub-field">
                                <label className="hub-label">
                                    Preço Promocional (Opcional)
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, paddingLeft: '16px', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                                        <span style={{ color: 'var(--hub-success)', fontWeight: 'bold', fontSize: '14px' }}>R$</span>
                                    </div>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        min="0"
                                        value={p.precoPromo} 
                                        onChange={e => setP({...p, precoPromo: e.target.value})} 
                                        className="hub-input"
                                        style={{ paddingLeft: '40px', fontWeight: '900', fontSize: '16px', color: 'var(--hub-success)' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}