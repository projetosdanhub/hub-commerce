import React from 'react';
import { Banknote, CircleAlert, CreditCard, PackageCheck, RotateCcw } from 'lucide-react';
import { Button } from '../DesignSystem/primitives/Button';
import { MetricCard } from '../DesignSystem/primitives/MetricCard';
import { Skeleton } from '../DesignSystem/primitives/Skeleton';
import { formatCurrency, formatNumber } from './orderUtils';

const MetricsSkeleton = () => (
  <section className="hub-metric-skeleton-grid hub-orders-metrics" role="status" aria-live="polite" aria-label="Carregando métricas de pedidos" aria-busy="true">
    {Array.from({ length: 4 }, (_, index) => <Skeleton key={`order-metric-${index}`} />)}
  </section>
);

const MetricsUnavailable = ({ onRetry }) => (
  <section className="hub-surface hub-error-state hub-orders-metrics-unavailable" role="alert">
    <div>
      <CircleAlert aria-hidden="true" size={24} />
      <h2 className="hub-panel-title">Métricas indisponíveis</h2>
      <p>Não foi possível atualizar os indicadores de pedidos. Nenhum valor estimado é exibido.</p>
      <Button className="mt-5" variant="secondary" onClick={onRetry}>Tentar novamente</Button>
    </div>
  </section>
);

export const OrderMetrics = ({ metrics, loading, error, onRetry }) => {
  if (loading) return <MetricsSkeleton />;
  if (error || !metrics) return <MetricsUnavailable onRetry={onRetry} />;

  return (
    <section className="hub-metric-grid hub-orders-metrics" aria-label="Métricas de pedidos">
      <MetricCard
        icon={Banknote}
        label="Faturamento válido"
        value={formatCurrency(metrics.ltv)}
        detail="Receita acumulada da operação"
        definition="Soma dos pedidos válidos, excluindo pedidos cancelados e reembolsados."
      />
      <MetricCard
        icon={PackageCheck}
        label="A enviar"
        value={formatNumber(metrics.aEnviar)}
        detail="Pedidos aguardando expedição"
        definition="Pedidos no status de separação que ainda aguardam expedição."
        tone={Number(metrics.aEnviar) > 0 ? 'warning' : 'success'}
      />
      <MetricCard
        icon={CreditCard}
        label="PIX confirmado"
        value={`${Number(metrics.conversaoPix)}%`}
        detail={`${formatNumber(metrics.pixPagos)} de ${formatNumber(metrics.pixTotais)} pagamentos PIX`}
        definition="Percentual de pagamentos PIX confirmados entre os pedidos com PIX."
      />
      <MetricCard
        icon={RotateCcw}
        label="Reembolsos em análise"
        value={formatNumber(metrics.emAnalise)}
        detail={`${formatCurrency(metrics.valorReembolsado)} já reembolsados`}
        definition="Pedidos que aguardam decisão de reembolso. O valor complementar corresponde aos reembolsos já concluídos."
        tone={Number(metrics.emAnalise) > 0 ? 'warning' : 'default'}
      />
    </section>
  );
};
