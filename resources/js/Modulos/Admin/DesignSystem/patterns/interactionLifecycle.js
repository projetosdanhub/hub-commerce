export const SEARCH_DEBOUNCE_MS = 350;

export const createDebouncedTask = (callback, delay = SEARCH_DEBOUNCE_MS) => {
  let timer;
  const cancel = () => {
    clearTimeout(timer);
    timer = undefined;
  };
  return {
    schedule(...args) {
      cancel();
      timer = setTimeout(() => {
        timer = undefined;
        callback(...args);
      }, delay);
    },
    cancel,
  };
};

const scrollLocks = new WeakMap();

export const lockDocumentScroll = (doc) => {
  let lock = scrollLocks.get(doc);
  if (!lock) {
    lock = { count: 0, alreadyLocked: doc.documentElement.classList.contains('hub-modal-open') };
    scrollLocks.set(doc, lock);
    doc.documentElement.classList.add('hub-modal-open');
  }
  lock.count += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    lock.count -= 1;
    if (lock.count === 0) {
      if (!lock.alreadyLocked) doc.documentElement.classList.remove('hub-modal-open');
      scrollLocks.delete(doc);
    }
  };
};
