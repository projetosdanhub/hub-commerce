import React from 'react';
import { Icons } from '../../Compartilhado/Icones';

export default function AbaSeo({ p, setP }) {
    const calcularProgresso = (texto, max) => {
        if (!texto) return 0;
        return Math.min(100, (texto.length / max) * 100);
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1024px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="hub-card">
                    <h3 className="hub-card-title">Otimização (SEO)</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="hub-field">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '6px' }}>
                                <label className="hub-label" style={{ marginBottom: 0 }}>Meta Title</label>
                                <span style={{ fontSize: '10px', fontWeight: 'bold', color: (p.metaTitle?.length || 0) > 60 ? 'var(--hub-warning)' : 'var(--hub-text-muted)' }}>
                                    {p.metaTitle?.length || 0}/60
                                </span>
                            </div>
                            <input 
                                type="text" 
                                value={p.metaTitle || ''} 
                                onChange={e => setP({...p, metaTitle: e.target.value})} 
                                placeholder="Título para mecanismos de busca"
                                className="hub-input"
                            />
                            <div style={{ height: '4px', width: '100%', backgroundColor: 'var(--hub-surface-subtle)', borderRadius: '999px', marginTop: '8px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', backgroundColor: (p.metaTitle?.length || 0) > 60 ? 'var(--hub-warning)' : 'var(--hub-success)', width: `${calcularProgresso(p.metaTitle, 60)}%` }}></div>
                            </div>
                        </div>

                        <div className="hub-field">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '6px' }}>
                                <label className="hub-label" style={{ marginBottom: 0 }}>Meta Description</label>
                                <span style={{ fontSize: '10px', fontWeight: 'bold', color: (p.metaDesc?.length || 0) > 160 ? 'var(--hub-warning)' : 'var(--hub-text-muted)' }}>
                                    {p.metaDesc?.length || 0}/160
                                </span>
                            </div>
                            <textarea 
                                rows="3"
                                value={p.metaDesc || ''} 
                                onChange={e => setP({...p, metaDesc: e.target.value})} 
                                placeholder="Resumo do produto para os resultados do Google..."
                                className="hub-input"
                                style={{ resize: 'none' }}
                            ></textarea>
                            <div style={{ height: '4px', width: '100%', backgroundColor: 'var(--hub-surface-subtle)', borderRadius: '999px', marginTop: '8px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', backgroundColor: (p.metaDesc?.length || 0) > 160 ? 'var(--hub-warning)' : 'var(--hub-success)', width: `${calcularProgresso(p.metaDesc, 160)}%` }}></div>
                            </div>
                        </div>

                        <div className="hub-field">
                            <label className="hub-label">Slug da URL</label>
                            <div style={{ display: 'flex', border: '1px solid var(--hub-border-subtle)', borderRadius: 'var(--hub-radius-lg)', overflow: 'hidden', backgroundColor: 'var(--hub-surface)', transition: 'all 0.2s' }}>
                                <div style={{ padding: '12px 16px', color: 'var(--hub-text-muted)', fontSize: '14px', borderRight: '1px solid var(--hub-border-subtle)', backgroundColor: 'var(--hub-surface-subtle)', userSelect: 'none' }}>
                                    /produto/
                                </div>
                                <input 
                                    type="text" 
                                    value={p.slug || ''} 
                                    onChange={e => setP({...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})} 
                                    placeholder="nome-do-produto"
                                    className="hub-input"
                                    style={{ border: 'none', borderRadius: 0, flex: 1, minWidth: 0, boxShadow: 'none' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="hub-card">
                    <h3 className="hub-card-title">Preview no Google</h3>
                    <div style={{ padding: '16px', backgroundColor: '#fff', border: '1px solid var(--hub-border-subtle)', borderRadius: 'var(--hub-radius-lg)', maxWidth: '400px' }}>
                        <div style={{ color: '#1a0dab', fontSize: '18px', fontWeight: 'normal', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
                            {p.metaTitle || p.nome || 'Título do Produto'}
                        </div>
                        <div style={{ color: '#006621', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                            https://sualoja.com.br/produto/{p.slug || 'nome-do-produto'}
                        </div>
                        <div style={{ color: '#545454', fontSize: '14px', marginTop: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {p.metaDesc || p.descricao?.substring(0, 160) || 'Forneça uma meta descrição atrativa para aumentar a taxa de clique dos usuários nos mecanismos de busca.'}
                        </div>
                    </div>
                </div>

                <div className="hub-card">
                    <h3 className="hub-card-title">Google Merchant / Shopping</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="hub-field">
                            <label className="hub-label">Condição do Item</label>
                            <select className="hub-input hub-select">
                                <option value="new">Novo</option>
                                <option value="refurbished">Recondicionado</option>
                                <option value="used">Usado</option>
                            </select>
                        </div>
                        <div className="hub-field">
                            <label className="hub-label">Categoria Google (Opcional)</label>
                            <input 
                                type="text" 
                                placeholder="ID ou Caminho da Categoria Google"
                                className="hub-input"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}