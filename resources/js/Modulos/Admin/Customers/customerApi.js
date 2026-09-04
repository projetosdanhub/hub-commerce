import api from '../../../api';

const unwrap = (response) => response.data?.data ?? response.data;

export const fetchCustomers = async (filters) => {
  const response = await api.get('/admin/customers', {
    params: {
      page: filters.page,
      per_page: filters.perPage,
      busca: filters.search || undefined,
      status: filters.status !== 'TODOS' ? filters.status : undefined,
      mes_aniversario: filters.birthMonth !== 'TODOS' ? filters.birthMonth : undefined,
    },
  });
  return unwrap(response);
};

export const fetchCustomerMetrics = async () => unwrap(await api.get('/admin/customers/metrics'));
export const fetchVipLevels = async () => unwrap(await api.get('/admin/customers/vip-levels'));
export const fetchCrmSettings = async () => unwrap(await api.get('/admin/customers/settings'));

export const saveVipLevel = async (fields) => {
  const body = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    body.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : value);
  });
  return api.post('/admin/customers/vip-levels', body, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const deleteVipLevel = (id) => api.delete(`/admin/customers/vip-levels/${id}`);
export const saveCrmSettings = (fields) => api.put('/admin/customers/settings', fields);

export const updateCustomerBasics = ({ customerId, fields }) => api.put(`/admin/customers/${customerId}/basics`, fields);
export const updateCustomerPhone = ({ customerId, fields }) => api.put(`/admin/customers/${customerId}/phone`, fields);

export const updateSensitiveData = ({ customerId, fields }) => {
  const body = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') body.append(key, value);
  });
  return api.post(`/admin/customers/${customerId}/sensitive-data`, body, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const updateCustomerNotes = ({ customerId, notes }) => api.put(`/admin/customers/${customerId}/notes`, { notas: notes });
export const updateCustomerTags = ({ customerId, tags }) => api.put(`/admin/customers/${customerId}/tags`, { tags });
export const updateCustomerStatus = ({ customerId, fields }) => api.post(`/admin/customers/${customerId}/status`, fields);
export const addWalletTransaction = ({ customerId, fields }) => api.post(`/admin/customers/${customerId}/wallet-transaction`, fields);
export const sendCustomerEmailLink = ({ customerId, email }) => api.post(`/admin/customers/${customerId}/email-link`, { email });
export const forceCustomerEmail = ({ customerId, fields }) => api.put(`/admin/customers/${customerId}/force-email`, fields);
export const generateTemporaryPassword = (customerId) => api.post(`/admin/customers/${customerId}/generate-temp-password`);
export const sendPasswordReset = (customerId) => api.post(`/admin/customers/${customerId}/password-link`);
