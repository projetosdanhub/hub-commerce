import React from 'react';
import { Loader2 } from 'lucide-react';

const variantClasses = {
  primary: 'hub-button hub-button-primary',
  secondary: 'hub-button hub-button-secondary',
  ghost: 'hub-button hub-button-ghost',
  danger: 'hub-button hub-button-danger',
};

const sizeClasses = {
  sm: 'hub-button-sm',
  md: 'hub-button-md',
};

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
}, ref) => (
  <button
    ref={ref}
    type={type}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    className={`${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    {...props}
  >
    {loading ? <Loader2 aria-hidden="true" size={size === 'sm' ? 16 : 18} className="hub-spinner shrink-0" /> : null}
    {!loading && Icon ? <Icon aria-hidden="true" size={size === 'sm' ? 16 : 18} className="shrink-0" /> : null}
    {children}
  </button>
));

Button.displayName = 'Button';
