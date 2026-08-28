const { chromium } = require('/cpfs02/data/shared/Group-m6/bowen.wbw/openrlvr-mock/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  await page.goto('http://localhost:3458/project/KAN/board', { waitUntil: 'networkidle' });
  
  // Click on the first issue card (the mb-2 div with bg-white p-3)
  const cards = await page.$$('.bg-white.p-3.rounded.shadow-sm.border.border-gray-200.mb-2');
  console.log('Found cards:', cards.length);
  
  if (cards.length > 0) {
    console.log('Clicking first card...');
    await cards[0].click();
    await page.waitForTimeout(1000);
    
    const dialog = await page.$('[role="dialog"]');
    console.log('Dialog appeared:', !!dialog);
    
    if (dialog) {
      const text = await dialog.textContent();
      console.log('Dialog content (100):', text ? text.substring(0, 100) : '(empty)');
      
      // Check for selects in dialog
      const selects = await page.$$('[role="dialog"] select');
      console.log('Selects in dialog:', selects.length);
      for (const sel of selects) {
        const name = await sel.getAttribute('name');
        const options = await sel.$$('option');
        console.log('  Select name:', name, 'options:', options.length);
      }
      
      // Check for textarea
      const textareas = await page.$$('[role="dialog"] textarea');
      console.log('Textareas in dialog:', textareas.length);
      
      // Check for labels section
      const labelText = await page.$('[role="dialog"] :has-text("Labels")');
      console.log('Labels section:', !!labelText);
      
      // Check for reporter section
      const reporterText = await page.$('[role="dialog"] :has-text("Reporter")');
      console.log('Reporter section:', !!reporterText);
      
      // Check for links section
      const linksSection = await page.$('[role="dialog"] :has-text("Issue Links")');
      console.log('Issue Links section:', !!linksSection);
      
      // Check for delete button
      const allBtns = await page.$$('[role="dialog"] button');
      console.log('Buttons in dialog:', allBtns.length);
      for (const btn of allBtns) {
        const html = await btn.innerHTML();
        const text = await btn.textContent();
        if (text && text.trim()) console.log('  btn text:', text.trim().substring(0, 40));
        else if (html.includes('Trash') || html.includes('trash') || html.includes('Delete')) console.log('  btn: [trash/delete icon]');
      }
      
      await page.screenshot({ path: '/tmp/jira_modal_debug.png', fullPage: false });
    }
    
    await page.keyboard.press('Escape');
  }

  // --- Test Create Issue form submit button ---
  console.log('\n=== Testing Create Issue form ===');
  await page.goto('http://localhost:3458/', { waitUntil: 'networkidle' });
  await page.click('button:has-text("Create")');
  await page.waitForSelector('text=Create Issue', { timeout: 3000 });
  
  const formContent = await page.$('form, [class*="modal"]');
  const formText = await formContent.textContent();
  console.log('Form content:', formText ? formText.substring(0, 200) : '(empty)');
  
  const allBtns = await page.$$('button');
  console.log('Buttons in create modal:');
  for (const btn of allBtns) {
    const text = await btn.textContent();
    const type = await btn.getAttribute('type');
    const disabled = await btn.isDisabled();
    if (text && text.trim() && text.trim() !== '') {
      console.log('  btn:', text.trim().substring(0, 40), 'type:', type, 'disabled:', disabled);
    }
  }
  
  // Try filling summary then submitting
  const summaryInput = await page.$('input[placeholder*="ummary" i]');
  if (summaryInput) {
    await summaryInput.fill('Test Issue');
    await page.waitForTimeout(300);
    const submitBtns = await page.$$('button');
    for (const btn of submitBtns) {
      const text = await btn.textContent();
      const type = await btn.getAttribute('type');
      if (type === 'submit' || (text && text.trim().toLowerCase() === 'create')) {
        const disabled = await btn.isDisabled();
        console.log('Submit btn:', text ? text.trim() : '(empty)', 'type:', type, 'disabled:', disabled);
      }
    }
  }
  
  await page.keyboard.press('Escape');
  
  // --- Test Settings form ---
  console.log('\n=== Testing Settings form ===');
  await page.goto('http://localhost:3458/project/KAN/settings', { waitUntil: 'networkidle' });
  
  const settingsInputs = await page.$$('input');
  for (const inp of settingsInputs) {
    const value = await inp.getAttribute('value');
    const placeholder = await inp.getAttribute('placeholder');
    const name = await inp.getAttribute('name');
    console.log('  input name:', name, 'value:', value, 'placeholder:', placeholder);
  }
  
  const saveBtn = await page.$('button:has-text("Save")');
  if (saveBtn) {
    const cls = await saveBtn.getAttribute('class');
    console.log('Save button class:', cls);
  }
  
  await browser.close();
})().catch(e => { console.error('Error:', e.message); process.exit(1); });
