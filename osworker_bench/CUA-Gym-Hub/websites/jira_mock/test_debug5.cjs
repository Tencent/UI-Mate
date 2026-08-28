const { chromium } = require('/cpfs02/data/shared/Group-m6/bowen.wbw/openrlvr-mock/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // ====== Test 1: Card click (using dispatchEvent) ======
  console.log('=== Test: Card click opens IssueModal ===');
  await page.goto('http://localhost:3458/project/KAN/board', { waitUntil: 'networkidle' });
  
  // Try clicking via evaluate (bypass DnD)
  const cardClicked = await page.evaluate(() => {
    const cards = document.querySelectorAll('.bg-white.p-3.rounded.shadow-sm.border.border-gray-200.mb-2');
    if (cards.length > 0) {
      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      cards[0].dispatchEvent(event);
      return true;
    }
    return false;
  });
  console.log('Card click dispatched:', cardClicked);
  await page.waitForTimeout(1000);
  const dialog1 = await page.$('[role="dialog"]');
  console.log('Dialog appeared:', !!dialog1);
  
  // Try just using the p tag text click instead
  await page.goto('http://localhost:3458/project/KAN/board', { waitUntil: 'networkidle' });
  const firstCard = await page.$('.bg-white.p-3.rounded.shadow-sm.border.border-gray-200.mb-2');
  if (firstCard) {
    // Get parent container for click
    const box = await firstCard.boundingBox();
    // Try force click
    await firstCard.click({ force: true });
    await page.waitForTimeout(1000);
    const dialog2 = await page.$('[role="dialog"]');
    console.log('Dialog after force click:', !!dialog2);
    if (dialog2) {
      await page.keyboard.press('Escape');
    }
  }
  
  // ====== Test 2: Create Issue form ======
  console.log('\n=== Test: Create Issue form ===');
  await page.goto('http://localhost:3458/', { waitUntil: 'networkidle' });
  
  const issuesBefore = await (async () => {
    const r = await context.request.get('http://localhost:3458/go');
    const j = await r.json();
    return j.current_state.issues.length;
  })();
  
  await page.click('button:has-text("Create")');
  await page.waitForSelector('text=Create Issue', { timeout: 3000 });
  
  const summaryInput = await page.$('input[placeholder="Enter a brief summary"]');
  if (summaryInput) {
    await summaryInput.fill('Test Issue from Audit');
    await page.waitForTimeout(300);
    
    // Click Create button (not Cancel) - use force click  
    // Find the specific Create button in footer (the one with bg-jira-blue)
    const createBtnResult = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const createBtns = btns.filter(b => b.textContent?.trim() === 'Create' && b.className.includes('bg-jira-blue'));
      if (createBtns.length > 0) {
        createBtns[0].click();
        return 'clicked';
      }
      return 'not found: ' + btns.map(b => b.textContent?.trim() + ':' + b.className.substring(0,20)).join(', ').substring(0, 200);
    });
    console.log('Create button JS click result:', createBtnResult);
    await page.waitForTimeout(500);
    
    const r = await context.request.get('http://localhost:3458/go');
    const j = await r.json();
    const countAfter = j.current_state.issues.length;
    console.log('Issue count before:', issuesBefore, 'after:', countAfter);
  }
  
  // ====== Test 3: Settings save ======
  console.log('\n=== Test: Settings save ===');
  await page.goto('http://localhost:3458/project/KAN/settings', { waitUntil: 'networkidle' });
  
  // Get the current project name input
  const nameInput = await page.$('input[type="text"]:first-of-type');
  if (nameInput) {
    const currentVal = await nameInput.inputValue();
    console.log('Current name input value:', JSON.stringify(currentVal));
    
    await nameInput.fill('Kanban Project Test Save');
    await page.waitForTimeout(100);
    
    // Click Save button using evaluate
    const saveResult = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const saveBtn = btns.find(b => b.textContent?.trim() === 'Save');
      if (saveBtn) {
        saveBtn.click();
        return 'clicked';
      }
      return 'not found';
    });
    console.log('Save button JS click result:', saveResult);
    await page.waitForTimeout(500);
    
    const r = await context.request.get('http://localhost:3458/go');
    const j = await r.json();
    const proj = j.current_state.projects.find(p => p.id === 'p1');
    console.log('Project name in state after save:', proj ? proj.name : 'not found');
  }
  
  // ====== Test 4: Backlog inline edit ======
  console.log('\n=== Test: Backlog inline edit ===');
  await page.goto('http://localhost:3458/project/KAN/backlog', { waitUntil: 'networkidle' });
  
  // Find all text elements that could be issue summaries
  const issueTexts = await page.$$('span:has-text("Set up CI/CD"), p:has-text("Set up CI/CD")');
  console.log('Found issue text elements:', issueTexts.length);
  
  for (const elem of issueTexts) {
    const tag = await elem.evaluate(el => el.tagName);
    const cls = await elem.getAttribute('class');
    console.log('  tag:', tag, 'class:', cls ? cls.substring(0, 50) : '(none)');
    break;
  }
  
  // Try double click on summary text
  if (issueTexts.length > 0) {
    await issueTexts[0].dblclick({ force: true });
    await page.waitForTimeout(500);
    const focusedInput = await page.$('input:focus');
    console.log('Input focused after double-click:', !!focusedInput);
    if (focusedInput) {
      const val = await focusedInput.inputValue();
      console.log('Input value:', JSON.stringify(val.substring(0, 50)));
      await page.keyboard.press('Escape');
    }
  }
  
  // ====== Test 5: Dashboard issue click ======
  console.log('\n=== Test: Dashboard assigned-to-me issue click ===');
  await page.goto('http://localhost:3458/', { waitUntil: 'networkidle' });
  
  // Look for the assigned-to-me section
  const assignedSection = await page.$('text=Assigned to Me');
  console.log('Found Assigned to Me section:', !!assignedSection);
  
  // Find issue rows in the table
  const rows = await page.$$('tbody tr');
  console.log('Table rows (assigned to me):', rows.length);
  
  if (rows.length > 0) {
    const rowText = await rows[0].textContent();
    console.log('First row text:', rowText ? rowText.substring(0, 80) : '(empty)');
    await rows[0].click({ force: true });
    await page.waitForTimeout(500);
    const dialog = await page.$('[role="dialog"]');
    console.log('Dialog after clicking row:', !!dialog);
  }
  
  await browser.close();
})().catch(e => { console.error('Error:', e.message.substring(0, 200)); process.exit(1); });
