const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const results = [];
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  // Clear state
  await page.goto('http://127.0.0.1:5555/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Verify initial star states in the grid
  const starInfoBefore = await page.evaluate(() => {
    const btns = document.querySelectorAll('.grid > div button');
    return Array.from(btns).map((b, i) => ({
      i,
      fill: b.querySelector('svg')?.getAttribute('fill') || 'none',
      text: b.closest('.grid > div')?.textContent?.substring(0, 30) || ''
    }));
  });
  results.push('Star buttons before click: ' + JSON.stringify(starInfoBefore));

  // Find and click an unstarred doc star button
  const starBtn = await page.evaluate(() => {
    const btns = document.querySelectorAll('.grid > div button');
    for (const btn of btns) {
      const fill = btn.querySelector('svg')?.getAttribute('fill');
      if (fill === 'none') {
        btn.click();
        return { clicked: true, fill };
      }
    }
    return { clicked: false };
  });
  results.push('Click result: ' + JSON.stringify(starBtn));
  await page.waitForTimeout(500);

  // Check if the star visually changed
  const starInfoAfter = await page.evaluate(() => {
    const btns = document.querySelectorAll('.grid > div button');
    return Array.from(btns).map((b, i) => ({
      i,
      fill: b.querySelector('svg')?.getAttribute('fill') || 'none',
      text: b.closest('.grid > div')?.textContent?.substring(0, 30) || ''
    }));
  });
  results.push('Star buttons after click: ' + JSON.stringify(starInfoAfter));

  // Wait for debounce
  await page.waitForTimeout(2000);

  // Check localStorage
  const lsAfterStar = await page.evaluate(() => {
    const c = localStorage.getItem('lucidchart_mock_state');
    const i = localStorage.getItem('lucidchart_mock_initialState');
    return { same: c === i, cLen: c?.length, iLen: i?.length };
  });
  results.push('After star + 2s: ' + JSON.stringify(lsAfterStar));

  // Try a different approach: navigate to editor and make a change there
  results.push('\n=== EDITOR STATE CHANGE ===');
  await page.goto('http://127.0.0.1:5555/editor/doc-1');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Add a shape via panel click
  const rectBtn = await page.$('div[title="Rectangle"]');
  if (rectBtn) {
    await rectBtn.click({ force: true });
    await page.waitForTimeout(500);
    results.push('Added rectangle');
  }

  // Wait for save
  await page.waitForTimeout(2000);

  // Check localStorage
  const lsAfterShape = await page.evaluate(() => {
    const c = localStorage.getItem('lucidchart_mock_state');
    const i = localStorage.getItem('lucidchart_mock_initialState');
    const cData = JSON.parse(c);
    const iData = JSON.parse(i);
    return {
      same: c === i,
      cShapes: cData.shapes?.length,
      iShapes: iData.shapes?.length,
      cLen: c?.length,
      iLen: i?.length
    };
  });
  results.push('After shape add: ' + JSON.stringify(lsAfterShape));

  // If shapes count differs, state_diff should work
  // Navigate to /go
  await page.evaluate(() => window.location.href = '/go');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  const goText = await page.textContent('pre');
  if (goText) {
    try {
      const goData = JSON.parse(goText);
      results.push('state_diff: ' + JSON.stringify(goData.state_diff).substring(0, 300));
      results.push('initial shapes: ' + goData.initial_state?.shapes?.length);
      results.push('current shapes: ' + goData.current_state?.shapes?.length);
    } catch (e) {
      results.push('Error: ' + e.message);
    }
  }

  results.push('\nConsole errors: ' + (errors.length > 0 ? errors.join('; ') : 'None'));

  console.log(results.join('\n'));
  await browser.close();
})().catch(e => { console.error('TEST ERROR:', e.message); process.exit(1); });
