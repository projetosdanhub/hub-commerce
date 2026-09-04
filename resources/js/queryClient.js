import { QueryClient } from '@tanstack/react-query';

const tenantScope = () => (typeof window === 'undefined' ? 'server' : window.location.host);

export const adminQueryKeys = {
  root: () => ['admin', tenantScope()],
  dashboard: () => ['admin', tenantScope(), 'dashboard'],
  orders: (params = {}) => ['admin', tenantScope(), 'orders', params],
  ordersMetrics: () => ['admin', tenantScope(), 'orders', 'metrics'],
  shippingSupport: () => ['admin', tenantScope(), 'orders', 'shipping-support'],
  customers: (params = {}) => ['admin', tenantScope(), 'customers', params],
  customerMetrics: () => ['admin', tenantScope(), 'customers', 'metrics'],
  vipLevels: () => ['admin', tenantScope(), 'customers', 'vip-levels'],
  crmSettings: () => ['admin', tenantScope(), 'customers', 'settings'],
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: true,
      refetchOnMount: 'always',
      retry: (failureCount, error) => {
        const status = error?.response?.status;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      retry: 0,
    },
  },
});

export const invalidateAdminQueries = () => queryClient.invalidateQueries({
  queryKey: adminQueryKeys.root(),
});