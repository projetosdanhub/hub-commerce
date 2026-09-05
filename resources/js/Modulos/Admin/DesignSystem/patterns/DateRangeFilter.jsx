import React, { useEffect, useId, useRef, useState } from 'react';
import { ArrowLeft, CalendarDays, Check, ChevronDown } from 'lucide-react';
import { Button } from '../primitives/Button';
import { FilterButton } from '../primitives/FilterButton';

export const DATE_RANGE_PRESETS = [
  { value: 'ALL', label: 'Todo o período' },
  { value: 'TODAY', label: 'Hoje' },
  { value: 'LAST_7', label: 'Últimos 7 dias' },
  { value: 'MONTH', label: 'Este mês' },
  { value: 'LAST_MONTH', label: 'Último mês' },
  { value: 'CUSTOM', label: 'Personalizado' },
];

export const toDateInputValue = (date) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0'),
].join('-');

export const getDateRange = (period, now = new Date()) => {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (period === 'ALL') return { startDate: '', endDate: '' };

  if (period === 'LAST_MONTH') {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const end = new Date(today.getFullYear(), today.getMonth(), 0);

    return {
      startDate: toDateInputValue(start),
      endDate: toDateInputValue(end),
    };
  }

  const start = new Date(today);

  if (period === 'LAST_7') start.setDate(today.getDate() - 6);
  if (period === 'MONTH') start.setDate(1);

  return {
    startDate: toDateInputValue(start),
    endDate: toDateInputValue(today),
  };
};

export const getSelectedDateRangePreset = ({ startDate = '', endDate = '' } = {}) => {
  if (!startDate && !endDate) return 'ALL';

  const matchedPreset = DATE_RANGE_PRESETS.find(({ value }) => {
    if (value === 'ALL' || value === 'CUSTOM') return false;

    const range = getDateRange(value);
    return range.startDate === startDate && range.endDate === endDate;
  });

  return matchedPreset?.value || 'CUSTOM';
};

export const formatDateRange = ({ startDate, endDate }) => {
  if (!startDate || !endDate) return 'Todo o período';

  const formatter = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const format = (value) => formatter.format(new Date(value + 'T12:00:00'));
  return format(startDate) + ' — ' + format(endDate);
};

export const getDateRangeLabel = (range) => {
  const preset = getSelectedDateRangePreset(range);
  const presetLabel = DATE_RANGE_PRESETS.find((item) => item.value === preset)?.label;

  return preset === 'CUSTOM' ? formatDateRange(range) : presetLabel || formatDateRange(range);
};

export const DateRangeFilter = ({
  value = {},
  onApply,
  label = 'Filtrar por período',
  className = '',
}) => {
  const rootRef = useRef(null);
  const startInputRef = useRef(null);
  const id = useId();
  const startDate = value.startDate || '';
  const endDate = value.endDate || '';
  const selectedPreset = getSelectedDateRangePreset({ startDate, endDate });
  const [open, setOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(selectedPreset === 'CUSTOM');
  const [draft, setDraft] = useState({ startDate, endDate });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return undefined;

    const closeWhenOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };

    const closeWithEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', closeWhenOutside);
    document.addEventListener('keydown', closeWithEscape);

    return () => {
      document.removeEventListener('pointerdown', closeWhenOutside);
      document.removeEventListener('keydown', closeWithEscape);
    };
  }, [open]);

  useEffect(() => {
    if (customOpen && open) startInputRef.current?.focus();
  }, [customOpen, open]);

  const close = () => {
    setOpen(false);
    setError('');
  };

  const toggleOpen = () => {
    if (open) {
      close();
      return;
    }

    setDraft({ startDate, endDate });
    setCustomOpen(selectedPreset === 'CUSTOM');
    setError('');
    setOpen(true);
  };

  const applyPreset = (preset) => {
    if (preset === 'CUSTOM') {
      setCustomOpen(true);
      setError('');
      return;
    }

    onApply?.(getDateRange(preset));
    close();
  };

  const returnToPresets = () => {
    setCustomOpen(false);
    setError('');
    setDraft({ startDate, endDate });
  };

  const applyCustomRange = () => {
    if (!draft.startDate || !draft.endDate) {
      setError('Selecione a data inicial e a final.');
      return;
    }

    if (draft.startDate > draft.endDate) {
      setError('A data inicial deve ser anterior à data final.');
      return;
    }

    onApply?.(draft);
    close();
  };

  return (
    <div className={'hub-date-range-filter ' + className} ref={rootRef}>
      <FilterButton
        icon={CalendarDays}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={id + '-popover'}
        onClick={toggleOpen}
      >
        <span className="hub-date-range-trigger-label">{getDateRangeLabel({ startDate, endDate })}</span>
        <ChevronDown aria-hidden="true" size={16} className="hub-date-range-trigger-chevron" />
      </FilterButton>

      {open ? (
        <div id={id + '-popover'} className="hub-date-range-popover" role="dialog" aria-label={label}>
          {customOpen ? (
            <div className="hub-date-range-custom">
              <div>
                <p className="hub-date-range-custom-title">Período personalizado</p>
                <p>Selecione o intervalo que deseja consultar.</p>
              </div>
              <div className="hub-date-range-inputs">
                <label htmlFor={id + '-start'}>
                  De
                  <input
                    ref={startInputRef}
                    id={id + '-start'}
                    type="date"
                    value={draft.startDate}
                    onChange={(event) => {
                      setDraft((current) => ({ ...current, startDate: event.target.value }));
                      setError('');
                    }}
                  />
                </label>
                <label htmlFor={id + '-end'}>
                  Até
                  <input
                    id={id + '-end'}
                    type="date"
                    value={draft.endDate}
                    onChange={(event) => {
                      setDraft((current) => ({ ...current, endDate: event.target.value }));
                      setError('');
                    }}
                  />
                </label>
              </div>
              {error ? <p className="hub-date-range-error" role="alert">{error}</p> : null}
              <div className="hub-date-range-actions">
                <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={returnToPresets}>Voltar</Button>
                <Button size="sm" onClick={applyCustomRange}>Filtrar</Button>
              </div>
            </div>
          ) : (
            <div className="hub-date-range-options">
              {DATE_RANGE_PRESETS.map((preset) => {
                const active = selectedPreset === preset.value;

                return (
                  <button
                    key={preset.value}
                    type="button"
                    className="hub-date-range-option"
                    data-active={active}
                    onClick={() => applyPreset(preset.value)}
                  >
                    <span>{preset.label}</span>
                    {active ? <Check aria-hidden="true" size={16} /> : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
