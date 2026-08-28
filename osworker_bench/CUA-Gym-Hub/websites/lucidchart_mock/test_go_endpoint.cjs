const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Clear state and start fresh
  await page.goto('http://127.0.0.1:5555/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  const results = [];

  // First, check /go has proper state structure by navigating to it
  await page.goto('http://127.0.0.1:5555/go');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  let goText = await page.textContent('pre');
  if (goText) {
    const goData = JSON.parse(goText);
    results.push('initial_state type: ' + typeof goData.initial_state);
    results.push('initial_state keys: ' + Object.keys(goData.initial_state || {}).join(', '));
    results.push('current_state keys: ' + Object.keys(goData.current_state || {}).join(', '));
    results.push('Has documents in initial: ' + Boolean(goData.initial_state?.documents));
    results.push('Has documents in current: ' + Boolean(goData.current_state?.documents));
    results.push('state_diff: ' + JSON.stringify(goData.state_diff));
  }

  // Now go back to dashboard and make changes
  await page.goto('http://127.0.0.1:5555/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Star a document
  const starBtns = await page.$$('.grid > div button');
  for (const btn of starBtns) {
    const fill = await btn.evaluate(b => b.querySelector('svg')?.getAttribute('fill') || '');
    if (fill === 'none') {
      await btn.click();
      await page.waitForTimeout(500);
      results.push('\nStarred a document');
      break;
    }
  }
  await page.waitForTimeout(1500); // wait for debounce

  // Navigate to /go in same tab
  await page.goto('http://127.0.0.1:5555/go');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  goText = await page.textContent('pre');
  if (goText) {
    const goData = JSON.parse(goText);
    const diff = goData.state_diff;
    results.push('state_diff after star: ' + JSON.stringify(diff).substring(0, 500));

    if (goData.initial_state?.documents && goData.current_state?.documents) {
      for (const doc of goData.current_state.documents) {
        const initDoc = goData.initial_state.documents.find(d => d.id === doc.id);
        if (initDoc && doc.starred !== initDoc.starred) {
          results.push('Found star diff for: ' + doc.id);
        }
      }
    }
  }

  // Now go to editor and add a shape
  await page.goto('http://127.0.0.1:5555/editor/doc-1');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  // Add rectangle shape
  const rectBtn = await page.$('div[title="Rectangle"]');
  if (rectBtn) {
    await rectBtn.click({ force: true });
    await page.waitForTimeout(500);
    results.push('\nAdded rectangle shape');
  }
  await page.waitForTimeout(1500);

  // Navigate to /go
  await page.goto('http://127.0.0.1:5555/go');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  goText = await page.textContent('pre');
  if (goText) {
    const goData = JSON.parse(goText);
    const diff = goData.state_diff;
    results.push('state_diff after adding shape: ' + JSON.stringify(diff).substring(0, 500));
    results.push('Shapes in initial: ' + goData.initial_state?.shapes?.length);
    results.push('Shapes in current: ' + goData.current_state?.shapes?.length);
  }

  console.log(results.join('\n'));
  await browser.close();
})().catch(e => { console.error('TEST ERROR:', e.message); process.exit(1); });
