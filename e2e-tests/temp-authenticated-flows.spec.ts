import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://snapquote.dev';
const REPO_ROOT = '/Users/mattyerington/Desktop/SnapQuote';
const ENV_PATH = path.join(REPO_ROOT, '.env.local');
const SECRETS_PATH = '/tmp/snapquote-flow-secrets.json';
const TEMP_PASSWORD = 'SnapQuote!234';

function loadEnvFile(filePath: string): Record<string, string> {
  const output: Record<string, string> = {};
  const raw = fs.readFileSync(filePath, 'utf8');

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    output[key] = value;
  }

  return output;
}

const secrets = JSON.parse(fs.readFileSync(SECRETS_PATH, 'utf8')) as {
  activeEmail: string;
  activePassword: string;
};

const env = loadEnvFile(ENV_PATH);
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing Supabase credentials for authenticated flow tests.');
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const createdUserIds: string[] = [];
const createdEmails: string[] = [];

function uniqueEmail(label: string): string {
  const stamp = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  return `codex+${label}-${stamp}@mailinator.com`;
}

async function waitForProfileRow(userId: string) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const { data } = await admin
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (data?.id) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for users row for ${userId}`);
}

async function deleteUserByEmail(email: string) {
  const { data } = await admin
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (data?.id) {
    await admin.auth.admin.deleteUser(data.id);
  }
}

async function getUserIdByEmail(email: string): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const { data } = await admin
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (data?.id) return data.id;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for user row for ${email}`);
}

async function confirmUserEmail(email: string) {
  const userId = await getUserIdByEmail(email);

  if (!createdUserIds.includes(userId)) {
    createdUserIds.push(userId);
  }

  const { error } = await admin.auth.admin.updateUserById(userId, {
    email_confirm: true,
  });

  if (error) {
    throw new Error(`Could not confirm trial user email: ${error.message}`);
  }
}

async function createExpiredUser() {
  const email = uniqueEmail('expired');
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: TEMP_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: 'Codex Expired User' },
  });

  if (error || !data.user) {
    throw new Error(`Could not create expired test user: ${error?.message || 'unknown error'}`);
  }

  const userId = data.user.id;
  createdUserIds.push(userId);
  createdEmails.push(email);

  await waitForProfileRow(userId);

  const { error: updateError } = await admin
    .from('users')
    .update({
      full_name: 'Codex Expired User',
      business_name: 'Codex Expired Roofing',
      trade_type: 'roofing',
      hourly_rate: 125,
      rate_type: 'hourly',
      default_deposit_percent: 50,
      onboarded: true,
      subscription_status: 'expired',
      trial_ends_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq('id', userId);

  if (updateError) {
    throw new Error(`Could not configure expired test user: ${updateError.message}`);
  }

  return { email, password: TEMP_PASSWORD };
}

async function createTrialUser() {
  const email = uniqueEmail('trial');
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: TEMP_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: 'Codex Trial User' },
  });

  if (error || !data.user) {
    throw new Error(`Could not create trial test user: ${error?.message || 'unknown error'}`);
  }

  const userId = data.user.id;
  createdUserIds.push(userId);
  createdEmails.push(email);

  await waitForProfileRow(userId);

  const { error: updateError } = await admin
    .from('users')
    .update({
      full_name: 'Codex Trial User',
      business_name: null,
      trade_type: null,
      onboarded: false,
      subscription_status: 'trialing',
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq('id', userId);

  if (updateError) {
    throw new Error(`Could not configure trial test user: ${updateError.message}`);
  }

  return { email, password: TEMP_PASSWORD };
}

async function login(
  page: import('@playwright/test').Page,
  email: string,
  password: string,
  nextPath = '/dashboard'
) {
  await page.goto(
    `${BASE_URL}/auth/login?next=${encodeURIComponent(nextPath)}`,
    { waitUntil: 'networkidle', timeout: 30000 }
  );
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
}

async function fetchFromSession(
  page: import('@playwright/test').Page,
  pathname: string
): Promise<{ status: number; url: string; body: string }> {
  return page.evaluate(async (path) => {
    const response = await fetch(path, { credentials: 'include' });
    return {
      status: response.status,
      url: response.url,
      body: await response.text(),
    };
  }, pathname);
}

test.describe.configure({ mode: 'serial' });
test.setTimeout(120000);

test.afterAll(async () => {
  for (const userId of createdUserIds) {
    await admin.auth.admin.deleteUser(userId).catch(() => {});
  }

  for (const email of createdEmails) {
    await deleteUserByEmail(email).catch(() => {});
  }
});

test('Landing page auth CTAs navigate to the real auth screens', async ({ page }) => {
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });

  const loginLink = page.locator('nav a[href="/auth/login"]').first();
  await expect(loginLink).toBeVisible();
  await Promise.all([
    page.waitForURL('**/auth/login'),
    loginLink.click(),
  ]);
  await expect(page).toHaveURL(/\/auth\/login$/);

  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });

  const signupLink = page.locator('nav a[href="/auth/signup"]').first();
  await expect(signupLink).toBeVisible();
  await Promise.all([
    page.waitForURL('**/auth/signup'),
    signupLink.click(),
  ]);
  await expect(page).toHaveURL(/\/auth\/signup$/);
});

