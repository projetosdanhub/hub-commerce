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

  if (!data) return <section className="hub-domain-panel hub-surface" aria-busy="true"><LoaderCircle className="hub-domain-spin" /> Carregando domínios…</section>;

  const instruction = challenge || null;

  return (
    <section className="hub-domain-panel hub-surface">
      <header className="hub-domain-hero">
        <div className="hub-domain-icon"><Globe2 size={22} aria-hidden="true" /></div>
        <div><h2>Domínio da loja</h2><p>Use a sua marca em toda a vitrine, links, checkout e pixels. A confirmação só ocorre depois da prova de propriedade e do apontamento para a hospedagem.</p></div>
        <Badge variant="success"><ShieldCheck size={15} aria-hidden="true" /> Protegido</Badge>
      </header>

      {notice ? <div className={'hub-settings-notice hub-settings-notice-' + notice.tone} role="status">{notice.text}</div> : null}

      <article className="hub-domain-platform">
        <div><small>Endereço protegido da plataforma</small><strong>{data.platform_domain.domain}</strong><span>Disponível enquanto você configura seu domínio próprio.</span></div>
        <Badge variant="success"><BadgeCheck size={15} aria-hidden="true" /> Ativo</Badge>
      </article>

      <form className="hub-domain-connect" onSubmit={connect}>
        <label>Conectar domínio próprio
          <input value={domain} onChange={(event) => setDomain(event.target.value)} placeholder="loja.suamarca.com.br" inputMode="url" />
          <small>Informe apenas o domínio, sem https://, caminhos ou portas.</small>
        </label>
        <Button type="submit" loading={busy === 'connect'} icon={Link2}>Iniciar conexão</Button>
      </form>

      {instruction ? <section className="hub-domain-tutorial">
        <header><div><span>1</span><h3>Comprove a propriedade</h3></div><p>No painel DNS do seu domínio, crie este registro TXT. Ele só autoriza a sua loja.</p></header>
        <DomainRecord type="TXT" host={instruction.txt.host} value={instruction.txt.value} />
        <header><div><span>2</span><h3>Envie o tráfego para a hospedagem</h3></div><p>Crie o CNAME abaixo. Para domínio raiz, use ALIAS/ANAME do seu provedor ou configure o IP da hospedagem informado pelo suporte.</p></header>
        <DomainRecord type={instruction.routing.type} host={instruction.routing.host} value={instruction.routing.value} />
        <footer><RefreshCw className="hub-domain-spin" size={17} aria-hidden="true" /><span>Após salvar, a propagação pode levar alguns minutos. Clique em verificar quando terminar.</span></footer>
      </section> : null}

      <section className="hub-domain-list" aria-label="Domínios personalizados">
        <header><h3>Domínios conectados</h3><p>Somente o domínio autenticado vira o principal. Webhooks de pagamento continuam no domínio seguro da plataforma.</p></header>
        {customDomains.length ? customDomains.map((item) => (
          <article className="hub-domain-row" key={item.id}>
            <div className={'hub-domain-status ' + (item.status === 'VERIFIED' ? 'is-verified' : 'is-pending')}><BadgeCheck size={18} aria-hidden="true" /></div>
            <div><strong>{item.domain}</strong><small>{item.status === 'VERIFIED' ? 'Autenticado e ativo para loja, checkout e pixels.' : 'Aguardando registros DNS e verificação.'}</small></div>
            <Badge variant={item.status === 'VERIFIED' ? 'success' : 'warning'}>{item.status === 'VERIFIED' ? 'Autenticado' : 'Verificação pendente'}</Badge>
            <div className="hub-domain-actions">
              {item.status !== 'VERIFIED' ? <Button variant="secondary" onClick={() => verify(item)} loading={busy === 'verify:' + item.id} icon={RefreshCw}>Verificar</Button> : null}
              <Button variant="ghost" onClick={() => setDisconnecting(item)} icon={Unplug}>Desautenticar</Button>
            </div>
          </article>
        )) : <div className="hub-domain-empty">Nenhum domínio personalizado conectado. O endereço protegido acima já está disponível.</div>}
      </section>

      <aside className="hub-domain-webhook"><ShieldCheck size={19} aria-hidden="true" /><div><strong>Webhooks em domínio seguro do Hub Commerce</strong><p>Gateways usam um endpoint central, assinado e isolado por loja. O domínio da loja não recebe eventos financeiros.</p></div></aside>

      {disconnecting ? <ModalDialog labelledBy="disconnect-domain-title" describedBy="disconnect-domain-description" onClose={() => setDisconnecting(null)} busy={busy === 'disconnect:' + disconnecting.id}>{(close) => <div className="hub-settings-confirmation"><h2 id="disconnect-domain-title">Desautenticar {disconnecting.domain}?</h2><p id="disconnect-domain-description">A loja voltará ao endereço protegido da plataforma. O domínio deixará de atender vitrine, checkout e pixels.</p><div><Button variant="secondary" onClick={close}>Cancelar</Button><Button variant="danger" loading={busy === 'disconnect:' + disconnecting.id} onClick={disconnect}>Desautenticar</Button></div></div>}</ModalDialog> : null}
    </section>
  );
};

const DomainRecord = ({ type, host, value }) => <div className="hub-domain-record"><Badge variant="neutral">{type}</Badge><div><small>Nome / Host</small><code>{host}</code></div><Button variant="ghost" icon={Copy} aria-label={'Copiar host ' + host} onClick={() => copy(host)}>Copiar</Button><div><small>Valor / Destino</small><code>{value}</code></div><Button variant="ghost" icon={Copy} aria-label={'Copiar valor ' + value} onClick={() => copy(value)}>Copiar</Button></div>;

export default DomainConfiguration;
