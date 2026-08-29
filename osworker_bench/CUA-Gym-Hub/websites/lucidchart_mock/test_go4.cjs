const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Listen for ALL console messages
  page.on('console', msg => {
    console.log('[BROWSER ' + msg.type() + '] ' + msg.text());
  });

  // Clear state
  await page.goto('http://127.0.0.1:5555/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Now add some console.log to track the state flow on /go page load
  // Inject script before loading /go
  await page.addInitScript(() => {
    // Monkey-patch JSON.stringify to log when called with large objects
    const origStringify = JSON.stringify;
    JSON.stringify = function(val, replacer, space) {
      if (val && typeof val === 'object' && val.initial_state !== undefined) {
        console.log('[DEBUG] JSON.stringify called with go output. initial_state keys: ' + Object.keys(val.initial_state || {}).join(','));
        console.log('[DEBUG] current_state keys: ' + Object.keys(val.current_state || {}).join(','));
      }
      return origStringify.call(JSON, val, replacer, space);
    };
  });

  await page.goto('http://127.0.0.1:5555/go');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);

  const preContent = await page.textContent('pre');
  console.log('\nPre content: ' + (preContent ? preContent.substring(0, 200) : 'none'));

  await browser.close();
})().catch(e => { console.error('TEST ERROR:', e.message); process.exit(1); });
