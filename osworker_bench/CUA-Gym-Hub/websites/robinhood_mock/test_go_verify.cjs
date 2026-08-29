const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const BASE = 'http://localhost:5180';

  // Clear state
  await page.goto(BASE + '/', { waitUntil: 'load' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);

  // Check /go before any interaction
  const goBefore = await page.evaluate(async () => {
    const resp = await fetch('/go');
    return resp.json();
  });
  console.log('=== /go BEFORE interactions ===');
  console.log('Has initial_state:', !!goBefore.initial_state);
  console.log('Has current_state:', !!goBefore.current_state);
  console.log('Has state_diff:', !!goBefore.state_diff);
  console.log('state_diff keys:', Object.keys(goBefore.state_diff));

  // Perform an interaction: buy 2 shares of AAPL
  await page.goto(BASE + '/stock/AAPL', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1500);

  const qtyInput = page.locator('input[type="number"]').first();
  await qtyInput.fill('2');
  await page.waitForTimeout(300);

  const reviewBtn = page.locator('button:text-is("Review Order")').first();
  await reviewBtn.click();
  await page.waitForTimeout(500);

  const submitBtn = page.locator('button:text-is("Submit Order")').first();
  await submitBtn.click();
  await page.waitForTimeout(500);

  const doneBtn = page.locator('button:text-is("Done")').first();
  await doneBtn.click();
  await page.waitForTimeout(500);

  console.log('\n=== Order placed successfully ===');

  // Check /go after interaction
  const goAfter = await page.evaluate(async () => {
    const resp = await fetch('/go');
    return resp.json();
  });
  console.log('\n=== /go AFTER interactions ===');
  console.log('Has initial_state:', !!goAfter.initial_state);
  console.log('Has current_state:', !!goAfter.current_state);
  console.log('Has state_diff:', !!goAfter.state_diff);
  console.log('state_diff keys:', Object.keys(goAfter.state_diff));
  console.log('state_diff empty:', Object.keys(goAfter.state_diff).length === 0);

  // Verify the shares updated in position display
  const bodyText = await page.textContent('body');
  const ownsShares = bodyText.match(/You own (\d+) shares/);
  console.log('\nShares owned after purchase:', ownsShares ? ownsShares[1] : 'not found');

  console.log('\nDONE - /go endpoint verification complete');
  await browser.close();
})().catch(e => {
  console.error('FATAL:', e.message, e.stack);
  process.exit(1);
});
