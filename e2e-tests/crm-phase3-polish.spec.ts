import { test, expect } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'https://snapquote.dev';
const SECRETS_PATH = '/tmp/snapquote-flow-secrets.json';

const secrets = JSON.parse(fs.readFileSync(SECRETS_PATH, 'utf8')) as {
  activeEmail: string;
  activePassword: string;
};

async function login(
  page: import('@playwright/test').Page,
  nextPath: string,
) {
  await page.goto(
    `${BASE_URL}/auth/login?next=${encodeURIComponent(nextPath)}`,
    { waitUntil: 'networkidle', timeout: 30000 },
  );
  await page.locator('#email').fill(secrets.activeEmail);
  await page.locator('#password').fill(secrets.activePassword);
  await page.getByRole('button', { name: /sign in/i }).click();
}

test('Customers screen keeps search calm and opens note shortcuts cleanly', async ({ page }) => {
  await login(page, '/clients');
  await page.waitForURL('**/clients', { timeout: 30000 });

  const search = page.getByPlaceholder('Search customers...');
  await expect(search).toBeVisible();
  await expect(search).not.toBeFocused();
  await expect(page.getByRole('button', { name: /add customer/i })).toBeVisible();

  const customerLinks = page.locator('a[href^="/clients/"]');
  expect(await customerLinks.count()).toBeGreaterThan(0);

  await customerLinks.first().click();
  await page.waitForURL(/\/clients\/[^/]+$/, { timeout: 30000 });

  await expect(page.getByText(/Work History \(/)).toBeVisible();
  await page.getByRole('button', { name: 'Note' }).click();
  await expect(page.getByPlaceholder('Add a note...')).toBeFocused();
});

test('Job details open on the work tab for real jobs', async ({ page }) => {
  await login(page, '/jobs');
  await page.waitForURL('**/jobs', { timeout: 30000 });
  await expect(page.getByRole('heading', { name: 'Jobs' })).toBeVisible();

  const firstJobLink = page.locator('a[href^="/jobs/"]').first();
  const emptyState = page.getByText(/No jobs yet|No open jobs|No scheduled jobs|No completed jobs/);
  await expect(firstJobLink.or(emptyState).first()).toBeVisible({ timeout: 15000 });
  const hasJobs = await firstJobLink.isVisible().catch(() => false);

  if (!hasJobs) {
    await expect(page.getByText(/No jobs yet|No open jobs|No scheduled jobs|No completed jobs/)).toBeVisible();
    return;
  }

  await firstJobLink.click();
  await page.waitForURL(/\/jobs\/[^/]+$/, { timeout: 30000 });

  await expect(page.getByText('Progress', { exact: true })).toBeVisible();
  await expect(page.getByText(/Sold|Scheduled|Working|Done|New Lead|Check Back|Draft Quote|Sent/).first()).toBeVisible();
});
