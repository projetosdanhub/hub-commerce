import React from 'react';

const variants = {
  success: 'hub-badge-success',
  warning: 'hub-badge-warning',
  danger: 'hub-badge-danger',
  info: 'hub-badge-info',
  special: 'hub-badge-special',
  neutral: 'hub-badge-neutral',
};

export const Badge = ({ children, variant = 'neutral', className = '' }) => (
  <span className={`hub-badge ${variants[variant]} ${className}`}>
    {children}
  </span>
);
