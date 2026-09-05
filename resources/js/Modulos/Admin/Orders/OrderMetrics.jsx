import React, { useMemo, useState } from 'react';
import {
  Banknote,
  BookOpen,
  CircleAlert,
  CreditCard,
  PackageCheck,
  RotateCcw,
  Settings2,
} from 'lucide-react';
import { Button } from '../DesignSystem/primitives/Button';
import { IconButton } from '../DesignSystem/primitives/IconButton';
import { MetricCard } from '../DesignSystem/primitives/MetricCard';
import { Skeleton } from '../DesignSystem/primitives/Skeleton';
import { MetricDictionaryDialog } from '../DesignSystem/patterns/MetricDictionaryDialog';
import {
  MetricPreferencesDialog,
  normalizeMetricPreferences,
} from '../DesignSystem/patterns/MetricPreferencesDialog';
import { formatCurrency, formatNumber } from './orderUtils';

const MetricsSkeleton = () => (
  <section className="hub-metric-skeleton-grid hub-orders-metrics" role="status" aria-live="polite" aria-label="Carregando métricas de pedidos" aria-busy="true">
    {Array.from({ length: 4 }, (_, index) => <Skeleton key={'order-metric-' + index} />)}
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

const getMetrics = (metrics) => [
  {
    id: 'valid-revenue',
    icon: Banknote,
    label: 'Faturamento válido',
    value: formatCurrency(metrics.ltv),
    detail: 'Receita acumulada da operação',
    definition: 'A receita dos pedidos que seguem válidos na operação.',
    calculation: 'Soma o total dos pedidos, excluindo os que foram cancelados ou reembolsados.',
  },
  {
    id: 'awaiting-shipment',
    icon: PackageCheck,
    label: 'A enviar',
    value: formatNumber(metrics.aEnviar),
    detail: 'Pedidos aguardando expedição',
    definition: 'A quantidade de pedidos que já avançaram no fluxo e ainda aguardam despacho.',
    calculation: 'Conta pedidos no status Em separação.',
    tone: Number(metrics.aEnviar) > 0 ? 'warning' : 'success',
  },
  {
    id: 'pix-confirmed',
    icon: CreditCard,
    label: 'PIX confirmado',
    value: Number(metrics.conversaoPix) + '%',
    detail: formatNumber(metrics.pixPagos) + ' de ' + formatNumber(metrics.pixTotais) + ' pagamentos PIX',
    definition: 'A proporção de pagamentos PIX que não permanecem aguardando pagamento, cancelados ou reembolsados.',
    calculation: 'Pagamentos PIX confirmados ÷ total de pedidos com PIX × 100.',
  },
  {
    id: 'refund-review',
    icon: RotateCcw,
    label: 'Reembolsos em análise',
    value: formatNumber(metrics.emAnalise),
    detail: formatCurrency(metrics.valorReembolsado) + ' já reembolsados',
    definition: 'Pedidos que aguardam uma decisão de reembolso. O complemento informa o valor dos reembolsos concluídos.',
    calculation: 'Conta pedidos em Reembolso em análise; o valor complementar soma pedidos Reembolsados.',
    tone: Number(metrics.emAnalise) > 0 ? 'warning' : 'default',
  },
];

export const OrderMetrics = ({
  metrics,
  loading,
  error,
  onRetry,
  preferences,
  preferencesLoading = false,
  preferencesSaving = false,
  onSavePreferences,
}) => {
  const [showDictionary, setShowDictionary] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const metricDefinitions = useMemo(() => (metrics ? getMetrics(metrics) : []), [metrics]);
  const metricPreferences = useMemo(
    () => normalizeMetricPreferences(preferences, metricDefinitions),
    [metricDefinitions, preferences],
  );
  const visibleMetrics = metricPreferences.order
    .filter((id) => !metricPreferences.hidden.includes(id))
    .map((id) => metricDefinitions.find((metric) => metric.id === id))
    .filter(Boolean);

  if (loading) return <MetricsSkeleton />;
  if (error || !metrics) return <MetricsUnavailable onRetry={onRetry} />;

  return (
    <>
      <section className="hub-orders-metrics-section" aria-label="Métricas de pedidos">
        <header className="hub-orders-metrics-header">
          <div>
            <h2 className="hub-panel-title">Visão operacional</h2>
            <p className="hub-panel-description">Indicadores calculados somente com dados reais da sua loja.</p>
          </div>
          <div className="hub-orders-metrics-actions">
            <IconButton icon={BookOpen} label="Abrir dicionário de métricas" onClick={() => setShowDictionary(true)} />
            <IconButton
              icon={Settings2}
              label="Organizar métricas do painel"
              disabled={preferencesLoading}
              onClick={() => setShowPreferences(true)}
            />
          </div>
        </header>
        <div className="hub-metric-grid hub-orders-metrics">
          {visibleMetrics.map((metric) => (
            <MetricCard key={metric.id} {...metric} />
          ))}
        </div>
      </section>

      {showDictionary ? (
        <MetricDictionaryDialog metrics={metricDefinitions} onClose={() => setShowDictionary(false)} />
      ) : null}

      {showPreferences ? (
        <MetricPreferencesDialog
          metrics={metricDefinitions}
          preferences={preferences}
          saving={preferencesSaving}
          onClose={() => setShowPreferences(false)}
          onSave={onSavePreferences}
        />
      ) : null}
    </>
  );
};
