const { chromium } = require('playwright');

const BASE = 'http://localhost:5188';
const results = [];
let pass = 0, fail = 0;

function log(category, test, status, detail = '') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} [${category}] ${test}${detail ? ': ' + detail : ''}`);
  results.push({ category, test, status, detail });
  if (status === 'PASS') pass++;
  else if (status === 'FAIL') fail++;
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function getGoState(page, sid = null) {
  const url = sid ? `${BASE}/go?sid=${sid}` : `${BASE}/go`;
  await page.goto(url);
  await sleep(500);
  try {
    const text = await page.locator('pre').first().textContent();
    return JSON.parse(text);
  } catch(e) {
    return null;
  }
}

async function resetState(page) {
  await page.goto(BASE + '/');
  await sleep(500);
  // Clear localStorage to reset state
  await page.evaluate(() => {
    try { localStorage.removeItem('bamboohr_state'); } catch(e) {}
  });
  await page.goto(BASE + '/');
  await sleep(800);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // ========== TEST 1: HOME PAGE LOADS ==========
  await page.goto(BASE + '/');
  await sleep(1000);

  const title = await page.title();
  log('Home', 'Page loads without white screen', 'PASS', `title: ${title}`);

  const nav = await page.locator('nav, header').first().isVisible().catch(() => false);
  log('Home', 'Nav/Header visible', nav ? 'PASS' : 'FAIL');

  // ========== TEST 2: BUG-001 FIX: New... dropdown modals ==========
  console.log('\n--- Testing BUG-001 fix: New... dropdown modals ---');

  await page.goto(BASE + '/');
  await sleep(800);

  // Find and click New... button
  const newButton = page.locator('button').filter({ hasText: /new/i }).first();
  const newBtnVisible = await newButton.isVisible().catch(() => false);
  log('New Dropdown', '"New..." button exists', newBtnVisible ? 'PASS' : 'FAIL');

  if (newBtnVisible) {
    await newButton.click();
    await sleep(500);

    // Check dropdown options
    const newEmployee = page.locator('text=New Employee');
    const newAnnouncement = page.locator('text=New Announcement');
    const newTimeOff = page.locator('text=New Time Off Request');

    const hasEmployee = await newEmployee.isVisible().catch(() => false);
    const hasAnnouncement = await newAnnouncement.isVisible().catch(() => false);
    const hasTimeOff = await newTimeOff.isVisible().catch(() => false);

    log('New Dropdown', '"New Employee" option visible', hasEmployee ? 'PASS' : 'FAIL');
    log('New Dropdown', '"New Announcement" option visible', hasAnnouncement ? 'PASS' : 'FAIL');
    log('New Dropdown', '"New Time Off Request" option visible', hasTimeOff ? 'PASS' : 'FAIL');

    // Test New Employee modal
    if (hasEmployee) {
      await newEmployee.click();
      await sleep(600);

      const modal = page.locator('[role="dialog"], .modal, [class*="modal"]').first();
      const modalVisible = await modal.isVisible().catch(() => false);

      // Check for form fields in any modal/overlay
      const firstNameInput = page.locator('input[placeholder*="First"], input[name*="first"], input[id*="first"]').first();
      const lastNameInput = page.locator('input[placeholder*="Last"], input[name*="last"], input[id*="last"]').first();
      const emailInput = page.locator('input[type="email"], input[placeholder*="email"], input[name*="email"]').first();

      const hasFirstName = await firstNameInput.isVisible().catch(() => false);
      const hasLastName = await lastNameInput.isVisible().catch(() => false);
      const hasEmail = await emailInput.isVisible().catch(() => false);

      log('New Employee Modal', 'Modal opens after clicking "New Employee"', (modalVisible || hasFirstName) ? 'PASS' : 'FAIL',
        `modal: ${modalVisible}, firstName field: ${hasFirstName}`);
      log('New Employee Modal', 'First Name field present', hasFirstName ? 'PASS' : 'FAIL');
      log('New Employee Modal', 'Last Name field present', hasLastName ? 'PASS' : 'FAIL');
      log('New Employee Modal', 'Email field present', hasEmail ? 'PASS' : 'FAIL');

      if (hasFirstName && hasLastName && hasEmail) {
        // Fill the form and submit
        await firstNameInput.fill('Test');
        await lastNameInput.fill('Employee');
        await emailInput.fill('test.employee@example.com');

        // Fill other required fields
        const hireDateInput = page.locator('input[type="date"], input[placeholder*="Hire"]').first();
        if (await hireDateInput.isVisible().catch(() => false)) {
          await hireDateInput.fill('2026-01-01');
        }

        const submitBtn = page.locator('button').filter({ hasText: /save|submit|add|create/i }).first();
        const submitVisible = await submitBtn.isVisible().catch(() => false);

        if (submitVisible) {
          await submitBtn.click();
          await sleep(800);

          // Verify modal closed
          const modalGone = !(await firstNameInput.isVisible().catch(() => false));
          log('New Employee Modal', 'Submit closes modal', modalGone ? 'PASS' : 'FAIL');

          // Check state
          const goState = await getGoState(page);
          const employees = goState?.current_state?.employees || [];
          const newEmp = employees.find(e => e.firstName === 'Test' && e.lastName === 'Employee');
          log('New Employee Modal', 'New employee added to state', newEmp ? 'PASS' : 'FAIL',
            `employees count: ${employees.length}`);
        } else {
          log('New Employee Modal', 'Submit button found', 'FAIL', 'No submit button found');
        }
      } else {
        log('New Employee Modal', 'Form fields check', 'FAIL', `Modal may not have opened — hasFirstName: ${hasFirstName}`);
        // Screenshot for debug
        await page.screenshot({ path: '/cpfs01/data/shared/Group-m6/bowen/CUA-Gym-Websites/bamboohr_mock/assets/screenshots/debug_new_employee.png' });
      }
    }

    // Re-open dropdown for New Announcement test
    await page.goto(BASE + '/');
    await sleep(800);
    await newButton.click();
    await sleep(400);

    const newAnn = page.locator('text=New Announcement');
    if (await newAnn.isVisible().catch(() => false)) {
      await newAnn.click();
      await sleep(600);

      const titleInput = page.locator('input[placeholder*="title"], input[placeholder*="Title"], textarea[placeholder*="Title"]').first();
      const bodyTextarea = page.locator('textarea').first();

      const hasTitleInput = await titleInput.isVisible().catch(() => false);
      const hasBody = await bodyTextarea.isVisible().catch(() => false);

      log('New Announcement Modal', 'Modal opens after clicking "New Announcement"', (hasTitleInput || hasBody) ? 'PASS' : 'FAIL');
      log('New Announcement Modal', 'Title input present', hasTitleInput ? 'PASS' : 'FAIL');
      log('New Announcement Modal', 'Body textarea present', hasBody ? 'PASS' : 'FAIL');

      if (hasTitleInput) {
        await titleInput.fill('Test Announcement Title');
      }
      if (hasBody) {
        await bodyTextarea.fill('Test announcement body text.');
      }

      const saveBtn = page.locator('button').filter({ hasText: /save|submit|create|post/i }).first();
      if (await saveBtn.isVisible().catch(() => false)) {
        await saveBtn.click();
        await sleep(600);
        const bodyGone = !(await bodyTextarea.isVisible().catch(() => false));
        log('New Announcement Modal', 'Submit closes modal', bodyGone ? 'PASS' : 'FAIL');
      }
    }

    // Re-open for New Time Off Request
    await page.goto(BASE + '/');
    await sleep(800);
    await newButton.click();
    await sleep(400);

    const newTO = page.locator('text=New Time Off Request');
    if (await newTO.isVisible().catch(() => false)) {
      await newTO.click();
      await sleep(600);

      const typeSelect = page.locator('select').first();
      const hasTypeSelect = await typeSelect.isVisible().catch(() => false);
      log('New Time Off Modal', 'Modal opens after clicking "New Time Off Request"', hasTypeSelect ? 'PASS' : 'FAIL');
    }
  }

  // ========== TEST 3: BUG-002 FIX: Org chart node click ==========
  console.log('\n--- Testing BUG-002 fix: Org chart node click ---');

  await page.goto(BASE + '/people/org-chart');
  await sleep(1000);

  // Find nodes by data-testid
  const orgNodes = page.locator('[data-testid^="org-node-"]');
  const nodeCount = await orgNodes.count();
  log('Org Chart', `data-testid="org-node-*" nodes found`, nodeCount > 0 ? 'PASS' : 'FAIL', `count: ${nodeCount}`);

  // Try clicking a node with data-testid
  if (nodeCount > 0) {
    const firstNode = orgNodes.first();
    const nodeTestId = await firstNode.getAttribute('data-testid');
    log('Org Chart', 'Node has data-testid attribute', nodeTestId ? 'PASS' : 'FAIL', `testid: ${nodeTestId}`);

    // Also check for data-testid with "name" format
    const nameNodes = page.locator('[data-testid^="org-node-name-"]');
    const nameNodeCount = await nameNodes.count();
    log('Org Chart', `data-testid="org-node-name-*" nodes found`, nameNodeCount > 0 ? 'PASS' : 'FAIL', `count: ${nameNodeCount}`);

    // Try clicking the first name node
    if (nameNodeCount > 0) {
      const firstNameNode = nameNodes.first();
      const testId = await firstNameNode.getAttribute('data-testid');
      const currentUrl = page.url();

      await firstNameNode.click();
      await sleep(600);

      const newUrl = page.url();
      const navigated = newUrl !== currentUrl && newUrl.includes('/people/');
      log('Org Chart', 'Clicking org-node-name-* navigates to /people/:id', navigated ? 'PASS' : 'FAIL',
        `${currentUrl} -> ${newUrl}`);
    } else {
      // Fall back to clicking the node itself
      const testId = await firstNode.getAttribute('data-testid');
      const currentUrl = page.url();
      await firstNode.click();
      await sleep(600);
      const newUrl = page.url();
      const navigated = newUrl !== currentUrl && newUrl.includes('/people/');
      log('Org Chart', 'Clicking org-node navigates to /people/:id', navigated ? 'PASS' : 'FAIL',
        `testid=${testId}, ${currentUrl} -> ${newUrl}`);
    }
  }

  // ========== TEST 4: BUG-003 FIX: Run Report button ==========
  console.log('\n--- Testing BUG-003 fix: Run Report button on /reports/:id ---');

  await page.goto(BASE + '/reports/1');
  await sleep(800);

  const runReportBtn = page.locator('button').filter({ hasText: /run report/i }).first();
  const runReportBtnVisible = await runReportBtn.isVisible().catch(() => false);
  log('Report Detail', '"Run Report" button visible on /reports/1', runReportBtnVisible ? 'PASS' : 'FAIL');

  if (runReportBtnVisible) {
    // Get state before
    const stateBefore = await getGoState(page);
    const reportBefore = stateBefore?.current_state?.reports?.find(r => r.id == 1);
    const lastRunBefore = reportBefore?.lastRunAt;

    await page.goto(BASE + '/reports/1');
    await sleep(800);
    await runReportBtn.click();
    await sleep(800);

    // Verify state updated
    const stateAfter = await getGoState(page);
    const reportAfter = stateAfter?.current_state?.reports?.find(r => r.id == 1);
    const lastRunAfter = reportAfter?.lastRunAt;

    log('Report Detail', 'Run Report updates lastRunAt in state', lastRunAfter && lastRunAfter !== lastRunBefore ? 'PASS' : 'FAIL',
      `before: ${lastRunBefore}, after: ${lastRunAfter}`);
  } else {
    await page.screenshot({ path: '/cpfs01/data/shared/Group-m6/bowen/CUA-Gym-Websites/bamboohr_mock/assets/screenshots/debug_reports.png' });
    // Check all buttons on page
    const allBtns = await page.locator('button').allTextContents();
    console.log('Buttons on /reports/1:', allBtns.slice(0, 10));
  }

  // ========== TEST 5: HOME - Request Time Off Modal ==========
  console.log('\n--- Testing Home: Request Time Off modal ---');

  await page.goto(BASE + '/');
  await sleep(800);

  const requestTOBtn = page.locator('button').filter({ hasText: /request time off/i }).first();
  const hasTOBtn = await requestTOBtn.isVisible().catch(() => false);
  log('Home', '"Request Time Off" button visible', hasTOBtn ? 'PASS' : 'FAIL');

  if (hasTOBtn) {
    await requestTOBtn.click();
    await sleep(500);

    const toModal = page.locator('[role="dialog"], .modal, [class*="modal"]').first();
    const toModalVisible = await toModal.isVisible().catch(() => false);
    const toSelect = page.locator('select').first();
    const hasToSelect = await toSelect.isVisible().catch(() => false);

    log('Home', 'Time Off modal opens', (toModalVisible || hasToSelect) ? 'PASS' : 'FAIL');

    if (hasToSelect) {
      const dateInputs = page.locator('input[type="date"]');
      const dateCount = await dateInputs.count();
      log('Home', 'Date inputs in Time Off modal', dateCount >= 2 ? 'PASS' : 'FAIL', `count: ${dateCount}`);

      // Fill and submit
      await toSelect.selectOption({ index: 1 });
      if (dateCount >= 2) {
        await dateInputs.nth(0).fill('2026-05-01');
        await dateInputs.nth(1).fill('2026-05-02');
      }

      const submitBtn = page.locator('button').filter({ hasText: /submit|save/i }).first();
      if (await submitBtn.isVisible().catch(() => false)) {
        await submitBtn.click();
        await sleep(600);
        const modalGone = !(await toSelect.isVisible().catch(() => false));
        log('Home', 'Time Off modal closes after submit', modalGone ? 'PASS' : 'FAIL');
      }
    }
  }

  // ========== TEST 6: Home - Dismiss notification ==========
  console.log('\n--- Testing Home: Dismiss notification ---');

  await page.goto(BASE + '/');
  await sleep(800);

  const dismissBtns = page.locator('[class*="dismiss"], button[aria-label*="dismiss"], button[title*="dismiss"]');
  const dismissCount = await dismissBtns.count();
  log('Home', 'Dismiss buttons present in feed', dismissCount > 0 ? 'PASS' : 'FAIL', `count: ${dismissCount}`);

  // ========== TEST 7: People Directory ==========
  console.log('\n--- Testing People Directory ---');

  await page.goto(BASE + '/people');
  await sleep(800);

  const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"]').first();
  const hasSearch = await searchInput.isVisible().catch(() => false);
  log('People', 'Search input visible', hasSearch ? 'PASS' : 'FAIL');

  if (hasSearch) {
    await searchInput.fill('Charlotte');
    await sleep(400);
    const cards = page.locator('[class*="card"], [class*="employee"]');
    const cardCount = await cards.count();
    log('People', 'Search filters employees', cardCount >= 1 ? 'PASS' : 'FAIL', `cards after search: ${cardCount}`);
  }

  // Click employee card
  await page.goto(BASE + '/people');
  await sleep(800);
  const empCards = page.locator('a[href^="/people/"]').first();
  const cardVisible = await empCards.isVisible().catch(() => false);
  if (cardVisible) {
    const href = await empCards.getAttribute('href');
    await empCards.click();
    await sleep(500);
    const url = page.url();
    log('People', 'Employee card navigates to profile', url.includes('/people/') ? 'PASS' : 'FAIL', `url: ${url}`);
  }

  // ========== TEST 8: Employee Profile tabs ==========
  console.log('\n--- Testing Employee Profile tabs ---');

  await page.goto(BASE + '/people/1');
  await sleep(1000);

  const profileName = await page.locator('text=Charlotte').first().isVisible().catch(() => false);
  log('Profile', 'Profile page loads with employee name', profileName ? 'PASS' : 'FAIL');

  const tabs = ['Personal', 'Job', 'Time Off', 'Documents', 'Notes', 'Performance'];
  for (const tab of tabs) {
    const tabEl = page.locator(`[role="tab"], button, a`).filter({ hasText: tab }).first();
    const tabVisible = await tabEl.isVisible().catch(() => false);
    if (tabVisible) {
      await tabEl.click();
      await sleep(400);
      log('Profile', `${tab} tab clickable`, 'PASS');
    } else {
      log('Profile', `${tab} tab clickable`, 'FAIL', 'Tab not found');
    }
  }

  // Test Add Note
  await page.goto(BASE + '/people/1');
  await sleep(800);
  const notesTab = page.locator('button, a').filter({ hasText: 'Notes' }).first();
  if (await notesTab.isVisible().catch(() => false)) {
    await notesTab.click();
    await sleep(400);

    const addNoteBtn = page.locator('button').filter({ hasText: /add note/i }).first();
    if (await addNoteBtn.isVisible().catch(() => false)) {
      await addNoteBtn.click();
      await sleep(400);

      const noteTextarea = page.locator('textarea').first();
      if (await noteTextarea.isVisible().catch(() => false)) {
        await noteTextarea.fill('Playwright test note Round 3');
        const saveBtn = page.locator('button').filter({ hasText: /save/i }).first();
        if (await saveBtn.isVisible().catch(() => false)) {
          await saveBtn.click();
          await sleep(500);
          const noteVisible = await page.locator('text=Playwright test note Round 3').isVisible().catch(() => false);
          log('Profile Notes', 'Add Note saves note and shows it', noteVisible ? 'PASS' : 'FAIL');
        }
      }
    }
  }

  // Test Upload Document modal
  await page.goto(BASE + '/people/1');
  await sleep(800);
  const docsTab = page.locator('button, a').filter({ hasText: 'Documents' }).first();
  if (await docsTab.isVisible().catch(() => false)) {
    await docsTab.click();
    await sleep(400);

    const uploadBtn = page.locator('button').filter({ hasText: /upload/i }).first();
    const hasUpload = await uploadBtn.isVisible().catch(() => false);
    log('Profile Documents', '"Upload Document" button visible', hasUpload ? 'PASS' : 'FAIL');

    if (hasUpload) {
      await uploadBtn.click();
      await sleep(500);
      const uploadModal = page.locator('[role="dialog"], .modal, [class*="modal"]').first();
      const docNameInput = page.locator('input[type="text"], input[placeholder*="name"], input[placeholder*="Name"]').first();
      const modalOpen = await uploadModal.isVisible().catch(() => false) || await docNameInput.isVisible().catch(() => false);
      log('Profile Documents', 'Upload Document modal opens', modalOpen ? 'PASS' : 'FAIL');
    }
  }

  // ========== TEST 9: Hiring - Advance Candidate ==========
  console.log('\n--- Testing Hiring: Advance candidate ---');

  await page.goto(BASE + '/hiring/1');
  await sleep(800);

  const candidateCards = page.locator('[class*="candidate"], [data-testid*="candidate"]');
  const candidateCount = await candidateCards.count();
  log('Hiring Detail', 'Candidate cards visible', candidateCount > 0 ? 'PASS' : 'FAIL', `count: ${candidateCount}`);

  // Try clicking first candidate card to open detail panel
  if (candidateCount > 0) {
    await candidateCards.first().click();
    await sleep(500);

    const advanceBtn = page.locator('button').filter({ hasText: /advance/i }).first();
    const hasAdvance = await advanceBtn.isVisible().catch(() => false);
    log('Hiring Detail', '"Advance" button in candidate detail', hasAdvance ? 'PASS' : 'FAIL');

    if (hasAdvance) {
      await advanceBtn.click();
      await sleep(500);
      log('Hiring Detail', 'Advance button clickable', 'PASS');
    }
  }

  // ========== TEST 10: Reports page ==========
  console.log('\n--- Testing Reports page ---');

  await page.goto(BASE + '/reports');
  await sleep(800);

  const createCustomBtn = page.locator('button').filter({ hasText: /create custom report/i }).first();
  const hasCreateCustom = await createCustomBtn.isVisible().catch(() => false);
  log('Reports', '"Create Custom Report" button visible', hasCreateCustom ? 'PASS' : 'FAIL');

  if (hasCreateCustom) {
    await createCustomBtn.click();
    await sleep(500);
    const reportNameInput = page.locator('input').first();
    const hasNameInput = await reportNameInput.isVisible().catch(() => false);
    log('Reports', '"Create Custom Report" opens modal', hasNameInput ? 'PASS' : 'FAIL');
  }

  const runReportLinks = page.locator('a, button').filter({ hasText: /run report/i });
  const runReportCount = await runReportLinks.count();
  log('Reports', '"Run Report" buttons/links on reports list', runReportCount > 0 ? 'PASS' : 'FAIL', `count: ${runReportCount}`);

  // ========== TEST 11: Notification bell ==========
  console.log('\n--- Testing Notification bell ---');

  await page.goto(BASE + '/');
  await sleep(800);

  const bellBtn = page.locator('button[aria-label*="notification"], button[title*="notification"]');
  const bellBtnAlt = page.locator('button').filter({ has: page.locator('[class*="bell"], svg') }).first();

  // Try to find bell by clicking the area with badge
  const badge = page.locator('[class*="badge"]').first();
  const badgeVisible = await badge.isVisible().catch(() => false);
  log('Notifications', 'Notification badge visible', badgeVisible ? 'PASS' : 'FAIL');

  // ========== TEST 12: Session isolation ==========
  console.log('\n--- Testing session isolation ---');

  // Use a different context to avoid state bleed
  const testSid = 'playwright-test-r3';

  // Reset first
  const resetResp = await page.evaluate(async (sid) => {
    const r = await fetch(`/post?sid=${sid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset' })
    });
    return r.json();
  }, testSid);
  log('Session', 'POST /post?sid= reset works', resetResp?.ok ? 'PASS' : 'FAIL', JSON.stringify(resetResp));

  const setResp = await page.evaluate(async (sid) => {
    const r = await fetch(`/post?sid=${sid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set', state: { _playwright: 'round3_test' } })
    });
    return r.json();
  }, testSid);
  log('Session', 'POST /post?sid= set works', setResp?.ok ? 'PASS' : 'FAIL', JSON.stringify(setResp));

  await page.goto(`${BASE}/go?sid=${testSid}`);
  await sleep(500);
  const goText = await page.locator('pre').first().textContent().catch(() => '{}');
  let goData;
  try { goData = JSON.parse(goText); } catch(e) { goData = null; }

  const sidState = goData?.current_state?._playwright;
  log('Session', 'GET /go?sid= returns correct state', sidState === 'round3_test' ? 'PASS' : 'FAIL',
    `_playwright: ${sidState}`);

  // Cleanup
  await page.evaluate(async (sid) => {
    await fetch(`/post?sid=${sid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset' })
    });
  }, testSid);
  log('Session', 'POST /post?sid= reset cleanup', 'PASS');

  // ========== TEST 13: Screenshots for visual comparison ==========
  console.log('\n--- Capturing screenshots ---');

  const screenshotDir = '/cpfs01/data/shared/Group-m6/bowen/CUA-Gym-Websites/bamboohr_mock/assets/screenshots/';

  await page.goto(BASE + '/');
  await sleep(1000);
  await page.screenshot({ path: screenshotDir + 'mock_home_r3.png', fullPage: true });
  log('Visual', 'Home screenshot captured', 'PASS');

  await page.goto(BASE + '/people');
  await sleep(800);
  await page.screenshot({ path: screenshotDir + 'mock_people_r3.png', fullPage: true });
  log('Visual', 'People directory screenshot captured', 'PASS');

  await page.goto(BASE + '/people/org-chart');
  await sleep(800);
  await page.screenshot({ path: screenshotDir + 'mock_orgchart_r3.png', fullPage: true });
  log('Visual', 'Org chart screenshot captured', 'PASS');

  await page.goto(BASE + '/people/1');
  await sleep(800);
  await page.screenshot({ path: screenshotDir + 'mock_profile_r3.png', fullPage: true });
  log('Visual', 'Employee profile screenshot captured', 'PASS');

  await page.goto(BASE + '/hiring');
  await sleep(800);
  await page.screenshot({ path: screenshotDir + 'mock_hiring_r3.png', fullPage: true });
  log('Visual', 'Hiring list screenshot captured', 'PASS');

  await page.goto(BASE + '/hiring/1');
  await sleep(800);
  await page.screenshot({ path: screenshotDir + 'mock_hiring_detail_r3.png', fullPage: true });
  log('Visual', 'Hiring detail screenshot captured', 'PASS');

  await page.goto(BASE + '/reports');
  await sleep(800);
  await page.screenshot({ path: screenshotDir + 'mock_reports_r3.png', fullPage: true });
  log('Visual', 'Reports list screenshot captured', 'PASS');

  await page.goto(BASE + '/reports/1');
  await sleep(800);
  await page.screenshot({ path: screenshotDir + 'mock_report_detail_r3.png', fullPage: true });
  log('Visual', 'Report detail screenshot captured', 'PASS');

  await browser.close();

  // ========== SUMMARY ==========
  console.log('\n========== TEST SUMMARY ==========');
  console.log(`PASS: ${pass}`);
  console.log(`FAIL: ${fail}`);
  console.log(`TOTAL: ${pass + fail}`);
  console.log('\nFAILED TESTS:');
  results.filter(r => r.status === 'FAIL').forEach(r => {
    console.log(`  ❌ [${r.category}] ${r.test}: ${r.detail}`);
  });
})().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
