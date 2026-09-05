import React from 'react';
import { ChevronLeft, ChevronRight, Eye, Search, UsersRound, X } from 'lucide-react';
import { Badge } from '../DesignSystem/primitives/Badge';
import { Button } from '../DesignSystem/primitives/Button';
import { IconButton } from '../DesignSystem/primitives/IconButton';
import { FilterSelect } from '../DesignSystem/primitives/FilterSelect';
import { Skeleton } from '../DesignSystem/primitives/Skeleton';
import { SectionTabs } from '../DesignSystem/patterns/SectionTabs';
import { CUSTOMER_TABS, formatCurrency, formatDate, getInitials, getStatus } from './customerUtils';

const BIRTH_MONTHS = [
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

const CustomersLoading = () => (
  <div className="hub-orders-loading" aria-live="polite" role="status">
    <p className="sr-only">Carregando clientes.</p>
    {Array.from({ length: 3 }, (_, index) => <Skeleton key={`customer-row-${index}`} />)}
  </div>
);

const CustomerIdentity = ({ customer }) => (
  <span className="hub-order-customer">
    <span className="hub-customer-initials" aria-hidden="true">{customer.avatar ? <img src={customer.avatar} alt="" /> : getInitials(customer.nome)}</span>
    <span className="hub-orders-customer-copy">
      <strong>{customer.nome || 'Cliente indisponível'}</strong>
      <small>{customer.email || 'E-mail indisponível'}</small>
    </span>
  </span>
);

const DesktopRows = ({ customers, onOpen }) => (
  <div className="hub-order-table-wrap hub-orders-desktop-list">
    <table className="hub-order-table">
      <thead><tr><th>Cliente</th><th>Compras</th><th>LTV</th><th>Última compra</th><th>Status</th><th><span className="sr-only">Ações</span></th></tr></thead>
      <tbody>{customers.map((customer) => {
        const status = getStatus(customer.status);
        return <tr key={customer.id}>
          <td><CustomerIdentity customer={customer} /></td>
          <td>{customer.compras || 0}</td>
          <td><strong>{formatCurrency(customer.ltv)}</strong></td>
          <td>{customer.ultimaCompra ? formatDate(customer.ultimaCompra) : 'Sem compras'}</td>
          <td><Badge variant={status.variant}>{status.label}</Badge></td>
          <td><IconButton icon={Eye} label={`Abrir perfil de ${customer.nome}`} onClick={() => onOpen(customer)} /></td>
        </tr>;
      })}</tbody>
    </table>
  </div>
);

const MobileRows = ({ customers, onOpen }) => <ul className="hub-orders-mobile-list">
  {customers.map((customer) => {
    const status = getStatus(customer.status);
    return <li key={customer.id}><button type="button" className="hub-orders-mobile-card" onClick={() => onOpen(customer)}>
      <span className="hub-orders-mobile-card-head"><strong>{customer.nome || 'Cliente indisponível'}</strong><Badge variant={status.variant}>{status.label}</Badge></span>
      <span className="hub-orders-muted">{customer.email || 'E-mail indisponível'}</span>
      <span className="hub-orders-mobile-card-foot"><span>{customer.compras || 0} compra(s)</span><strong>{formatCurrency(customer.ltv)}</strong></span>
    </button></li>;
  })}
</ul>;

export const CustomersList = ({ customers, filters, pagination, loading, onChange, onClear, onOpen }) => {
  const hasFilters = Boolean(filters.search || filters.status !== 'TODOS' || filters.birthMonth !== 'TODOS');

  return <section className="hub-surface hub-orders-list">
    <header className="hub-orders-list-header">
      <div><h2 className="hub-panel-title">Diretório de clientes</h2><p className="hub-panel-description">Abra o perfil para atendimento, benefícios, pedidos e histórico.</p></div>
      <label className="hub-orders-search"><Search aria-hidden="true" size={17} /><span className="sr-only">Buscar cliente</span>
        <input value={filters.search} onChange={(event) => onChange({ search: event.target.value, page: 1 })} placeholder="Nome, e-mail, CPF ou telefone" />
        {filters.search ? <IconButton icon={X} label="Limpar busca" onClick={() => onChange({ search: '', page: 1 })} /> : null}
      </label>
    </header>
    <div className="hub-orders-filter-row">
      <SectionTabs
        ariaLabel="Filtrar clientes por status"
        items={CUSTOMER_TABS}
        value={filters.status}
        onChange={(status) => onChange({ status, page: 1 })}
      />
      <div className="hub-orders-date-filters">
        <FilterSelect
          label="Filtrar por mês de aniversário"
          value={filters.birthMonth}
          onChange={(event) => onChange({ birthMonth: event.target.value, page: 1 })}
        >
          <option value="TODOS">Todos os aniversários</option>
          {BIRTH_MONTHS.map((month) => <option key={month.value} value={month.value}>{month.label}</option>)}
        </FilterSelect>
        {hasFilters ? <Button size="sm" variant="ghost" onClick={onClear}>Limpar</Button> : null}
      </div>
    </div>
    {loading && !customers.length ? <CustomersLoading /> : customers.length ? <><DesktopRows customers={customers} onOpen={onOpen} /><MobileRows customers={customers} onOpen={onOpen} /></> : <div className="hub-empty-state"><div><UsersRound aria-hidden="true" size={28} /><h2 className="hub-panel-title">Nenhum cliente encontrado</h2><p>Ajuste os filtros ou aguarde novos cadastros na loja.</p>{hasFilters ? <Button className="mt-5" variant="secondary" onClick={onClear}>Limpar filtros</Button> : null}</div></div>}
    {pagination.lastPage > 1 ? <footer className="hub-orders-pagination"><span>Página {pagination.page} de {pagination.lastPage}</span><div><IconButton icon={ChevronLeft} label="Página anterior" disabled={pagination.page === 1} onClick={() => onChange({ page: pagination.page - 1 })} /><IconButton icon={ChevronRight} label="Próxima página" disabled={pagination.page === pagination.lastPage} onClick={() => onChange({ page: pagination.page + 1 })} /></div></footer> : null}
  </section>;
};
