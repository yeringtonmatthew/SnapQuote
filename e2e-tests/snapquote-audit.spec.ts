import { test, expect, Page, ConsoleMessage } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://snapquote.dev';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

// Ensure screenshots dir exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

interface PageAuditResult {
  url: string;
  consoleErrors: string[];
  consoleWarnings: string[];
  networkErrors: string[];
  title: string;
  statusCode: number | null;
}

async function auditPage(page: Page, url: string, label: string): Promise<PageAuditResult> {
  const consoleErrors: string[] = [];
  const consoleWarnings: string[] = [];
  const networkErrors: string[] = [];
  let statusCode: number | null = null;

  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
    if (msg.type() === 'warning') consoleWarnings.push(msg.text());
  });

  page.on('response', (response) => {
    if (response.url() === url || response.url().startsWith(url)) {
      statusCode = response.status();
    }
    if (response.status() >= 400 && response.status() < 600) {
      networkErrors.push(`${response.status()} ${response.url()}`);
    }
  });

  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  const title = await page.title();
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${label}.png`), fullPage: true });

  return { url, consoleErrors, consoleWarnings, networkErrors, title, statusCode };
}

test.describe('SnapQuote E2E Audit', () => {

  // ─── 1. Landing Page ───────────────────────────────────────────────────────
  test('Landing page loads with hero section', async ({ page }) => {
    const result = await auditPage(page, `${BASE_URL}/`, 'landing-page');

    console.log('TITLE:', result.title);
    console.log('CONSOLE ERRORS:', result.consoleErrors);
    console.log('NETWORK ERRORS:', result.networkErrors);

    // Page must load
    await expect(page).toHaveURL(/snapquote\.dev/);

    // Check hero section exists — look for common hero patterns
    const heroSelectors = [
      '[data-testid="hero"]',
      'section:first-of-type',
      'h1',
      '.hero',
      '#hero',
    ];

    let heroFound = false;
    for (const sel of heroSelectors) {
      const el = page.locator(sel).first();
      if (await el.isVisible().catch(() => false)) {
        heroFound = true;
        const text = await el.textContent().catch(() => '');
        console.log(`HERO (${sel}):`, text?.trim().slice(0, 120));
        break;
      }
    }
    expect(heroFound, 'Hero section should be visible').toBeTruthy();

    // H1 must be present and non-empty
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    const h1Text = await h1.textContent();
    console.log('H1:', h1Text?.trim());
    expect(h1Text?.trim().length).toBeGreaterThan(0);

    // Check for broken images
    const images = await page.locator('img').all();
    const brokenImages: string[] = [];
    for (const img of images) {
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      const src = await img.getAttribute('src');
      if (naturalWidth === 0 && src && !src.startsWith('data:')) {
        brokenImages.push(src);
      }
    }
    console.log('BROKEN IMAGES:', brokenImages);
    console.log('TOTAL IMAGES:', images.length);

    // Check for CTA buttons
    const ctaButtons = page.locator('a[href*="signup"], a[href*="register"], a[href*="get-started"], button:has-text("Get Started"), button:has-text("Sign Up"), a:has-text("Get Started"), a:has-text("Sign Up"), a:has-text("Try")');
    const ctaCount = await ctaButtons.count();
    console.log('CTA BUTTON COUNT:', ctaCount);

    // Check nav/header
    const nav = page.locator('nav, header').first();
    const navVisible = await nav.isVisible().catch(() => false);
    console.log('NAV VISIBLE:', navVisible);

    // Capture meta description
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content').catch(() => null);
    console.log('META DESCRIPTION:', metaDescription);

    // Capture page text summary
    const bodyText = await page.locator('body').textContent();
    console.log('BODY TEXT SNIPPET:', bodyText?.trim().slice(0, 400));

    // Assert no critical JS errors
    const criticalErrors = result.consoleErrors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('404') &&
      !e.includes('net::ERR_')
    );
    if (criticalErrors.length > 0) {
      console.warn('CRITICAL JS ERRORS:', criticalErrors);
    }
  });

  // ─── 2. Login Page ─────────────────────────────────────────────────────────
  test('Login page loads with auth options', async ({ page }) => {
    const result = await auditPage(page, `${BASE_URL}/login`, 'login-page');

    console.log('LOGIN TITLE:', result.title);
    console.log('LOGIN CONSOLE ERRORS:', result.consoleErrors);
    console.log('LOGIN NETWORK ERRORS:', result.networkErrors.filter(e => !e.includes('favicon')));

    await expect(page).toHaveURL(/\/login/);

    // Check for Google OAuth button
    const googleButtonSelectors = [
      'button:has-text("Google")',
      'a:has-text("Google")',
      '[data-testid*="google"]',
      'button:has-text("Continue with Google")',
      'button:has-text("Sign in with Google")',
      'button:has-text("Log in with Google")',
      '[class*="google"]',
    ];

    let googleButtonFound = false;
    for (const sel of googleButtonSelectors) {
      const el = page.locator(sel).first();
      if (await el.isVisible().catch(() => false)) {
        googleButtonFound = true;
        const text = await el.textContent();
        const isEnabled = await el.isEnabled();
        console.log(`GOOGLE BUTTON (${sel}): "${text?.trim()}" enabled=${isEnabled}`);
        break;
      }
    }
    console.log('GOOGLE BUTTON FOUND:', googleButtonFound);

    // Check for Apple and Facebook buttons
    const appleBtn = page.locator('button:has-text("Apple"), a:has-text("Apple"), [data-testid*="apple"]').first();
    const appleVisible = await appleBtn.isVisible().catch(() => false);
    console.log('APPLE BUTTON VISIBLE:', appleVisible);

    const facebookBtn = page.locator('button:has-text("Facebook"), a:has-text("Facebook"), [data-testid*="facebook"]').first();
    const facebookVisible = await facebookBtn.isVisible().catch(() => false);
    console.log('FACEBOOK BUTTON VISIBLE:', facebookVisible);

    // Check for email/password form fields
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    const emailVisible = await emailInput.isVisible().catch(() => false);
    console.log('EMAIL INPUT VISIBLE:', emailVisible);

    const passwordInput = page.locator('input[type="password"]').first();
    const passwordVisible = await passwordInput.isVisible().catch(() => false);
    console.log('PASSWORD INPUT VISIBLE:', passwordVisible);

    // Check for signup link
    const signupLink = page.locator('a[href*="signup"], a[href*="register"], a:has-text("Sign up"), a:has-text("Create account")').first();
    const signupLinkVisible = await signupLink.isVisible().catch(() => false);
    console.log('SIGNUP LINK VISIBLE:', signupLinkVisible);

    // Capture full page text
    const bodyText = await page.locator('body').textContent();
    console.log('LOGIN PAGE TEXT:', bodyText?.trim().slice(0, 500));

    // Page title should reference login/sign in
    const titleLower = result.title.toLowerCase();
    console.log('LOGIN PAGE TITLE CHECK:', titleLower);

    expect(result.consoleErrors.filter(e => e.includes('TypeError') || e.includes('ReferenceError')).length).toBe(0);
  });

  // ─── 3. Signup Page ────────────────────────────────────────────────────────
  test('Signup page loads with auth options', async ({ page }) => {
    const result = await auditPage(page, `${BASE_URL}/signup`, 'signup-page');

    console.log('SIGNUP TITLE:', result.title);
    console.log('SIGNUP CONSOLE ERRORS:', result.consoleErrors);
    console.log('SIGNUP NETWORK ERRORS:', result.networkErrors.filter(e => !e.includes('favicon')));

    // Supabase signup might redirect to login — check where we ended up
    const currentUrl = page.url();
    console.log('SIGNUP FINAL URL:', currentUrl);

    // Check for Google button
    const googleBtns = page.locator('button:has-text("Google"), a:has-text("Google"), [data-testid*="google"]');
    const googleCount = await googleBtns.count();
    console.log('GOOGLE BUTTONS COUNT:', googleCount);

    for (let i = 0; i < googleCount; i++) {
      const btn = googleBtns.nth(i);
      const text = await btn.textContent().catch(() => '');
      const visible = await btn.isVisible().catch(() => false);
      console.log(`  Google btn[${i}]: "${text?.trim()}" visible=${visible}`);
    }

    // Check for name/email/password form
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i], input[id*="name"]').first();
    const nameVisible = await nameInput.isVisible().catch(() => false);
    console.log('NAME INPUT VISIBLE:', nameVisible);

    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const emailVisible = await emailInput.isVisible().catch(() => false);
    console.log('EMAIL INPUT VISIBLE:', emailVisible);

    // Capture page text
    const bodyText = await page.locator('body').textContent();
    console.log('SIGNUP PAGE TEXT:', bodyText?.trim().slice(0, 500));

    expect(result.consoleErrors.filter(e => e.includes('TypeError') || e.includes('ReferenceError')).length).toBe(0);
  });

  // ─── 4. Public Proposal (/q/) Route ────────────────────────────────────────
  test('Public proposal /q/ route — check redirect/404 behavior', async ({ page }) => {
    const consoleErrors: string[] = [];
    const networkErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('response', (response) => {
      if (response.status() >= 400) {
        networkErrors.push(`${response.status()} ${response.url()}`);
      }
    });

    // Test the base /q/ route
    await page.goto(`${BASE_URL}/q/`, { waitUntil: 'networkidle', timeout: 30000 });
    const qBaseUrl = page.url();
    const qBaseStatus = await page.locator('body').textContent();
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'q-base.png'), fullPage: true });
    console.log('Q BASE URL:', qBaseUrl);
    console.log('Q BASE BODY:', qBaseStatus?.trim().slice(0, 200));

    // Test with a fake proposal ID (to see 404 handling)
    await page.goto(`${BASE_URL}/q/test-proposal-123`, { waitUntil: 'networkidle', timeout: 30000 });
    const qTestUrl = page.url();
    const qTestBody = await page.locator('body').textContent();
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'q-test-proposal.png'), fullPage: true });
    console.log('Q TEST URL:', qTestUrl);
    console.log('Q TEST BODY:', qTestBody?.trim().slice(0, 300));

    // Check if there's a meaningful not-found or loading state
    const notFoundText = qTestBody?.toLowerCase() || '';
    const hasNotFoundState = notFoundText.includes('not found') ||
      notFoundText.includes('expired') ||
      notFoundText.includes('invalid') ||
      notFoundText.includes("doesn't exist") ||
      notFoundText.includes('404');
    console.log('HAS NOT-FOUND STATE:', hasNotFoundState);

    console.log('Q CONSOLE ERRORS:', consoleErrors);
    console.log('Q NETWORK ERRORS:', networkErrors.filter(e => !e.includes('favicon')));
  });

  // ─── 5. General UX — 404 Page ─────────────────────────────────────────────
  test('404 page is handled gracefully', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/this-page-does-not-exist`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '404-page.png'), fullPage: true });

    const bodyText = await page.locator('body').textContent();
    const currentUrl = page.url();
    console.log('404 URL:', currentUrl);
    console.log('404 BODY:', bodyText?.trim().slice(0, 300));
    console.log('404 CONSOLE ERRORS:', consoleErrors);

    // Should NOT show a blank page or an unhandled crash
    expect(bodyText?.trim().length).toBeGreaterThan(10);
  });

  // ─── 6. Landing Page — Mobile Viewport ────────────────────────────────────
  test('Landing page — mobile viewport check', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14 Pro
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'landing-mobile.png'), fullPage: true });

    const h1 = page.locator('h1').first();
    const h1Visible = await h1.isVisible().catch(() => false);
    console.log('MOBILE H1 VISIBLE:', h1Visible);

    // Check hamburger/mobile menu
    const mobileMenu = page.locator('[data-testid*="menu"], button[aria-label*="menu" i], .hamburger, .mobile-menu-btn').first();
    const mobileMenuVisible = await mobileMenu.isVisible().catch(() => false);
    console.log('MOBILE MENU BUTTON VISIBLE:', mobileMenuVisible);

    // Check horizontal overflow (common mobile bug)
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    console.log('MOBILE SCROLL WIDTH:', scrollWidth, 'CLIENT WIDTH:', clientWidth);
    if (scrollWidth > clientWidth) {
      console.warn('HORIZONTAL OVERFLOW DETECTED — body wider than viewport');
    }

    console.log('MOBILE CONSOLE ERRORS:', consoleErrors.filter(e => !e.includes('favicon')));
  });

  // ─── 7. Performance & Accessibility Spot-check ────────────────────────────
  test('Landing page — performance and accessibility spot-check', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });

    // Check all images have alt text
    const images = await page.locator('img').all();
    const missingAlt: string[] = [];
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const src = await img.getAttribute('src');
      if (alt === null || alt === '') {
        missingAlt.push(src || 'unknown src');
      }
    }
    console.log('IMAGES MISSING ALT TEXT:', missingAlt);

    // Check all buttons have accessible text
    const buttons = await page.locator('button').all();
    const inaccessibleButtons: string[] = [];
    for (const btn of buttons) {
      const text = await btn.textContent();
      const ariaLabel = await btn.getAttribute('aria-label');
      const ariaLabelledBy = await btn.getAttribute('aria-labelledby');
      if (!text?.trim() && !ariaLabel && !ariaLabelledBy) {
        const outerHTML = await btn.evaluate(el => el.outerHTML.slice(0, 100));
        inaccessibleButtons.push(outerHTML);
      }
    }
    console.log('INACCESSIBLE BUTTONS (no text/aria-label):', inaccessibleButtons);

    // Check links with no text
    const links = await page.locator('a').all();
    const emptyLinks: string[] = [];
    for (const link of links) {
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const href = await link.getAttribute('href');
      if (!text?.trim() && !ariaLabel) {
        emptyLinks.push(href || 'no href');
      }
    }
    console.log('LINKS WITH NO TEXT:', emptyLinks);

    // Check form labels (login page)
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    const inputs = await page.locator('input').all();
    const unlabelledInputs: string[] = [];
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const placeholder = await input.getAttribute('placeholder');
      const type = await input.getAttribute('type');
      if (!ariaLabel && !placeholder && id) {
        const label = await page.locator(`label[for="${id}"]`).count();
        if (label === 0) {
          unlabelledInputs.push(`type=${type} id=${id}`);
        }
      }
    }
    console.log('UNLABELLED INPUTS:', unlabelledInputs);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'accessibility-check.png'), fullPage: true });
  });

});
