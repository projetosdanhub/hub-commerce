import React from 'react';
import { Info } from 'lucide-react';
import { Tooltip } from './Tooltip';

export const MetricCard = ({
  icon: Icon,
  label,
  value,
  detail,
  definition,
  tone = 'default',
}) => (
  <article className="hub-metric-card" data-tone={tone}>
    <div className="hub-metric-card-heading">
      <span className="hub-metric-card-icon"><Icon aria-hidden="true" size={18} /></span>
      {definition ? (
        <Tooltip content={definition}>
          <button type="button" className="hub-metric-definition" aria-label={`Entender métrica: ${label}`}>
            <Info aria-hidden="true" size={15} />
          </button>
        </Tooltip>
      ) : null}
    </div>
    <p>{label}</p>
    <strong>{value}</strong>
    <span>{detail}</span>
  </article>
);
