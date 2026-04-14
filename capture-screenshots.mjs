import { firefox } from 'playwright';
import fs from 'fs/promises';

const SCREENSHOTS_DIR = '/Users/mattyerington/Desktop/SnapQuote/appstore-screenshots';
const BASE_URL = 'http://localhost:3000';
const APIKEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkZXhkZG1udWxmdmhjamNodHVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MzY4OTIsImV4cCI6MjA5MDMxMjg5Mn0.TYa_LdhPBMCmUBqOwGxXqddYfXgDG8C0Wj_jnP53X5k';
const SUPABASE_URL = 'https://idexddmnulfvhcjchtuo.supabase.co';

async function capture(page, name, path) {
  await page.screenshot({ path, type: 'png' });
  const stat = await fs.stat(path);
  const kb = (stat.size / 1024).toFixed(0);
  console.log(`  -> ${name}: ${kb}KB ${parseInt(kb) < 30 ? 'SMALL' : 'OK'}`);
  return parseInt(kb);
}

async function main() {
  console.log('Getting auth token...');
  const authRes = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': APIKEY },
    body: JSON.stringify({ email: 'yeringtonmatthew@gmail.com', password: 'Aiden82819!' })
  });
  const authData = await authRes.json();
  if (!authData.access_token) { console.error('Auth failed'); return; }

  const session = JSON.stringify({
    access_token: authData.access_token,
    refresh_token: authData.refresh_token,
    expires_in: authData.expires_in,
    expires_at: Math.floor(Date.now() / 1000) + authData.expires_in,
    token_type: 'bearer',
    user: authData.user
  });

  const COOKIE_NAME = 'sb-idexddmnulfvhcjchtuo-auth-token';
  const CHUNK_SIZE = 3180;
  const chunks = [];
  for (let i = 0; i < session.length; i += CHUNK_SIZE) {
    chunks.push(session.substring(i, i + CHUNK_SIZE));
  }
  const cookies = chunks.map((chunk, i) => ({
    name: `${COOKIE_NAME}.${i}`,
    value: chunk,
    domain: 'localhost',
    path: '/',
    httpOnly: false,
    secure: false,
    sameSite: 'Lax',
  }));

  // Test DPI 1, 2, 3 with Firefox
  for (const dpi of [1, 2]) {
    console.log(`\nFirefox DPI ${dpi}:`);
    const browser = await firefox.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 430, height: 932 },
      deviceScaleFactor: dpi,
    });
    await context.addCookies(cookies);
    const page = await context.newPage();
    await page.goto(BASE_URL + '/dashboard', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    await capture(page, `dpi${dpi}`, `${SCREENSHOTS_DIR}/test_ff_dpi${dpi}.png`);
    await browser.close();
  }

  // Also try: use Apple's required resolution directly as viewport
  // iPhone 14 Pro Max = 1290x2796 pixels (already at device pixel ratio)
  console.log('\nFirefox at native resolution 1290x2796, DPI 1:');
  const browser = await firefox.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1290, height: 2796 },
    deviceScaleFactor: 1,
  });
  await context.addCookies(cookies);
  const page = await context.newPage();
  await page.goto(BASE_URL + '/dashboard', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);
  await capture(page, 'native-res', `${SCREENSHOTS_DIR}/test_ff_native.png`);
  await browser.close();

  console.log('\nDone. Check the test files.');
}

main().catch(e => { console.error(e); process.exit(1); });
