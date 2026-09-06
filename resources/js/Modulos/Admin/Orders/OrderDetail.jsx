import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Download,
  Eye,
  FileText,
  ImageIcon,
  MapPin,
  MoreHorizontal,
  Package,
  RotateCcw,
  Tags,
  Truck,
  UserRound,
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Badge } from '../DesignSystem/primitives/Badge';
import { Button } from '../DesignSystem/primitives/Button';
import { IconButton } from '../DesignSystem/primitives/IconButton';
import {
  actionForStatus,
  formatCurrency,
  formatOrderDate,
  getInitials,
  getOrderAddress,
  getOrderStatus,
  timelineTone,
} from './orderUtils';

const STATUS_FLOW = ['A_PAGAR', 'SEPARACAO', 'SEPARADO', 'DESPACHADO', 'ENTREGUE'];

const StatusProgress = ({ status }) => {
  const current = STATUS_FLOW.indexOf(status);

  return (
    <ol className="hub-order-progress" aria-label="Progresso do pedido">
      {STATUS_FLOW.map((step, index) => {
        const meta = getOrderStatus(step);
        const complete = current >= index;
        const active = current === index;

        return (
          <li key={step} data-complete={complete} data-active={active}>
            <span>{complete ? <CheckCircle2 aria-hidden="true" size={15} /> : index + 1}</span>
            <small>{meta.label}</small>
          </li>
        );
      })}
    </ol>
  );
};

const Section = ({ title, icon: Icon, children, action }) => (
  <section className="hub-surface hub-order-detail-section">
    <header>
      <span className="hub-order-detail-section-icon"><Icon aria-hidden="true" size={18} strokeWidth={1.8} /></span>
      <div>
        <h2>{title}</h2>
      </div>
      {action ? <div className="hub-order-detail-section-action">{action}</div> : null}
    </header>
    {children}
  </section>
);

const DetailField = ({ label, children }) => (
  <div className="hub-order-detail-field">
    <span>{label}</span>
    <strong>{children || 'Não informado'}</strong>
  </div>
);

const displayCustomizationLabel = (key) => String(key || 'Detalhe')
  .replace(/([a-z])([A-Z])/g, '$1 $2')
  .replaceAll('_', ' ')
  .replaceAll('-', ' ')
  .replace(/^./, (letter) => letter.toUpperCase());

const isAuthorizedCustomizationMedia = (value) => Boolean(
  value
  && typeof value === 'object'
  && typeof value.preview_url === 'string'
  && typeof value.download_url === 'string',
);

const customizationDetails = (value, prefix = '', entries = []) => {
  if (value === null || value === undefined || value === '') return entries;

  if (Array.isArray(value)) {
    value.forEach((item, index) => customizationDetails(item, prefix || `Opção ${index + 1}`, entries));
    return entries;
  }

  if (typeof value !== 'object') {
    if (typeof value === 'string' && /^(https?:|data:|\/)/i.test(value.trim())) return entries;
    entries.push({ label: displayCustomizationLabel(prefix), value: String(value) });
    return entries;
  }

  Object.entries(value).forEach(([key, item]) => {
    if (['media', 'preview_url', 'download_url', 'url', 'image', 'imagem', 'file', 'arquivo'].includes(key)) return;
    customizationDetails(item, displayCustomizationLabel(key), entries);
  });

  return entries;
};

const getCustomization = (value) => {
  const source = value && typeof value === 'object' ? value : {};
  const media = Array.isArray(source.media)
    ? source.media.filter(isAuthorizedCustomizationMedia)
    : [];
  const details = customizationDetails(source);

  return {
    details,
    media,
    hasCustomization: details.length > 0 || media.length > 0,
  };
};

