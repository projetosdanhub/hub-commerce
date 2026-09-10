import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Banknote,
  CircleAlert,
  ClipboardList,
  PackageCheck,
  Percent,
  RefreshCw,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../api';
import { adminQueryKeys } from '../../../queryClient';
import { Badge } from '../DesignSystem/primitives/Badge';
import { Button } from '../DesignSystem/primitives/Button';
import { PageHeader } from '../DesignSystem/patterns/PageHeader';
import { IntegrationLogo } from '../DesignSystem/patterns/IntegrationLogo';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const numberFormatter = new Intl.NumberFormat('pt-BR');

const statusMeta = {
  A_PAGAR: { label: 'A pagar', variant: 'warning' },
  SEPARACAO: { label: 'Em separação', variant: 'info' },
  SEPARADO: { label: 'Separado', variant: 'info' },
  DESPACHADO: { label: 'Despachado', variant: 'special' },
  ENTREGUE: { label: 'Entregue', variant: 'success' },
  EM_ANALISE_REEMBOLSO: { label: 'Em análise', variant: 'warning' },
  REEMBOLSADO: { label: 'Reembolsado', variant: 'danger' },
  CANCELADO: { label: 'Cancelado', variant: 'neutral' },
};

export const fetchAdminDashboard = async () => {
  const [metricsResponse, ordersResponse] = await Promise.all([
    api.get('/admin/orders/metrics'),
    api.get('/admin/orders', { params: { per_page: 5 } }),
  ]);

  return {
    metrics: metricsResponse.data,
    orders: ordersResponse.data?.data ?? [],
  };
};

const initials = (name = '') => name
  .split(' ')
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0])
  .join('')
  .toUpperCase() || 'CL';

const Metric = ({ icon: Icon, label, value, note, to }) => {
  const body = (
    <>
      <span className="hub-metric-icon"><Icon aria-hidden="true" size={20} strokeWidth={1.8} /></span>
      <p className="hub-metric-label">{label}</p>
      <p className="hub-metric-value">{value}</p>
      <p className="hub-metric-note">{note}</p>
    </>
  );

  return to ? <Link className="hub-metric-cell hub-metric-link" to={to}>{body}</Link> : <div className="hub-metric-cell">{body}</div>;
};

