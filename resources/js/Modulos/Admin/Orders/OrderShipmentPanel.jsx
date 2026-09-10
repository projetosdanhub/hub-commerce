import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../api';
import { Button } from '../DesignSystem/primitives/Button';
import { errorMessage, formatCurrency } from './orderUtils';

const LABELS = {
  PREPARING: 'Preparando envio', PENDING: 'Aguardando compra', RELEASED: 'Etiqueta paga',
  GENERATED: 'Etiqueta gerada', RECEIVED: 'Recebido no ponto de coleta', POSTED: 'Postado',
  DELIVERED: 'Entregue', CANCELLED: 'Cancelado', UNDELIVERED: 'Entrega não realizada',
  PAUSED: 'Entrega pausada', SUSPENDED: 'Envio suspenso',
};

export default function OrderShipmentPanel({ orderId }) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [printUrl, setPrintUrl] = useState(null);
  const key = ['order-shipment', orderId];
  const query = useQuery({
    queryKey: key,
    queryFn: async () => (await api.get(`/admin/orders/${orderId}/shipment`)).data.data,
  });
  const mutation = useMutation({
    mutationFn: async (action) => (await api.post(`/admin/orders/${orderId}/shipment/actions`, { action, reason })).data,
    onSuccess: async (result) => {
      setConfirmation(null);
      setPrintUrl(result.url || null);
      await queryClient.invalidateQueries({ queryKey: key });
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: async () => { await queryClient.invalidateQueries({ queryKey: key }); },
  });
  const shipment = query.data;
  if (query.isPending) return <p role="status">Consultando etiqueta…</p>;
  if (query.isError) return <div role="alert"><p>Não foi possível consultar a etiqueta.</p><Button variant="secondary" size="sm" onClick={() => query.refetch()}>Tentar novamente</Button></div>;
  if (!shipment) return <p className="hub-orders-form-hint">Configure a expedição para preparar uma etiqueta do Melhor Envio.</p>;
  const available = shipment.active_slot && !shipment.operation;

  return (
    <div className="hub-order-shipping-fields">
      <p><strong>{LABELS[shipment.status] || 'Estado a verificar'}</strong> · {shipment.environment === 'SANDBOX' ? 'Teste' : 'Produção'}</p>
      <p>Cotação: {formatCurrency(shipment.quoted_cents / 100)}</p>
      <p className="hub-orders-form-hint">Referência: {shipment.public_id}</p>
      {shipment.operation ? <p role="status">Operação pendente. Atualize o estado antes de repetir.</p> : null}
      {shipment.failure_code ? <p role="alert">A última operação precisa de verificação. Consulte o estado da etiqueta.</p> : null}
      {mutation.isError ? <p role="alert">{errorMessage(mutation.error, 'Não foi possível concluir a operação.')}</p> : null}
      <div className="hub-order-receipt-actions">
        {shipment.active_slot ? <Button variant="secondary" size="sm" loading={mutation.isPending} onClick={() => mutation.mutate('SYNCHRONIZE')}>Atualizar estado</Button> : null}
        {available && shipment.status === 'PENDING' ? <Button size="sm" onClick={() => setConfirmation('PURCHASE')}>Comprar etiqueta</Button> : null}
        {available && shipment.status === 'RELEASED' ? <Button size="sm" loading={mutation.isPending} onClick={() => mutation.mutate('GENERATE')}>Gerar etiqueta</Button> : null}
        {available && ['GENERATED', 'RECEIVED', 'POSTED', 'DELIVERED'].includes(shipment.status) ? <Button variant="secondary" size="sm" loading={mutation.isPending} onClick={() => mutation.mutate('PRINT')}>Preparar impressão</Button> : null}
        {available && ['PENDING', 'RELEASED', 'GENERATED'].includes(shipment.status) ? <Button variant="secondary" size="sm" onClick={() => setConfirmation('CANCEL')}>Cancelar etiqueta</Button> : null}
      </div>
      {confirmation ? (
        <div className="hub-order-form-field">
          {confirmation === 'PURCHASE' ? <p>A compra será debitada da carteira do Melhor Envio no ambiente indicado acima. O valor final será definido pelo provedor.</p> : <label>Motivo do cancelamento<input value={reason} maxLength={2000} onChange={(event) => setReason(event.target.value)} /></label>}
          <Button size="sm" loading={mutation.isPending} disabled={confirmation === 'CANCEL' && !reason.trim()} onClick={() => mutation.mutate(confirmation)}>Confirmar {confirmation === 'PURCHASE' ? 'compra' : 'cancelamento'}</Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirmation(null)}>Voltar</Button>
        </div>
      ) : null}
      {printUrl ? <a href={printUrl} target="_blank" rel="noreferrer">Abrir impressão privada no Melhor Envio</a> : null}
      <p className="hub-orders-form-hint">O pedido será atualizado quando a postagem e a entrega forem confirmadas.</p>
    </div>
  );
}
