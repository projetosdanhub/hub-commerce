import { expect, test } from '@playwright/test';

test.describe('Admin SPA', () => {
  test('serves the administrative entry point', async ({ page }) => {
    const response = await page.goto('/admin');

    expect(response?.status()).toBe(200);
    await expect(page.locator('#app')).toHaveCount(1);
  });

  test('renders the administrative login directly with an accessible form', async ({ page }) => {
    const response = await page.goto('/admin/login');

    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: 'Bem-vindo de volta' })).toBeVisible();
    await expect(page.getByLabel('E-mail')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Senha' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Acessar painel' })).toBeVisible();
  });

  test('uses the dedicated compact composition on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto('/admin/login');

    await expect(page.getByRole('heading', { name: 'Bem-vindo de volta' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Gestão segura para a sua operação.' })).toHaveCount(0);
    await expect(page.getByLabel('E-mail')).toBeVisible();
  });
});
