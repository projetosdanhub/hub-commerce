import React, { useState } from 'react';
import { Building2, CircleCheck, MapPin, PackageCheck, Save, ShieldCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../api';
import { Badge } from '../DesignSystem/primitives/Badge';
import { Button } from '../DesignSystem/primitives/Button';
import { Skeleton } from '../DesignSystem/primitives/Skeleton';
import { ProviderOAuthPanel } from './ProviderOAuthPanel';

const emptySender = { nome: '', documento: '', email: '', telefone: '', cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' };

const LogisticsSkeleton = () => <section className="hub-settings-form hub-surface" aria-busy="true" aria-label="Carregando configuração logística"><Skeleton className="hub-settings-skeleton-title" /><div className="hub-settings-fields"><Skeleton /><Skeleton /><Skeleton /><Skeleton /></div></section>;

const SenderForm = ({ sender, saving, onChange, onSave }) => (
  <form className="hub-settings-form hub-surface" onSubmit={onSave}>
    <header><span><Building2 aria-hidden="true" size={20} /></span><div><h2>Remetente e endereço de despacho</h2><p>Estes dados são enviados ao Melhor Envio para cálculo e emissão de etiquetas. Informe apenas dados reais da operação.</p></div></header>
    <div className="hub-settings-fields">
      <label>Nome ou razão social<input required value={sender.nome} onChange={(event) => onChange({ ...sender, nome: event.target.value })} /></label>
      <label>CPF ou CNPJ<input required value={sender.documento} onChange={(event) => onChange({ ...sender, documento: event.target.value })} /></label>
      <label>E-mail<input type="email" required value={sender.email} onChange={(event) => onChange({ ...sender, email: event.target.value })} /></label>
      <label>Telefone<input required value={sender.telefone} onChange={(event) => onChange({ ...sender, telefone: event.target.value })} /></label>
      <label>CEP<input inputMode="numeric" maxLength="8" required value={sender.cep} onChange={(event) => onChange({ ...sender, cep: event.target.value.replace(/\D/g, '') })} /></label>
      <label>Logradouro<input required value={sender.rua} onChange={(event) => onChange({ ...sender, rua: event.target.value })} /></label>
      <label>Número<input required value={sender.numero} onChange={(event) => onChange({ ...sender, numero: event.target.value })} /></label>
      <label>Complemento<input value={sender.complemento} onChange={(event) => onChange({ ...sender, complemento: event.target.value })} /></label>
      <label>Bairro<input required value={sender.bairro} onChange={(event) => onChange({ ...sender, bairro: event.target.value })} /></label>
      <label>Cidade<input required value={sender.cidade} onChange={(event) => onChange({ ...sender, cidade: event.target.value })} /></label>
      <label>UF<input required maxLength="2" value={sender.uf} onChange={(event) => onChange({ ...sender, uf: event.target.value.toUpperCase() })} /></label>
    </div>
    <footer className="hub-settings-form-footer"><MapPin aria-hidden="true" size={17} /><p>O endereço é salvo por loja e só fica disponível depois de a conta do Melhor Envio estar conectada.</p><Button type="submit" loading={saving} icon={Save}>Salvar remetente</Button></footer>
  </form>
);

export const LogisticsConfiguration = ({ defaultEnvironment }) => {
  const [connection, setConnection] = useState(null);
  const [senderDraft, setSenderDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const settingsQuery = useQuery({ queryKey: ['adminMelhorEnvioSettings'], queryFn: async () => (await api.get('/admin/melhorenvio/settings')).data });
  const connected = connection?.status === 'CONNECTED';
  const sender = senderDraft || { ...emptySender, ...(settingsQuery.data?.data?.sender_info || {}) };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      await api.post('/admin/melhorenvio/sender', sender);
      setSenderDraft(null);
      setNotice({ tone: 'success', text: 'Remetente atualizado com segurança.' });
      await settingsQuery.refetch();
    } catch (error) {
      setNotice({ tone: 'error', text: error?.response?.data?.message || 'Não foi possível salvar o remetente.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="hub-settings-gateways hub-stable-data-region">
      <header className="hub-settings-section-heading"><div><h2>Melhor Envio</h2><p>Conecte a conta por OAuth e, após a autorização, configure o remetente usado no despacho.</p></div><Badge variant={connected ? 'success' : 'warning'}>{connected ? 'Conta conectada' : 'Conexão pendente'}</Badge></header>
      <ProviderOAuthPanel provider="melhor_envio" name="Melhor Envio" fallbackIcon={PackageCheck} defaultEnvironment={defaultEnvironment} description="A autorização OAuth 2.0 é a única forma de conectar a conta. Tokens nunca são copiados ou exibidos." onStatusChange={setConnection} />
      {notice ? <div className={'hub-settings-notice hub-settings-notice-' + notice.tone} role="status">{notice.text}</div> : null}
      {settingsQuery.isLoading ? <LogisticsSkeleton /> : settingsQuery.isError ? <section className="hub-integration-unavailable hub-surface"><h2>Não foi possível carregar a configuração</h2><p>Atualize a página para consultar os dados de logística desta loja.</p></section> : connected ? <SenderForm sender={sender} saving={saving} onChange={setSenderDraft} onSave={save} /> : <section className="hub-integration-unavailable hub-surface"><CircleCheck aria-hidden="true" size={20} /><h2>Conecte a conta para continuar</h2><p>O endereço de despacho e demais dados do remetente só podem ser configurados após a autorização OAuth concluída.</p><ShieldCheck aria-hidden="true" size={18} /></section>}
    </section>
  );
};
