import React, { useEffect, useRef, useState } from 'react';
import { AppWindow, ArrowDownToLine, ArrowLeft, ChevronLeft, ChevronRight, Clock, Eye, FormInput, Globe, MousePointer2, Pencil, Plus, Trash2, Zap } from 'lucide-react';
import { Badge } from '../../DesignSystem/primitives/Badge';
import { Button } from '../../DesignSystem/primitives/Button';
import { FilterSelect } from '../../DesignSystem/primitives/FilterSelect';
import { IconButton } from '../../DesignSystem/primitives/IconButton';
import { Tooltip } from '../../DesignSystem/primitives/Tooltip';

const TRIGGER_TYPES = {
  click: { label: 'Clique em elemento', icon: MousePointer2 },
  click_link: { label: 'Clique em link', icon: MousePointer2 },
  url_contains: { label: 'URL contém', icon: Globe },
  url_exact: { label: 'URL exata', icon: Globe },
  url_starts_with: { label: 'URL inicia com', icon: Globe },
  url_ends_with: { label: 'URL termina com', icon: Globe },
  url_regex: { label: 'URL por expressão', icon: Globe },
  scroll: { label: 'Profundidade de rolagem', icon: ArrowDownToLine },
  time: { label: 'Tempo na página', icon: Clock },
  form_submit: { label: 'Envio de formulário', icon: FormInput },
  element_visibility: { label: 'Elemento visível', icon: Eye },
  exit_intent: { label: 'Intenção de saída', icon: ArrowLeft },
  custom_event: { label: 'Evento customizado', icon: Zap },
  video_play: { label: 'Reprodução de vídeo', icon: Zap },
  js_error: { label: 'Erro de JavaScript', icon: Zap },
};

const triggerInfo = (type) => TRIGGER_TYPES[type] || { label: 'Tipo não informado', icon: AppWindow };

const TriggerCell = ({ trigger }) => {
  const info = triggerInfo(trigger.tipo_gatilho);
  const Icon = info.icon;
  return <div className="space-y-1.5">
    <span className="inline-flex items-center gap-1.5 text-sm font-medium"><Icon aria-hidden="true" size={15} />{info.label}</span>
    {trigger.valor_gatilho ? <code className="hub-inline-code">{trigger.valor_gatilho}</code> : null}
    <span className="block text-xs text-[var(--hub-text-secondary)]">Alvo: {trigger.url_alvo ?? 'Não informado'}</span>
  </div>;
};

const TriggerActions = ({ trigger, onEdit, onRequestDelete, busy }) => (
  <div className="flex justify-end gap-1">
    <Tooltip content="Editar regra"><IconButton icon={Pencil} label={`Editar ${trigger.nome}`} disabled={busy} onClick={() => onEdit(trigger)} /></Tooltip>
    <Tooltip content="Excluir regra"><IconButton icon={Trash2} label={`Excluir ${trigger.nome}`} disabled={busy} onClick={() => onRequestDelete(trigger)} /></Tooltip>
  </div>
);

const DeleteDialog = ({ trigger, onCancel, onConfirm, busy }) => {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!trigger) return undefined;
    const previousFocus = document.activeElement;
    const frame = window.requestAnimationFrame(() => cancelRef.current?.focus());
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !busy) {
        event.preventDefault();
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [trigger, busy, onCancel]);

  if (!trigger) return null;
  return <div className="hub-order-dialog-backdrop" role="presentation">
    <section className="hub-order-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-trigger-title" aria-describedby="delete-trigger-description">
      <header><div><h2 id="delete-trigger-title">Excluir acionador?</h2><p id="delete-trigger-description">A regra “{trigger.nome}” será removida e deixará de disparar eventos.</p></div></header>
      <footer><Button ref={cancelRef} variant="ghost" disabled={busy} onClick={onCancel}>Cancelar</Button><Button variant="danger" loading={busy} onClick={() => onConfirm(trigger.id)}>Excluir regra</Button></footer>
    </section>
  </div>;
};

