import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'http://localhost:5777';
const SCREENSHOTS = path.join(__dirname, 'assets/screenshots');

async function takeScreenshots() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Home page
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOTS}/mock_final_home.png`, fullPage: false });
  console.log('Captured home page');

  // Open pin modal
  const pinCards = await page.locator('div.cursor-zoom-in.group').all();
  if (pinCards.length > 0) {
    await pinCards[0].click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOTS}/mock_final_pin_modal.png`, fullPage: false });
    console.log('Captured pin modal');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
  }

  // Notifications
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const navBtns = await page.locator('nav button').all();
  for (const btn of navBtns) {
    const html = await btn.innerHTML().catch(() => '');
    if (html.includes('lucide-bell')) {
      await btn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${SCREENSHOTS}/mock_final_notifications.png`, fullPage: false });
      console.log('Captured notifications');
      await page.keyboard.press('Escape');
      break;
    }
  }

  // User dropdown
  await page.waitForTimeout(300);
  const navBtns2 = await page.locator('nav button').all();
  await navBtns2[navBtns2.length - 1].click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SCREENSHOTS}/mock_final_user_dropdown.png`, fullPage: false });
  console.log('Captured user dropdown');
  await page.keyboard.press('Escape');

  // Search results
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const searchInput = await page.locator('input[placeholder="Search"]').first();
  await searchInput.fill('Interior');
  await searchInput.press('Enter');
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${SCREENSHOTS}/mock_final_search.png`, fullPage: false });
  console.log('Captured search results with filter chips');

  // Board detail
  await page.goto(`${BASE_URL}/board/b1`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${SCREENSHOTS}/mock_final_board.png`, fullPage: false });
  console.log('Captured board detail');

  // Profile
  await page.goto(`${BASE_URL}/profile/u1`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${SCREENSHOTS}/mock_final_profile.png`, fullPage: false });
  console.log('Captured profile page');

  // Profile edit modal
  const editBtn = await page.locator('button').filter({ hasText: /^Edit Profile$/ }).first();
  await editBtn.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SCREENSHOTS}/mock_final_profile_edit.png`, fullPage: false });
  console.log('Captured profile edit modal');

  await browser.close();
  console.log('All screenshots captured!');
}

await takeScreenshots();
process.exit(0);
