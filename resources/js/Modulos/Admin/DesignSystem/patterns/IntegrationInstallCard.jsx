import React from 'react';
import { AppWindow, CheckCircle2, CreditCard, FileKey2, PackageCheck, Settings2, ShieldCheck, Store, Trash2 } from 'lucide-react';
import { Badge } from '../primitives/Badge';
import { Button } from '../primitives/Button';
import { IntegrationLogo } from './IntegrationLogo';

const icons = {
  fiscal: FileKey2,
  logistics: PackageCheck,
  stripe: CreditCard,
  mercado_pago: Store,
  pagarme: CreditCard,
  pagbank: AppWindow,
};

const authLabel = (strategy) => ({
  OAUTH2: 'OAuth 2.0',
  API_KEYS: 'Chaves seguras',
  MANUAL_SECRET: 'Credencial segura',
}[strategy] || 'Configuração segura');

const InstallProgressCircle = ({ progress }) => {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  return (
    <div className="hub-install-progress-circle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px' }} aria-label={`Instalando, ${progress}% concluído`} role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
      <svg width="36" height="36" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r={radius} fill="none" stroke="var(--hub-border)" strokeWidth="3" />
        <circle cx="18" cy="18" r={radius} fill="none" stroke="var(--hub-primary)" strokeWidth="3" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.3s ease', transformOrigin: 'center', transform: 'rotate(-90deg)' }} />
      </svg>
    </div>
  );
};


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
  const isAnotherAppInstalling = Boolean(installState) && !isInstalling;
  const progress = installState?.progress || 0;
  const configured = Boolean(configuration.credential_configured);
  const blockedBy = app.blocked_by;
  const statusLabel = app.installed ? 'Instalado' : 'Disponível';

  return (
    <article className="hub-integration-card" data-installed={app.installed}>
      <header className="hub-integration-card-header">
        <IntegrationLogo name={app.key} fallbackIcon={Icon} />
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
        ) : blockedBy ? (
          <p className="hub-integration-readiness">
            <ShieldCheck aria-hidden="true" size={16} />
            Desinstale {blockedBy.name} para trocar o app desta categoria.
          </p>
        ) : (
          <p className="hub-integration-category">{app.category_label}</p>
        )}
      </div>

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
        ) : isInstalling ? (
          <InstallProgressCircle progress={progress} />
        ) : (
          <Button
            size="sm"
            icon={AppWindow}
            disabled={Boolean(blockedBy) || isAnotherAppInstalling}
            onClick={() => onInstall(app)}
          >
            {blockedBy ? 'Troca bloqueada' : 'Instalar'}
          </Button>
        )}
      </footer>
    </article>
  );
};
