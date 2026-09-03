import { test, expect } from '@playwright/test';

test.describe('Admin Flow', () => {
  test('unauthorized users are redirected to login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/.*login/);
  });
});
