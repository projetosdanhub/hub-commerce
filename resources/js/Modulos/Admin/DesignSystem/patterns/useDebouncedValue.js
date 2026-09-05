import { useEffect, useState } from 'react';
import { createDebouncedTask, SEARCH_DEBOUNCE_MS } from './interactionLifecycle';

export const useDebouncedValue = (value, delay = SEARCH_DEBOUNCE_MS) => {
  const [settledValue, setSettledValue] = useState(value);
  useEffect(() => {
    const task = createDebouncedTask(setSettledValue, delay);
    task.schedule(value);
    return task.cancel;
  }, [delay, value]);
  return settledValue;
};
