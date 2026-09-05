import React, { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { IconButton } from '../primitives/IconButton';

export const shouldScheduleSearchCollapse = ({ hasBeenFilled, value }) => (
  Boolean(hasBeenFilled && !String(value || '').trim())
);

export const ExpandableSearch = ({
  value,
  onChange,
  label = 'Buscar',
  placeholder = 'Buscar',
  collapseDelay = 2000,
  className = '',
}) => {
  const inputRef = useRef(null);
  const wasFilledRef = useRef(Boolean(String(value || '').trim()));
  const [expanded, setExpanded] = useState(Boolean(String(value || '').trim()));

  useEffect(() => {
    if (String(value || '').trim()) wasFilledRef.current = true;
  }, [value]);

  useEffect(() => {
    if (!expanded || !shouldScheduleSearchCollapse({ hasBeenFilled: wasFilledRef.current, value })) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setExpanded(false);
      wasFilledRef.current = false;
    }, collapseDelay);

    return () => window.clearTimeout(timeout);
  }, [collapseDelay, expanded, value]);

  const expand = () => {
    wasFilledRef.current = Boolean(String(value || '').trim());
    setExpanded(true);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const clear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className={'hub-expandable-search ' + className} data-expanded={expanded}>
      <IconButton
        className="hub-expandable-search-trigger"
        icon={Search}
        label={expanded && value ? 'Limpar busca' : expanded ? 'Fechar ' + label.toLowerCase() : label}
        tooltip={expanded && value ? 'Limpar busca' : expanded ? 'A busca recolhe após dois segundos sem texto' : label}
        aria-expanded={expanded}
        aria-controls="hub-expandable-search-input"
        onClick={() => {
          if (expanded) {
            if (value) clear();
            else setExpanded(false);
            return;
          }

          expand();
        }}
      />
      <label className="hub-expandable-search-field" htmlFor="hub-expandable-search-input">
        <span className="sr-only">{label}</span>
        <input
          ref={inputRef}
          id="hub-expandable-search-input"
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          tabIndex={expanded ? 0 : -1}
        />
        {value ? (
          <IconButton
            className="hub-expandable-search-clear"
            icon={X}
            label="Limpar busca"
            size="sm"
            onClick={clear}
          />
        ) : null}
      </label>
    </div>
  );
};
