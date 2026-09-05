import React from 'react';
import { Boxes, CircleAlert, Layers3, PackageCheck, PackageX, Plus } from 'lucide-react';
import { Button } from '../DesignSystem/primitives/Button';
import { MetricCard } from '../DesignSystem/primitives/MetricCard';
import { Skeleton } from '../DesignSystem/primitives/Skeleton';
import { formatNumber } from './catalogUtils';

const hasConfiguredStockAlert = (product) => (
  product.alerta_estoque !== null
  && product.alerta_estoque !== undefined
  && product.alerta_estoque !== ''
);

const needsStockAttention = (product) => (
  product.controlar_estoque
  && !product.pre_venda
  && hasConfiguredStockAlert(product)
  && Number(product.quantidade_estoque) <= Number(product.alerta_estoque)
);

const DashboardSkeleton = () => (
  <section className="hub-catalog-metric-skeleton" role="status" aria-label="Carregando indicadores do catálogo">
    {[0, 1, 2, 3].map((item) => <Skeleton key={item} />)}
  </section>
);

export const CatalogDashboard = ({ products, total, loading, onCreate, onBrowse }) => {
  if (loading) return <DashboardSkeleton />;

  const active = products.filter((product) => product.status_vitrine === 'ATIVO').length;
  const lowStock = products.filter(needsStockAttention).length;
  const totalStock = products.filter((product) => product.controlar_estoque).reduce((sum, product) => sum + (Number(product.quantidade_estoque) || 0), 0);
  const variations = products.reduce((sum, product) => sum + (product.variacoes?.length || 0), 0);

  return <div className="hub-catalog-stack">
    <section className="hub-metric-grid" aria-label="Indicadores do catálogo">
      <MetricCard icon={Boxes} label="Itens no catálogo" value={formatNumber(total)} detail="Total retornado pela consulta atual" definition="Contagem total informada pela paginação da API para os filtros selecionados." />
      <MetricCard icon={PackageCheck} label="Ativos nesta página" value={formatNumber(active)} detail="Visíveis entre os itens carregados" tone="success" definition="Produtos com status de vitrine ativo apenas entre os itens carregados nesta página." />
      <MetricCard icon={PackageX} label="Atenção no estoque" value={formatNumber(lowStock)} detail="No limite de alerta configurado" tone={lowStock ? 'warning' : 'default'} definition="Produtos com controle de estoque cujo saldo é menor ou igual ao alerta cadastrado." />
      <MetricCard icon={Layers3} label="Variações carregadas" value={formatNumber(variations)} detail="Grades dos itens exibidos agora" definition="Soma das variações devolvidas pela API nos produtos carregados nesta página." />
    </section>
    <section className="hub-surface hub-catalog-overview">
      <div>
        <p className="hub-page-eyebrow">Operação de catálogo</p>
        <h2 className="hub-panel-title">Estoque disponível nesta página: {formatNumber(totalStock)} unidades</h2>
        <p className="hub-panel-description">Os indicadores usam somente o retorno atual da API. Para analisar vendas e receita, o catálogo precisa de um contrato de métricas próprio.</p>
      </div>
      <div className="hub-catalog-actions">
        <Button variant="secondary" onClick={onBrowse}>Ver produtos</Button>
        <Button icon={Plus} onClick={onCreate}>Novo produto</Button>
      </div>
    </section>
    {lowStock ? <p className="hub-catalog-notice"><CircleAlert aria-hidden="true" size={17} /> Há itens em atenção de estoque nos resultados carregados.</p> : null}
  </div>;
};
