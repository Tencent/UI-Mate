const { chromium } = require('/cpfs02/data/shared/Group-m6/bowen.wbw/openrlvr-mock/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  await page.goto('http://localhost:3458/project/KAN/board', { waitUntil: 'networkidle' });
  
  console.log('=== Checking board issue cards ===');
  
  // Look for the specific structure from IssueCard.tsx - bg-white p-3 rounded shadow-sm border
  const cards = await page.$$('.bg-white.p-3.rounded.shadow-sm');
  console.log('Cards with class bg-white p-3 rounded shadow-sm:', cards.length);

  // Try finding cards more broadly
  const whiteCards = await page.$$('.cursor-pointer.group');
  console.log('cursor-pointer.group elements:', whiteCards.length);

  // Check if the board has no active sprint or is empty
  const noSprintMsg = await page.$('text=No Active Sprint');
  console.log('No Active Sprint message:', !!noSprintMsg);

  // Print all div class combinations on the board
  const divs = await page.$$('[class*="mb-2"]');
  console.log('Elements with mb-2:', divs.length);
  for (const div of divs.slice(0, 5)) {
    const cls = await div.getAttribute('class');
    const text = await div.textContent();
    console.log('  class:', cls ? cls.substring(0, 80) : '(none)', 'text:', text ? text.substring(0, 40) : '(empty)');
  }

  // Check actual rendered content for issue summaries
  const kanTexts = await page.$$('text=KAN-');
  console.log('\nElements with KAN- text:', kanTexts.length);
  for (const t of kanTexts.slice(0, 5)) {
    const text = await t.textContent();
    const tag = await t.evaluate(el => el.tagName);
    console.log('  tag:', tag, 'text:', text ? text.substring(0, 50) : '(empty)');
  }

  // Try clicking on the issue summary text
  await page.click('text=Set up CI/CD');
  await page.waitForTimeout(1000);
  const dialog = await page.$('[role="dialog"]');
  console.log('\nDialog after clicking issue text:', !!dialog);
  if (dialog) {
    const text = await dialog.textContent();
    console.log('  Dialog content:', text ? text.substring(0, 100) : '(empty)');
  }
  
  await page.screenshot({ path: '/tmp/jira_board_debug2.png', fullPage: false });
  await browser.close();
})().catch(e => { console.error('Error:', e.message); process.exit(1); });