test('Active account can reach the core contractor app routes and APIs', async ({ browser, page }) => {
  await login(page, secrets.activeEmail, secrets.activePassword);
  await page.waitForURL('**/dashboard');

  const coreRoutes = [
    '/dashboard',
    '/quotes',
    '/quotes/new',
    '/clients',
    '/jobs',
    '/pipeline',
    '/schedule',
    '/invoices',
    '/payments',
    '/settings',
  ];

  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  for (const route of coreRoutes) {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle', timeout: 30000 });
    expect(page.url()).toContain(route);

    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  }

  const clients = await fetchFromSession(page, '/api/clients');
  const invoices = await fetchFromSession(page, '/api/invoices');
  const payments = await fetchFromSession(page, '/api/payments');

  expect(clients.status).toBe(200);
  expect(invoices.status).toBe(200);
  expect(payments.status).toBe(200);

  await page.goto(`${BASE_URL}/subscribe`, { waitUntil: 'networkidle', timeout: 30000 });
  await expect(page).toHaveURL(/\/dashboard/);

  const storageState = await page.context().storageState();
  const nativeContext = await browser.newContext({
    storageState,
    userAgent: 'SnapQuote/1.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Capacitor',
  });
  const nativePage = await nativeContext.newPage();
  await nativePage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
  await expect(nativePage).toHaveURL(/\/dashboard/);
  await nativeContext.close();

  const actionableErrors = consoleErrors.filter(
    (error) =>
      !error.includes('Failed to load resource: the server responded with a status of 404') &&
      !error.includes('Failed to fetch RSC payload')
  );
  expect(actionableErrors).toEqual([]);
});

test('Trial account can complete onboarding and reach the quote builder', async ({ page }) => {
  const trialUser = await createTrialUser();

  await login(page, trialUser.email, trialUser.password, '/onboarding');
  await page.waitForURL('**/onboarding', { timeout: 30000 });

  await page.locator('#businessName').fill('Codex Trial Roofing');
  await page.getByRole('button', { name: /select roofer/i }).click();
  await page.getByRole('button', { name: /^continue$/i }).click();

  await page.getByRole('button', { name: /skip for now/i }).click();
  await page.getByRole('button', { name: /^next$/i }).click();
  await page.getByRole('button', { name: /create your first quote/i }).click();

  await page.waitForURL('**/quotes/new', { timeout: 30000 });
  await expect(page.getByRole('heading', { name: /how do you want to start/i })).toBeVisible();

  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 30000 });
  await expect(page).toHaveURL(/\/dashboard/);

  const clients = await fetchFromSession(page, '/api/clients');
  expect(clients.status).toBe(200);
});

test('Expired account is blocked on web and native, while billing-safe routes still work', async ({ browser, page }) => {
  const expiredUser = await createExpiredUser();

  await login(page, expiredUser.email, expiredUser.password);
  await page.waitForURL('**/subscribe', { timeout: 30000 });

  const subscribeHeading = page.getByRole('heading').first();
  await expect(subscribeHeading).toContainText(/trial|subscribe/i);

  const clients = await fetchFromSession(page, '/api/clients');
  expect(clients.status).toBe(402);
  expect(clients.body).toContain('subscription_required');

  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle', timeout: 30000 });
  await expect(page).toHaveURL(/\/settings/);

  const storageState = await page.context().storageState();
  const nativeContext = await browser.newContext({
    storageState,
    userAgent: 'SnapQuote/1.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Capacitor',
  });
  const nativePage = await nativeContext.newPage();
  await nativePage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
  await expect(nativePage).toHaveURL(/\/subscribe/);
  await nativeContext.close();
});
