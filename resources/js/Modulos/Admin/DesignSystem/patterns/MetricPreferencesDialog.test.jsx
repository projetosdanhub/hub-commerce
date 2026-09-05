import { describe, expect, it } from 'vitest';
import { normalizeMetricPreferences } from './MetricPreferencesDialog';

const metrics = [
  { id: 'revenue' },
  { id: 'orders' },
  { id: 'refunds' },
];

describe('normalizeMetricPreferences', () => {
  it('keeps known metrics in a complete, deterministic order', () => {
    expect(normalizeMetricPreferences({
      order: ['refunds', 'revenue', 'invalid', 'refunds'],
      hidden: ['orders', 'invalid'],
    }, metrics)).toEqual({
      order: ['refunds', 'revenue', 'orders'],
      hidden: ['orders'],
    });
  });
});
