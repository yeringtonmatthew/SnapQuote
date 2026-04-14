import { test, expect } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'https://snapquote.dev';
const SECRETS_PATH = '/tmp/snapquote-flow-secrets.json';

const secrets = JSON.parse(fs.readFileSync(SECRETS_PATH, 'utf8')) as {
  activeEmail: string;
  activePassword: string;
};

test.use({
  viewport: { width: 393, height: 852 },
});

async function login(page: import('@playwright/test').Page, nextPath: string) {
  await page.goto(
    `${BASE_URL}/auth/login?next=${encodeURIComponent(nextPath)}`,
    { waitUntil: 'networkidle', timeout: 30000 },
  );
  await page.locator('#email').fill(secrets.activeEmail);
  await page.locator('#password').fill(secrets.activePassword);
  await page.getByRole('button', { name: /sign in/i }).click();
}

test('Mobile pipeline groups customer quotes and keeps edit actions easy to reach', async ({ page }) => {
  await login(page, '/pipeline');
  await page.waitForURL('**/pipeline', { timeout: 30000 });

  await page.getByRole('button', { name: /^Scheduled/ }).first().click();

  await expect(
    page.getByText('Quotes are grouped by customer here, so repeat jobs stay together and are easier to work from on your phone.'),
  ).toBeVisible();

  await expect(page.getByText(/quote[s]? in this stage/).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Edit' }).first()).toBeVisible();
});
