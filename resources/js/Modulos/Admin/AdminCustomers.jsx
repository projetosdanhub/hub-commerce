import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CircleAlert, RefreshCw, UsersRound } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { adminQueryKeys } from '../../queryClient';
import { PageHeader } from './DesignSystem/patterns/PageHeader';
import { Button } from './DesignSystem/primitives/Button';
import { CustomerActionDialog } from './Customers/CustomerActionDialog';
import { CustomerManagementPanels, CustomerSections } from './Customers/CustomerManagementPanels';
import { CustomerProfile } from './Customers/CustomerProfile';
import { CustomersDashboard } from './Customers/CustomersDashboard';
import { CustomersList } from './Customers/CustomersList';
import {
  addWalletTransaction, deleteVipLevel, fetchCrmSettings, fetchCustomerMetrics, fetchCustomers, fetchVipLevels,
  forceCustomerEmail, generateTemporaryPassword, saveCrmSettings, saveVipLevel, sendCustomerEmailLink,
  sendPasswordReset, updateCustomerBasics, updateCustomerNotes, updateCustomerPhone, updateCustomerStatus,
  updateCustomerTags, updateSensitiveData,
} from './Customers/customerApi';

const initialFilters = { page: 1, perPage: 15, search: '', status: 'TODOS', birthMonth: 'TODOS' };

