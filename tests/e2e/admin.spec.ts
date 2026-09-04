import { expect, test } from '@playwright/test';

test.describe('Admin SPA', () => {
  test('serves the administrative entry point', async ({ page }) => {
    const response = await page.goto('/admin');

    expect(response?.status()).toBe(200);
    await expect(page.locator('#app')).toHaveCount(1);
  });
});
