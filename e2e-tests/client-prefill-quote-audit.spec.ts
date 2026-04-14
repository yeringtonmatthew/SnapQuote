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

test('Client quote flow pre-fills the customer and supports a temporary draft quote audit', async ({ page }) => {
  await login(page, '/dashboard');
  await page.waitForURL('**/dashboard', { timeout: 30000 });

  const client = await page.evaluate(async () => {
    const res = await fetch('/api/clients?limit=25');
    const data = await res.json();
    const clients = Array.isArray(data) ? data : (data.clients || []);
    const preferred =
      clients.find((c: any) => (c.phone || c.email) && c.address) ||
      clients.find((c: any) => c.phone || c.email) ||
      clients[0];

    if (!preferred) return null;

    return {
      id: preferred.id as string,
      name: preferred.name as string,
      phone: (preferred.phone as string | null) || null,
      email: (preferred.email as string | null) || null,
      address: (preferred.address as string | null) || null,
    };
  });

  expect(client).not.toBeNull();
  if (!client) return;

  await page.goto(`${BASE_URL}/clients/${client.id}`, {
    waitUntil: 'networkidle',
    timeout: 30000,
  });

  if (client.address) {
    await page.locator('button').filter({ hasText: client.address }).first().click();
    await expect(page.getByText('Open in Apple Maps')).toBeVisible();
    await expect(page.getByText('Open in Google Maps')).toBeVisible();
    await page.getByLabel('Close').click();
  }

  await page.getByRole('link', { name: /^Quote$/ }).first().click();
  await page.waitForURL('**/quotes/new?client_id=*', { timeout: 30000 });

  await expect(page.getByText('Quote For')).toBeVisible();
  await expect(page.getByText(client.name, { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: /use photos/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /build manually/i })).toBeVisible();

  await page.getByRole('button', { name: /use a template/i }).click();
  await page.locator('button').filter({ hasText: /items/i }).first().click();

  await expect(page.locator('#customerName')).toHaveValue(client.name);
  if (client.phone) {
    await expect(page.locator('#customerPhone')).not.toHaveValue('');
  } else if (client.email) {
    await expect(page.locator('#customerEmail')).toHaveValue(client.email);
  }

  await expect(page.getByLabel('Total job price')).toBeVisible();
  await page.getByLabel('Total job price').fill('1234');
  await page.getByRole('button', { name: /keep going without photos/i }).click();
  await expect(page.getByText('Line Items')).toBeVisible();

  await page.getByRole('button', { name: /save as draft/i }).click();
  await page.waitForURL('**/quotes/*', { timeout: 30000 });
  await expect(page.getByText(client.name, { exact: false })).toBeVisible();

  if (client.address) {
    await page.locator('button').filter({ hasText: client.address }).first().click();
    await expect(page.getByText('Open in Apple Maps')).toBeVisible();
    await expect(page.getByText('Open in Google Maps')).toBeVisible();
    await page.getByLabel('Close').click();
  }

  const match = page.url().match(/\/quotes\/([^/?#]+)/);
  expect(match?.[1]).toBeTruthy();

  const quoteId = match?.[1];
  const deletion = await page.evaluate(async (id) => {
    const res = await fetch('/api/quotes/bulk', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [id], action: 'delete' }),
    });

    return {
      ok: res.ok,
      body: await res.text(),
    };
  }, quoteId);

  expect(deletion.ok).toBeTruthy();
});
