import React from 'react';
import { Banknote, CreditCard, PackageCheck, RotateCcw } from 'lucide-react';
import { formatCurrency, formatNumber } from './orderUtils';

const Metric = ({ icon: Icon, label, value, note, tone = 'default' }) => (
  <article className="hub-orders-metric" data-tone={tone}>
    <span className="hub-orders-metric-icon"><Icon aria-hidden="true" size={18} strokeWidth={1.8} /></span>
    <p>{label}</p>
    <strong>{value}</strong>
    <span>{note}</span>
  </article>
);

export const OrderMetrics = ({ metrics }) => (
  <section className="hub-surface hub-orders-metrics" aria-label="Métricas de pedidos">
    <Metric
      icon={Banknote}
      label="Faturamento válido"
      value={formatCurrency(metrics?.ltv)}
      note="Receita acumulada da operação"
    />
    <Metric
      icon={PackageCheck}
      label="A enviar"
      value={formatNumber(metrics?.aEnviar)}
      note="Pedidos aguardando expedição"
      tone={metrics?.aEnviar ? 'warning' : 'success'}
    />
    <Metric
      icon={CreditCard}
      label="PIX confirmado"
      value={`${Number(metrics?.conversaoPix) || 0}%`}
      note={`${formatNumber(metrics?.pixPagos)} de ${formatNumber(metrics?.pixTotais)} pagamentos`}
    />
    <Metric
      icon={RotateCcw}
      label="Reembolsos em análise"
      value={formatNumber(metrics?.emAnalise)}
      note={`${formatCurrency(metrics?.valorReembolsado)} já reembolsados`}
      tone={metrics?.emAnalise ? 'warning' : 'default'}
    />
  </section>
);
