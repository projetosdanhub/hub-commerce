import React from 'react';
import { Icons } from '../../Compartilhado/Icones';

export default function AbaFiscal({ p, setP }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1024px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="hub-card">
                    <h3 className="hub-card-title">Classificação Fiscal</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div className="hub-field" style={{ flex: 1 }}>
                                <label className="hub-label">NCM *</label>
                                <input 
                                    type="text" 
                                    placeholder="0000.00.00"
                                    value={p.ncm || ''} 
                                    onChange={e => setP({...p, ncm: e.target.value.replace(/\D/g, '')})} 
                                    className="hub-input"
                                    style={{ fontFamily: 'monospace', fontWeight: 'bold' }}
                                />
                            </div>
                            <div className="hub-field" style={{ flex: 1 }}>
                                <label className="hub-label">CEST</label>
                                <input 
                                    type="text" 
                                    placeholder="Opcional"
                                    value={p.cest || ''} 
                                    onChange={e => setP({...p, cest: e.target.value.replace(/\D/g, '')})} 
                                    className="hub-input"
                                    style={{ fontFamily: 'monospace', fontWeight: 'bold' }}
                                />
                            </div>
                        </div>

                        <div className="hub-field">
                            <label className="hub-label">GTIN/EAN (Código de Barras)</label>
                            <input 
                                type="text" 
                                placeholder="EAN-13, EAN-8, UPCE..."
                                value={p.gtin || ''} 
                                onChange={e => setP({...p, gtin: e.target.value.replace(/\D/g, '')})} 
                                className="hub-input"
                                style={{ fontFamily: 'monospace', fontWeight: 'bold' }}
                            />
                        </div>

                        <div className="hub-field">
                            <label className="hub-label">Origem da Mercadoria *</label>
                            <select 
                                value={p.origem || '0'} 
                                onChange={e => setP({...p, origem: e.target.value})} 
                                className="hub-input hub-select"
                            >
                                <option value="0">0 - Nacional</option>
                                <option value="1">1 - Estrangeira (Importação Direta)</option>
                                <option value="2">2 - Estrangeira (Mercado Interno)</option>
                                <option value="3">3 - Nacional, mercadoria ou bem com Conteúdo de Importação superior a 40%</option>
                                <option value="4">4 - Nacional, cuja produção tenha sido feita em conformidade com os processos produtivos básicos</option>
                                <option value="5">5 - Nacional, mercadoria ou bem com Conteúdo de Importação inferior ou igual a 40%</option>
                                <option value="6">6 - Estrangeira (Importação Direta, sem similar nacional, CAMEX)</option>
                                <option value="7">7 - Estrangeira (Mercado Interno, sem similar nacional, CAMEX)</option>
                                <option value="8">8 - Nacional, mercadoria ou bem com Conteúdo de Importação superior a 70%</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="hub-card">
                    <h3 className="hub-card-title">Tributação (ICMS Padrão)</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="hub-field">
                            <label className="hub-label">CST / CSOSN Padrão</label>
                            <select 
                                value={p.cst || '102'} 
                                onChange={e => setP({...p, cst: e.target.value})} 
                                className="hub-input hub-select"
                            >
                                <option value="101">101 - Tributada pelo Simples Nacional com permissão de crédito</option>
                                <option value="102">102 - Tributada pelo Simples Nacional sem permissão de crédito</option>
                                <option value="500">500 - ICMS cobrado anteriormente por substituição tributária (ST)</option>
                                <option value="00">00 - Tributada Integralmente (Regime Normal)</option>
                                <option value="40">40 - Isenta (Regime Normal)</option>
                                <option value="60">60 - ICMS cobrado anteriormente por substituição tributária (Regime Normal)</option>
                            </select>
                        </div>
                        
                        <div className="hub-field">
                            <label className="hub-label">CFOP Padrão (Venda)</label>
                            <input 
                                type="text" 
                                placeholder="Ex: 5102"
                                value={p.cfop || ''} 
                                onChange={e => setP({...p, cfop: e.target.value.replace(/\D/g, '')})} 
                                className="hub-input"
                                style={{ fontFamily: 'monospace', fontWeight: 'bold' }}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '16px', borderRadius: 'var(--hub-radius-lg)', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <Icons.AlertCircle style={{ width: '20px', height: '20px', color: 'var(--hub-warning)', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--hub-warning)' }}>Reforma Tributária (IBS/CBS)</h4>
                        <p style={{ fontSize: '12px', color: 'var(--hub-text-secondary)', marginTop: '4px' }}>Esteja preparado para as futuras NFs usando as novas regras do Portal Nacional da NF-e. Consulte sua contabilidade sobre cClassTrib e validações por versão de Nota Técnica.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}