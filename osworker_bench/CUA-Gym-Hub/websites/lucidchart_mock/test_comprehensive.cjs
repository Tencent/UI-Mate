const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const results = [];

  // Clear state and start fresh
  await page.goto('http://127.0.0.1:5555/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // ====== /go endpoint test ======
  // The issue: when doing full page navigation to /go, the React app re-initializes
  // and the state is loaded from localStorage. But the initialState ref and state
  // seem to both be the same (since both come from localStorage on refresh).
  // This means state_diff will always be empty on a fresh /go page load.

  // Let's verify: go to /go via SPA navigation from dashboard
  results.push('=== /go VIA SPA NAVIGATION ===');

  // Make a change: star a document
  const cards = await page.$$('.grid > div');
  for (const card of cards) {
    const btn = await card.$('button');
    if (btn) {
      const fill = await btn.evaluate(b => b.querySelector('svg')?.getAttribute('fill') || '');
      if (fill === 'none') {
        await btn.click();
        await page.waitForTimeout(500);
        results.push('Starred a document');
        break;
      }
    }
  }
  await page.waitForTimeout(1000);

  // Navigate to /go via address bar (JavaScript-based to mimic SPA)
  await page.evaluate(() => {
    window.location.href = '/go';
  });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  let goText = await page.textContent('pre');
  if (goText) {
    const goData = JSON.parse(goText);
    const diffStr = JSON.stringify(goData.state_diff);
    results.push('/go via location.href: state_diff empty=' + (diffStr === '{}'));
    results.push('initial_state keys: ' + Object.keys(goData.initial_state || {}).join(','));
    results.push('current_state keys: ' + Object.keys(goData.current_state || {}).join(','));
  }

  // The root cause: on full page load to /go, the AppProvider does:
  // 1. Check localStorage for initial key -> exists
  // 2. isRefresh = true
  // 3. data = initializeData(sid) -> loads from localStorage (this is the CURRENT state, not initial)
  // 4. initialStateRef.current = getSavedInitialState(sid) || data
  //    -> getSavedInitialState loads from initialState key
  // 5. setState(data) -> sets current from localStorage
  //
  // BUT: step 4 loads from the initial key. The initial key was set when app first loaded.
  // On first load both keys are identical. After changes, only the current key changes.
  // So getSavedInitialState should return the ORIGINAL data and data should return MODIFIED data.
  // State diff should NOT be empty.

  // Let me check the actual localStorage keys
  const lsCheck = await page.evaluate(() => {
    const current = localStorage.getItem('lucidchart_mock_state');
    const initial = localStorage.getItem('lucidchart_mock_initialState');
    return {
      same: current === initial,
      currentLen: current?.length,
      initialLen: initial?.length
    };
  });
  results.push('localStorage same: ' + lsCheck.same + ', curr=' + lsCheck.currentLen + ' init=' + lsCheck.initialLen);

  // The problem: when we starred a document, the 300ms debounced save should have
  // updated only the current state key. Let's verify.
  // Actually, looking at saveState: it only saves to storageKey (current), not initialKey.
  // And initializeData on refresh only reads from storageKey (current) for the state.
  // So if the current and initial localStorage differ, the diff should show.

  // Wait - if lsCheck.same is true, that means the save didn't happen!
  // The debounce save might not have completed before we navigated away.

  // Let me test with explicit waiting
  await page.goto('http://127.0.0.1:5555/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  results.push('\n=== RETRY WITH EXPLICIT WAIT ===');

  // Make change
  const cards2 = await page.$$('.grid > div');
  for (const card of cards2) {
    const btn = await card.$('button');
    if (btn) {
      const fill = await btn.evaluate(b => b.querySelector('svg')?.getAttribute('fill') || '');
      if (fill === 'none') {
        await btn.click();
        results.push('Starred a document');
        break;
      }
    }
  }

  // Wait a long time for debounce save
  await page.waitForTimeout(3000);

  // Verify localStorage changed
  const lsCheck2 = await page.evaluate(() => {
    const current = localStorage.getItem('lucidchart_mock_state');
    const initial = localStorage.getItem('lucidchart_mock_initialState');
    return {
      same: current === initial,
      currentLen: current?.length,
      initialLen: initial?.length
    };
  });
  results.push('After 3s wait - same: ' + lsCheck2.same + ', curr=' + lsCheck2.currentLen + ' init=' + lsCheck2.initialLen);

  // Now navigate to /go
  await page.evaluate(() => window.location.href = '/go');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  goText = await page.textContent('pre');
  if (goText) {
    const goData = JSON.parse(goText);
    const diffStr = JSON.stringify(goData.state_diff);
    results.push('state_diff: ' + diffStr.substring(0, 500));
    results.push('Docs in initial: ' + (goData.initial_state?.documents?.length || 'none'));
    results.push('Docs in current: ' + (goData.current_state?.documents?.length || 'none'));
  }

  // ====== SHARE DIALOG TEST ======
  results.push('\n=== SHARE DIALOG FUNCTIONALITY ===');
  await page.goto('http://127.0.0.1:5555/editor/doc-1');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Open share dialog via orange button
  const shareBtns = await page.$$('button');
  for (const btn of shareBtns) {
    const style = await btn.evaluate(b => b.style.backgroundColor);
    const text = await btn.textContent();
    if (style.includes('F96B13') && text.trim() === 'Share') {
      await btn.click({ force: true });
      break;
    }
  }
  await page.waitForTimeout(500);

  // Check dialog opened
  const dialog = await page.$('.fixed.inset-0.bg-black\\/40');
  results.push('Share dialog opened: ' + (dialog ? 'PASS' : 'FAIL'));

  if (dialog) {
    // Check existing shares
    const sharedUsers = await dialog.$$('.flex.items-center.justify-between.py-2');
    results.push('Shared users listed: ' + sharedUsers.length);

    // Test adding a share
    const emailInput = await dialog.$('input[placeholder*="email"]');
    if (emailInput) {
      await emailInput.fill('mike.chen@company.com');
      const addBtn = await dialog.$('button:has-text("Add")');
      if (addBtn) {
        await addBtn.click();
        await page.waitForTimeout(500);
        const sharedUsersAfter = await dialog.$$('.flex.items-center.justify-between.py-2');
        results.push('After adding share, users: ' + sharedUsersAfter.length);
      }
    }

    // Test remove share
    const removeButtons = await dialog.$$('button svg');
    // Find X icon buttons in the shared users list
    const xBtns = await dialog.$$('.flex.items-center.justify-between.py-2 button');
    if (xBtns.length > 0) {
      const countBefore = (await dialog.$$('.flex.items-center.justify-between.py-2')).length;
      await xBtns[0].click();
      await page.waitForTimeout(500);
      const countAfter = (await dialog.$$('.flex.items-center.justify-between.py-2')).length;
      results.push('Remove share: ' + (countAfter < countBefore ? 'PASS' : 'FAIL'));
    }

    // Test permission dropdown
    const permSelect = await dialog.$('select');
    if (permSelect) {
      await permSelect.selectOption('edit');
      results.push('Permission dropdown: PASS');
    }

    // Test Done button closes dialog
    const doneBtn = await dialog.$('button:has-text("Done")');
    if (doneBtn) {
      await doneBtn.click();
      await page.waitForTimeout(500);
      const dialogAfter = await page.$('.fixed.inset-0.bg-black\\/40');
      results.push('Done button closes dialog: ' + (!dialogAfter ? 'PASS' : 'FAIL'));
    }
  }

  // ====== FILE MENU ACTIONS ======
  results.push('\n=== FILE MENU ACTIONS ===');

  // File > New should navigate to dashboard
  const fileMenuBtn = await page.$('button:has-text("File")');
  await fileMenuBtn.click();
  await page.waitForTimeout(300);
  const newItem = await page.$('.absolute.left-0.top-full button:has-text("New")');
  if (newItem) {
    await newItem.click();
    await page.waitForTimeout(1000);
    results.push('File > New navigates: ' + (page.url().includes('/editor') ? 'FAIL (still on editor)' : 'PASS'));
  }

  // Go back to editor
  await page.goto('http://127.0.0.1:5555/editor/doc-1');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  // Edit > Select All
  const editMenuBtn = await page.$('button:has-text("Edit")');
  await editMenuBtn.click({ force: true });
  await page.waitForTimeout(300);
  const selectAllItem = await page.$('.absolute.left-0.top-full button:has-text("Select All")');
  if (selectAllItem) {
    await selectAllItem.click();
    await page.waitForTimeout(500);
    const statusText = await page.textContent('.h-8.flex.items-center.border-t');
    results.push('Edit > Select All: ' + (statusText.includes('Selected:') ? 'PASS' : 'FAIL'));
  }

  // Edit > Delete
  await editMenuBtn.click({ force: true });
  await page.waitForTimeout(300);
  const deleteItem = await page.$('.absolute.left-0.top-full button:has-text("Delete")');
  const shapesBeforeDel = await page.$$('[data-shape-id]');
  if (deleteItem && shapesBeforeDel.length > 0) {
    await deleteItem.click();
    await page.waitForTimeout(500);
    const shapesAfterDel = await page.$$('[data-shape-id]');
    results.push('Edit > Delete: ' + (shapesAfterDel.length < shapesBeforeDel.length ? 'PASS' : 'FAIL'));
  }

  // Insert > Page
  const insertMenuBtn = await page.$('button:has-text("Insert")');
  await insertMenuBtn.click({ force: true });
  await page.waitForTimeout(300);
  const pageItem = await page.$('.absolute.left-0.top-full button:has-text("Page")');
  if (pageItem) {
    const tabsBefore = await page.$$('.h-8.flex.items-center.border-t button');
    await pageItem.click();
    await page.waitForTimeout(500);
    const tabsAfter = await page.$$('.h-8.flex.items-center.border-t button');
    results.push('Insert > Page: ' + (tabsAfter.length > tabsBefore.length ? 'PASS' : 'FAIL'));
  }

  // Insert > Rectangle
  await insertMenuBtn.click({ force: true });
  await page.waitForTimeout(300);
  const rectItem = await page.$('.absolute.left-0.top-full button:has-text("Rectangle")');
  const shapesBeforeRect = await page.$$('[data-shape-id]');
  if (rectItem) {
    await rectItem.click();
    await page.waitForTimeout(500);
    const shapesAfterRect = await page.$$('[data-shape-id]');
    results.push('Insert > Rectangle: ' + (shapesAfterRect.length > shapesBeforeRect.length ? 'PASS' : 'FAIL'));
  }

  // Arrange > Lock
  const arrangeBtn = await page.$('button:has-text("Arrange")');
  await arrangeBtn.click({ force: true });
  await page.waitForTimeout(300);
  const lockItem = await page.$('.absolute.left-0.top-full button:has-text("Lock")');
  if (lockItem) {
    await lockItem.click();
    await page.waitForTimeout(300);
    results.push('Arrange > Lock: PASS (clicked)');
  }

  console.log(results.join('\n'));
  await browser.close();
})().catch(e => { console.error('TEST ERROR:', e.message); process.exit(1); });
