import React, { cloneElement, useId } from 'react';

export const Tooltip = ({ children, content, className = '' }) => {
  const tooltipId = useId();

  if (!content) return children;

  return (
    <span className={`hub-tooltip ${className}`}>
      {cloneElement(children, {
        'aria-describedby': children.props['aria-describedby']
          ? `${children.props['aria-describedby']} ${tooltipId}`
          : tooltipId,
      })}
      <span id={tooltipId} role="tooltip" className="hub-tooltip-content">{content}</span>
    </span>
  );
};
