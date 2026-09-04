import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CircleAlert, ClipboardList, LayoutDashboard, List, Package, Plus, RefreshCw } from 'lucide-react';
import { PageHeader } from '../DesignSystem/patterns/PageHeader';
import { Button } from '../DesignSystem/primitives/Button';
import { ProductEditor } from './ProductEditor';
import { toProductEditorModel } from '../Produtos/produtoContract';
import { adminQueryKeys } from '../../../queryClient';
import { CatalogAudit } from './CatalogAudit';
import { CatalogDashboard } from './CatalogDashboard';
import { CatalogList } from './CatalogList';
import { fetchProductAudits, fetchProductCategories, fetchProducts } from './catalogApi';
import { errorMessage } from './catalogUtils';

const initialFilters = { page: 1, perPage: 15, search: '', category: 'TODAS', status: 'TODOS' };
const initialProduct = {
  id: null, nome: '', status: 'INATIVO', categoriaPrincipal: '', preco: '', precoPromo: '', estoque: '',
  controlarEstoque: true, alertaEstoque: '', alertaModerado: '', alertaAlto: '', skuRef: '', skuSufixo: '',
  descricao: '', ncm: '', cest: '', gtin: '', origem: '0', csosn: '102', cst: '102', cfop: '',
  cfopDentro: '', unidade: 'UN', icmsPerc: '', ipiPerc: '', peso: '', comp: '', largura: '', altura: '',
  agrupavel: false, metaTitle: '', metaDesc: '', slug: '', galeriaObjects: [], preVenda: false, isNovo: true,
};

const tabs = [
  { value: 'PAINEL', label: 'Painel', icon: LayoutDashboard },
  { value: 'PRODUTOS', label: 'Produtos', icon: List },
  { value: 'AUDITORIA', label: 'Auditoria', icon: ClipboardList },
];

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('PAINEL');
  const [filters, setFilters] = useState(initialFilters);
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState('');

  const productsQuery = useQuery({ queryKey: adminQueryKeys.products(filters), queryFn: () => fetchProducts(filters) });
  const categoriesQuery = useQuery({ queryKey: adminQueryKeys.productCategories(), queryFn: fetchProductCategories });
  const auditsQuery = useQuery({ queryKey: adminQueryKeys.productAudits(), queryFn: fetchProductAudits, enabled: tab === 'AUDITORIA' });

  const pagination = useMemo(() => ({
    page: Number(productsQuery.data?.current_page) || filters.page,
    lastPage: Number(productsQuery.data?.last_page) || 1,
    total: Number(productsQuery.data?.total) || 0,
  }), [filters.page, productsQuery.data]);
  const products = productsQuery.data?.data || [];
  const categories = Array.isArray(categoriesQuery.data) ? categoriesQuery.data : categoriesQuery.data?.data || [];
  const changeFilters = (changes) => setFilters((current) => ({ ...current, ...changes }));
  const refresh = () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.products() });

  const openProduct = (product) => { setSelected(toProductEditorModel(product)); setTab('EDITOR'); };
  const createProduct = () => { setSelected(initialProduct); setTab('EDITOR'); };
  const saved = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.products() }),
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.productAudits() }),
    ]);
    setNotice('Produto salvo. A lista e a auditoria foram atualizadas.');
  };

  if (productsQuery.isError) return <section className="hub-surface hub-error-state" role="alert"><div><CircleAlert aria-hidden="true" size={28} /><h1 className="hub-panel-title">Não foi possível carregar o catálogo</h1><p>{errorMessage(productsQuery.error)}</p><Button className="mt-5" icon={RefreshCw} onClick={() => productsQuery.refetch()}>Tentar novamente</Button></div></section>;

  if (tab === 'EDITOR' && selected) return <div className="hub-catalog-editor-shell"><ProductEditor productOriginal={selected} categories={categories} onBack={() => setTab('PRODUTOS')} onSuccess={saved} /></div>;

  return <div className="hub-page-container hub-catalog-page">
    <PageHeader eyebrow="Catálogo e estoque" title="Produtos" icon={Package} description="Organize produtos, estoque, mídia, dados fiscais e SEO com dados atuais da loja." actions={<div className="hub-catalog-actions"><Button variant="secondary" icon={RefreshCw} loading={productsQuery.isFetching} onClick={refresh}>Atualizar</Button><Button icon={Plus} onClick={createProduct}>Novo produto</Button></div>} />
    {notice ? <p className="hub-catalog-notice" role="status">{notice}</p> : null}
    <nav className="hub-orders-tabs" aria-label="Seções do catálogo">{tabs.map((item) => { const Icon = item.icon; return <button type="button" key={item.value} className="hub-orders-tab" data-active={tab === item.value} onClick={() => setTab(item.value)}><Icon aria-hidden="true" size={16} /> {item.label}</button>; })}</nav>
    {tab === 'PAINEL' ? <CatalogDashboard products={products} total={pagination.total} onCreate={createProduct} onBrowse={() => setTab('PRODUTOS')} /> : null}
    {tab === 'PRODUTOS' ? <CatalogList products={products} categories={categories} filters={filters} pagination={pagination} loading={productsQuery.isLoading || productsQuery.isFetching} onChange={changeFilters} onClear={() => setFilters(initialFilters)} onCreate={createProduct} onEdit={openProduct} /> : null}
    {tab === 'AUDITORIA' ? <CatalogAudit logs={Array.isArray(auditsQuery.data) ? auditsQuery.data : auditsQuery.data?.data || []} loading={auditsQuery.isLoading || auditsQuery.isFetching} error={auditsQuery.isError ? errorMessage(auditsQuery.error) : ''} onRefresh={() => auditsQuery.refetch()} /> : null}
  </div>;
}
