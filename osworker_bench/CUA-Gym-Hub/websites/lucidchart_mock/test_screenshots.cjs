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

  // Screenshot: Dashboard
  await page.screenshot({ path: '/cpfs02/data/shared/Group-m6/bowen.wbw/openrlvr-mock/lucidchart_mock/assets/screenshots/mock_dashboard.png', fullPage: true });
  results.push('Dashboard screenshot captured');

  // Screenshot: Dashboard list view
  const listBtns = await page.$$('.flex.items-center.gap-1.border button');
  if (listBtns[1]) {
    await listBtns[1].click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/cpfs02/data/shared/Group-m6/bowen.wbw/openrlvr-mock/lucidchart_mock/assets/screenshots/mock_dashboard_list.png', fullPage: true });
    results.push('Dashboard list view screenshot captured');
  }

  // Navigate to editor doc-1
  await page.goto('http://127.0.0.1:5555/editor/doc-1');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Screenshot: Editor
  await page.screenshot({ path: '/cpfs02/data/shared/Group-m6/bowen.wbw/openrlvr-mock/lucidchart_mock/assets/screenshots/mock_editor.png', fullPage: true });
  results.push('Editor screenshot captured');

  // Open File menu and screenshot
  const fileBtn = await page.$('button:has-text("File")');
  await fileBtn.click({ force: true });
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/cpfs02/data/shared/Group-m6/bowen.wbw/openrlvr-mock/lucidchart_mock/assets/screenshots/mock_file_menu.png', fullPage: true });
  results.push('File menu screenshot captured');
  await page.keyboard.press('Escape');

  // Open comments panel
  const sidebarBtns = await page.$$('.w-10 button');
  for (const btn of sidebarBtns) {
    const text = await btn.textContent();
    if (text.includes('COMMENT')) {
      await btn.click();
      break;
    }
  }
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/cpfs02/data/shared/Group-m6/bowen.wbw/openrlvr-mock/lucidchart_mock/assets/screenshots/mock_comments_panel.png', fullPage: true });
  results.push('Comments panel screenshot captured');

  // Share dialog
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
  await page.screenshot({ path: '/cpfs02/data/shared/Group-m6/bowen.wbw/openrlvr-mock/lucidchart_mock/assets/screenshots/mock_share_dialog.png', fullPage: true });
  results.push('Share dialog screenshot captured');

  // Close share dialog
  const doneBtn = await page.$('.fixed.inset-0 button:has-text("Done")');
  if (doneBtn) await doneBtn.click();
  await page.waitForTimeout(300);

  // Context menu on shape
  const shape1 = await page.$('[data-shape-id="shape-1"]');
  if (shape1) {
    const box = await shape1.boundingBox();
    await page.mouse.click(box.x + box.width/2, box.y + box.height/2, { button: 'right' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/cpfs02/data/shared/Group-m6/bowen.wbw/openrlvr-mock/lucidchart_mock/assets/screenshots/mock_context_menu.png', fullPage: true });
    results.push('Context menu screenshot captured');
    await page.keyboard.press('Escape');
  }

  console.log(results.join('\n'));
  await browser.close();
})().catch(e => { console.error('TEST ERROR:', e.message); process.exit(1); });
