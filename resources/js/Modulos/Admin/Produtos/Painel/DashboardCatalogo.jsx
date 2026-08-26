import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { gerarCSV } from '../Compartilhado/ComponentesUI';
import { Button } from '../../DesignSystem/primitives/Button';
import { Badge } from '../../DesignSystem/primitives/Badge';

const DashboardSkeleton = () => (
    <div className="animate-pulse" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ backgroundColor: 'var(--hub-surface-subtle)', border: '1px solid var(--hub-border-subtle)', borderRadius: 'var(--hub-radius-lg)', width: '100%', height: '100px', marginBottom: '24px' }}></div>
        <div style={{ backgroundColor: 'var(--hub-surface-subtle)', border: '1px solid var(--hub-border-subtle)', borderRadius: 'var(--hub-radius-lg)', width: '100%', height: '300px' }}></div>
    </div>
);

export default function DashboardCatalogo({ produtos, isRefreshing, abrirEdicaoProduto }) {
    const [filtroDashboard, setFiltroDashboard] = useState('30D');

    let multiplicador = 1;
    if (filtroDashboard === '7D') multiplicador = 0.25;
    if (filtroDashboard === '365D') multiplicador = 12;

    const totalVendas = Math.floor(produtos.reduce((acc, p) => acc + (p.vendas || 0), 0) * multiplicador);
    const totalReceita = produtos.reduce((acc, p) => acc + (p.receitaGerada || 0), 0) * multiplicador;
    const receitaAnterior = totalReceita * 0.85; 
    const aumentoReceita = totalReceita > 0 ? ((totalReceita - receitaAnterior) / receitaAnterior) * 100 : 0;
    
    const topSellers = [...produtos].sort((a, b) => (b.vendas || 0) - (a.vendas || 0)).slice(0, 10);

    return (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
            <div className="modal-responsive-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px' }}>
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--hub-text-primary)', margin: 0 }}>Visão Geral do Catálogo</h2>
                    <p style={{ fontSize: '14px', color: 'var(--hub-text-secondary)', marginTop: '4px', margin: 0 }}>Métricas em tempo real de produtos e faturamento.</p>
                </div>
                <div className="modal-responsive-flex" style={{ display: 'flex', gap: '12px', width: 'auto' }}>
                    <select 
                        value={filtroDashboard} 
                        onChange={e => setFiltroDashboard(e.target.value)} 
                        className="hub-select"
                    >
                        <option value="7D">Últimos 7 dias</option>
                        <option value="30D">Últimos 30 dias</option>
                        <option value="365D">Último Ano</option>
                    </select>
                    <Button 
                        variant="outline"
                        icon={Download}
                        onClick={() => gerarCSV(produtos)}
                    >
                        Baixar CSV
                    </Button>
                </div>
            </div>

            {isRefreshing ? (
                <DashboardSkeleton />
            ) : (
                <>
                    <div className="hub-panel custom-scrollbar" style={{ width: '100%', overflowX: 'auto', display: 'flex', marginBottom: '24px' }}>
                        <div className="hub-metric-item" style={{ flexShrink: 0, minWidth: '240px', padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid var(--hub-border-subtle)', cursor: 'default' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--hub-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Receita Bruta</span>
                                <Badge variant={aumentoReceita >= 0 ? 'success' : 'danger'}>
                                    {aumentoReceita >= 0 ? '+' : ''}{aumentoReceita.toFixed(1)}%
                                </Badge>
                            </div>
                            <p style={{ fontSize: '28px', fontWeight: '900', color: 'var(--hub-text-primary)', letterSpacing: '-0.02em', lineHeight: 1, margin: '4px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                R$ {totalReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>

                        <div className="hub-metric-item" style={{ flexShrink: 0, width: '200px', padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid var(--hub-border-subtle)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--hub-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Produtos</span>
                            </div>
                            <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--hub-text-primary)', letterSpacing: '-0.02em', lineHeight: 1, margin: '4px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {produtos.length}
                            </p>
                        </div>

                        <div className="hub-metric-item" style={{ flexShrink: 0, width: '200px', padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid var(--hub-border-subtle)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--hub-success)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ativos</span>
                            </div>
                            <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--hub-success)', letterSpacing: '-0.02em', lineHeight: 1, margin: '4px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {produtos.filter(p => p.status === 'ATIVO').length}
                            </p>
                        </div>

                        <div className="hub-metric-item" style={{ flexShrink: 0, width: '200px', padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid var(--hub-border-subtle)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--hub-danger)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Esgotados</span>
                            </div>
                            <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--hub-danger)', letterSpacing: '-0.02em', lineHeight: 1, margin: '4px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {produtos.filter(p => p.controlarEstoque && p.estoque === 0 && !p.preVenda).length}
                            </p>
                        </div>

                        <div className="hub-metric-item" style={{ flexShrink: 0, width: '200px', padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--hub-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unid. Vendidas</span>
                            </div>
                            <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--hub-primary)', letterSpacing: '-0.02em', lineHeight: 1, margin: '4px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {totalVendas}
                            </p>
                        </div>
                    </div>

                    <section className="hub-panel" style={{ overflow: 'hidden', marginTop: '24px' }} aria-label="Top 10 Mais Vendidos">
                        <header className="hub-table-header" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--hub-text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>Top 10 Mais Vendidos</h3>
                        </header>
                        <div className="custom-scrollbar" style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '900px' }}>
                                <thead>
                                    <tr className="hub-table-header">
                                        <th className="hub-table-cell" style={{ paddingLeft: '24px' }}>Produto</th>
                                        <th className="hub-table-cell" style={{ textAlign: 'center' }}>Vendas</th>
                                        <th className="hub-table-cell" style={{ textAlign: 'center' }}>Status</th>
                                        <th className="hub-table-cell" style={{ textAlign: 'center' }}>Estoque</th>
                                        <th className="hub-table-cell" style={{ textAlign: 'center' }}>Última Venda</th>
                                        <th className="hub-table-cell" style={{ textAlign: 'right', paddingRight: '24px' }}>Receita Bruta</th>
                                    </tr>
                                </thead>
                                <tbody style={{ borderTop: '1px solid var(--hub-border-subtle)' }}>
                                    {topSellers.map((p, idx) => {
                                        const v = Math.floor((p.vendas || 0) * (filtroDashboard === '7D' ? 0.25 : filtroDashboard === '365D' ? 12 : 1));
                                        const r = (p.receitaGerada || 0) * (filtroDashboard === '7D' ? 0.25 : filtroDashboard === '365D' ? 12 : 1);
                                        
                                        let statusVariant = 'success';
                                        if (p.status === 'INATIVO') statusVariant = 'neutral';
                                        if (p.status === 'OCULTO') statusVariant = 'warning';

                                        return (
                                        <tr key={p.id} onClick={() => abrirEdicaoProduto(p)} className="hub-tr group" style={{ cursor: 'pointer' }}>
                                            <td className="hub-table-cell" style={{ paddingLeft: '24px', display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
                                                <div className="hub-hover-show" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: 'var(--hub-primary)', opacity: 0, transition: 'opacity 0.2s' }}></div>
                                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--hub-text-muted)', width: '16px' }}>{idx + 1}</span>
                                                <img src={p.img || 'https://via.placeholder.com/40'} alt="" style={{ width: '40px', height: '40px', borderRadius: 'var(--hub-radius-sm)', objectFit: 'cover', border: '1px solid var(--hub-border-subtle)', backgroundColor: '#fff' }} />
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: 'bold', color: 'var(--hub-text-primary)', fontSize: '14px', transition: 'color 0.2s' }}>{p.nome}</span>
                                                    <span style={{ fontSize: '12px', color: 'var(--hub-text-muted)', marginTop: '2px' }}>{p.skuRef}-{p.skuSufixo}</span>
                                                </div>
                                            </td>
                                            <td className="hub-table-cell" style={{ textAlign: 'center' }}>
                                                <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--hub-text-primary)' }}>{v}</span>
                                            </td>
                                            <td className="hub-table-cell" style={{ textAlign: 'center' }}>
                                                <Badge variant={statusVariant}>{p.status === 'INATIVO' ? 'Inativo' : p.status === 'OCULTO' ? 'Oculto' : 'Ativo'}</Badge>
                                            </td>
                                            <td className="hub-table-cell" style={{ textAlign: 'center' }}>
                                                {p.preVenda ? <Badge variant="special">Encomenda</Badge> : p.estoque === 0 ? <Badge variant="danger">Esgotado</Badge> : <span style={{ fontWeight: '500', color: 'var(--hub-text-primary)', fontSize: '14px' }}>{p.estoque} un</span>}
                                            </td>
                                            <td className="hub-table-cell" style={{ textAlign: 'center', fontSize: '13px', color: 'var(--hub-text-muted)' }}>
                                                Hoje, 10:42
                                            </td>
                                            <td className="hub-table-cell" style={{ paddingRight: '24px', textAlign: 'right' }}>
                                                <span style={{ fontWeight: 'bold', color: 'var(--hub-text-primary)', fontSize: '15px' }}>R$ {parseFloat(r || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                            </td>
                                        </tr>
                                    )})}
                                    {topSellers.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="hub-table-cell" style={{ padding: '32px', textAlign: 'center', color: 'var(--hub-text-secondary)', fontSize: '14px', fontWeight: '500' }}>Nenhuma venda registrada no período.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
