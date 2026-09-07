import React, { useEffect, useState } from 'react';
import { AppWindow, BadgeCheck, Box, ChevronRight, CreditCard, FileKey2, LoaderCircle, MapPinned, PackageCheck, Settings2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';
import { Badge } from '../DesignSystem/primitives/Badge';
import { Button } from '../DesignSystem/primitives/Button';
import { SectionTabs } from '../DesignSystem/patterns/SectionTabs';
import './settings.css';

const TABS = [
  { value: 'APPS', label: 'Apps' },
  { value: 'LOGISTICS', label: 'Logística' },
  { value: 'PAYMENTS', label: 'Pagamentos' },
  { value: 'FISCAL', label: 'Fiscal' },
];

const emptyLogistics = { environment: 'SANDBOX', access_token: '' };

const emptyStripe = {
  active_environment: 'SANDBOX',
  sandbox_publishable_key: '',
  sandbox_secret_key: '',
  sandbox_webhook_secret: '',
  production_publishable_key: '',
  production_secret_key: '',
  production_webhook_secret: '',
};

const emptyFiscal = {
  legal_name: '',
  cnpj: '',
  state_registration: '',
  environment: 'HOMOLOGATION',
  provider: '',
  api_token: '',
  certificate_password: '',
};

const appEnvironmentLabel = (environment) => ({
  SANDBOX: 'Teste',
  HOMOLOGATION: 'Teste',
  PRODUCTION: 'Produção',
}[environment] || 'Não configurado');

const AppCard = ({ app, busy, onInstall, onOpen }) => {
  const Icon = app.key === 'stripe' ? CreditCard : app.key === 'fiscal' ? FileKey2 : PackageCheck;
  const configuration = app.configuration || {};
  const configured = Boolean(configuration.credential_configured);
  const actionLabel = app.location ? 'Abrir app' : app.installed ? 'Configurar' : 'Instalar';

  return (
    <article className="hub-app-card" data-installed={app.installed}>
      <header className="hub-app-card-header">
        <div className="hub-app-card-icon"><Icon aria-hidden="true" size={22} /></div>
        <div className="hub-app-card-meta">
          <Badge variant={app.installed ? 'success' : 'neutral'}>{app.installed ? 'Instalado' : 'Disponível'}</Badge>
          <Badge variant={configuration.environment === 'PRODUCTION' ? 'special' : 'info'}>{appEnvironmentLabel(configuration.environment)}</Badge>
        </div>
      </header>
      <div className="hub-app-card-content">
        <div>
          <h2>{app.name}</h2>
          <p>{app.description}</p>
        </div>
        {app.installed ? (
          <p className="hub-app-card-readiness">
            <ShieldCheck aria-hidden="true" size={16} />
            {configured ? 'Credencial registrada com segurança.' : 'Configuração pendente.'}
          </p>
        ) : null}
      </div>
      <footer className="hub-app-card-footer">
        <Button
          size="sm"
          variant={app.installed ? 'secondary' : 'primary'}
          icon={app.installed ? Settings2 : AppWindow}
          loading={busy}
          onClick={app.installed ? onOpen : onInstall}
        >
          {actionLabel}
        </Button>
      </footer>
    </article>
  );
};

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

const SettingsPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('APPS');
  const [apps, setApps] = useState([]);
  const [fiscal, setFiscal] = useState(emptyFiscal);
  const [logistics, setLogistics] = useState(emptyLogistics);
  const [stripe, setStripe] = useState(emptyStripe);
  const [stripeStatus, setStripeStatus] = useState({});
  const [preflight, setPreflight] = useState({});
  const [certificate, setCertificate] = useState(null);
  const [certificateMeta, setCertificateMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [appsResponse, fiscalResponse, logisticsResponse, stripeResponse] = await Promise.all([
        api.get('/admin/settings/apps'),
        api.get('/admin/settings/fiscal'),
        api.get('/admin/settings/logistics'),
        api.get('/admin/settings/stripe'),
      ]);
      setApps(Array.isArray(appsResponse.data) ? appsResponse.data : []);
      const issuer = fiscalResponse.data?.issuer || {};
      setFiscal((current) => ({ ...current, ...issuer }));
      setPreflight(fiscalResponse.data?.preflight || {});
      setCertificateMeta(fiscalResponse.data?.certificate || null);
      setLogistics((current) => ({ ...current, environment: logisticsResponse.data?.environment || 'SANDBOX', access_token: '' }));
      setStripe((current) => ({ ...current, active_environment: stripeResponse.data?.active_environment || 'SANDBOX' }));
      setStripeStatus(stripeResponse.data || {});
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
      setTab(app.key === 'fiscal' ? 'FISCAL' : app.key === 'logistics' ? 'LOGISTICS' : app.key === 'stripe' ? 'PAYMENTS' : 'APPS');
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

  const saveStripe = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      const response = await api.post('/admin/settings/stripe', stripe);
      setStripe((current) => ({ ...emptyStripe, active_environment: response.data?.active_environment || current.active_environment }));
      setStripeStatus(response.data || {});
      setNotice({ tone: 'success', text: 'Configuração do Stripe salva com segurança. O checkout permanece bloqueado até a homologação do webhook.' });
      await load();
    } catch (error) {
      setNotice({ tone: 'error', text: error?.response?.data?.message || 'Não foi possível salvar a configuração do Stripe.' });
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
          <span>Instale e configure capacidades por loja. Cada aplicativo opera em um único ambiente por vez e seus segredos permanecem protegidos.</span>
        </div>
      </header>

      <SectionTabs ariaLabel="Configurações" items={TABS} value={tab} onChange={setTab} />

      {notice ? <div className={`hub-settings-notice hub-settings-notice-${notice.tone}`}>{notice.text}</div> : null}

      {tab === 'APPS' ? (
        <section className="hub-settings-apps">
          <div className="hub-settings-section-heading">
            <div><h2>Apps da sua operação</h2><p>O catálogo mostra somente capacidades que a loja pode instalar e configurar agora. Gateways de pagamento entrarão após adapter, idempotência e webhook homologados.</p></div>
          </div>
          {apps.length ? (
            <div className="hub-app-grid">
              {apps.map((app) => (
                <AppCard key={app.key} app={app} busy={saving} onInstall={() => install(app)} onOpen={() => app.key === 'logistics' ? setTab('LOGISTICS') : app.key === 'stripe' ? setTab('PAYMENTS') : app.location ? navigate(app.location) : setTab('FISCAL')} />
              ))}
            </div>
          ) : (
            <section className="hub-empty-state hub-surface">
              <div><h2>Nenhum aplicativo disponível</h2><p>Quando a loja tiver um aplicativo liberado, ele aparecerá neste catálogo.</p></div>
            </section>
          )}
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
      ) : tab === 'PAYMENTS' ? (
        <form className="hub-fiscal-form hub-surface" onSubmit={saveStripe}>
          <header><span><CreditCard aria-hidden="true" size={20} /></span><div><h2>App Stripe</h2><p>As chaves de teste e de produção ficam separadas por loja. Nenhuma cobrança é liberada antes do webhook assinado.</p></div></header>
          <div className="hub-fiscal-readiness">
            <div><h2>Diagnóstico do Stripe</h2><p>As chaves nunca voltam ao navegador. Esta tela mostra apenas o estado de cada ambiente.</p></div>
            <ul>
              {['SANDBOX', 'PRODUCTION'].map((environment) => {
                const configured = stripeStatus?.environments?.[environment] || {};
                const ready = Boolean(configured.publishable_key_configured && configured.secret_key_configured);
                return <li key={environment}><span>{ready ? <BadgeCheck aria-hidden="true" size={18} /> : <Box aria-hidden="true" size={18} />}</span><div><strong>{environment === 'SANDBOX' ? 'Sandbox' : 'Produção'}</strong><small>{configured.webhook_secret_configured ? 'Webhook registrado; processamento ainda depende da próxima entrega.' : 'Webhook ainda não registrado.'}</small></div><Badge variant={ready ? 'success' : 'warning'}>{ready ? 'Chaves prontas' : 'Configuração pendente'}</Badge></li>;
              })}
            </ul>
          </div>
          <div className="hub-fiscal-fields">
            <label>Ambiente ativo<select value={stripe.active_environment} onChange={(event) => setStripe({ ...stripe, active_environment: event.target.value })}><option value="SANDBOX">Sandbox</option><option value="PRODUCTION">Produção</option></select><small>O ambiente escolhido será exigido pela tentativa de pagamento.</small></label>
          </div>
          <div className="hub-fiscal-layout">
            <section className="hub-fiscal-form hub-surface"><header><span><CreditCard aria-hidden="true" size={20} /></span><div><h2>Sandbox</h2><p>Use exclusivamente chaves iniciadas por pk_test_ e sk_test_.</p></div></header><div className="hub-fiscal-fields"><label>Chave publicável<input type="password" value={stripe.sandbox_publishable_key} onChange={(event) => setStripe({ ...stripe, sandbox_publishable_key: event.target.value })} placeholder="pk_test_..." /></label><label>Chave secreta<input type="password" value={stripe.sandbox_secret_key} onChange={(event) => setStripe({ ...stripe, sandbox_secret_key: event.target.value })} placeholder="sk_test_..." /></label><label>Segredo do webhook<input type="password" value={stripe.sandbox_webhook_secret} onChange={(event) => setStripe({ ...stripe, sandbox_webhook_secret: event.target.value })} placeholder="whsec_..." /></label></div></section>
            <section className="hub-fiscal-form hub-surface"><header><span><CreditCard aria-hidden="true" size={20} /></span><div><h2>Produção</h2><p>Use exclusivamente chaves iniciadas por pk_live_ e sk_live_.</p></div></header><div className="hub-fiscal-fields"><label>Chave publicável<input type="password" value={stripe.production_publishable_key} onChange={(event) => setStripe({ ...stripe, production_publishable_key: event.target.value })} placeholder="pk_live_..." /></label><label>Chave secreta<input type="password" value={stripe.production_secret_key} onChange={(event) => setStripe({ ...stripe, production_secret_key: event.target.value })} placeholder="sk_live_..." /></label><label>Segredo do webhook<input type="password" value={stripe.production_webhook_secret} onChange={(event) => setStripe({ ...stripe, production_webhook_secret: event.target.value })} placeholder="whsec_..." /></label></div></section>
          </div>
          <div className="hub-fiscal-form-footer"><ShieldCheck aria-hidden="true" size={17} /><p>Deixe um campo vazio para preservar a credencial já salva. Sem credencial configurada, o adapter retorna indisponibilidade segura.</p><Button type="submit" loading={saving} icon={ShieldCheck}>Salvar configuração</Button></div>
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
              <label>Ambiente<select value={fiscal.environment} onChange={(event) => setFiscal({ ...fiscal, environment: event.target.value })}><option value="HOMOLOGATION">Teste (homologação)</option><option value="PRODUCTION">Produção</option></select></label>
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

export default SettingsPage;