import React, { useState, useMemo, useEffect } from 'react';
import { Search, Image as ImageIcon, ChevronLeft, ChevronRight, Plus, PackageX, EyeOff } from 'lucide-react';
import { Button } from '../../DesignSystem/primitives/Button';
import { IconButton } from '../../DesignSystem/primitives/IconButton';
import { Badge } from '../../DesignSystem/primitives/Badge';

const ProductsSkeleton = () => (
    <div className="animate-pulse" style={{ display: 'flex', flexDirection: 'column' }}>
        {[...Array(6)].map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid var(--hub-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--hub-surface-subtle)', borderRadius: 'var(--hub-radius-md)' }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ height: '16px', width: '192px', backgroundColor: 'var(--hub-surface-subtle)', borderRadius: '4px' }}></div>
                        <div style={{ height: '12px', width: '96px', backgroundColor: 'var(--hub-surface-subtle)', borderRadius: '4px' }}></div>
                    </div>
                </div>
                <div style={{ height: '16px', width: '96px', backgroundColor: 'var(--hub-surface-subtle)', borderRadius: '4px' }}></div>
                <div style={{ height: '16px', width: '64px', backgroundColor: 'var(--hub-surface-subtle)', borderRadius: '4px' }}></div>
            </div>
        ))}
    </div>
);

