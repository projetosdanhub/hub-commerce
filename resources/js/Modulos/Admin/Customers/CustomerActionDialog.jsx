import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, FileKey2, KeyRound, Mail, Pencil, Phone, Save, ShieldCheck, Tags, UserRound, WalletCards, X } from 'lucide-react';
import { Button } from '../DesignSystem/primitives/Button';
import { IconButton } from '../DesignSystem/primitives/IconButton';
import { errorMessage } from './customerUtils';

const COPY = {
  BASICS: { title: 'Editar dados básicos', icon: UserRound, submit: 'Salvar dados' },
  PHONE: { title: 'Atualizar telefone', icon: Phone, submit: 'Salvar telefone' },
  SENSITIVE: { title: 'Atualizar dados sensíveis', icon: ShieldCheck, submit: 'Salvar com documento', warning: true },
  EMAIL_LINK: { title: 'Enviar confirmação de e-mail', icon: Mail, submit: 'Enviar link' },
  EMAIL_FORCE: { title: 'Forçar troca de e-mail', icon: AlertTriangle, submit: 'Alterar e-mail', warning: true },
  PASSWORD_TEMP: { title: 'Gerar senha provisória', icon: KeyRound, submit: 'Gerar senha', warning: true },
  PASSWORD_LINK: { title: 'Enviar redefinição de senha', icon: KeyRound, submit: 'Enviar link' },
  STATUS: { title: 'Alterar status da conta', icon: AlertTriangle, submit: 'Confirmar alteração', warning: true },
  WALLET: { title: 'Lançar saldo na carteira', icon: WalletCards, submit: 'Registrar lançamento' },
  NOTES: { title: 'Atualizar anotação interna', icon: Pencil, submit: 'Salvar anotação' },
  TAGS: { title: 'Atualizar tags', icon: Tags, submit: 'Salvar tags' },
};

const Field = ({ label, required, children }) => <label className="hub-order-form-field"><span>{label}{required ? ' *' : ''}</span>{children}</label>;

