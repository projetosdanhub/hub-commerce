import React, { useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { ArrowDown, ArrowUp, Eye, EyeOff, GripVertical, Settings2, X } from 'lucide-react';
import { Button } from '../primitives/Button';
import { IconButton } from '../primitives/IconButton';
import { ModalDialog } from './ModalDialog';

const uniqueKnownIds = (ids, knownIds) => [...new Set(ids || [])].filter((id) => knownIds.includes(id));

export const normalizeMetricPreferences = (preferences, metrics) => {
  const metricIds = metrics.map((metric) => metric.id);
  const orderedIds = uniqueKnownIds(preferences?.order, metricIds);
  const order = [...orderedIds, ...metricIds.filter((id) => !orderedIds.includes(id))];
  const hidden = uniqueKnownIds(preferences?.hidden, metricIds);

  return { order, hidden };
};

const moveItem = (items, from, to) => {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

export const MetricPreferencesDialog = ({
  metrics,
  preferences,
  saving = false,
  onClose,
  onSave,
}) => {
  const [draft, setDraft] = useState(() => normalizeMetricPreferences(preferences, metrics));
  const [activeId, setActiveId] = useState(() => metrics[0]?.id || '');
  const [error, setError] = useState('');

  const orderedMetrics = useMemo(
    () => draft.order.map((id) => metrics.find((metric) => metric.id === id)).filter(Boolean),
    [draft.order, metrics],
  );
  const activeMetric = metrics.find((metric) => metric.id === activeId) || orderedMetrics[0];
  const visibleCount = draft.order.filter((id) => !draft.hidden.includes(id)).length;

  if (!activeMetric) return null;

  const ActiveIcon = activeMetric.icon;

  const changeOrder = (sourceIndex, destinationIndex) => {
    if (destinationIndex === null || destinationIndex === undefined || sourceIndex === destinationIndex) return;
    setDraft((current) => ({ ...current, order: moveItem(current.order, sourceIndex, destinationIndex) }));
  };

  const toggleVisibility = (id) => {
    setDraft((current) => ({
      ...current,
      hidden: current.hidden.includes(id)
        ? current.hidden.filter((item) => item !== id)
        : [...current.hidden, id],
    }));
  };

  const submit = async () => {
    if (!visibleCount) {
      setError('Mantenha ao menos uma métrica visível no painel.');
      return;
    }

    setError('');

    try {
      await onSave(draft);
      onClose();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Não foi possível salvar a configuração agora.');
    }
  };

  return (
    <ModalDialog
      className="hub-metric-dialog hub-metric-preferences-dialog"
      labelledBy="metric-preferences-title"
      describedBy="metric-preferences-description"
      onClose={onClose}
    >
      <header className="hub-metric-dialog-header">
        <span className="hub-metric-dialog-icon"><Settings2 aria-hidden="true" size={20} /></span>
        <div>
          <h2 id="metric-preferences-title">Organizar métricas</h2>
          <p id="metric-preferences-description">Defina a ordem e quais indicadores aparecem no seu painel de pedidos.</p>
        </div>
        <IconButton className="hub-metric-dialog-close" icon={X} label="Fechar organização de métricas" onClick={onClose} />
      </header>

      <div className="hub-metric-preferences-content">
        <DragDropContext
          onDragEnd={({ source, destination }) => changeOrder(source.index, destination?.index)}
        >
          <Droppable droppableId="orders-metrics">
            {(provided) => (
              <ol
                ref={provided.innerRef}
                className="hub-metric-preferences-list"
                {...provided.droppableProps}
              >
                {orderedMetrics.map((metric, index) => {
                  const Icon = metric.icon;
                  const hidden = draft.hidden.includes(metric.id);
                  const active = metric.id === activeMetric.id;

                  return (
                    <Draggable key={metric.id} draggableId={metric.id} index={index}>
                      {(draggableProvided) => (
                        <li
                          ref={draggableProvided.innerRef}
                          {...draggableProvided.draggableProps}
                          data-active={active}
                          data-hidden={hidden}
                          onFocus={() => setActiveId(metric.id)}
                          onMouseEnter={() => setActiveId(metric.id)}
                        >
                          <button
                            type="button"
                            className="hub-metric-drag-handle"
                            aria-label={'Reordenar ' + metric.label}
                            {...draggableProvided.dragHandleProps}
                          >
                            <GripVertical aria-hidden="true" size={18} />
                          </button>
                          <span className="hub-metric-preference-icon"><Icon aria-hidden="true" size={17} /></span>
                          <strong>{metric.label}</strong>
                          <div className="hub-metric-preference-actions">
                            <IconButton
                              icon={ArrowUp}
                              label={'Mover ' + metric.label + ' para cima'}
                              size="sm"
                              disabled={index === 0}
                              onClick={() => changeOrder(index, index - 1)}
                            />
                            <IconButton
                              icon={ArrowDown}
                              label={'Mover ' + metric.label + ' para baixo'}
                              size="sm"
                              disabled={index === orderedMetrics.length - 1}
                              onClick={() => changeOrder(index, index + 1)}
                            />
                            <IconButton
                              icon={hidden ? EyeOff : Eye}
                              label={hidden ? 'Exibir ' + metric.label : 'Ocultar ' + metric.label}
                              variant={hidden ? 'neutral' : 'primary'}
                              size="sm"
                              onClick={() => toggleVisibility(metric.id)}
                            />
                          </div>
                        </li>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </ol>
            )}
          </Droppable>
        </DragDropContext>

        <aside className="hub-metric-dictionary-detail" aria-live="polite">
          <span className="hub-metric-dictionary-detail-icon"><ActiveIcon aria-hidden="true" size={19} /></span>
          <p>Indicador selecionado</p>
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
        </aside>
      </div>

      {error ? <p className="hub-metric-dialog-error" role="alert">{error}</p> : null}

      <footer className="hub-metric-dialog-footer">
        <span>{visibleCount} de {metrics.length} métricas visíveis</span>
        <div>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button loading={saving} onClick={submit}>Salvar painel</Button>
        </div>
      </footer>
    </ModalDialog>
  );
};
