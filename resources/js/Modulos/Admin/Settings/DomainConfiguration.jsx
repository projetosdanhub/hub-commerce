import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BadgeCheck, Copy, Globe2, Link2, RefreshCw, ShieldCheck, Unplug } from 'lucide-react';
import api from '../../../api';
import { Badge } from '../DesignSystem/primitives/Badge';
import { Button } from '../DesignSystem/primitives/Button';
import { Skeleton } from '../DesignSystem/primitives/Skeleton';
import { useRegisterAdminPageRefresh } from '../DesignSystem/patterns/GlobalPageRefresh';
import { ModalDialog } from '../DesignSystem/patterns/ModalDialog';
import './domain-configuration.css';

const copy = async (value) => navigator.clipboard?.writeText(value);

const DomainConfiguration = () => {
  const [data, setData] = useState(null);
  const [domain, setDomain] = useState('');
  const [challenge, setChallenge] = useState(null);
  const [busy, setBusy] = useState(null);
  const [notice, setNotice] = useState(null);
  const [disconnecting, setDisconnecting] = useState(null);

  const load = useCallback(async () => {
    try {
      const response = await api.get('/admin/settings/domains');
      setData(response.data);
    } catch {
      setNotice({ tone: 'error', text: 'Não foi possível carregar os domínios desta loja.' });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useRegisterAdminPageRefresh(load);

  const customDomains = useMemo(() => data?.domains || [], [data]);

  const connect = async (event) => {
    event.preventDefault();
    setBusy('connect');
    setNotice(null);
    try {
      const response = await api.post('/admin/settings/domains', { domain });
      setChallenge(response.data.verification);
      setDomain('');
      await load();
      setNotice({ tone: 'success', text: 'Domínio adicionado. Publique os dois registros DNS e inicie a verificação.' });
    } catch (error) {
      setNotice({ tone: 'error', text: error.response?.data?.errors?.domain?.[0] || 'Não foi possível iniciar a conexão.' });
    } finally {
      setBusy(null);
    }
  };

  const verify = async (item) => {
    setBusy('verify:' + item.id);
    setNotice(null);
    try {
      const response = await api.post('/admin/settings/domains/' + item.id + '/verify');
      setChallenge(null);
      await load();
      setNotice({ tone: 'success', text: response.data.message });
    } catch (error) {
      setChallenge(error.response?.data?.verification || challenge);
      setNotice({ tone: 'warning', text: error.response?.data?.message || 'Ainda não encontramos os registros DNS.' });
      await load();
    } finally {
      setBusy(null);
    }
  };

  const disconnect = async () => {
    const item = disconnecting;
    setBusy('disconnect:' + item.id);
    try {
      const response = await api.delete('/admin/settings/domains/' + item.id);
      setDisconnecting(null);
      setChallenge(null);
      await load();
      setNotice({ tone: 'success', text: response.data.message });
    } catch {
      setNotice({ tone: 'error', text: 'Não foi possível desautenticar este domínio.' });
    } finally {
      setBusy(null);
    }
  };

  if (!data) {
    return (
      <section className="hub-domain-panel hub-domain-panel-loading hub-surface hub-stable-data-region" aria-busy="true" aria-label="Carregando domínios">
        <div className="hub-domain-loading">
          <Skeleton className="hub-domain-loading-title" />
          <Skeleton className="hub-domain-loading-copy" />
          <Skeleton className="hub-domain-loading-card" />
        </div>
      </section>
    );
  }

  const instruction = challenge || customDomains.find((item) => item.status === 'PENDING_DNS' && item.verification)?.verification || null;

  return (
    <section className="hub-domain-panel hub-surface">
      <header className="hub-domain-hero">
        <div className="hub-domain-icon"><Globe2 size={22} aria-hidden="true" /></div>
        <div><h2>Domínio da loja</h2><p>Use sua marca na vitrine, nos links, no checkout e nos pixels. A ativação só ocorre após comprovação de propriedade e apontamento de hospedagem.</p></div>
        <Badge variant="success"><ShieldCheck size={15} aria-hidden="true" /> Protegido</Badge>
      </header>

      {notice ? <div className={'hub-settings-notice hub-settings-notice-' + notice.tone} role="status">{notice.text}</div> : null}

      <div className="hub-domain-layout">
        <div className="hub-domain-main">
          <article className="hub-domain-platform">
            <div><small>Endereço da plataforma</small><strong>{data.platform_domain.domain}</strong><span>Permanece disponível enquanto você configura um domínio próprio.</span></div>
            <Badge variant="success"><BadgeCheck size={15} aria-hidden="true" /> Ativo</Badge>
          </article>

          <form className="hub-domain-connect" onSubmit={connect}>
            <label htmlFor="custom-domain">Conectar domínio próprio
              <input id="custom-domain" value={domain} onChange={(event) => setDomain(event.target.value)} placeholder="loja.suamarca.com.br" inputMode="url" />
              <small>Informe somente o domínio, sem https://, caminhos ou portas.</small>
            </label>
            <Button type="submit" loading={busy === 'connect'} icon={Link2}>Iniciar conexão</Button>
          </form>

          <section className="hub-domain-list hub-stable-data-region" aria-label="Domínios próprios">
            <header><h3>Domínios próprios</h3><p>Somente um domínio autenticado se torna o endereço principal da loja.</p></header>
            {customDomains.length ? customDomains.map((item) => (
              <article className="hub-domain-row" key={item.id}>
                <div className={'hub-domain-status ' + (item.status === 'VERIFIED' ? 'is-verified' : 'is-pending')}><BadgeCheck size={18} aria-hidden="true" /></div>
                <div><strong>{item.domain}</strong><small>{item.status === 'VERIFIED' ? 'Autenticado para vitrine, checkout e pixels.' : 'Aguardando os registros DNS e a verificação.'}</small></div>
                <Badge variant={item.status === 'VERIFIED' ? 'success' : 'warning'}>{item.status === 'VERIFIED' ? 'Autenticado' : 'Pendente'}</Badge>
                <div className="hub-domain-actions">
                  {item.status !== 'VERIFIED' ? <Button variant="secondary" onClick={() => verify(item)} loading={busy === 'verify:' + item.id} icon={RefreshCw}>Verificar</Button> : null}
                  <Button variant="ghost" onClick={() => setDisconnecting(item)} icon={Unplug}>Desvincular</Button>
                </div>
              </article>
            )) : <div className="hub-domain-empty"><strong>Nenhum domínio próprio conectado</strong><span>Quando estiver pronto, informe o domínio acima para receber os registros DNS exclusivos da sua loja.</span></div>}
          </section>
        </div>

        <aside className="hub-domain-aside">
          {instruction ? <section className="hub-domain-tutorial">
            <header><div><span>1</span><h3>Comprove a propriedade</h3></div><p>No painel DNS do seu domínio, crie este registro TXT. Ele autoriza somente a sua loja.</p></header>
            <DomainRecord type="TXT" host={instruction.txt.host} value={instruction.txt.value} />
            <header><div><span>2</span><h3>Aponte o tráfego</h3></div><p>Crie o CNAME abaixo. Para domínio raiz, use ALIAS/ANAME do seu provedor ou o IP informado pelo suporte.</p></header>
            <DomainRecord type={instruction.routing.type} host={instruction.routing.host} value={instruction.routing.value} />
            <footer><RefreshCw className="hub-domain-spin" size={17} aria-hidden="true" /><span>Após salvar, a propagação pode levar alguns minutos. Clique em verificar quando terminar.</span></footer>
          </section> : null}
          <section className="hub-domain-webhook"><ShieldCheck size={19} aria-hidden="true" /><div><strong>Webhooks em domínio seguro</strong><p>Os gateways usam um endpoint central, assinado e isolado por loja. Seu domínio não recebe eventos financeiros.</p></div></section>
        </aside>
      </div>

      {disconnecting ? <ModalDialog labelledBy="disconnect-domain-title" describedBy="disconnect-domain-description" onClose={() => setDisconnecting(null)} busy={busy === 'disconnect:' + disconnecting.id}>{(close) => <div className="hub-settings-confirmation"><h2 id="disconnect-domain-title">Desvincular {disconnecting.domain}?</h2><p id="disconnect-domain-description">A loja voltará ao endereço protegido da plataforma. O domínio deixará de atender vitrine, checkout e pixels.</p><div><Button variant="secondary" onClick={close}>Cancelar</Button><Button variant="danger" loading={busy === 'disconnect:' + disconnecting.id} onClick={disconnect}>Desvincular</Button></div></div>}</ModalDialog> : null}
    </section>
  );
};

const DomainRecord = ({ type, host, value }) => <div className="hub-domain-record"><Badge variant="neutral">{type}</Badge><div><small>Nome / Host</small><code>{host}</code></div><Button variant="ghost" icon={Copy} aria-label={'Copiar host ' + host} onClick={() => copy(host)}>Copiar</Button><div><small>Valor / Destino</small><code>{value}</code></div><Button variant="ghost" icon={Copy} aria-label={'Copiar valor ' + value} onClick={() => copy(value)}>Copiar</Button></div>;

export default DomainConfiguration;
