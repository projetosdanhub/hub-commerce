import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  PackageOpen,
} from 'lucide-react';
import { Badge } from '../DesignSystem/primitives/Badge';
import { Button } from '../DesignSystem/primitives/Button';
import { IconButton } from '../DesignSystem/primitives/IconButton';
import { Skeleton } from '../DesignSystem/primitives/Skeleton';
import { TruncatedText } from '../DesignSystem/primitives/TruncatedText';
import { IntegrationLogo } from '../DesignSystem/patterns/IntegrationLogo';
import { DateRangeFilter } from '../DesignSystem/patterns/DateRangeFilter';
import { ExpandableSearch } from '../DesignSystem/patterns/ExpandableSearch';
import { SectionTabs } from '../DesignSystem/patterns/SectionTabs';
import {
  formatCurrency,
  formatOrderDate,
  getInitials,
  getOrderStatus,
  ORDER_TABS,
} from './orderUtils';

const OrdersLoading = () => (
  <div className="hub-orders-loading" aria-live="polite" role="status">
    <p className="sr-only">Carregando pedidos.</p>
    {Array.from({ length: 3 }, (_, index) => <Skeleton key={`order-row-${index}`} />)}
  </div>
);

const Customer = ({ order }) => {
  const name = order.cliente?.nome || 'Cliente indisponível';
  const email = order.cliente?.email || 'E-mail indisponível';

  return (
    <span className="hub-order-customer">
      <span className="hub-customer-initials" aria-hidden="true">{getInitials(order.cliente?.nome)}</span>
      <span className="hub-orders-customer-copy">
        <TruncatedText className="hub-orders-customer-name" label={name}>{name}</TruncatedText>
        <TruncatedText className="hub-orders-customer-email" label={email}>{email}</TruncatedText>
      </span>
    </span>
  );
};

const EmptyOrders = ({ hasFilters, onClear }) => (
  <div className="hub-empty-state">
    <div>
      <PackageOpen aria-hidden="true" size={28} />
      <h2 className="hub-panel-title">{hasFilters ? 'Nenhum pedido encontrado' : 'Ainda não há pedidos'}</h2>
      <p>{hasFilters
        ? 'Ajuste os filtros para buscar novamente nos pedidos da sua loja.'
        : 'Quando a sua loja receber pedidos, eles aparecerão aqui automaticamente.'}</p>
      {hasFilters ? <Button className="mt-5" variant="secondary" onClick={onClear}>Limpar filtros</Button> : null}
    </div>
  </div>
);

const DesktopTable = ({ orders, onOpen }) => (
  <div className="hub-order-table-wrap hub-orders-desktop-list">
    <table className="hub-order-table">
      <thead>
        <tr>
          <th scope="col">Pedido</th>
          <th scope="col">Cliente</th>
          <th scope="col">Pagamento</th>
          <th scope="col">Status</th>
          <th scope="col">Total</th>
          <th scope="col"><span className="sr-only">Ações</span></th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => {
          const status = getOrderStatus(order.status);

          return (
            <tr key={order.id}>
              <td>
                <strong>HUB-{order.id}</strong>
                <br />
                <span className="hub-orders-muted">{formatOrderDate(order.data_raw || order.created_at)}</span>
              </td>
              <td><Customer order={order} /></td>
              <td>
                <div className="hub-orders-payment">
                  <IntegrationLogo name={order.pagamento_metodo || order.pagamento?.metodo} fallbackIcon={() => null} className="hub-inline-logo" iconSize={15} />
                  <TruncatedText label={order.pagamento_metodo || order.pagamento?.metodo || 'Não informado'}>
                    {order.pagamento_metodo || order.pagamento?.metodo || 'Não informado'}
                  </TruncatedText>
                </div>
              </td>
              <td><Badge variant={status.variant}>{status.label}</Badge></td>
              <td><strong>{formatCurrency(order.total)}</strong></td>
              <td>
                <IconButton icon={Eye} label={`Abrir pedido HUB-${order.id}`} onClick={() => onOpen(order)} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

const MobileList = ({ orders, onOpen }) => (
  <ul className="hub-orders-mobile-list">
    {orders.map((order) => {
      const status = getOrderStatus(order.status);

      return (
        <li key={order.id}>
          <button type="button" className="hub-orders-mobile-card" onClick={() => onOpen(order)}>
            <span className="hub-orders-mobile-card-head">
              <strong>HUB-{order.id}</strong>
              <Badge variant={status.variant}>{status.label}</Badge>
            </span>
            <Customer order={order} />
            <span className="hub-orders-mobile-payment">
              <IntegrationLogo name={order.pagamento_metodo || order.pagamento?.metodo} fallbackIcon={() => null} className="hub-inline-logo" iconSize={15} />
              {order.pagamento_metodo || order.pagamento?.metodo || 'Pagamento não informado'}
            </span>
            <span className="hub-orders-mobile-card-foot">
              <span>{formatOrderDate(order.data_raw || order.created_at)}</span>
              <strong>{formatCurrency(order.total)}</strong>
            </span>
          </button>
        </li>
      );
    })}
  </ul>
);

export const OrdersList = ({
  orders,
  filters,
  onChange,
  onClear,
  onOpen,
  pagination,
  loading,
}) => {
  const hasFilters = Boolean(filters.search || filters.status !== 'TUDO' || filters.startDate || filters.endDate);

  return (
    <section className="hub-surface hub-orders-list">
      <header className="hub-orders-list-header">
        <div>
          <h2 className="hub-panel-title">Pedidos da loja</h2>
          <p className="hub-panel-description">Dados atualizados ao abrir, filtrar e concluir uma operação.</p>
        </div>
        <div className="hub-orders-list-controls">
          <ExpandableSearch
            value={filters.search}
            onChange={(search) => onChange({ search, page: 1 })}
            label="Buscar pedido, cliente, e-mail ou CPF"
            placeholder="Pedido, cliente, e-mail ou CPF"
          />
          <DateRangeFilter
            value={{ startDate: filters.startDate, endDate: filters.endDate }}
            onApply={({ startDate, endDate }) => onChange({ startDate, endDate, page: 1 })}
          />
          {hasFilters ? <Button variant="ghost" size="sm" onClick={onClear}>Limpar</Button> : null}
        </div>
      </header>

      <div className="hub-orders-filter-row">
        <SectionTabs
          ariaLabel="Filtrar pedidos por status"
          items={ORDER_TABS}
          value={filters.status}
          onChange={(status) => onChange({ status, page: 1 })}
        />

      </div>

      <div className="hub-stable-data-region" aria-busy={loading || undefined}>
        {loading && !orders.length ? (
          <OrdersLoading />
        ) : orders.length ? (
          <>
            <DesktopTable orders={orders} onOpen={onOpen} />
            <MobileList orders={orders} onOpen={onOpen} />
          </>
        ) : (
          <EmptyOrders hasFilters={hasFilters} onClear={onClear} />
        )}
      </div>

      {pagination.lastPage > 1 ? (
        <footer className="hub-orders-pagination">
          <span>Página {pagination.page} de {pagination.lastPage}</span>
          <div>
            <IconButton
              icon={ChevronLeft}
              label="Página anterior"
              disabled={pagination.page === 1}
              onClick={() => onChange({ page: pagination.page - 1 })}
            />
            <IconButton
              icon={ChevronRight}
              label="Próxima página"
              disabled={pagination.page === pagination.lastPage}
              onClick={() => onChange({ page: pagination.page + 1 })}
            />
          </div>
        </footer>
      ) : null}
    </section>
  );
};
