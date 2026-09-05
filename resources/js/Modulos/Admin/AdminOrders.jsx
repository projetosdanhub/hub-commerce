import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CircleAlert, ClipboardList, RefreshCw } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api';
import { adminQueryKeys } from '../../queryClient';
import { PageHeader } from './DesignSystem/patterns/PageHeader';
import { Button } from './DesignSystem/primitives/Button';
import { useRegisterAdminPageRefresh } from './DesignSystem/patterns/GlobalPageRefresh';
import { OrderActionDialog } from './Orders/OrderActionDialog';
import { OrderDetail } from './Orders/OrderDetail';
import { OrderMetrics } from './Orders/OrderMetrics';
import { OrdersList } from './Orders/OrdersList';
import {
  cancelMelhorEnvioCart,
  fetchOrderMetricPreferences,
  fetchOrderMetrics,
  fetchOrders,
  fetchShippingSupport,
  submitManualOrderAction,
  updateOrderMetricPreferences,
  updateOrderTracking,
} from './Orders/ordersApi';
import { errorMessage } from './Orders/orderUtils';

const initialFilters = {
  page: 1,
  perPage: 10,
  search: '',
  status: 'TUDO',
  startDate: '',
  endDate: '',
};

const listFilters = (filters) => ({
  page: filters.page,
  perPage: filters.perPage,
  search: filters.search,
  status: filters.status,
  startDate: filters.startDate,
  endDate: filters.endDate,
});

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(initialFilters);
  const [selectedId, setSelectedId] = useState(() => searchParams.get('id'));
  const [action, setAction] = useState(null);
  const [notice, setNotice] = useState(null);

  const currentFilters = useMemo(() => listFilters(filters), [filters]);
  const ordersQuery = useQuery({
    queryKey: adminQueryKeys.orders(currentFilters),
    queryFn: () => fetchOrders(currentFilters),
    refetchInterval: 30_000,
  });
  const metricsQuery = useQuery({
    queryKey: adminQueryKeys.ordersMetrics(),
    queryFn: fetchOrderMetrics,
    retry: false,
    refetchInterval: 60_000,
  });
  const metricPreferencesQuery = useQuery({
    queryKey: adminQueryKeys.ordersMetricPreferences(),
    queryFn: fetchOrderMetricPreferences,
  });
  const metricPreferencesMutation = useMutation({
    mutationFn: updateOrderMetricPreferences,
    onSuccess: (preferences) => {
      queryClient.setQueryData(adminQueryKeys.ordersMetricPreferences(), preferences);
    },
  });
  const shippingQuery = useQuery({
    queryKey: adminQueryKeys.shippingSupport(),
    queryFn: fetchShippingSupport,
    enabled: action === 'DESPACHAR',
    staleTime: 60_000,
  });

  const orders = ordersQuery.data?.data ?? [];
  const selectedOrder = orders.find((order) => String(order.id) === String(selectedId)) ?? null;
  const pagination = {
    page: Number(ordersQuery.data?.current_page) || filters.page,
    lastPage: Number(ordersQuery.data?.last_page) || 1,
  };

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    if (selectedId && !selectedOrder && !ordersQuery.isFetching && orders.length) {
      setSelectedId(null);
      setSearchParams({});
      setNotice({ tone: 'error', message: 'Esse pedido não está disponível nos filtros atuais.' });
    }
  }, [orders, ordersQuery.isFetching, selectedId, selectedOrder, setSearchParams]);

  const refreshCurrentData = useCallback(
    async () => {
      await Promise.all([
        ordersQuery.refetch(),
        metricsQuery.refetch(),
        ...(action === 'DESPACHAR' ? [shippingQuery.refetch()] : []),
      ]);
    },
    [action, metricsQuery.refetch, ordersQuery.refetch, shippingQuery.refetch],
  );

  useRegisterAdminPageRefresh(refreshCurrentData);

  const mutation = useMutation({
    mutationFn: async ({ type, fields }) => {
      if (type === 'ALTERAR_RASTREIO') {
        return updateOrderTracking({ orderId: selectedOrder.id, trackingCode: fields.tracking_code });
      }
      if (type === 'CANCELAR_ME_CART') return cancelMelhorEnvioCart(selectedOrder.id);

      return submitManualOrderAction({
        orderId: selectedOrder.id,
        action: type,
        fields,
      });
    },
    onSuccess: async (_, variables) => {
      setAction(null);
      await refreshCurrentData();
      setNotice({
        tone: 'success',
        message: variables.type === 'CANCELAR_ME_CART'
          ? 'Etiqueta removida; a expedição do pedido foi reaberta.'
          : 'Operação concluída e dados atualizados.',
      });
    },
  });

  const changeFilters = (changes) => setFilters((current) => ({ ...current, ...changes }));
  const clearFilters = () => setFilters(initialFilters);

  const openOrder = (order) => {
    setSelectedId(String(order.id));
    setSearchParams({ id: String(order.id) });
  };

  const closeOrder = () => {
    setSelectedId(null);
    setAction(null);
    setSearchParams({});
  };

  const previewDocument = async (type) => {
    const previewWindow = window.open('', 'hub-order-document', 'width=900,height=720');

    if (!previewWindow) {
      setNotice({ tone: 'error', message: 'Permita a abertura de janelas para visualizar o documento.' });
      return;
    }

    previewWindow.document.title = 'Gerando documento';

    try {
      const response = await api.get(`/admin/orders/${selectedOrder.id}/preview-doc`, { params: { tipo: type } });
      previewWindow.document.write(response.data);
      previewWindow.document.close();
    } catch (requestError) {
      previewWindow.close();
      setNotice({ tone: 'error', message: errorMessage(requestError, 'Não foi possível gerar o documento.') });
    }
  };

  const executeAction = async (type, fields = {}) => mutation.mutateAsync({ type, fields });

  if (ordersQuery.isError) {
    return (
      <section className="hub-surface hub-error-state" role="alert">
        <div>
          <CircleAlert aria-hidden="true" size={28} />
          <h1 className="hub-panel-title">Não foi possível carregar os pedidos</h1>
          <p>Verifique a conexão e tente novamente. Nenhuma informação foi alterada.</p>
          <Button className="mt-5" icon={RefreshCw} onClick={() => ordersQuery.refetch()}>Tentar novamente</Button>
        </div>
      </section>
    );
  }

  if (selectedOrder) {
    return (
      <>
        {notice ? <p className="hub-orders-notice" data-tone={notice.tone} role="status">{notice.message}</p> : null}
        <OrderDetail
          order={selectedOrder}
          onBack={closeOrder}
          onAction={setAction}
          onPreviewDocument={previewDocument}
        />
        <OrderActionDialog
          key={action ? `${selectedOrder.id}-${action}` : 'closed'}
          action={action}
          order={selectedOrder}
          shipping={shippingQuery.data}
          loading={mutation.isPending}
          onClose={() => setAction(null)}
          onSubmit={(type, form) => executeAction(type, form)}
          onUpdateTracking={(tracking_code) => executeAction('ALTERAR_RASTREIO', { tracking_code })}
          onCancelCart={() => executeAction('CANCELAR_ME_CART')}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={ordersQuery.dataUpdatedAt ? `Atualizado às ${new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(ordersQuery.dataUpdatedAt)}` : 'Operação de vendas'}
        title="Pedidos"
        icon={ClipboardList}
        description="Acompanhe pagamentos, expedição e pós-venda com ações auditáveis."
      />
      {notice ? <p className="hub-orders-notice" data-tone={notice.tone} role="status">{notice.message}</p> : null}
      <OrderMetrics
        metrics={metricsQuery.data}
        loading={metricsQuery.isLoading}
        error={metricsQuery.isError}
        onRetry={() => metricsQuery.refetch()}
        preferences={metricPreferencesQuery.data}
        preferencesLoading={metricPreferencesQuery.isLoading}
        preferencesSaving={metricPreferencesMutation.isPending}
        onSavePreferences={(preferences) => metricPreferencesMutation.mutateAsync(preferences)}
      />
      <OrdersList
        orders={orders}
        filters={filters}
        onChange={changeFilters}
        onClear={clearFilters}
        onOpen={openOrder}
        pagination={pagination}
        loading={ordersQuery.isLoading || ordersQuery.isFetching}
      />
    </>
  );
}
