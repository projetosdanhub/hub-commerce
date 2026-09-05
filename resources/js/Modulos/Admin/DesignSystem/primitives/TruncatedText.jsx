import React from 'react';
import { Tooltip } from './Tooltip';

export const TruncatedText = ({ children, label, className = '' }) => {
  const content = label || (typeof children === 'string' ? children : '');

  return (
    <Tooltip content={content}>
      <span className={'hub-truncated-text ' + className} tabIndex={content ? 0 : undefined}>
        {children}
      </span>
    </Tooltip>
  );
};
