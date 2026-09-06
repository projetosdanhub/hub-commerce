import React, { useEffect, useMemo, useState } from 'react';
import { useDialogLifecycle } from '../DesignSystem/patterns/useDialogLifecycle';
import {
  AlertTriangle,
  ClipboardCheck,
  CreditCard,
  FileText,
  ImagePlus,
  PackageCheck,
  RotateCcw,
  Truck,
  X,
} from 'lucide-react';
import { Button } from '../DesignSystem/primitives/Button';
import { IconButton } from '../DesignSystem/primitives/IconButton';
import { calculateShipping } from './ordersApi';
import { errorMessage, formatCurrency } from './orderUtils';

const ACTION_COPY = {
  PAGAR: {
    title: 'Aprovar pagamento manual',
    description: 'Registre o parecer e anexe o comprovante para manter a auditoria financeira.',
    icon: CreditCard,
    confirm: 'Aprovar pagamento',
  },
  SEPARAR: {
    title: 'Concluir separação',
    description: 'Confirme que todos os itens foram separados e conferidos no estoque.',
    icon: ClipboardCheck,
    confirm: 'Concluir separação',
  },
  DESPACHAR: {
    title: 'Configurar expedição',
    description: 'Escolha a modalidade, complete a volumetria e gere o despacho do pedido.',
    icon: Truck,
    confirm: 'Gerar expedição',
  },
  ENTREGAR: {
    title: 'Confirmar entrega',
    description: 'Anexe o comprovante de entrega para finalizar o pedido.',
    icon: PackageCheck,
    confirm: 'Confirmar entrega',
  },
  CANCELAR: {
    title: 'Cancelar pedido',
    description: 'A operação será registrada na trilha de auditoria e a reserva de estoque será liberada.',
    icon: AlertTriangle,
    confirm: 'Cancelar pedido',
    tone: 'danger',
  },
  INICIAR_REEMBOLSO: {
    title: 'Solicitar reembolso',
    description: 'Registre o motivo. Depois da solicitação, o pedido aguarda confirmação do reembolso.',
    icon: RotateCcw,
    confirm: 'Solicitar reembolso',
    tone: 'warning',
  },
  PROCESSAR_REEMBOLSO: {
    title: 'Confirmar reembolso',
    description: 'Escolha a modalidade já executada e anexe até dois comprovantes para concluir a auditoria.',
    icon: RotateCcw,
    confirm: 'Confirmar reembolso',
    tone: 'danger',
  },
  CANCELAR_REEMBOLSO: {
    title: 'Cancelar solicitação de reembolso',
    description: 'O pedido voltará para a etapa registrada antes da solicitação. A decisão ficará na auditoria.',
    icon: RotateCcw,
    confirm: 'Cancelar solicitação',
    tone: 'warning',
  },
  ALTERAR_RASTREIO: {
    title: 'Atualizar rastreio',
    description: 'Informe o novo código de rastreio da transportadora.',
    icon: Truck,
    confirm: 'Salvar rastreio',
  },
  CANCELAR_ME_CART: {
    title: 'Remover etiqueta do carrinho',
    description: 'A etiqueta pendente será removida do Melhor Envio e o pedido voltará para a etapa de expedição.',
    icon: AlertTriangle,
    confirm: 'Remover etiqueta',
    tone: 'danger',
  },
};

const isShippingAction = (action) => action === 'DESPACHAR';

const buildInitialState = (order, shipping) => {
  const defaultPackage = shipping?.packages?.find((item) => item.is_default);

  return {
    motivo: '',
    arquivo: null,
    comprovantes: [],
    refund_method: '',
    tracking_code: order?.tracking_code || '',
    dispatch_type: shipping?.settings?.data?.is_authenticated || shipping?.settings?.is_authenticated ? 'MELHORENVIO' : 'MANUAL',
    doc_tipo: 'DECLARACAO',
    carrier_id: '',
    me_carrier_id: '',
    me_pagar_carteira: false,
    me_insurance_value: String(order?.total || ''),
    package_id: defaultPackage?.id ? String(defaultPackage.id) : '',
    vol_altura: defaultPackage?.altura ? String(defaultPackage.altura) : '',
    vol_largura: defaultPackage?.largura ? String(defaultPackage.largura) : '',
    vol_comprimento: defaultPackage?.comprimento ? String(defaultPackage.comprimento) : '',
    vol_peso: defaultPackage?.peso_vazio ? String(defaultPackage.peso_vazio) : '',
  };
};

const Field = ({ children, label, required = false }) => (
  <label className="hub-order-form-field">
    <span>{label}{required ? ' *' : ''}</span>
    {children}
  </label>
);

const DialogIcon = ({ Icon, tone }) => (
  <span className="hub-order-dialog-icon" data-tone={tone || 'default'}>
    <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
  </span>
);

