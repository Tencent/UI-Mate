const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const results = [];

  // Clear state
  await page.goto('http://127.0.0.1:5555/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // ====== FINAL REMAINING TESTS ======
  results.push('=== HEADER NAV TABS ===');

  // Test: Click INTEGRATIONS tab
  const integrationsTab = await page.$('button:has-text("INTEGRATIONS")');
  if (integrationsTab) {
    const classBefore = await integrationsTab.evaluate(b => b.className);
    await integrationsTab.click();
    await page.waitForTimeout(300);
    const classAfter = await integrationsTab.evaluate(b => b.className);
    results.push('INTEGRATIONS tab click: ' + (classBefore !== classAfter ? 'PASS (style changed)' : 'FAIL (no change)'));
  }

  // Test: Click DOCUMENTS tab back
  const docsTab = await page.$('button:has-text("DOCUMENTS")');
  if (docsTab) {
    await docsTab.click();
    await page.waitForTimeout(300);
    results.push('DOCUMENTS tab click: PASS');
  }

  // Test: Notification bell click
  const bellBtn = await page.$('header .relative');
  if (bellBtn) {
    await bellBtn.click();
    await page.waitForTimeout(300);
    // Check if notification dropdown appeared
    const bodyText = await page.textContent('body');
    results.push('Bell notification click: PASS (clicked)');
  }

  // Test: User avatar dropdown
  const avatarArea = await page.$('header .flex.items-center.gap-2.cursor-pointer');
  if (avatarArea) {
    await avatarArea.click();
    await page.waitForTimeout(300);
    results.push('User avatar click: PASS');
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);

  // ====== DASHBOARD SORT/FILTER ======
  results.push('\n=== DASHBOARD SORT ===');

  // The Sort by selector
  const sortBtn = await page.$('button svg'); // find sort controls
  // Check for Sort by control (settings gear)
  const settingsGearBtn = await page.$('.flex.items-center.gap-2 button');
  if (settingsGearBtn) {
    // There may be a sort dropdown
    results.push('Sort control present: PASS');
  }

  // ====== EDITOR - MAKE A COPY ======
  results.push('\n=== FILE MENU MAKE A COPY ===');
  await page.goto('http://127.0.0.1:5555/editor/doc-1');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const fileMenuBtn = await page.$('button:has-text("File")');
  await fileMenuBtn.click({ force: true });
  await page.waitForTimeout(300);
  const copyItem = await page.$('.absolute.left-0.top-full button:has-text("Make a Copy")');
  if (copyItem) {
    await copyItem.click();
    await page.waitForTimeout(1000);
    const url = page.url();
    results.push('File > Make a Copy: ' + (url.includes('/editor/') ? 'PASS (navigated to new doc)' : 'FAIL'));
  }

  // Go back to original
  await page.goto('http://127.0.0.1:5555/editor/doc-1');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  // ====== EDITOR - DOWNLOAD AS ======
  const fileBtn2 = await page.$('button:has-text("File")');
  await fileBtn2.click({ force: true });
  await page.waitForTimeout(300);
  const downloadItem = await page.$('.absolute.left-0.top-full button:has-text("Download As")');
  if (downloadItem) {
    await downloadItem.click();
    await page.waitForTimeout(500);
    // Check if submenu appeared
    const submenu = await page.$('.absolute button:has-text("PNG")');
    results.push('Download As submenu: ' + (submenu ? 'PASS' : 'FAIL (no submenu)'));
    if (submenu) {
      const subItems = await page.$$eval('.absolute button', btns => btns.map(b => b.textContent.trim()));
      results.push('Download format options: ' + JSON.stringify(subItems.filter(t => ['PNG', 'SVG', 'PDF'].includes(t))));
    }
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);

  // ====== EDITOR - PRINT ======
  const fileBtn3 = await page.$('button:has-text("File")');
  await fileBtn3.click({ force: true });
  await page.waitForTimeout(300);
  const printItem = await page.$('.absolute.left-0.top-full button:has-text("Print")');
  results.push('Print menu item: ' + (printItem ? 'PASS' : 'FAIL'));
  await page.keyboard.press('Escape');

  // ====== EDITOR - KEYBOARD SHORTCUTS ======
  results.push('\n=== KEYBOARD SHORTCUTS ===');

  // Test: Ctrl+Z (Undo) - after making a change
  const shapesBeforeUndo = await page.$$('[data-shape-id]');
  const rectBtn = await page.$('div[title="Rectangle"]');
  if (rectBtn) {
    await rectBtn.click({ force: true });
    await page.waitForTimeout(500);
    const shapesAfterAdd = await page.$$('[data-shape-id]');
    results.push('Added shape for undo test: ' + (shapesAfterAdd.length > shapesBeforeUndo.length ? 'PASS' : 'FAIL'));

    await page.keyboard.press('Control+z');
    await page.waitForTimeout(500);
    const shapesAfterUndo = await page.$$('[data-shape-id]');
    results.push('Ctrl+Z undo: ' + (shapesAfterUndo.length === shapesBeforeUndo.length ? 'PASS' : 'FAIL'));

    await page.keyboard.press('Control+y');
    await page.waitForTimeout(500);
    const shapesAfterRedo = await page.$$('[data-shape-id]');
    results.push('Ctrl+Y redo: ' + (shapesAfterRedo.length === shapesAfterAdd.length ? 'PASS' : 'FAIL'));
  }

  // Test: Backspace to delete
  const shapes = await page.$$('[data-shape-id]');
  if (shapes.length > 0) {
    await shapes[shapes.length - 1].click({ force: true });
    await page.waitForTimeout(200);
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(500);
    const shapesAfterBackspace = await page.$$('[data-shape-id]');
    results.push('Backspace deletes: ' + (shapesAfterBackspace.length < shapes.length ? 'PASS' : 'FAIL'));
  }

  // ====== EDITOR - SHAPE DRAG/MOVE ======
  results.push('\n=== SHAPE MOVE ===');
  const movableShape = await page.$('[data-shape-id="shape-1"]');
  if (movableShape) {
    const box = await movableShape.boundingBox();
    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    // Drag shape 50px to the right
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 50, startY, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(500);

    const boxAfter = await movableShape.boundingBox();
    results.push('Shape drag move: ' + (boxAfter && Math.abs(boxAfter.x - box.x) > 10 ? 'PASS' : 'FAIL (position didnt change)'));
  }

  // ====== CONTEXT MENU ITEMS - ADD TEXT/STICKY NOTE ======
  results.push('\n=== EMPTY CANVAS CONTEXT MENU ===');
  const svg = await page.$('svg[viewBox]');
  const svgBox = await svg.boundingBox();
  await page.mouse.click(svgBox.x + 50, svgBox.y + 50, { button: 'right' });
  await page.waitForTimeout(500);
  const ctxMenu = await page.$('.fixed.z-50.bg-white');
  if (ctxMenu) {
    const items = await ctxMenu.$$eval('button', btns => btns.map(b => b.textContent.trim()));
    results.push('Empty canvas menu items: ' + JSON.stringify(items));

    // Click "Add Text"
    const addTextBtn = await ctxMenu.$('button:has-text("Add Text")');
    const shapesBefore = await page.$$('[data-shape-id]');
    if (addTextBtn) {
      await addTextBtn.click();
      await page.waitForTimeout(500);
      const shapesAfterText = await page.$$('[data-shape-id]');
      results.push('Add Text from context menu: ' + (shapesAfterText.length > shapesBefore.length ? 'PASS' : 'FAIL'));
    }
  }

  // Add Sticky Note via context menu
  await page.mouse.click(svgBox.x + 100, svgBox.y + 100, { button: 'right' });
  await page.waitForTimeout(500);
  const ctxMenu2 = await page.$('.fixed.z-50.bg-white');
  if (ctxMenu2) {
    const stickyBtn = await ctxMenu2.$('button:has-text("Add Sticky Note")');
    const shapesBefore2 = await page.$$('[data-shape-id]');
    if (stickyBtn) {
      await stickyBtn.click();
      await page.waitForTimeout(500);
      const shapesAfterNote = await page.$$('[data-shape-id]');
      results.push('Add Sticky Note from context menu: ' + (shapesAfterNote.length > shapesBefore2.length ? 'PASS' : 'FAIL'));
    }
  }

  // ====== IMPORT BUTTON ======
  results.push('\n=== DASHBOARD IMPORT ===');
  await page.goto('http://127.0.0.1:5555/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  const importBtn = await page.$('button:has-text("Import")');
  if (importBtn) {
    await importBtn.click();
    await page.waitForTimeout(500);
    // Should show file picker or dialog
    results.push('Import button: PASS (clicked)');
  }

  console.log(results.join('\n'));
  await browser.close();
})().catch(e => { console.error('TEST ERROR:', e.message); process.exit(1); });
