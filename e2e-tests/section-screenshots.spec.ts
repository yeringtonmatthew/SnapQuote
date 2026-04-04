import { test } from '@playwright/test';
import * as path from 'path';

const BASE_URL = 'https://snapquote.dev';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

test('Landing — capture every section at full width', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });

  const sections = await page.locator('section').all();
  for (let i = 0; i < sections.length; i++) {
    const text = await sections[i].textContent().catch(() => '');
    console.log(`\n--- Section ${i} ---`);
    console.log(text?.trim().slice(0, 200).replace(/\s+/g, ' '));

    // Bounding box
    const box = await sections[i].boundingBox().catch(() => null);
    console.log('BBox:', JSON.stringify(box));
  }

  // Scroll to testimonials and capture
  const testimonialsSection = page.locator('section').nth(4);
  await testimonialsSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'section-testimonials.png') });

  // Scroll to pricing section
  const pricingSection = page.locator('section').nth(6);
  await pricingSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'section-pricing.png') });
});
