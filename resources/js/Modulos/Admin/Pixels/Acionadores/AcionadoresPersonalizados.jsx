// ============================================================================
// FICHEIRO: resources/js/Modulos/Admin/Pixels/Acionadores/AcionadoresPersonalizados.jsx
// Tabela de acionadores customizados (GTM) com paginação
// ============================================================================
import React from 'react';
import {
    AppWindow, Plus, Edit, Trash2, Target,
    MousePointer2, Globe, ArrowDownToLine, Clock,
    Eye, ArrowLeft, Zap, ChevronLeft, ChevronRight
} from 'lucide-react';

const AcionadoresPersonalizados = ({
    acionadoresPaginados,
    paginaAtual,
    setPaginaAtual,
    totalPaginas,
    itensPorPagina,
    setItensPorPagina,
    onEdit,
    onDelete,
    onNovaRegra,
}) => {
    return (
        <div className="hub-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="hub-dashboard-header" style={{ padding: '24px', backgroundColor: 'var(--hub-surface-hover)', borderBottom: '1px solid var(--hub-border-subtle)', marginBottom: 0, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', backgroundColor: '#dbeafe', color: '#2563eb', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AppWindow style={{ width: '24px', height: '24px' }} /></div>
                    <div>
                        <h2 className="hub-card-title">Acionadores Personalizados (GTM)</h2>
                        <p className="hub-page-subtitle" style={{ fontSize: '12px', marginTop: '2px' }}>Disparos manuais que exigem verificação de Domínio Alvo.</p>
                    </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                    {/* Paginação */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'var(--hub-background)', border: '1px solid var(--hub-border)', borderRadius: '12px', padding: '6px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <span style={{ fontSize: '12px', color: 'var(--hub-text-secondary)', fontWeight: 500, padding: '0 8px' }}>Pág {paginaAtual} de {totalPaginas || 1}</span>
                        <select 
                            value={itensPorPagina} 
                            onChange={(e) => { setItensPorPagina(Number(e.target.value)); setPaginaAtual(1); }}
                            style={{ backgroundColor: 'var(--hub-surface)', border: '1px solid var(--hub-border-subtle)', borderRadius: '8px', padding: '4px 8px', fontSize: '12px', color: 'var(--hub-text-primary)', outline: 'none', cursor: 'pointer' }}
                        >
                            <option value={10}>10 p/ pág</option>
                            <option value={20}>20 p/ pág</option>
                            <option value={30}>30 p/ pág</option>
                            <option value={50}>50 p/ pág</option>
                        </select>
                        <div style={{ display: 'flex', gap: '4px', borderLeft: '1px solid var(--hub-border)', paddingLeft: '8px' }}>
                            <button onClick={() => setPaginaAtual(prev => Math.max(1, prev - 1))} disabled={paginaAtual === 1} style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', color: 'var(--hub-text-secondary)', opacity: paginaAtual === 1 ? 0.3 : 1, background: 'transparent', cursor: paginaAtual === 1 ? 'default' : 'pointer', border: 'none' }}><ChevronLeft style={{ width: '16px', height: '16px' }} /></button>
                            <button onClick={() => setPaginaAtual(prev => Math.min(totalPaginas, prev + 1))} disabled={paginaAtual === totalPaginas || totalPaginas === 0} style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', color: 'var(--hub-text-secondary)', opacity: (paginaAtual === totalPaginas || totalPaginas === 0) ? 0.3 : 1, background: 'transparent', cursor: (paginaAtual === totalPaginas || totalPaginas === 0) ? 'default' : 'pointer', border: 'none' }}><ChevronRight style={{ width: '16px', height: '16px' }} /></button>
                        </div>
                    </div>
                    
                    <button onClick={onNovaRegra} className="hub-btn hub-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                        <Plus style={{ width: '16px', height: '16px' }}/> Nova Regra
                    </button>
                </div>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
                <table className="hub-table" style={{ width: '100%', minWidth: '900px' }}>
                    <thead>
                        <tr className="hub-table-header">
                            <th className="hub-table-cell" style={{ paddingLeft: '24px' }}>Regra Interna</th>
                            <th className="hub-table-cell">Evento (Pixel)</th>
                            <th className="hub-table-cell">Gatilho & Domínio</th>
                            <th className="hub-table-cell" style={{ textAlign: 'center' }}>Enriquecimento</th>
                            <th className="hub-table-cell" style={{ textAlign: 'center' }}>Status</th>
                            <th className="hub-table-cell" style={{ textAlign: 'right', paddingRight: '24px' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {acionadoresPaginados.map((acionador) => (
                            <tr key={acionador.id} className="hub-table-row">
                                <td className="hub-table-cell" style={{ paddingLeft: '24px', fontWeight: 'bold', color: 'var(--hub-text-primary)', fontSize: '14px' }}>{acionador.nome}</td>
                                <td className="hub-table-cell"><span style={{ backgroundColor: 'var(--hub-text-primary)', color: '#fff', fontSize: '10px', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{acionador.evento}</span></td>
                                <td className="hub-table-cell">
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold', color: 'var(--hub-text-primary)' }}>
                                            {acionador.tipo_gatilho === 'click' && <><MousePointer2 style={{ width: '14px', height: '14px', color: '#3b82f6' }}/> HTML Elemento</>}
                                            {acionador.tipo_gatilho === 'url_contains' && <><Globe style={{ width: '14px', height: '14px', color: '#10b981' }}/> URL Contém</>}
                                            {acionador.tipo_gatilho === 'url_exact' && <><Globe style={{ width: '14px', height: '14px', color: '#10b981' }}/> URL Exata</>}
                                            {acionador.tipo_gatilho === 'scroll' && <><ArrowDownToLine style={{ width: '14px', height: '14px', color: '#f97316' }}/> Scroll Depth</>}
                                            {acionador.tipo_gatilho === 'time' && <><Clock style={{ width: '14px', height: '14px', color: '#a855f7' }}/> Time Delay</>}
                                            {acionador.tipo_gatilho === 'form_submit' && <><Edit style={{ width: '14px', height: '14px', color: '#3b82f6' }}/> Form Submit</>}
                                            {acionador.tipo_gatilho === 'element_visibility' && <><Eye style={{ width: '14px', height: '14px', color: '#10b981' }}/> Visibility</>}
                                            {acionador.tipo_gatilho === 'exit_intent' && <><ArrowLeft style={{ width: '14px', height: '14px', color: '#f43f5e' }}/> Exit Intent</>}
                                            {acionador.tipo_gatilho === 'custom_event' && <><Zap style={{ width: '14px', height: '14px', color: '#f59e0b' }}/> Custom Layer</>}
                                        </div>
                                        {acionador.valor_gatilho && <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--hub-text-secondary)', backgroundColor: 'var(--hub-background)', border: '1px solid var(--hub-border-subtle)', padding: '2px 8px', borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{acionador.valor_gatilho}</span>}
                                        <span style={{ fontSize: '9px', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '4px' }}><Target style={{ width: '12px', height: '12px' }}/> Alvo: {acionador.url_alvo || '*'}</span>
                                    </div>
                                </td>
                                <td className="hub-table-cell" style={{ textAlign: 'center', fontSize: '10px', fontWeight: 'bold', color: 'var(--hub-text-secondary)' }}>
                                    <span style={{ backgroundColor: '#f0f9ff', color: '#0369a1', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e0f2fe' }}>{Object.values(acionador.payload || {}).filter(v => v).length} Parâmetros</span>
                                </td>
                                <td className="hub-table-cell" style={{ textAlign: 'center' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: 'bold', padding: '4px 12px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: acionador.status ? '#d1fae5' : '#f1f5f9', color: acionador.status ? '#047857' : '#64748b' }}>
                                        {acionador.status ? 'Ativo' : 'Pausado'}
                                    </span>
                                </td>
                                <td className="hub-table-cell" style={{ textAlign: 'right', paddingRight: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        <button onClick={() => onEdit(acionador)} style={{ padding: '8px', color: 'var(--hub-text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '8px' }}><Edit style={{ width: '16px', height: '16px' }}/></button>
                                        <button onClick={() => onDelete(acionador.id)} style={{ padding: '8px', color: 'var(--hub-text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '8px' }}><Trash2 style={{ width: '16px', height: '16px' }}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {acionadoresPaginados.length === 0 && <tr><td colSpan="6" className="hub-table-cell" style={{ textAlign: 'center', padding: '40px', color: 'var(--hub-text-secondary)' }}>Nenhuma regra customizada. Vá em frente e crie a primeira!</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AcionadoresPersonalizados;