export default function ListaDeProdutos({ 
    produtos, 
    categorias,
    isRefreshing, 
    abrirEdicaoProduto,
    abrirNovoProduto,
    termoPesquisa, setTermoPesquisa,
    filtroCategoria, setFiltroCategoria,
    filtroStatus, setFiltroStatus,
    itensPorPagina, setItensPorPagina,
    paginaAtual, setPaginaAtual,
    totalPages, totalProdutos
}) {
    // Client-side filtering removed. We rely on the `produtos` prop which is already filtered and paginated by the server.
    const currentProdutos = produtos;

    return (
        <div className="fade-in" style={{ paddingBottom: '48px' }}>
            {/* Filter Bar */}
            <div className="hub-panel modal-responsive-flex" style={{ display: 'flex', padding: '16px', marginBottom: '24px', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--hub-text-muted)' }} size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar Produto ou SKU..." 
                        value={termoPesquisa} 
                        onChange={e => setTermoPesquisa(e.target.value)} 
                        className="hub-input" 
                        style={{ width: '100%', paddingLeft: '36px' }}
                    />
                </div>
                <div className="modal-responsive-flex" style={{ display: 'flex', gap: '12px', width: 'auto' }}>
                    <select 
                        value={itensPorPagina} 
                        onChange={(e) => setItensPorPagina(Number(e.target.value))} 
                        className="hub-select"
                    >
                        <option value={10}>10 por página</option>
                        <option value={20}>20 por página</option>
                        <option value={50}>50 por página</option>
                        <option value={100}>100 por página</option>
                    </select>
                    <select 
                        value={filtroCategoria} 
                        onChange={(e) => setFiltroCategoria(e.target.value)} 
                        className="hub-select"
                        style={{ maxWidth: '200px' }}
                    >
                        <option value="TODAS">Todas Categorias</option>
                        {categorias.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                    </select>
                    <select 
                        value={filtroStatus} 
                        onChange={(e) => setFiltroStatus(e.target.value)} 
                        className="hub-select"
                        style={{ maxWidth: '200px' }}
                    >
                        <option value="TODOS">Status: Todos</option>
                        <option value="ATIVO">Ativo</option>
                        <option value="INATIVO">Inativo</option>
                        <option value="ESGOTADO">Esgotado</option>
                        <option value="ENCOMENDA">Por Encomenda</option>
                    </select>
                </div>
            </div>

            {/* Table Panel */}
            <div className="hub-panel" style={{ overflow: 'hidden' }}>
                <div className="custom-scrollbar" style={{ overflowX: 'auto' }}>
                    {isRefreshing ? (
                        <ProductsSkeleton />
                    ) : currentProdutos.length > 0 ? (
                        <table style={{ width: '100%', textAlign: 'left', fontSize: '14px', color: 'var(--hub-text-secondary)', whiteSpace: 'nowrap', minWidth: '1000px', borderCollapse: 'collapse' }}>
                            <thead className="hub-table-header">
                                <tr>
                                    <th className="hub-table-cell">Produto & SKU</th>
                                    <th className="hub-table-cell" style={{ textAlign: 'center' }}>Categoria</th>
                                    <th className="hub-table-cell" style={{ textAlign: 'right' }}>Preço</th>
                                    <th className="hub-table-cell" style={{ textAlign: 'center' }}>Status</th>
                                    <th className="hub-table-cell" style={{ textAlign: 'center' }}>Estoque</th>
                                </tr>
                            </thead>
                            <tbody style={{ borderTop: '1px solid var(--hub-border-subtle)' }}>
                                {currentProdutos.map(p => {
                                    const valPromo = parseFloat(p.precoPromo);
                                    
                                    let statusVariant = 'success';
                                    if (p.status === 'INATIVO') statusVariant = 'neutral';
                                    if (p.status === 'OCULTO') statusVariant = 'warning';

                                    let estoqueBadge = null;
                                    if (p.preVenda) {
                                        estoqueBadge = <Badge variant="special">Encomenda</Badge>;
                                    } else if (p.controlarEstoque) {
                                        if (p.estoque === 0) {
                                            estoqueBadge = <Badge variant="danger">Esgotado</Badge>;
                                        } else if (p.estoque <= (p.alertaEstoque || 5)) {
                                            estoqueBadge = <Badge variant="warning">{p.estoque} (Baixo)</Badge>;
                                        } else {
                                            estoqueBadge = <span style={{ fontWeight: '500', color: 'var(--hub-text-primary)' }}>{p.estoque} un</span>;
                                        }
                                    } else {
                                        estoqueBadge = <span style={{ fontSize: '13px', color: 'var(--hub-text-muted)' }}>Infinito</span>;
                                    }

                                    return (
                                        <tr 
                                            key={p.id} 
                                            className="hub-tr group" 
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => abrirEdicaoProduto(p)}
                                        >
                                            <td className="hub-table-cell" style={{ display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left' }}>
                                                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--hub-radius-md)', overflow: 'hidden', border: '1px solid var(--hub-border-subtle)', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    {p.img ? (
                                                        <img src={p.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                                    ) : (
                                                        <ImageIcon size={20} style={{ color: 'var(--hub-text-muted)', opacity: 0.5 }} />
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                                    <span style={{ fontWeight: '600', color: 'var(--hub-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '240px', display: 'block', transition: 'color 0.2s' }} className="group-hover:text-[var(--hub-primary)]">
                                                        {p.nome}
                                                    </span>
                                                    <span style={{ fontSize: '13px', color: 'var(--hub-text-muted)', marginTop: '2px' }}>
                                                        {p.skuRef}-{p.skuSufixo}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="hub-table-cell" style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    <span style={{ fontWeight: '500', color: 'var(--hub-text-primary)' }}>{p.categoriaPrincipal || 'Sem Categoria'}</span>
                                                    {p.categoriasSecundarias && p.categoriasSecundarias.length > 0 && (
                                                        <span style={{ fontSize: '12px', color: 'var(--hub-text-muted)', marginTop: '2px' }}>+ {p.categoriasSecundarias.length} extras</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="hub-table-cell" style={{ textAlign: 'right' }}>
                                                {valPromo > 0 ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                        <span style={{ fontSize: '12px', color: 'var(--hub-text-muted)', textDecoration: 'line-through' }}>R$ {parseFloat(p.preco).toFixed(2)}</span>
                                                        <span style={{ fontWeight: 'bold', color: 'var(--hub-success)' }}>R$ {valPromo.toFixed(2)}</span>
                                                    </div>
                                                ) : (
                                                    <span style={{ fontWeight: 'bold', color: 'var(--hub-text-primary)' }}>R$ {parseFloat(p.preco).toFixed(2)}</span>
                                                )}
                                            </td>
                                            <td className="hub-table-cell" style={{ textAlign: 'center' }}>
                                                <Badge variant={statusVariant}>{p.status}</Badge>
                                            </td>
                                            <td className="hub-table-cell" style={{ textAlign: 'center' }}>
                                                {estoqueBadge}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ padding: '64px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                            <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--hub-surface-subtle)', border: '1px solid var(--hub-border-subtle)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                                <Search size={24} style={{ color: 'var(--hub-text-muted)', opacity: 0.7 }} />
                            </div>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--hub-text-primary)', margin: '0 0 8px 0' }}>Nenhum produto encontrado</h3>
                            <p style={{ fontSize: '14px', color: 'var(--hub-text-secondary)', maxWidth: '24rem', margin: '0 0 24px 0' }}>Não encontramos produtos com os filtros atuais. Limpe a busca ou crie um novo produto.</p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {(termoPesquisa !== '' || filtroCategoria !== 'TODAS' || filtroStatus !== 'TODOS') && (
                                    <Button 
                                        variant="outline"
                                        onClick={(e) => { 
                                            e.stopPropagation();
                                            setTermoPesquisa(''); 
                                            setFiltroCategoria('TODAS'); 
                                            setFiltroStatus('TODOS'); 
                                        }} 
                                    >
                                        Limpar Filtros
                                    </Button>
                                )}
                                <Button 
                                    variant="primary"
                                    icon={Plus}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        abrirNovoProduto();
                                    }}
                                >
                                    Novo Produto
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ padding: '16px', borderTop: '1px solid var(--hub-border-subtle)', backgroundColor: 'var(--hub-surface-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--hub-text-secondary)' }}>Página {paginaAtual} de {totalPages}</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <IconButton 
                                icon={ChevronLeft} 
                                label="Página anterior"
                                onClick={() => setPaginaAtual(p => Math.max(1, p - 1))} 
                                disabled={paginaAtual === 1}
                                style={{ backgroundColor: '#fff', border: '1px solid var(--hub-border-subtle)' }}
                            />
                            <IconButton 
                                icon={ChevronRight} 
                                label="Próxima página"
                                onClick={() => setPaginaAtual(p => Math.min(totalPages, p + 1))} 
                                disabled={paginaAtual === totalPages}
                                style={{ backgroundColor: '#fff', border: '1px solid var(--hub-border-subtle)' }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
