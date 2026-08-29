const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const results = [];
  page.on('console', msg => {
    if (msg.text().startsWith('[APP]')) results.push(msg.text());
  });

  // Clear state and set up
  await page.goto('http://127.0.0.1:5555/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Add shape in editor
  await page.goto('http://127.0.0.1:5555/editor/doc-1');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  const rectBtn = await page.$('div[title="Rectangle"]');
  if (rectBtn) await rectBtn.click({ force: true });
  await page.waitForTimeout(3000);

  // Instead of navigating to /go via browser, let's check from within the current page
  // by examining what the AppContext would return
  const stateFromContext = await page.evaluate(() => {
    // We can't access React context directly, but we can check localStorage
    const current = JSON.parse(localStorage.getItem('lucidchart_mock_state') || '{}');
    const initial = JSON.parse(localStorage.getItem('lucidchart_mock_initialState') || '{}');
    return {
      currentShapes: current.shapes?.length,
      initialShapes: initial.shapes?.length,
      currentDocs: current.documents?.length,
      initialDocs: initial.documents?.length
    };
  });
  results.push('State from localStorage: ' + JSON.stringify(stateFromContext));

  // Now let's navigate to /go and wait extra long
  await page.goto('http://127.0.0.1:5555/go');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);

  // Check the pre content multiple times
  for (let i = 0; i < 3; i++) {
    await page.waitForTimeout(2000);
    const preText = await page.textContent('pre');
    const parsed = JSON.parse(preText || '{}');
    results.push('Check ' + i + ': initial_state keys=' + Object.keys(parsed.initial_state || {}).join(','));
    results.push('Check ' + i + ': current_state keys=' + Object.keys(parsed.current_state || {}).join(','));
    if (Object.keys(parsed.initial_state || {}).length > 0) break;
  }

  // Check if localStorage is still intact on /go page
  const lsOnGo = await page.evaluate(() => {
    const current = localStorage.getItem('lucidchart_mock_state');
    const initial = localStorage.getItem('lucidchart_mock_initialState');
    return {
      currentExists: !!current,
      initialExists: !!initial,
      currentLen: current?.length,
      initialLen: initial?.length
    };
  });
  results.push('localStorage on /go: ' + JSON.stringify(lsOnGo));

  // Try the server-side /go endpoint
  const response = await page.evaluate(async () => {
    const resp = await fetch('/go');
    return resp.ok ? await resp.text() : 'FETCH FAILED: ' + resp.status;
  });
  results.push('Server /go endpoint: ' + response.substring(0, 200));

  console.log(results.join('\n'));
  await browser.close();
})().catch(e => { console.error('TEST ERROR:', e.message); process.exit(1); });
