import React from 'react';
import { Banknote, CircleAlert, ShoppingBag, UserRoundPlus } from 'lucide-react';
import { Button } from '../DesignSystem/primitives/Button';
import { MetricCard } from '../DesignSystem/primitives/MetricCard';
import { Skeleton } from '../DesignSystem/primitives/Skeleton';
import { formatCurrency, formatNumber } from './customerUtils';

const METRIC_KEYS = ['receita_bruta', 'total_pedidos', 'ticket_medio', 'crescimento', 'novos_clientes_pct', 'diferenca_ltv'];
const formatPercentage = (value) => `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(Number(value))}%`;
const hasUsableMetrics = (metrics) => METRIC_KEYS.every((key) => Number.isFinite(Number(metrics?.[key])));

const DashboardSkeleton = () => (
  <section className="hub-metric-skeleton-grid" role="status" aria-live="polite" aria-label="Carregando indicadores de clientes" aria-busy="true">
    {Array.from({ length: 4 }, (_, index) => <Skeleton key={`customer-metric-${index}`} />)}
  </section>
);

const DashboardUnavailable = ({ onRetry }) => (
  <section className="hub-surface hub-error-state" role="alert">
    <div>
      <CircleAlert aria-hidden="true" size={24} />
      <h2 className="hub-panel-title">Indicadores indisponíveis</h2>
      <p>Não foi possível atualizar os indicadores de relacionamento. Nenhum valor estimado é exibido.</p>
      <Button className="mt-5" variant="secondary" onClick={onRetry}>Tentar novamente</Button>
    </div>
  </section>
);

export const CustomersDashboard = ({ metrics, loading, error, onRetry, onOpenDirectory }) => {
  if (loading) return <DashboardSkeleton />;
  if (error || !hasUsableMetrics(metrics)) return <DashboardUnavailable onRetry={onRetry} />;

  return (
    <>
      <section className="hub-metric-grid" aria-label="Indicadores de clientes">
        <MetricCard
          icon={Banknote}
          label="Receita válida"
          value={formatCurrency(metrics.receita_bruta)}
          detail={`${formatPercentage(metrics.crescimento)} de variação no mês`}
          definition="Soma dos pedidos válidos; cancelados e reembolsados não entram no cálculo."
        />
        <MetricCard
          icon={ShoppingBag}
          label="Pedidos válidos"
          value={formatNumber(metrics.total_pedidos)}
          detail="Pedidos que contam para receita"
          definition="Total de pedidos não cancelados e não reembolsados."
        />
        <MetricCard
          icon={UserRoundPlus}
          label="Novos cadastros"
          value={formatPercentage(metrics.novos_clientes_pct)}
          detail="Participação na base no mês atual"
          definition="Percentual de clientes cadastrados no mês atual em relação à base de clientes."
        />
        <MetricCard
          icon={Banknote}
          label="Ticket médio"
          value={formatCurrency(metrics.ticket_medio)}
          detail={`${formatCurrency(metrics.diferenca_ltv)} de diferença mensal`}
          definition="Receita válida dividida pela quantidade de pedidos válidos."
        />
      </section>
      <section className="hub-surface hub-panel hub-customers-dashboard-callout">
        <div>
          <h2 className="hub-panel-title">Relacionamento orientado por dados</h2>
          <p className="hub-panel-description">Consulte a base, abra o perfil 360º e registre ações auditáveis de atendimento em um único fluxo.</p>
        </div>
        <Button onClick={onOpenDirectory}>Abrir diretório de clientes</Button>
      </section>
    </>
  );
};
