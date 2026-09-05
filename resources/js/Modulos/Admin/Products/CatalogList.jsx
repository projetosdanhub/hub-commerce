import React, { useId, useState } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, ListFilter, Pencil, Plus, Search, Tag, ToggleLeft, X } from 'lucide-react';
import { Badge } from '../DesignSystem/primitives/Badge';
import { Button } from '../DesignSystem/primitives/Button';
import { FilterButton } from '../DesignSystem/primitives/FilterButton';
import { FilterSelect } from '../DesignSystem/primitives/FilterSelect';
import { IconButton } from '../DesignSystem/primitives/IconButton';
import { Skeleton } from '../DesignSystem/primitives/Skeleton';
import { formatCurrency, productStatus, sku, stockState } from './catalogUtils';

const ProductImage = ({ product }) => <span className="hub-catalog-image">{product.img ? <img src={product.img} alt="" /> : <ImageIcon aria-hidden="true" size={20} />}</span>;

const CatalogListSkeleton = () => (
  <div className="hub-catalog-list-skeleton" aria-label="Carregando produtos">
    {[0, 1, 2, 3, 4].map((item) => <Skeleton key={item} />)}
  </div>
);

const DesktopRows = ({ products, onEdit }) => <div className="hub-order-table-wrap hub-orders-desktop-list"><table className="hub-order-table">
  <thead><tr><th>Produto</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th>Status</th><th><span className="sr-only">Ações</span></th></tr></thead>
  <tbody>{products.map((product) => {
    const status = productStatus(product); const stock = stockState(product);
    return <tr key={product.id}><td><span className="hub-catalog-product"><ProductImage product={product} /><span><strong>{product.nome}</strong><small>{sku(product)}</small></span></span></td>
      <td>{product.categoria?.nome || 'Sem categoria'}</td><td><strong>{formatCurrency(product.preco_promo || product.preco)}</strong>{product.preco_promo ? <small className="hub-catalog-old-price">{formatCurrency(product.preco)}</small> : null}</td>
      <td><Badge variant={stock.variant}>{stock.label}</Badge></td><td><Badge variant={status.variant}>{status.label}</Badge></td>
      <td><IconButton icon={Pencil} label={'Editar ' + product.nome} onClick={() => onEdit(product)} /></td></tr>;
  })}</tbody>
</table></div>;

const MobileRows = ({ products, onEdit }) => <ul className="hub-orders-mobile-list">{products.map((product) => {
  const status = productStatus(product); const stock = stockState(product);
  return <li key={product.id}><button type="button" className="hub-orders-mobile-card" onClick={() => onEdit(product)}>
    <span className="hub-catalog-mobile-title"><ProductImage product={product} /><span><strong>{product.nome}</strong><small>{sku(product)}</small></span></span>
    <span className="hub-orders-mobile-card-foot"><strong>{formatCurrency(product.preco_promo || product.preco)}</strong><Badge variant={status.variant}>{status.label}</Badge></span>
    <span className="hub-orders-muted">{product.categoria?.nome || 'Sem categoria'} · {stock.label}</span>
  </button></li>;
})}</ul>;

export const CatalogList = ({ products, categories, filters, pagination, loading, onChange, onClear, onCreate, onEdit }) => {
  const filterPanelId = useId();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilterCount = [filters.search, filters.category !== 'TODAS', filters.status !== 'TODOS'].filter(Boolean).length;
  const hasFilters = Boolean(activeFilterCount);

  return <section className="hub-surface hub-orders-list">
    <header className="hub-orders-list-header"><div><h2 className="hub-panel-title">Diretório de produtos</h2><p className="hub-panel-description">Edite informações, estoque, mídia, fiscal e SEO de cada item.</p></div><Button icon={Plus} onClick={onCreate}>Novo produto</Button></header>
    <div className="hub-filter-toolbar">
      <FilterButton className="hub-catalog-filter-toggle" activeCount={activeFilterCount} aria-expanded={filtersOpen} aria-controls={filterPanelId} onClick={() => setFiltersOpen((value) => !value)}>Filtros</FilterButton>
      {hasFilters ? <Button size="sm" variant="ghost" onClick={onClear}>Limpar filtros</Button> : null}
    </div>
    <div id={filterPanelId} className="hub-filter-panel" data-open={filtersOpen}>
      <label className="hub-filter-search"><Search aria-hidden="true" size={17} /><span className="sr-only">Buscar produto</span><input value={filters.search} onChange={(event) => onChange({ search: event.target.value, page: 1 })} placeholder="Buscar nome ou SKU" />{filters.search ? <IconButton icon={X} size="sm" label="Limpar busca" onClick={() => onChange({ search: '', page: 1 })} /> : null}</label>
      <FilterSelect label="Filtrar por categoria" icon={Tag} value={filters.category} onChange={(event) => onChange({ category: event.target.value, page: 1 })}><option value="TODAS">Todas as categorias</option>{categories.map((category) => <option key={category.id} value={category.nome}>{category.nome}</option>)}</FilterSelect>
      <FilterSelect label="Filtrar por status" icon={ToggleLeft} value={filters.status} onChange={(event) => onChange({ status: event.target.value, page: 1 })}><option value="TODOS">Todos os status</option><option value="ATIVO">Ativos</option><option value="INATIVO">Inativos</option><option value="ESGOTADO">Esgotados</option><option value="ENCOMENDA">Sob encomenda</option></FilterSelect>
      <FilterSelect label="Itens por página" icon={ListFilter} value={filters.perPage} onChange={(event) => onChange({ perPage: Number(event.target.value), page: 1 })}><option value="15">15 por página</option><option value="30">30 por página</option><option value="50">50 por página</option></FilterSelect>
      {hasFilters ? <Button size="sm" variant="ghost" onClick={onClear}>Limpar</Button> : null}
    </div>
    {loading && !products.length ? <CatalogListSkeleton /> : products.length ? <><DesktopRows products={products} onEdit={onEdit} /><MobileRows products={products} onEdit={onEdit} /></> : <div className="hub-empty-state"><div><ImageIcon aria-hidden="true" size={28} /><h2 className="hub-panel-title">Nenhum produto encontrado</h2><p>Altere os filtros ou comece cadastrando o primeiro item da loja.</p><div className="hub-catalog-empty-actions">{hasFilters ? <Button variant="secondary" onClick={onClear}>Limpar filtros</Button> : null}<Button icon={Plus} onClick={onCreate}>Novo produto</Button></div></div></div>}
    {pagination.lastPage > 1 ? <footer className="hub-orders-pagination"><span>Página {pagination.page} de {pagination.lastPage} · {pagination.total} produto(s)</span><div><IconButton icon={ChevronLeft} label="Página anterior" disabled={pagination.page === 1} onClick={() => onChange({ page: pagination.page - 1 })} /><IconButton icon={ChevronRight} label="Próxima página" disabled={pagination.page === pagination.lastPage} onClick={() => onChange({ page: pagination.page + 1 })} /></div></footer> : null}
  </section>;
};
