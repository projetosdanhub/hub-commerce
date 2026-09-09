import React, { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, Copy, Globe2, Link2, LoaderCircle, RefreshCw, ShieldCheck, Unplug } from 'lucide-react';
import api from '../../../api';
import { Badge } from '../DesignSystem/primitives/Badge';
import { Button } from '../DesignSystem/primitives/Button';
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

  const load = async () => {
    const response = await api.get('/admin/settings/domains');
    setData(response.data);
  };

  useEffect(() => {
    let cancelled = false;

    const request = async () => {
      try {
        const response = await api.get('/admin/settings/domains');

        if (!cancelled) setData(response.data);
      } catch {
        if (!cancelled) setNotice({ tone: 'error', text: 'Não foi possível carregar os domínios desta loja.' });
      }
    };

    request();

    return () => {
      cancelled = true;
    };
  }, []);

  const customDomains = useMemo(() => (data?.domains || []).filter((item) => item.kind === 'CUSTOM'), [data]);
  const pendingDomains = useMemo(() => customDomains.filter((item) => item.status === 'PENDING_DNS'), [customDomains]);

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
      setNotice({ tone: 'error', text: 'Não foi possível desvincular este domínio.' });
    } finally {
      setBusy(null);
    }
  };

  if (!data) return <section className="hub-domain-panel hub-surface" aria-busy="true"><LoaderCircle className="hub-domain-spin" /> Carregando domínios…</section>;

  const instruction = challenge || pendingDomains[0]?.verification || {
    isExample: true,
    txt: { host: `_hub-verify.loja.suamarca.com.br`, value: 'hub-commerce-verification=a1b2c3d4e5f6...' },
    routing: { type: 'CNAME', host: 'loja.suamarca.com.br', value: data.instructions?.cname_target || 'storefront.hubcommerce.com.br' }
  };

  return (
    <section className="hub-domain-panel hub-surface">
      <header className="hub-domain-hero">
        <div className="hub-domain-icon"><Globe2 size={24} aria-hidden="true" /></div>
        <div>
          <h2>Domínio da loja</h2>
          <p>Use a sua marca em toda a vitrine, links, checkout e pixels. A confirmação só ocorre depois da prova de propriedade e do apontamento para a hospedagem.</p>
        </div>
      </header>

      {notice ? <div className={'hub-settings-notice hub-settings-notice-' + notice.tone} role="status">{notice.text}</div> : null}

      <div className="hub-domain-layout">
        <div className="hub-domain-main">
          <section className="hub-domain-list" aria-label="Endereço protegido">
            <header>
              <h3>Domínio base da plataforma</h3>
              <p>Disponível enquanto você configura seu domínio próprio.</p>
            </header>
            <article className="hub-domain-platform">
              <div className="hub-domain-status is-verified"><BadgeCheck size={18} aria-hidden="true" /></div>
              <div>
                <strong>{data.platform_domain.domain}</strong>
                <small>Protegido e ativo.</small>
              </div>
              <Badge variant="success">Ativo</Badge>
            </article>
          </section>

          <section className="hub-domain-list" aria-label="Domínios personalizados">
            <header>
              <h3>Domínios conectados</h3>
              <p>Somente o domínio autenticado vira o principal. Webhooks de pagamento continuam no domínio seguro da plataforma.</p>
            </header>
            <form className="hub-domain-connect" onSubmit={connect}>
              <div className="hub-domain-connect-fields">
                <label htmlFor="domain-input">Conectar novo domínio</label>
                <div className="hub-domain-connect-row">
                  <input id="domain-input" value={domain} onChange={(event) => setDomain(event.target.value)} placeholder="loja.suamarca.com.br" inputMode="url" />
                  <Button type="submit" loading={busy === 'connect'} icon={Link2}>Adicionar</Button>
                </div>
                <small>Apenas o domínio, sem https:// ou barras.</small>
              </div>
            </form>

            {customDomains.length ? customDomains.map((item) => (
              <article className="hub-domain-row" key={item.id}>
                <div className={'hub-domain-status ' + (item.status === 'VERIFIED' ? 'is-verified' : 'is-pending')}><BadgeCheck size={18} aria-hidden="true" /></div>
                <div>
                  <strong>{item.domain}</strong>
                  <small>{item.status === 'VERIFIED' ? 'Autenticado e ativo para loja, checkout e pixels.' : 'Aguardando registros DNS e verificação.'}</small>
                </div>
                <Badge variant={item.status === 'VERIFIED' ? 'success' : 'warning'}>{item.status === 'VERIFIED' ? 'Autenticado' : 'Pendente'}</Badge>
                <div className="hub-domain-actions">
                  {item.status !== 'VERIFIED' ? <Button variant="secondary" onClick={() => verify(item)} loading={busy === 'verify:' + item.id} icon={RefreshCw}>Verificar</Button> : null}
                  <Button variant="ghost" onClick={() => setDisconnecting(item)} icon={Unplug}>Desvincular</Button>
                </div>
              </article>
            )) : <div className="hub-domain-empty">Nenhum domínio personalizado conectado.</div>}
          </section>
        </div>

        <div className="hub-domain-sidebar">
          {instruction ? (
            <section className="hub-domain-tutorial">
              <header>
                <div><span>1</span><h3>Comprove a propriedade</h3></div>
                <p>No painel DNS do seu domínio, crie este registro TXT para autorizar a loja.</p>
              </header>
              <DomainRecord type="TXT" host={instruction.txt.host} value={instruction.txt.value} />
              
              <header>
                <div><span>2</span><h3>Aponte o tráfego</h3></div>
                <p>Crie o CNAME abaixo para direcionar os acessos para a hospedagem.</p>
              </header>
              <DomainRecord type={instruction.routing.type} host={instruction.routing.host} value={instruction.routing.value} />
              
              <footer>
                <RefreshCw className={instruction.isExample ? '' : 'hub-domain-spin'} size={16} aria-hidden="true" />
                <span>{instruction.isExample ? 'Adicione seu domínio na lista ao lado para obter os registros reais.' : 'Após salvar, aguarde a propagação (pode levar minutos) e clique em Verificar.'}</span>
              </footer>
            </section>
          ) : null}

          <aside className="hub-domain-webhook">
            <ShieldCheck size={20} aria-hidden="true" />
            <div>
              <strong>Segurança de Webhooks</strong>
              <p>Os gateways sempre utilizarão o endereço protegido da plataforma para eventos financeiros invisíveis ao cliente.</p>
            </div>
          </aside>
        </div>
      </div>

      {disconnecting ? <ModalDialog labelledBy="disconnect-domain-title" describedBy="disconnect-domain-description" onClose={() => setDisconnecting(null)} busy={busy === 'disconnect:' + disconnecting.id}>{(close) => <div className="hub-settings-confirmation"><h2 id="disconnect-domain-title">Desvincular {disconnecting.domain}?</h2><p id="disconnect-domain-description">A loja voltará ao endereço protegido da plataforma. O domínio deixará de atender vitrine, checkout e pixels.</p><div><Button variant="secondary" onClick={close}>Cancelar</Button><Button variant="danger" loading={busy === 'disconnect:' + disconnecting.id} onClick={disconnect}>Desvincular</Button></div></div>}</ModalDialog> : null}
    </section>
  );
};

const DomainRecord = ({ type, host, value }) => <div className="hub-domain-record"><Badge variant="neutral">{type}</Badge><div><small>Nome / Host</small><code>{host}</code></div><Button variant="ghost" icon={Copy} aria-label={'Copiar host ' + host} onClick={() => copy(host)}>Copiar</Button><div><small>Valor / Destino</small><code>{value}</code></div><Button variant="ghost" icon={Copy} aria-label={'Copiar valor ' + value} onClick={() => copy(value)}>Copiar</Button></div>;

export default DomainConfiguration;
