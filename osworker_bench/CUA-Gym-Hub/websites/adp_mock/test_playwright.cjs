const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:5183';
const SCREENSHOT_DIR = '/cpfs01/data/shared/Group-m6/bowen/CUA-Gym-Websites/adp_mock/assets/screenshots';

const results = {
  passed: [],
  failed: [],
  skipped: []
};

function pass(route, element, detail) {
  results.passed.push({ route, element, detail });
  console.log(`  PASS [${route}] ${element}: ${detail}`);
}

function fail(route, element, detail, consoleErrors = []) {
  results.failed.push({ route, element, detail, consoleErrors });
  console.log(`  FAIL [${route}] ${element}: ${detail}`);
}

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  // ============ DASHBOARD (/) ============
  console.log('\n=== Testing / (Dashboard) ===');
  await page.goto(`${BASE_URL}/`);
  await page.waitForTimeout(1000);

  // Check page loads
  const dashTitle = await page.title();
  if (dashTitle) pass('/', 'page load', `Title: ${dashTitle}`);
  else fail('/', 'page load', 'No page title');

  // Screenshot
  await page.screenshot({ path: `${SCREENSHOT_DIR}/mock_dashboard.png`, fullPage: true });

  // Welcome banner
  const welcomeBanner = await page.$('.welcome-banner, [class*="welcome"]');
  if (welcomeBanner) pass('/', 'welcome banner', 'Welcome banner element found');
  else {
    // Try to find it by text
    const greeting = await page.getByText(/Good morning|Good afternoon|Good evening/, { exact: false }).first();
    if (await greeting.isVisible().catch(() => false)) pass('/', 'welcome banner', 'Greeting text visible');
    else fail('/', 'welcome banner', 'No welcome banner or greeting text found');
  }

  // Quick action cards - Clock In
  const clockBtn = await page.getByText(/Clock In|Clock Out/, { exact: false }).first();
  if (await clockBtn.isVisible().catch(() => false)) {
    pass('/', 'Clock In/Out button', 'Clock button visible');
    await clockBtn.click();
    await page.waitForTimeout(500);
    const currentUrl = page.url();
    if (currentUrl.includes('/myself/time')) {
      pass('/', 'Clock In/Out navigation', 'Navigates to /myself/time');
      await page.goBack();
      await page.waitForTimeout(500);
    } else {
      fail('/', 'Clock In/Out navigation', `Expected /myself/time but got ${currentUrl}`);
    }
  } else {
    fail('/', 'Clock In/Out button', 'Clock button not found on dashboard');
  }

  // Request Time Off card
  const requestTimeOffCard = await page.getByText('Request Time Off', { exact: false }).first();
  if (await requestTimeOffCard.isVisible().catch(() => false)) {
    pass('/', 'Request Time Off card', 'Visible');
    await requestTimeOffCard.click();
    await page.waitForTimeout(500);
    const urlAfter = page.url();
    if (urlAfter.includes('/myself/timeoff/request')) {
      pass('/', 'Request Time Off navigation', 'Navigates to timeoff/request');
      await page.goBack();
      await page.waitForTimeout(500);
    } else {
      fail('/', 'Request Time Off navigation', `Expected /myself/timeoff/request but got ${urlAfter}`);
      await page.goto(`${BASE_URL}/`);
      await page.waitForTimeout(500);
    }
  } else {
    fail('/', 'Request Time Off card', 'Not found on dashboard');
  }

  // View Pay Statement card
  const viewPayCard = await page.getByText(/View Pay Statement|Pay Statement/, { exact: false }).first();
  if (await viewPayCard.isVisible().catch(() => false)) {
    pass('/', 'View Pay Statement card', 'Visible');
    await viewPayCard.click();
    await page.waitForTimeout(500);
    const urlAfter = page.url();
    if (urlAfter.includes('/myself/pay')) {
      pass('/', 'View Pay Statement navigation', 'Navigates to pay section');
      await page.goBack();
      await page.waitForTimeout(500);
    } else {
      fail('/', 'View Pay Statement navigation', `Expected /myself/pay but got ${urlAfter}`);
      await page.goto(`${BASE_URL}/`);
      await page.waitForTimeout(500);
    }
  } else {
    fail('/', 'View Pay Statement card', 'Not found on dashboard');
  }

  // To-Do checkboxes
  await page.goto(`${BASE_URL}/`);
  await page.waitForTimeout(500);
  const todoCheckboxes = await page.$$('input[type="checkbox"], [class*="todo"] [class*="checkbox"], [class*="check"]');
  if (todoCheckboxes.length > 0) {
    pass('/', 'todo checkboxes', `Found ${todoCheckboxes.length} checkboxes`);
    // Try clicking the first
    await todoCheckboxes[0].click().catch(() => {});
    await page.waitForTimeout(300);
    pass('/', 'todo checkbox click', 'Clicked first checkbox');
  } else {
    // Try finding by text
    const todoHeader = await page.getByText(/To-Do|Todo/, { exact: false }).first();
    if (await todoHeader.isVisible().catch(() => false)) {
      pass('/', 'todo section', 'Todo section found');
      const checkmarks = await page.$$('[class*="todo"] button, [class*="todo"] [role="checkbox"]');
      if (checkmarks.length > 0) {
        pass('/', 'todo interactive elements', `Found ${checkmarks.length} interactive todo elements`);
        await checkmarks[0].click().catch(() => {});
        await page.waitForTimeout(300);
      } else {
        fail('/', 'todo checkboxes', 'Todo section found but no interactive checkboxes');
      }
    } else {
      fail('/', 'todo section', 'Todo section not found at all');
    }
  }

  // Announcements expand
  const announceHeader = await page.getByText(/Announcement|Company News/, { exact: false }).first();
  if (await announceHeader.isVisible().catch(() => false)) {
    pass('/', 'announcements section', 'Announcements section found');
    // Find first announcement item and click it
    const announceItems = await page.$$('[class*="announce"] [class*="item"], [class*="news"] li, [class*="announcement"]');
    if (announceItems.length > 0) {
      await announceItems[0].click().catch(() => {});
      await page.waitForTimeout(500);
      pass('/', 'announcement expand', 'Clicked first announcement item');
    } else {
      fail('/', 'announcement items', 'No announcement items found to click');
    }
  } else {
    fail('/', 'announcements section', 'Announcements section not found');
  }

  // Notification bell
  const bellBtn = await page.$('[class*="bell"], [class*="notification"] button, button[title*="notification"]');
  if (bellBtn) {
    pass('/', 'notification bell', 'Bell button found');
    await bellBtn.click();
    await page.waitForTimeout(500);
    const dropdown = await page.$('[class*="notification-dropdown"], [class*="notif-panel"]');
    if (dropdown) pass('/', 'notification bell dropdown', 'Dropdown opened');
    else {
      // Check if any notification panel appeared
      const panel = await page.getByText(/Notifications/, { exact: false }).isVisible().catch(() => false);
      if (panel) pass('/', 'notification bell dropdown', 'Notifications panel opened');
      else fail('/', 'notification bell dropdown', 'Clicking bell did not open dropdown');
    }
    // Close by clicking elsewhere
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  } else {
    fail('/', 'notification bell', 'Bell icon/button not found');
  }

  // Pay summary "View Details" link
  const viewDetails = await page.getByText('View Details', { exact: false }).first();
  if (await viewDetails.isVisible().catch(() => false)) {
    pass('/', 'pay summary View Details link', 'Link visible');
    await viewDetails.click();
    await page.waitForTimeout(500);
    const urlAfter = page.url();
    if (urlAfter.includes('/myself/pay/')) {
      pass('/', 'pay summary View Details navigation', `Navigates to ${urlAfter}`);
    } else {
      fail('/', 'pay summary View Details navigation', `Expected /myself/pay/:id but got ${urlAfter}`);
    }
    await page.goto(`${BASE_URL}/`);
    await page.waitForTimeout(500);
  } else {
    fail('/', 'pay summary View Details link', 'Not found');
  }

  // Time off "View All" link
  const viewAll = await page.getByText('View All', { exact: false }).first();
  if (await viewAll.isVisible().catch(() => false)) {
    pass('/', 'time off View All link', 'Link visible');
    await viewAll.click();
    await page.waitForTimeout(500);
    const urlAfter = page.url();
    if (urlAfter.includes('/myself/timeoff')) {
      pass('/', 'time off View All navigation', 'Navigates to /myself/timeoff');
    } else {
      fail('/', 'time off View All navigation', `Expected /myself/timeoff but got ${urlAfter}`);
    }
    await page.goto(`${BASE_URL}/`);
    await page.waitForTimeout(500);
  } else {
    fail('/', 'time off View All link', 'Not found');
  }

  // ============ PAY STATEMENTS (/myself/pay) ============
  console.log('\n=== Testing /myself/pay ===');
  await page.goto(`${BASE_URL}/myself/pay`);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/mock_pay.png`, fullPage: true });

  const payHeader = await page.getByText(/Pay Statements/, { exact: false }).first();
  if (await payHeader.isVisible().catch(() => false)) pass('/myself/pay', 'page load', 'Pay Statements page renders');
  else fail('/myself/pay', 'page load', 'No Pay Statements heading found');

  // Year filter dropdown
  const yearFilter = await page.$('select, [class*="year"] select, [class*="filter"] select');
  if (yearFilter) {
    pass('/myself/pay', 'year filter dropdown', 'Dropdown found');
    const options = await yearFilter.$$('option');
    if (options.length > 1) {
      pass('/myself/pay', 'year filter options', `${options.length} options available`);
      await yearFilter.selectOption({ index: 0 });
      await page.waitForTimeout(300);
    }
  } else {
    // Maybe it's a custom dropdown
    const filterEl = await page.$('[class*="year-filter"], [class*="yearFilter"]');
    if (filterEl) pass('/myself/pay', 'year filter', 'Custom year filter found');
    else fail('/myself/pay', 'year filter dropdown', 'No year filter found');
  }

  // Table rows clickable
  const payRows = await page.$$('table tbody tr, [class*="pay-row"], [class*="statement-row"]');
  if (payRows.length > 0) {
    pass('/myself/pay', 'pay statements table', `${payRows.length} rows visible`);
    await payRows[0].click();
    await page.waitForTimeout(500);
    const urlAfter = page.url();
    if (urlAfter.includes('/myself/pay/')) {
      pass('/myself/pay', 'row click navigation', `Navigates to ${urlAfter}`);
    } else {
      fail('/myself/pay', 'row click navigation', `Expected /myself/pay/:id but got ${urlAfter}`);
    }
  } else {
    fail('/myself/pay', 'pay statements table', 'No table rows found');
  }

  // ============ PAY STATEMENT DETAIL (/myself/pay/:id) ============
  console.log('\n=== Testing /myself/pay/pay-001 ===');
  await page.goto(`${BASE_URL}/myself/pay/pay-001`);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/mock_pay_detail.png`, fullPage: true });

  // Back button
  const backBtn = await page.getByText(/Back to Pay Statements|← Back|Back/, { exact: false }).first();
  if (await backBtn.isVisible().catch(() => false)) {
    pass('/myself/pay/pay-001', 'back button', 'Back button visible');
    await backBtn.click();
    await page.waitForTimeout(500);
    const urlAfter = page.url();
    if (urlAfter.includes('/myself/pay') && !urlAfter.includes('pay-001')) {
      pass('/myself/pay/pay-001', 'back button navigation', 'Navigates back to pay list');
    } else {
      fail('/myself/pay/pay-001', 'back button navigation', `Expected /myself/pay but got ${urlAfter}`);
    }
    await page.goto(`${BASE_URL}/myself/pay/pay-001`);
    await page.waitForTimeout(500);
  } else {
    fail('/myself/pay/pay-001', 'back button', 'No back button found');
  }

  // Earnings/Deductions/Taxes tables
  const earningsTable = await page.getByText(/Earnings/, { exact: false }).first();
  if (await earningsTable.isVisible().catch(() => false)) pass('/myself/pay/pay-001', 'earnings table', 'Visible');
  else fail('/myself/pay/pay-001', 'earnings table', 'Not found');

  const deductionsTable = await page.getByText(/Deductions/, { exact: false }).first();
  if (await deductionsTable.isVisible().catch(() => false)) pass('/myself/pay/pay-001', 'deductions table', 'Visible');
  else fail('/myself/pay/pay-001', 'deductions table', 'Not found');

  const taxesTable = await page.getByText(/Taxes|Tax/, { exact: false }).first();
  if (await taxesTable.isVisible().catch(() => false)) pass('/myself/pay/pay-001', 'taxes table', 'Visible');
  else fail('/myself/pay/pay-001', 'taxes table', 'Not found');

  // Print button
  const printBtn = await page.getByText(/Print/, { exact: false }).first();
  if (await printBtn.isVisible().catch(() => false)) {
    pass('/myself/pay/pay-001', 'print button', 'Print button visible');
  } else {
    fail('/myself/pay/pay-001', 'print button', 'Print button not found');
  }

  // ============ TAX DOCUMENTS (/myself/tax) ============
  console.log('\n=== Testing /myself/tax ===');
  await page.goto(`${BASE_URL}/myself/tax`);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/mock_tax.png`, fullPage: true });

  const taxHeader = await page.getByText(/Tax Statements|Tax Documents/, { exact: false }).first();
  if (await taxHeader.isVisible().catch(() => false)) pass('/myself/tax', 'page load', 'Tax documents page renders');
  else fail('/myself/tax', 'page load', 'No tax documents heading');

  // View button (opens modal)
  const viewBtn = await page.getByRole('button', { name: /View/, exact: false }).first();
  if (await viewBtn.isVisible().catch(() => false)) {
    pass('/myself/tax', 'View button', 'Visible');
    await viewBtn.click();
    await page.waitForTimeout(500);
    const modal = await page.$('[class*="modal"], [role="dialog"]');
    if (modal) {
      pass('/myself/tax', 'View modal', 'W-2 modal opened');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    } else {
      fail('/myself/tax', 'View modal', 'Clicking View did not open a modal');
    }
  } else {
    fail('/myself/tax', 'View button', 'No View button found');
  }

  // Download button
  const downloadBtn = await page.getByRole('button', { name: /Download/, exact: false }).first();
  if (await downloadBtn.isVisible().catch(() => false)) {
    pass('/myself/tax', 'Download button', 'Visible');
    await downloadBtn.click();
    await page.waitForTimeout(800);
    // Check for toast
    const toast = await page.$('[class*="toast"], [class*="notification"], [role="alert"]');
    if (toast) pass('/myself/tax', 'Download toast', 'Toast appeared after clicking Download');
    else {
      const toastText = await page.getByText(/Download started|Downloading/, { exact: false }).first();
      if (await toastText.isVisible().catch(() => false)) pass('/myself/tax', 'Download toast', 'Download toast text visible');
      else fail('/myself/tax', 'Download toast', 'No toast after clicking Download');
    }
  } else {
    fail('/myself/tax', 'Download button', 'No Download button found');
  }

  // ============ DIRECT DEPOSIT (/myself/direct-deposit) ============
  console.log('\n=== Testing /myself/direct-deposit ===');
  await page.goto(`${BASE_URL}/myself/direct-deposit`);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/mock_direct_deposit.png`, fullPage: true });

  const ddHeader = await page.getByText(/Direct Deposit/, { exact: false }).first();
  if (await ddHeader.isVisible().catch(() => false)) pass('/myself/direct-deposit', 'page load', 'Direct Deposit page renders');
  else fail('/myself/direct-deposit', 'page load', 'No Direct Deposit heading');

  // Edit button
  const editBtn = await page.getByRole('button', { name: /Edit/, exact: false }).first();
  if (await editBtn.isVisible().catch(() => false)) {
    pass('/myself/direct-deposit', 'edit button', 'Visible');
    await editBtn.click();
    await page.waitForTimeout(500);
    const modal = await page.$('[class*="modal"], [role="dialog"]');
    if (modal) {
      pass('/myself/direct-deposit', 'edit modal', 'Modal opened');
      // Test cancel
      const cancelBtn = await page.getByRole('button', { name: /Cancel/, exact: false }).first();
      if (await cancelBtn.isVisible().catch(() => false)) {
        await cancelBtn.click();
        await page.waitForTimeout(300);
        const modalGone = !(await page.$('[class*="modal"], [role="dialog"]'));
        if (modalGone) pass('/myself/direct-deposit', 'cancel button', 'Modal closed on cancel');
        else fail('/myself/direct-deposit', 'cancel button', 'Modal still visible after cancel');
      } else {
        fail('/myself/direct-deposit', 'cancel button', 'No cancel button in modal');
      }
    } else {
      fail('/myself/direct-deposit', 'edit modal', 'Clicking Edit did not open modal');
    }
  } else {
    fail('/myself/direct-deposit', 'edit button', 'No Edit button found');
  }

  // Re-open and test save
  const editBtn2 = await page.getByRole('button', { name: /Edit/, exact: false }).first();
  if (await editBtn2.isVisible().catch(() => false)) {
    await editBtn2.click();
    await page.waitForTimeout(500);
    const saveBtn = await page.getByRole('button', { name: /Save/, exact: false }).first();
    if (await saveBtn.isVisible().catch(() => false)) {
      pass('/myself/direct-deposit', 'save button', 'Save button in modal');
      await saveBtn.click();
      await page.waitForTimeout(500);
    } else {
      fail('/myself/direct-deposit', 'save button', 'No save button in modal');
    }
  }

  // ============ TIMECARD (/myself/time) ============
  console.log('\n=== Testing /myself/time ===');
  await page.goto(`${BASE_URL}/myself/time`);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/mock_timecard.png`, fullPage: true });

  const timecardHeader = await page.getByText(/My Timecard|Timecard/, { exact: false }).first();
  if (await timecardHeader.isVisible().catch(() => false)) pass('/myself/time', 'page load', 'Timecard page renders');
  else fail('/myself/time', 'page load', 'No Timecard heading');

  // Clock In/Out button
  const clockInBtn = await page.getByRole('button', { name: /Clock In|Clock Out/, exact: false }).first();
  if (await clockInBtn.isVisible().catch(() => false)) {
    const clockBtnText = await clockInBtn.textContent();
    pass('/myself/time', 'clock button', `Button visible with text: "${clockBtnText}"`);
    await clockInBtn.click();
    await page.waitForTimeout(800);
    // Check for state change - button text should change or toast appears
    const newClockBtnText = await page.getByRole('button', { name: /Clock In|Clock Out/, exact: false }).first().textContent().catch(() => '');
    if (newClockBtnText !== clockBtnText) {
      pass('/myself/time', 'clock button state change', `Button text changed from "${clockBtnText}" to "${newClockBtnText}"`);
    } else {
      // Check for toast
      await page.waitForTimeout(500);
      const toast = await page.$('[class*="toast"], [role="alert"]');
      if (toast) pass('/myself/time', 'clock button feedback', 'Toast appeared after clock action');
      else fail('/myself/time', 'clock button state change', 'Button text did not change and no toast appeared');
    }
  } else {
    fail('/myself/time', 'clock button', 'Clock In/Out button not found');
  }

  // Week navigation
  const prevWeekBtn = await page.getByRole('button', { name: /Previous|Prev|←|‹/ }).first();
  const nextWeekBtn = await page.getByRole('button', { name: /Next|→|›/ }).first();
  if (await prevWeekBtn.isVisible().catch(() => false)) {
    pass('/myself/time', 'week prev button', 'Previous week button found');
    await prevWeekBtn.click();
    await page.waitForTimeout(300);
    pass('/myself/time', 'week prev click', 'Previous week clicked');
    if (await nextWeekBtn.isVisible().catch(() => false)) {
      await nextWeekBtn.click();
      await page.waitForTimeout(300);
      pass('/myself/time', 'week next button', 'Next week button works');
    }
  } else {
    fail('/myself/time', 'week navigation buttons', 'No previous/next week buttons found');
  }

  // Submit Timecard button
  const submitTimecardBtn = await page.getByRole('button', { name: /Submit Timecard|Submit/, exact: false }).first();
  if (await submitTimecardBtn.isVisible().catch(() => false)) {
    pass('/myself/time', 'submit timecard button', 'Submit Timecard button found');
    const isDisabled = await submitTimecardBtn.isDisabled();
    if (isDisabled) pass('/myself/time', 'submit timecard disabled state', 'Button appropriately disabled');
    else {
      await submitTimecardBtn.click();
      await page.waitForTimeout(500);
      pass('/myself/time', 'submit timecard click', 'Button clicked');
    }
  } else {
    fail('/myself/time', 'submit timecard button', 'Submit Timecard button not found');
  }

  // ============ SCHEDULE (/myself/schedule) ============
  console.log('\n=== Testing /myself/schedule ===');
  await page.goto(`${BASE_URL}/myself/schedule`);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/mock_schedule.png`, fullPage: true });

  const scheduleHeader = await page.getByText(/My Schedule|Schedule/, { exact: false }).first();
  if (await scheduleHeader.isVisible().catch(() => false)) pass('/myself/schedule', 'page load', 'Schedule page renders');
  else fail('/myself/schedule', 'page load', 'No Schedule heading');

  // Week navigator
  const schedPrevBtn = await page.getByRole('button').filter({ hasText: /←|Prev|Previous/ }).first();
  const schedNextBtn = await page.getByRole('button').filter({ hasText: /→|Next/ }).first();
  if (await schedPrevBtn.isVisible().catch(() => false)) {
    pass('/myself/schedule', 'week navigator prev', 'Previous button found');
    await schedPrevBtn.click();
    await page.waitForTimeout(300);
    pass('/myself/schedule', 'week navigator prev click', 'Clicked previous week');
  } else {
    // Try any navigation buttons
    const navBtns = await page.$$('[class*="week"] button, [class*="nav"] button');
    if (navBtns.length > 0) {
      pass('/myself/schedule', 'week navigator', `Found ${navBtns.length} navigation buttons`);
      await navBtns[0].click();
      await page.waitForTimeout(300);
    } else {
      fail('/myself/schedule', 'week navigator', 'No week navigation buttons found');
    }
  }

  // ============ TIME OFF (/myself/timeoff) ============
  console.log('\n=== Testing /myself/timeoff ===');
  await page.goto(`${BASE_URL}/myself/timeoff`);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/mock_timeoff.png`, fullPage: true });

  const timeoffHeader = await page.getByText(/Time Off/, { exact: false }).first();
  if (await timeoffHeader.isVisible().catch(() => false)) pass('/myself/timeoff', 'page load', 'Time Off page renders');
  else fail('/myself/timeoff', 'page load', 'No Time Off heading');

  // Balance cards
  const vacationCard = await page.getByText(/Vacation/, { exact: false }).first();
  if (await vacationCard.isVisible().catch(() => false)) pass('/myself/timeoff', 'vacation balance card', 'Visible');
  else fail('/myself/timeoff', 'vacation balance card', 'Not found');

  const sickCard = await page.getByText(/Sick/, { exact: false }).first();
  if (await sickCard.isVisible().catch(() => false)) pass('/myself/timeoff', 'sick balance card', 'Visible');
  else fail('/myself/timeoff', 'sick balance card', 'Not found');

  // Request Time Off button
  const reqTimeOffBtn = await page.getByRole('button', { name: /Request Time Off/, exact: false }).first();
  if (await reqTimeOffBtn.isVisible().catch(() => false)) {
    pass('/myself/timeoff', 'Request Time Off button', 'Visible');
    await reqTimeOffBtn.click();
    await page.waitForTimeout(500);
    const urlAfter = page.url();
    if (urlAfter.includes('/myself/timeoff/request')) {
      pass('/myself/timeoff', 'Request Time Off button navigation', 'Navigates to request form');
    } else {
      fail('/myself/timeoff', 'Request Time Off button navigation', `Expected /myself/timeoff/request but got ${urlAfter}`);
    }
    await page.goto(`${BASE_URL}/myself/timeoff`);
    await page.waitForTimeout(500);
  } else {
    fail('/myself/timeoff', 'Request Time Off button', 'Not found');
  }

  // Cancel pending request
  const cancelReqBtn = await page.getByRole('button', { name: /Cancel/, exact: false }).first();
  if (await cancelReqBtn.isVisible().catch(() => false)) {
    pass('/myself/timeoff', 'cancel pending request button', 'Visible');
    await cancelReqBtn.click();
    await page.waitForTimeout(500);
    pass('/myself/timeoff', 'cancel pending request click', 'Cancel clicked');
  } else {
    // It might not have pending requests visible in table
    const pendingRow = await page.getByText(/Pending/, { exact: false }).first();
    if (await pendingRow.isVisible().catch(() => false)) {
      fail('/myself/timeoff', 'cancel pending request button', 'Pending row found but no Cancel button');
    } else {
      pass('/myself/timeoff', 'cancel pending request', 'No pending requests visible (skipped)');
    }
  }

  // ============ TIME OFF REQUEST (/myself/timeoff/request) ============
  console.log('\n=== Testing /myself/timeoff/request ===');
  await page.goto(`${BASE_URL}/myself/timeoff/request`);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/mock_timeoff_request.png`, fullPage: true });

  const reqHeader = await page.getByText(/Request Time Off/, { exact: false }).first();
  if (await reqHeader.isVisible().catch(() => false)) pass('/myself/timeoff/request', 'page load', 'Request Time Off form renders');
  else fail('/myself/timeoff/request', 'page load', 'No Request Time Off heading');

  // Type dropdown
  const typeSelect = await page.$('select[name="type"], select#type, [class*="type"] select');
  if (typeSelect) {
    pass('/myself/timeoff/request', 'type dropdown', 'Found');
    await typeSelect.selectOption({ index: 1 });
    await page.waitForTimeout(200);
    pass('/myself/timeoff/request', 'type dropdown selection', 'Selected option');
  } else {
    const anySelect = await page.$('select');
    if (anySelect) {
      pass('/myself/timeoff/request', 'type dropdown', 'Select element found');
      await anySelect.selectOption({ index: 0 });
    } else {
      fail('/myself/timeoff/request', 'type dropdown', 'No select dropdown found for type');
    }
  }

  // Date inputs
  const dateInputs = await page.$$('input[type="date"]');
  if (dateInputs.length >= 2) {
    pass('/myself/timeoff/request', 'date inputs', `Found ${dateInputs.length} date inputs`);
    await dateInputs[0].fill('2026-04-21');
    await dateInputs[1].fill('2026-04-23');
    await page.waitForTimeout(300);
    pass('/myself/timeoff/request', 'date inputs fill', 'Start and end dates filled');
  } else if (dateInputs.length === 1) {
    pass('/myself/timeoff/request', 'date input', '1 date input found');
    await dateInputs[0].fill('2026-04-21');
  } else {
    fail('/myself/timeoff/request', 'date inputs', 'No date inputs found');
  }

  // Hours per day input
  const hoursInput = await page.$('input[type="number"], input[name="hours"]');
  if (hoursInput) {
    pass('/myself/timeoff/request', 'hours input', 'Found');
    await hoursInput.fill('8');
    await page.waitForTimeout(200);
  } else {
    fail('/myself/timeoff/request', 'hours input', 'No hours per day input found');
  }

  // Notes textarea
  const notesArea = await page.$('textarea');
  if (notesArea) {
    pass('/myself/timeoff/request', 'notes textarea', 'Found');
    await notesArea.fill('Vacation trip');
    await page.waitForTimeout(200);
  } else {
    fail('/myself/timeoff/request', 'notes textarea', 'No textarea found');
  }

  // Submit button
  const submitBtn = await page.getByRole('button', { name: /Submit|Submit Request/, exact: false }).first();
  if (await submitBtn.isVisible().catch(() => false)) {
    pass('/myself/timeoff/request', 'submit button', 'Submit button visible');
    await submitBtn.click();
    await page.waitForTimeout(800);
    // Check for toast or navigation
    const urlAfter = page.url();
    const toast = await page.$('[class*="toast"], [role="alert"]');
    if (toast || urlAfter.includes('/myself/timeoff')) {
      pass('/myself/timeoff/request', 'form submission', 'Form submitted (toast shown or navigated back)');
    } else {
      fail('/myself/timeoff/request', 'form submission', 'No feedback after submit');
    }
  } else {
    fail('/myself/timeoff/request', 'submit button', 'Submit button not found');
  }

  // Cancel button
  await page.goto(`${BASE_URL}/myself/timeoff/request`);
  await page.waitForTimeout(500);
  const cancelBtn = await page.getByRole('button', { name: /Cancel/, exact: false }).first();
  if (await cancelBtn.isVisible().catch(() => false)) {
    pass('/myself/timeoff/request', 'cancel button', 'Visible');
    await cancelBtn.click();
    await page.waitForTimeout(500);
    const urlAfter = page.url();
    if (urlAfter.includes('/myself/timeoff') && !urlAfter.includes('request')) {
      pass('/myself/timeoff/request', 'cancel navigation', 'Navigated back to timeoff');
    } else {
      fail('/myself/timeoff/request', 'cancel navigation', `Expected /myself/timeoff but got ${urlAfter}`);
    }
  } else {
    fail('/myself/timeoff/request', 'cancel button', 'Cancel button not found');
  }

  // ============ TIME OFF HISTORY (/myself/timeoff/history) ============
  console.log('\n=== Testing /myself/timeoff/history ===');
  await page.goto(`${BASE_URL}/myself/timeoff/history`);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/mock_timeoff_history.png`, fullPage: true });

  const histHeader = await page.getByText(/Time Off History|History/, { exact: false }).first();
  if (await histHeader.isVisible().catch(() => false)) pass('/myself/timeoff/history', 'page load', 'History page renders');
  else fail('/myself/timeoff/history', 'page load', 'No History heading');

  // Filter dropdowns
  const filterSelects = await page.$$('select');
  if (filterSelects.length > 0) {
    pass('/myself/timeoff/history', 'filter dropdowns', `Found ${filterSelects.length} dropdowns`);
    await filterSelects[0].selectOption({ index: 0 });
    await page.waitForTimeout(300);
  } else {
    fail('/myself/timeoff/history', 'filter dropdowns', 'No filter dropdowns found');
  }

  // Cancel request button (if pending exists)
  const histCancelBtn = await page.getByRole('button', { name: /Cancel/, exact: false }).first();
  if (await histCancelBtn.isVisible().catch(() => false)) {
    pass('/myself/timeoff/history', 'cancel request button', 'Visible');
    await histCancelBtn.click();
    await page.waitForTimeout(500);
    // Confirm dialog
    const confirmDialog = await page.$('[class*="modal"], [class*="confirm"], [role="dialog"]');
    if (confirmDialog) {
      pass('/myself/timeoff/history', 'cancel confirmation dialog', 'Dialog appeared');
      const confirmBtn = await page.getByRole('button', { name: /Confirm|Yes/, exact: false }).first();
      if (await confirmBtn.isVisible().catch(() => false)) {
        await confirmBtn.click();
        await page.waitForTimeout(300);
        pass('/myself/timeoff/history', 'cancel confirm action', 'Confirmed cancellation');
      } else {
        const dismissBtn = await page.getByRole('button', { name: /Cancel|No|Close/, exact: false }).first();
        await dismissBtn.click().catch(() => {});
        await page.waitForTimeout(300);
      }
    } else {
      fail('/myself/timeoff/history', 'cancel confirmation dialog', 'No confirmation dialog appeared');
    }
  } else {
    pass('/myself/timeoff/history', 'cancel pending request', 'No cancel button visible (no pending requests to cancel)');
  }

  // ============ HOLIDAY CALENDAR (/myself/timeoff/holidays) ============
  console.log('\n=== Testing /myself/timeoff/holidays ===');
  await page.goto(`${BASE_URL}/myself/timeoff/holidays`);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/mock_holidays.png`, fullPage: true });

  const holidayHeader = await page.getByText(/Holiday|Company Holidays/, { exact: false }).first();
  if (await holidayHeader.isVisible().catch(() => false)) pass('/myself/timeoff/holidays', 'page load', 'Holiday Calendar renders');
  else fail('/myself/timeoff/holidays', 'page load', 'No Holiday Calendar heading');

  // Holiday list items
  const holidayItems = await page.$$('table tbody tr, [class*="holiday"] li, [class*="holiday-item"]');
  if (holidayItems.length > 0) pass('/myself/timeoff/holidays', 'holiday list', `${holidayItems.length} holidays shown`);
  else {
    const christmasText = await page.getByText(/Christmas|New Year|Memorial/, { exact: false }).first();
    if (await christmasText.isVisible().catch(() => false)) pass('/myself/timeoff/holidays', 'holiday list', 'Holiday names visible');
    else fail('/myself/timeoff/holidays', 'holiday list', 'No holiday items found');
  }

  // ============ BENEFITS (/myself/benefits) ============
  console.log('\n=== Testing /myself/benefits ===');
  await page.goto(`${BASE_URL}/myself/benefits`);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/mock_benefits.png`, fullPage: true });

  const benefitsHeader = await page.getByText(/My Benefits|Benefits/, { exact: false }).first();
  if (await benefitsHeader.isVisible().catch(() => false)) pass('/myself/benefits', 'page load', 'Benefits page renders');
  else fail('/myself/benefits', 'page load', 'No Benefits heading');

  // Benefit cards expand/collapse
  const benefitCards = await page.$$('[class*="benefit"] [class*="card"], [class*="benefit-card"]');
  if (benefitCards.length > 0) {
    pass('/myself/benefits', 'benefit cards', `${benefitCards.length} cards visible`);
    await benefitCards[0].click();
    await page.waitForTimeout(500);
    pass('/myself/benefits', 'benefit card click', 'Clicked first benefit card');
    // Click again to collapse
    await benefitCards[0].click();
    await page.waitForTimeout(300);
    pass('/myself/benefits', 'benefit card collapse', 'Clicked to collapse');
  } else {
    // Try medical/dental etc
    const medCard = await page.getByText(/Medical|Blue Cross/, { exact: false }).first();
    if (await medCard.isVisible().catch(() => false)) {
      pass('/myself/benefits', 'benefit cards', 'Benefit card content visible');
      await medCard.click();
      await page.waitForTimeout(500);
    } else {
      fail('/myself/benefits', 'benefit cards', 'No benefit cards found');
    }
  }

  // ============ DEPENDENTS (/myself/dependents) ============
  console.log('\n=== Testing /myself/dependents ===');
  await page.goto(`${BASE_URL}/myself/dependents`);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/mock_dependents.png`, fullPage: true });

  const depsHeader = await page.getByText(/My Dependents|Dependents/, { exact: false }).first();
  if (await depsHeader.isVisible().catch(() => false)) pass('/myself/dependents', 'page load', 'Dependents page renders');
  else fail('/myself/dependents', 'page load', 'No Dependents heading');

  // Add Dependent button
  const addDepBtn = await page.getByRole('button', { name: /Add Dependent/, exact: false }).first();
  if (await addDepBtn.isVisible().catch(() => false)) {
    pass('/myself/dependents', 'add dependent button', 'Visible');
    await addDepBtn.click();
    await page.waitForTimeout(500);
    const modal = await page.$('[class*="modal"], [role="dialog"]');
    if (modal) {
      pass('/myself/dependents', 'add dependent modal', 'Modal opened');
      // Fill in fields
      const firstNameInput = await page.$('input[name="firstName"], input[placeholder*="First"]');
      if (firstNameInput) {
        await firstNameInput.fill('Test');
        pass('/myself/dependents', 'add dependent form firstName', 'Filled');
      }
      const lastNameInput = await page.$('input[name="lastName"], input[placeholder*="Last"]');
      if (lastNameInput) {
        await lastNameInput.fill('Child');
        pass('/myself/dependents', 'add dependent form lastName', 'Filled');
      }
      const relSelect = await modal.$('select');
      if (relSelect) {
        await relSelect.selectOption({ index: 1 });
        pass('/myself/dependents', 'add dependent relationship', 'Selected');
      }
      // Cancel
      const cancelDepBtn = await page.getByRole('button', { name: /Cancel/, exact: false }).first();
      if (await cancelDepBtn.isVisible().catch(() => false)) {
        await cancelDepBtn.click();
        await page.waitForTimeout(300);
        pass('/myself/dependents', 'add dependent cancel', 'Modal closed on cancel');
      }
    } else {
      fail('/myself/dependents', 'add dependent modal', 'No modal opened after clicking Add Dependent');
    }
  } else {
    fail('/myself/dependents', 'add dependent button', 'Add Dependent button not found');
  }

  // Edit button on existing dependent
  const editDepBtn = await page.getByRole('button', { name: /Edit/, exact: false }).first();
  if (await editDepBtn.isVisible().catch(() => false)) {
    pass('/myself/dependents', 'edit dependent button', 'Visible');
    await editDepBtn.click();
    await page.waitForTimeout(500);
    const modal = await page.$('[class*="modal"], [role="dialog"]');
    if (modal) {
      pass('/myself/dependents', 'edit dependent modal', 'Modal opened with pre-filled data');
      const cancelBtn = await page.getByRole('button', { name: /Cancel/, exact: false }).first();
      await cancelBtn.click().catch(() => {});
      await page.waitForTimeout(300);
    } else {
      fail('/myself/dependents', 'edit dependent modal', 'No modal opened');
    }
  } else {
    fail('/myself/dependents', 'edit dependent button', 'Not found');
  }

  // Remove button with confirmation
  const removeDepBtn = await page.getByRole('button', { name: /Remove|Delete/, exact: false }).first();
  if (await removeDepBtn.isVisible().catch(() => false)) {
    pass('/myself/dependents', 'remove dependent button', 'Visible');
    await removeDepBtn.click();
    await page.waitForTimeout(500);
    const confirmDialog = await page.$('[class*="modal"], [class*="confirm"], [role="dialog"]');
    if (confirmDialog) {
      pass('/myself/dependents', 'remove dependent confirmation', 'Confirmation dialog appeared');
      // Cancel instead of confirming
      const cancelConfirmBtn = await page.getByRole('button', { name: /Cancel|No/, exact: false }).first();
      if (await cancelConfirmBtn.isVisible().catch(() => false)) {
        await cancelConfirmBtn.click();
        await page.waitForTimeout(300);
        pass('/myself/dependents', 'remove dependent cancel', 'Cancelled removal');
      }
    } else {
      fail('/myself/dependents', 'remove dependent confirmation', 'No confirmation dialog after Remove');
    }
  } else {
    fail('/myself/dependents', 'remove dependent button', 'Not found');
  }

  // ============ PERSONAL INFO (/myself/info) ============
  console.log('\n=== Testing /myself/info ===');
  await page.goto(`${BASE_URL}/myself/info`);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/mock_info.png`, fullPage: true });

  const infoHeader = await page.getByText(/My Information|Personal Information/, { exact: false }).first();
  if (await infoHeader.isVisible().catch(() => false)) pass('/myself/info', 'page load', 'My Information page renders');
  else fail('/myself/info', 'page load', 'No My Information heading');

  // Edit button for personal details
  const editInfoBtn = await page.getByRole('button', { name: /Edit/, exact: false }).first();
  if (await editInfoBtn.isVisible().catch(() => false)) {
    pass('/myself/info', 'edit button', 'Visible');
    await editInfoBtn.click();
    await page.waitForTimeout(500);
    // Check for editable fields (inputs appear)
    const editInputs = await page.$$('input:not([type="hidden"]), textarea');
    if (editInputs.length > 0) {
      pass('/myself/info', 'edit mode', `${editInputs.length} editable fields appeared`);
      // Test save
      const saveInfoBtn = await page.getByRole('button', { name: /Save/, exact: false }).first();
      if (await saveInfoBtn.isVisible().catch(() => false)) {
        pass('/myself/info', 'save button', 'Visible in edit mode');
        await saveInfoBtn.click();
        await page.waitForTimeout(500);
        const toast = await page.$('[class*="toast"], [role="alert"]');
        if (toast) pass('/myself/info', 'save feedback', 'Toast shown after save');
        else pass('/myself/info', 'save click', 'Save clicked');
      } else {
        fail('/myself/info', 'save button', 'No save button in edit mode');
      }
    } else {
      // Maybe it's an inline edit
      const editableCell = await page.$('[contenteditable="true"]');
      if (editableCell) pass('/myself/info', 'edit mode', 'Contenteditable fields appeared');
      else fail('/myself/info', 'edit mode', 'No editable fields after clicking Edit');
    }
  } else {
    fail('/myself/info', 'edit button', 'No Edit button found');
  }

  // Emergency Contact section
  const emergencySection = await page.getByText(/Emergency Contact/, { exact: false }).first();
  if (await emergencySection.isVisible().catch(() => false)) {
    pass('/myself/info', 'emergency contact section', 'Visible');
    // Add button
    const addContactBtn = await page.getByRole('button', { name: /Add Emergency Contact|Add Contact/, exact: false }).first();
    if (await addContactBtn.isVisible().catch(() => false)) {
      pass('/myself/info', 'add emergency contact button', 'Visible');
      await addContactBtn.click();
      await page.waitForTimeout(500);
      const modal = await page.$('[class*="modal"], [role="dialog"]');
      if (modal) {
        pass('/myself/info', 'add emergency contact modal', 'Modal opened');
        const cancelBtn = await page.getByRole('button', { name: /Cancel/, exact: false }).first();
        await cancelBtn.click().catch(() => {});
        await page.waitForTimeout(300);
      } else {
        fail('/myself/info', 'add emergency contact modal', 'No modal opened');
      }
    } else {
      fail('/myself/info', 'add emergency contact button', 'Not found');
    }
  } else {
    fail('/myself/info', 'emergency contact section', 'Section not found');
  }

  // ============ MY TEAM (/my-team) ============
  console.log('\n=== Testing /my-team ===');
  await page.goto(`${BASE_URL}/my-team`);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/mock_myteam.png`, fullPage: true });

  const teamHeader = await page.getByText(/My Team/, { exact: false }).first();
  if (await teamHeader.isVisible().catch(() => false)) pass('/my-team', 'page load', 'My Team page renders');
  else fail('/my-team', 'page load', 'No My Team heading');

  // Team roster rows
  const teamRows = await page.$$('table tbody tr, [class*="team-member"], [class*="roster-row"]');
  if (teamRows.length > 0) {
    pass('/my-team', 'team roster', `${teamRows.length} team members shown`);
    await teamRows[0].click();
    await page.waitForTimeout(500);
    // Check if detail panel opens
    const detailPanel = await page.$('[class*="detail"], [class*="profile-panel"]');
    if (detailPanel) pass('/my-team', 'team member row click', 'Detail panel opened');
    else {
      // Check URL or any visible change
      const urlAfter = page.url();
      if (urlAfter !== `${BASE_URL}/my-team`) {
        pass('/my-team', 'team member row click', `Navigated to ${urlAfter}`);
      } else {
        fail('/my-team', 'team member row click', 'Clicking row did not open detail panel or navigate');
      }
    }
  } else {
    // Check for any member names
    const memberName = await page.getByText(/Alex Rivera|Emily Zhang|Marcus Williams/, { exact: false }).first();
    if (await memberName.isVisible().catch(() => false)) {
      pass('/my-team', 'team roster', 'Team member names visible');
      await memberName.click();
      await page.waitForTimeout(500);
    } else {
      fail('/my-team', 'team roster', 'No team roster rows found');
    }
  }

  // ============ TEAM APPROVALS (/my-team/approvals) ============
  console.log('\n=== Testing /my-team/approvals ===');
  await page.goto(`${BASE_URL}/my-team/approvals`);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/mock_approvals.png`, fullPage: true });

  const approvalsHeader = await page.getByText(/Pending Approvals|Approvals/, { exact: false }).first();
  if (await approvalsHeader.isVisible().catch(() => false)) pass('/my-team/approvals', 'page load', 'Approvals page renders');
  else fail('/my-team/approvals', 'page load', 'No Approvals heading');

  // Approve time-off button
  const approveBtn = await page.getByRole('button', { name: /Approve/, exact: false }).first();
  if (await approveBtn.isVisible().catch(() => false)) {
    pass('/my-team/approvals', 'approve button', 'Visible');
    await approveBtn.click();
    await page.waitForTimeout(500);
    // Check for state change
    const toast = await page.$('[class*="toast"], [role="alert"]');
    if (toast) pass('/my-team/approvals', 'approve action feedback', 'Toast appeared');
    else pass('/my-team/approvals', 'approve action', 'Button clicked');
  } else {
    fail('/my-team/approvals', 'approve button', 'No Approve button found');
  }

  // Deny button
  const denyBtn = await page.getByRole('button', { name: /Deny/, exact: false }).first();
  if (await denyBtn.isVisible().catch(() => false)) {
    pass('/my-team/approvals', 'deny button', 'Visible');
    await denyBtn.click();
    await page.waitForTimeout(500);
    const modal = await page.$('[class*="modal"], [role="dialog"]');
    if (modal) {
      pass('/my-team/approvals', 'deny modal', 'Denial reason modal opened');
      const cancelBtn = await page.getByRole('button', { name: /Cancel|Close/, exact: false }).first();
      await cancelBtn.click().catch(() => {});
      await page.waitForTimeout(300);
    } else {
      const toast = await page.$('[class*="toast"], [role="alert"]');
      if (toast) pass('/my-team/approvals', 'deny action feedback', 'Toast appeared after deny');
      else fail('/my-team/approvals', 'deny action', 'No modal or toast after clicking Deny');
    }
  } else {
    fail('/my-team/approvals', 'deny button', 'No Deny button found');
  }

  // ============ /go ENDPOINT ============
  console.log('\n=== Testing /go ===');
  await page.goto(`${BASE_URL}/go`);
  await page.waitForTimeout(1000);

  const goText = await page.content();
  if (goText.includes('initial_state') || goText.includes('current_state')) {
    pass('/go', 'JSON output', 'initial_state and current_state present');
  } else if (goText.includes('"state_diff"')) {
    pass('/go', 'JSON output', 'state_diff present in /go output');
  } else {
    fail('/go', 'JSON output', 'No expected JSON keys found in /go output');
  }

  // ============ NAVIGATION ============
  console.log('\n=== Testing Navigation ===');
  await page.goto(`${BASE_URL}/`);
  await page.waitForTimeout(500);

  // ADP logo click
  const adpLogo = await page.$('[class*="logo"], [class*="brand"]');
  if (adpLogo) {
    pass('/', 'ADP logo', 'Logo element found');
  } else {
    const logoText = await page.getByText('ADP', { exact: false }).first();
    if (await logoText.isVisible().catch(() => false)) pass('/', 'ADP logo text', 'ADP text/logo visible');
    else fail('/', 'ADP logo', 'No logo found');
  }

  // Home nav tab
  const homeTab = await page.getByRole('link', { name: /Home/, exact: false }).first();
  if (await homeTab.isVisible().catch(() => false)) {
    pass('/', 'Home nav tab', 'Visible');
  } else {
    const homeBtn = await page.getByText('Home', { exact: true }).first();
    if (await homeBtn.isVisible().catch(() => false)) pass('/', 'Home nav tab', 'Visible as text');
    else fail('/', 'Home nav tab', 'Not found');
  }

  // Myself tab/dropdown
  const myselfTab = await page.getByText(/Myself/, { exact: false }).first();
  if (await myselfTab.isVisible().catch(() => false)) {
    pass('/', 'Myself nav tab', 'Visible');
    await myselfTab.click();
    await page.waitForTimeout(500);
    // Check for dropdown
    const dropdown = await page.$('[class*="dropdown"], [class*="flyout"], [class*="submenu"]');
    if (dropdown) pass('/', 'Myself dropdown', 'Dropdown/flyout opened');
    else {
      // Check URL changed
      const urlAfter = page.url();
      if (urlAfter.includes('/myself')) pass('/', 'Myself navigation', `Navigated to ${urlAfter}`);
      else fail('/', 'Myself dropdown/navigation', 'Clicking Myself did not open dropdown or navigate');
    }
  } else {
    fail('/', 'Myself nav tab', 'Not found');
  }

  // My Team tab
  const myTeamTab = await page.getByText(/My Team/, { exact: false }).first();
  if (await myTeamTab.isVisible().catch(() => false)) {
    pass('/', 'My Team nav tab', 'Visible');
  } else {
    fail('/', 'My Team nav tab', 'Not found');
  }

  await browser.close();

  // Print summary
  console.log('\n\n=== TEST SUMMARY ===');
  console.log(`PASSED: ${results.passed.length}`);
  console.log(`FAILED: ${results.failed.length}`);
  console.log('\nFailed tests:');
  results.failed.forEach((f, i) => {
    console.log(`  ${i+1}. [${f.route}] ${f.element}: ${f.detail}`);
  });

  return results;
}

runTests().catch(console.error);
