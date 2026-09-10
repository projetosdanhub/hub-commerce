import React, { useCallback, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Box, History, Plus, Truck } from 'lucide-react';
import api from '../../../api';
import { Button } from '../DesignSystem/primitives/Button';
import { ModalDialog } from '../DesignSystem/patterns/ModalDialog';
import { SectionTabs } from '../DesignSystem/patterns/SectionTabs';
import { useRegisterAdminPageRefresh } from '../DesignSystem/patterns/GlobalPageRefresh';
import { CarrierAuditTab } from './CarrierAuditTab';
import { CarrierForm } from './CarrierForm';
import { CarrierList } from './CarrierList';
import { PackageForm } from './PackageForm';
import { PackageList } from './PackageList';
import './carriers.css';

const tabs = [
  { value: 'CARRIERS', label: 'Parceiros próprios', icon: Truck },
  { value: 'PACKAGES', label: 'Embalagens', icon: Box },
  { value: 'AUDIT', label: 'Auditoria', icon: History },
];

const queryKeys = { carriers: ['adminCarriers'], packages: ['adminShippingPackages'] };

export default function CarriersPage() {
  const client = useQueryClient();
  const [tab, setTab] = useState('CARRIERS');
  const [view, setView] = useState('LIST');
  const [selectedCarrier, setSelectedCarrier] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [statusReason, setStatusReason] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [notice, setNotice] = useState(null);

  const carriersQuery = useQuery({ queryKey: queryKeys.carriers, queryFn: async () => (await api.get('/admin/carriers')).data, enabled: tab === 'CARRIERS' || view === 'CARRIER_FORM' });
  const packagesQuery = useQuery({ queryKey: queryKeys.packages, queryFn: async () => (await api.get('/admin/shipping-packages')).data, enabled: tab === 'PACKAGES' || view === 'PACKAGE_FORM' });
  const refresh = useCallback(async () => { await Promise.all([client.refetchQueries({ queryKey: queryKeys.carriers }), client.refetchQueries({ queryKey: queryKeys.packages })]); }, [client]);
  useRegisterAdminPageRefresh(refresh);

  const saved = (message, key) => { client.invalidateQueries({ queryKey: key }); setNotice({ tone: 'success', text: message }); setView('LIST'); };
  const carrierSave = useMutation({ mutationFn: (data) => api.post('/admin/carriers', data), onSuccess: () => saved('Transportadora salva com sucesso.', queryKeys.carriers), onError: () => setNotice({ tone: 'error', text: 'Não foi possível salvar a transportadora.' }) });
  const packageSave = useMutation({ mutationFn: (data) => api.post('/admin/shipping-packages', data), onSuccess: () => saved('Embalagem salva com sucesso.', queryKeys.packages), onError: () => setNotice({ tone: 'error', text: 'Não foi possível salvar a embalagem.' }) });
  const statusChange = useMutation({ mutationFn: ({ id, data }) => api.post('/admin/carriers/' + id + '/status', data), onSuccess: () => { client.invalidateQueries({ queryKey: queryKeys.carriers }); setStatusTarget(null); setStatusReason(''); setNotice({ tone: 'success', text: 'Status atualizado com sucesso.' }); }, onError: (error) => setNotice({ tone: 'error', text: error?.response?.data?.message || 'Não foi possível atualizar o status.' }) });
  const remove = useMutation({ mutationFn: ({ type, id }) => api.delete(type === 'carrier' ? '/admin/carriers/' + id : '/admin/shipping-packages/' + id), onSuccess: (_, item) => { client.invalidateQueries({ queryKey: item.type === 'carrier' ? queryKeys.carriers : queryKeys.packages }); setDeleteTarget(null); setNotice({ tone: 'success', text: item.type === 'carrier' ? 'Transportadora excluída.' : 'Embalagem excluída.' }); }, onError: (error) => setNotice({ tone: 'error', text: error?.response?.data?.message || 'Não foi possível concluir a exclusão.' }) });

  const carriers = useMemo(() => Array.isArray(carriersQuery.data?.data) ? carriersQuery.data.data : [], [carriersQuery.data]);
  const packages = useMemo(() => Array.isArray(packagesQuery.data?.data) ? packagesQuery.data.data : [], [packagesQuery.data]);
  const beginCarrier = (carrier = null) => { setSelectedCarrier(carrier); setView('CARRIER_FORM'); };
  const beginPackage = (item = null) => { setSelectedPackage(item); setView('PACKAGE_FORM'); };
  const returnToList = () => { setView('LIST'); setSelectedCarrier(null); setSelectedPackage(null); };
  const openStatus = (carrier) => { setStatusTarget(carrier); setStatusReason(''); };
  const newAction = tab === 'CARRIERS' ? () => beginCarrier() : () => beginPackage();

  const title = view === 'CARRIER_FORM' ? (selectedCarrier ? 'Editar transportadora' : 'Nova transportadora') : view === 'PACKAGE_FORM' ? (selectedPackage ? 'Editar embalagem' : 'Nova embalagem') : 'Transportadoras';
  const description = view !== 'LIST' ? 'Os campos preservam o contrato atual e os documentos continuam privados.' : 'Gerencie parceiros próprios e embalagens. A conexão do Melhor Envio é configurada em Configurações → Logística.';

  return (
    <main className="hub-carriers-page">
      <Helmet><title>{title} | Hub Commerce</title><meta name="robots" content="noindex,nofollow" /></Helmet>
      <header className="hub-carriers-heading"><div><p className="hub-carriers-eyebrow">Logística</p><h1>{title}</h1><p>{description}</p></div>{view === 'LIST' && tab !== 'AUDIT' ? <Button icon={Plus} onClick={newAction}>{tab === 'CARRIERS' ? 'Nova transportadora' : 'Nova embalagem'}</Button> : view !== 'LIST' ? <Button variant="secondary" icon={ArrowLeft} onClick={returnToList}>Voltar</Button> : null}</header>
      {notice ? <div className={'hub-settings-notice hub-settings-notice-' + notice.tone} role="status">{notice.text}</div> : null}
      {view === 'CARRIER_FORM' ? <CarrierForm key={selectedCarrier?.id || 'new-carrier'} carrier={selectedCarrier} saving={carrierSave.isPending} onCancel={returnToList} onSave={carrierSave.mutate} /> : null}
      {view === 'PACKAGE_FORM' ? <PackageForm key={selectedPackage?.id || 'new-package'} item={selectedPackage} saving={packageSave.isPending} onCancel={returnToList} onSave={packageSave.mutate} /> : null}
      {view === 'LIST' ? <><SectionTabs ariaLabel="Seções de transportadoras" items={tabs} value={tab} onChange={setTab} />
        {tab === 'CARRIERS' ? <section className="hub-carriers-surface hub-stable-data-region"><header className="hub-carriers-section-heading"><div><h2><Truck aria-hidden="true" size={19} /> Parceiros próprios</h2><p>Cadastre somente transportadoras contratadas diretamente pela loja. Isso não configura o Melhor Envio.</p></div></header><CarrierList carriers={carriers} loading={carriersQuery.isLoading} onEdit={beginCarrier} onDelete={(carrier) => setDeleteTarget({ type: 'carrier', item: carrier })} onChangeStatus={openStatus} /></section> : null}
        {tab === 'PACKAGES' ? <section className="hub-carriers-surface hub-stable-data-region"><header className="hub-carriers-section-heading"><div><h2><Box aria-hidden="true" size={19} /> Embalagens</h2><p>Use dimensões e peso físicos para apoiar a cotação e o despacho.</p></div></header><PackageList packages={packages} loading={packagesQuery.isLoading} onEdit={beginPackage} onDelete={(item) => setDeleteTarget({ type: 'package', item })} /></section> : null}
        {tab === 'AUDIT' ? <CarrierAuditTab /> : null}</> : null}
      {statusTarget ? <ModalDialog labelledBy="carrier-status-title" describedBy="carrier-status-copy" onClose={() => setStatusTarget(null)} busy={statusChange.isPending}>{(close) => <section className="hub-carriers-dialog"><h2 id="carrier-status-title">{statusTarget.status === 'ATIVA' ? 'Desativar' : 'Reativar'} {statusTarget.nome}?</h2><p id="carrier-status-copy">O motivo é obrigatório e será registrado na auditoria operacional.</p><textarea aria-label="Motivo da alteração de status" value={statusReason} onChange={(event) => setStatusReason(event.target.value)} required /><div className="hub-carriers-dialog-actions"><Button variant="secondary" onClick={close}>Cancelar</Button><Button loading={statusChange.isPending} disabled={!statusReason.trim()} onClick={() => statusChange.mutate({ id: statusTarget.id, data: { status: statusTarget.status === 'ATIVA' ? 'INATIVA' : 'ATIVA', status_reason: statusReason.trim() } })}>Confirmar</Button></div></section>}</ModalDialog> : null}
      {deleteTarget ? <ModalDialog labelledBy="carrier-delete-title" describedBy="carrier-delete-copy" onClose={() => setDeleteTarget(null)} busy={remove.isPending}>{(close) => <section className="hub-carriers-dialog"><h2 id="carrier-delete-title">Excluir {deleteTarget.item.nome}?</h2><p id="carrier-delete-copy">Esta ação remove o cadastro permanentemente. Transportadoras com pedidos vinculados não podem ser excluídas.</p><div className="hub-carriers-dialog-actions"><Button variant="secondary" onClick={close}>Cancelar</Button><Button variant="danger" loading={remove.isPending} onClick={() => remove.mutate({ type: deleteTarget.type, id: deleteTarget.item.id })}>Excluir</Button></div></section>}</ModalDialog> : null}
    </main>
  );
}
