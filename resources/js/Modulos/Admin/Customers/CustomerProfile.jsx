import React, { useMemo, useState } from 'react';
import { ArrowLeft, ClipboardList, Mail, MapPin, MoreHorizontal, Package, Phone, RefreshCw, ShieldCheck, Tags, UserRound, WalletCards } from 'lucide-react';
import { Badge } from '../DesignSystem/primitives/Badge';
import { Button } from '../DesignSystem/primitives/Button';
import { IconButton } from '../DesignSystem/primitives/IconButton';
import { SectionTabs } from '../DesignSystem/patterns/SectionTabs';
import { eventTone, formatCurrency, formatDate, getInitials, getStatus } from './customerUtils';

const Section = ({ title, icon: Icon, children, action }) => <section className="hub-surface hub-order-detail-section"><header><span className="hub-order-detail-section-icon"><Icon aria-hidden="true" size={18} /></span><h2>{title}</h2>{action ? <div className="hub-order-detail-section-action">{action}</div> : null}</header>{children}</section>;
const Detail = ({ label, children }) => <div className="hub-order-detail-field"><span>{label}</span><strong>{children || 'Não informado'}</strong></div>;

const PROFILE_TABS = [
  { value: 'RESUMO', label: 'Resumo' },
  { value: 'PEDIDOS', label: 'Pedidos' },
  { value: 'AUDITORIA', label: 'Auditoria' },
];

const MoreActions = ({ onAction }) => {
  const [open, setOpen] = useState(false);
  const actions = [['BASICS', UserRound, 'Editar dados básicos'], ['PHONE', Phone, 'Atualizar telefone'], ['SENSITIVE', ShieldCheck, 'Dados sensíveis'], ['EMAIL_LINK', Mail, 'Alterar e-mail com confirmação'], ['EMAIL_FORCE', Mail, 'Forçar troca de e-mail'], ['PASSWORD_LINK', ShieldCheck, 'Enviar redefinição de senha'], ['PASSWORD_TEMP', ShieldCheck, 'Gerar senha provisória'], ['STATUS', ShieldCheck, 'Status da conta']];
  return <div className="hub-order-more-actions"><Button size="sm" variant="secondary" icon={MoreHorizontal} aria-expanded={open} aria-controls="customer-profile-actions" onClick={() => setOpen((value) => !value)}>Ações</Button>{open ? <div id="customer-profile-actions" className="hub-order-actions-menu" role="menu">{actions.map(([key, Icon, label]) => <button key={key} type="button" role="menuitem" onClick={() => { onAction(key); setOpen(false); }}><Icon aria-hidden="true" size={16} />{label}</button>)}</div> : null}</div>;
};

