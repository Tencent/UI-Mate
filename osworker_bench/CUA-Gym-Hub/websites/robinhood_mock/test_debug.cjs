const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push('ERR: ' + msg.text());
    else if (msg.type() === 'warning') errors.push('WARN: ' + msg.text());
  });
  page.on('pageerror', err => errors.push('PAGE_ERR: ' + err.message));

  const BASE = 'http://localhost:5180';

  // First, clear localStorage to ensure fresh state
  await page.goto(BASE + '/', { waitUntil: 'load', timeout: 15000 });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);

  // Check what is on the page
  const bodyText = await page.textContent('body');
  console.log('Body text (first 500 chars):', bodyText.substring(0, 500));
  console.log('\nURL:', page.url());
  console.log('\nErrors:', errors.slice(0, 5));

  // Check if "Loading..." is still showing
  const loadingEl = await page.locator('text=Loading').count();
  console.log('\n"Loading" elements:', loadingEl);

  // Take a screenshot
  await page.screenshot({ path: '/cpfs02/data/shared/Group-m6/bowen.wbw/openrlvr-mock/robinhood_mock/assets/screenshots/mock_debug.png', fullPage: true });
  console.log('\nScreenshot saved to mock_debug.png');

  // Check header nav links
  const allLinks = await page.locator('a').evaluateAll(els => els.map(el => ({
    href: el.getAttribute('href'),
    text: el.textContent.trim().substring(0, 30),
    visible: el.offsetParent !== null
  })));
  console.log('\nAll links:', JSON.stringify(allLinks, null, 2));

  // Check header buttons
  const allButtons = await page.locator('button').evaluateAll(els => els.map(el => ({
    text: el.textContent.trim().substring(0, 30),
    visible: el.offsetParent !== null
  })));
  console.log('\nAll buttons:', JSON.stringify(allButtons, null, 2));

  await browser.close();
})().catch(e => {
  console.error('FATAL:', e.message, e.stack);
  process.exit(1);
});
