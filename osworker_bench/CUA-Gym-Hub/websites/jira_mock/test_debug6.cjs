const { chromium } = require('/cpfs02/data/shared/Group-m6/bowen.wbw/openrlvr-mock/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // ====== Debug 1: Why does card click not work? ======
  console.log('=== Debug: Board card click ===');
  await page.goto('http://localhost:3458/project/KAN/board', { waitUntil: 'networkidle' });
  
  // Check: does the IssueCard component have onClick wired up?
  const cardElement = await page.$('.bg-white.p-3.rounded.shadow-sm.border.border-gray-200.mb-2');
  if (cardElement) {
    // Check React event handlers
    const hasClickHandler = await cardElement.evaluate(el => {
      // Check if React internal props has onClick
      const reactKey = Object.keys(el).find(k => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance'));
      if (reactKey) {
        try {
          const fiber = el[reactKey];
          // Walk the fiber tree to find onClick
          let current = fiber;
          while (current) {
            if (current.memoizedProps && current.memoizedProps.onClick) {
              return 'has onClick on fiber';
            }
            current = current.return;
          }
        } catch(e) {
          return 'error: ' + e.message;
        }
      }
      return 'no react fiber found';
    });
    console.log('Card React onClick check:', hasClickHandler);
    
    // Try triggering mousedown + mouseup + click manually
    await page.evaluate(() => {
      const card = document.querySelector('.bg-white.p-3.rounded.shadow-sm.border.border-gray-200.mb-2');
      if (card) {
        ['mousedown', 'mouseup', 'click'].forEach(eventType => {
          card.dispatchEvent(new MouseEvent(eventType, { bubbles: true, cancelable: true, view: window }));
        });
      }
    });
    await page.waitForTimeout(500);
    const dialog = await page.$('[role="dialog"]');
    console.log('Dialog after manual events:', !!dialog);
  }
  
  // ====== Debug 2: Create Issue state persistence ======
  console.log('\n=== Debug: Create Issue state - why not persisted? ===');
  await page.goto('http://localhost:3458/', { waitUntil: 'networkidle' });
  
  // Check localStorage keys
  const storageKeys = await page.evaluate(() => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) keys.push(key);
    }
    return keys;
  });
  console.log('localStorage keys:', storageKeys);
  
  // Get current state from localStorage
  const currentStateInLS = await page.evaluate(() => {
    const stateStr = localStorage.getItem('jira_clone_state');
    if (stateStr) {
      const state = JSON.parse(stateStr);
      return state.issues ? state.issues.length : 'no issues';
    }
    return 'no state';
  });
  console.log('Issues in localStorage:', currentStateInLS);
  
  // Open create modal
  await page.click('button:has-text("Create")');
  await page.waitForSelector('text=Create Issue', { timeout: 3000 });
  await page.fill('input[placeholder="Enter a brief summary"]', 'Test Issue for State Check');
  
  // Use page.click on the Create button in footer - try with force
  const footerCreateBtn = await page.locator('button:has-text("Create")').last();
  console.log('Footer Create button text:', await footerCreateBtn.textContent());
  
  try {
    await footerCreateBtn.click({ force: true, timeout: 5000 });
    console.log('Create button force clicked successfully');
  } catch(e) {
    console.log('Force click error:', e.message.substring(0, 100));
    // Try JS click
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const createBtns = btns.filter(b => b.textContent?.trim() === 'Create');
      // Click the LAST one (footer create, not sidebar create)  
      if (createBtns.length >= 2) {
        createBtns[createBtns.length - 1].click();
      } else if (createBtns.length === 1) {
        createBtns[0].click();
      }
    });
  }
  
  await page.waitForTimeout(1000);
  
  // Check localStorage after
  const afterCount = await page.evaluate(() => {
    const stateStr = localStorage.getItem('jira_clone_state');
    if (stateStr) {
      const state = JSON.parse(stateStr);
      return state.issues ? state.issues.length : 'no issues';
    }
    return 'no state';
  });
  console.log('Issues in localStorage after create:', afterCount);
  
  // Check /go API
  const r = await context.request.get('http://localhost:3458/go');
  const j = await r.json();
  console.log('Issues in /go API after create:', j.current_state.issues.length);
  
  // ====== Debug 3: Why does Settings save not persist? ======
  console.log('\n=== Debug: Settings save state ===');
  await page.goto('http://localhost:3458/project/KAN/settings', { waitUntil: 'networkidle' });
  
  const nameInput = await page.$('input[type="text"]:first-of-type');
  if (nameInput) {
    // Check current localStorage state for projects
    const projectsBefore = await page.evaluate(() => {
      const stateStr = localStorage.getItem('jira_clone_state');
      if (stateStr) {
        const state = JSON.parse(stateStr);
        return state.projects ? state.projects.map(p => p.name) : [];
      }
      return [];
    });
    console.log('Projects in localStorage before save:', projectsBefore);
    
    await nameInput.fill('My Updated Project');
    
    // Click Save
    await page.evaluate(() => {
      const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Save');
      if (saveBtn) saveBtn.click();
    });
    await page.waitForTimeout(500);
    
    // Check localStorage after save
    const projectsAfter = await page.evaluate(() => {
      const stateStr = localStorage.getItem('jira_clone_state');
      if (stateStr) {
        const state = JSON.parse(stateStr);
        return state.projects ? state.projects.map(p => p.name) : [];
      }
      return [];
    });
    console.log('Projects in localStorage after save:', projectsAfter);
    
    // Check /go API
    const r = await context.request.get('http://localhost:3458/go');
    const j = await r.json();
    console.log('Projects in /go API after save:', j.current_state.projects.map(p => p.name));
  }
  
  await browser.close();
})().catch(e => { console.error('Error:', e.message.substring(0, 300)); process.exit(1); });