export const CustomerProfile = ({ customer, refreshing, onBack, onRefresh, onAction }) => {
  const [tab, setTab] = useState('RESUMO');
  const status = getStatus(customer.status);
  const orders = useMemo(() => [...(customer.pedidos || [])].sort((a, b) => String(b.data_raw).localeCompare(String(a.data_raw))), [customer.pedidos]);
  const events = useMemo(() => [...(customer.auditLogs || [])].sort((a, b) => String(b.data).localeCompare(String(a.data))), [customer.auditLogs]);

  return <div className="hub-order-detail">
    <header className="hub-order-detail-heading"><div className="hub-order-detail-back"><IconButton icon={ArrowLeft} label="Voltar para clientes" onClick={onBack} /><div><p>Perfil 360º</p><h1>{customer.nome} <Badge variant={status.variant}>{status.label}</Badge></h1><span>{customer.email || 'E-mail indisponível'} · Cliente desde {formatDate(customer.dataCadastro)}</span></div></div><div className="hub-order-detail-actions"><IconButton icon={RefreshCw} label="Atualizar dados do cliente" loading={refreshing} onClick={onRefresh} /><MoreActions onAction={onAction} /><Button icon={WalletCards} onClick={() => onAction('WALLET')}>Lançar saldo</Button></div></header>
    <SectionTabs ariaLabel="Navegação do perfil" items={PROFILE_TABS} value={tab} onChange={setTab} />
    {tab === 'RESUMO' ? <div className="hub-order-detail-grid"><div className="hub-order-detail-main"><Section title="Relacionamento" icon={UserRound}><div className="hub-customer-profile-hero"><span className="hub-customer-profile-avatar" aria-hidden="true">{customer.avatar ? <img src={customer.avatar} alt="" /> : getInitials(customer.nome)}</span><div><strong>{customer.nome}</strong><small>{customer.rank || 'Nível indisponível'}</small></div></div><div className="hub-order-detail-fields hub-customer-four-fields"><Detail label="Compras">{customer.compras || 0}</Detail><Detail label="LTV">{formatCurrency(customer.ltv)}</Detail><Detail label="Produtos">{customer.produtosComprados || 0}</Detail><Detail label="Cashback">{formatCurrency(customer.cashback)}</Detail></div></Section><Section title="Tags e anotação" icon={Tags} action={<Button size="sm" variant="ghost" onClick={() => onAction('TAGS')}>Editar</Button>}><div className="hub-customer-tags">{(customer.tags || []).length ? customer.tags.map((tag) => <Badge key={tag}>{tag}</Badge>) : <p className="hub-orders-form-hint">Nenhuma tag cadastrada.</p>}</div><div className="hub-customer-note"><p>{customer.notas || 'Nenhuma anotação interna.'}</p><Button size="sm" variant="ghost" onClick={() => onAction('NOTES')}>Editar anotação</Button></div></Section></div><aside className="hub-order-detail-side"><Section title="Contato" icon={Phone}><div className="hub-order-detail-fields"><Detail label="Telefone">{customer.telefone}</Detail><Detail label="CPF">{customer.cpf}</Detail><Detail label="Nascimento">{formatDate(customer.nascimento)}</Detail><Detail label="Origem">{customer.origem}</Detail></div></Section><Section title="Endereços" icon={MapPin}>{(customer.enderecos || []).length ? <div className="hub-order-detail-fields">{customer.enderecos.map((address, index) => <Detail key={address.id || index} label={index === 0 ? 'Principal' : `Endereço ${index + 1}`}>{[address.rua, address.num || address.numero, address.bairro, address.cidade, address.uf].filter(Boolean).join(', ')}</Detail>)}</div> : <p className="hub-orders-form-hint hub-customer-section-padding">Nenhum endereço cadastrado.</p>}</Section></aside></div> : null}
    {tab === 'PEDIDOS' ? <Section title="Histórico de pedidos" icon={Package}>{orders.length ? <div className="hub-order-table-wrap"><table className="hub-order-table"><thead><tr><th>Pedido</th><th>Data</th><th>Pagamento</th><th>Status</th><th>Total</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><strong>HUB-{order.id}</strong></td><td>{formatDate(order.data_raw)}</td><td>{order.payment_method || 'Não informado'}</td><td>{order.status}</td><td><strong>{formatCurrency(order.total)}</strong></td></tr>)}</tbody></table></div> : <div className="hub-empty-state"><div><Package aria-hidden="true" size={28} /><h2 className="hub-panel-title">Sem pedidos</h2><p>Este cliente ainda não possui pedidos registrados.</p></div></div>}</Section> : null}
    {tab === 'AUDITORIA' ? <Section title="Histórico auditável" icon={ClipboardList}>{events.length ? <ol className="hub-order-timeline">{events.map((event) => <li key={event.id} data-tone={eventTone(event)}><span aria-hidden="true" /><div><strong>{event.titulo || event.acao}</strong><small>{formatDate(event.data)} · {event.desc || event.detalhes || 'Sem detalhes'}</small></div></li>)}</ol> : <p className="hub-orders-form-hint hub-customer-section-padding">Nenhum registro auditável encontrado.</p>}</Section> : null}
  </div>;
};
