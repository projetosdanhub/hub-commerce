import React from 'react';
import { Loader2 } from 'lucide-react';

export const IconButton = React.forwardRef(({
  icon: Icon,
  label,
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      type={type}
      title={label}
      aria-label={label}
      disabled={disabled || loading}
      className={`relative flex items-center justify-center w-[40px] h-[40px] rounded-full text-[var(--hub-text-secondary)] transition-all hover:bg-[var(--hub-primary-soft)] hover:text-[var(--hub-primary)] active:scale-95 focus:outline-none focus-visible:ring-[var(--hub-focus-ring)] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Icon size={18} strokeWidth={1.8} />
      )}
    </button>
  );
});

IconButton.displayName = 'IconButton';
