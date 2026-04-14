import { expect, test } from '@playwright/test';
import * as path from 'path';

const BASE_URL = process.env.SNAPQUOTE_BASE_URL || 'https://snapquote.dev';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

test('landing page redesign renders the premium contractor story on desktop', async ({ page }) => {
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });

  await expect(
    page.getByRole('heading', { name: 'Quote the job. Win the job. Get the deposit.' })
  ).toBeVisible();
  await expect(page.getByText('Built by a contractor. Tuned for the driveway.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Start Free for 14 Days' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'See the Workflow' })).toBeVisible();
  await expect(page.getByText('This is built for the moment the sale actually happens.')).toBeVisible();
  await expect(page.getByText('One flow from photos to proposal to payment.')).toBeVisible();
  await expect(page.getByText('The CRM around the quote stays just as fast.')).toBeVisible();

  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'landing-redesign-desktop.png'),
    fullPage: true,
  });
});

test('landing page redesign stays clean and readable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });

  await expect(
    page.getByRole('heading', { name: 'Quote the job. Win the job. Get the deposit.' })
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Start Free for 14 Days' })).toBeVisible();

  await page.getByRole('link', { name: 'See the Workflow' }).click();
  await expect(page.locator('#workflow')).toBeInViewport();

  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'landing-redesign-mobile.png'),
    fullPage: false,
  });
});
