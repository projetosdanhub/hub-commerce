import React, { useState, useEffect } from 'react';
import { Icons } from '../Compartilhado/Icones';
import { formatDateBR } from '../Compartilhado/ComponentesUI';
import api from '../../../../api';
import { Badge } from '../../DesignSystem/primitives/Badge';

export default function AuditoriaProdutos() {
    const [filtroTempo, setFiltroTempo] = useState('7d');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/products/audits');
            if (response.data.status === 'success') {
                setLogs(response.data.data);
            } else {
                setError('Erro ao carregar auditoria.');
            }
        } catch (err) {
            setError('Falha de conexão com a API.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    // Filtro simplificado no front-end para o MVP
    const filteredLogs = logs.filter(log => {
        if (filtroTempo === 'Hoje') {
            const today = new Date().toISOString().split('T')[0];
            return log.created_at.startsWith(today);
        }
        if (filtroTempo === '7d') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return new Date(log.created_at) >= sevenDaysAgo;
        }
        if (filtroTempo === '30d') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return new Date(log.created_at) >= thirtyDaysAgo;
        }
        return true;
    });

    return (
        <div className="hub-panel" style={{ overflow: 'hidden' }}>
            <header className="modal-responsive-flex" style={{ display: 'flex', padding: '24px', borderBottom: '1px solid var(--hub-border-subtle)', backgroundColor: 'var(--hub-surface-subtle)', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <div>
                    <h2 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--hub-text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, letterSpacing: '-0.02em' }}>
                        <Icons.History style={{ width: '20px', height: '20px', color: 'var(--hub-primary)' }} /> Auditoria e Logs
                    </h2>
                    <p style={{ fontSize: '14px', color: 'var(--hub-text-secondary)', marginTop: '4px', margin: 0 }}>Histórico completo de alterações no catálogo.</p>
                </div>
                
                <div style={{ display: 'flex', backgroundColor: 'var(--hub-surface-subtle)', padding: '4px', borderRadius: 'var(--hub-radius-lg)', border: '1px solid var(--hub-border-subtle)' }}>
                    {['Hoje', '7d', '30d'].map(f => (
                        <button 
                            key={f}
                            onClick={() => setFiltroTempo(f)}
                            style={{ 
                                padding: '6px 12px', 
                                fontSize: '12px', 
                                fontWeight: 'bold', 
                                borderRadius: 'var(--hub-radius-md)', 
                                transition: 'all 0.2s', 
                                backgroundColor: filtroTempo === f ? '#fff' : 'transparent',
                                color: filtroTempo === f ? 'var(--hub-primary)' : 'var(--hub-text-secondary)',
                                border: filtroTempo === f ? '1px solid var(--hub-border-subtle)' : '1px solid transparent',
                                boxShadow: filtroTempo === f ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                                cursor: 'pointer'
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </header>

            {error && (
                <div style={{ padding: '16px', backgroundColor: 'var(--hub-danger-subtle)', borderBottom: '1px solid var(--hub-danger)', color: 'var(--hub-danger)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icons.AlertTriangle style={{ width: '16px', height: '16px' }} /> {error}
                </div>
            )}

            <div className="custom-scrollbar" style={{ overflowX: 'auto', minHeight: '300px' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead className="hub-table-header">
                        <tr>
                            <th className="hub-table-cell">Data / Hora</th>
                            <th className="hub-table-cell">Usuário / Ator</th>
                            <th className="hub-table-cell">Ação</th>
                            <th className="hub-table-cell">Entidade</th>
                            <th className="hub-table-cell">Detalhes</th>
                        </tr>
                    </thead>
                    <tbody style={{ borderTop: '1px solid var(--hub-border-subtle)' }}>
                        {loading ? (
                            Array(4).fill(0).map((_, idx) => (
                                <tr key={idx} className="animate-pulse" style={{ borderBottom: '1px solid var(--hub-border-subtle)' }}>
                                    <td className="hub-table-cell">
                                        <div style={{ height: '16px', backgroundColor: 'var(--hub-surface-subtle)', borderRadius: '4px', width: '96px', marginBottom: '8px' }}></div>
                                        <div style={{ height: '12px', backgroundColor: 'var(--hub-surface-subtle)', borderRadius: '4px', width: '64px' }}></div>
                                    </td>
                                    <td className="hub-table-cell">
                                        <div style={{ height: '20px', backgroundColor: 'var(--hub-surface-subtle)', borderRadius: '4px', width: '112px', marginBottom: '4px' }}></div>
                                        <div style={{ height: '12px', backgroundColor: 'var(--hub-surface-subtle)', borderRadius: '4px', width: '80px' }}></div>
                                    </td>
                                    <td className="hub-table-cell">
                                        <div style={{ height: '20px', backgroundColor: 'var(--hub-surface-subtle)', borderRadius: '4px', width: '80px' }}></div>
                                    </td>
                                    <td className="hub-table-cell">
                                        <div style={{ height: '16px', backgroundColor: 'var(--hub-surface-subtle)', borderRadius: '4px', width: '128px' }}></div>
                                    </td>
                                    <td className="hub-table-cell">
                                        <div style={{ height: '16px', backgroundColor: 'var(--hub-surface-subtle)', borderRadius: '4px', width: '100%', maxWidth: '250px' }}></div>
                                    </td>
                                </tr>
                            ))
                        ) : filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="hub-table-cell" style={{ padding: '48px', textAlign: 'center', color: 'var(--hub-text-secondary)' }}>
                                    Nenhum log encontrado para o período selecionado.
                                </td>
                            </tr>
                        ) : filteredLogs.map(log => (
                            <tr key={log.id} className="hub-tr transition-colors">
                                <td className="hub-table-cell" style={{ whiteSpace: 'nowrap' }}>
                                    <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--hub-text-primary)' }}>{formatDateBR(log.created_at)}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--hub-text-muted)' }}>{new Date(log.created_at).toLocaleTimeString('pt-BR')}</div>
                                </td>
                                <td className="hub-table-cell">
                                    {log.admin ? (
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '2px 8px', borderRadius: 'var(--hub-radius-md)', fontSize: '12px', fontWeight: 'bold', backgroundColor: 'var(--hub-primary-subtle)', color: 'var(--hub-primary)', width: 'fit-content' }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--hub-primary)' }}></div>
                                                {log.admin.name}
                                            </span>
                                            <span style={{ fontSize: '10px', color: 'var(--hub-text-muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '4px' }}>
                                                {log.admin.role || 'Administrador'}
                                            </span>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '2px 8px', borderRadius: 'var(--hub-radius-md)', fontSize: '12px', fontWeight: 'bold', backgroundColor: 'var(--hub-surface-subtle)', color: 'var(--hub-text-primary)', width: 'fit-content' }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--hub-text-muted)' }}></div>
                                                Sistema
                                            </span>
                                            <span style={{ fontSize: '10px', color: 'var(--hub-text-muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '4px' }}>
                                                Automático
                                            </span>
                                        </div>
                                    )}
                                </td>
                                <td className="hub-table-cell">
                                    <Badge variant={log.acao === 'Criação' ? 'success' : log.acao === 'Exclusão' ? 'danger' : 'primary'}>
                                        {log.acao}
                                    </Badge>
                                </td>
                                <td className="hub-table-cell">
                                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--hub-text-primary)' }}>{log.entidade}</div>
                                </td>
                                <td className="hub-table-cell">
                                    <div style={{ fontSize: '14px', color: 'var(--hub-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }} title={log.detalhes}>{log.detalhes}</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