const ReceiptPreviewCard = ({ file, index, onRemove }) => {
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (!file.type.startsWith('image/')) {
      setPreviewUrl('');
      return undefined;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <article className="hub-order-receipt-preview">
      {previewUrl ? (
        <a href={previewUrl} target="_blank" rel="noreferrer" aria-label={'Abrir comprovante ' + (index + 1)}>
          <img src={previewUrl} alt={'Prévia do comprovante ' + (index + 1)} />
        </a>
      ) : (
        <span className="hub-order-receipt-file-icon"><FileText aria-hidden="true" size={22} /></span>
      )}
      <div>
        <strong>{file.name}</strong>
        <small>{previewUrl ? 'Imagem selecionada' : 'PDF selecionado'}</small>
      </div>
      {previewUrl ? <a className="hub-order-receipt-download" href={previewUrl} download={file.name}>Baixar</a> : null}
      <IconButton icon={X} label={'Remover comprovante ' + (index + 1)} size="sm" onClick={onRemove} />
    </article>
  );
};

const RefundReceiptFields = ({ files, onChange }) => (
  <div className="hub-order-refund-receipts">
    <Field label="Comprovantes" required>
      <input
        type="file"
        accept="image/jpeg,image/png"
        multiple
        onChange={(event) => onChange(Array.from(event.target.files || []).slice(0, 2))}
      />
    </Field>
    <p className="hub-orders-form-hint"><ImagePlus aria-hidden="true" size={15} /> Envie de uma a duas imagens JPG ou PNG. Confira a prévia antes de confirmar.</p>
    {files.length ? (
      <div className="hub-order-receipt-preview-grid">
        {files.map((file, index) => (
          <ReceiptPreviewCard
            key={file.name + file.lastModified}
            file={file}
            index={index}
            onRemove={() => onChange(files.filter((_, fileIndex) => fileIndex !== index))}
          />
        ))}
      </div>
    ) : null}
  </div>
);

