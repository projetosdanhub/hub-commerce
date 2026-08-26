import React from 'react';
import { Icons } from '../../Compartilhado/Icones';

export default function AbaFichaTecnica({ p, setP }) {
    const ficha = p.fichaTecnica || [];

    const handleAddAtributo = () => {
        setP({ ...p, fichaTecnica: [...ficha, { atributo: '', valor: '' }] });
    };

    const handleRemoveAtributo = (index) => {
        const novaFicha = [...ficha];
        novaFicha.splice(index, 1);
        setP({ ...p, fichaTecnica: novaFicha });
    };

    const handleChangeAtributo = (index, campo, valor) => {
        const novaFicha = [...ficha];
        novaFicha[index][campo] = valor;
        setP({ ...p, fichaTecnica: novaFicha });
    };

    return (
        <div className="hub-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                    <h3 className="hub-card-title">Ficha Técnica</h3>
                    <p style={{ fontSize: '12px', color: 'var(--hub-text-secondary)', marginTop: '4px' }}>Defina características detalhadas (material, cor, voltagem, etc.)</p>
                </div>
                <button 
                    onClick={handleAddAtributo}
                    style={{ padding: '8px 16px', backgroundColor: 'var(--hub-primary)', color: '#fff', borderRadius: 'var(--hub-radius-lg)', fontWeight: 'bold', fontSize: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transition: 'background-color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hub-primary-dark)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--hub-primary)'}
                >
                    <Icons.Plus style={{ width: '16px', height: '16px' }} /> Adicionar Atributo
                </button>
            </div>

            {ficha.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', backgroundColor: 'var(--hub-surface-subtle)', borderRadius: 'var(--hub-radius-lg)', border: '1px dashed var(--hub-border)' }}>
                    <Icons.Layout className="hub-icon" style={{ width: '32px', height: '32px', color: 'var(--hub-border-dark)', margin: '0 auto 12px' }} />
                    <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--hub-text-secondary)' }}>Nenhum atributo cadastrado.</p>
                    <p style={{ fontSize: '12px', color: 'var(--hub-text-muted)', marginTop: '4px' }}>Adicione atributos para enriquecer os detalhes do produto.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '16px', padding: '0 16px 8px', borderBottom: '1px solid var(--hub-border-subtle)' }}>
                        <div style={{ flex: '5', fontSize: '10px', fontWeight: 'bold', color: 'var(--hub-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Atributo</div>
                        <div style={{ flex: '6', fontSize: '10px', fontWeight: 'bold', color: 'var(--hub-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Valor</div>
                        <div style={{ width: '32px' }}></div>
                    </div>
                    {ficha.map((item, index) => (
                        <div key={index} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ flex: '5' }}>
                                <input 
                                    type="text" 
                                    placeholder="Ex: Material"
                                    value={item.atributo}
                                    onChange={(e) => handleChangeAtributo(index, 'atributo', e.target.value)}
                                    className="hub-input"
                                />
                            </div>
                            <div style={{ flex: '6' }}>
                                <input 
                                    type="text" 
                                    placeholder="Ex: Algodão"
                                    value={item.valor}
                                    onChange={(e) => handleChangeAtributo(index, 'valor', e.target.value)}
                                    className="hub-input"
                                />
                            </div>
                            <div style={{ width: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                                <button 
                                    onClick={() => handleRemoveAtributo(index)}
                                    style={{ padding: '6px', color: 'var(--hub-text-secondary)', backgroundColor: 'transparent', borderRadius: 'var(--hub-radius-sm)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                                    onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = 'var(--hub-danger)'}}
                                    onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--hub-text-secondary)'}}
                                    title="Remover"
                                >
                                    <Icons.Trash style={{ width: '16px', height: '16px' }} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}