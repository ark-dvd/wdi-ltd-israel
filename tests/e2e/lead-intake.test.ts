/**
 * E2E: Lead intake (contact form) — DOC-060 §7 (H-06)
 * Tests the public lead submission flow and validation.
 */
import { test, expect } from '@playwright/test';

test.describe('Lead Intake — Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('contact page renders the form', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('צור קשר');
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
  });

  test('form requires name, email, and message fields', async ({ page }) => {
    // Try to submit empty form — HTML5 validation should prevent
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // The form should not have been submitted (still on contact page)
    await expect(page).toHaveURL(/\/contact/);
  });

  test('API rejects lead submission with missing turnstile token', async ({ request }) => {
    const response = await request.post('/api/public/leads', {
      data: {
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message',
        // turnstileToken intentionally missing
      },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.fieldErrors).toBeDefined();
    expect(body.fieldErrors.turnstileToken).toBeDefined();
  });

  test('API rejects lead submission with invalid email', async ({ request }) => {
    const response = await request.post('/api/public/leads', {
      data: {
        name: 'Test User',
        email: 'not-an-email',
        message: 'Test message',
        turnstileToken: 'test-token',
      },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.fieldErrors).toBeDefined();
    expect(body.fieldErrors.email).toBeDefined();
  });

  test('API rejects lead submission with empty required fields', async ({ request }) => {
    const response = await request.post('/api/public/leads', {
      data: {
        name: '',
        email: 'not-an-email',
        message: '',
        turnstileToken: 'x',
      },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.fieldErrors).toBeDefined();
  });

  test('API rejects lead with completely invalid payload', async ({ request }) => {
    const response = await request.post('/api/public/leads', {
      data: { foo: 'bar' },
    });
    expect(response.status()).toBe(400);
  });
});
