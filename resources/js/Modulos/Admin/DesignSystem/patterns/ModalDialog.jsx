import React from 'react';
import { useDialogLifecycle } from './useDialogLifecycle';

export const ModalDialog = ({
  children,
  className = '',
  labelledBy,
  describedBy,
  onClose,
  busy = false,
}) => {
  const { dialogRef, closing, requestClose } = useDialogLifecycle({ onClose, busy });

  return (
    <div
      className="hub-modal-backdrop"
      data-closing={closing}
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) requestClose();
      }}
    >
      <section
        ref={dialogRef}
        className={'hub-modal-dialog ' + className}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
      >
        {typeof children === 'function' ? children(requestClose) : children}
      </section>
    </div>
  );
};
