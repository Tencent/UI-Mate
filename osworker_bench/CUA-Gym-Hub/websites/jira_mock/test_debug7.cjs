const { chromium } = require('/cpfs02/data/shared/Group-m6/bowen.wbw/openrlvr-mock/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // Test 1: What does visiting /go show?
  console.log('=== /go endpoint behavior ===');
  await page.goto('http://localhost:3458/go', { waitUntil: 'networkidle' });
  const content = await page.textContent('body');
  console.log('Content type (JSON or React):', content ? (content.includes('initial_state') ? 'JSON with initial_state' : content.substring(0, 100)) : '(empty)');
  
  // Check if it's a React app or raw JSON
  const isReactApp = await page.$('div#root');
  console.log('Is React app (has #root):', !!isReactApp);
  
  // Check what the /go page actually renders
  const preTag = await page.$('pre');
  if (preTag) {
    const preText = await preTag.textContent();
    try {
      const data = JSON.parse(preText);
      console.log('React StateInspector shows:');
      console.log('  initial_state issues count:', data.initial_state.issues.length);
      console.log('  current_state issues count:', data.current_state.issues.length);
    } catch(e) {
      console.log('Pre content (not JSON):', preText.substring(0, 100));
    }
  }
  
  // Test 2: After changing state in app, does /go reflect it?
  console.log('\n=== Test state sync ===');
  await page.goto('http://localhost:3458/', { waitUntil: 'networkidle' });
  
  // Get initial count
  await page.goto('http://localhost:3458/go', { waitUntil: 'networkidle' });
  const pre1 = await page.$('pre');
  const data1 = JSON.parse(await pre1.textContent());
  console.log('Issues count in /go before create:', data1.current_state.issues.length);
  
  // Create an issue via JS
  await page.goto('http://localhost:3458/', { waitUntil: 'networkidle' });
  await page.click('button:has-text("Create")');
  await page.waitForSelector('text=Create Issue', { timeout: 3000 });
  await page.fill('input[placeholder="Enter a brief summary"]', 'Test Issue State Sync');
  await page.locator('button.bg-jira-blue').last().click({ force: true });
  await page.waitForTimeout(500);
  
  // Navigate to /go and check
  await page.goto('http://localhost:3458/go', { waitUntil: 'networkidle' });
  const pre2 = await page.$('pre');
  const data2 = JSON.parse(await pre2.textContent());
  console.log('Issues count in /go after create:', data2.current_state.issues.length);
  console.log('State diff keys:', Object.keys(data2.state_diff));
  if (data2.state_diff.issues) {
    console.log('Issues diff present:', true);
  }
  
  // Test 3: Board card click in a different way
  console.log('\n=== Test: Board card interaction ===');
  await page.goto('http://localhost:3458/project/KAN/board', { waitUntil: 'networkidle' });
  
  // Check for DnD draggable props
  const dndInfo = await page.evaluate(() => {
    const cards = document.querySelectorAll('[data-rbd-drag-handle-draggable-id]');
    return { 
      hasDragHandleAttr: cards.length,
      hasDraggable: document.querySelectorAll('[draggable="true"]').length
    };
  });
  console.log('DnD elements:', dndInfo);
  
  // Try using Playwright's locator with force click
  const card = page.locator('.cursor-pointer.group').first();
  await card.click({ force: true });
  await page.waitForTimeout(500);
  const dialog = await page.$('[role="dialog"]');
  console.log('Dialog after locator force click:', !!dialog);
  
  // Test 4: Backlog card click
  console.log('\n=== Test: Backlog issue click ===');
  await page.goto('http://localhost:3458/project/KAN/backlog', { waitUntil: 'networkidle' });
  
  // Find issue rows in backlog
  const issueRows = await page.$$('.cursor-pointer');
  console.log('cursor-pointer elements in backlog:', issueRows.length);
  if (issueRows.length > 0) {
    const text = await issueRows[0].textContent();
    console.log('First cursor-pointer text:', text ? text.substring(0, 50) : '(empty)');
    await issueRows[0].click({ force: true });
    await page.waitForTimeout(500);
    const dialog = await page.$('[role="dialog"]');
    console.log('Dialog after backlog card click:', !!dialog);
  }
  
  await browser.close();
})().catch(e => { console.error('Error:', e.message.substring(0, 200)); process.exit(1); });
