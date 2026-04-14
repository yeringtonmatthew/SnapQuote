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
  await page.goto(`${BASE_URL}/auth/login?next=${encodeURIComponent(nextPath)}`, {
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  await page.locator('#email').fill(secrets.activeEmail);
  await page.locator('#password').fill(secrets.activePassword);
  await page.getByRole('button', { name: /sign in/i }).click();
}

test('Mobile quick add includes task and opens the right schedule sheets', async ({ page }) => {
  await login(page, '/dashboard');
  await page.waitForURL('**/dashboard', { timeout: 30000 });

  await page.getByRole('button', { name: /quick add menu/i }).click();
  await expect(page.getByRole('button', { name: /new quote/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /add customer/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /schedule job/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /add task/i })).toBeVisible();

  await page.getByRole('button', { name: /add task/i }).click();
  await page.waitForURL('**/schedule', { timeout: 30000 });
  await expect(page.getByRole('heading', { name: /add task/i })).toBeVisible();
  await expect(page.getByPlaceholder('Task title')).toBeVisible();
  await page.getByRole('button', { name: /cancel/i }).click();

  await page.getByRole('button', { name: /quick add menu/i }).click();
  await page.getByRole('button', { name: /schedule job/i }).click();
  await page.waitForURL('**/schedule', { timeout: 30000 });
  await expect(page.getByRole('heading', { name: /schedule job/i })).toBeVisible();
  await expect(page.getByPlaceholder('Job title')).toBeVisible();
});
