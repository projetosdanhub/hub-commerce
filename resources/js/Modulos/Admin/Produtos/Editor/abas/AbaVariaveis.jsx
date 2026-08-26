import React, { useState } from 'react';
import { Icons } from '../../Compartilhado/Icones';

export default function AbaVariaveis({ p, setP }) {
    const vars = p.variaveis || [];

    const handleAddVariacao = () => {
        const nova = {
            sku: '',
            nome: '',
            preco: p.preco || '',
            estoque: 0,
            status: 'ATIVO'
        };
        setP({...p, variaveis: [...vars, nova]});
    };

    const handleRemove = (index) => {
        const nv = [...vars];
        nv.splice(index, 1);
        setP({...p, variaveis: nv});
    };

    const handleChange = (index, campo, valor) => {
        const nv = [...vars];
        nv[index][campo] = valor;
        setP({...p, variaveis: nv});
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="hub-card">
                <div className="md-flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
                    <div>
                        <h3 className="hub-card-title">Grade de Variações</h3>
                        <p style={{ fontSize: '12px', color: 'var(--hub-text-secondary)', marginTop: '4px' }}>Gerencie produtos com diferentes cores, tamanhos, etc.</p>
                    </div>
                    <button 
                        onClick={handleAddVariacao}
                        style={{ padding: '8px 16px', backgroundColor: 'var(--hub-primary)', color: '#fff', borderRadius: 'var(--hub-radius-lg)', fontWeight: 'bold', fontSize: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transition: 'background-color 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hub-primary-dark)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--hub-primary)'}
                    >
                        <Icons.Plus style={{ width: '16px', height: '16px' }} /> Adicionar Variação Manual
                    </button>
                </div>

                {vars.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 0', backgroundColor: 'var(--hub-surface-subtle)', borderRadius: 'var(--hub-radius-lg)', border: '1px dashed var(--hub-border)' }}>
                        <Icons.Layers style={{ width: '32px', height: '32px', color: 'var(--hub-border-dark)', margin: '0 auto 12px' }} />
                        <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--hub-text-secondary)' }}>Este produto é simples e não possui variações.</p>
                        <p style={{ fontSize: '12px', color: 'var(--hub-text-muted)', marginTop: '4px' }}>Adicione variações caso ele possua opções como Cor ou Tamanho.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto', borderRadius: 'var(--hub-radius-lg)', border: '1px solid var(--hub-border-subtle)' }}>
                        <table className="hub-table">
                            <thead>
                                <tr>
                                    <th>Imagem</th>
                                    <th style={{ minWidth: '150px' }}>Opção/Combinação *</th>
                                    <th>SKU</th>
                                    <th>Preço (R$)</th>
                                    <th>Estoque</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vars.map((v, index) => (
                                    <tr key={index}>
                                        <td className="hub-table-cell">
                                            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--hub-radius-sm)', border: '1px solid var(--hub-border-subtle)', backgroundColor: 'var(--hub-surface-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
                                                {v.img ? (
                                                    <img src={v.img} alt="Var" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <Icons.Image style={{ width: '16px', height: '16px', color: 'var(--hub-text-muted)' }} />
                                                )}
                                            </div>
                                        </td>
                                        <td className="hub-table-cell">
                                            <input 
                                                type="text" 
                                                value={v.nome} 
                                                onChange={e => handleChange(index, 'nome', e.target.value)}
                                                placeholder="Ex: Preto - P"
                                                style={{ width: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: '1px dashed var(--hub-border-dark)', paddingBottom: '4px', outline: 'none', fontWeight: '500', color: 'var(--hub-text-primary)', fontSize: '14px' }}
                                                onFocus={(e) => e.target.style.borderColor = 'var(--hub-primary)'}
                                                onBlur={(e) => e.target.style.borderColor = 'var(--hub-border-dark)'}
                                            />
                                        </td>
                                        <td className="hub-table-cell">
                                            <input 
                                                type="text" 
                                                value={v.sku} 
                                                onChange={e => handleChange(index, 'sku', e.target.value.toUpperCase())}
                                                placeholder="SKU"
                                                style={{ width: '96px', backgroundColor: 'transparent', border: 'none', borderBottom: '1px dashed var(--hub-border-dark)', paddingBottom: '4px', outline: 'none', fontFamily: 'monospace', fontSize: '12px' }}
                                                onFocus={(e) => e.target.style.borderColor = 'var(--hub-primary)'}
                                                onBlur={(e) => e.target.style.borderColor = 'var(--hub-border-dark)'}
                                            />
                                        </td>
                                        <td className="hub-table-cell">
                                            <input 
                                                type="number" 
                                                value={v.preco} 
                                                onChange={e => handleChange(index, 'preco', e.target.value)}
                                                style={{ width: '96px', backgroundColor: 'transparent', border: 'none', borderBottom: '1px dashed var(--hub-border-dark)', paddingBottom: '4px', outline: 'none', fontWeight: '500', fontSize: '14px' }}
                                                onFocus={(e) => e.target.style.borderColor = 'var(--hub-primary)'}
                                                onBlur={(e) => e.target.style.borderColor = 'var(--hub-border-dark)'}
                                            />
                                        </td>
                                        <td className="hub-table-cell">
                                            <input 
                                                type="number" 
                                                value={v.estoque} 
                                                onChange={e => handleChange(index, 'estoque', e.target.value)}
                                                style={{ width: '80px', backgroundColor: 'transparent', border: 'none', borderBottom: '1px dashed var(--hub-border-dark)', paddingBottom: '4px', outline: 'none', fontSize: '14px' }}
                                                onFocus={(e) => e.target.style.borderColor = 'var(--hub-primary)'}
                                                onBlur={(e) => e.target.style.borderColor = 'var(--hub-border-dark)'}
                                            />
                                        </td>
                                        <td className="hub-table-cell">
                                            <select 
                                                value={v.status} 
                                                onChange={e => handleChange(index, 'status', e.target.value)}
                                                style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', fontSize: '12px', fontWeight: 'bold', color: 'var(--hub-text-secondary)', cursor: 'pointer' }}
                                            >
                                                <option value="ATIVO">Ativo</option>
                                                <option value="INATIVO">Inativo</option>
                                            </select>
                                        </td>
                                        <td className="hub-table-cell" style={{ textAlign: 'right' }}>
                                            <button 
                                                onClick={() => handleRemove(index)}
                                                style={{ padding: '6px', color: 'var(--hub-text-secondary)', backgroundColor: 'transparent', borderRadius: 'var(--hub-radius-sm)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                                                onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = 'var(--hub-danger)'}}
                                                onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--hub-text-secondary)'}}
                                                title="Remover"
                                            >
                                                <Icons.Trash style={{ width: '16px', height: '16px' }} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}