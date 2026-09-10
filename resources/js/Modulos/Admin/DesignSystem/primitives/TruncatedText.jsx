import React from 'react';

export const TruncatedText = ({ children, label, className = '' }) => (
  <span className={'hub-truncated-text ' + className} aria-label={label || undefined}>
    {children}
  </span>
);
