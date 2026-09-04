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
}, ref) => (
  <button
    ref={ref}
    type={type}
    title={label}
    aria-label={label}
    disabled={disabled || loading}
    className={`hub-icon-button ${className}`}
    {...props}
  >
    {loading ? <Loader2 aria-hidden="true" size={18} className="animate-spin" /> : <Icon aria-hidden="true" size={18} strokeWidth={1.8} />}
  </button>
));

IconButton.displayName = 'IconButton';
