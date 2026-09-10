import React, { useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../api';
import { Badge } from '../DesignSystem/primitives/Badge';
import { Button } from '../DesignSystem/primitives/Button';
import { DateRangeFilter } from '../DesignSystem/patterns/DateRangeFilter';
import { useRegisterAdminPageRefresh } from '../DesignSystem/patterns/GlobalPageRefresh';
import { Skeleton } from '../DesignSystem/primitives/Skeleton';

const formatDate = (value) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));

const AuditLoading = () => <tbody>{Array.from({ length: 4 }, (_, index) => <tr key={index}><td><Skeleton className="h-4 w-24" /></td><td><Skeleton className="h-4 w-28" /></td><td><Skeleton className="h-4 w-24" /></td><td><Skeleton className="h-4 w-full" /></td></tr>)}</tbody>;

export const CarrierAuditTab = () => {
  const [period, setPeriod] = useState({ startDate: '', endDate: '' });
  const [page, setPage] = useState(1);
  const auditQuery = useQuery({
    queryKey: ['adminCarrierAudit', page, period.startDate, period.endDate],
    queryFn: async () => (await api.get('/admin/carriers/audits', { params: { page, start_date: period.startDate || undefined, end_date: period.endDate || undefined } })).data,
  });
  useRegisterAdminPageRefresh(auditQuery.refetch);

  const applyPeriod = (nextPeriod) => { setPeriod(nextPeriod); setPage(1); };
  const logs = Array.isArray(auditQuery.data?.data) ? auditQuery.data.data : [];
  const lastPage = Number(auditQuery.data?.last_page) || 1;

  return (
    <section className="hub-carriers-audit-card hub-stable-data-region" aria-busy={auditQuery.isLoading || undefined}>
      <header className="hub-carriers-section-heading"><div><h2><History aria-hidden="true" size={19} /> Auditoria operacional</h2><p>Alterações confirmadas na operação de transportadoras desta loja.</p></div></header>
      <div className="hub-carriers-audit-toolbar"><DateRangeFilter value={period} onApply={applyPeriod} label="Filtrar auditoria por período" /><span className="hub-carrier-meta">{logs.length ? logs.length + ' registro(s) nesta página' : 'Sem registros para os filtros atuais'}</span></div>
      {auditQuery.isError ? <p className="hub-carriers-inline-notice" role="alert"><AlertCircle aria-hidden="true" size={16} /> Não foi possível consultar a auditoria de transportadoras. Tente atualizar a página.</p> : null}
      <table className="hub-carriers-audit-table"><thead><tr><th>Data</th><th>Responsável</th><th>Ação</th><th>Detalhes</th></tr></thead>
        {auditQuery.isLoading ? <AuditLoading /> : <tbody>{logs.length ? logs.map((log) => <tr key={log.id}><td data-label="Data">{formatDate(log.created_at)}</td><td data-label="Responsável"><div className="hub-carriers-audit-person"><strong>{log.admin?.name || 'Sistema'}</strong><span>{log.admin?.role || 'Automático'}</span></div></td><td data-label="Ação"><Badge variant="info">{log.acao}</Badge></td><td data-label="Detalhes">{log.detalhes}</td></tr>) : <tr><td colSpan="4"><section className="hub-carriers-empty"><div><History aria-hidden="true" size={28} /><h2>Nenhum registro encontrado</h2><p>Altere o período para consultar outras atividades.</p></div></section></td></tr>}</tbody>}
      </table>
      {!auditQuery.isLoading && lastPage > 1 ? <footer className="hub-carriers-pagination"><Button variant="secondary" size="sm" icon={ChevronLeft} disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Anterior</Button><span className="hub-carrier-meta">Página {page} de {lastPage}</span><Button variant="secondary" size="sm" icon={ChevronRight} disabled={page === lastPage} onClick={() => setPage((current) => current + 1)}>Próxima</Button></footer> : null}
    </section>
  );
};