const MobileTriggers = ({ triggers, onEdit, onRequestDelete, busy }) => <div className="md:hidden space-y-3">
  {triggers.map((trigger) => <article key={trigger.id} className="hub-surface p-4 space-y-4">
    <div className="flex items-start justify-between gap-3"><div><strong>{trigger.nome}</strong><p className="mt-1 font-mono text-xs text-[var(--hub-text-secondary)]">{trigger.evento || 'Evento não informado'}</p></div><Badge variant={trigger.status ? 'success' : 'neutral'}>{trigger.status ? 'Ativa' : 'Pausada'}</Badge></div>
    <TriggerCell trigger={trigger} /><div className="flex justify-end"><TriggerActions trigger={trigger} onEdit={onEdit} onRequestDelete={onRequestDelete} busy={busy} /></div>
  </article>)}
</div>;

const CustomTriggers = ({ acionadoresPaginados, paginaAtual, setPaginaAtual, totalPaginas, itensPorPagina, setItensPorPagina, onEdit, onDelete, onNovaRegra, isSaving }) => {
  const [pendingDelete, setPendingDelete] = useState(null);
  const total = Math.max(totalPaginas, 1);
  const requestDelete = (trigger) => setPendingDelete(trigger);
  const confirmDelete = async (id) => { try { await onDelete(id); setPendingDelete(null); } catch { /* O toast global já descreve a falha. */ } };

  return <section className="space-y-4">
    <header className="hub-order-detail-heading">
      <div className="flex items-center gap-3"><span className="hub-orders-metric-icon"><AppWindow aria-hidden="true" size={20} /></span><div><p className="hub-page-eyebrow">Regras de conversão</p><h2 className="hub-card-title">Acionadores personalizados</h2><p className="hub-page-subtitle">Crie regras auditáveis para disparar eventos em páginas e elementos da vitrine.</p></div></div>
      <Button icon={Plus} disabled={isSaving} onClick={onNovaRegra}>Nova regra</Button>
    </header>

    {acionadoresPaginados.length ? <><div className="hidden md:block hub-order-table-wrap"><table className="hub-order-table"><thead><tr><th>Regra</th><th>Evento</th><th>Gatilho e alvo</th><th>Parâmetros</th><th>Status</th><th className="text-right">Ações</th></tr></thead><tbody>
      {acionadoresPaginados.map((trigger) => <tr key={trigger.id}><td><strong>{trigger.nome}</strong></td><td><code className="hub-inline-code">{trigger.evento || 'Não informado'}</code></td><td><TriggerCell trigger={trigger} /></td><td>{Object.values(trigger.payload || {}).filter(Boolean).length}</td><td><Badge variant={trigger.status ? 'success' : 'neutral'}>{trigger.status ? 'Ativa' : 'Pausada'}</Badge></td><td><TriggerActions trigger={trigger} onEdit={onEdit} onRequestDelete={requestDelete} busy={isSaving} /></td></tr>)}
    </tbody></table></div><MobileTriggers triggers={acionadoresPaginados} onEdit={onEdit} onRequestDelete={requestDelete} busy={isSaving} /></> : <section className="hub-empty-state"><div><AppWindow aria-hidden="true" size={28} /><h2 className="hub-panel-title">Nenhuma regra criada</h2><p>Crie um acionador quando houver uma conversão real a rastrear.</p><Button className="mt-5" icon={Plus} onClick={onNovaRegra}>Criar primeira regra</Button></div></section>}

    <footer className="hub-orders-pagination"><span>Página {paginaAtual} de {total}</span><div className="flex items-center gap-2"><FilterSelect label="Itens por página" value={String(itensPorPagina)} onChange={(event) => { setItensPorPagina(Number(event.target.value)); setPaginaAtual(1); }}><option value="10">10</option><option value="20">20</option><option value="30">30</option><option value="50">50</option></FilterSelect><IconButton icon={ChevronLeft} label="Página anterior" disabled={paginaAtual === 1 || isSaving} onClick={() => setPaginaAtual((page) => Math.max(1, page - 1))} /><IconButton icon={ChevronRight} label="Próxima página" disabled={paginaAtual >= total || isSaving} onClick={() => setPaginaAtual((page) => Math.min(total, page + 1))} /></div></footer>
    <DeleteDialog trigger={pendingDelete} onCancel={() => setPendingDelete(null)} onConfirm={confirmDelete} busy={isSaving} />
  </section>;
};

export default CustomTriggers;