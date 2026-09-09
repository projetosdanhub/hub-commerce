import React, { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, Box, CreditCard, FileKey2, MapPinned, PackageCheck, Search, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import api from '../../../api';
import { Badge } from '../DesignSystem/primitives/Badge';
import { Button } from '../DesignSystem/primitives/Button';
import { Skeleton } from '../DesignSystem/primitives/Skeleton';
import { AppOperationProgress, IntegrationInstallCard } from '../DesignSystem/patterns/IntegrationInstallCard';
import { IntegrationLogo } from '../DesignSystem/patterns/IntegrationLogo';
import { ModalDialog } from '../DesignSystem/patterns/ModalDialog';
import { SectionTabs } from '../DesignSystem/patterns/SectionTabs';
import './settings.css';

const TABS = [
  { value: 'APPS', label: 'Apps' },
  { value: 'LOGISTICS', label: 'Logística' },
  { value: 'GATEWAYS', label: 'Gateways' },
  { value: 'FISCAL', label: 'Fiscal' },
];

const APP_CATEGORIES = [
  { value: 'ALL', label: 'Todos os apps' },
  { value: 'LOGISTICS', label: 'Logística' },
  { value: 'GATEWAYS', label: 'Gateways' },
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

const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

const SettingsSkeleton = () => (
  <main className="hub-settings-page" aria-busy="true" aria-label="Carregando configurações">
    <header className="hub-settings-heading">
      <Skeleton className="hub-settings-skeleton-title" />
      <Skeleton className="hub-settings-skeleton-copy" />
    </header>
    <div className="hub-settings-skeleton-tabs"><Skeleton /><Skeleton /><Skeleton /><Skeleton /></div>
    <section className="hub-app-grid hub-stable-data-region">
      {Array.from({ length: 4 }, (_, index) => (
        <article className="hub-integration-card hub-integration-card-skeleton" key={index}>
          <Skeleton className="hub-settings-skeleton-icon" />
          <Skeleton className="hub-settings-skeleton-name" />
          <Skeleton className="hub-settings-skeleton-copy" />
          <Skeleton className="hub-settings-skeleton-action" />
        </article>
      ))}
    </section>
  </main>
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
    <section className="hub-fiscal-readiness">
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
    </section>
  );
};

const StripeConfiguration = ({ stripe, stripeStatus, saving, onChange, onSubmit }) => (
  <form className="hub-settings-form hub-surface" onSubmit={onSubmit}>
    <header>
      <IntegrationLogo name="stripe" fallbackIcon={CreditCard} iconSize={20} />
      <div>
        <h2>Stripe</h2>
        <p>As chaves de teste e produção ficam separadas por loja. O pagamento continua pendente até a entrega autenticada do webhook.</p>
      </div>
    </header>
    <div className="hub-fiscal-readiness">
      <div><h2>Diagnóstico do Stripe</h2><p>As chaves nunca retornam ao navegador; esta tela mostra somente o estado de cada ambiente.</p></div>
      <ul>
        {['SANDBOX', 'PRODUCTION'].map((environment) => {
          const configured = stripeStatus?.environments?.[environment] || {};
          const ready = Boolean(configured.publishable_key_configured && configured.secret_key_configured);
          return (
            <li key={environment}>
              <span>{ready ? <BadgeCheck aria-hidden="true" size={18} /> : <Box aria-hidden="true" size={18} />}</span>
              <div>
                <strong>{environment === 'SANDBOX' ? 'Sandbox' : 'Produção'}</strong>
                <small>{configured.webhook_secret_configured ? 'Webhook registrado; aguarda entrega válida.' : 'Webhook ainda não registrado.'}</small>
              </div>
              <Badge variant={ready ? 'success' : 'warning'}>{ready ? 'Chaves prontas' : 'Pendente'}</Badge>
            </li>
          );
        })}
      </ul>
    </div>
    <div className="hub-settings-fields">
      <label>Ambiente ativo
        <select value={stripe.active_environment} onChange={(event) => onChange({ ...stripe, active_environment: event.target.value })}>
          <option value="SANDBOX">Sandbox</option>
          <option value="PRODUCTION">Produção</option>
        </select>
        <small>O ambiente escolhido é obrigatório para a tentativa de pagamento.</small>
      </label>
    </div>
    <div className="hub-settings-form-grid">
      <section className="hub-settings-form hub-surface">
        <header><IntegrationLogo name="stripe" fallbackIcon={CreditCard} iconSize={20} /><div><h2>Sandbox</h2><p>Use somente chaves <code>pk_test_</code> e <code>sk_test_</code>.</p></div></header>
        <div className="hub-settings-fields">
          <label>Chave publicável<input type="password" value={stripe.sandbox_publishable_key} onChange={(event) => onChange({ ...stripe, sandbox_publishable_key: event.target.value })} placeholder="pk_test_..." /></label>
          <label>Chave secreta<input type="password" value={stripe.sandbox_secret_key} onChange={(event) => onChange({ ...stripe, sandbox_secret_key: event.target.value })} placeholder="sk_test_..." /></label>
          <label>Segredo do webhook<input type="password" value={stripe.sandbox_webhook_secret} onChange={(event) => onChange({ ...stripe, sandbox_webhook_secret: event.target.value })} placeholder="whsec_..." /></label>
        </div>
      </section>
      <section className="hub-settings-form hub-surface">
        <header><IntegrationLogo name="stripe" fallbackIcon={CreditCard} iconSize={20} /><div><h2>Produção</h2><p>Use somente chaves <code>pk_live_</code> e <code>sk_live_</code>.</p></div></header>
        <div className="hub-settings-fields">
          <label>Chave publicável<input type="password" value={stripe.production_publishable_key} onChange={(event) => onChange({ ...stripe, production_publishable_key: event.target.value })} placeholder="pk_live_..." /></label>
          <label>Chave secreta<input type="password" value={stripe.production_secret_key} onChange={(event) => onChange({ ...stripe, production_secret_key: event.target.value })} placeholder="sk_live_..." /></label>
          <label>Segredo do webhook<input type="password" value={stripe.production_webhook_secret} onChange={(event) => onChange({ ...stripe, production_webhook_secret: event.target.value })} placeholder="whsec_..." /></label>
        </div>
      </section>
    </div>
    <footer className="hub-settings-form-footer">
      <ShieldCheck aria-hidden="true" size={17} />
      <p>Deixe um campo vazio para preservar a credencial já salva. Sem credencial válida, o adapter retorna indisponibilidade segura.</p>
      <Button type="submit" loading={saving} icon={ShieldCheck}>Salvar configuração</Button>
    </footer>
  </form>
);

const SettingsPage = () => {
  const [tab, setTab] = useState('APPS');
  const [appCategory, setAppCategory] = useState('ALL');
  const [appSearch, setAppSearch] = useState('');
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
  const [operationState, setOperationState] = useState(null);
  const [selectedGateway, setSelectedGateway] = useState('stripe');
  const [uninstallTarget, setUninstallTarget] = useState(null);
  const [notice, setNotice] = useState(null);

  const loadApps = async () => {
    const response = await api.get('/admin/settings/apps');
    const nextApps = Array.isArray(response.data) ? response.data : [];
    setApps(nextApps);

    return nextApps;
  };

  const load = async () => {
    setLoading(true);
    try {
      const nextApps = await loadApps();
      const isInstalled = (key) => nextApps.some((app) => app.key === key && app.installed);
      const [fiscalResponse, logisticsResponse, stripeResponse] = await Promise.all([
        isInstalled('fiscal') ? api.get('/admin/settings/fiscal') : Promise.resolve({ data: {} }),
        isInstalled('logistics') ? api.get('/admin/settings/logistics') : Promise.resolve({ data: {} }),
        isInstalled('stripe') ? api.get('/admin/settings/stripe') : Promise.resolve({ data: {} }),
      ]);
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

  const filteredInstalledApps = useMemo(() => apps.filter((app) => app.installed), [apps]);
  const visibleApps = useMemo(() => {
    const query = appSearch.trim().toLocaleLowerCase('pt-BR');

    return apps.filter((app) => {
      const matchesCategory = appCategory === 'ALL' || app.category === appCategory;
      const searchable = [app.name, app.description, app.category_label, app.auth_strategy]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('pt-BR');

      return matchesCategory && (!query || searchable.includes(query));
    });
  }, [apps, appCategory, appSearch]);
  const availableTabs = useMemo(() => TABS.filter((item) => {
    if (item.value === 'APPS') return true;

    const category = item.value === 'LOGISTICS' ? 'LOGISTICS' : item.value;
    return filteredInstalledApps.some((app) => app.category === category);
  }), [filteredInstalledApps]);
  const activeTab = availableTabs.some((item) => item.value === tab) ? tab : 'APPS';
  const activeGateway = useMemo(
    () => apps.find((app) => app.key === selectedGateway && app.installed)
      || apps.find((app) => app.category === 'GATEWAYS' && app.installed),
    [apps, selectedGateway],
  );

  const changeAppCategory = (event) => {
    setAppCategory(event.target.value);
  };

  const runAppOperation = async (app, kind) => {
    const startedAt = Date.now();
    const isUninstall = kind === 'UNINSTALL';
    setNotice(null);
    setOperationState({ key: app.key, kind, stage: isUninstall ? 'REMOVING' : 'PREPARING', progress: 8 });
    const phaseTimer = window.setTimeout(() => {
      setOperationState((current) => (
        current?.key === app.key
          ? { ...current, stage: isUninstall ? 'REMOVING' : 'INSTALLING', progress: Math.max(current.progress, 32) }
          : current
      ));
    }, 180);
    const timer = window.setInterval(() => {
      setOperationState((current) => (
        current?.key === app.key
          ? { ...current, progress: Math.min(current.progress + 7, 90) }
          : current
      ));
    }, 110);

    try {
      if (isUninstall) {
        await api.delete('/admin/settings/apps/' + app.key + '/install');
      } else {
        await api.post('/admin/settings/apps/' + app.key + '/install');
      }

      window.clearInterval(timer);
      window.clearTimeout(phaseTimer);
      setOperationState({ key: app.key, kind, stage: 'COMPLETE', progress: 100 });
      await wait(Math.max(0, 650 - (Date.now() - startedAt)));
      await loadApps();
      setNotice({
        tone: 'success',
        text: isUninstall
          ? app.name + ' foi desinstalado. As credenciais protegidas foram preservadas para uma futura reinstalação.'
          : app.name + ' foi instalado. Configure o aplicativo para concluir a ativação.',
      });

      return true;
    } catch (error) {
      setNotice({ tone: 'error', text: error?.response?.data?.message || `Não foi possível ${isUninstall ? 'desinstalar' : 'instalar'} este aplicativo.` });

      return false;
    } finally {
      window.clearInterval(timer);
      window.clearTimeout(phaseTimer);
      setOperationState(null);
    }
  };

  const install = (app) => runAppOperation(app, 'INSTALL');
  const confirmUninstall = async () => {
    if (!uninstallTarget) return;

    setSaving(true);
    const completed = await runAppOperation(uninstallTarget, 'UNINSTALL');
    if (completed) setUninstallTarget(null);
    setSaving(false);
  };

  const configure = (app) => {
    if (app.key === 'logistics') {
      setTab('LOGISTICS');
      return;
    }
    if (app.key === 'fiscal') {
      setTab('FISCAL');
      return;
    }
    setSelectedGateway(app.key);
    setTab('GATEWAYS');
  };

  const saveLogistics = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      await api.post('/admin/settings/logistics', logistics);
      setLogistics((current) => ({ ...current, access_token: '' }));
      setNotice({ tone: 'success', text: 'Configuração logística salva com segurança.' });
      await loadApps();
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
      setNotice({ tone: 'success', text: 'Configuração do Stripe salva com segurança. O pagamento continua pendente até o webhook assinado e idempotente.' });
      await loadApps();
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
      await loadApps();
    } catch (error) {
      setNotice({ tone: 'error', text: error?.response?.data?.message || 'Não foi possível salvar a configuração fiscal.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <SettingsSkeleton />;

  return (
    <main className="hub-settings-page">
      <header className="hub-settings-heading">
        <div>
          <p>Configurações</p>
          <h1>Central de Apps</h1>
          <span>Instale capacidades por loja e configure cada integração com segurança. O catálogo e os formulários preservam a altura do painel durante cada estado.</span>
        </div>
      </header>

      <SectionTabs ariaLabel="Configurações" items={availableTabs} value={activeTab} onChange={setTab} />
      {notice ? <div className={'hub-settings-notice hub-settings-notice-' + notice.tone} role="status">{notice.text}</div> : null}

      {activeTab === 'APPS' ? (
        <>
          <AppGuides />
          <section className="hub-settings-apps hub-stable-data-region">
          <header className="hub-settings-section-heading">
            <div><h2>Catálogo da operação</h2><p>Instalações ficam isoladas por loja. O progresso confirma a operação no servidor antes de liberar a configuração.</p></div>
            <div className="hub-settings-catalog-controls">
              <label className="hub-settings-search">
                <Search aria-hidden="true" size={16} />
                <span>Buscar aplicativo</span>
                <input value={appSearch} onChange={(event) => setAppSearch(event.target.value)} placeholder="Nome, categoria ou conexão" />
              </label>
              <label className="hub-settings-filter">
                <SlidersHorizontal aria-hidden="true" size={16} />
                <span>Categoria</span>
                <select value={appCategory} onChange={changeAppCategory}>
                  {APP_CATEGORIES.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                </select>
              </label>
            </div>
          </header>
          {visibleApps.length ? (
            <div className="hub-app-grid">
              {visibleApps.map((app) => (
                <IntegrationInstallCard
                  app={app}
                  operationState={operationState}
                  key={app.key}
                  onConfigure={configure}
                  onInstall={install}
                  onUninstall={setUninstallTarget}
                />
              ))}
            </div>
          ) : (
            <section className="hub-empty-state hub-surface"><div><h2>Nenhum aplicativo nesta categoria</h2><p>Escolha outra categoria para consultar as integrações disponíveis nesta loja.</p></div></section>
          )}
          </section>
        </>
      ) : null}

      {activeTab === 'LOGISTICS' ? (
        <form className="hub-settings-form hub-surface" onSubmit={saveLogistics}>
          <header><IntegrationLogo name="melhorenvio" fallbackIcon={PackageCheck} iconSize={20} /><div><h2>Melhor Envio</h2><p>OAuth 2.0 é o destino desta integração. Enquanto o aplicativo OAuth não estiver registrado, a configuração segura por token mantém o contrato atual sem fingir uma conexão.</p></div></header>
          <div className="hub-settings-fields">
            <label>Ambiente<select value={logistics.environment} onChange={(event) => setLogistics({ ...logistics, environment: event.target.value })}><option value="SANDBOX">Sandbox</option><option value="PRODUCTION">Produção</option></select></label>
            <label>Token do Melhor Envio<input type="password" value={logistics.access_token} onChange={(event) => setLogistics({ ...logistics, access_token: event.target.value })} placeholder="Informe o token deste ambiente" /><small>O token não é exibido depois de salvo. Ao mudar de ambiente, informe a credencial correspondente.</small></label>
          </div>
          <footer className="hub-settings-form-footer"><MapPinned aria-hidden="true" size={17} /><p>Remetente, embalagens e etiquetas continuam na Central de Logística & Envios.</p><Button type="submit" loading={saving} icon={ShieldCheck}>Salvar configuração</Button></footer>
        </form>
      ) : null}

      {activeTab === 'GATEWAYS' ? (
        <section className="hub-settings-gateways hub-stable-data-region">
          <header className="hub-settings-section-heading">
            <div><h2>Gateways instalados</h2><p>Instale o gateway primeiro. A configuração só é liberada quando existe adapter real, tokenização oficial e webhook assinado.</p></div>
          </header>
          {activeGateway?.key === 'stripe' ? (
            <StripeConfiguration stripe={stripe} stripeStatus={stripeStatus} saving={saving} onChange={setStripe} onSubmit={saveStripe} />
          ) : (
            <section className="hub-integration-unavailable hub-surface">
              <h2>{activeGateway?.name || 'Selecione um gateway'}</h2>
              <p>{activeGateway?.auth_strategy === 'OAUTH2'
                ? 'A conexão OAuth 2.0 será liberada quando o adapter e o aplicativo do provedor estiverem registrados e homologados. Nenhuma credencial é solicitada antes disso.'
                : 'A configuração será liberada após adapter, tokenização e webhook homologados. Nenhuma credencial é solicitada antes disso.'}</p>
              {filteredInstalledApps.filter((app) => app.category === 'GATEWAYS' && app.key !== 'stripe').length ? <Badge variant="warning">Em preparação técnica</Badge> : null}
            </section>
          )}
        </section>
      ) : null}

      {activeTab === 'FISCAL' ? (
        <div className="hub-settings-form-grid">
          <FiscalReadiness preflight={preflight} />
          <form className="hub-settings-form hub-surface" onSubmit={saveFiscal}>
            <header><IntegrationLogo name="nfe" fallbackIcon={ShieldCheck} iconSize={20} /><div><h2>App Fiscal</h2><p>Os segredos não retornam para o navegador após o salvamento.</p></div></header>
            <div className="hub-settings-fields">
              <label>Razão social<input required value={fiscal.legal_name} onChange={(event) => setFiscal({ ...fiscal, legal_name: event.target.value })} /></label>
              <label>CNPJ<input required value={fiscal.cnpj} onChange={(event) => setFiscal({ ...fiscal, cnpj: event.target.value })} /></label>
              <label>Inscrição estadual<input required value={fiscal.state_registration} onChange={(event) => setFiscal({ ...fiscal, state_registration: event.target.value })} /></label>
              <label>Ambiente<select value={fiscal.environment} onChange={(event) => setFiscal({ ...fiscal, environment: event.target.value })}><option value="HOMOLOGATION">Teste (homologação)</option><option value="PRODUCTION">Produção</option></select></label>
              <label>Provedor fiscal<input value={fiscal.provider} onChange={(event) => setFiscal({ ...fiscal, provider: event.target.value })} placeholder="Ex.: provedor contratado" /></label>
              <label>Token do provedor<input type="password" value={fiscal.api_token} onChange={(event) => setFiscal({ ...fiscal, api_token: event.target.value })} placeholder="Deixe vazio para manter o atual" /></label>
              <label>Certificado A1 (PFX/P12)<input type="file" accept=".pfx,.p12,application/x-pkcs12" onChange={(event) => setCertificate(event.target.files?.[0] || null)} /><small>{certificateMeta?.configured ? 'Configurado: ' + certificateMeta.name : 'Nenhum certificado configurado'}</small></label>
              <label>Senha do certificado<input type="password" value={fiscal.certificate_password} onChange={(event) => setFiscal({ ...fiscal, certificate_password: event.target.value })} placeholder="Deixe vazio para manter a atual" /></label>
            </div>
            <footer className="hub-settings-form-footer"><MapPinned aria-hidden="true" size={17} /><p>Produtos ainda precisam de dados fiscais completos. A emissão só será habilitada após homologação do adapter.</p><Button type="submit" loading={saving} icon={FileKey2}>Salvar configuração</Button></footer>
          </form>
        </div>
      ) : null}
      {uninstallTarget ? (
        <ModalDialog labelledBy="uninstall-app-title" describedBy="uninstall-app-description" onClose={() => setUninstallTarget(null)} busy={saving || Boolean(operationState)}>
          {(requestClose) => (
            <div className="hub-settings-confirmation">
              <h2 id="uninstall-app-title">Desinstalar {uninstallTarget.name}?</h2>
              <p id="uninstall-app-description">O app deixará de ficar ativo nesta loja. As credenciais protegidas serão preservadas para uma reinstalação futura.</p>
              {operationState?.key === uninstallTarget.key ? <AppOperationProgress operation={operationState} /> : null}
              <div>
                <Button variant="secondary" onClick={requestClose} disabled={saving || Boolean(operationState)}>Cancelar</Button>
                <Button variant="danger" loading={saving} onClick={confirmUninstall}>Desinstalar</Button>
              </div>
            </div>
          )}
        </ModalDialog>
      ) : null}
    </main>
  );
};

export default SettingsPage;
