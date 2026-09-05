import { useCallback, useEffect, useRef, useState } from 'react';
import { lockDocumentScroll, readMotionDurationMs } from './interactionLifecycle';

const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const useDialogLifecycle = ({ enabled = true, onClose, busy = false }) => {
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  const busyRef = useRef(busy);
  const timerRef = useRef(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => { closeRef.current = onClose; busyRef.current = busy; }, [busy, onClose]);

  const requestClose = useCallback(() => {
    if (!dialogRef.current || busyRef.current || timerRef.current !== null) return;
    const milliseconds = readMotionDurationMs('--hub-motion-fast', dialogRef.current);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setClosing(true);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      setClosing(false);
      closeRef.current();
    }, reduced ? 0 : milliseconds);
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    const releaseScroll = lockDocumentScroll(document);
    const previousFocus = document.activeElement;
    const focusable = () => Array.from(dialogRef.current?.querySelectorAll(focusableSelector) ?? [])
      .filter((element) => element.getClientRects().length > 0);
    const frame = window.requestAnimationFrame(() => (focusable()[0] || dialogRef.current)?.focus());
    const onKeyDown = (event) => {
      const dialogs = document.querySelectorAll('[role="dialog"][aria-modal="true"]');
      if (dialogs[dialogs.length - 1] !== dialogRef.current) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        requestClose();
      }
      if (event.key !== 'Tab') return;
      const elements = focusable();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first) { event.preventDefault(); dialogRef.current?.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
      document.removeEventListener('keydown', onKeyDown);
      releaseScroll();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [enabled, requestClose]);

  return { dialogRef, closing, requestClose };
};