export const CustomerActionDialog = ({ action, customer, loading, onClose, onSubmit }) => {
  const copy = COPY[action];
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const [form, setForm] = useState({
    nome: customer?.nome || '',
    sexo: customer?.sexo || '',
    telefone: customer?.telefone || '',
    cpf: customer?.cpf === '-' ? '' : customer?.cpf || '',
    nascimento: customer?.nascimento === '-' ? '' : customer?.nascimento || '',
    email: '',
    motivo: '',
    arquivo: null,
    acao: customer?.status === 'ATIVO' ? 'SUSPENDER' : 'REATIVAR',
    tipo: 'Hub Coins',
    valor: '',
    notas: customer?.notas || '',
    tags: (customer?.tags || []).join(', '),
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!copy || !customer) return undefined;

    const previousFocus = document.activeElement;
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    const selector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = Array.from(dialogRef.current?.querySelectorAll(selector) ?? []);
      if (!focusable.length) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [action, copy, customer, onClose]);

  if (!copy || !customer) return null;
  const Icon = copy.icon;
  const update = (values) => setForm((current) => ({ ...current, ...values }));

  const validate = () => {
    if (['BASICS', 'PHONE', 'SENSITIVE', 'EMAIL_FORCE', 'STATUS', 'WALLET'].includes(action) && !form.motivo.trim()) return 'Informe o motivo para registrar esta ação.';
    if (action === 'BASICS' && !form.nome.trim()) return 'Informe o nome do cliente.';
    if (action === 'PHONE' && !form.telefone.trim()) return 'Informe o telefone.';
    if (action === 'SENSITIVE' && !form.arquivo) return 'Anexe o documento obrigatório.';
    if (['EMAIL_LINK', 'EMAIL_FORCE'].includes(action) && !form.email.includes('@')) return 'Informe um e-mail válido.';
    if (action === 'WALLET' && (!Number(form.valor) || Number(form.valor) <= 0)) return 'Informe um valor maior que zero.';
    return '';
  };

  const submit = async (event) => {
    event.preventDefault();
    const message = validate();
    if (message) { setError(message); return; }
    setError('');
    try { await onSubmit(action, form); } catch (requestError) { setError(errorMessage(requestError)); }
  };

  return <div className="hub-order-dialog-backdrop" role="presentation">
    <div ref={dialogRef} className="hub-order-dialog" role="dialog" aria-modal="true" aria-labelledby="customer-action-title" aria-describedby="customer-action-description">
      <header><span className="hub-order-dialog-icon" data-tone={copy.warning ? 'warning' : 'default'}><Icon aria-hidden="true" size={20} /></span><div><h2 id="customer-action-title">{copy.title}</h2><p id="customer-action-description">Essa operação será registrada no histórico auditável do cliente.</p></div><IconButton ref={closeButtonRef} className="hub-order-dialog-close" icon={X} label="Fechar" onClick={onClose} /></header>
      <form onSubmit={submit}><div className="hub-order-action-fields">
        {action === 'BASICS' ? <><Field label="Nome" required><input autoFocus value={form.nome} onChange={(e) => update({ nome: e.target.value })} /></Field><Field label="Gênero"><input value={form.sexo} onChange={(e) => update({ sexo: e.target.value })} /></Field><Field label="Motivo" required><textarea rows="3" value={form.motivo} onChange={(e) => update({ motivo: e.target.value })} /></Field></> : null}
        {action === 'PHONE' ? <><Field label="Telefone" required><input autoFocus value={form.telefone} onChange={(e) => update({ telefone: e.target.value })} /></Field><Field label="Motivo" required><textarea rows="3" value={form.motivo} onChange={(e) => update({ motivo: e.target.value })} /></Field></> : null}
        {action === 'SENSITIVE' ? <><Field label="CPF"><input value={form.cpf} onChange={(e) => update({ cpf: e.target.value })} /></Field><Field label="Nascimento"><input type="date" value={form.nascimento} onChange={(e) => update({ nascimento: e.target.value })} /></Field><Field label="Documento comprobatório" required><input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => update({ arquivo: e.target.files?.[0] || null })} /></Field><Field label="Motivo" required><textarea rows="3" value={form.motivo} onChange={(e) => update({ motivo: e.target.value })} /></Field></> : null}
        {action === 'EMAIL_LINK' ? <Field label="Novo e-mail" required><input autoFocus type="email" value={form.email} onChange={(e) => update({ email: e.target.value })} /></Field> : null}
        {action === 'EMAIL_FORCE' ? <><Field label="Novo e-mail" required><input autoFocus type="email" value={form.email} onChange={(e) => update({ email: e.target.value })} /></Field><Field label="Motivo" required><textarea rows="3" value={form.motivo} onChange={(e) => update({ motivo: e.target.value })} /></Field></> : null}
        {action === 'STATUS' ? <><Field label="Ação"><select value={form.acao} onChange={(e) => update({ acao: e.target.value })}><option value="SUSPENDER">Suspender conta</option><option value="REATIVAR">Reativar conta</option></select></Field><Field label="Motivo" required><textarea rows="3" value={form.motivo} onChange={(e) => update({ motivo: e.target.value })} /></Field></> : null}
        {action === 'WALLET' ? <><Field label="Carteira"><select value={form.tipo} onChange={(e) => update({ tipo: e.target.value })}><option value="Hub Coins">Hub Coins</option><option value="Cashback">Cashback</option></select></Field><Field label="Valor" required><input type="number" min="0.01" step="0.01" value={form.valor} onChange={(e) => update({ valor: e.target.value })} /></Field><Field label="Motivo" required><textarea rows="3" value={form.motivo} onChange={(e) => update({ motivo: e.target.value })} /></Field></> : null}
        {action === 'NOTES' ? <Field label="Anotação interna"><textarea autoFocus rows="6" value={form.notas} onChange={(e) => update({ notas: e.target.value })} /></Field> : null}
        {action === 'TAGS' ? <Field label="Tags"><input autoFocus value={form.tags} onChange={(e) => update({ tags: e.target.value })} placeholder="VIP, recompra, atendimento" /></Field> : null}
        {['PASSWORD_TEMP', 'PASSWORD_LINK'].includes(action) ? <p className="hub-order-dialog-warning"><FileKey2 aria-hidden="true" size={16} /> Confirme a ação somente após validar a solicitação do cliente.</p> : null}
      </div>{error ? <p className="hub-order-form-error" role="alert">{error}</p> : null}<footer><Button type="button" variant="ghost" onClick={onClose}>Voltar</Button><Button type="submit" loading={loading} variant={copy.warning ? 'danger' : 'primary'} icon={Save}>{copy.submit}</Button></footer></form>
    </div>
  </div>;
};
