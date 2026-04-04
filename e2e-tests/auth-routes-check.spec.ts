import { test, expect } from '@playwright/test';
import * as path from 'path';

const BASE_URL = 'https://snapquote.dev';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

test.describe('Auth route discovery', () => {

  test('Check /auth/login route', async ({ page }) => {
    const consoleErrors: string[] = [];
    const networkErrors: string[] = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('response', (r) => { if (r.status() >= 400) networkErrors.push(`${r.status()} ${r.url()}`); });

    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle', timeout: 30000 });
    const finalUrl = page.url();
    const title = await page.title();
    const bodyText = await page.locator('body').textContent();

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'auth-login.png'), fullPage: true });

    console.log('AUTH/LOGIN FINAL URL:', finalUrl);
    console.log('AUTH/LOGIN TITLE:', title);
    console.log('AUTH/LOGIN BODY:', bodyText?.trim().slice(0, 600));
    console.log('CONSOLE ERRORS:', consoleErrors);
    console.log('NETWORK ERRORS:', networkErrors.filter(e => !e.includes('favicon')));

    // Check for Google button
    const googleBtn = page.locator('button:has-text("Google"), a:has-text("Google"), [data-testid*="google"]').first();
    const googleVisible = await googleBtn.isVisible().catch(() => false);
    console.log('GOOGLE BUTTON VISIBLE:', googleVisible);

    // Check all buttons
    const buttons = await page.locator('button').all();
    for (const btn of buttons) {
      const text = await btn.textContent().catch(() => '');
      const visible = await btn.isVisible().catch(() => false);
      if (visible) console.log('VISIBLE BUTTON:', text?.trim().slice(0, 80));
    }

    // Check all links
    const links = await page.locator('a').all();
    for (const link of links) {
      const text = await link.textContent().catch(() => '');
      const href = await link.getAttribute('href').catch(() => '');
      const visible = await link.isVisible().catch(() => false);
      if (visible && text?.trim()) console.log('VISIBLE LINK:', `"${text?.trim()}"`, '->', href);
    }
  });

  test('Check /auth/signup route', async ({ page }) => {
    const consoleErrors: string[] = [];
    const networkErrors: string[] = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('response', (r) => { if (r.status() >= 400) networkErrors.push(`${r.status()} ${r.url()}`); });

    await page.goto(`${BASE_URL}/auth/signup`, { waitUntil: 'networkidle', timeout: 30000 });
    const finalUrl = page.url();
    const title = await page.title();
    const bodyText = await page.locator('body').textContent();

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'auth-signup.png'), fullPage: true });

    console.log('AUTH/SIGNUP FINAL URL:', finalUrl);
    console.log('AUTH/SIGNUP TITLE:', title);
    console.log('AUTH/SIGNUP BODY:', bodyText?.trim().slice(0, 600));
    console.log('CONSOLE ERRORS:', consoleErrors);
    console.log('NETWORK ERRORS:', networkErrors.filter(e => !e.includes('favicon')));

    const buttons = await page.locator('button').all();
    for (const btn of buttons) {
      const text = await btn.textContent().catch(() => '');
      const visible = await btn.isVisible().catch(() => false);
      if (visible) console.log('VISIBLE BUTTON:', text?.trim().slice(0, 80));
    }
  });

  test('Check /q/[id] with a real-looking ID', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

    // Try a UUID-format ID like a real Supabase row ID
    const fakeUUID = '550e8400-e29b-41d4-a716-446655440000';
    await page.goto(`${BASE_URL}/q/${fakeUUID}`, { waitUntil: 'networkidle', timeout: 30000 });

    const finalUrl = page.url();
    const bodyText = await page.locator('body').textContent();
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'q-uuid-proposal.png'), fullPage: true });

    console.log('Q UUID URL:', finalUrl);
    console.log('Q UUID BODY:', bodyText?.trim().slice(0, 400));
    console.log('CONSOLE ERRORS:', consoleErrors.filter(e => !e.includes('favicon')));
  });

  test('Check nav login/signup links from landing', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });

    // Find all nav/header links
    const navLinks = await page.locator('nav a, header a').all();
    console.log('NAV LINKS:');
    for (const link of navLinks) {
      const text = await link.textContent().catch(() => '');
      const href = await link.getAttribute('href').catch(() => '');
      const visible = await link.isVisible().catch(() => false);
      if (visible) console.log(`  "${text?.trim()}" -> ${href}`);
    }

    // Click "Log In" to find the real login route
    const logInLink = page.locator('a:has-text("Log In"), a:has-text("Login"), a:has-text("Sign In"), a:has-text("Log in")').first();
    const logInVisible = await logInLink.isVisible().catch(() => false);
    if (logInVisible) {
      const href = await logInLink.getAttribute('href');
      console.log('LOG IN HREF:', href);
      await logInLink.click();
      await page.waitForLoadState('networkidle');
      console.log('AFTER CLICKING LOG IN — URL:', page.url());
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'nav-login-destination.png'), fullPage: true });
    }

    // Go back and click "Start Free" / "Sign Up"
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
    const startFreeLink = page.locator('a:has-text("Start Free"), a:has-text("Sign Up"), a:has-text("Get Started"), a:has-text("Try Free")').first();
    const startFreeVisible = await startFreeLink.isVisible().catch(() => false);
    if (startFreeVisible) {
      const href = await startFreeLink.getAttribute('href');
      console.log('START FREE HREF:', href);
      await startFreeLink.click();
      await page.waitForLoadState('networkidle');
      console.log('AFTER CLICKING START FREE — URL:', page.url());
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'nav-signup-destination.png'), fullPage: true });
    }
  });

});
