import React, { useMemo, useState } from 'react';
import { ClipboardList, RefreshCw } from 'lucide-react';
import { Button } from '../DesignSystem/primitives/Button';
import { FilterSelect } from '../DesignSystem/primitives/FilterSelect';
import { formatDate } from './catalogUtils';

export const CatalogAudit = ({ logs, loading, error, onRefresh }) => {
  const [period, setPeriod] = useState('TODOS');
  const [threshold, setThreshold] = useState(null);
  const visible = useMemo(() => {
    if (period === 'TODOS') return logs;
    return logs.filter((log) => new Date(log.created_at || log.data) >= threshold);
  }, [logs, period, threshold]);

  const changePeriod = (value) => {
    setPeriod(value);
    setThreshold(value === 'TODOS' ? null : Date.now() - Number(value) * 24 * 60 * 60 * 1000);
  };

  return <section className="hub-surface hub-orders-list">
    <header className="hub-orders-list-header"><div><h2 className="hub-panel-title">Auditoria do catálogo</h2><p className="hub-panel-description">Registros de criação, atualização e inativação devolvidos pela API.</p></div><div className="hub-catalog-actions"><FilterSelect label="Período de auditoria" value={period} onChange={(event) => changePeriod(event.target.value)}><option value="TODOS">Todo o histórico</option><option value="7">Últimos 7 dias</option><option value="30">Últimos 30 dias</option></FilterSelect><Button size="sm" variant="secondary" icon={RefreshCw} loading={loading} onClick={onRefresh}>Atualizar</Button></div></header>
    {error ? <div className="hub-error-state" role="alert"><div><ClipboardList aria-hidden="true" size={28} /><h2 className="hub-panel-title">Não foi possível carregar a auditoria</h2><p>{error}</p><Button className="mt-5" variant="secondary" onClick={onRefresh}>Tentar novamente</Button></div></div> : loading && !logs.length ? <div className="hub-orders-loading" aria-label="Carregando auditoria"><span /><span /><span /></div> : visible.length ? <ol className="hub-order-timeline hub-catalog-audit">{visible.map((log) => <li key={log.id}><span aria-hidden="true" /><div><strong>{log.acao || 'Alteração no catálogo'}</strong><small>{formatDate(log.created_at || log.data)} · {log.entidade || 'Produto'}{log.admin?.name ? ' · ' + log.admin.name : ''}</small><p>{log.detalhes || 'Sem detalhes adicionais.'}</p></div></li>)}</ol> : <div className="hub-empty-state"><div><ClipboardList aria-hidden="true" size={28} /><h2 className="hub-panel-title">Nenhum registro encontrado</h2><p>Não há alterações no período selecionado.</p></div></div>}
  </section>;
};
