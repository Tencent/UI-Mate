const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

  const results = {};

  // ========================
  // TEST 1: Dashboard loads
  // ========================
  console.log('=== TEST 1: Dashboard page loads ===');
  const response = await page.goto('http://localhost:5190/', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);
  results.dashboardLoads = response.status() === 200;
  const title = await page.title();
  console.log('Status:', response.status(), 'Title:', title, 'PASS:', results.dashboardLoads);

  // ========================
  // TEST 2: Board cards render
  // ========================
  console.log('\n=== TEST 2: Board cards render ===');
  const newBoardCard = await page.locator('.new-board-card').count();
  const boardCardCount = await page.locator('.board-card:not(.new-board-card)').count();
  results.boardCardsRender = newBoardCard === 1 && boardCardCount === 5;
  console.log('New board cards:', newBoardCard, 'Board cards:', boardCardCount, 'PASS:', results.boardCardsRender);

  const boardNames = await page.locator('.board-card-name').allTextContents();
  console.log('Board names:', boardNames);
  const expectedNames = ['Sprint Retrospective', 'Product Roadmap 2025', 'User Flow Diagrams', 'Architecture Overview', 'Brainstorming Session'];
  results.allBoardNamesPresent = expectedNames.every(n => boardNames.some(bn => bn.includes(n)));
  console.log('All expected names present:', results.allBoardNamesPresent);

  // ========================
  // TEST 3: Star toggle
  // ========================
  console.log('\n=== TEST 3: Star toggle ===');
  const productCard = page.locator('.board-card:not(.new-board-card)').nth(1);
  const starBtn = productCard.locator('.board-star');
  const wasBefore = await starBtn.evaluate(el => el.classList.contains('starred'));
  await starBtn.click();
  await page.waitForTimeout(300);
  const isAfterClick = await starBtn.evaluate(el => el.classList.contains('starred'));
  results.starToggle = (wasBefore !== isAfterClick);
  console.log('Before:', wasBefore, 'After:', isAfterClick, 'Toggled:', results.starToggle);
  await starBtn.click(); // toggle back
  await page.waitForTimeout(200);

  // ========================
  // TEST 4: Context menu
  // ========================
  console.log('\n=== TEST 4: Context menu ===');
  const sprintCard = page.locator('.board-card:not(.new-board-card)').first();
  await sprintCard.hover();
  await page.waitForTimeout(400);

  const moreBtn = sprintCard.locator('.board-card-more');
  const moreBtnCount = await moreBtn.count();
  console.log('More button found:', moreBtnCount > 0);

  if (moreBtnCount > 0) {
    await moreBtn.click();
    await page.waitForTimeout(600);

    const menuInfo = await page.evaluate(() => {
      const allEls = document.querySelectorAll('*');
      for (const el of allEls) {
        const text = el.textContent || '';
        if (text.includes('Rename') && text.includes('Delete') && el.offsetParent !== null && el.children.length > 2) {
          return { found: true, text: text.substring(0, 400), className: el.className };
        }
      }
      return { found: false };
    });
    results.contextMenuOpens = menuInfo.found;
    console.log('Context menu found:', menuInfo.found);
    if (menuInfo.found) {
      console.log('Menu text:', menuInfo.text);
      console.log('Menu class:', menuInfo.className);
      results.contextMenuOptions = menuInfo.text.includes('Rename') && menuInfo.text.includes('Duplicate') && menuInfo.text.includes('Delete');
      console.log('Has expected options:', results.contextMenuOptions);
    }

    await page.screenshot({ path: '/cpfs02/data/shared/Group-m6/bowen.wbw/openrlvr-mock/miro_mock/assets/screenshots/test_context_menu_final.png' });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  } else {
    results.contextMenuOpens = false;
  }

  // ========================
  // TEST 5: Sidebar navigation
  // ========================
  console.log('\n=== TEST 5: Sidebar navigation ===');

  // Test Starred filter
  await page.click('text=Starred');
  await page.waitForTimeout(500);
  const starredCount = await page.locator('.board-card:not(.new-board-card)').count();
  results.starredFilter = starredCount === 2;
  console.log('Starred filter - boards:', starredCount, '(expected 2) PASS:', results.starredFilter);

  // Test Recent
  await page.click('text=Recent');
  await page.waitForTimeout(500);
  const recentCount = await page.locator('.board-card:not(.new-board-card)').count();
  results.recentFilter = recentCount === 5;
  console.log('Recent filter - boards:', recentCount, '(expected 5) PASS:', results.recentFilter);

  // Test Project filter
  await page.click('text=Q1 Planning');
  await page.waitForTimeout(500);
  const q1Count = await page.locator('.board-card:not(.new-board-card)').count();
  const q1Names = await page.locator('.board-card-name').allTextContents();
  results.projectFilter = q1Count === 2;
  console.log('Q1 Planning filter - boards:', q1Count, 'names:', q1Names, '(expected 2) PASS:', results.projectFilter);

  // Go back to all boards
  await page.click('text=Boards in this team');
  await page.waitForTimeout(500);

  // ========================
  // TEST 6: Create new board
  // ========================
  console.log('\n=== TEST 6: Create new board ===');
  await page.locator('.new-board-card').click();
  await page.waitForTimeout(1000);

  const currentUrl = page.url();
  results.createNewBoard = currentUrl.includes('/board/');
  console.log('After clicking New board, URL:', currentUrl, 'PASS:', results.createNewBoard);

  // ========================
  // TEST 7: Navigate to board canvas
  // ========================
  console.log('\n=== TEST 7: Board canvas page (/board/board_1) ===');
  await page.goto('http://localhost:5190/board/board_1', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);

  results.boardPageLoads = page.url().includes('/board/board_1');
  console.log('Board page URL:', page.url(), 'PASS:', results.boardPageLoads);

  await page.screenshot({ path: '/cpfs02/data/shared/Group-m6/bowen.wbw/openrlvr-mock/miro_mock/assets/screenshots/test_board_canvas.png' });

  // ========================
  // TEST 8: Top bar renders
  // ========================
  console.log('\n=== TEST 8: Top bar ===');
  const bodyText = await page.evaluate(() => document.body.textContent);
  const hasLogo = bodyText.includes('miro');
  const hasBoardName = bodyText.includes('Sprint Retrospective');

  const shareBtn = page.locator('button:has-text("Share")');
  const shareCount = await shareBtn.count();
  console.log('Has miro logo:', hasLogo, 'Has board name:', hasBoardName, 'Share button:', shareCount > 0);

  results.topBarRenders = hasLogo && hasBoardName && shareCount > 0;
  console.log('Top bar PASS:', results.topBarRenders);

  // ========================
  // TEST 9: Left toolbar
  // ========================
  console.log('\n=== TEST 9: Left toolbar ===');
  const toolbarInfo = await page.evaluate(() => {
    const toolbar = document.querySelector('.left-toolbar, [class*="left-toolbar"], [class*="toolbar"]');
    if (!toolbar) return { found: false };
    const buttons = toolbar.querySelectorAll('button');
    return { found: true, buttonCount: buttons.length, className: toolbar.className };
  });
  console.log('Toolbar info:', JSON.stringify(toolbarInfo));
  results.leftToolbar = toolbarInfo.found && toolbarInfo.buttonCount >= 5;
  console.log('Left toolbar PASS:', results.leftToolbar);

  // ========================
  // TEST 10: Canvas area
  // ========================
  console.log('\n=== TEST 10: Canvas area ===');
  const canvasInfo = await page.evaluate(() => {
    const canvas = document.querySelector('.canvas, [class*="canvas"], .board-canvas');
    if (!canvas) return { found: false };
    return {
      found: true,
      className: canvas.className,
      childCount: canvas.children.length,
      style: canvas.getAttribute('style') || ''
    };
  });
  console.log('Canvas info:', JSON.stringify(canvasInfo));
  results.canvasRenders = canvasInfo.found;
  console.log('Canvas PASS:', results.canvasRenders);

  // ========================
  // TEST 11: Zoom controls
  // ========================
  console.log('\n=== TEST 11: Zoom controls ===');
  const zoomInfo = await page.evaluate(() => {
    const zoom = document.querySelector('.zoom-controls, [class*="zoom"]');
    if (!zoom) return { found: false };
    const buttons = zoom.querySelectorAll('button');
    const text = zoom.textContent;
    const percentMatch = text.match(/\d+%/);
    return {
      found: true,
      className: zoom.className,
      buttonCount: buttons.length,
      text: text.substring(0, 100),
      percentage: percentMatch ? percentMatch[0] : null
    };
  });
  console.log('Zoom info:', JSON.stringify(zoomInfo));
  results.zoomControls = zoomInfo.found && zoomInfo.percentage !== null;
  console.log('Zoom controls PASS:', results.zoomControls);

  // Test zoom + button
  if (results.zoomControls) {
    const zoomBefore = zoomInfo.percentage;
    // Find and click + button
    const zoomBtns = await page.locator('.zoom-controls button, [class*="zoom"] button').all();
    console.log('Zoom button count:', zoomBtns.length);

    // Try clicking the last button (usually +)
    if (zoomBtns.length >= 2) {
      // Click + (zoom in)
      await zoomBtns[1].click();
      await page.waitForTimeout(300);

      const afterZoom = await page.evaluate(() => {
        const zoom = document.querySelector('.zoom-controls, [class*="zoom"]');
        const text = zoom ? zoom.textContent : '';
        const match = text.match(/\d+%/);
        return match ? match[0] : null;
      });
      console.log('Zoom before:', zoomBefore, 'after +:', afterZoom);
      results.zoomInteraction = afterZoom !== zoomBefore;
      console.log('Zoom interaction PASS:', results.zoomInteraction);

      // Click - (zoom out) to restore
      await zoomBtns[0].click();
      await page.waitForTimeout(300);
    }
  }

  // ========================
  // TEST 12: /go endpoint
  // ========================
  console.log('\n=== TEST 12: /go endpoint ===');
  await page.goto('http://localhost:5190/go', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);

  const goContent = await page.evaluate(() => {
    const pre = document.querySelector('pre');
    if (pre) return pre.textContent.substring(0, 500);
    return document.body.textContent.substring(0, 500);
  });
  console.log('/go content (first 500):', goContent);

  let goJson = null;
  try {
    goJson = JSON.parse(goContent.trim());
  } catch (e) {
    // Try getting from body
    const bodyText = await page.evaluate(() => document.body.textContent);
    try {
      goJson = JSON.parse(bodyText.trim());
    } catch (e2) {
      console.log('Could not parse /go as JSON');
    }
  }

  if (goJson) {
    results.goEndpoint = true;
    console.log('Has initial_state:', !!goJson.initial_state);
    console.log('Has current_state:', !!goJson.current_state);
    console.log('Has state_diff:', !!goJson.state_diff);
    results.goEndpointFields = !!goJson.initial_state && !!goJson.current_state && !!goJson.state_diff;
  } else {
    results.goEndpoint = false;
    results.goEndpointFields = false;
  }
  console.log('/go endpoint PASS:', results.goEndpoint);

  await page.screenshot({ path: '/cpfs02/data/shared/Group-m6/bowen.wbw/openrlvr-mock/miro_mock/assets/screenshots/test_go_endpoint.png' });

  // ========================
  // FINAL SUMMARY
  // ========================
  console.log('\n=== CONSOLE ERRORS ===');
  console.log('Total console errors:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    consoleErrors.slice(0, 5).forEach(e => console.log('  -', e));
  }
  results.noConsoleErrors = consoleErrors.length === 0;

  console.log('\n========== FINAL RESULTS ==========');
  let passCount = 0;
  let failCount = 0;
  for (const [k, v] of Object.entries(results)) {
    const status = v ? 'PASS' : 'FAIL';
    if (v) passCount++; else failCount++;
    console.log(`  ${status}: ${k}`);
  }
  console.log(`\nTotal: ${passCount} passed, ${failCount} failed out of ${passCount + failCount}`);

  await browser.close();
})().catch(e => console.error('FATAL:', e.message));
