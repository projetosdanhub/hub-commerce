import OrderShipmentPanel from './OrderShipmentPanel';
import React, { useState } from 'react';
import {
  ArrowLeft,
  Barcode,
  CheckCircle2,
  CreditCard,
  ClipboardList,
  Download,
  Eye,
  FileText,
  MapPin,
  MoreHorizontal,
  Package,
  QrCode,
  RotateCcw,
  Tags,
  Truck,
  WalletCards,
  UserRound,
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Badge } from '../DesignSystem/primitives/Badge';
import { Button } from '../DesignSystem/primitives/Button';
import { IntegrationLogo } from '../DesignSystem/patterns/IntegrationLogo';
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

const paymentPresentation = (payment = {}) => {
  const method = String(payment.metodo || payment.method || '').trim();
  const normalized = method.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  if (normalized.includes('pix')) return { label: method, Icon: QrCode };
  if (normalized.includes('boleto')) return { label: method, Icon: Barcode };
  if (normalized.includes('cartao') || normalized.includes('credito') || normalized.includes('debito')) {
    return { label: method, Icon: CreditCard };
  }

  return { label: method || 'Pagamento não informado', Icon: WalletCards };
};

const PaymentDetails = ({ payment }) => {
  const { label, Icon } = paymentPresentation(payment);
  const gateway = String(payment?.gateway || payment?.payment_gateway || '').trim();

  return (
    <Section title="Pagamento" icon={WalletCards}>
      <div className="hub-order-detail-fields">
        <DetailField label="Forma de pagamento">
          <span className="hub-order-payment-value">
            <IntegrationLogo name={payment?.metodo || label} fallbackIcon={Icon} className="hub-inline-logo" iconSize={15} />
            {label}
          </span>
        </DetailField>
        {gateway ? (
          <DetailField label="Gateway">
            <span className="hub-order-payment-value">
              <IntegrationLogo name={gateway} fallbackIcon={() => null} className="hub-inline-logo" iconSize={15} />
              {gateway}
            </span>
          </DetailField>
        ) : null}
        {Number(payment?.parcelas) > 1 ? (
          <DetailField label="Parcelamento">{payment.parcelas}x de {formatCurrency(payment.valor_parcela)}</DetailField>
        ) : null}
      </div>
    </Section>
  );
};

