import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Barcode,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Download,
  Eye,
  FileText,
  MapPin,
  MoreHorizontal,
  Package,
  QrCode,
  RotateCcw,
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
  normalizeCustomization,
  paymentKind,
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

const OrderItems = ({ items = [] }) => (
  <ul className="hub-order-items">
    {items.map((item) => {
      const customization = normalizeCustomization(item.personalizacao);
      const customized = customization.images.length || customization.fields.length;

      return (
        <li key={item.id} className="hub-order-item">
          <div className="hub-order-product-image">
            {item.img ? <img src={item.img} alt={'Imagem de ' + (item.nome || 'produto')} /> : <Package aria-hidden="true" size={18} />}
          </div>
          <div className="hub-order-item-content">
            <div className="hub-order-item-heading">
              <div>
                <strong>{item.nome || 'Produto indisponível'}</strong>
                <span>{[item.variacao, item.variacaoSku, item.sku].filter(Boolean).join(' · ') || 'Sem variação'}</span>
              </div>
              {customized ? <Badge variant="danger">Personalizado</Badge> : null}
            </div>
            {customized ? (
              <div className="hub-order-customization">
                {customization.fields.map((field) => (
                  <p key={field.label + field.value}><span>{field.label}</span><strong>{field.value}</strong></p>
                ))}
                {customization.images.length ? (
                  <div className="hub-order-customization-images">
                    {customization.images.map((image, index) => (
                      <a key={image.url + index} href={image.url} target="_blank" rel="noreferrer" download>
                        <img src={image.url} alt={`${image.label} de ${item.nome || 'produto'}`} />
                        <span><Eye aria-hidden="true" size={14} /> Visualizar · <Download aria-hidden="true" size={14} /> baixar original</span>
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          <span className="hub-order-item-price">{item.quantidade || item.qtd || 0} × {formatCurrency(item.preco)}</span>
        </li>
      );
    })}
  </ul>
);

const PaymentMethod = ({ payment = {} }) => {
  const kind = paymentKind(payment);
  const Icon = kind === 'pix' ? QrCode : kind === 'boleto' ? Barcode : CreditCard;
  const brand = kind === 'card' ? payment.bandeira || payment.card_brand : null;

  return (
    <div className="hub-order-payment-method">
      <span><Icon aria-hidden="true" size={19} /></span>
      <div><strong>{payment.metodo || 'Pagamento não informado'}</strong>{brand ? <small>{brand}</small> : null}</div>
    </div>
  );
};

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

const OrderDocuments = ({ documents = [], onOpen }) => {
  if (!documents.length) {
    return <p className="hub-orders-form-hint">Nenhum documento foi anexado ou gerado para este pedido.</p>;
  }

  return (
    <ul className="hub-order-document-list">
      {documents.map((document) => (
        <li key={document.id}>
          <span className="hub-order-receipt-file-icon"><FileText aria-hidden="true" size={20} /></span>
          <div><strong>{document.name}</strong><small>{document.kind === 'image' ? 'Imagem protegida' : 'Documento protegido'}</small></div>
          <IconButton icon={Eye} label={'Visualizar ' + document.name} size="sm" onClick={() => onOpen(document, false)} />
          <IconButton icon={Download} label={'Baixar ' + document.name} size="sm" onClick={() => onOpen(document, true)} />
        </li>
      ))}
    </ul>
  );
};

const SecondaryActions = ({ order, onAction, onPreviewDocument }) => {
  const [open, setOpen] = useState(false);
  const isTerminal = ['CANCELADO', 'REEMBOLSADO'].includes(order.status);
  const canCancel = order.status === 'A_PAGAR';
  const refundPending = order.status === 'EM_ANALISE_REEMBOLSO';
  const canRequestRefund = !isTerminal && !canCancel && !refundPending;
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
          {refundPending ? (
            <button type="button" role="menuitem" onClick={() => { onAction('CANCELAR_REEMBOLSO'); setOpen(false); }}>
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
  onOpenDocument,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const primaryAction = actionForStatus(order.status);
  const status = getOrderStatus(order.status);
  const address = getOrderAddress(order.endereco);
  const totals = useMemo(() => ({
    subtotal: Number(order.financeiro?.subtotal ?? order.subtotal) || 0,
    discount: Number(order.financeiro?.desconto_total ?? order.desconto) || 0,
    shipping: Number(order.financeiro?.frete ?? order.frete_valor) || 0,
    gross: Number(order.financeiro?.total_bruto) || 0,
    net: Number(order.financeiro?.total_liquido ?? order.total) || 0,
    discounts: order.financeiro?.descontos ?? [],
    detailed: Boolean(order.financeiro?.detalhamento_disponivel),
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
            <span>{formatOrderDate(order.data_raw || order.created_at)}</span>
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
            <div className="hub-order-totals" aria-label="Resumo financeiro do pedido">
              <span>Subtotal <strong>{formatCurrency(totals.subtotal)}</strong></span>
              <span>Frete <strong>{formatCurrency(totals.shipping)}</strong></span>
              <span>Total bruto <strong>{formatCurrency(totals.gross)}</strong></span>
              {totals.discounts.map((discount, index) => (
                <span key={(discount.tipo || 'desconto') + index}>{discount.tipo || 'Desconto'} <strong>− {formatCurrency(discount.valor)}</strong></span>
              ))}
              {!totals.detailed && totals.discount > 0 ? <small>Este pedido antigo registra o desconto total, sem separar a origem do benefício.</small> : null}
              <span className="hub-order-total">Total líquido <strong>{formatCurrency(totals.net)}</strong></span>
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
            <div className="hub-order-detail-fields">
              <DetailField label="Telefone">{order.cliente?.telefone}</DetailField>
              <DetailField label="CPF">{order.cliente?.cpf}</DetailField>
              <DetailField label="Nascimento">{order.cliente?.nascimento}</DetailField>
              <DetailField label="Origem">{order.cliente?.origem}</DetailField>
              <DetailField label="Nível">{order.cliente?.rank}</DetailField>
              <DetailField label="LTV">{formatCurrency(order.cliente?.ltv)}</DetailField>
            </div>
          </Section>

          <Section title="Pagamento" icon={CreditCard}>
            <PaymentMethod payment={order.pagamento} />
            <div className="hub-order-detail-fields">
              <DetailField label="Gateway">{order.pagamento?.gateway}</DetailField>
              <DetailField label="Parcelas">{order.pagamento?.parcelas ? `${order.pagamento.parcelas} × ${formatCurrency(order.pagamento.valor_parcela)}` : 'À vista'}</DetailField>
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
              <OrderDocuments documents={order.documentos} onOpen={onOpenDocument} />
            </div>
          </Section>
        </aside>
      </div>
    </motion.div>
  );
};
