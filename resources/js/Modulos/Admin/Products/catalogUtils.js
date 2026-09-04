const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const number = new Intl.NumberFormat('pt-BR');

export const formatCurrency = (value) => brl.format(Number(value) || 0);
export const formatNumber = (value) => number.format(Number(value) || 0);

export const productStatus = (product = {}) => {
  if (product.pre_venda) return { label: 'Encomenda', variant: 'special' };
  if (product.controlar_estoque && Number(product.quantidade_estoque) === 0) return { label: 'Esgotado', variant: 'danger' };
  if (product.status_vitrine === 'ATIVO') return { label: 'Ativo', variant: 'success' };
  return { label: product.status_vitrine || 'Inativo', variant: 'neutral' };
};

export const stockState = (product = {}) => {
  if (!product.controlar_estoque) return { label: 'Sem controle', variant: 'neutral' };
  const quantity = Number(product.quantidade_estoque) || 0;
  if (product.pre_venda) return { label: 'Sob encomenda', variant: 'special' };
  if (quantity === 0) return { label: 'Esgotado', variant: 'danger' };
  if (quantity <= (Number(product.alerta_estoque) || 5)) return { label: quantity + ' baixo', variant: 'warning' };
  return { label: quantity + ' em estoque', variant: 'success' };
};

export const sku = (product = {}) => [product.sku_ref, product.sku_sufixo].filter(Boolean).join('-') || 'Sem SKU';

export const formatDate = (value) => {
  if (!value) return 'Sem data';
  const parts = String(value).split(/[T ]/);
  const date = parts[0].split('-');
  return date.length === 3 ? date[2] + '/' + date[1] + '/' + date[0] : String(value);
};

export const errorMessage = (error, fallback = 'Não foi possível carregar os dados do catálogo.') => (
  error?.response?.data?.message || error?.message || fallback
);