const ShippingFields = ({ order, form, onChange, shipping, rates, calculating, onCalculate }) => {
  const settings = shipping?.settings?.data ?? shipping?.settings;
  const melhorEnvioEnabled = Boolean(settings?.is_authenticated);
  const melhorEnvioCarriers = (settings?.carriers_ativas ?? []).filter((carrier) => carrier.ativo);
  const selectedPackage = shipping?.packages?.find((item) => String(item.id) === form.package_id);

  const selectPackage = (value) => {
    const item = shipping?.packages?.find((packageItem) => String(packageItem.id) === value);

    onChange({
      package_id: value,
      vol_altura: item?.altura ? String(item.altura) : form.vol_altura,
      vol_largura: item?.largura ? String(item.largura) : form.vol_largura,
      vol_comprimento: item?.comprimento ? String(item.comprimento) : form.vol_comprimento,
      vol_peso: item?.peso_vazio ? String(item.peso_vazio) : form.vol_peso,
    });
  };

  return (
    <div className="hub-order-shipping-fields">
      <fieldset className="hub-order-mode-toggle">
        <legend>Modalidade de expedição</legend>
        <label data-active={form.dispatch_type === 'MANUAL'}>
          <input
            type="radio"
            checked={form.dispatch_type === 'MANUAL'}
            onChange={() => onChange({ dispatch_type: 'MANUAL', me_carrier_id: '' })}
          />
          Transportadora própria
        </label>
        {melhorEnvioEnabled ? (
          <label data-active={form.dispatch_type === 'MELHORENVIO'}>
            <input
              type="radio"
              checked={form.dispatch_type === 'MELHORENVIO'}
              onChange={() => onChange({ dispatch_type: 'MELHORENVIO', carrier_id: '' })}
            />
            Melhor Envio
          </label>
        ) : null}
      </fieldset>

      <div className="hub-order-shipping-grid">
        <section>
          <h3>Pacote e documento</h3>
          <Field label="Documento">
            <select value={form.doc_tipo} onChange={(event) => onChange({ doc_tipo: event.target.value })}>
              <option value="DECLARACAO">Declaração de conteúdo</option>
              <option value="NFE" disabled>NF-e · requer configuração fiscal</option>
            </select>
          </Field>
          <Field label="Embalagem salva">
            <select value={form.package_id} onChange={(event) => selectPackage(event.target.value)}>
              <option value="">Preencher manualmente</option>
              {(shipping?.packages ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome} · {item.altura} × {item.largura} × {item.comprimento} cm
                </option>
              ))}
            </select>
          </Field>
          {selectedPackage ? <p className="hub-orders-form-hint">Embalagem selecionada: {selectedPackage.nome}.</p> : null}
          <div className="hub-order-volume-grid">
            <Field label="Altura" required>
              <input type="number" min="0" value={form.vol_altura} onChange={(event) => onChange({ vol_altura: event.target.value, package_id: '' })} />
            </Field>
            <Field label="Largura" required>
              <input type="number" min="0" value={form.vol_largura} onChange={(event) => onChange({ vol_largura: event.target.value, package_id: '' })} />
            </Field>
            <Field label="Comprimento" required>
              <input type="number" min="0" value={form.vol_comprimento} onChange={(event) => onChange({ vol_comprimento: event.target.value, package_id: '' })} />
            </Field>
            <Field label="Peso (kg)" required>
              <input type="number" min="0" step="0.001" value={form.vol_peso} onChange={(event) => onChange({ vol_peso: event.target.value, package_id: '' })} />
            </Field>
          </div>
        </section>

        <section>
          <h3>Serviço logístico</h3>
          {form.dispatch_type === 'MANUAL' ? (
            <>
              <Field label="Transportadora" required>
                <select value={form.carrier_id} onChange={(event) => onChange({ carrier_id: event.target.value })}>
                  <option value="">Selecione a transportadora</option>
                  {(shipping?.carriers ?? []).map((carrier) => <option key={carrier.id} value={carrier.id}>{carrier.nome}</option>)}
                </select>
              </Field>
              <Field label="Código de rastreio">
                <input value={form.tracking_code} onChange={(event) => onChange({ tracking_code: event.target.value.toUpperCase() })} placeholder="Opcional" />
              </Field>
            </>
          ) : (
            <>
              <Field label="Valor segurado" required>
                <input type="number" min={order?.total || 0} step="0.01" value={form.me_insurance_value} onChange={(event) => onChange({ me_insurance_value: event.target.value })} />
              </Field>
              <Button size="sm" variant="secondary" icon={Truck} loading={calculating} onClick={onCalculate}>Calcular frete</Button>
              {rates.length ? (
                <fieldset className="hub-order-rates">
                  <legend>Serviço selecionado</legend>
                  {rates.map((rate) => (
                    <label key={rate.id} data-active={String(form.me_carrier_id) === String(rate.id)}>
                      <input type="radio" checked={String(form.me_carrier_id) === String(rate.id)} onChange={() => onChange({ me_carrier_id: String(rate.id) })} />
                      <span><strong>{rate.name || rate.company?.name || 'Serviço logístico'}</strong><small>{formatCurrency(rate.price || rate.custom_price)} · {rate.delivery_time || 'Prazo a confirmar'}</small></span>
                    </label>
                  ))}
                </fieldset>
              ) : (
                <Field label="Serviço do Melhor Envio" required>
                  <select value={form.me_carrier_id} onChange={(event) => onChange({ me_carrier_id: event.target.value })}>
                    <option value="">Calcule o frete ou selecione o serviço</option>
                    {melhorEnvioCarriers.map((carrier) => <option key={carrier.id} value={carrier.id}>{carrier.nome || carrier.name}</option>)}
                  </select>
                </Field>
              )}
              <label className="hub-order-checkbox">
                <input type="checkbox" checked={form.me_pagar_carteira} onChange={(event) => onChange({ me_pagar_carteira: event.target.checked })} />
                Pagar etiqueta com a carteira do Melhor Envio
              </label>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export const OrderActionDialog = ({
  action,
  order,
  shipping,
  loading,
  onClose,
  onSubmit,
  onUpdateTracking,
  onCancelCart,
}) => {
  const copy = ACTION_COPY[action];
  const { dialogRef, closing, requestClose } = useDialogLifecycle({ enabled: Boolean(copy && order), onClose, busy: loading });
  const [form, setForm] = useState(() => buildInitialState(order, shipping));
  const [rates, setRates] = useState([]);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');

  const update = (changes) => setForm((current) => ({ ...current, ...changes }));
  const requiresReason = useMemo(() => ['PAGAR', 'CANCELAR', 'INICIAR_REEMBOLSO', 'PROCESSAR_REEMBOLSO', 'CANCELAR_REEMBOLSO'].includes(action), [action]);
  const requiresFile = useMemo(() => ['PAGAR', 'ENTREGAR'].includes(action), [action]);
  const requiresRefundReceipts = action === 'PROCESSAR_REEMBOLSO';


  if (!copy || !order) return null;

  const calculate = async () => {
    setError('');
    if (!form.vol_altura || !form.vol_largura || !form.vol_comprimento || !form.vol_peso) {
      setError('Informe todas as dimensões e o peso antes de calcular o frete.');
      return;
    }
    if (Number(form.me_insurance_value) < Number(order.total)) {
      setError(`O valor segurado deve ser no mínimo ${formatCurrency(order.total)}.`);
      return;
    }

    setCalculating(true);
    try {
      const values = await calculateShipping({
        to_postal_code: order.endereco?.cep || order.endereco?.zip_code,
        height: form.vol_altura,
        width: form.vol_largura,
        length: form.vol_comprimento,
        weight: form.vol_peso,
        insurance_value: form.me_insurance_value,
      });
      setRates(values);
      if (!values.length) setError('Nenhuma opção de frete foi retornada para estes dados.');
    } catch (requestError) {
      setError(errorMessage(requestError, 'Não foi possível calcular o frete agora.'));
    } finally {
      setCalculating(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (requiresReason && !form.motivo.trim()) {
      setError('Informe o motivo ou parecer para registrar a operação.');
      return;
    }
    if (requiresFile && !form.arquivo) {
      setError('Anexe o comprovante obrigatório para continuar.');
      return;
    }
    if (requiresRefundReceipts && !form.comprovantes.length) {
      setError('Anexe ao menos um comprovante para confirmar o reembolso.');
      return;
    }
    if (requiresRefundReceipts && !form.refund_method) {
      setError('Selecione a modalidade usada no reembolso.');
      return;
    }
    if (isShippingAction(action)) {
      if (!form.vol_altura || !form.vol_largura || !form.vol_comprimento || !form.vol_peso) {
        setError('Informe todas as dimensões e o peso do pacote.');
        return;
      }
      if (form.dispatch_type === 'MANUAL' && !form.carrier_id) {
        setError('Selecione a transportadora própria.');
        return;
      }
      if (form.dispatch_type === 'MELHORENVIO' && !form.me_carrier_id) {
        setError('Selecione um serviço do Melhor Envio.');
        return;
      }
    }

    try {
      if (action === 'ALTERAR_RASTREIO') {
        await onUpdateTracking(form.tracking_code);
      } else if (action === 'CANCELAR_ME_CART') {
        await onCancelCart();
      } else {
        await onSubmit(action, form);
      }
      requestClose();
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  };

  const Icon = copy.icon;

  return (
    <div className="hub-order-dialog-backdrop" data-closing={closing} role="presentation">
      <div ref={dialogRef} className="hub-order-dialog" role="dialog" aria-modal="true" aria-labelledby="order-action-title" aria-describedby="order-action-description" tabIndex={-1}>
        <header>
          <DialogIcon Icon={Icon} tone={copy.tone} />
          <div>
            <h2 id="order-action-title">{copy.title}</h2>
            <p id="order-action-description">{copy.description}</p>
          </div>
          <IconButton className="hub-order-dialog-close" icon={X} label="Fechar" disabled={loading} onClick={requestClose} />
        </header>

        <form onSubmit={submit}>
          {isShippingAction(action) ? (
            <ShippingFields
              order={order}
              form={form}
              onChange={update}
              shipping={shipping}
              rates={rates}
              calculating={calculating}
              onCalculate={calculate}
            />
          ) : (
            <div className="hub-order-action-fields">
              {action === 'ALTERAR_RASTREIO' ? (
                <Field label="Código de rastreio" required>
                  <input autoFocus value={form.tracking_code} onChange={(event) => update({ tracking_code: event.target.value.toUpperCase() })} />
                </Field>
              ) : null}
              {requiresReason ? (
                <Field label="Motivo ou parecer" required>
                  <textarea autoFocus rows="4" value={form.motivo} onChange={(event) => update({ motivo: event.target.value })} />
                </Field>
              ) : null}
              {action === 'PROCESSAR_REEMBOLSO' ? (
                <>
                  <Field label="Modalidade" required>
                    <select value={form.refund_method} onChange={(event) => update({ refund_method: event.target.value })}>
                      <option value="">Selecione a modalidade</option>
                      <option value="TRANSFERENCIA">Transferência ou estorno manual</option>
                      <option value="CASHBACK">Crédito no cashback do cliente</option>
                    </select>
                  </Field>
                  <RefundReceiptFields
                    files={form.comprovantes}
                    onChange={(comprovantes) => update({ comprovantes })}
                  />
                </>
              ) : null}
              {requiresFile ? (
                <Field label="Comprovante" required>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => update({ arquivo: event.target.files?.[0] || null })} />
                </Field>
              ) : null}
              {action === 'CANCELAR_ME_CART' ? (
                <p className="hub-order-dialog-warning"><AlertTriangle aria-hidden="true" size={16} /> Esta operação reabre a configuração de transporte.</p>
              ) : null}
            </div>
          )}

          {error ? <p className="hub-order-form-error" role="alert">{error}</p> : null}

          <footer>
            <Button type="button" variant="ghost" disabled={loading} onClick={requestClose}>Voltar</Button>
            <Button type="submit" variant={copy.tone === 'danger' ? 'danger' : 'primary'} loading={loading} icon={copy.icon}>
              {copy.confirm}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
};
