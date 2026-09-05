import { describe, expect, it } from 'vitest';
import {
  formatDateRange,
  getDateRange,
  getDateRangeLabel,
  getSelectedDateRangePreset,
} from './DateRangeFilter';

describe('DateRangeFilter helpers', () => {
  const referenceDate = new Date(2026, 2, 15);

  it('calculates the requested rolling and calendar periods', () => {
    expect(getDateRange('LAST_7', referenceDate)).toEqual({
      startDate: '2026-03-09',
      endDate: '2026-03-15',
    });
    expect(getDateRange('MONTH', referenceDate)).toEqual({
      startDate: '2026-03-01',
      endDate: '2026-03-15',
    });
    expect(getDateRange('LAST_MONTH', referenceDate)).toEqual({
      startDate: '2026-02-01',
      endDate: '2026-02-28',
    });
  });

  it('formats selected ranges and identifies custom ranges', () => {
    expect(getSelectedDateRangePreset({
      startDate: '2026-03-04',
      endDate: '2026-03-12',
    })).toBe('CUSTOM');
    expect(formatDateRange({
      startDate: '2026-03-04',
      endDate: '2026-03-12',
    })).toBe('04/03/2026 — 12/03/2026');
    expect(getDateRangeLabel({
      startDate: '',
      endDate: '',
    })).toBe('Todo o período');
  });
});
