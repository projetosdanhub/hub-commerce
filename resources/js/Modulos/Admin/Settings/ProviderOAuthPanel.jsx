import React, { useEffect, useMemo, useState } from 'react';
import { Link2, RefreshCw, ShieldCheck } from 'lucide-react';
import api from '../../../api';
import { Badge } from '../DesignSystem/primitives/Badge';
import { Button } from '../DesignSystem/primitives/Button';
import { IntegrationLogo } from '../DesignSystem/patterns/IntegrationLogo';

const labels = {
  PENDING: ['warning', 'Aguardando conexão'],
  CONNECTED: ['success', 'Conectado'],
  REVOKED: ['danger', 'Revogado'],
};

export const ProviderOAuthPanel = ({ provider, name, fallbackIcon, defaultEnvironment = 'SANDBOX', description, onStatusChange }) => {
  const [environment, setEnvironment] = useState(defaultEnvironment);
  const [installations, setInstallations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [notice, setNotice] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/settings/provider-installations');
      const nextInstallations = response.data?.installations || [];
      setInstallations(nextInstallations);
      onStatusChange?.(nextInstallations.find((item) => item.provider === provider && item.environment === environment) || null);
    } catch {
      setNotice({ tone: 'error', text: 'Não foi possível consultar o estado da conexão.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const request = async () => {
      try {
        const response = await api.get('/admin/settings/provider-installations');
        if (!cancelled) {
          const nextInstallations = response.data?.installations || [];
          setInstallations(nextInstallations);
          onStatusChange?.(nextInstallations.find((item) => item.provider === provider && item.environment === environment) || null);
        }
      } catch {
        if (!cancelled) setNotice({ tone: 'error', text: 'Não foi possível consultar o estado da conexão.' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    request();

    return () => {
      cancelled = true;
    };
  }, [environment, onStatusChange, provider]);

  const installation = useMemo(
    () => installations.find((item) => item.provider === provider && item.environment === environment),
    [environment, installations, provider],
  );
  const status = installation?.status || 'PENDING';
  const [variant, label] = labels[status] || labels.PENDING;

  const connect = async () => {
    setConnecting(true);
    setNotice(null);
    try {
      let current = installation;

      if (!current) {
        const created = await api.post('/admin/settings/provider-installations', { provider, environment });
        current = created.data?.installation;
      }

      const response = await api.post('/admin/settings/provider-installations/' + current.id + '/authorization');
      const authorization = response.data?.authorization;

      if (authorization?.url) {
        window.location.assign(authorization.url);
        return;
      }

      setNotice({ tone: 'warning', text: authorization?.message || 'A conexão ainda não pode ser iniciada.' });
      await load();
    } catch (error) {
      const authorization = error?.response?.data?.authorization;
      setNotice({
        tone: 'warning',
        text: authorization?.message || error?.response?.data?.message || 'Não foi possível iniciar a conexão.',
      });
      await load();
    } finally {
      setConnecting(false);
    }
  };

  const revoke = async () => {
    if (!installation || !window.confirm('Desconectar esta conta? A cotação e as etiquetas ficarão indisponíveis até uma nova autorização.')) return;

    setConnecting(true);
    try {
      await api.delete('/admin/settings/provider-installations/' + installation.id);
      setNotice({ tone: 'success', text: 'Conexão revogada com segurança.' });
      await load();
    } catch (error) {
      setNotice({ tone: 'error', text: error?.response?.data?.message || 'Não foi possível revogar a conexão.' });
    } finally {
      setConnecting(false);
    }
  };

  return (
    <section className="hub-settings-form hub-surface">
      <header>
        <IntegrationLogo name={provider.replace('_', '')} fallbackIcon={fallbackIcon} iconSize={20} />
        <div>
          <h2>{name}</h2>
          <p>{description}</p>
        </div>
      </header>
      <div className="hub-settings-fields">
        <label>Ambiente
          <select value={environment} onChange={(event) => setEnvironment(event.target.value)} disabled={connecting}>
            <option value="SANDBOX">Sandbox</option>
            <option value="PRODUCTION">Produção</option>
          </select>
          <small>Cada ambiente possui uma conexão isolada.</small>
        </label>
        <div className="hub-integration-unavailable">
          <Badge variant={variant}>{label}</Badge>
          <p>Client ID, Client Secret, tokens e refresh tokens não são exibidos nem enviados pelo navegador.</p>
        </div>
      </div>
      {notice ? <div className={'hub-settings-notice hub-settings-notice-' + notice.tone} role="status">{notice.text}</div> : null}
      <footer className="hub-settings-form-footer">
        <ShieldCheck aria-hidden="true" size={17} />
        <p>Você será redirecionado ao {name} para conceder permissões. O retorno usa callback fixo, state único e token cifrado.</p>
        <div>
          <Button type="button" variant="secondary" onClick={load} loading={loading} icon={RefreshCw}>Atualizar</Button>
          {status === 'CONNECTED'
            ? <Button type="button" variant="danger" onClick={revoke} loading={connecting}>Desconectar</Button>
            : <Button type="button" onClick={connect} loading={connecting} icon={Link2}>Conectar com {name}</Button>}
        </div>
      </footer>
    </section>
  );
};