const CustomizationPanel = ({ value }) => {
  const customization = getCustomization(value);

  if (!customization.hasCustomization) return null;

  return (
    <div className="hub-order-item-customization">
      <div className="hub-order-item-customization-heading">
        <Tags aria-hidden="true" size={15} />
        <strong>Personalização deste item</strong>
      </div>
      {customization.details.length ? (
        <dl className="hub-order-item-customization-details">
          {customization.details.map((detail, index) => (
            <div key={`${detail.label}-${index}`}>
              <dt>{detail.label}</dt>
              <dd>{detail.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {customization.media.length ? (
        <div className="hub-order-item-customization-media" aria-label="Arquivos de personalização">
          {customization.media.map((media, index) => (
            <article key={media.id || media.download_url || index}>
              <img src={media.preview_url} alt={media.name || `Prévia da personalização ${index + 1}`} />
              <div>
                <strong>{media.name || `Arquivo ${index + 1}`}</strong>
                <a href={media.download_url} download>
                  <Download aria-hidden="true" size={14} /> Baixar original
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : null}
      {!customization.media.length && Array.isArray(value?.media) && value.media.length ? (
        <p className="hub-orders-form-hint">Os arquivos deste item aguardam migração para a mídia privada autorizada.</p>
      ) : null}
    </div>
  );
};

const OrderItems = ({ items = [] }) => (
  <ul className="hub-order-items">
    {items.map((item) => {
      const customization = getCustomization(item.personalizacao);

      return (
        <li key={item.id} data-customized={customization.hasCustomization}>
          <div className="hub-order-product-image" aria-hidden="true">
            {item.img ? <img src={item.img} alt="" /> : <Package size={18} />}
          </div>
          <div className="hub-order-item-content">
            <div className="hub-order-item-name">
              <strong>{item.nome || 'Produto indisponível'}</strong>
              {customization.hasCustomization ? <Badge variant="special">Personalizado</Badge> : null}
            </div>
            <span>{[item.variacao, item.sku || item.variacaoSku].filter(Boolean).join(' · ') || 'Sem variação'}</span>
            <CustomizationPanel value={item.personalizacao} />
          </div>
          <span>{item.quantidade || item.qtd || 0} × {formatCurrency(item.preco)}</span>
        </li>
      );
    })}
  </ul>
);

const Timeline = ({ entries = [] }) => {
  const ordered = [...entries].sort((a, b) => String(b.data_raw || b.data).localeCompare(String(a.data_raw || a.data)));

  if (!ordered.length) {
    return <p className="hub-orders-form-hint">Não há registros de auditoria para este pedido.</p>;
  }

  return (
    <ol className="hub-order-timeline">
      {ordered.map((entry, index) => (
        <li key={`${entry.data_raw || entry.data}-${index}`} data-tone={timelineTone(entry)}>
          <span aria-hidden="true" />
          <div>
            <strong>{entry.evento || entry.desc || 'Atualização do pedido'}</strong>
            <small>{formatOrderDate(entry.data_raw || entry.data)} · {entry.autor || 'Sistema'}</small>
          </div>
        </li>
      ))}
    </ol>
  );
};

const RefundReceipts = ({ order }) => {
  const currentReceipts = order.comprovantes_reembolso?.length
    ? order.comprovantes_reembolso
    : order.comprovante_reembolso
      ? [{ id: 'legacy', name: 'Comprovante de reembolso', kind: 'document', url: order.comprovante_reembolso }]
      : [];

  const mayHaveRefundReceipt = currentReceipts.length
    || ['EM_ANALISE_REEMBOLSO', 'REEMBOLSADO'].includes(order.status);

  if (!mayHaveRefundReceipt) return null;

  if (!currentReceipts.length) {
    return <p className="hub-orders-form-hint">Os comprovantes enviados na confirmação do reembolso aparecerão aqui.</p>;
  }

  return (
    <div className="hub-order-receipt-gallery">
      {currentReceipts.map((receipt, index) => {
        const previewUrl = receipt.preview_url || receipt.url;
        const downloadUrl = receipt.download_url || previewUrl;

        return (
          <article key={receipt.id} className="hub-order-receipt-card">
            {receipt.kind === 'image' ? (
              <img src={previewUrl} alt={'Prévia de ' + receipt.name} />
            ) : (
              <span className="hub-order-receipt-file-icon"><FileText aria-hidden="true" size={24} /></span>
            )}
            <div>
              <strong>{receipt.name || 'Comprovante ' + (index + 1)}</strong>
              <small>{receipt.kind === 'image' ? 'Imagem privada higienizada' : 'Documento privado'}</small>
              <span className="hub-order-receipt-actions">
                <a href={previewUrl} target="_blank" rel="noreferrer"><Eye aria-hidden="true" size={15} /> Ver prévia</a>
                <a href={downloadUrl} download><Download aria-hidden="true" size={15} /> Baixar</a>
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
};

const SecondaryActions = ({ order, onAction, onPreviewDocument }) => {
  const [open, setOpen] = useState(false);
  const isTerminal = ['CANCELADO', 'REEMBOLSADO'].includes(order.status);
  const canCancel = order.status === 'A_PAGAR';
  const refundPending = order.status === 'EM_ANALISE_REEMBOLSO';
  const canRequestRefund = !isTerminal && !canCancel && !refundPending;
  const canCancelRefund = refundPending && order.pode_cancelar_reembolso;
  const canUpdateTracking = ['DESPACHADO', 'ENTREGUE'].includes(order.status);
  const canCancelMeCart = String(order.tracking_code || '').length > 20;

  return (
    <div className="hub-order-more-actions">
      <Button variant="secondary" size="sm" icon={MoreHorizontal} onClick={() => setOpen((value) => !value)}>
        Mais ações
      </Button>
      {open ? (
        <div className="hub-order-actions-menu" role="menu">
          <button type="button" role="menuitem" onClick={() => { onPreviewDocument('DECLARACAO'); setOpen(false); }}>
            <FileText aria-hidden="true" size={16} /> Declaração de conteúdo
          </button>
          {canUpdateTracking ? (
            <button type="button" role="menuitem" onClick={() => { onAction('ALTERAR_RASTREIO'); setOpen(false); }}>
              <Truck aria-hidden="true" size={16} /> Atualizar rastreio
            </button>
          ) : null}
          {canCancelMeCart ? (
            <button type="button" role="menuitem" onClick={() => { onAction('CANCELAR_ME_CART'); setOpen(false); }}>
              <RotateCcw aria-hidden="true" size={16} /> Reabrir expedição
            </button>
          ) : null}
          {canRequestRefund ? (
            <button type="button" role="menuitem" onClick={() => { onAction('INICIAR_REEMBOLSO'); setOpen(false); }}>
              <RotateCcw aria-hidden="true" size={16} /> Solicitar reembolso
            </button>
          ) : null}
          {canCancelRefund ? (
            <button type="button" role="menuitem" data-danger onClick={() => { onAction('CANCELAR_REEMBOLSO'); setOpen(false); }}>
              <RotateCcw aria-hidden="true" size={16} /> Cancelar solicitação de reembolso
            </button>
          ) : null}
          {canCancel ? (
            <button type="button" role="menuitem" data-danger onClick={() => { onAction('CANCELAR'); setOpen(false); }}>
              <RotateCcw aria-hidden="true" size={16} /> Cancelar pedido
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export const OrderDetail = ({
  order,
  onBack,
  onAction,
  onPreviewDocument,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const primaryAction = actionForStatus(order.status);
  const status = getOrderStatus(order.status);
  const address = getOrderAddress(order.endereco);
  const totals = useMemo(() => ({
    subtotal: Number(order.subtotal) || 0,
    discount: Number(order.desconto) || 0,
    shipping: Number(order.frete_valor) || 0,
    total: Number(order.total) || 0,
  }), [order]);

  return (
    <motion.div
      className="hub-order-detail"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
    >
      <header className="hub-order-detail-heading">
        <div className="hub-order-detail-back">
          <IconButton icon={ArrowLeft} label="Voltar para pedidos" onClick={onBack} />
          <div>
            <p>Pedido</p>
            <h1>HUB-{order.id} <Badge variant={status.variant}>{status.label}</Badge></h1>
            <span>{formatOrderDate(order.data_raw || order.created_at)} · {order.pagamento_metodo || 'Pagamento não informado'}</span>
          </div>
        </div>
        <div className="hub-order-detail-actions">
          <SecondaryActions order={order} onAction={onAction} onPreviewDocument={onPreviewDocument} />
          {primaryAction ? (
            <Button icon={primaryAction.key === 'DESPACHAR' ? Truck : CheckCircle2} onClick={() => onAction(primaryAction.key)}>
              {primaryAction.label}
            </Button>
          ) : null}
        </div>
      </header>

      <StatusProgress status={order.status} />

      <div className="hub-order-detail-grid">
        <div className="hub-order-detail-main">
          <Section title="Itens do pedido" icon={Package}>
            <OrderItems items={order.items} />
            <div className="hub-order-totals">
              <span>Subtotal <strong>{formatCurrency(totals.subtotal)}</strong></span>
              <span>Frete <strong>{formatCurrency(totals.shipping)}</strong></span>
              <span>Descontos <strong>− {formatCurrency(totals.discount)}</strong></span>
              <span className="hub-order-total">Total <strong>{formatCurrency(totals.total)}</strong></span>
            </div>
          </Section>

          <Section title="Auditoria do pedido" icon={ClipboardList}>
            <Timeline entries={order.timeline} />
          </Section>
        </div>

        <aside className="hub-order-detail-side">
          <Section title="Cliente" icon={UserRound}>
            <div className="hub-order-profile">
              <span className="hub-customer-initials" aria-hidden="true">{getInitials(order.cliente?.nome)}</span>
              <div>
                <strong>{order.cliente?.nome || 'Cliente indisponível'}</strong>
                <small>{order.cliente?.email || 'E-mail indisponível'}</small>
              </div>
            </div>
            <div className="hub-order-detail-fields hub-order-customer-fields">
              <DetailField label="Telefone">{order.cliente?.telefone}</DetailField>
              <DetailField label="CPF">{order.cliente?.cpf}</DetailField>
              <DetailField label="Nascimento">{order.cliente?.nascimento}</DetailField>
              <DetailField label="Origem">{order.cliente?.origem}</DetailField>
              <DetailField label="Nível">{order.cliente?.rank}</DetailField>
              <DetailField label="Compras">{order.cliente?.compras}</DetailField>
              <DetailField label="LTV">{formatCurrency(order.cliente?.ltv)}</DetailField>
            </div>
            <div className="hub-order-customer-tags">
              {(order.cliente?.tags || []).length ? order.cliente.tags.map((tag) => <Badge key={tag}>{tag}</Badge>) : null}
            </div>
          </Section>

          <Section title="Entrega" icon={MapPin}>
            <div className="hub-order-detail-fields">
              <DetailField label="Endereço">{address.line}</DetailField>
              <DetailField label="Cidade">{address.city}</DetailField>
              <DetailField label="CEP">{address.postalCode}</DetailField>
              <DetailField label="Transportadora">{order.carrier || 'Aguardando expedição'}</DetailField>
              <DetailField label="Rastreio">{order.tracking_code || 'Ainda não informado'}</DetailField>
            </div>
          </Section>

          <Section
            title="Documentos"
            icon={FileText}
            action={<Button variant="ghost" size="sm" icon={FileText} onClick={() => onPreviewDocument('DECLARACAO')}>Gerar</Button>}
          >
            <div className="hub-order-documents">
              {order.comprovante_pagamento ? <a href={order.comprovante_pagamento} target="_blank" rel="noreferrer"><Download aria-hidden="true" size={15} /> Comprovante de pagamento</a> : null}
              {order.comprovante_entrega ? <a href={order.comprovante_entrega} target="_blank" rel="noreferrer"><Download aria-hidden="true" size={15} /> Comprovante de entrega</a> : null}
              <RefundReceipts order={order} />
              {!order.comprovante_pagamento && !order.comprovante_entrega && !(order.comprovantes_reembolso?.length || order.comprovante_reembolso) ? (
                <p className="hub-orders-form-hint">Os comprovantes enviados nas operações aparecerão aqui.</p>
              ) : null}
            </div>
          </Section>
        </aside>
      </div>
    </motion.div>
  );
};