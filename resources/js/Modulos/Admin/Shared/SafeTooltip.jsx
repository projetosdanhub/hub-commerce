import React from 'react';
import { CircleHelp } from 'lucide-react';

export const SafeTooltip = ({ children, text, title }) => (
  <span className="group relative inline-flex cursor-help items-center justify-center">
    {children || <CircleHelp aria-hidden="true" className="h-4 w-4 text-[var(--hub-text-muted)]" />}
    <span role="tooltip" className="pointer-events-none absolute bottom-full z-[99999] mb-2 hidden w-max max-w-[250px] rounded-[var(--hub-radius-md)] border border-[var(--hub-border-strong)] bg-[var(--hub-text)] px-3 py-2 text-center text-[11px] font-medium leading-5 text-white shadow-lg group-hover:flex group-focus-within:flex flex-col">
      {title ? <strong className="mb-1 border-b border-[var(--hub-border-strong)] pb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--hub-primary-soft)]">{title}</strong> : null}
      <span className="font-mono text-[var(--hub-surface-subtle)]">{text}</span>
    </span>
  </span>
);
