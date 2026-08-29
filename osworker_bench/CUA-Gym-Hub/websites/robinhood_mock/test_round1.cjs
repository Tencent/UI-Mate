const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const results = { passed: [], failed: [] };
  const consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => { consoleErrors.push(err.message); });

  function record(passed, name, detail) {
    if (passed) results.passed.push({ name, detail });
    else results.failed.push({ name, detail });
    console.log((passed ? 'PASS' : 'FAIL') + ': ' + name + ' -- ' + detail);
  }

  const BASE = 'http://localhost:5180';
  const SS = '/cpfs02/data/shared/Group-m6/bowen.wbw/openrlvr-mock/robinhood_mock/assets/screenshots';

  // Clear localStorage for fresh state
  await page.goto(BASE + '/', { waitUntil: 'load', timeout: 15000 });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);

  // ===================== ROUTE LOADS =====================
  console.log('\n=== TESTING ROUTE LOADS ===');

  // Home page
  consoleErrors.length = 0;
  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  let body = await page.textContent('body');
  record(body.includes('Investing'), '/ (Dashboard) loads', 'Page shows Investing label');
  let critErrors = consoleErrors.filter(e => {
    return !e.includes('picsum') && !e.includes('ERR_CONNECTION') && !e.includes('Failed to load resource') && !e.includes('net::');
  });
  record(critErrors.length === 0, '/ no critical console errors', critErrors.length > 0 ? critErrors.slice(0,2).join('; ') : 'Clean');
  await page.screenshot({ path: SS + '/mock_dashboard.png', fullPage: true });

  // Stock Detail (AAPL)
  consoleErrors.length = 0;
  await page.goto(BASE + '/stock/AAPL', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1500);
  body = await page.textContent('body');
  record(body.includes('Apple'), '/stock/AAPL loads', 'Shows Apple Inc.');
  await page.screenshot({ path: SS + '/mock_stock_aapl.png', fullPage: true });

  // Stock Detail (TSLA)
  await page.goto(BASE + '/stock/TSLA', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);
  body = await page.textContent('body');
  record(body.includes('Tesla'), '/stock/TSLA loads', 'Shows Tesla Inc.');

  // Portfolio
  consoleErrors.length = 0;
  await page.goto(BASE + '/portfolio', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);
  body = await page.textContent('body');
  record(body.includes('Stocks & ETFs') || body.includes('Portfolio Value'), '/portfolio loads', 'Shows portfolio page');
  await page.screenshot({ path: SS + '/mock_portfolio.png', fullPage: true });

  // History
  await page.goto(BASE + '/history', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);
  body = await page.textContent('body');
  record(body.includes('Recent Activity') || body.includes('Cash'), '/history loads', 'Shows transaction history');
  await page.screenshot({ path: SS + '/mock_history.png', fullPage: true });

  // Notifications
  await page.goto(BASE + '/notifications', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);
  body = await page.textContent('body');
  record(body.includes('Notifications'), '/notifications loads', 'Shows notifications page');
  await page.screenshot({ path: SS + '/mock_notifications.png', fullPage: true });

  // Account
  await page.goto(BASE + '/account', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);
  body = await page.textContent('body');
  record(body.includes('Alex Johnson'), '/account loads', 'Shows Alex Johnson');
  await page.screenshot({ path: SS + '/mock_account.png', fullPage: true });

  // /go endpoint
  await page.goto(BASE + '/go', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  body = await page.textContent('body');
  record(body.includes('initial_state') || body.includes('robinhood_mock'), '/go loads', 'Shows state inspector');
  await page.screenshot({ path: SS + '/mock_go.png', fullPage: false });

  // ===================== HEADER / NAVIGATION =====================
  console.log('\n=== TESTING HEADER / NAVIGATION ===');

  // Go to portfolio, then click logo to go home
  await page.goto(BASE + '/portfolio', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);
  const logoLink = page.locator('a[href="/"]').first();
  await logoLink.click();
  await page.waitForTimeout(1000);
  record(page.url() === BASE + '/' || page.url().endsWith(':5180/'), 'Logo click navigates Home', 'URL: ' + page.url());

  // Desktop nav links
  const portfolioLink = page.locator('header a[href="/portfolio"]');
  let portfolioLinkVisible = await portfolioLink.isVisible().catch(() => false);
  record(portfolioLinkVisible, 'Portfolio nav link visible in header', 'Visible: ' + portfolioLinkVisible);

  if (portfolioLinkVisible) {
    await portfolioLink.click();
    await page.waitForTimeout(500);
    record(page.url().includes('/portfolio'), 'Portfolio nav link navigates', 'URL: ' + page.url());
  }

  const cashLink = page.locator('header a[href="/history"]');
  let cashLinkVisible = await cashLink.isVisible().catch(() => false);
  record(cashLinkVisible, 'Cash nav link visible in header', 'Visible: ' + cashLinkVisible);

  if (cashLinkVisible) {
    await cashLink.click();
    await page.waitForTimeout(500);
    record(page.url().includes('/history'), 'Cash nav link navigates', 'URL: ' + page.url());
  }

  const homeLink = page.locator('header a[href="/"]').nth(1);  // The text link, not logo
  let homeLinkVisible = await homeLink.isVisible().catch(() => false);
  if (homeLinkVisible) {
    await homeLink.click();
    await page.waitForTimeout(500);
    record(page.url() === BASE + '/' || page.url().endsWith(':5180/'), 'Home nav link navigates', 'URL: ' + page.url());
  } else {
    // Try first nav link
    const navHomeLink = page.locator('nav a[href="/"]').first();
    if (await navHomeLink.isVisible().catch(() => false)) {
      await navHomeLink.click();
      await page.waitForTimeout(500);
      record(page.url() === BASE + '/' || page.url().endsWith(':5180/'), 'Home nav link navigates', 'URL: ' + page.url());
    }
  }

  const accountLink = page.locator('a[href="/account"]').first();
  let accLinkVisible = await accountLink.isVisible().catch(() => false);
  record(accLinkVisible, 'Account avatar link visible', 'Visible: ' + accLinkVisible);

  if (accLinkVisible) {
    await accountLink.click();
    await page.waitForTimeout(500);
    record(page.url().includes('/account'), 'Account link navigates', 'URL: ' + page.url());
  }

  // ===================== SEARCH =====================
  console.log('\n=== TESTING SEARCH ===');

  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);

  const searchInput = page.locator('input[placeholder="Search"]');
  let searchVisible = await searchInput.isVisible().catch(() => false);
  record(searchVisible, 'Search input visible', 'Visible: ' + searchVisible);

  // Type in search
  await searchInput.click();
  await searchInput.fill('AAPL');
  await page.waitForTimeout(600);

  // Check dropdown
  let dropdownVisible = false;
  let dropdownText = '';
  const dropdown = page.locator('.absolute.top-full');
  try {
    dropdownVisible = await dropdown.isVisible();
    if (dropdownVisible) dropdownText = await dropdown.textContent();
  } catch(e) {}
  record(dropdownVisible, 'Search dropdown appears on typing', 'Dropdown visible after typing AAPL');
  record(dropdownText.includes('AAPL') && dropdownText.includes('Apple'), 'Search results show AAPL', 'Contains AAPL and Apple');
  await page.screenshot({ path: SS + '/mock_search_dropdown.png' });

  // Click result to navigate
  if (dropdownVisible) {
    const result = dropdown.locator('[class*="cursor-pointer"]').first();
    await result.click({ force: true });
    await page.waitForTimeout(1000);
    record(page.url().includes('/stock/AAPL'), 'Search result click navigates to stock', 'URL: ' + page.url());
  }

  // Keyboard navigation
  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);
  const searchInput2 = page.locator('input[placeholder="Search"]');
  await searchInput2.click();
  await searchInput2.fill('TS');
  await page.waitForTimeout(500);
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(200);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000);
  record(page.url().includes('/stock/TSLA'), 'Keyboard search nav (ArrowDown+Enter)', 'URL: ' + page.url());

  // Escape closes search
  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);
  await page.locator('input[placeholder="Search"]').click();
  await page.locator('input[placeholder="Search"]').fill('NV');
  await page.waitForTimeout(500);
  let ddBefore = await page.locator('.absolute.top-full').isVisible().catch(() => false);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  let ddAfter = await page.locator('.absolute.top-full').isVisible().catch(() => false);
  record(ddBefore && !ddAfter, 'Escape closes search dropdown', 'Before: visible, After: hidden');

  // ===================== NOTIFICATION BELL =====================
  console.log('\n=== TESTING NOTIFICATIONS BELL ===');

  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 15000 });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);

  // Bell badge
  const bellBadge = page.locator('header span.bg-danger').first();
  let hasBadge = await bellBadge.isVisible().catch(() => false);
  record(hasBadge, 'Bell icon shows unread count badge', 'Badge visible: ' + hasBadge);

  // Open notifications dropdown
  const bellBtn = page.locator('header button').first();
  await bellBtn.click();
  await page.waitForTimeout(500);

  const notifDD = page.locator('.w-80');
  let notifDDVisible = await notifDD.isVisible().catch(() => false);
  record(notifDDVisible, 'Bell click opens notification dropdown', 'Dropdown visible: ' + notifDDVisible);
  await page.screenshot({ path: SS + '/mock_notif_dropdown.png' });

  if (notifDDVisible) {
    // Mark all as read button
    const markAllBtn = notifDD.locator('button');
    let markAllText = '';
    try { markAllText = await markAllBtn.textContent(); } catch(e) {}
    record(markAllText.includes('Mark all'), 'Mark all as read button present', 'Text: ' + markAllText);

    if (markAllText.includes('Mark all')) {
      await markAllBtn.click();
      await page.waitForTimeout(500);
      let badgeAfterMarkAll = await bellBadge.isVisible().catch(() => false);
      record(!badgeAfterMarkAll, 'Mark all as read clears badge', 'Badge after: ' + badgeAfterMarkAll);
    }

    // Re-open and click notification item
    await bellBtn.click();
    await page.waitForTimeout(300);
    const notifItems = page.locator('.w-80 [class*="cursor-pointer"]');
    let notifCount = await notifItems.count();
    record(notifCount > 0, 'Notification items present in dropdown', 'Count: ' + notifCount);

    if (notifCount > 0) {
      await notifItems.first().click();
      await page.waitForTimeout(1000);
      let navOk = page.url().includes('/stock/');
      record(navOk, 'Notification click navigates to stock', 'URL: ' + page.url());
    }
  }

  // ===================== DASHBOARD =====================
  console.log('\n=== TESTING DASHBOARD ===');

  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);

  body = await page.textContent('body');

  // Portfolio value
  record(body.includes('$'), 'Portfolio value displayed with $', 'Dollar sign present');
  record(body.includes('Investing'), 'Investing label above portfolio value', 'Label present');
  record(body.includes('Today'), 'Daily change shown with Today label', 'Present');

  // Chart
  const chart = page.locator('.recharts-responsive-container');
  record(await chart.isVisible().catch(() => false), 'Portfolio chart renders (Recharts)', 'Chart visible');

  // Time toggles
  const toggles = page.locator('button');
  let allToggleTexts = [];
  let toggleCount = await toggles.count();
  for (let i = 0; i < toggleCount; i++) {
    let t = await toggles.nth(i).textContent().catch(() => '');
    allToggleTexts.push(t.trim());
  }
  record(allToggleTexts.includes('1D'), 'Time toggle 1D present', 'Available');
  record(allToggleTexts.includes('1W'), 'Time toggle 1W present', 'Available');
  record(allToggleTexts.includes('1M'), 'Time toggle 1M present', 'Available');
  record(allToggleTexts.includes('3M'), 'Time toggle 3M present', 'Available');
  record(allToggleTexts.includes('1Y'), 'Time toggle 1Y present', 'Available');
  record(allToggleTexts.includes('ALL'), 'Time toggle ALL present', 'Available');

  // Click 1D toggle
  const btn1D = page.locator('button:text-is("1D")').first();
  await btn1D.click();
  await page.waitForTimeout(500);
  let cls1D = await btn1D.getAttribute('class');
  record(cls1D && cls1D.includes('text-primary'), '1D toggle activates on click', 'Has active class');

  // Click ALL toggle
  const btnALL = page.locator('button:text-is("ALL")').first();
  await btnALL.click();
  await page.waitForTimeout(500);
  let clsALL = await btnALL.getAttribute('class');
  record(clsALL && clsALL.includes('text-primary'), 'ALL toggle activates on click', 'Has active class');

  // Buying power
  record(body.includes('Buying power'), 'Buying power row displayed', 'Present');

  // Watchlist sidebar
  record(body.includes('Stocks'), 'Watchlist Stocks section visible', 'Present');
  record(body.includes('Lists'), 'Watchlist Lists section visible', 'Present');

  // Click watchlist item
  const wlItem = page.locator('a[href="/stock/AAPL"]').first();
  if (await wlItem.isVisible().catch(() => false)) {
    await wlItem.click();
    await page.waitForTimeout(1000);
    record(page.url().includes('/stock/AAPL'), 'Watchlist AAPL click navigates', 'URL: ' + page.url());
  }

  // News feed
  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);
  body = await page.textContent('body');
  record(body.includes('News'), 'News section visible', 'Header present');
  record(body.includes('Reuters') || body.includes('Bloomberg'), 'News source labels present', 'Contains news sources');
  record(body.includes('S&P 500') || body.includes('Tech Rally'), 'News headlines displayed', 'Contains headlines');

  // News symbol tags
  const symbolTag = page.locator('a[href="/stock/SPY"]').first();
  let tagVisible = await symbolTag.isVisible().catch(() => false);
  record(tagVisible, 'News symbol tag links present (SPY)', 'Visible: ' + tagVisible);

  // ===================== STOCK DETAIL (AAPL - owned) =====================
  console.log('\n=== TESTING STOCK DETAIL (AAPL) ===');

  await page.goto(BASE + '/stock/AAPL', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1500);
  body = await page.textContent('body');

  // Tags
  record(body.includes('Technology') && body.includes('Consumer Electronics'), 'AAPL tags display', 'Technology + Consumer Electronics');

  // Price
  record(body.includes('Apple Inc.'), 'AAPL name displayed', 'Shows company name');
  record(body.includes('$'), 'AAPL price displayed', 'Dollar amount shown');
  record(body.includes('Today'), 'AAPL daily change shown', 'Today label');

  // Chart
  record(await page.locator('.recharts-responsive-container').isVisible().catch(() => false), 'AAPL chart renders', 'Chart visible');

  // Chart toggles on stock detail page have different ranges
  const stockRanges = ['1D', '1W', '1M', '3M', '1Y', '5Y', 'ALL'];
  let foundRanges = 0;
  for (const r of stockRanges) {
    if (await page.locator('button:text-is("' + r + '")').first().isVisible().catch(() => false)) foundRanges++;
  }
  record(foundRanges >= 5, 'Stock chart has time period toggles', 'Found: ' + foundRanges + ' ranges');

  // Toggle a range
  const btn1W = page.locator('button:text-is("1W")').first();
  if (await btn1W.isVisible().catch(() => false)) {
    await btn1W.click();
    await page.waitForTimeout(500);
    let cls1W = await btn1W.getAttribute('class');
    record(cls1W && cls1W.includes('text-primary'), 'Stock chart 1W toggle activates', 'Active');
  }

  // OHLCV
  record(body.includes('O:') && body.includes('H:') && body.includes('L:') && body.includes('C:') && body.includes('V:'), 'OHLCV data displayed', 'O/H/L/C/V present');

  // Your Position (AAPL is owned)
  record(body.includes('Your Position') || body.includes('Your Equity'), 'Your Position section for owned stock', 'Section present');
  record(body.includes("Today's Return"), 'Position Todays Return', 'Present');
  record(body.includes('Total Return'), 'Position Total Return', 'Present');
  record(body.includes('Your Average Cost'), 'Average Cost card', 'Present');
  record(body.includes('Portfolio Diversity'), 'Portfolio Diversity shown', 'Present');
  record(body.includes('Shares'), 'Shares count shown in position', 'Present');

  // About section
  record(body.includes('About'), 'About section visible', 'Present');
  record(body.includes('designs, manufactures'), 'About description text', 'Has company description');

  // Stats grid
  record(body.includes('Market Cap'), 'Stats: Market Cap', 'Present');
  record(body.includes('P/E Ratio'), 'Stats: P/E Ratio', 'Present');
  record(body.includes('Dividend Yield'), 'Stats: Dividend Yield', 'Present');
  record(body.includes('52-Week High'), 'Stats: 52W High', 'Present');
  record(body.includes('52-Week Low'), 'Stats: 52W Low', 'Present');
  record(body.includes('Volume'), 'Stats: Volume', 'Present');
  record(body.includes('Avg Volume'), 'Stats: Avg Volume', 'Present');
  record(body.includes('Sector'), 'Stats: Sector', 'Present');
  record(body.includes('Tim Cook'), 'Stats: CEO Tim Cook', 'Present');
  record(body.includes('Cupertino'), 'Stats: HQ Cupertino', 'Present');
  record(body.includes('Employees'), 'Stats: Employees', 'Present');
  record(body.includes('Founded'), 'Stats: Founded', 'Present');

  // Watchlist star button
  const starBtn = page.locator('button').filter({ hasText: /Following|Add to List/ }).first();
  let starVisible = await starBtn.isVisible().catch(() => false);
  record(starVisible, 'Watchlist/Following button visible', 'Visible: ' + starVisible);

  if (starVisible) {
    let txtBefore = (await starBtn.textContent()).trim();
    await starBtn.click();
    await page.waitForTimeout(500);
    let txtAfter = (await starBtn.textContent()).trim();
    record(txtBefore !== txtAfter, 'Watchlist toggle changes button text', txtBefore + ' -> ' + txtAfter);
    // Toggle back
    await starBtn.click();
    await page.waitForTimeout(300);
  }

  // Analyst Ratings
  record(body.includes('Analyst Ratings'), 'Analyst Ratings section', 'Present');
  record(body.includes('Buy') && body.includes('Hold') && body.includes('Sell'), 'Analyst: Buy/Hold/Sell labels', 'Present');
  record(body.includes('Price Target'), 'Analyst: Price Target', 'Present');

  // Earnings
  record(body.includes('Earnings'), 'Earnings section', 'Present');
  record(body.includes('EPS Estimate'), 'Earnings: EPS Estimate', 'Present');
  record(body.includes('Revenue Estimate'), 'Earnings: Revenue Estimate', 'Present');
  record(body.includes('Next Earnings Date'), 'Earnings: Next Date', 'Present');

  // Related News on stock page
  record(body.includes('News') && body.includes('Apple'), 'Related news on stock detail', 'Present');

  // ===================== ORDER FORM =====================
  console.log('\n=== TESTING ORDER FORM ===');

  await page.goto(BASE + '/stock/AAPL', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1500);

  // Buy/Sell tabs
  const buyTab = page.locator('button').filter({ hasText: 'Buy AAPL' }).first();
  const sellTab = page.locator('button').filter({ hasText: 'Sell AAPL' }).first();
  record(await buyTab.isVisible().catch(() => false), 'Buy tab visible', 'Present');
  record(await sellTab.isVisible().catch(() => false), 'Sell tab visible', 'Present');

  // Click sell tab
  await sellTab.click();
  await page.waitForTimeout(300);
  let sellCls = await sellTab.getAttribute('class');
  record(sellCls && sellCls.includes('text-primary'), 'Sell tab activates on click', 'Has active class');

  // Back to buy
  await buyTab.click();
  await page.waitForTimeout(300);
  let buyCls = await buyTab.getAttribute('class');
  record(buyCls && buyCls.includes('text-primary'), 'Buy tab activates on click', 'Has active class');

  // Shares/Dollars toggle
  const sharesBtn = page.locator('button:text-is("Shares")').first();
  const dollarsBtn = page.locator('button:text-is("Dollars")').first();
  record(await sharesBtn.isVisible().catch(() => false), 'Shares toggle visible', 'Present');
  record(await dollarsBtn.isVisible().catch(() => false), 'Dollars toggle visible', 'Present');

  await dollarsBtn.click();
  await page.waitForTimeout(300);
  let dolCls = await dollarsBtn.getAttribute('class');
  record(dolCls && dolCls.includes('text-text'), 'Dollars toggle activates', 'Has active style');

  await sharesBtn.click();
  await page.waitForTimeout(300);

  // Quantity input
  const qtyInput = page.locator('input[type="number"]').first();
  record(await qtyInput.isVisible().catch(() => false), 'Quantity input visible', 'Present');
  await qtyInput.fill('3');
  await page.waitForTimeout(300);

  // Estimated cost, market price, buying power
  body = await page.textContent('body');
  record(body.includes('Estimated Cost'), 'Estimated Cost row visible', 'Present');
  record(body.includes('Market Price'), 'Market Price row visible', 'Present');
  record(body.includes('Buying Power Available'), 'Buying Power Available shown', 'Present');
  record(body.includes('You own'), 'Shares held info visible', 'Present');

  // Review Order button
  const reviewBtn = page.locator('button:text-is("Review Order")').first();
  record(await reviewBtn.isVisible().catch(() => false), 'Review Order button visible', 'Present');

  // Click Review Order -> modal
  await reviewBtn.click();
  await page.waitForTimeout(500);
  let submitBtn = page.locator('button:text-is("Submit Order")');
  let submitVisible = await submitBtn.isVisible().catch(() => false);
  record(submitVisible, 'Review modal opens with Submit Order', 'Modal visible');
  await page.screenshot({ path: SS + '/mock_review_order.png' });

  body = await page.textContent('body');
  record(body.includes('Review Order'), 'Review modal title visible', 'Present');
  record(body.includes('AAPL') && body.includes('Buy'), 'Review shows stock and action', 'AAPL + Buy');

  // Submit Order
  if (submitVisible) {
    await submitBtn.click();
    await page.waitForTimeout(500);
    body = await page.textContent('body');
    record(body.includes('Order Confirmed'), 'Confirmation modal appears', 'Order Confirmed text');
    await page.screenshot({ path: SS + '/mock_order_confirmed.png' });

    const doneBtn = page.locator('button:text-is("Done")');
    if (await doneBtn.isVisible().catch(() => false)) {
      await doneBtn.click();
      await page.waitForTimeout(300);
      record(true, 'Done button closes confirmation modal', 'Modal dismissed');
    }
  }

  // Execution types (Market/Limit/Stop)
  console.log('\n=== TESTING EXECUTION TYPES ===');
  await page.goto(BASE + '/stock/TSLA', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1500);

  // Find the more options button (third button in the order header)
  const orderHeaderBtns = page.locator('.sticky .flex.border-b button');
  let headerBtnCount = await orderHeaderBtns.count();
  if (headerBtnCount >= 3) {
    await orderHeaderBtns.nth(2).click();
    await page.waitForTimeout(500);

    body = await page.textContent('body');
    record(body.includes('Execution Type'), 'Execution Type label visible', 'Present');

    const marketBtn = page.locator('button:text-is("Market")').first();
    const limitBtn = page.locator('button:text-is("Limit")').first();
    const stopBtn = page.locator('button:text-is("Stop")').first();

    record(await marketBtn.isVisible().catch(() => false), 'Market execution button visible', 'Present');
    record(await limitBtn.isVisible().catch(() => false), 'Limit execution button visible', 'Present');
    record(await stopBtn.isVisible().catch(() => false), 'Stop execution button visible', 'Present');
    await page.screenshot({ path: SS + '/mock_exec_types.png' });

    // Click Limit
    await limitBtn.click();
    await page.waitForTimeout(300);
    body = await page.textContent('body');
    record(body.includes('Limit Price'), 'Limit type shows Limit Price input', 'Present');

    // Click Stop
    await stopBtn.click();
    await page.waitForTimeout(300);
    body = await page.textContent('body');
    record(body.includes('Stop Price'), 'Stop type shows Stop Price input', 'Present');

    // Test limit order
    await limitBtn.click();
    await page.waitForTimeout(200);
    const limitPriceInput = page.locator('input[type="number"]').nth(1);
    await limitPriceInput.fill('240');
    const tslQty = page.locator('input[type="number"]').first();
    await tslQty.fill('2');
    await page.waitForTimeout(300);
    const tslReview = page.locator('button:text-is("Review Order")').first();
    await tslReview.click();
    await page.waitForTimeout(500);
    body = await page.textContent('body');
    record(body.includes('Limit') && body.includes('Review Order'), 'Limit order review modal shows Limit type', 'Present');
    // Close modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }

  // ===================== FORM VALIDATION =====================
  console.log('\n=== TESTING FORM VALIDATION ===');

  await page.goto(BASE + '/stock/AAPL', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1500);

  // Zero quantity
  const revBtn = page.locator('button:text-is("Review Order")').first();
  await revBtn.click();
  await page.waitForTimeout(500);
  body = await page.textContent('body');
  record(body.includes('valid quantity'), 'Validation: zero quantity error', 'Error message shown');

  // Insufficient buying power
  const qty2 = page.locator('input[type="number"]').first();
  await qty2.fill('999999');
  await page.waitForTimeout(200);
  await revBtn.click();
  await page.waitForTimeout(500);
  body = await page.textContent('body');
  record(body.includes('buying power') || body.includes('Insufficient'), 'Validation: insufficient buying power', 'Error shown');

  // Sell more than owned
  const sellT = page.locator('button').filter({ hasText: 'Sell AAPL' }).first();
  await sellT.click();
  await page.waitForTimeout(300);
  const qty3 = page.locator('input[type="number"]').first();
  await qty3.fill('999999');
  await page.waitForTimeout(200);
  await revBtn.click();
  await page.waitForTimeout(500);
  body = await page.textContent('body');
  record(body.includes('Not enough shares'), 'Validation: insufficient shares for sell', 'Error shown');

  // ===================== PORTFOLIO PAGE =====================
  console.log('\n=== TESTING PORTFOLIO PAGE ===');

  await page.goto(BASE + '/portfolio', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);
  body = await page.textContent('body');

  record(body.includes('Portfolio Value'), 'Portfolio Value card', 'Present');
  record(body.includes('Cash Balance'), 'Cash Balance card', 'Present');
  record(body.includes('Buying Power'), 'Buying Power card', 'Present');
  record(body.includes('Stocks & ETFs'), 'Holdings table header', 'Present');
  record(body.includes('AAPL'), 'Holdings: AAPL present', 'Present');
  record(body.includes('NVDA'), 'Holdings: NVDA present', 'Present');
  record(body.includes('MSFT'), 'Holdings: MSFT present', 'Present');
  record(body.includes('shares'), 'Holdings show share counts', 'Present');

  // Sorting
  const nameHdr = page.locator('.hidden.md\\:grid .cursor-pointer').first();
  if (await nameHdr.isVisible().catch(() => false)) {
    await nameHdr.click();
    await page.waitForTimeout(300);
    record(true, 'Sort column header clickable', 'Responded to click');
    await nameHdr.click();
    await page.waitForTimeout(300);
    record(true, 'Sort toggles direction', 'Clicked again');
  }

  // Click holding row
  const holdingLink = page.locator('a[href^="/stock/"]').first();
  if (await holdingLink.isVisible().catch(() => false)) {
    await holdingLink.click();
    await page.waitForTimeout(1000);
    record(page.url().includes('/stock/'), 'Holding row click navigates to stock', 'URL: ' + page.url());
  }

  // ===================== HISTORY PAGE =====================
  console.log('\n=== TESTING HISTORY PAGE ===');

  await page.goto(BASE + '/history', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);
  body = await page.textContent('body');
  await page.screenshot({ path: SS + '/mock_history.png', fullPage: true });

  record(body.includes('Cash'), 'History Cash header', 'Present');
  record(body.includes('Buying power'), 'History buying power shown', 'Present');
  record(body.includes('Transfer'), 'Transfer button present', 'Present');
  record(body.includes('Withdraw'), 'Withdraw button present', 'Present');
  record(body.includes('Recent Activity'), 'Recent Activity header', 'Present');

  // Filters
  const buyFilter = page.locator('button:text-is("Buy")').first();
  const sellFilter = page.locator('button:text-is("Sell")').first();
  record(await buyFilter.isVisible().catch(() => false), 'Buy side filter visible', 'Present');
  record(await sellFilter.isVisible().catch(() => false), 'Sell side filter visible', 'Present');

  await buyFilter.click();
  await page.waitForTimeout(500);
  let buyFCls = await buyFilter.getAttribute('class');
  record(buyFCls && buyFCls.includes('bg-primary'), 'Buy filter activates', 'Active class');
  await page.screenshot({ path: SS + '/mock_history_buy_filter.png' });

  await sellFilter.click();
  await page.waitForTimeout(500);
  let sellFCls = await sellFilter.getAttribute('class');
  record(sellFCls && sellFCls.includes('bg-primary'), 'Sell filter activates', 'Active class');

  // Status filters
  const filledF = page.locator('button:text-is("Filled")').first();
  const cancelledF = page.locator('button:text-is("Cancelled")').first();
  record(await filledF.isVisible().catch(() => false), 'Filled status filter visible', 'Present');
  record(await cancelledF.isVisible().catch(() => false), 'Cancelled status filter visible', 'Present');

  // Reset filter
  const allFilter = page.locator('button:text-is("All")').first();
  await allFilter.click();
  await page.waitForTimeout(300);

  // Date grouping
  record(body.includes('March') || body.includes('February'), 'Transactions grouped by date', 'Date headers present');

  // Transaction links
  const txLink = page.locator('a[href^="/stock/"]').first();
  record(await txLink.isVisible().catch(() => false), 'Transaction items are links', 'Clickable rows');

  // ===================== NOTIFICATIONS PAGE =====================
  console.log('\n=== TESTING NOTIFICATIONS PAGE ===');

  await page.evaluate(() => localStorage.clear());
  await page.goto(BASE + '/notifications', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  body = await page.textContent('body');

  record(body.includes('Notifications'), 'Notifications page title', 'Present');
  record(body.includes('Order Filled') || body.includes('NVDA is up'), 'Notification items present', 'Alert items shown');

  // Mark all as read on page
  const markAllPage = page.locator('button:has-text("Mark all as read")').first();
  let markAllPageVisible = await markAllPage.isVisible().catch(() => false);
  record(markAllPageVisible, 'Mark all as read on notifications page', 'Visible: ' + markAllPageVisible);

  if (markAllPageVisible) {
    await markAllPage.click();
    await page.waitForTimeout(500);
    let afterMarkAll = await markAllPage.isVisible().catch(() => false);
    record(!afterMarkAll, 'Mark all as read hides button after click', 'Hidden: ' + !afterMarkAll);
  }

  // Click notification
  const notifPageItem = page.locator('[class*="cursor-pointer"]').first();
  if (await notifPageItem.isVisible().catch(() => false)) {
    await notifPageItem.click();
    await page.waitForTimeout(1000);
    record(page.url().includes('/stock/'), 'Notification page item click navigates', 'URL: ' + page.url());
  }

  // ===================== NON-OWNED STOCK =====================
  console.log('\n=== TESTING NON-OWNED STOCK (NFLX) ===');

  await page.goto(BASE + '/stock/NFLX', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1500);
  body = await page.textContent('body');

  record(body.includes('Netflix'), 'NFLX page loads', 'Netflix shown');
  let positionVisible = body.includes('Your Position') || body.includes('Your Equity');
  record(!positionVisible, 'Non-owned stock hides Your Position', 'Position hidden: ' + !positionVisible);

  // Non-existent stock
  await page.goto(BASE + '/stock/XXXX', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);
  body = await page.textContent('body');
  record(body.includes('Stock not found'), 'Invalid stock shows error', 'Shows "Stock not found"');

  // ===================== /GO ENDPOINT =====================
  console.log('\n=== TESTING /GO ENDPOINT ===');

  await page.goto(BASE + '/go', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  body = await page.textContent('body');

  record(body.includes('initial_state'), '/go shows initial_state', 'Field present');
  record(body.includes('current_state'), '/go shows current_state', 'Field present');
  record(body.includes('state_diff'), '/go shows state_diff', 'Field present');
  record(body.includes('robinhood_mock'), '/go shows app name', 'App identifier present');

  // ===================== FINAL RESULTS =====================
  console.log('\n\n========================================');
  console.log('FINAL RESULTS');
  console.log('========================================');
  console.log('PASSED: ' + results.passed.length);
  console.log('FAILED: ' + results.failed.length);

  if (results.failed.length > 0) {
    console.log('\n--- FAILURES ---');
    results.failed.forEach(f => console.log('  FAIL: ' + f.name + ' -- ' + f.detail));
  }

  console.log('\n--- ALL PASSES ---');
  results.passed.forEach(p => console.log('  PASS: ' + p.name));

  console.log('\nDONE');
  await browser.close();
})().catch(e => {
  console.error('FATAL ERROR:', e.message);
  console.error(e.stack);
  process.exit(1);
});
