import React from 'react';
import { Loader2 } from 'lucide-react';
import { Tooltip } from './Tooltip';

const variants = {
  neutral: 'hub-icon-button-neutral',
  primary: 'hub-icon-button-primary',
  danger: 'hub-icon-button-danger',
};

const sizes = {
  sm: 'hub-icon-button-sm',
  md: 'hub-icon-button-md',
};

export const IconButton = React.forwardRef(({
  icon: Icon,
  label,
  tooltip = label,
  variant = 'neutral',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}, ref) => {
  const control = (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={`hub-icon-button ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading
        ? <Loader2 aria-hidden="true" size={size === 'sm' ? 16 : 18} className="hub-spinner" />
        : <Icon aria-hidden="true" size={size === 'sm' ? 16 : 18} strokeWidth={1.8} />}
    </button>
  );

  return <Tooltip content={tooltip}>{control}</Tooltip>;
});

IconButton.displayName = 'IconButton';
