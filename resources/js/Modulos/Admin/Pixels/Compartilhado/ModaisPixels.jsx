import React, { Component, useEffect, useRef, useState } from 'react';
import { AlertTriangle, ArrowDown, ArrowUp, BookMarked, Calendar, Check, Info, Loader2, Settings2, X } from 'lucide-react';
import { dictionaryData } from './ConstantesPixels';
import { Badge } from '../../DesignSystem/primitives/Badge';
import { Button } from '../../DesignSystem/primitives/Button';
import { IconButton } from '../../DesignSystem/primitives/IconButton';

const DialogShell = ({ open, onClose, title, description, children, className = '' }) => {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    const frame = window.requestAnimationFrame(() => closeRef.current?.focus());
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
      if (event.key !== 'Tab') return;
      const selector = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
      const focusable = Array.from(dialogRef.current?.querySelectorAll(selector) ?? []);
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => { window.cancelAnimationFrame(frame); document.removeEventListener('keydown', handleKeyDown); if (previousFocus instanceof HTMLElement) previousFocus.focus(); };
  }, [open, onClose]);

  if (!open) return null;
  return <div className="hub-order-dialog-backdrop" role="presentation"><section ref={dialogRef} className={`hub-order-dialog hub-pixel-dialog ${className}`} role="dialog" aria-modal="true" aria-labelledby="pixel-dialog-title" aria-describedby="pixel-dialog-description"><header><div><h2 id="pixel-dialog-title">{title}</h2><p id="pixel-dialog-description">{description}</p></div><IconButton ref={closeRef} icon={X} label="Fechar" onClick={onClose} /></header>{children}</section></div>;
};

export const ConfigMetricsModal = ({ isOpen, onClose, config, setConfig, cardProps }) => {
  const [selected, setSelected] = useState(null);
  const keys = Object.keys(cardProps);
  const toggle = (key) => setConfig((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
  const move = (key, direction) => setConfig((current) => {
    const index = current.indexOf(key);
    const target = direction === 'up' ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= current.length) return current;
    const next = [...current]; [next[index], next[target]] = [next[target], next[index]]; return next;
  });
  const metric = selected ? cardProps[selected] : null;

  return <DialogShell open={isOpen} onClose={onClose} title="Personalizar painel" description="Escolha e ordene apenas as métricas que deseja acompanhar.">
    <div className="hub-pixel-dialog-grid"><div className="hub-pixel-dialog-list">{keys.map((key) => { const item = cardProps[key]; const active = config.includes(key); const Icon = item.icon; const index = config.indexOf(key); return <article key={key} className="hub-pixel-dialog-item" data-active={active}><button type="button" onClick={() => { toggle(key); setSelected(key); }}><span><Icon aria-hidden="true" size={16} />{item.label}</span><Badge variant={active ? 'success' : 'neutral'}>{active ? 'Exibida' : 'Oculta'}</Badge></button>{active ? <div className="hub-pixel-order-actions"><IconButton icon={ArrowUp} label={`Mover ${item.label} para cima`} disabled={index === 0} onClick={() => move(key, 'up')} /><IconButton icon={ArrowDown} label={`Mover ${item.label} para baixo`} disabled={index === config.length - 1} onClick={() => move(key, 'down')} /></div> : null}</article>; })}</div><aside className="hub-pixel-dialog-preview">{metric ? <><h3>{metric.label}</h3><p>{metric.tooltip}</p><code className="hub-inline-code">{metric.formula}</code></> : <p>Selecione uma métrica para consultar a definição e o cálculo.</p>}</aside></div>
  </DialogShell>;
};

export const MetricsDictionaryModal = ({ isOpen, onClose }) => {
  const [selected, setSelected] = useState(null);
  const groups = [...new Set(dictionaryData.map((item) => item.group))];
  return <DialogShell open={isOpen} onClose={onClose} title="Catálogo de métricas" description="Definições disponíveis para o painel de tracking.">
    <div className="hub-pixel-dialog-grid"><div className="hub-pixel-dialog-list">{groups.map((group) => <section key={group}><p className="hub-page-eyebrow">{group}</p>{dictionaryData.filter((item) => item.group === group).map((item) => <button key={item.id} type="button" className="hub-pixel-dictionary-item" data-active={selected?.id === item.id} onClick={() => setSelected(item)}>{item.title}</button>)}</section>)}</div><aside className="hub-pixel-dialog-preview">{selected ? <><BookMarked aria-hidden="true" size={22} /><h3>{selected.title}</h3><p>{selected.desc}</p><code className="hub-inline-code">{selected.formula}</code></> : <p>Selecione uma métrica para consultar sua definição.</p>}</aside></div>
  </DialogShell>;
};

export const DateFilterPopup = ({ dateRange, setDateRange, onApply, onClear, loading, isOpen, onClose }) => {
  if (!isOpen) return null;
  return <section className="hub-pixel-date-popover" role="dialog" aria-label="Filtrar período"><header><Calendar aria-hidden="true" size={16} /><strong>Filtrar período</strong></header><div className="space-y-4"><label className="hub-order-form-field"><span>Data inicial</span><input type="date" value={dateRange.start} onChange={(event) => setDateRange((current) => ({ ...current, start: event.target.value }))} /></label><label className="hub-order-form-field"><span>Data final</span><input type="date" value={dateRange.end} onChange={(event) => setDateRange((current) => ({ ...current, end: event.target.value }))} /></label><footer><Button size="sm" variant="ghost" disabled={loading} onClick={onClear}>Limpar</Button><Button size="sm" loading={loading} disabled={!dateRange.start || !dateRange.end} onClick={onApply}>Aplicar</Button></footer></div></section>;
};

export const PixelNotification = ({ show, status = 'success', titulo }) => {
  if (!show) return null;
  const error = status === 'error';
  return <div className="hub-pixel-notification" role={error ? 'alert' : 'status'}><span className="hub-orders-metric-icon">{status === 'loading' ? <Loader2 aria-hidden="true" size={18} className="hub-spinner" /> : error ? <AlertTriangle aria-hidden="true" size={18} /> : <Check aria-hidden="true" size={18} />}</span><div><strong>{error ? 'Atenção' : status === 'loading' ? 'Processando' : 'Concluído'}</strong><p>{titulo}</p></div></div>;
};

export class PixelErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { if (this.state.hasError) return <section className="hub-surface hub-error-state" role="alert"><div><AlertTriangle aria-hidden="true" size={28} /><h2 className="hub-panel-title">Não foi possível exibir a Central de Tracking</h2><p>Atualize a página para tentar carregar novamente.</p><Button className="mt-5" onClick={() => window.location.reload()}>Atualizar página</Button></div></section>; return this.props.children; }
};
