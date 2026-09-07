import React from 'react';
import { AppWindow, CheckCircle2, CreditCard, FileKey2, PackageCheck, Settings2, ShieldCheck, Store, Trash2 } from 'lucide-react';
import { Badge } from '../primitives/Badge';
import { Button } from '../primitives/Button';

const icons = {
  fiscal: FileKey2,
  logistics: PackageCheck,
  stripe: CreditCard,
  mercado_pago: Store,
  pagarme: CreditCard,
  pagbank: AppWindow,
};

const environmentLabel = (environment) => ({
  SANDBOX: 'Teste',
  HOMOLOGATION: 'Homologação',
  PRODUCTION: 'Produção',
}[environment] || 'Sem ambiente');

const authLabel = (strategy) => ({
  OAUTH2: 'OAuth 2.0',
  API_KEYS: 'Chaves seguras',
  MANUAL_SECRET: 'Credencial segura',
}[strategy] || 'Configuração segura');

export const IntegrationInstallCard = ({
  app,
  installState,
  onInstall,
  onConfigure,
  onUninstall,
}) => {
  const Icon = icons[app.key] || AppWindow;
  const configuration = app.configuration || {};
  const isInstalling = installState?.key === app.key;
  const progress = installState?.progress || 0;
  const configured = Boolean(configuration.credential_configured);
  const statusLabel = app.installed ? 'Instalado' : 'Disponível';

  return (
    <article className="hub-integration-card" data-installed={app.installed}>
      <header className="hub-integration-card-header">
        <div className="hub-integration-card-icon"><Icon aria-hidden="true" size={20} /></div>
        <div className="hub-integration-card-meta">
          <Badge variant={app.installed ? 'success' : 'neutral'}>{statusLabel}</Badge>
          <Badge variant="info">{authLabel(app.auth_strategy)}</Badge>
        </div>
      </header>

      <div className="hub-integration-card-copy">
        <div>
          <h2>{app.name}</h2>
          <p>{app.description}</p>
        </div>
        {app.installed ? (
          <p className="hub-integration-readiness">
            <ShieldCheck aria-hidden="true" size={16} />
            {configured ? 'Configuração registrada com segurança.' : 'Configuração pendente.'}
          </p>
        ) : (
          <p className="hub-integration-category">{app.category_label}</p>
        )}
      </div>

      {isInstalling ? (
        <div className="hub-install-progress" aria-live="polite" aria-label={'Instalando ' + app.name}>
          <div className="hub-install-progress-track">
            <progress max="100" value={progress}>{progress}%</progress>
          </div>
          <span>{progress}%</span>
        </div>
      ) : null}

      <footer className="hub-integration-card-actions">
        {app.installed ? (
          <>
            <Button size="sm" variant="danger" icon={Trash2} onClick={() => onUninstall(app)}>
              Desinstalar
            </Button>
            <Button size="sm" variant="secondary" icon={Settings2} onClick={() => onConfigure(app)}>
              Configurar
            </Button>
          </>
        ) : (
          <Button size="sm" icon={isInstalling ? CheckCircle2 : AppWindow} loading={isInstalling} onClick={() => onInstall(app)}>
            Instalar
          </Button>
        )}
      </footer>
    </article>
  );
};
