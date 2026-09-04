import React from 'react';
import { Boxes, CircleAlert, Layers3, PackageCheck, PackageX, Plus } from 'lucide-react';
import { Button } from '../DesignSystem/primitives/Button';
import { formatNumber } from './catalogUtils';

const Metric = ({ icon: Icon, label, value, detail, tone }) => (
  <article className="hub-orders-metric" data-tone={tone || 'default'}>
    <span className="hub-orders-metric-icon"><Icon aria-hidden="true" size={18} /></span>
    <p>{label}</p><strong>{value}</strong><span>{detail}</span>
  </article>
);

export const CatalogDashboard = ({ products, total, onCreate, onBrowse }) => {
  const active = products.filter((product) => product.status_vitrine === 'ATIVO').length;
  const lowStock = products.filter((product) => product.controlar_estoque && !product.pre_venda && Number(product.quantidade_estoque) <= (Number(product.alerta_estoque) || 5)).length;
  const totalStock = products.filter((product) => product.controlar_estoque).reduce((sum, product) => sum + (Number(product.quantidade_estoque) || 0), 0);
  const variations = products.reduce((sum, product) => sum + (product.variacoes?.length || 0), 0);

  return <div className="hub-catalog-stack">
    <section className="hub-surface hub-orders-metrics" aria-label="Indicadores do catálogo">
      <Metric icon={Boxes} label="Itens no catálogo" value={formatNumber(total)} detail="Total encontrado pelos filtros" />
      <Metric icon={PackageCheck} label="Ativos nesta página" value={formatNumber(active)} detail="Visíveis na vitrine entre os itens carregados" tone="success" />
      <Metric icon={PackageX} label="Atenção no estoque" value={formatNumber(lowStock)} detail="Abaixo do limite configurado nesta página" tone={lowStock ? 'warning' : 'default'} />
      <Metric icon={Layers3} label="Variações carregadas" value={formatNumber(variations)} detail="Grades dos itens exibidos agora" />
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
