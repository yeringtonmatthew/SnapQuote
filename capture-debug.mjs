import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';
const OUT = '/Users/mattyerington/Desktop/SnapQuote/appstore-screenshots';

async function main() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: false,
  });

  // Simple context - no mobile emulation, just viewport
  const context = await browser.newContext({
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 3,
  });
  const page = await context.newPage();

  // Go to the app
  await page.goto(BASE_URL + '/dashboard', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Debug: check what we see
  const title = await page.title();
  console.log('Page title:', title);
  const text = await page.evaluate(() => document.body.innerText.substring(0, 200));
  console.log('Body text:', text);

  // Take full page screenshot without clip
  await page.screenshot({ path: `${OUT}/debug_fullpage.png`, type: 'png', fullPage: true });
  const fs = await import('fs');
  const stat1 = await fs.promises.stat(`${OUT}/debug_fullpage.png`);
  console.log('Full page screenshot size:', stat1.size);

  // Take viewport screenshot without clip
  await page.screenshot({ path: `${OUT}/debug_viewport.png`, type: 'png' });
  const stat2 = await fs.promises.stat(`${OUT}/debug_viewport.png`);
  console.log('Viewport screenshot size:', stat2.size);

  // Check the actual rendered pixels by reading a small area
  const box = await page.evaluate(() => {
    const el = document.querySelector('h1, h2, main, [class*="dashboard"]');
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, tag: el.tagName, text: el.textContent?.substring(0, 50) };
  });
  console.log('Main element box:', box);

  // Try with a different approach - use page.pdf or cdp screenshot
  const cdp = await page.context().newCDPSession(page);
  const result = await cdp.send('Page.captureScreenshot', {
    format: 'png',
    quality: 100,
    clip: { x: 0, y: 0, width: 430, height: 932, scale: 3 },
    captureBeyondViewport: false,
  });
  const buffer = Buffer.from(result.data, 'base64');
  await fs.promises.writeFile(`${OUT}/debug_cdp.png`, buffer);
  console.log('CDP screenshot size:', buffer.length);

  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
