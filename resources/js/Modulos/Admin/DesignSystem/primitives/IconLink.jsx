import React from 'react';
import { Tooltip } from './Tooltip';

export const IconLink = ({
  icon: Icon,
  label,
  className = '',
  ...props
}) => (
  <Tooltip content={label}>
    <a
      className={`hub-icon-button ${className}`}
      aria-label={label}
      {...props}
    >
      <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
      {children}
    </a>
  </Tooltip>
);
