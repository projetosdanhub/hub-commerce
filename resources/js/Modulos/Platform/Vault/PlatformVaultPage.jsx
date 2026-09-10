import React, { useEffect, useMemo, useState } from 'react';
import { KeyRound, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import api from '../../../api';
import { Badge } from '../../Admin/DesignSystem/primitives/Badge';
import './platform-vault.css';

const statusVariant = { CONFIGURED: 'success', UNCONFIGURED: 'warning', REVOKED: 'danger' };

export const PlatformVaultPage = () => {
  const [records, setRecords] = useState([]);
  const [query, setQuery] = useState('');
  const [environment, setEnvironment] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(null);

  const load = async () => {
    setLoading(true);
    try { const response = await api.get('/platform/vault'); setRecords(response.data.records || []); } finally { setLoading(false); }
  };

  useEffect(() => {
    let cancelled = false;

    const request = async () => {
      try {
        const response = await api.get('/platform/vault');

        if (!cancelled) setRecords(response.data.records || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    request();

    return () => {
      cancelled = true;
    };
  }, []);
  const revoke = async (record) => {
    if (!window.confirm('Revogar esta credencial? A reconexão será necessária.')) return;
    setRevoking(record.id);
    try { await api.post('/platform/vault/' + record.id + '/revoke'); await load(); } finally { setRevoking(null); }
  };
  const visible = useMemo(() => records.filter((record) => (
    (environment === 'ALL' || record.environment === environment)
    && [record.provider, record.purpose, record.status].join(' ').toLowerCase().includes(query.toLowerCase())
  )), [environment, query, records]);

  return <main className="hub-platform-vault">
    <header><span><KeyRound aria-hidden="true" size={23} /></span><div><h1>Cofre e integrações</h1><p>Diagnóstico de credenciais por ambiente. Chaves, tokens e segredos nunca são exibidos.</p></div></header>
    <section className="hub-platform-vault-guide hub-surface"><ShieldCheck aria-hidden="true" size={20} /><div><strong>Onde cadastrar as credenciais dos aplicativos</strong><p>No desenvolvimento: apenas no <code>.env</code> local, fora do Git. Em staging e produção: Secret Manager ou variáveis protegidas da infraestrutura. Este painel confirma disponibilidade, rotação e revogação; ele não recebe nem revela valores secretos.</p></div></section>
    <section className="hub-platform-vault-controls"><label><Search size={16} aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filtrar provedor ou finalidade" /></label><select value={environment} onChange={(event) => setEnvironment(event.target.value)}><option value="ALL">Todos os ambientes</option><option value="SANDBOX">Sandbox</option><option value="PRODUCTION">Produção</option><option value="PLATFORM">Plataforma</option></select><button onClick={load} disabled={loading}><RefreshCw className={loading ? 'hub-spinner' : ''} size={17} />Atualizar</button></section>
    <section className="hub-platform-vault-grid">{visible.map((record) => <article key={record.provider + record.purpose + record.environment}><header><strong>{record.provider}</strong><Badge variant={statusVariant[record.status] || 'neutral'}>{record.status}</Badge></header><dl><div><dt>Finalidade</dt><dd>{record.purpose}</dd></div><div><dt>Ambiente</dt><dd>{record.environment}</dd></div><div><dt>Local</dt><dd>{record.credential_location}</dd></div><div><dt>Última rotação</dt><dd>{record.rotated_at ? new Date(record.rotated_at).toLocaleString() : 'Ainda não configurada'}</dd></div></dl><footer><span><ShieldCheck size={16} aria-hidden="true" /> Metadados protegidos</span>{record.id && record.status !== 'REVOKED' ? <button onClick={() => revoke(record)} disabled={revoking === record.id}>{revoking === record.id ? 'Revogando…' : 'Revogar'}</button> : null}</footer></article>)}</section>
  </main>;
};
