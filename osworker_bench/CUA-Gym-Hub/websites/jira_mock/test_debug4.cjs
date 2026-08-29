const { chromium } = require('/cpfs02/data/shared/Group-m6/bowen.wbw/openrlvr-mock/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // --- Test issue card click ---
  console.log('=== Testing issue card click ===');
  await page.goto('http://localhost:3458/project/KAN/board', { waitUntil: 'networkidle' });
  
  // Get precise position of first card
  const firstCard = await page.$('.bg-white.p-3.rounded.shadow-sm.border.border-gray-200.mb-2');
  if (firstCard) {
    const box = await firstCard.boundingBox();
    console.log('Card bounding box:', box);
    // Click at center
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(1000);
    const dialog = await page.$('[role="dialog"]');
    console.log('Dialog appeared after mouse click:', !!dialog);
    if (dialog) {
      const text = await dialog.textContent();
      console.log('Dialog text:', text ? text.substring(0, 100) : '(empty)');
    }
    await page.keyboard.press('Escape');
  }
  
  // --- Test Create Issue form ---
  console.log('\n=== Testing Create Issue form ===');
  await page.goto('http://localhost:3458/', { waitUntil: 'networkidle' });
  await page.click('button:has-text("Create")');
  await page.waitForSelector('text=Create Issue', { timeout: 3000 });
  
  // Find all buttons in the modal
  const allBtns = await page.$$('button');
  console.log('\nAll buttons in Create modal:');
  for (const btn of allBtns) {
    const text = await btn.textContent();
    const type = await btn.getAttribute('type');
    const disabled = await btn.isDisabled();
    const cls = await btn.getAttribute('class');
    if (text && text.trim()) {
      console.log('  btn:', JSON.stringify(text.trim().substring(0, 40)), 'type:', type || '(none)', 'disabled:', disabled, 'class:', cls ? cls.substring(0, 30) : '');
    }
  }
  
  // Try filling summary and find Create button
  const summaryInput = await page.$('input[placeholder="Enter a brief summary"]');
  if (summaryInput) {
    console.log('\nFound summary input, filling...');
    await summaryInput.fill('Test issue');
    await page.waitForTimeout(200);
    
    // Find Create button (not Cancel)
    const createBtns = await page.$$('button:has-text("Create")');
    for (const btn of createBtns) {
      const cls = await btn.getAttribute('class');
      const disabled = await btn.isDisabled();
      console.log('Create button class:', cls ? cls.substring(0, 60) : '(none)', 'disabled:', disabled);
    }
    
    // Try clicking the footer Create button (the one with bg-jira-blue)
    for (const btn of createBtns) {
      const cls = await btn.getAttribute('class');
      if (cls && cls.includes('bg-jira-blue')) {
        console.log('Clicking the footer Create button...');
        await btn.click();
        await page.waitForTimeout(500);
        const modalGone = !(await page.$('text=Create Issue'));
        console.log('Modal closed:', modalGone);
        break;
      }
    }
  }
  
  // --- Test Settings form ---
  console.log('\n=== Testing Settings form ===');
  await page.goto('http://localhost:3458/project/KAN/settings', { waitUntil: 'networkidle' });
  
  const content = await page.content();
  
  // Find all inputs on settings
  const inputs = await page.$$('input');
  console.log('Inputs in settings:');
  for (const inp of inputs) {
    const value = await inp.inputValue();
    const name = await inp.getAttribute('name');
    const id = await inp.getAttribute('id');
    const placeholder = await inp.getAttribute('placeholder');
    console.log('  name:', name, 'id:', id, 'placeholder:', placeholder, 'value:', JSON.stringify(value.substring(0, 30)));
  }
  
  // Check Save button
  const saveBtns = await page.$$('button:has-text("Save")');
  console.log('Save buttons found:', saveBtns.length);
  for (const btn of saveBtns) {
    const cls = await btn.getAttribute('class');
    const disabled = await btn.isDisabled();
    const type = await btn.getAttribute('type');
    console.log('  Save btn type:', type, 'disabled:', disabled, 'class:', cls ? cls.substring(0, 60) : '');
  }
  
  await browser.close();
})().catch(e => { console.error('Error:', e.message); process.exit(1); });
