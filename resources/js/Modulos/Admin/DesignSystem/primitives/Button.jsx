import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  icon: Icon,
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-[var(--hub-radius-md)] transition-colors focus:outline-none focus-visible:ring-[var(--hub-focus-ring)] disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeClasses = {
    sm: 'h-[36px] px-[12px] text-[13px] gap-[8px]',
    md: 'h-[40px] px-[16px] text-[14px] gap-[8px]',
  };

  const variantClasses = {
    primary: 'bg-[var(--hub-primary)] text-[var(--hub-text-on-color)] hover:bg-[var(--hub-primary-hover)] active:bg-[var(--hub-primary-pressed)] border border-transparent',
    secondary: 'bg-[var(--hub-surface)] text-[var(--hub-text)] border border-[var(--hub-border)] hover:border-[var(--hub-border-strong)] hover:bg-[var(--hub-surface-subtle)] active:bg-[var(--hub-border-subtle)]',
    ghost: 'bg-transparent text-[var(--hub-text-secondary)] hover:bg-[var(--hub-surface-subtle)] hover:text-[var(--hub-text)] active:bg-[var(--hub-surface-accent)] border border-transparent',
    danger: 'bg-[var(--hub-danger)] text-[var(--hub-text-on-color)] hover:bg-rose-700 active:bg-rose-800 border border-transparent',
  };

  const iconSize = size === 'sm' ? 16 : 18;

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader2 size={iconSize} className="animate-spin shrink-0" />}
      {!loading && Icon && <Icon size={iconSize} className="shrink-0" />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
