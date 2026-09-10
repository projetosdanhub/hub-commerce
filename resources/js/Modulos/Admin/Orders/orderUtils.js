export const ORDER_STATUS = {
  A_PAGAR: { label: 'A pagar', variant: 'warning' },
  SEPARACAO: { label: 'Em separação', variant: 'info' },
  SEPARADO: { label: 'Pronto para envio', variant: 'special' },
  DESPACHADO: { label: 'Despachado', variant: 'special' },
  ENTREGUE: { label: 'Entregue', variant: 'success' },
  EM_ANALISE_REEMBOLSO: { label: 'Reembolso em análise', variant: 'warning' },
  REEMBOLSADO: { label: 'Reembolsado', variant: 'danger' },
  CANCELADO: { label: 'Cancelado', variant: 'neutral' },
};

export const ORDER_TABS = [
  { value: 'TUDO', label: 'Todos' },
  { value: 'A_PAGAR', label: 'A pagar' },
  { value: 'SEPARACAO', label: 'Separação' },
  { value: 'SEPARADO', label: 'Prontos' },
  { value: 'DESPACHADO', label: 'Despachados' },
  { value: 'ENTREGUE', label: 'Entregues' },
  { value: 'EM_ANALISE_REEMBOLSO', label: 'Reembolsos' },
  { value: 'CANCELADO', label: 'Cancelados' },
];

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const number = new Intl.NumberFormat('pt-BR');

export const formatCurrency = (value) => currency.format(Number(value) || 0);
export const formatNumber = (value) => number.format(Number(value) || 0);

export const formatOrderDate = (value) => {
  if (!value) return 'Data indisponível';

  const [datePart, timePart] = String(value).split('T');
  const [year, month, day] = datePart.split('-');

  if (year && month && day) {
    return `${day}/${month}/${year}${timePart ? ` · ${timePart.slice(0, 5)}` : ''}`;
  }

  return String(value);
};

export const getOrderStatus = (status) => ORDER_STATUS[status] ?? {
  label: String(status || 'Não informado').replaceAll('_', ' '),
  variant: 'neutral',
};

export const getInitials = (name = '') => name
  .split(' ')
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0])
  .join('')
  .toUpperCase() || 'CL';

export const getOrderAddress = (address = {}) => {
  const street = address.rua || address.street || 'Endereço indisponível';
  const numberValue = address.numero || address.num || address.number || '';
  const complement = address.complemento || address.complement || '';
  const city = [address.cidade || address.city, address.uf || address.state].filter(Boolean).join(' · ');
  const postalCode = address.cep || address.zip_code || '';

  return {
    line: [street, numberValue, complement].filter(Boolean).join(', '),
    city,
    postalCode,
  };
};

export const actionForStatus = (status) => ({
  A_PAGAR: { key: 'PAGAR', label: 'Aprovar pagamento' },
  SEPARACAO: { key: 'SEPARAR', label: 'Concluir separação' },
  SEPARADO: { key: 'DESPACHAR', label: 'Configurar expedição' },
  DESPACHADO: { key: 'ENTREGAR', label: 'Confirmar entrega' },
  EM_ANALISE_REEMBOLSO: { key: 'PROCESSAR_REEMBOLSO', label: 'Confirmar reembolso' },
}[status] ?? null);

export const timelineTone = (entry = {}) => {
  const content = String(entry.evento || entry.desc || '').toLowerCase();

  if (/(cancel|reembolso|estorno)/.test(content)) return 'danger';
  if (/(pago|aprovado|entregue)/.test(content)) return 'success';
  if (/(despach|separa|transport|etiqueta)/.test(content)) return 'warning';

  return 'info';
};

export const errorMessage = (error, fallback = 'Não foi possível concluir a operação.') => (
  error?.response?.data?.message || error?.message || fallback
);