const StatusProgress = ({ status }) => {
  const shouldReduceMotion = useReducedMotion();
  const current = STATUS_FLOW.indexOf(status);
  const progress = current <= 0 ? 0 : Math.round((current / (STATUS_FLOW.length - 1)) * 100);

  return (
    <ol className="hub-order-progress" aria-label="Progresso do pedido" style={{ '--hub-order-progress-value': String(progress) + '%' }}>
      {STATUS_FLOW.map((step, index) => {
        const meta = getOrderStatus(step);
        const complete = current >= index;
        const active = current === index;

        return (
          <li key={step} data-complete={complete} data-active={active} aria-current={active ? 'step' : undefined}>
            <motion.span
              initial={false}
              animate={{ scale: active ? 1.08 : 1 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            >
              {complete ? <CheckCircle2 aria-hidden="true" size={15} /> : index + 1}
            </motion.span>
            <small>{meta.label}</small>
          </li>
        );
      })}
    </ol>
  );
};

const isKnownMoney = (value) => value !== null
  && value !== undefined
  && value !== ''
  && Number.isFinite(Number(value));

const FinancialSummary = ({ financial }) => {
  if (!financial) {
    return <p className="hub-orders-form-hint">O resumo financeiro deste pedido não está disponível.</p>;
  }

  const value = (amount) => (isKnownMoney(amount) ? formatCurrency(amount) : 'Não informado');
  const coupons = Array.isArray(financial.cupons) ? financial.cupons : [];

  return (
    <div className="hub-order-financial-summary">
      <div className="hub-order-totals">
        <span>Subtotal <strong>{value(financial.subtotal)}</strong></span>
        <span>Frete cobrado <strong>{value(financial.frete_cobrado)}</strong></span>
        <span>Total bruto <strong>{value(financial.total_bruto)}</strong></span>
        <span>Desconto total <strong>− {value(financial.desconto_total)}</strong></span>
        <span className="hub-order-total">Total líquido <strong>{value(financial.total_liquido)}</strong></span>
      </div>
      {coupons.length ? (
        <ul className="hub-order-coupons" aria-label="Cupons aplicados">
          {coupons.map((coupon, index) => (
            <li key={coupon.nome + '-' + index}>
              <span>{coupon.nome}{coupon.tipo ? ' · ' + coupon.tipo : ''}</span>
              {isKnownMoney(coupon.valor) ? <strong>− {formatCurrency(coupon.valor)}</strong> : null}
            </li>
          ))}
        </ul>
      ) : null}
      {!financial.origens_de_desconto_disponiveis && isKnownMoney(financial.desconto_total) && Number(financial.desconto_total) > 0 ? (
        <p className="hub-orders-form-hint">A origem detalhada dos descontos será exibida quando existir snapshot financeiro persistido.</p>
      ) : null}
    </div>
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
  const hasLegacyMedia = Array.isArray(source.media) && source.media.length > 0;

  return {
    details,
    media,
    hasCustomization: details.length > 0 || media.length > 0 || hasLegacyMedia,
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

const OrderDocuments = ({ order }) => {
  const refunds = (order.comprovantes_reembolso || []).map((receipt, index) => ({
    id: receipt.id || `refund-${index}`,
    name: receipt.name || `Comprovante de reembolso ${index + 1}`,
    kind: receipt.kind || 'document',
    preview_url: receipt.preview_url || receipt.url,
    download_url: receipt.download_url || receipt.preview_url || receipt.url,
    description: 'Reembolso privado higienizado',
  }));
  const documents = [...(order.documentos || []), ...refunds];
  const visibleDocuments = documents.filter((document) => document.legacy_pending === false || document.preview_url);

  if (!documents.length) {
    return <p className="hub-orders-form-hint">Os comprovantes e documentos gerados nas operações aparecerão aqui.</p>;
  }

  return (
    <div className="hub-order-receipt-gallery">
      {visibleDocuments.map((document, index) => (
        <article key={document.id || `${document.type || 'document'}-${index}`} className="hub-order-receipt-card">
          {document.kind === 'image' ? (
            <img src={document.preview_url} alt={`Prévia de ${document.name}`} />
          ) : (
            <span className="hub-order-receipt-file-icon"><FileText aria-hidden="true" size={24} /></span>
          )}
          <div>
            <strong>{document.name}</strong>
            <small>{document.description || (document.type === 'romaneio' ? 'Documento de expedição privado' : 'Documento privado')}</small>
            <span className="hub-order-receipt-actions">
              <a href={document.preview_url} target="_blank" rel="noreferrer"><Eye aria-hidden="true" size={15} /> Ver prévia</a>
              <a href={document.download_url} download><Download aria-hidden="true" size={15} /> Baixar</a>
            </span>
          </div>
        </article>
      ))}
      {documents.filter((document) => document.legacy_pending).map((document) => (
        <article key={`legacy-${document.type}`} className="hub-order-receipt-card" data-pending>
          <span className="hub-order-receipt-file-icon"><FileText aria-hidden="true" size={24} /></span>
          <div>
            <strong>{document.name}</strong>
            <small>Arquivo legado aguardando migração para o armazenamento privado.</small>
          </div>
        </article>
      ))}
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
  const canCancelMeCart = false;

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
  const financial = order.financeiro || null;

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
            <div className="hub-order-detail-meta"><span>{formatOrderDate(order.data_raw || order.created_at)}</span></div>
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
            <FinancialSummary financial={financial} />
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

          <PaymentDetails payment={order.pagamento} />

          <Section title="Etiqueta Melhor Envio" icon={Truck}>
            <OrderShipmentPanel key={order.id} orderId={order.id} />
          </Section>

          <Section title="Entrega" icon={MapPin}>
            <div className="hub-order-detail-fields">
              <DetailField label="Endereço">{address.line}</DetailField>
              <DetailField label="Cidade">{address.city}</DetailField>
              <DetailField label="CEP">{address.postalCode}</DetailField>
              <DetailField label="Transportadora">
                <span className="hub-order-inline-integration">
                  <IntegrationLogo name={order.carrier} fallbackIcon={() => null} className="hub-inline-logo" iconSize={15} />
                  {order.carrier || 'Aguardando expedição'}
                </span>
              </DetailField>
              <DetailField label="Rastreio">{order.tracking_code || 'Ainda não informado'}</DetailField>
            </div>
          </Section>

          <Section
            title="Documentos"
            icon={FileText}
            action={<Button variant="ghost" size="sm" icon={FileText} onClick={() => onPreviewDocument('DECLARACAO')}>Gerar</Button>}
          >
            <div className="hub-order-documents">
              <OrderDocuments order={order} />
            </div>
          </Section>
        </aside>
      </div>
    </motion.div>
  );
};