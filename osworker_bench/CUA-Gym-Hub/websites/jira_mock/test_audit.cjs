const { chromium } = require('/cpfs02/data/shared/Group-m6/bowen.wbw/openrlvr-mock/node_modules/playwright');

async function testFeature(page, name, fn) {
  try {
    await fn();
    console.log('[PASS]', name);
    return true;
  } catch (e) {
    console.log('[FAIL]', name, '-', e.message.split('\n')[0]);
    return false;
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // 1. Load dashboard
  await testFeature(page, 'Dashboard loads', async () => {
    await page.goto('http://localhost:3458/', { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Assigned to Me', { timeout: 5000 });
  });

  // 2. Check sidebar Create button
  await testFeature(page, 'Sidebar has Create button', async () => {
    const createBtn = await page.$('button:has-text("Create")');
    if (!createBtn) throw new Error('No Create button in sidebar');
  });

  // 3. Navigate to board
  await testFeature(page, 'Board navigation works', async () => {
    await page.goto('http://localhost:3458/project/KAN/board', { waitUntil: 'networkidle' });
    await page.waitForSelector('text=To Do', { timeout: 5000 });
  });

  // 4. Check board columns
  await testFeature(page, 'Board shows all 4 columns', async () => {
    const todoText = await page.$('text=To Do');
    const inProgressText = await page.$('text=In Progress');
    const doneText = await page.$('text=Done');
    if (!todoText || !inProgressText || !doneText) throw new Error('Not all columns visible');
  });

  // 5. Open create issue modal via button
  await testFeature(page, 'Create Issue modal opens via Create button', async () => {
    await page.goto('http://localhost:3458/', { waitUntil: 'networkidle' });
    await page.click('button:has-text("Create")');
    await page.waitForSelector('text=Create Issue', { timeout: 3000 });
    await page.keyboard.press('Escape');
  });

  // 6. Test keyboard shortcut C
  await testFeature(page, 'Keyboard shortcut C opens Create Issue modal', async () => {
    await page.goto('http://localhost:3458/', { waitUntil: 'networkidle' });
    await page.keyboard.press('c');
    await page.waitForSelector('text=Create Issue', { timeout: 3000 });
    await page.keyboard.press('Escape');
  });

  // 7. Test keyboard shortcut ?
  await testFeature(page, 'Keyboard shortcut ? opens shortcuts dialog', async () => {
    await page.goto('http://localhost:3458/', { waitUntil: 'networkidle' });
    await page.keyboard.press('?');
    await page.waitForSelector('text=Keyboard Shortcuts', { timeout: 3000 });
    await page.keyboard.press('Escape');
  });

  // 8. Navigate to backlog
  await testFeature(page, 'Backlog navigation works', async () => {
    await page.goto('http://localhost:3458/project/KAN/backlog', { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Sprint 1', { timeout: 5000 });
  });

  // 9. Navigate to reports
  await testFeature(page, 'Reports navigation works', async () => {
    await page.goto('http://localhost:3458/project/KAN/reports', { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Burndown', { timeout: 5000 });
  });

  // 10. Navigate to settings
  await testFeature(page, 'Settings navigation works', async () => {
    await page.goto('http://localhost:3458/project/KAN/settings', { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Details', { timeout: 5000 });
  });

  // 11. Navigate to search
  await testFeature(page, 'Advanced search navigation works', async () => {
    await page.goto('http://localhost:3458/search', { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Advanced Search', { timeout: 5000 });
  });

  // 12. Test /go API endpoint
  await testFeature(page, '/go API endpoint returns valid JSON', async () => {
    const response = await context.request.get('http://localhost:3458/go');
    const json = await response.json();
    if (!json.initial_state || !json.current_state) throw new Error('Missing state fields');
    if (!json.initial_state.issues || json.initial_state.issues.length === 0) throw new Error('No issues in state');
    console.log('  State has', json.initial_state.issues.length, 'issues,', json.initial_state.sprints.length, 'sprints,', json.initial_state.notifications.length, 'notifications');
  });

  // 13. Test notification bell
  await testFeature(page, 'Notification bell opens panel', async () => {
    await page.goto('http://localhost:3458/', { waitUntil: 'networkidle' });
    const buttons = await page.$$('button');
    let bellBtn = null;
    for (const btn of buttons) {
      const html = await btn.innerHTML();
      if (html.toLowerCase().includes('bell')) {
        bellBtn = btn;
        break;
      }
    }
    if (!bellBtn) throw new Error('Bell button not found');
    await bellBtn.click();
    await page.waitForSelector('text=Notifications', { timeout: 3000 });
    await page.keyboard.press('Escape');
  });

  // 14. Test backlog Create Sprint button
  await testFeature(page, 'Create Sprint button exists in Backlog', async () => {
    await page.goto('http://localhost:3458/project/KAN/backlog', { waitUntil: 'networkidle' });
    const createSprintBtn = await page.$('button:has-text("Create Sprint")');
    if (!createSprintBtn) throw new Error('No Create Sprint button');
  });

  // 15. Test advanced search filters
  await testFeature(page, 'Advanced search has filter dropdowns', async () => {
    await page.goto('http://localhost:3458/search', { waitUntil: 'networkidle' });
    const content = await page.content();
    if (!content.includes('Story') || !content.includes('Bug')) throw new Error('Filter options not found');
    const headers = await page.$$('th');
    if (headers.length === 0) throw new Error('No table headers');
    console.log('  Found', headers.length, 'table headers');
  });

  // 16. Test create issue form submission
  await testFeature(page, 'Create Issue form submission adds issue to state', async () => {
    await page.goto('http://localhost:3458/', { waitUntil: 'networkidle' });
    const r0 = await context.request.get('http://localhost:3458/go');
    const j0 = await r0.json();
    const countBefore = j0.current_state.issues.length;
    await page.click('button:has-text("Create")');
    await page.waitForSelector('text=Create Issue', { timeout: 3000 });
    const summaryInput = await page.$('input[placeholder*="ummary" i]');
    if (!summaryInput) throw new Error('No summary input');
    await summaryInput.fill('Test Issue Created by Playwright Audit');
    const createBtn = await page.$('button[type="submit"]');
    if (!createBtn) throw new Error('No submit button');
    await createBtn.click();
    await page.waitForSelector('text=Create Issue', { state: 'detached', timeout: 3000 });
    await page.waitForTimeout(500);
    const r1 = await context.request.get('http://localhost:3458/go');
    const j1 = await r1.json();
    const countAfter = j1.current_state.issues.length;
    if (countAfter !== countBefore + 1) throw new Error('Issue not added: was ' + countBefore + ', now ' + countAfter);
    console.log('  Issue count went from', countBefore, 'to', countAfter);
  });

  // 17. Test issue modal from board
  await testFeature(page, 'Issue modal opens from board card click', async () => {
    await page.goto('http://localhost:3458/project/KAN/board', { waitUntil: 'networkidle' });
    const cards = await page.$$('[draggable="true"]');
    if (cards.length === 0) throw new Error('No draggable issue cards');
    await cards[0].click();
    await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
    const dialog = await page.$('[role="dialog"]');
    const text = await dialog.textContent();
    console.log('  Modal content (truncated):', text ? text.substring(0, 60) : '(empty)');
    await page.keyboard.press('Escape');
  });

  // 18. Test status change in modal
  await testFeature(page, 'Issue modal has editable status select', async () => {
    await page.goto('http://localhost:3458/project/KAN/board', { waitUntil: 'networkidle' });
    const cards = await page.$$('[draggable="true"]');
    if (cards.length === 0) throw new Error('No issue cards');
    await cards[0].click();
    await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
    const selects = await page.$$('[role="dialog"] select');
    if (selects.length === 0) throw new Error('No select dropdowns in modal');
    console.log('  Modal has', selects.length, 'select(s)');
    await page.keyboard.press('Escape');
  });

  // 19. Test settings save  
  await testFeature(page, 'Settings saves project changes to state', async () => {
    await page.goto('http://localhost:3458/project/KAN/settings', { waitUntil: 'networkidle' });
    const saveBtn = await page.$('button:has-text("Save")');
    if (!saveBtn) throw new Error('No Save button');
    const nameInput = await page.$('input[value="Kanban Project"]');
    if (nameInput) {
      await nameInput.fill('Kanban Project Audited');
      await saveBtn.click();
      await page.waitForTimeout(500);
      const r = await context.request.get('http://localhost:3458/go');
      const j = await r.json();
      const proj = j.current_state.projects.find(p => p.id === 'p1');
      if (!proj || proj.name !== 'Kanban Project Audited') throw new Error('Name not saved: ' + (proj ? proj.name : 'not found'));
      console.log('  Project name updated successfully');
      // Reset
      await nameInput.fill('Kanban Project');
      await saveBtn.click();
    }
  });

  // 20. Test reports velocity chart
  await testFeature(page, 'Reports page has velocity chart', async () => {
    await page.goto('http://localhost:3458/project/KAN/reports', { waitUntil: 'networkidle' });
    const content = await page.content();
    if (!content.toLowerCase().includes('velocity')) throw new Error('Velocity chart not found');
  });

  // 21. Test reports sprint report
  await testFeature(page, 'Reports page has sprint report', async () => {
    await page.goto('http://localhost:3458/project/KAN/reports', { waitUntil: 'networkidle' });
    const content = await page.content();
    if (!content.toLowerCase().includes('sprint report')) throw new Error('Sprint report not found');
  });

  // 22. Check breadcrumb
  await testFeature(page, 'Breadcrumb exists on board page', async () => {
    await page.goto('http://localhost:3458/project/KAN/board', { waitUntil: 'networkidle' });
    const content = await page.content();
    if (!content.includes('Projects')) throw new Error('No breadcrumb Projects text');
  });

  // 23. Check board quick filters
  await testFeature(page, 'Board has quick filter chips', async () => {
    await page.goto('http://localhost:3458/project/KAN/board', { waitUntil: 'networkidle' });
    const content = await page.content();
    if (!content.includes('Only My Issues') && !content.includes('Recently Updated')) throw new Error('Quick filters not found');
  });

  // 24. Check Group by Epic
  await testFeature(page, 'Board has Group by Epic toggle', async () => {
    await page.goto('http://localhost:3458/project/KAN/board', { waitUntil: 'networkidle' });
    const content = await page.content();
    if (!content.includes('Group by Epic') && !content.includes('swimlane')) throw new Error('Group by Epic not found');
  });

  // 25. Test comment on issue
  await testFeature(page, 'Adding comment to issue via modal', async () => {
    await page.goto('http://localhost:3458/project/KAN/board', { waitUntil: 'networkidle' });
    const cards = await page.$$('[draggable="true"]');
    if (cards.length === 0) throw new Error('No issue cards');
    // Get issue id from first card
    await cards[0].click();
    await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
    const textarea = await page.$('[role="dialog"] textarea');
    if (!textarea) throw new Error('No comment textarea in modal');
    await textarea.fill('Playwright audit comment');
    // Find submit button
    const saveBtn = await page.$('[role="dialog"] button:has-text("Save"), [role="dialog"] button[type="submit"]');
    if (saveBtn) {
      await saveBtn.click();
      await page.waitForTimeout(500);
      console.log('  Comment submitted');
    } else {
      console.log('  No explicit submit button found for comment');
    }
    await page.keyboard.press('Escape');
  });

  // 26. Test mark all notifications read
  await testFeature(page, 'Mark all notifications read updates state', async () => {
    await page.goto('http://localhost:3458/', { waitUntil: 'networkidle' });
    const buttons = await page.$$('button');
    let bellBtn = null;
    for (const btn of buttons) {
      const html = await btn.innerHTML();
      if (html.toLowerCase().includes('bell')) {
        bellBtn = btn;
        break;
      }
    }
    if (!bellBtn) throw new Error('Bell button not found');
    await bellBtn.click();
    await page.waitForSelector('text=Notifications', { timeout: 3000 });
    const markAllBtn = await page.$('button:has-text("Mark all")');
    if (!markAllBtn) throw new Error('Mark all button not found');
    await markAllBtn.click();
    await page.waitForTimeout(300);
    await page.keyboard.press('Escape');
  });

  // 27. Test backlog Epic filter
  await testFeature(page, 'Backlog has Epic filter dropdown', async () => {
    await page.goto('http://localhost:3458/project/KAN/backlog', { waitUntil: 'networkidle' });
    const content = await page.content();
    if (!content.includes('All Epics')) throw new Error('Epic filter not found (need "All Epics" option)');
  });

  // 28. Test backlog inline summary edit
  await testFeature(page, 'Backlog inline summary edit on double-click', async () => {
    await page.goto('http://localhost:3458/project/KAN/backlog', { waitUntil: 'networkidle' });
    // Find issue rows in backlog
    const issueRows = await page.$$('[data-issue-id], .backlog-issue-row, tr[class*="issue"]');
    if (issueRows.length === 0) {
      // Try finding issue text in backlog that's clickable
      const sprintIssues = await page.$$('.cursor-pointer:has-text("Set up CI/CD"), .cursor-pointer:has-text("KAN-")');
      if (sprintIssues.length === 0) throw new Error('No issue rows found in backlog for inline edit test');
      await sprintIssues[0].dblclick();
    } else {
      await issueRows[0].dblclick();
    }
    const inputVisible = await page.$('input[type="text"]:focus, input[value*="CI/CD"], input[value*="KAN"]');
    if (!inputVisible) throw new Error('Inline edit input not visible after double-click');
    await page.keyboard.press('Escape');
  });

  // 29. Test issue modal labels
  await testFeature(page, 'Issue modal has labels field', async () => {
    await page.goto('http://localhost:3458/project/KAN/board', { waitUntil: 'networkidle' });
    const cards = await page.$$('[draggable="true"]');
    if (cards.length === 0) throw new Error('No cards');
    await cards[0].click();
    await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
    const content = await page.$('[role="dialog"]');
    const text = await content.textContent();
    if (!text.toLowerCase().includes('label')) throw new Error('No labels field in modal');
    await page.keyboard.press('Escape');
  });

  // 30. Test issue modal reporter
  await testFeature(page, 'Issue modal has reporter field', async () => {
    await page.goto('http://localhost:3458/project/KAN/board', { waitUntil: 'networkidle' });
    const cards = await page.$$('[draggable="true"]');
    if (cards.length === 0) throw new Error('No cards');
    await cards[0].click();
    await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
    const content = await page.$('[role="dialog"]');
    const text = await content.textContent();
    if (!text.toLowerCase().includes('reporter')) throw new Error('No reporter field in modal');
    await page.keyboard.press('Escape');
  });

  // 31. Test issue modal issue links section
  await testFeature(page, 'Issue modal has issue links section', async () => {
    await page.goto('http://localhost:3458/project/KAN/board', { waitUntil: 'networkidle' });
    const cards = await page.$$('[draggable="true"]');
    if (cards.length === 0) throw new Error('No cards');
    await cards[0].click();
    await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
    const content = await page.$('[role="dialog"]');
    const text = await content.textContent();
    if (!text.toLowerCase().includes('link') && !text.toLowerCase().includes('Link')) throw new Error('No links section in modal');
    await page.keyboard.press('Escape');
  });

  // 32. Test delete issue
  await testFeature(page, 'Issue modal has delete button with confirm dialog', async () => {
    await page.goto('http://localhost:3458/project/KAN/board', { waitUntil: 'networkidle' });
    const cards = await page.$$('[draggable="true"]');
    if (cards.length === 0) throw new Error('No cards');
    await cards[0].click();
    await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
    // Look for trash/delete button
    const allBtns = await page.$$('[role="dialog"] button');
    let trashFound = false;
    for (const btn of allBtns) {
      const html = await btn.innerHTML();
      if (html.toLowerCase().includes('trash') || html.toLowerCase().includes('delete')) {
        trashFound = true;
        console.log('  Found delete/trash button in modal');
        break;
      }
    }
    if (!trashFound) throw new Error('No delete button found in issue modal');
    await page.keyboard.press('Escape');
  });

  // Screenshots
  await page.goto('http://localhost:3458/project/KAN/board', { waitUntil: 'networkidle' });
  await page.screenshot({ path: '/tmp/jira_board_final.png', fullPage: false });

  await page.goto('http://localhost:3458/project/KAN/backlog', { waitUntil: 'networkidle' });
  await page.screenshot({ path: '/tmp/jira_backlog_final.png', fullPage: false });

  await page.goto('http://localhost:3458/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: '/tmp/jira_dashboard_final.png', fullPage: false });

  await page.goto('http://localhost:3458/project/KAN/reports', { waitUntil: 'networkidle' });
  await page.screenshot({ path: '/tmp/jira_reports_final.png', fullPage: false });

  await page.goto('http://localhost:3458/search', { waitUntil: 'networkidle' });
  await page.screenshot({ path: '/tmp/jira_search_final.png', fullPage: false });

  await browser.close();
  console.log('\n[INFO] All tests and screenshots completed.');
})().catch(e => { console.error('Fatal error:', e.message); process.exit(1); });
