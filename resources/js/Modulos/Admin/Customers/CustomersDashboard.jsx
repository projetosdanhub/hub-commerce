import React from 'react';
import { Banknote, Crown, ShoppingBag, UsersRound } from 'lucide-react';
import { Button } from '../DesignSystem/primitives/Button';
import { formatCurrency, formatNumber } from './customerUtils';

const Metric = ({ icon: Icon, label, value, note }) => (
  <article className="hub-orders-metric">
    <span className="hub-orders-metric-icon"><Icon aria-hidden="true" size={18} strokeWidth={1.8} /></span>
    <p>{label}</p>
    <strong>{value}</strong>
    <span>{note}</span>
  </article>
);

export const CustomersDashboard = ({ metrics, onOpenDirectory }) => (
  <>
    <section className="hub-surface hub-orders-metrics" aria-label="Indicadores de clientes">
      <Metric icon={UsersRound} label="Clientes" value={formatNumber(metrics?.total_clientes || metrics?.total)} note="Base cadastrada da loja" />
      <Metric icon={Banknote} label="LTV acumulado" value={formatCurrency(metrics?.ltv_total || metrics?.ltv)} note="Receita de pedidos válidos" />
      <Metric icon={ShoppingBag} label="Compras" value={formatNumber(metrics?.compras_totais || metrics?.compras)} note="Pedidos confirmados" />
      <Metric icon={Crown} label="Clientes VIP" value={formatNumber(metrics?.clientes_vip || metrics?.vip)} note="Elegíveis aos benefícios ativos" />
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
