import api from '../../../api';

const optionalData = async (request, fallback) => {
  try {
    const response = await request();
    return response.data?.data ?? response.data ?? fallback;
  } catch {
    return fallback;
  }
};

export const fetchOrders = async (filters) => {
  const response = await api.get('/admin/orders', {
    params: {
      page: filters.page,
      per_page: filters.perPage,
      busca: filters.search || undefined,
      status: filters.status !== 'TUDO' ? filters.status : undefined,
      start_date: filters.startDate || undefined,
      end_date: filters.endDate || undefined,
    },
  });

  return response.data;
};

export const fetchOrderMetrics = async () => {
  const response = await api.get('/admin/orders/metrics');
  return response.data;
};

export const fetchShippingSupport = async () => {
  const [carriers, packages, settings] = await Promise.all([
    optionalData(() => api.get('/admin/carriers'), []),
    optionalData(() => api.get('/admin/shipping-packages'), []),
    optionalData(() => api.get('/admin/melhorenvio/settings'), null),
  ]);

  return { carriers, packages, settings };
};

export const calculateShipping = async (payload) => {
  const response = await api.post('/admin/melhorenvio/calculate', payload);
  return response.data?.data ?? [];
};

export const submitManualOrderAction = async ({ orderId, action, fields = {} }) => {
  const body = new FormData();
  body.append('acao', action);

  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    body.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : value);
  });

  return api.post(`/admin/orders/${orderId}/status-manual`, body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateOrderTracking = async ({ orderId, trackingCode }) => api.post(
  `/admin/orders/${orderId}/dispatch`,
  { rastreio: trackingCode },
);

export const cancelMelhorEnvioCart = async (orderId) => api.post(
  `/admin/orders/${orderId}/cancel-me-cart`,
);
