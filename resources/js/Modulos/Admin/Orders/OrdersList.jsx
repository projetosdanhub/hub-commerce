import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  PackageOpen,
  Search,
  X,
} from 'lucide-react';
import { Badge } from '../DesignSystem/primitives/Badge';
import { Button } from '../DesignSystem/primitives/Button';
import { IconButton } from '../DesignSystem/primitives/IconButton';
import { FilterSelect } from '../DesignSystem/primitives/FilterSelect';
import { Skeleton } from '../DesignSystem/primitives/Skeleton';
import { SectionTabs } from '../DesignSystem/patterns/SectionTabs';
import {
  formatCurrency,
  formatOrderDate,
  getInitials,
  getOrderStatus,
  ORDER_TABS,
} from './orderUtils';

const DATE_PERIODS = [
  { value: 'ALL', label: 'Todo o período' },
  { value: 'TODAY', label: 'Hoje' },
  { value: 'LAST_7', label: 'Últimos 7 dias' },
  { value: 'LAST_30', label: 'Últimos 30 dias' },
  { value: 'MONTH', label: 'Este mês' },
];

const toDateInputValue = (date) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0'),
].join('-');

const getDateRange = (period) => {
  if (period === 'ALL') return { startDate: '', endDate: '' };

  const today = new Date();
  const start = new Date(today);

  if (period === 'LAST_7') start.setDate(today.getDate() - 6);
  if (period === 'LAST_30') start.setDate(today.getDate() - 29);
  if (period === 'MONTH') start.setDate(1);

  return {
    startDate: toDateInputValue(start),
    endDate: toDateInputValue(today),
  };
};

const getSelectedPeriod = ({ startDate, endDate }) => {
  if (!startDate && !endDate) return 'ALL';

  const matchedPeriod = DATE_PERIODS.find(({ value }) => {
    if (value === 'ALL') return false;
    const range = getDateRange(value);
    return range.startDate === startDate && range.endDate === endDate;
  });

  return matchedPeriod?.value || 'CUSTOM';
};

const OrdersLoading = () => (
  <div className="hub-orders-loading" aria-live="polite" role="status">
    <p className="sr-only">Carregando pedidos.</p>
    {Array.from({ length: 3 }, (_, index) => <Skeleton key={`order-row-${index}`} />)}
  </div>
);

const Customer = ({ order }) => (
  <span className="hub-order-customer">
    <span className="hub-customer-initials" aria-hidden="true">{getInitials(order.cliente?.nome)}</span>
    <span className="hub-orders-customer-copy">
      <strong>{order.cliente?.nome || 'Cliente indisponível'}</strong>
      <small>{order.cliente?.email || 'E-mail indisponível'}</small>
    </span>
  </span>
);

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
              <td>{order.pagamento_metodo || 'Não informado'}</td>
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
        <label className="hub-orders-search">
          <Search aria-hidden="true" size={17} />
          <span className="sr-only">Buscar pedido, cliente ou e-mail</span>
          <input
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value, page: 1 })}
            placeholder="Buscar pedido ou cliente"
          />
          {filters.search ? <IconButton icon={X} label="Limpar busca" onClick={() => onChange({ search: '', page: 1 })} /> : null}
        </label>
      </header>

      <div className="hub-orders-filter-row">
        <SectionTabs
          ariaLabel="Filtrar pedidos por status"
          items={ORDER_TABS}
          value={filters.status}
          onChange={(status) => onChange({ status, page: 1 })}
        />
        <div className="hub-orders-date-filters">
          <FilterSelect
            label="Filtro por período"
            value={getSelectedPeriod(filters)}
            onChange={(event) => {
              const period = event.target.value;
              if (period !== 'CUSTOM') onChange({ ...getDateRange(period), page: 1 });
            }}
          >
            {DATE_PERIODS.map((period) => <option key={period.value} value={period.value}>{period.label}</option>)}
            <option value="CUSTOM" disabled>Datas personalizadas</option>
          </FilterSelect>
          <label>De
            <input
              type="date"
              value={filters.startDate}
              onChange={(event) => onChange({ startDate: event.target.value, page: 1 })}
            />
          </label>
          <label>Até
            <input
              type="date"
              value={filters.endDate}
              onChange={(event) => onChange({ endDate: event.target.value, page: 1 })}
            />
          </label>
          {hasFilters ? <Button variant="ghost" size="sm" onClick={onClear}>Limpar</Button> : null}
        </div>
      </div>

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
