import { expect, test } from '@playwright/test';
import * as path from 'path';

const BASE_URL = process.env.SNAPQUOTE_BASE_URL || 'https://snapquote.dev';
const EMAIL = process.env.SNAPQUOTE_TEST_EMAIL;
const PASSWORD = process.env.SNAPQUOTE_TEST_PASSWORD;
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

test.describe('dashboard readability and quote presentation polish', () => {
  test.skip(!EMAIL || !PASSWORD, 'SnapQuote test credentials are required');

  test('dashboard is easier to read on desktop and public quotes use a better label', async ({ page, browser }) => {
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.getByLabel('Email').fill(EMAIL!);
    await page.locator('input#password').fill(PASSWORD!);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 30000 });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const dashboardMetrics = await page.evaluate(() => {
      const greeting = document.querySelector('header h1');
      const sidebarLink = document.querySelector('aside nav a');

      return {
        greetingFontSize: greeting ? parseFloat(getComputedStyle(greeting).fontSize) : 0,
        sidebarFontSize: sidebarLink ? parseFloat(getComputedStyle(sidebarLink).fontSize) : 0,
      };
    });

    expect(dashboardMetrics.greetingFontSize).toBeGreaterThanOrEqual(32);
    expect(dashboardMetrics.sidebarFontSize).toBeGreaterThanOrEqual(14);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'dashboard-readability-desktop.png'),
      fullPage: true,
    });

    await page.goto(`${BASE_URL}/quotes`, { waitUntil: 'networkidle', timeout: 30000 });
    const quotePath = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a[href^="/quotes/"]')) as HTMLAnchorElement[];
      return anchors
        .map((anchor) => anchor.getAttribute('href') || '')
        .find((href) => /^\/quotes\/[0-9a-f-]+$/i.test(href)) || null;
    });

    expect(quotePath).toBeTruthy();
    const quoteId = quotePath!.split('/').pop()!;

    const publicContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      ignoreHTTPSErrors: true,
    });
    const publicPage = await publicContext.newPage();
    await publicPage.goto(`${BASE_URL}/q/${quoteId}`, { waitUntil: 'networkidle', timeout: 30000 });

    const bodyText = await publicPage.locator('body').innerText();
    expect(bodyText).not.toContain('Q-001');
    expect(bodyText).toMatch(/Roofing Quote|Gutter Quote|HVAC Quote|Electrical Quote|Painting Quote|Landscaping Quote|Project Quote|Exterior Quote|Roof Repair Quote/i);

    await publicPage.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'public-quote-label-polish.png'),
      fullPage: false,
    });

    await publicContext.close();
  });
});
