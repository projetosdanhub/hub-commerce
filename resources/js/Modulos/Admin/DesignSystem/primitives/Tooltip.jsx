import React, { cloneElement, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export const Tooltip = ({ children, content, className = '' }) => {
  const tooltipId = useId();
  const triggerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0, placement: 'top' });

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const safeHalfWidth = Math.min(128, Math.max(0, (viewportWidth - 32) / 2));
    const placement = rect.top < 80 && window.innerHeight - rect.bottom > rect.top ? 'bottom' : 'top';

    setPosition({
      x: Math.min(viewportWidth - safeHalfWidth, Math.max(safeHalfWidth, rect.left + (rect.width / 2))),
      y: placement === 'bottom' ? rect.bottom + 8 : rect.top - 8,
      placement,
    });
  }, []);

  useLayoutEffect(() => {
    if (open) updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return undefined;

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, updatePosition]);

  if (!content || !React.isValidElement(children)) return children;

  const hideWhenFocusLeaves = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  };

  const trigger = cloneElement(children, {
    'aria-describedby': open
      ? [children.props['aria-describedby'], tooltipId].filter(Boolean).join(' ')
      : children.props['aria-describedby'],
  });

  return (
    <>
      <span
        ref={triggerRef}
        className={'hub-tooltip ' + className}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={hideWhenFocusLeaves}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false);
        }}
      >
        {trigger}
      </span>
      {open && typeof document !== 'undefined' ? createPortal(
        <span
          id={tooltipId}
          role="tooltip"
          className="hub-tooltip-content hub-admin"
          data-placement={position.placement}
          style={{
            '--hub-tooltip-x': position.x + 'px',
            '--hub-tooltip-y': position.y + 'px',
          }}
        >
          {content}
        </span>,
        document.body,
      ) : null}
    </>
  );
};
