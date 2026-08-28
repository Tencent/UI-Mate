const { chromium } = require('/cpfs02/data/shared/Group-m6/bowen.wbw/openrlvr-mock/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // Debug: What's on the board?
  await page.goto('http://localhost:3458/project/KAN/board', { waitUntil: 'networkidle' });
  
  // Get ALL elements with specific classes
  const allDraggable = await page.$$('[draggable]');
  console.log('All [draggable] elements:', allDraggable.length);
  
  // Check board structure
  const boardContent = await page.content();
  
  // Look for issue cards more specifically
  const kanCards = await page.$$('[data-rbd-draggable-id]');
  console.log('Cards with data-rbd-draggable-id:', kanCards.length);
  
  // Find all cursor-pointer divs
  const cursorPointers = await page.$$('.cursor-pointer');
  console.log('cursor-pointer elements:', cursorPointers.length);
  
  // Get text content of first cursor-pointer
  if (cursorPointers.length > 0) {
    const text = await cursorPointers[0].textContent();
    console.log('First cursor-pointer text:', text ? text.substring(0, 100) : '(empty)');
  }
  
  // Check for specific text from our data
  const cicdText = await page.$('text=Set up CI/CD');
  console.log('Found CI/CD text:', !!cicdText);
  
  const loginBugText = await page.$('text=Fix login page');
  console.log('Found login bug text:', !!loginBugText);
  
  // Screenshot for debugging
  await page.screenshot({ path: '/tmp/jira_board_debug.png', fullPage: true });
  
  // Get all button texts on the board
  const btns = await page.$$('button');
  console.log('\nAll buttons on board:');
  for (const btn of btns.slice(0, 20)) {
    const text = await btn.textContent();
    const cls = await btn.getAttribute('class');
    console.log('  btn:', text ? text.trim().substring(0, 50) : '(empty)', '| class:', cls ? cls.substring(0, 50) : '(none)');
  }
  
  // Check p tags for issue summaries
  const pTags = await page.$$('p');
  console.log('\nFirst 10 p tags:');
  for (const p of pTags.slice(0, 10)) {
    const text = await p.textContent();
    console.log('  p:', text ? text.trim().substring(0, 80) : '(empty)');
  }
  
  await browser.close();
})().catch(e => { console.error('Error:', e.message); process.exit(1); });