const OrdersTable = ({ orders }) => {
  if (!orders.length) {
    return (
      <div className="hub-empty-state">
        <div>
          <PackageCheck aria-hidden="true" size={28} />
          <h3 className="hub-panel-title">Ainda não há pedidos</h3>
          <p>Quando sua loja receber pedidos, os mais recentes aparecerão aqui automaticamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hub-order-table-wrap">
      <table className="hub-order-table">
        <thead>
          <tr>
            <th scope="col">Pedido</th>
            <th scope="col">Cliente</th>
            <th scope="col">Pagamento</th>
            <th scope="col">Status</th>
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const status = statusMeta[order.status] ?? { label: order.status, variant: 'neutral' };

            return (
              <tr key={order.id}>
                <td>
                  <strong>#{order.id}</strong>
                  <br />
                  <span className="text-[var(--hub-text-muted)]">{order.data} · {order.hora}</span>
                </td>
                <td>
                  <span className="hub-order-customer">
                    <span className="hub-customer-initials" aria-hidden="true">{initials(order.cliente?.nome)}</span>
                    <span>{order.cliente?.nome ?? 'Cliente indisponível'}</span>
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <IntegrationLogo name={order.pagamento_metodo} fallbackIcon={() => null} className="hub-inline-logo" iconSize={15} />
                    {order.pagamento_metodo || 'Não informado'}
                  </div>
                </td>
                <td><Badge variant={status.variant}>{status.label}</Badge></td>
                <td><strong>{currencyFormatter.format(Number(order.total) || 0)}</strong></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const dashboardQuery = useQuery({
    queryKey: adminQueryKeys.dashboard(),
    queryFn: fetchAdminDashboard,
    refetchInterval: 60_000,
  });

  const metrics = dashboardQuery.data?.metrics;
  const updatedAt = dashboardQuery.dataUpdatedAt
    ? new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(dashboardQuery.dataUpdatedAt)
    : null;

  if (dashboardQuery.isLoading) {
    return (
      <div className="hub-dashboard-skeleton" aria-label="Carregando dados do dashboard">
        <span />
        <span />
        <span />
      </div>
    );
  }

  if (dashboardQuery.isError) {
    return (
      <section className="hub-surface hub-error-state" role="alert">
        <div>
          <CircleAlert aria-hidden="true" size={28} />
          <h1 className="hub-panel-title">Não foi possível atualizar o painel</h1>
          <p>Verifique sua conexão ou tente novamente. Seus dados não foram alterados.</p>
          <Button className="mt-5" icon={RefreshCw} onClick={() => dashboardQuery.refetch()}>
            Tentar novamente
          </Button>
        </div>
      </section>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={updatedAt ? `Atualizado às ${updatedAt}` : 'Resumo operacional'}
        title="Visão geral"
        description="Acompanhe os indicadores atuais da sua operação em um único lugar."
        actions={(
          <Button
            variant="secondary"
            icon={RefreshCw}
            loading={dashboardQuery.isFetching}
            onClick={() => dashboardQuery.refetch()}
          >
            Atualizar dados
          </Button>
        )}
      />

      <section className="hub-surface hub-metric-rail" aria-label="Métricas da operação">
        <Metric
          icon={Banknote}
          label="Faturamento acumulado"
          value={currencyFormatter.format(Number(metrics?.ltv) || 0)}
          note="Pedidos válidos registrados"
          to="/admin/pedidos"
        />
        <Metric
          icon={ClipboardList}
          label="Pedidos"
          value={numberFormatter.format(Number(metrics?.totais) || 0)}
          note="Total de pedidos da loja"
          to="/admin/pedidos"
        />
        <Metric
          icon={PackageCheck}
          label="A enviar"
          value={numberFormatter.format(Number(metrics?.aEnviar) || 0)}
          note="Pedidos aguardando expedição"
          to="/admin/pedidos"
        />
        <Metric
          icon={Percent}
          label="Conversão PIX"
          value={`${Number(metrics?.conversaoPix) || 0}%`}
          note={`${numberFormatter.format(Number(metrics?.pixPagos) || 0)} pagamentos confirmados`}
          to="/admin/pedidos"
        />
      </section>

      <section className="hub-dashboard-grid">
        <article className="hub-surface hub-panel">
          <header className="hub-panel-header">
            <div>
              <h2 className="hub-panel-title">Pedidos recentes</h2>
              <p className="hub-panel-description">Os últimos pedidos processados pela sua loja.</p>
            </div>
            <Button variant="ghost" size="sm" icon={ArrowRight} onClick={() => navigate('/admin/pedidos')}>
              Ver pedidos
            </Button>
          </header>
          <OrdersTable orders={dashboardQuery.data.orders} />
        </article>

        <aside className="hub-surface hub-panel">
          <header className="hub-panel-header">
            <div>
              <h2 className="hub-panel-title">Status operacional</h2>
              <p className="hub-panel-description">Leitura baseada nos dados atuais de pedidos.</p>
            </div>
          </header>
          <ul className="hub-status-list">
            <li className="hub-status-row">
              <span className="hub-status-name"><span className="hub-status-indicator" data-tone={metrics?.aEnviar ? 'warning' : 'success'} aria-hidden="true" />Expedição</span>
              <Badge variant={metrics?.aEnviar ? 'warning' : 'success'}>{metrics?.aEnviar ? `${metrics.aEnviar} pendente(s)` : 'Em dia'}</Badge>
            </li>
            <li className="hub-status-row">
              <span className="hub-status-name"><span className="hub-status-indicator" data-tone="success" aria-hidden="true" />PIX confirmado</span>
              <span>{numberFormatter.format(Number(metrics?.pixPagos) || 0)} de {numberFormatter.format(Number(metrics?.pixTotais) || 0)}</span>
            </li>
            <li className="hub-status-row">
              <span className="hub-status-name"><span className="hub-status-indicator" data-tone={metrics?.emAnalise ? 'warning' : 'success'} aria-hidden="true" />Reembolsos</span>
              <span>{numberFormatter.format(Number(metrics?.emAnalise) || 0)} em análise</span>
            </li>
            <li className="hub-status-row">
              <span className="hub-status-name"><span className="hub-status-indicator" data-tone={metrics?.cancelados ? 'danger' : 'success'} aria-hidden="true" />Cancelamentos</span>
              <span>{Number(metrics?.taxaCancelamento) || 0}%</span>
            </li>
          </ul>
        </aside>
      </section>
    </>
  );
}
