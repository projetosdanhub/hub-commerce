import React, { useEffect, useState } from 'react';
import { AppWindow, BadgeCheck, Box, ChevronRight, FileKey2, LoaderCircle, MapPinned, PackageCheck, Settings2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';
import { Badge } from '../DesignSystem/primitives/Badge';
import { Button } from '../DesignSystem/primitives/Button';
import { SectionTabs } from '../DesignSystem/patterns/SectionTabs';
import './Configuracoes.css';

const TABS = [
  { value: 'APPS', label: 'Apps' },
  { value: 'LOGISTICS', label: 'Logística' },
  { value: 'FISCAL', label: 'Fiscal' },
];

const emptyLogistics = { environment: 'SANDBOX', access_token: '' };

const emptyFiscal = {
  legal_name: '',
  cnpj: '',
  state_registration: '',
  environment: 'HOMOLOGATION',
  provider: '',
  api_token: '',
  certificate_password: '',
};

const AppCard = ({ app, busy, onInstall, onOpen }) => (
  <article className="hub-app-card">
    <div className="hub-app-card-icon">
      {app.key === 'fiscal' ? <FileKey2 aria-hidden="true" size={22} /> : <PackageCheck aria-hidden="true" size={22} />}
    </div>
    <div className="hub-app-card-content">
      <div>
        <h2>{app.name}</h2>
        <p>{app.description}</p>
      </div>
      <div className="hub-app-card-footer">
        <Badge variant={app.installed ? 'success' : 'neutral'}>{app.installed ? 'Instalado' : 'Disponível'}</Badge>
        {app.location ? (
          <Button size="sm" variant="secondary" icon={ChevronRight} onClick={onOpen}>Abrir</Button>
        ) : app.installed ? (
          <Button size="sm" variant="secondary" icon={Settings2} onClick={onOpen}>Configurar</Button>
        ) : (
          <Button size="sm" icon={AppWindow} loading={busy} onClick={onInstall}>Instalar</Button>
        )}
      </div>
    </div>
  </article>
);

const FiscalReadiness = ({ preflight = {} }) => {
  const catalog = preflight.catalog || {};
  const catalogDetail = Number(catalog.active_products || 0) > 0
    ? (catalog.incomplete_products || 0) + ' de ' + catalog.active_products + ' produto(s) ativo(s) com pendência'
    : 'Nenhum produto ativo no catálogo';

  const rows = [
    ['Dados do emitente', preflight.issuer, null],
    ['Certificado A1', preflight.certificate, null],
    ['Credencial do provedor', preflight.provider, null],
    ['Catálogo fiscal', Boolean(catalog.ready), catalogDetail],
    ['Adapter homologado', preflight.adapter_homologated, 'A emissão permanece bloqueada até a homologação real'],
  ];

  return (
    <div className="hub-fiscal-readiness">
      <div>
        <h2>Diagnóstico fiscal</h2>
        <p>A emissão permanece bloqueada até todos os requisitos e a homologação do adapter.</p>
      </div>
      <ul>
        {rows.map(([label, ready, detail]) => (
          <li key={label}>
            <span>{ready ? <BadgeCheck aria-hidden="true" size={18} /> : <Box aria-hidden="true" size={18} />}</span>
            <div>
              <strong>{label}</strong>
              {detail ? <small>{detail}</small> : null}
            </div>
            <Badge variant={ready ? 'success' : 'warning'}>{ready ? 'Pronto' : 'Pendente'}</Badge>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ConfiguracoesPrincipal = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('APPS');
  const [apps, setApps] = useState([]);
  const [fiscal, setFiscal] = useState(emptyFiscal);
  const [logistics, setLogistics] = useState(emptyLogistics);
  const [preflight, setPreflight] = useState({});
  const [certificate, setCertificate] = useState(null);
  const [certificateMeta, setCertificateMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [appsResponse, fiscalResponse, logisticsResponse] = await Promise.all([
        api.get('/admin/settings/apps'),
        api.get('/admin/settings/fiscal'),
        api.get('/admin/settings/logistics'),
      ]);
      setApps(Array.isArray(appsResponse.data) ? appsResponse.data : []);
      const issuer = fiscalResponse.data?.issuer || {};
      setFiscal((current) => ({ ...current, ...issuer }));
      setPreflight(fiscalResponse.data?.preflight || {});
      setCertificateMeta(fiscalResponse.data?.certificate || null);
      setLogistics((current) => ({ ...current, environment: logisticsResponse.data?.environment || 'SANDBOX', access_token: '' }));
    } catch {
      setNotice({ tone: 'error', text: 'Não foi possível carregar as configurações desta loja.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const install = async (app) => {
    setSaving(true);
    try {
      await api.post(`/admin/settings/apps/${app.key}/install`);
      await load();
      setTab(app.key === 'fiscal' ? 'FISCAL' : 'APPS');
    } catch {
      setNotice({ tone: 'error', text: 'Não foi possível instalar este app.' });
    } finally {
      setSaving(false);
    }
  };

  const saveLogistics = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      await api.post('/admin/settings/logistics', logistics);
      setLogistics((current) => ({ ...current, access_token: '' }));
      setNotice({ tone: 'success', text: 'Configuração logística salva com segurança.' });
      await load();
    } catch (error) {
      setNotice({ tone: 'error', text: error?.response?.data?.message || 'Não foi possível salvar a configuração logística.' });
    } finally {
      setSaving(false);
    }
  };

  const saveFiscal = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      const form = new FormData();
      Object.entries(fiscal).forEach(([key, value]) => form.append(key, value || ''));
      if (certificate) form.append('certificate', certificate);
      const response = await api.post('/admin/settings/fiscal', form);
      setPreflight(response.data?.preflight || {});
      setCertificateMeta(response.data?.certificate || null);
      setCertificate(null);
      setNotice({ tone: 'success', text: 'Configuração fiscal salva com segurança.' });
      await load();
    } catch (error) {
      setNotice({ tone: 'error', text: error?.response?.data?.message || 'Não foi possível salvar a configuração fiscal.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="hub-stable-data-region hub-settings-loading"><LoaderCircle aria-label="Carregando configurações" className="hub-spin" /></div>;

  return (
    <main className="hub-settings-page">
      <header className="hub-settings-heading">
        <div>
          <p>Configurações</p>
          <h1>Centro de Apps</h1>
          <span>Instale e configure capacidades por loja, com permissões e credenciais protegidas.</span>
        </div>
      </header>

      <SectionTabs ariaLabel="Configurações" items={TABS} value={tab} onChange={setTab} />

      {notice ? <div className={`hub-settings-notice hub-settings-notice-${notice.tone}`}>{notice.text}</div> : null}

      {tab === 'APPS' ? (
        <section className="hub-settings-apps">
          <div className="hub-settings-section-heading">
            <div><h2>Apps da sua operação</h2><p>Logística fica na Central de Logística & Envios; fiscal é configurado por loja.</p></div>
          </div>
          <div className="hub-app-grid">
            {apps.map((app) => (
              <AppCard key={app.key} app={app} busy={saving} onInstall={() => install(app)} onOpen={() => app.key === 'logistics' ? setTab('LOGISTICS') : app.location ? navigate(app.location) : setTab('FISCAL')} />
            ))}
          </div>
        </section>
      ) : tab === 'LOGISTICS' ? (
        <form className="hub-fiscal-form hub-surface" onSubmit={saveLogistics}>
          <header><span><PackageCheck aria-hidden="true" size={20} /></span><div><h2>App Melhor Envio</h2><p>Ative sandbox para testes ou produção para operar. Cada ambiente exige seu próprio token.</p></div></header>
          <div className="hub-fiscal-fields">
            <label>Ambiente<select value={logistics.environment} onChange={(event) => setLogistics({ ...logistics, environment: event.target.value })}><option value="SANDBOX">Sandbox</option><option value="PRODUCTION">Produção</option></select></label>
            <label>Token do Melhor Envio<input type="password" value={logistics.access_token} onChange={(event) => setLogistics({ ...logistics, access_token: event.target.value })} placeholder="Informe o token deste ambiente" /><small>O token não é exibido depois de salvo. Ao mudar de ambiente, informe a credencial correspondente.</small></label>
          </div>
          <div className="hub-fiscal-form-footer"><MapPinned aria-hidden="true" size={17} /><p>Remetente, embalagens e etiquetas continuam na Central de Logística & Envios.</p><Button type="submit" loading={saving} icon={ShieldCheck}>Salvar configuração</Button></div>
        </form>
      ) : (
        <div className="hub-fiscal-layout">
          <FiscalReadiness preflight={preflight} />
          <form className="hub-fiscal-form hub-surface" onSubmit={saveFiscal}>
            <header><span><ShieldCheck aria-hidden="true" size={20} /></span><div><h2>App Fiscal</h2><p>Os segredos não voltam para o navegador após o salvamento.</p></div></header>
            <div className="hub-fiscal-fields">
              <label>Razão social<input required value={fiscal.legal_name} onChange={(event) => setFiscal({ ...fiscal, legal_name: event.target.value })} /></label>
              <label>CNPJ<input required value={fiscal.cnpj} onChange={(event) => setFiscal({ ...fiscal, cnpj: event.target.value })} /></label>
              <label>Inscrição estadual<input required value={fiscal.state_registration} onChange={(event) => setFiscal({ ...fiscal, state_registration: event.target.value })} /></label>
              <label>Ambiente<select value={fiscal.environment} onChange={(event) => setFiscal({ ...fiscal, environment: event.target.value })}><option value="HOMOLOGATION">Homologação</option><option value="PRODUCTION">Produção</option></select></label>
              <label>Provedor fiscal<input value={fiscal.provider} onChange={(event) => setFiscal({ ...fiscal, provider: event.target.value })} placeholder="Ex.: provedor contratado" /></label>
              <label>Token do provedor<input type="password" value={fiscal.api_token} onChange={(event) => setFiscal({ ...fiscal, api_token: event.target.value })} placeholder="Deixe vazio para manter o atual" /></label>
              <label>Certificado A1 (PFX/P12)<input type="file" accept=".pfx,.p12,application/x-pkcs12" onChange={(event) => setCertificate(event.target.files?.[0] || null)} /><small>{certificateMeta?.configured ? `Configurado: ${certificateMeta.name}` : 'Nenhum certificado configurado'}</small></label>
              <label>Senha do certificado<input type="password" value={fiscal.certificate_password} onChange={(event) => setFiscal({ ...fiscal, certificate_password: event.target.value })} placeholder="Deixe vazio para manter a atual" /></label>
            </div>
            <div className="hub-fiscal-form-footer"><MapPinned aria-hidden="true" size={17} /><p>Produtos ainda precisam de dados fiscais completos. A emissão só será habilitada após homologação do adapter.</p><Button type="submit" loading={saving} icon={FileKey2}>Salvar configuração</Button></div>
          </form>
        </div>
      )}
    </main>
  );
};

export default ConfiguracoesPrincipal;
