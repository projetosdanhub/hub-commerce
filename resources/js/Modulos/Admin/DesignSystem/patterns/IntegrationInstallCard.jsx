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

const operationLabel = (operation) => {
  if (operation?.stage === 'COMPLETE') return operation.kind === 'UNINSTALL' ? 'Desinstalado' : 'Instalado';
  if (operation?.kind === 'UNINSTALL') return 'Desinstalando';

  return operation?.stage === 'PREPARING' ? 'Preparando' : 'Instalando';
};

export const AppOperationProgress = ({ operation, compact = false }) => {
  const progress = Math.max(0, Math.min(100, Number(operation?.progress) || 0));
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  const label = operationLabel(operation);

  return (
    <div
      className={'hub-app-operation-progress' + (compact ? ' hub-app-operation-progress-compact' : '')}
      aria-label={`${label}, ${progress}% concluído`}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <svg viewBox="0 0 56 56" aria-hidden="true">
        <defs>
          <linearGradient id="hub-operation-gradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--hub-primary)" />
            <stop offset="100%" stopColor="var(--hub-info)" />
          </linearGradient>
        </defs>
        <circle className="hub-app-operation-track" cx="28" cy="28" r={radius} />
        <circle
          className="hub-app-operation-value"
          cx="28"
          cy="28"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <path className="hub-app-operation-wave" d="M16 29c3-3 6-3 9 0s6 3 9 0 6-3 9 0" />
        <text x="28" y="28" textAnchor="middle" dominantBaseline="middle">{progress}%</text>
      </svg>
      <div>
        <strong>{label}</strong>
        <span>{operation?.stage === 'PREPARING' ? 'Validando requisitos' : 'Aguardando confirmação segura'}</span>
      </div>
    </div>
  );
};

export const IntegrationInstallCard = ({
  app,
  operationState,
  onInstall,
  onConfigure,
  onUninstall,
}) => {
  const Icon = icons[app.key] || AppWindow;
  const configuration = app.configuration || {};
  const operation = operationState?.key === app.key ? operationState : null;
  const anotherOperationIsRunning = Boolean(operationState) && !operation;
  const configured = Boolean(configuration.credential_configured);
  const blockedBy = app.blocked_by;
  const statusLabel = app.installed ? 'Instalado' : 'Disponível';

  return (
    <article className="hub-integration-card" data-installed={app.installed} data-operation={operation?.kind || undefined}>
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
        {operation ? (
          <AppOperationProgress operation={operation} compact />
        ) : app.installed ? (
          <>
            <Button size="sm" variant="danger" icon={Trash2} disabled={anotherOperationIsRunning} onClick={() => onUninstall(app)}>
              Desinstalar
            </Button>
            <Button size="sm" variant="secondary" icon={Settings2} disabled={anotherOperationIsRunning} onClick={() => onConfigure(app)}>
              Configurar
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            icon={AppWindow}
            disabled={Boolean(blockedBy) || anotherOperationIsRunning}
            onClick={() => onInstall(app)}
          >
            {blockedBy ? 'Troca bloqueada' : 'Instalar'}
          </Button>
        )}
      </footer>
    </article>
  );
};
