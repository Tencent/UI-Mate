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

  // ====== INVESTIGATE STATE DIFF ======
  // First, check what initial state was stored
  const initState = await page.evaluate(() => {
    const keys = Object.keys(localStorage).filter(k => k.includes('lucidchart'));
    const ikStr = localStorage.getItem(keys.find(k => k.includes('initial')) || '');
    const ckStr = localStorage.getItem(keys.find(k => !k.includes('initial')) || '');
    return { keys, initLen: ikStr?.length, currLen: ckStr?.length, same: ikStr === ckStr };
  });
  results.push('Init state: ' + JSON.stringify(initState));

  // Star doc-2 (currently not starred)
  // Switch to list view for easier targeting
  const listBtn = await page.$$('.flex.items-center.gap-1.border button');
  await listBtn[1].click();
  await page.waitForTimeout(500);

  // Find the star button for a specific row
  const rows = await page.$$('table tbody tr');
  results.push('Document rows: ' + rows.length);

  if (rows.length > 1) {
    // Click the star on second row
    const starBtn = await rows[1].$('button');
    if (starBtn) {
      await starBtn.click();
      await page.waitForTimeout(800);
      results.push('Starred document');
    }
  }

  // Wait for debounced save
  await page.waitForTimeout(1500);

  // Check if state changed in localStorage
  const stateAfter = await page.evaluate(() => {
    const keys = Object.keys(localStorage).filter(k => k.includes('lucidchart'));
    const ikStr = localStorage.getItem(keys.find(k => k.includes('initial')) || '');
    const ckStr = localStorage.getItem(keys.find(k => !k.includes('initial')) || '');
    return { same: ikStr === ckStr, initLen: ikStr?.length, currLen: ckStr?.length };
  });
  results.push('After star: ' + JSON.stringify(stateAfter));

  // Now go to /go
  await page.goto('http://127.0.0.1:5555/go');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const goText = await page.textContent('pre');
  if (goText) {
    const goData = JSON.parse(goText);
    results.push('state_diff: ' + JSON.stringify(goData.state_diff).substring(0, 500));
    results.push('initial docs count: ' + goData.initial_state?.documents?.length);
    results.push('current docs count: ' + goData.current_state?.documents?.length);
    // Check if doc-1 or any doc has starred change
    for (const doc of (goData.current_state?.documents || [])) {
      const initDoc = goData.initial_state?.documents?.find(d => d.id === doc.id);
      if (initDoc && doc.starred !== initDoc.starred) {
        results.push('FOUND DIFF: ' + doc.id + ' starred changed from ' + initDoc.starred + ' to ' + doc.starred);
      }
    }
  }

  // ====== ZOOM BUTTONS - PRECISE ======
  results.push('\n=== ZOOM BUTTONS PRECISE ===');
  await page.goto('http://127.0.0.1:5555/editor/doc-1');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  // Get exact structure of status bar
  const statusBarStructure = await page.evaluate(() => {
    const bar = document.querySelector('.h-8.flex.items-center.border-t');
    if (!bar) return 'no bar';
    const children = bar.children;
    let result = [];
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      result.push({
        tag: child.tagName,
        class: child.className.substring(0, 50),
        text: child.textContent.substring(0, 30),
        childCount: child.children.length
      });
    }
    return result;
  });
  results.push('Status bar children: ' + JSON.stringify(statusBarStructure, null, 1));

  // Get zoom area structure
  const zoomStructure = await page.evaluate(() => {
    const bar = document.querySelector('.h-8.flex.items-center.border-t');
    if (!bar) return 'no bar';
    // Find all gap-1 divs
    const gapDivs = bar.querySelectorAll('.flex.items-center.gap-1');
    return Array.from(gapDivs).map((div, idx) => ({
      idx,
      class: div.className,
      children: Array.from(div.children).map(c => ({
        tag: c.tagName,
        text: c.textContent.substring(0, 20),
        type: c.type || ''
      }))
    }));
  });
  results.push('Gap-1 divs: ' + JSON.stringify(zoomStructure, null, 1));

  // Now find the zoom minus button (it's inside gap-1 that also has a select)
  const zoomResult = await page.evaluate(() => {
    const bar = document.querySelector('.h-8.flex.items-center.border-t');
    const gapDivs = bar.querySelectorAll('.flex.items-center.gap-1');
    for (const div of gapDivs) {
      const sel = div.querySelector('select');
      if (sel) {
        const btns = div.querySelectorAll('button');
        return {
          found: true,
          selectValue: sel.value,
          buttonCount: btns.length
        };
      }
    }
    return { found: false };
  });
  results.push('Zoom div found: ' + JSON.stringify(zoomResult));

  // Click zoom minus
  const zoomClicked = await page.evaluate(() => {
    const bar = document.querySelector('.h-8.flex.items-center.border-t');
    const gapDivs = bar.querySelectorAll('.flex.items-center.gap-1');
    for (const div of gapDivs) {
      const sel = div.querySelector('select');
      if (sel) {
        const btns = div.querySelectorAll('button');
        if (btns[0]) {
          btns[0].click();
          return { clicked: 'minus', beforeVal: sel.value };
        }
      }
    }
    return { clicked: false };
  });
  await page.waitForTimeout(500);

  const zoomAfter = await page.evaluate(() => {
    const bar = document.querySelector('.h-8.flex.items-center.border-t');
    const sel = bar.querySelector('select');
    return sel ? sel.value : 'not found';
  });
  results.push('After zoom minus: before=' + zoomClicked.beforeVal + ' after=' + zoomAfter);

  // Click zoom plus
  const zoomPlusClicked = await page.evaluate(() => {
    const bar = document.querySelector('.h-8.flex.items-center.border-t');
    const gapDivs = bar.querySelectorAll('.flex.items-center.gap-1');
    for (const div of gapDivs) {
      const sel = div.querySelector('select');
      if (sel) {
        const btns = div.querySelectorAll('button');
        if (btns[1]) {
          btns[1].click();
          return { clicked: 'plus' };
        }
      }
    }
    return { clicked: false };
  });
  await page.waitForTimeout(500);

  const zoomAfterPlus = await page.evaluate(() => {
    const bar = document.querySelector('.h-8.flex.items-center.border-t');
    const sel = bar.querySelector('select');
    return sel ? sel.value : 'not found';
  });
  results.push('After zoom plus: ' + zoomAfterPlus);

  console.log(results.join('\n'));
  await browser.close();
})().catch(e => { console.error('TEST ERROR:', e.message); process.exit(1); });
