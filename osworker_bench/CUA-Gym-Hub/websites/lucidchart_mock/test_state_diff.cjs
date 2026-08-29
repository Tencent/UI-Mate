const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('http://127.0.0.1:5555/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const results = [];

  // Star a document to create a state change
  const starBtns = await page.$$('.grid > div button');
  for (const btn of starBtns) {
    const fill = await btn.evaluate(b => b.querySelector('svg')?.getAttribute('fill') || '');
    if (fill === 'none') {
      await btn.click();
      await page.waitForTimeout(500);
      results.push('Toggled star on unstarred doc');
      break;
    }
  }
  await page.waitForTimeout(1000);

  // Check localStorage
  const stateCheck = await page.evaluate(() => {
    const keys = Object.keys(localStorage);
    const ck = keys.find(k => k.startsWith('lucidchart_mock_state') && k.indexOf('initial') === -1);
    const ik = keys.find(k => k.indexOf('initialState') !== -1);
    if (!ck || !ik) return { keys, error: 'missing keys' };
    const c = JSON.parse(localStorage.getItem(ck));
    const i = JSON.parse(localStorage.getItem(ik));
    // Find a doc where starred differs
    for (const cd of c.documents) {
      const id = i.documents.find(d => d.id === cd.id);
      if (id && cd.starred !== id.starred) {
        return { docId: cd.id, currentStarred: cd.starred, initialStarred: id.starred };
      }
    }
    return { noChange: true, docCount: c.documents.length };
  });
  results.push('State check: ' + JSON.stringify(stateCheck));

  // Navigate to /go
  await page.goto('http://127.0.0.1:5555/go');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const goText = await page.textContent('pre');
  if (goText) {
    try {
      const goData = JSON.parse(goText);
      const diff = goData.state_diff;
      const diffStr = JSON.stringify(diff);
      results.push('state_diff length: ' + diffStr.length);
      results.push('state_diff empty: ' + (diffStr === '{}'));
      results.push('state_diff preview: ' + diffStr.substring(0, 400));

      // Compare doc-1 starred
      const initDoc = goData.initial_state?.documents?.find(d => d.id === 'doc-1');
      const currDoc = goData.current_state?.documents?.find(d => d.id === 'doc-1');
      results.push('doc-1 init starred: ' + initDoc?.starred + ', curr: ' + currDoc?.starred);
    } catch (e) {
      results.push('Parse error: ' + e.message);
    }
  }

  // Also test: Make changes in editor and then check /go
  results.push('\n=== EDITOR CHANGES + /go ===');
  await page.goto('http://127.0.0.1:5555/editor/doc-1');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  // Add a shape
  const rectBtn = await page.$('div[title="Rectangle"]');
  if (rectBtn) {
    await rectBtn.click({ force: true });
    await page.waitForTimeout(1000);
    results.push('Added rectangle shape');
  }

  // Check /go
  await page.goto('http://127.0.0.1:5555/go');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const goText2 = await page.textContent('pre');
  if (goText2) {
    try {
      const goData2 = JSON.parse(goText2);
      const diff2 = goData2.state_diff;
      const diffStr2 = JSON.stringify(diff2);
      results.push('state_diff after editor changes: ' + diffStr2.substring(0, 500));
      results.push('Has shapes diff: ' + (diff2?.shapes ? 'YES' : 'NO'));
    } catch (e) {
      results.push('Parse error: ' + e.message);
    }
  }

  // Test zoom buttons precisely
  results.push('\n=== ZOOM STATUS BAR BUTTONS ===');
  await page.goto('http://127.0.0.1:5555/editor/doc-1');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  // Get zoom value
  const zoomBefore = await page.evaluate(() => {
    const select = document.querySelector('.h-8.flex.items-center.border-t select');
    return select ? select.value : 'not found';
  });
  results.push('Zoom before: ' + zoomBefore);

  // Click the minus button (first button with Minus icon near zoom)
  const zoomButtons = await page.evaluate(() => {
    const statusBar = document.querySelector('.h-8.flex.items-center.border-t');
    if (!statusBar) return [];
    const btns = statusBar.querySelectorAll('.flex.items-center.gap-1 button');
    return Array.from(btns).map((b, i) => ({ index: i, html: b.innerHTML.substring(0, 80) }));
  });
  results.push('Zoom area buttons: ' + JSON.stringify(zoomButtons));

  // Click via evaluate to bypass any interception issues
  await page.evaluate(() => {
    const statusBar = document.querySelector('.h-8.flex.items-center.border-t');
    const btns = statusBar.querySelectorAll('.flex.items-center.gap-1 button');
    if (btns[0]) btns[0].click();
  });
  await page.waitForTimeout(500);

  const zoomAfterMinus = await page.evaluate(() => {
    const select = document.querySelector('.h-8.flex.items-center.border-t select');
    return select ? select.value : 'not found';
  });
  results.push('Zoom after minus click: ' + zoomAfterMinus);

  // The issue might be that the buttons have gap-2 structure and there are 3 buttons
  // Let me check all zoom area content
  const zoomAreaHTML = await page.evaluate(() => {
    const statusBar = document.querySelector('.h-8.flex.items-center.border-t');
    const zoomDiv = statusBar?.querySelector('.flex.items-center.gap-2');
    return zoomDiv ? zoomDiv.innerHTML : 'not found';
  });
  results.push('Zoom area HTML snippet: ' + zoomAreaHTML.substring(0, 200));

  console.log(results.join('\n'));
  await browser.close();
})().catch(e => { console.error('TEST ERROR:', e.message); process.exit(1); });
