import { chromium } from '/tmp/node_modules/playwright/index.mjs';
import fs from 'fs/promises';
import { execSync } from 'child_process';

const SCREENSHOTS_DIR = '/Users/mattyerington/Desktop/SnapQuote/appstore-screenshots';
const BASE_URL = 'https://snapquote.dev';
const APIKEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkZXhkZG1udWxmdmhjamNodHVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MzY4OTIsImV4cCI6MjA5MDMxMjg5Mn0.TYa_LdhPBMCmUBqOwGxXqddYfXgDG8C0Wj_jnP53X5k';
const SUPABASE_URL = 'https://idexddmnulfvhcjchtuo.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkZXhkZG1udWxmdmhjamNodHVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDczNjg5MiwiZXhwIjoyMDkwMzEyODkyfQ.h_PczytaQoTDSSkQVl2cdS0GBao2kMFXCYQoaljAmK8';

const PAGES = [
  { path: '/dashboard', name: 'ipad_dashboard', wait: 15000 },
  { path: '/schedule', name: 'ipad_schedule', wait: 5000 },
  { path: '/pipeline', name: 'ipad_pipeline', wait: 5000 },
  { path: '/jobs', name: 'ipad_jobs', wait: 5000 },
  { path: '/quotes/new', name: 'ipad_new_quote', wait: 5000 },
];

async function main() {
  // 1. Authenticate with Supabase
  console.log('Authenticating with Supabase...');
  const authRes = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': APIKEY },
    body: JSON.stringify({ email: 'yeringtonmatthew@gmail.com', password: 'Aiden82819!' })
  });
  const authData = await authRes.json();
  if (!authData.access_token) {
    console.error('Auth failed:', authData);
    process.exit(1);
  }
  console.log('Auth successful.');

  // 2. Build chunked cookies for snapquote.dev
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
    domain: '.snapquote.dev',
    path: '/',
    httpOnly: false,
    secure: true,
    sameSite: 'Lax',
  }));
  console.log(`Session split into ${chunks.length} cookie chunks.`);

  // 3. Launch browser with iPad viewport
  // iPad 13" portrait: 2048x2732 pixels -> viewport 1024x1366 @ 2x
  console.log('Launching Chromium (iPad 13" portrait: 1024x1366 @2x = 2048x2732)...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1024, height: 1366 },
    deviceScaleFactor: 2,
  });
  await context.addCookies(cookies);

  // 4. Take screenshots for each page
  for (const { path, name, wait } of PAGES) {
    const filePath = `${SCREENSHOTS_DIR}/${name}.png`;
    console.log(`\nNavigating to ${path}...`);
    const page = await context.newPage();
    await page.goto(BASE_URL + path, { waitUntil: 'networkidle', timeout: 60000 });
    console.log(`  Waiting ${wait / 1000}s for content to load...`);
    await page.waitForTimeout(wait);
    await page.screenshot({ path: filePath, type: 'png' });
    const stat = await fs.stat(filePath);
    console.log(`  Saved: ${name}.png (${(stat.size / 1024).toFixed(0)}KB)`);
    await page.close();
  }

  await browser.close();
  console.log('\nAll screenshots captured.');

  // 5. Verify dimensions with sips
  console.log('\nVerifying dimensions:');
  for (const { name } of PAGES) {
    const filePath = `${SCREENSHOTS_DIR}/${name}.png`;
    const result = execSync(`sips -g pixelWidth -g pixelHeight "${filePath}"`).toString();
    const width = result.match(/pixelWidth:\s*(\d+)/)?.[1];
    const height = result.match(/pixelHeight:\s*(\d+)/)?.[1];
    const ok = width === '2048' && height === '2732';
    console.log(`  ${name}.png: ${width}x${height} ${ok ? 'OK' : 'MISMATCH!'}`);
  }

  // 6. Upload to Supabase storage
  console.log('\nUploading to Supabase storage...');
  for (const { name } of PAGES) {
    const filePath = `${SCREENSHOTS_DIR}/${name}.png`;
    const fileData = await fs.readFile(filePath);
    const filename = `${name}.png`;
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/screenshots/${filename}`;

    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'image/png',
      },
      body: fileData,
    });
    const status = res.status;
    const body = await res.text();
    console.log(`  ${filename}: HTTP ${status} ${status === 200 ? 'OK' : body}`);
  }

  console.log('\nDone! Screenshots ready at:');
  for (const { name } of PAGES) {
    console.log(`  ${SUPABASE_URL}/storage/v1/object/public/screenshots/${name}.png`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
