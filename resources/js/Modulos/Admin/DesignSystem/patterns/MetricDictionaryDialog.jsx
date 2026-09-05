import React, { useEffect, useState } from 'react';
import { BookOpen, X } from 'lucide-react';
import { IconButton } from '../primitives/IconButton';
import { ModalDialog } from './ModalDialog';

export const MetricDictionaryDialog = ({ metrics, onClose }) => {
  const [activeId, setActiveId] = useState(() => metrics[0]?.id || '');

  useEffect(() => {
    if (!metrics.some((metric) => metric.id === activeId)) {
      setActiveId(metrics[0]?.id || '');
    }
  }, [activeId, metrics]);

  const activeMetric = metrics.find((metric) => metric.id === activeId) || metrics[0];

  if (!activeMetric) return null;

  const ActiveIcon = activeMetric.icon;

  return (
    <ModalDialog
      className="hub-metric-dialog"
      labelledBy="metric-dictionary-title"
      describedBy="metric-dictionary-description"
      onClose={onClose}
    >
      <header className="hub-metric-dialog-header">
        <span className="hub-metric-dialog-icon"><BookOpen aria-hidden="true" size={20} /></span>
        <div>
          <h2 id="metric-dictionary-title">Dicionário de métricas</h2>
          <p id="metric-dictionary-description">Consulte a definição e a forma de cálculo de cada indicador deste painel.</p>
        </div>
        <IconButton className="hub-metric-dialog-close" icon={X} label="Fechar dicionário de métricas" onClick={onClose} />
      </header>

      <div className="hub-metric-dictionary-content">
        <div className="hub-metric-dictionary-list" role="listbox" aria-label="Métricas disponíveis">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const active = metric.id === activeMetric.id;

            return (
              <button
                key={metric.id}
                type="button"
                role="option"
                aria-selected={active}
                data-active={active}
                onClick={() => setActiveId(metric.id)}
                onFocus={() => setActiveId(metric.id)}
                onMouseEnter={() => setActiveId(metric.id)}
              >
                <span><Icon aria-hidden="true" size={17} /></span>
                <strong>{metric.label}</strong>
              </button>
            );
          })}
        </div>

        <article className="hub-metric-dictionary-detail" aria-live="polite">
          <span className="hub-metric-dictionary-detail-icon"><ActiveIcon aria-hidden="true" size={19} /></span>
          <p>Indicador</p>
          <h3>{activeMetric.label}</h3>
          <dl>
            <div>
              <dt>O que representa</dt>
              <dd>{activeMetric.definition}</dd>
            </div>
            <div>
              <dt>Como é calculado</dt>
              <dd>{activeMetric.calculation}</dd>
            </div>
          </dl>
        </article>
      </div>
    </ModalDialog>
  );
};
