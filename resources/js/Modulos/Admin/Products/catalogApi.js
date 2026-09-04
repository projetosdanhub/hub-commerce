import api from '../../../api';

const unwrap = (response) => response.data?.data ?? response.data;

export const fetchProducts = async (filters) => {
  const response = await api.get('/admin/products', {
    params: {
      page: filters.page,
      per_page: filters.perPage,
      busca: filters.search || undefined,
      categoria: filters.category !== 'TODAS' ? filters.category : undefined,
      status: filters.status !== 'TODOS' ? filters.status : undefined,
    },
  });
  return unwrap(response);
};

export const fetchProductCategories = async () => {
  const response = await api.get('/admin/categories');
  return unwrap(response);
};

export const fetchProductAudits = async () => {
  const response = await api.get('/admin/products/audits');
  return unwrap(response);
};
