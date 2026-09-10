import React from 'react';

export const MetricCard = ({
  icon: Icon,
  label,
  value,
  detail,
  tone = 'default',
}) => (
  <article className="hub-metric-card" data-tone={tone}>
    <div className="hub-metric-card-heading">
      <span className="hub-metric-card-icon"><Icon aria-hidden="true" size={18} /></span>
    </div>
    <p>{label}</p>
    <strong>{value}</strong>
    <span>{detail}</span>
  </article>
);
