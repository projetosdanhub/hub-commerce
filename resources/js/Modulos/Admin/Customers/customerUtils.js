export const CUSTOMER_STATUS = {
  ATIVO: { label: 'Ativo', variant: 'success' },
  INATIVO: { label: 'Suspensa', variant: 'danger' },
  BLOQUEADA: { label: 'Suspensa', variant: 'danger' },
  AFILIADO: { label: 'Afiliado', variant: 'special' },
};

export const CUSTOMER_TABS = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'ATIVO', label: 'Ativos' },
  { value: 'INATIVO', label: 'Suspensos' },
  { value: 'AFILIADO', label: 'Afiliados' },
];

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const number = new Intl.NumberFormat('pt-BR');

export const formatCurrency = (value) => currency.format(Number(value) || 0);
export const formatNumber = (value) => number.format(Number(value) || 0);

export const formatDate = (value) => {
  if (!value || value === '-') return 'Não informado';
  const [datePart, timePart] = String(value).split(/[T ]/);
  const [year, month, day] = datePart.split('-');
  return year && month && day ? `${day}/${month}/${year}${timePart ? ` · ${timePart.slice(0, 5)}` : ''}` : String(value);
};

export const getInitials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'CL';

export const getStatus = (status) => CUSTOMER_STATUS[status] ?? {
  label: status || 'Não informado',
  variant: 'neutral',
};

export const errorMessage = (error, fallback = 'Não foi possível concluir a operação.') => (
  error?.response?.data?.message || error?.message || fallback
);

export const eventTone = (event = {}) => {
  const content = String(event.titulo || event.acao || event.desc || '').toLowerCase();
  if (/(suspens|senha|sensível|forçad|cancel)/.test(content)) return 'danger';
  if (/(reativad|saldo|atualizad|confirmad)/.test(content)) return 'success';
  return 'info';
};