export default function AdminCustomers() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [section, setSection] = useState(() => searchParams.get('section') || 'PAINEL');
  const [filters, setFilters] = useState(initialFilters);
  const [selectedId, setSelectedId] = useState(() => searchParams.get('id'));
  const [action, setAction] = useState(null);
  const [notice, setNotice] = useState(null);

  const customersQuery = useQuery({ queryKey: adminQueryKeys.customers(filters), queryFn: () => fetchCustomers(filters), refetchInterval: 30_000 });
  const metricsQuery = useQuery({ queryKey: adminQueryKeys.customerMetrics(), queryFn: fetchCustomerMetrics, refetchInterval: 60_000 });
  const vipQuery = useQuery({ queryKey: adminQueryKeys.vipLevels(), queryFn: fetchVipLevels, enabled: section === 'VIP' });
  const settingsQuery = useQuery({ queryKey: adminQueryKeys.crmSettings(), queryFn: fetchCrmSettings, enabled: section === 'CONFIG' });

  const customers = customersQuery.data?.data ?? [];
  const selectedCustomer = customers.find((customer) => String(customer.id) === String(selectedId)) ?? null;
  const pagination = { page: Number(customersQuery.data?.current_page) || filters.page, lastPage: Number(customersQuery.data?.last_page) || 1 };

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(null), 7000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: adminQueryKeys.root() });
    await Promise.all([customersQuery.refetch(), metricsQuery.refetch()]);
  };

  const mutate = useMutation({
    mutationFn: async ({ type, fields }) => {
      const customerId = selectedCustomer.id;
      switch (type) {
        case 'BASICS': return updateCustomerBasics({ customerId, fields: { nome: fields.nome, sexo: fields.sexo, motivo: fields.motivo } });
        case 'PHONE': return updateCustomerPhone({ customerId, fields: { telefone: fields.telefone, motivo: fields.motivo } });
        case 'SENSITIVE': return updateSensitiveData({ customerId, fields: { arquivo: fields.arquivo, cpf: fields.cpf, nascimento: fields.nascimento, motivo: fields.motivo } });
        case 'EMAIL_LINK': return sendCustomerEmailLink({ customerId, email: fields.email });
        case 'EMAIL_FORCE': return forceCustomerEmail({ customerId, fields: { email: fields.email, motivo: fields.motivo } });
        case 'PASSWORD_TEMP': return generateTemporaryPassword(customerId);
        case 'PASSWORD_LINK': return sendPasswordReset(customerId);
        case 'STATUS': return updateCustomerStatus({ customerId, fields: { acao: fields.acao, motivo: fields.motivo } });
        case 'WALLET': return addWalletTransaction({ customerId, fields: { tipo: fields.tipo, valor: fields.valor, motivo: fields.motivo } });
        case 'NOTES': return updateCustomerNotes({ customerId, notes: fields.notas });
        case 'TAGS': return updateCustomerTags({ customerId, tags: fields.tags.split(',').map((tag) => tag.trim()).filter(Boolean) });
        default: throw new Error('Ação não reconhecida.');
      }
    },
    onSuccess: async (response, variables) => {
      setAction(null);
      await refresh();
      const password = variables.type === 'PASSWORD_TEMP' ? response?.data?.password : null;
      setNotice({ tone: 'success', message: password ? `Senha provisória: ${password}. Guarde-a agora; ela não será mostrada novamente.` : 'Operação concluída e dados atualizados.' });
    },
  });

  const changeSection = (next) => {
    setSection(next);
    setSelectedId(null);
    setAction(null);
    setSearchParams({ section: next });
  };
  const openCustomer = (customer) => {
    setSection('CLIENTES');
    setSelectedId(String(customer.id));
    setSearchParams({ section: 'CLIENTES', id: String(customer.id) });
  };
  const closeCustomer = () => {
    setSelectedId(null);
    setAction(null);
    setSearchParams({ section: 'CLIENTES' });
  };
  const runAction = (type, fields) => mutate.mutateAsync({ type, fields });

  if (customersQuery.isError) return <section className="hub-surface hub-error-state" role="alert"><div><CircleAlert aria-hidden="true" size={28} /><h1 className="hub-panel-title">Não foi possível carregar os clientes</h1><p>Verifique a conexão e tente novamente. Nenhum dado foi alterado.</p><Button className="mt-5" icon={RefreshCw} onClick={() => customersQuery.refetch()}>Tentar novamente</Button></div></section>;

  if (selectedCustomer) return <>
    {notice ? <p className="hub-orders-notice" data-tone={notice.tone} role="status">{notice.message}</p> : null}
    <CustomerProfile customer={selectedCustomer} refreshing={customersQuery.isFetching} onBack={closeCustomer} onRefresh={refresh} onAction={setAction} />
    <CustomerActionDialog key={action || 'closed'} action={action} customer={selectedCustomer} loading={mutate.isPending} onClose={() => setAction(null)} onSubmit={runAction} />
  </>;

  return <>
    <PageHeader eyebrow="Relacionamento e retenção" title="Clientes" icon={UsersRound} description="Gerencie o relacionamento e ações sensíveis em uma visão auditável." actions={<Button variant="secondary" icon={RefreshCw} loading={customersQuery.isFetching} onClick={refresh}>Atualizar dados</Button>} />
    {notice ? <p className="hub-orders-notice" data-tone={notice.tone} role="status">{notice.message}</p> : null}
    <CustomerSections active={section} onChange={changeSection}>
      {section === 'PAINEL' ? <CustomersDashboard metrics={metricsQuery.data} onOpenDirectory={() => changeSection('CLIENTES')} /> : null}
      {section === 'CLIENTES' ? <CustomersList customers={customers} filters={filters} pagination={pagination} loading={customersQuery.isLoading || customersQuery.isFetching} onChange={(changes) => setFilters((current) => ({ ...current, ...changes }))} onClear={() => setFilters(initialFilters)} onOpen={openCustomer} /> : null}
      {section === 'VIP' ? <CustomerManagementPanels mode="VIP" vipLevels={vipQuery.data || []} loading={vipQuery.isFetching} onSaveVip={async (level) => { await saveVipLevel(level); await queryClient.invalidateQueries({ queryKey: adminQueryKeys.vipLevels() }); }} onDeleteVip={async (id) => { await deleteVipLevel(id); await queryClient.invalidateQueries({ queryKey: adminQueryKeys.vipLevels() }); }} /> : null}
      {section === 'CONFIG' ? <CustomerManagementPanels mode="CONFIG" settings={settingsQuery.data} loading={settingsQuery.isFetching} onSaveSettings={async (settings) => { await saveCrmSettings(settings); await queryClient.invalidateQueries({ queryKey: adminQueryKeys.crmSettings() }); setNotice({ tone: 'success', message: 'Configurações atualizadas.' }); }} /> : null}
    </CustomerSections>
  </>;
};
