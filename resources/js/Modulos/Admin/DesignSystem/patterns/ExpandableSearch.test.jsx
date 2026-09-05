import { describe, expect, it } from 'vitest';
import { shouldScheduleSearchCollapse } from './ExpandableSearch';

describe('ExpandableSearch helpers', () => {
  it('only schedules a collapse after a populated search is cleared', () => {
    expect(shouldScheduleSearchCollapse({ hasBeenFilled: false, value: '' })).toBe(false);
    expect(shouldScheduleSearchCollapse({ hasBeenFilled: true, value: 'pedido' })).toBe(false);
    expect(shouldScheduleSearchCollapse({ hasBeenFilled: true, value: '' })).toBe(true);
  });
});
