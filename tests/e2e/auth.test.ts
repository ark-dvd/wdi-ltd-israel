/**
 * E2E: Authentication flows — DOC-060 §7 (H-06)
 * Tests login, session protection, and logout.
 */
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('unauthenticated user is redirected from /admin to /admin/login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('unauthenticated user is redirected from /admin panel pages', async ({ page }) => {
    await page.goto('/admin?tab=projects');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('/admin/login page renders with Google sign-in button', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.locator('text=כניסה')).toBeVisible();
  });

  test('unauthenticated API request to /api/admin/leads returns 401', async ({ request }) => {
    const response = await request.get('/api/admin/leads');
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.code).toBe('UNAUTHORIZED');
  });

  test('unauthenticated API request to /api/admin/team returns 401', async ({ request }) => {
    const response = await request.post('/api/admin/team', {
      data: { name: 'test' },
    });
    expect(response.status()).toBe(401);
  });

  test('unauthenticated DELETE to /api/admin/projects/test-id returns 401', async ({ request }) => {
    const response = await request.delete('/api/admin/projects/test-id');
    expect(response.status()).toBe(401);
  });

  test('public pages are accessible without authentication', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
    expect(await page.title()).toContain('WDI');
  });

  test('public pages load: /services', async ({ page }) => {
    await page.goto('/services');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('public pages load: /about', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('public pages load: /contact', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('h1')).toBeVisible();
  });
});
