import React from 'react';

export const Badge = ({ children, variant = 'neutral', className = '' }) => {
  const variants = {
    success: 'bg-[var(--hub-success-soft)] text-[var(--hub-success)] border border-[var(--hub-success)]/20',
    warning: 'bg-[var(--hub-warning-soft)] text-[var(--hub-warning)] border border-[var(--hub-warning)]/20',
    danger: 'bg-[var(--hub-danger-soft)] text-[var(--hub-danger)] border border-[var(--hub-danger)]/20',
    info: 'bg-[var(--hub-info-soft)] text-[var(--hub-info)] border border-[var(--hub-info)]/20',
    special: 'bg-[var(--hub-special-soft)] text-[var(--hub-special)] border border-[var(--hub-special)]/20',
    neutral: 'bg-[var(--hub-surface-subtle)] text-[var(--hub-text-muted)] border border-[var(--hub-border-subtle)]',
  };

  return (
    <span className={`inline-flex items-center justify-center px-[8px] h-[24px] text-[12px] font-semibold rounded-[var(--hub-radius-sm)] ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
