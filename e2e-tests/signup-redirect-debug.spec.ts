import { test, expect } from '@playwright/test';
import * as path from 'path';

const BASE_URL = 'https://snapquote.dev';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

test('Debug: click Start Free from nav — trace full redirect chain', async ({ page }) => {
  const requests: string[] = [];
  const responses: Array<{url: string, status: number}> = [];

  page.on('request', r => {
    if (r.isNavigationRequest()) requests.push(`[${r.method()}] ${r.url()}`);
  });
  page.on('response', r => {
    if (r.request().isNavigationRequest()) responses.push({ url: r.url(), status: r.status() });
  });

  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });

  // Find the "Start Free" button precisely
  const startFree = page.locator('a:has-text("Start Free")').first();
  const href = await startFree.getAttribute('href');
  console.log('"Start Free" href attribute:', href);

  // Navigate directly to /auth/signup to see if it auto-redirects when logged out
  await page.goto(`${BASE_URL}/auth/signup`, { waitUntil: 'networkidle', timeout: 30000 });
  console.log('Direct nav to /auth/signup — final URL:', page.url());

  // Now try clicking the nav button
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
  requests.length = 0;
  responses.length = 0;

  await startFree.click();
  await page.waitForLoadState('networkidle');

  console.log('After clicking Start Free — final URL:', page.url());
  console.log('Navigation requests:', requests);
  console.log('Navigation responses:', responses.map(r => `${r.status} ${r.url}`));

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'start-free-click-result.png'), fullPage: true });
});

test('Debug: measure signup page body height vs content height', async ({ page }) => {
  await page.goto(`${BASE_URL}/auth/signup`, { waitUntil: 'networkidle', timeout: 30000 });

  const measurements = await page.evaluate(() => {
    const body = document.body;
    const outerDiv = document.querySelector('div[class*="min-h-dvh"]');
    const formWrapper = document.querySelector('div[class*="max-w-sm"]');
    const mainContent = document.getElementById('main-content');

    return {
      bodyScrollHeight: body.scrollHeight,
      bodyClientHeight: body.clientHeight,
      viewportHeight: window.innerHeight,
      outerDivHeight: outerDiv?.getBoundingClientRect().height,
      formWrapperHeight: formWrapper?.getBoundingClientRect().height,
      mainContentHeight: mainContent?.getBoundingClientRect().height,
      dvhValue: window.innerHeight, // approximation for dvh
    };
  });

  console.log('HEIGHT MEASUREMENTS:', JSON.stringify(measurements, null, 2));
  console.log('EXCESS BLANK SPACE:', measurements.bodyScrollHeight - measurements.bodyClientHeight, 'px');

  // Check what elements have min-h-dvh
  const dvhElements = await page.evaluate(() => {
    const all = document.querySelectorAll('*');
    const results: string[] = [];
    all.forEach(el => {
      const style = window.getComputedStyle(el);
      if (el.className && typeof el.className === 'string' && el.className.includes('min-h')) {
        results.push(`${el.tagName}.${el.className.split(' ').join('.')} — minHeight: ${style.minHeight}`);
      }
    });
    return results.slice(0, 20);
  });
  console.log('ELEMENTS WITH min-h:', dvhElements);
});
