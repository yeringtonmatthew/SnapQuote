import { test, expect } from '@playwright/test';
import * as path from 'path';

const BASE_URL = 'https://snapquote.dev';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

test('Signup page at iPhone 14 Pro real viewport — does grey bleed show?', async ({ page }) => {
  // Exact iPhone 14 Pro dimensions in CSS pixels
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto(`${BASE_URL}/auth/signup`, { waitUntil: 'networkidle', timeout: 30000 });

  // Viewport-only screenshot (what the user actually sees)
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'signup-iphone14-viewport.png'),
    fullPage: false
  });

  // Full page to see the overflow
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'signup-iphone14-fullpage.png'),
    fullPage: true
  });

  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const clientHeight = await page.evaluate(() => document.documentElement.clientHeight);
  console.log(`iPhone 14 Pro — scrollHeight: ${scrollHeight}, clientHeight: ${clientHeight}, overflow: ${scrollHeight - clientHeight}px`);
});

test('Login page — Apple and Facebook buttons not present (expected pre-launch state)', async ({ page }) => {
  await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle', timeout: 30000 });

  const allButtons = await page.locator('button').allTextContents();
  console.log('ALL LOGIN BUTTONS:', allButtons);

  // Document what social providers ARE and ARE NOT present
  const hasGoogle = allButtons.some(t => t.toLowerCase().includes('google'));
  const hasApple = allButtons.some(t => t.toLowerCase().includes('apple'));
  const hasFacebook = allButtons.some(t => t.toLowerCase().includes('facebook'));

  console.log('Google:', hasGoogle, '| Apple:', hasApple, '| Facebook:', hasFacebook);
  expect(hasGoogle).toBe(true); // Google must be present
});

test('Landing page — check testimonials section and pricing section render', async ({ page }) => {
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });

  // Scroll through and capture sections
  const sections = await page.locator('section').all();
  console.log('NUMBER OF SECTIONS:', sections.length);

  for (let i = 0; i < sections.length; i++) {
    const text = await sections[i].textContent().catch(() => '');
    const snippet = text?.trim().slice(0, 60).replace(/\n/g, ' ');
    if (snippet) console.log(`Section[${i}]:`, snippet);
  }

  // Check pricing section specifically
  const pricingSection = page.locator('section:has-text("Pricing"), div:has-text("Pricing")').first();
  const pricingVisible = await pricingSection.isVisible().catch(() => false);
  console.log('PRICING SECTION VISIBLE:', pricingVisible);

  // Scroll to pricing and screenshot
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.65));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'landing-pricing-section.png') });

  // Check for testimonials
  const testimonials = page.locator('[class*="testimonial"], blockquote, [class*="review"]');
  const testimonialCount = await testimonials.count();
  console.log('TESTIMONIAL ELEMENTS:', testimonialCount);
});

test('Check /login and /signup redirect to correct auth paths', async ({ page }) => {
  // /login (old path) — should 404 or redirect
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
  console.log('/login final URL:', page.url());
  const loginBody = await page.locator('body').textContent();
  console.log('/login shows 404:', loginBody?.includes('Page not found'));

  // /signup (old path) — should 404 or redirect
  await page.goto(`${BASE_URL}/signup`, { waitUntil: 'networkidle', timeout: 30000 });
  console.log('/signup final URL:', page.url());
  const signupBody = await page.locator('body').textContent();
  console.log('/signup shows 404:', signupBody?.includes('Page not found'));
});

test('q/[id] 404 — does the error page work for clients who get a bad link?', async ({ page }) => {
  await page.goto(`${BASE_URL}/q/nonexistent-quote-abc123`, { waitUntil: 'networkidle', timeout: 30000 });

  const bodyText = await page.locator('body').textContent();
  console.log('Q 404 BODY:', bodyText?.trim().slice(0, 200));

  // Does the 404 "Back to Dashboard" CTA make sense for a CLIENT (not logged in)?
  // A client viewing a broken proposal link would be confused by "Back to Dashboard"
  const hasDashboardCTA = bodyText?.includes('Back to Dashboard');
  const hasGoHome = bodyText?.includes('Go Home');
  console.log('Has "Back to Dashboard" on client-facing 404:', hasDashboardCTA);
  console.log('Has "Go Home" link:', hasGoHome);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'q-client-404.png'), fullPage: true });
});
