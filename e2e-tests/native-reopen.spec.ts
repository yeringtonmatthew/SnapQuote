import { test, expect } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'https://snapquote.dev';
const SECRETS_PATH = '/tmp/snapquote-flow-secrets.json';

const secrets = fs.existsSync(SECRETS_PATH)
  ? JSON.parse(fs.readFileSync(SECRETS_PATH, 'utf8')) as {
      activeEmail?: string;
      activePassword?: string;
    }
  : {};

const ACTIVE_EMAIL = secrets.activeEmail;
const ACTIVE_PASSWORD = secrets.activePassword;

test.describe('Native reopen behavior', () => {
  test.skip(!ACTIVE_EMAIL || !ACTIVE_PASSWORD, 'Missing active-account credentials');

  test('signed-in native users reopening on / get sent back into the app', async ({ page, context }) => {
    await context.addInitScript(() => {
      (window as any).Capacitor = {
        isNativePlatform: () => true,
      };
    });

    await page.goto(`${BASE_URL}/auth/login?next=${encodeURIComponent('/dashboard')}`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    await page.locator('#email').fill(ACTIVE_EMAIL!);
    await page.locator('#password').fill(ACTIVE_PASSWORD!);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/dashboard(\?|$)/, { timeout: 30000 });

    // Simulate the app reopening to the root web entry point.
    await page.goto(`${BASE_URL}/`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await page.waitForURL(
      /\/(dashboard|quotes|clients|jobs|pipeline|schedule|settings|invoices|payments|onboarding|subscribe)(\?|$)/,
      { timeout: 30000 }
    );

    expect(page.url()).not.toBe(`${BASE_URL}/`);
  });
});
