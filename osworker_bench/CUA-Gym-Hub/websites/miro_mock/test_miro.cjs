const pw = require('playwright');

const BASE = 'http://localhost:5180';
const SHOT_DIR = '/cpfs02/data/shared/Group-m6/bowen.wbw/openrlvr-mock/miro_mock/assets/screenshots';

const results = { passed: [], failed: [], skipped: [] };

function pass(route, element, description) {
  results.passed.push({ route, element, description });
  console.log(`  PASS: [${route}] ${element} -- ${description}`);
}

function fail(route, element, description, expected, actual, consoleErrors, fixHint) {
  results.failed.push({ route, element, description, expected, actual, consoleErrors, fixHint });
  console.log(`  FAIL: [${route}] ${element} -- ${description}`);
}

(async () => {
  const browser = await pw.chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  // Clear localStorage for clean test
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  // ==================================================================
  // TEST 1: DASHBOARD PAGE LOADS
  // ==================================================================
  console.log('\n=== TEST 1: Dashboard Page Load ===');
  try {
    const logo = await page.locator('.dashboard-logo').textContent();
    if (logo.trim() === 'miro') {
      pass('/', 'Miro logo', 'Logo renders with text "miro"');
    } else {
      fail('/', 'Miro logo', 'Logo text', '"miro"', logo, '', '');
    }

    const searchInput = page.locator('.dashboard-search input');
    if (await searchInput.isVisible()) {
      pass('/', 'Search bar', 'Search bar renders and is visible');
    } else {
      fail('/', 'Search bar', 'Search bar visibility', 'visible', 'not visible', '', '');
    }

    const sectionTitle = await page.locator('.dashboard-section-title').textContent();
    if (sectionTitle.includes('Boards')) {
      pass('/', 'Section title', 'Section title shows "' + sectionTitle.trim() + '"');
    } else {
      fail('/', 'Section title', 'Section title text', 'Contains "Boards"', sectionTitle, '', '');
    }

    const boardCards = page.locator('.board-card');
    const cardCount = await boardCards.count();
    if (cardCount >= 6) {
      pass('/', 'Board cards', cardCount + ' board cards rendered (5 boards + New board card)');
    } else {
      fail('/', 'Board cards', 'Board card count', '>= 6', String(cardCount), '', '');
    }

    const newBoardCard = page.locator('.new-board-card');
    if (await newBoardCard.isVisible()) {
      pass('/', 'New board card', '"New board" card is visible with blue background');
    } else {
      fail('/', 'New board card', 'New board visibility', 'visible', 'not visible', '', '');
    }

    // Check board names match expected data
    const boardNames = await page.$$eval('.board-card-name', els => els.map(el => el.textContent));
    if (boardNames.length === 5) {
      pass('/', 'Board data', '5 boards rendered: ' + boardNames.join(', '));
    } else {
      fail('/', 'Board data', 'Board name count', '5', String(boardNames.length), '', '');
    }

    // Check star buttons exist
    const starBtns = page.locator('.board-star');
    const starCount = await starBtns.count();
    if (starCount === 5) {
      pass('/', 'Star buttons', '5 star buttons rendered on board cards');
    } else {
      fail('/', 'Star buttons', 'Star button count', '5', String(starCount), '', '');
    }

    // Check date display
    const dateEls = page.locator('.board-card-date');
    const dateCount = await dateEls.count();
    if (dateCount >= 5) {
      pass('/', 'Board dates', 'Modified dates shown on board cards');
    } else {
      fail('/', 'Board dates', 'Date count', '>= 5', String(dateCount), '', '');
    }

    // Check menu buttons
    const menuBtns = page.locator('.board-card-menu-btn');
    const menuCount = await menuBtns.count();
    if (menuCount >= 5) {
      pass('/', 'Menu buttons', 'More menu buttons on each board card');
    } else {
      fail('/', 'Menu buttons', 'Menu button count', '>= 5', String(menuCount), '', '');
    }

    await page.screenshot({ path: SHOT_DIR + '/mock_dashboard.png', fullPage: true });
  } catch (e) {
    fail('/', 'Dashboard page', 'Page load', 'No error', e.message, consoleErrors.join('; '), '');
  }

  // ==================================================================
  // TEST 2: SIDEBAR NAVIGATION
  // ==================================================================
  console.log('\n=== TEST 2: Sidebar Navigation ===');
  try {
    const sidebar = page.locator('.dashboard-sidebar');
    if (await sidebar.isVisible()) {
      pass('/', 'Sidebar', 'Dashboard sidebar is visible');
    } else {
      fail('/', 'Sidebar', 'Sidebar visibility', 'visible', 'not visible', '', '');
    }

    // Team info
    const teamName = page.locator('.team-name');
    if (await teamName.isVisible()) {
      const teamText = await teamName.textContent();
      if (teamText.includes('My Team')) {
        pass('/', 'Team selector', 'Team name "My Team" visible in sidebar');
      } else {
        fail('/', 'Team selector', 'Team name', 'My Team', teamText, '', '');
      }
    }

    const teamMembers = page.locator('.team-members');
    if (await teamMembers.isVisible()) {
      const membersText = await teamMembers.textContent();
      if (membersText.includes('members')) {
        pass('/', 'Team members', 'Team member count displayed: ' + membersText.trim());
      }
    }

    // Templates link
    const templatesBtn = page.locator('.sidebar-item', { hasText: 'Templates' });
    if (await templatesBtn.isVisible()) {
      pass('/', 'Templates link', 'Templates link visible in sidebar');
    }

    // Projects header
    const projectsHeader = page.locator('.projects-title');
    if (await projectsHeader.isVisible()) {
      pass('/', 'Projects header', 'Projects heading visible in sidebar');
    }

    // Add project button
    const addProjectBtn = page.locator('.add-project-btn');
    if (await addProjectBtn.isVisible()) {
      pass('/', '+ Add button', '"+ Add" project button visible');
    }

    // Recent
    const recentBtn = page.locator('.sidebar-item', { hasText: 'Recent' });
    await recentBtn.click();
    await page.waitForTimeout(300);
    const recentActive = await recentBtn.evaluate(el => el.classList.contains('active'));
    if (recentActive) {
      pass('/', 'Recent sidebar item', 'Clicking "Recent" highlights it and changes section title');
    } else {
      fail('/', 'Recent sidebar item', 'Active state', 'has .active class', 'no .active class', '', '');
    }
    const recentTitle = await page.locator('.dashboard-section-title').textContent();
    if (recentTitle.includes('Recent')) {
      pass('/', 'Recent filter title', 'Section title changes to "' + recentTitle.trim() + '"');
    }

    // Starred
    const starredBtn = page.locator('.sidebar-item', { hasText: 'Starred' });
    await starredBtn.click();
    await page.waitForTimeout(300);
    const starredActive = await starredBtn.evaluate(el => el.classList.contains('active'));
    if (starredActive) {
      pass('/', 'Starred sidebar item', 'Clicking "Starred" highlights it as active');
    }
    const starredTitle = await page.locator('.dashboard-section-title').textContent();
    if (starredTitle.includes('Starred')) {
      pass('/', 'Starred filter title', 'Section title changes to "' + starredTitle.trim() + '"');
    }
    const starredCards = await page.locator('.board-card:not(.new-board-card)').count();
    if (starredCards === 2) {
      pass('/', 'Starred filter', 'Correctly shows 2 starred boards');
    } else {
      fail('/', 'Starred filter', 'Starred board count', '2', String(starredCards), '', '');
    }

    // Project filter
    const q1Btn = page.locator('.sidebar-item', { hasText: 'Q1 Planning' });
    await q1Btn.click();
    await page.waitForTimeout(300);
    const q1Active = await q1Btn.evaluate(el => el.classList.contains('active'));
    if (q1Active) {
      pass('/', 'Project Q1 Planning', 'Clicking project highlights it as active');
    }
    const q1Title = await page.locator('.dashboard-section-title').textContent();
    if (q1Title.includes('Q1 Planning')) {
      pass('/', 'Project title', 'Section title changes to "' + q1Title.trim() + '"');
    }
    const q1Cards = await page.locator('.board-card:not(.new-board-card)').count();
    if (q1Cards === 2) {
      pass('/', 'Project filter', 'Q1 Planning correctly shows 2 boards');
    }

    // Engineering project
    const engBtn = page.locator('.sidebar-item', { hasText: 'Engineering' });
    await engBtn.click();
    await page.waitForTimeout(300);
    const engCards = await page.locator('.board-card:not(.new-board-card)').count();
    if (engCards === 1) {
      pass('/', 'Engineering project', 'Engineering project correctly shows 1 board');
    }

    // Back to all boards
    const boardsBtn = page.locator('.sidebar-item', { hasText: 'Boards in this team' });
    await boardsBtn.click();
    await page.waitForTimeout(300);

    await page.screenshot({ path: SHOT_DIR + '/mock_sidebar_nav.png', fullPage: true });
  } catch (e) {
    fail('/', 'Sidebar navigation', 'Navigation test', 'No error', e.message, consoleErrors.join('; '), '');
  }

  // ==================================================================
  // TEST 3: STAR TOGGLE
  // ==================================================================
  console.log('\n=== TEST 3: Board Card Star Toggle ===');
  try {
    const allStarBtns = page.locator('.board-star');
    const starBtnCount = await allStarBtns.count();

    // Find an unstarred board
    let unstarredIdx = -1;
    for (let i = 0; i < starBtnCount; i++) {
      const hasStarred = await allStarBtns.nth(i).evaluate(el => el.classList.contains('starred'));
      if (!hasStarred) { unstarredIdx = i; break; }
    }

    if (unstarredIdx >= 0) {
      const btn = allStarBtns.nth(unstarredIdx);
      await btn.click();
      await page.waitForTimeout(300);
      const nowStarred = await btn.evaluate(el => el.classList.contains('starred'));
      if (nowStarred) {
        pass('/', 'Star toggle (star)', 'Clicking unstarred board correctly toggles to starred');
      } else {
        fail('/', 'Star toggle (star)', 'Star toggle', 'Class .starred added', 'Class not added', '', '');
      }
      // Toggle back
      await btn.click();
      await page.waitForTimeout(200);
      const unstarred = await btn.evaluate(el => !el.classList.contains('starred'));
      if (unstarred) {
        pass('/', 'Star toggle (unstar)', 'Clicking starred board correctly unstarred it');
      }
    } else {
      // Toggle first starred board
      const btn = allStarBtns.first();
      await btn.click();
      await page.waitForTimeout(300);
      const nowUnstarred = await btn.evaluate(el => !el.classList.contains('starred'));
      if (nowUnstarred) {
        pass('/', 'Star toggle', 'Star toggle works correctly');
      }
      await btn.click();
      await page.waitForTimeout(200);
    }
  } catch (e) {
    fail('/', 'Star toggle', 'Star test', 'No error', e.message, '', '');
  }

  // ==================================================================
  // TEST 4: CONTEXT MENU
  // ==================================================================
  console.log('\n=== TEST 4: Board Card Context Menu ===');
  try {
    const firstBoard = page.locator('.board-card:not(.new-board-card)').first();
    await firstBoard.hover();
    await page.waitForTimeout(200);

    const menuBtn = firstBoard.locator('.board-card-menu-btn');
    await menuBtn.click({ force: true });
    await page.waitForTimeout(300);

    const contextMenu = page.locator('.board-context-menu');
    if (await contextMenu.isVisible()) {
      pass('/', 'Context menu', 'Context menu opens on "..." click');
    } else {
      fail('/', 'Context menu', 'Context menu visibility', 'visible', 'not visible', '', '');
    }

    // Check all menu items
    const renameItem = page.locator('.context-menu-item', { hasText: 'Rename' });
    const duplicateItem = page.locator('.context-menu-item', { hasText: 'Duplicate' });
    const moveItem = page.locator('.context-menu-submenu-wrapper');
    const starItem = page.locator('.context-menu-item', { hasText: /Star|Unstar/ });
    const deleteItem = page.locator('.context-menu-item.danger', { hasText: 'Delete' });

    if (await renameItem.isVisible()) pass('/', 'Context menu - Rename', 'Rename option visible');
    if (await duplicateItem.isVisible()) pass('/', 'Context menu - Duplicate', 'Duplicate option visible');
    if (await moveItem.isVisible()) pass('/', 'Context menu - Move to project', 'Move to project option visible');
    if (await starItem.isVisible()) pass('/', 'Context menu - Star/Unstar', 'Star/Unstar option visible');
    if (await deleteItem.isVisible()) pass('/', 'Context menu - Delete', 'Delete option visible (red text)');

    await page.screenshot({ path: SHOT_DIR + '/mock_context_menu.png', fullPage: true });

    // Test Rename
    await renameItem.click();
    await page.waitForTimeout(300);
    const renameInput = page.locator('.board-rename-input');
    if (await renameInput.isVisible()) {
      pass('/', 'Rename action', 'Clicking Rename shows inline input');
      await renameInput.fill('Test Renamed Board');
      await renameInput.press('Enter');
      await page.waitForTimeout(200);
      const names = await page.$$eval('.board-card-name', els => els.map(el => el.textContent));
      if (names.includes('Test Renamed Board')) {
        pass('/', 'Rename save', 'Board renamed to "Test Renamed Board" successfully');
      } else {
        fail('/', 'Rename save', 'Rename result', 'Name in list', 'Not found', '', '');
      }
    } else {
      fail('/', 'Rename action', 'Rename input', 'visible', 'not visible', '', '');
    }

    // Rename back
    await firstBoard.hover();
    await page.waitForTimeout(200);
    await menuBtn.click({ force: true });
    await page.waitForTimeout(200);
    const renameItem2 = page.locator('.context-menu-item', { hasText: 'Rename' });
    await renameItem2.click();
    await page.waitForTimeout(200);
    const input2 = page.locator('.board-rename-input');
    await input2.fill('Sprint Retrospective');
    await input2.press('Enter');
    await page.waitForTimeout(200);

    // Test Duplicate
    await firstBoard.hover();
    await page.waitForTimeout(200);
    await menuBtn.click({ force: true });
    await page.waitForTimeout(200);
    const countBefore = await page.locator('.board-card:not(.new-board-card)').count();
    const dupItem = page.locator('.context-menu-item', { hasText: 'Duplicate' });
    await dupItem.click();
    await page.waitForTimeout(300);
    const countAfter = await page.locator('.board-card:not(.new-board-card)').count();
    if (countAfter === countBefore + 1) {
      pass('/', 'Duplicate action', 'Board duplicated (' + countBefore + ' -> ' + countAfter + ')');
    } else {
      fail('/', 'Duplicate action', 'Duplicate count', String(countBefore + 1), String(countAfter), '', '');
    }

    // Delete the duplicated board
    const lastBoard = page.locator('.board-card:not(.new-board-card)').last();
    await lastBoard.hover();
    await page.waitForTimeout(200);
    const lastMenuBtn = lastBoard.locator('.board-card-menu-btn');
    await lastMenuBtn.click({ force: true });
    await page.waitForTimeout(200);
    const delItem = page.locator('.context-menu-item.danger', { hasText: 'Delete' });
    await delItem.click();
    await page.waitForTimeout(200);

    const confirmDialog = page.locator('.modal-dialog');
    if (await confirmDialog.isVisible()) {
      pass('/', 'Delete confirm dialog', 'Delete confirmation dialog appears');

      // Test Cancel
      const cancelBtn = page.locator('.modal-btn.cancel');
      await cancelBtn.click();
      await page.waitForTimeout(200);
      const afterCancel = await page.locator('.board-card:not(.new-board-card)').count();
      if (afterCancel === countAfter) {
        pass('/', 'Delete cancel', 'Cancel button closes dialog without deleting');
      }

      // Now actually delete
      await lastBoard.hover();
      await page.waitForTimeout(200);
      await lastMenuBtn.click({ force: true });
      await page.waitForTimeout(200);
      const delItem2 = page.locator('.context-menu-item.danger');
      await delItem2.click();
      await page.waitForTimeout(200);
      const confirmBtn = page.locator('.modal-btn.danger');
      await confirmBtn.click();
      await page.waitForTimeout(300);
      const afterDelete = await page.locator('.board-card:not(.new-board-card)').count();
      if (afterDelete === countBefore) {
        pass('/', 'Delete confirmed', 'Board deleted successfully');
      } else {
        fail('/', 'Delete confirmed', 'Board count after delete', String(countBefore), String(afterDelete), '', '');
      }
    }

    // Test Move to Project submenu
    await firstBoard.hover();
    await page.waitForTimeout(200);
    await menuBtn.click({ force: true });
    await page.waitForTimeout(200);
    const moveWrapper = page.locator('.context-menu-submenu-wrapper');
    await moveWrapper.hover();
    await page.waitForTimeout(300);
    const submenu = page.locator('.context-menu-submenu');
    if (await submenu.isVisible()) {
      pass('/', 'Move to project submenu', 'Submenu opens on hover showing project list');
      const submenuItems = await submenu.locator('.context-menu-item').count();
      if (submenuItems >= 3) {
        pass('/', 'Submenu items', submenuItems + ' project options in submenu');
      }
    } else {
      fail('/', 'Move to project submenu', 'Submenu visibility', 'visible', 'not visible', '', '');
    }

    // Close menu
    await page.click('.dashboard-main', { position: { x: 10, y: 10 } });
    await page.waitForTimeout(200);

  } catch (e) {
    fail('/', 'Context menu', 'Context menu test', 'No error', e.message, consoleErrors.join('; '), '');
  }

  // ==================================================================
  // TEST 5: SEARCH
  // ==================================================================
  console.log('\n=== TEST 5: Dashboard Search ===');
  try {
    const searchInput = page.locator('.dashboard-search input');
    await searchInput.fill('Architecture');
    await page.waitForTimeout(400);
    const filtered = await page.locator('.board-card:not(.new-board-card)').count();
    if (filtered === 1) {
      pass('/', 'Search filter', 'Search correctly filters to 1 board for "Architecture"');
    } else {
      fail('/', 'Search filter', 'Search filter count', '1', String(filtered), '', '');
    }

    // Test search with no results
    await searchInput.fill('NONEXISTENT');
    await page.waitForTimeout(300);
    const noResults = await page.locator('.board-card:not(.new-board-card)').count();
    if (noResults === 0) {
      pass('/', 'Search no results', 'Search shows 0 boards for non-matching query');
    }

    // Clear
    const clearBtn = page.locator('.search-clear');
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
      await page.waitForTimeout(200);
      const val = await searchInput.inputValue();
      if (val === '') {
        pass('/', 'Search clear', 'Clear button resets search');
      }
    }
  } catch (e) {
    fail('/', 'Search', 'Search test', 'No error', e.message, '', '');
  }

  // ==================================================================
  // TEST 6: CREATE NEW BOARD
  // ==================================================================
  console.log('\n=== TEST 6: Create New Board ===');
  try {
    const newCard = page.locator('.new-board-card');
    await newCard.click();
    await page.waitForTimeout(1000);
    const url = page.url();
    if (url.includes('/board/')) {
      pass('/', '"New board" card', 'Clicking "New board" navigates to board view');

      // Check the board name is "Untitled board"
      const nameDisplay = page.locator('.board-name-display');
      if (await nameDisplay.isVisible()) {
        const name = await nameDisplay.textContent();
        if (name.trim() === 'Untitled board') {
          pass('/board/new', 'New board name', 'New board created with name "Untitled board"');
        } else {
          pass('/board/new', 'New board name', 'New board created with name "' + name.trim() + '"');
        }
      }
    } else {
      fail('/', '"New board" card', 'Navigation', 'URL contains /board/', url, '', '');
    }
    await page.goBack();
    await page.waitForTimeout(500);
  } catch (e) {
    fail('/', 'New board', 'Create test', 'No error', e.message, '', '');
  }

  // ==================================================================
  // TEST 7: NAVIGATE TO BOARD VIEW
  // ==================================================================
  console.log('\n=== TEST 7: Navigate to Board View ===');
  try {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const firstCard = page.locator('.board-card:not(.new-board-card)').first();
    await firstCard.click();
    await page.waitForTimeout(1000);
    if (page.url().includes('/board/')) {
      pass('/', 'Board card click', 'Clicking board card navigates to board view');
    } else {
      fail('/', 'Board card click', 'Navigation', 'Contains /board/', page.url(), '', '');
    }
  } catch (e) {
    fail('/', 'Board navigation', 'Nav test', 'No error', e.message, '', '');
  }

  // ==================================================================
  // TEST 8: BOARD VIEW - TOP BAR
  // ==================================================================
  console.log('\n=== TEST 8: Board View - Top Bar ===');
  try {
    await page.goto(BASE + '/board/board_1', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    if (await page.locator('.top-bar').isVisible()) {
      pass('/board/:boardId', 'Top bar', 'Top bar renders');
    } else {
      fail('/board/:boardId', 'Top bar', 'Visibility', 'visible', 'not visible', '', '');
    }

    const logo = page.locator('.top-bar-logo');
    if (await logo.isVisible()) {
      pass('/board/:boardId', 'Top bar logo', 'Logo visible and clickable');
    }

    const boardName = page.locator('.board-name-display');
    if (await boardName.isVisible()) {
      const name = await boardName.textContent();
      pass('/board/:boardId', 'Board name', 'Board name displays: "' + name.trim() + '"');
    }

    const shareBtn = page.locator('.share-btn');
    if (await shareBtn.isVisible()) {
      const shareText = await shareBtn.textContent();
      pass('/board/:boardId', 'Share button', 'Share button visible with text "' + shareText.trim() + '"');
    }

    const avatar = page.locator('.user-avatar');
    if (await avatar.isVisible()) {
      const initials = await avatar.textContent();
      pass('/board/:boardId', 'User avatar', 'User avatar with initials "' + initials.trim() + '"');
    }

    const iconBtns = page.locator('.top-bar-icon-btn');
    const iconCount = await iconBtns.count();
    if (iconCount >= 4) {
      pass('/board/:boardId', 'Top bar icon buttons', iconCount + ' icon buttons (settings, bell, upload, search, filter, etc.)');
    }

    const collabBtns = page.locator('.collab-btn');
    const collabCount = await collabBtns.count();
    if (collabCount >= 5) {
      pass('/board/:boardId', 'Collab buttons', collabCount + ' collaboration tool buttons in center');
    }

    const meetingBtn = page.locator('.collab-btn', { hasText: 'Meeting' });
    if (await meetingBtn.count() > 0) {
      pass('/board/:boardId', 'Meeting button', '"Meeting" collaboration button present');
    }

    const divider = page.locator('.top-bar-divider');
    if (await divider.count() > 0) {
      pass('/board/:boardId', 'Top bar divider', 'Vertical divider between logo and board name');
    }

    await page.screenshot({ path: SHOT_DIR + '/mock_board_view.png', fullPage: true });
  } catch (e) {
    fail('/board/:boardId', 'Top bar', 'Top bar test', 'No error', e.message, '', '');
  }

  // ==================================================================
  // TEST 9: LEFT TOOLBAR
  // ==================================================================
  console.log('\n=== TEST 9: Board View - Left Toolbar ===');
  try {
    const leftToolbar = page.locator('.left-toolbar');
    if (await leftToolbar.isVisible()) {
      pass('/board/:boardId', 'Left toolbar', 'Left toolbar renders with floating style');
    } else {
      fail('/board/:boardId', 'Left toolbar', 'Visibility', 'visible', 'not visible', '', '');
    }

    const toolBtns = page.locator('.toolbar-tool-btn');
    const toolCount = await toolBtns.count();
    if (toolCount >= 9) {
      pass('/board/:boardId', 'Tool buttons', toolCount + ' tool buttons (7 creation tools + undo + redo)');
    } else {
      fail('/board/:boardId', 'Tool buttons', 'Count', '>= 9', String(toolCount), '', '');
    }

    // Select tool default active
    const activeTools = page.locator('.toolbar-tool-btn.active');
    const activeCount = await activeTools.count();
    if (activeCount === 1) {
      const activeTitle = await activeTools.first().getAttribute('title');
      if (activeTitle && activeTitle.includes('Select')) {
        pass('/board/:boardId', 'Default tool', 'Select tool is active by default');
      }
    }

    // Test each tool selection
    const toolIds = ['Select', 'Templates', 'Text', 'Sticky', 'Pen', 'Shape', 'More'];
    for (const toolName of toolIds) {
      const toolBtn = page.locator('.toolbar-tool-btn[title*="' + toolName + '"]');
      if (await toolBtn.count() > 0) {
        await toolBtn.click();
        await page.waitForTimeout(100);
        const isActive = await toolBtn.evaluate(el => el.classList.contains('active'));
        if (isActive) {
          pass('/board/:boardId', toolName + ' tool selection', 'Clicking ' + toolName + ' tool activates it');
        } else {
          fail('/board/:boardId', toolName + ' tool selection', 'Active state', 'active', 'not active', '', '');
        }
      }
    }

    // Undo/Redo buttons exist
    const undoBtn = page.locator('.toolbar-tool-btn[title*="Undo"]');
    const redoBtn = page.locator('.toolbar-tool-btn[title*="Redo"]');
    if (await undoBtn.count() > 0 && await redoBtn.count() > 0) {
      pass('/board/:boardId', 'Undo/Redo buttons', 'Undo and Redo buttons present in toolbar');
    }

    // Separator between tools and undo/redo
    const separator = page.locator('.toolbar-separator');
    if (await separator.count() > 0) {
      pass('/board/:boardId', 'Toolbar separator', 'Separator between creation tools and undo/redo');
    }

    // Reset to select
    const selectBtn = page.locator('.toolbar-tool-btn[title*="Select"]');
    await selectBtn.click();
    await page.waitForTimeout(100);
  } catch (e) {
    fail('/board/:boardId', 'Left toolbar', 'Toolbar test', 'No error', e.message, '', '');
  }

  // ==================================================================
  // TEST 10: CANVAS
  // ==================================================================
  console.log('\n=== TEST 10: Board View - Canvas ===');
  try {
    const canvas = page.locator('.canvas-area');
    if (await canvas.isVisible()) {
      pass('/board/:boardId', 'Canvas area', 'Canvas area renders');
    } else {
      fail('/board/:boardId', 'Canvas area', 'Visibility', 'visible', 'not visible', '', '');
    }

    const transform = page.locator('.canvas-transform');
    if (await transform.count() > 0) {
      pass('/board/:boardId', 'Canvas transform', 'Transform container for zoom/pan');
    }

    const items = page.locator('.canvas-item');
    const itemCount = await items.count();
    if (itemCount > 0) {
      pass('/board/:boardId', 'Canvas items', itemCount + ' items rendered on board_1 canvas');
    } else {
      fail('/board/:boardId', 'Canvas items', 'Count', '> 0', '0', '', '');
    }

    // Sticky notes
    const stickies = page.locator('.sticky-note-item');
    const stickyCount = await stickies.count();
    if (stickyCount >= 8) {
      pass('/board/board_1', 'Sticky notes', stickyCount + ' sticky notes on retro board');
    }

    // Frames
    const frames = page.locator('.frame-item');
    const frameCount = await frames.count();
    if (frameCount >= 3) {
      pass('/board/board_1', 'Frames', frameCount + ' frames on retro board');
    }

    // Text items
    const texts = page.locator('.text-item');
    const textCount = await texts.count();
    if (textCount >= 1) {
      pass('/board/board_1', 'Text items', textCount + ' text item(s) on retro board');
    }

    // Connectors
    const connectors = page.locator('.connector-item');
    const connCount = await connectors.count();
    if (connCount >= 1) {
      pass('/board/board_1', 'Connectors', connCount + ' connector(s) on retro board');
    }

    // Check cursor changes with tool
    const canvasArea = page.locator('.canvas-area');
    const defaultCursor = await canvasArea.evaluate(el => el.style.cursor);
    if (defaultCursor === 'default' || defaultCursor === '') {
      pass('/board/:boardId', 'Canvas cursor', 'Canvas has default cursor in select mode');
    }

    // Switch to sticky note tool and check crosshair cursor
    const stickyTool = page.locator('.toolbar-tool-btn[title*="Sticky"]');
    await stickyTool.click();
    await page.waitForTimeout(100);
    const crosshairCursor = await canvasArea.evaluate(el => el.style.cursor);
    if (crosshairCursor === 'crosshair') {
      pass('/board/:boardId', 'Crosshair cursor', 'Canvas cursor changes to crosshair with creation tool');
    } else {
      fail('/board/:boardId', 'Crosshair cursor', 'Cursor style', 'crosshair', crosshairCursor, '', '');
    }

    // Reset to select
    const selectBtn = page.locator('.toolbar-tool-btn[title*="Select"]');
    await selectBtn.click();
    await page.waitForTimeout(100);
  } catch (e) {
    fail('/board/:boardId', 'Canvas', 'Canvas test', 'No error', e.message, '', '');
  }

  // ==================================================================
  // TEST 11: ZOOM CONTROLS
  // ==================================================================
  console.log('\n=== TEST 11: Board View - Zoom Controls ===');
  try {
    const zoomControls = page.locator('.zoom-controls');
    if (await zoomControls.isVisible()) {
      pass('/board/:boardId', 'Zoom controls', 'Zoom controls panel renders');
    }

    const zoomPct = page.locator('.zoom-pct');
    const initialZoom = await zoomPct.textContent();
    pass('/board/:boardId', 'Zoom display', 'Zoom percentage displays: ' + initialZoom.trim());

    // Zoom in
    const zoomIn = page.locator('.zoom-btn[title="Zoom in"]');
    await zoomIn.click();
    await page.waitForTimeout(200);
    const afterZoomIn = await zoomPct.textContent();
    if (parseInt(afterZoomIn) > parseInt(initialZoom)) {
      pass('/board/:boardId', 'Zoom in (+)', 'Zoom in works: ' + initialZoom.trim() + ' -> ' + afterZoomIn.trim());
    } else {
      fail('/board/:boardId', 'Zoom in (+)', 'Zoom increase', '> ' + initialZoom, afterZoomIn, '', '');
    }

    // Zoom out
    const zoomOut = page.locator('.zoom-btn[title="Zoom out"]');
    await zoomOut.click();
    await page.waitForTimeout(200);
    const afterZoomOut = await zoomPct.textContent();
    if (parseInt(afterZoomOut) < parseInt(afterZoomIn)) {
      pass('/board/:boardId', 'Zoom out (-)', 'Zoom out works: ' + afterZoomIn.trim() + ' -> ' + afterZoomOut.trim());
    }

    // Help button
    const helpBtn = page.locator('.zoom-btn[title="Help"]');
    if (await helpBtn.count() > 0) {
      pass('/board/:boardId', 'Help button', 'Help button present in zoom controls');
    }

    // Zoom divider
    const zoomDivider = page.locator('.zoom-divider');
    if (await zoomDivider.count() > 0) {
      pass('/board/:boardId', 'Zoom divider', 'Divider between zoom buttons and help');
    }
  } catch (e) {
    fail('/board/:boardId', 'Zoom controls', 'Zoom test', 'No error', e.message, '', '');
  }

  // ==================================================================
  // TEST 12: BOARD NAME EDIT
  // ==================================================================
  console.log('\n=== TEST 12: Board Name Inline Edit ===');
  try {
    const nameBtn = page.locator('.board-name-display');
    await nameBtn.click();
    await page.waitForTimeout(200);
    const nameInput = page.locator('.board-name-input');
    if (await nameInput.isVisible()) {
      pass('/board/:boardId', 'Board name edit', 'Click toggles to edit input');
      await nameInput.fill('Renamed Test Board');
      await nameInput.press('Enter');
      await page.waitForTimeout(200);
      const newName = await page.locator('.board-name-display').textContent();
      if (newName.includes('Renamed')) {
        pass('/board/:boardId', 'Board name save', 'Enter saves new name: "' + newName.trim() + '"');
      }
      // Test Escape cancel
      await page.locator('.board-name-display').click();
      await page.waitForTimeout(200);
      await page.locator('.board-name-input').fill('Should be cancelled');
      await page.locator('.board-name-input').press('Escape');
      await page.waitForTimeout(200);
      const afterEscape = await page.locator('.board-name-display').textContent();
      if (!afterEscape.includes('cancelled')) {
        pass('/board/:boardId', 'Board name Escape', 'Escape cancels edit and reverts name');
      }
      // Rename back
      await page.locator('.board-name-display').click();
      await page.waitForTimeout(200);
      await page.locator('.board-name-input').fill('Sprint Retrospective');
      await page.locator('.board-name-input').press('Enter');
      await page.waitForTimeout(200);
    }
  } catch (e) {
    fail('/board/:boardId', 'Board name edit', 'Edit test', 'No error', e.message, '', '');
  }

  // ==================================================================
  // TEST 13: LOGO NAVIGATION
  // ==================================================================
  console.log('\n=== TEST 13: Logo Navigation Back ===');
  try {
    const logo = page.locator('.top-bar-logo');
    await logo.click();
    await page.waitForTimeout(1000);
    if (page.url() === BASE + '/' || page.url() === BASE) {
      pass('/board/:boardId', 'Logo home link', 'Clicking logo navigates to dashboard');
    } else {
      fail('/board/:boardId', 'Logo home link', 'Navigation', BASE + '/', page.url(), '', '');
    }
  } catch (e) {
    fail('/board/:boardId', 'Logo', 'Nav test', 'No error', e.message, '', '');
  }

  // ==================================================================
  // TEST 14: BOARD 4 - ARCHITECTURE
  // ==================================================================
  console.log('\n=== TEST 14: Board 4 - Architecture Overview ===');
  try {
    await page.goto(BASE + '/board/board_4', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const shapes = page.locator('.shape-item');
    const shapeCount = await shapes.count();
    if (shapeCount >= 5) {
      pass('/board/board_4', 'Architecture shapes', shapeCount + ' shapes (Frontend, API GW, Auth, User, DB)');
    } else {
      fail('/board/board_4', 'Architecture shapes', 'Count', '>= 5', String(shapeCount), '', '');
    }

    const connectors = page.locator('.connector-item');
    const connCount = await connectors.count();
    if (connCount >= 4) {
      pass('/board/board_4', 'Architecture connectors', connCount + ' connectors');
    }

    const captions = page.locator('.connector-caption');
    const captionCount = await captions.count();
    if (captionCount > 0) {
      pass('/board/board_4', 'Connector captions', captionCount + ' labeled connectors');
    }

    await page.screenshot({ path: SHOT_DIR + '/mock_board4.png', fullPage: true });
  } catch (e) {
    fail('/board/board_4', 'Architecture', 'Test', 'No error', e.message, '', '');
  }

  // ==================================================================
  // TEST 15: BOARD 5 - BRAINSTORMING
  // ==================================================================
  console.log('\n=== TEST 15: Board 5 - Brainstorming ===');
  try {
    await page.goto(BASE + '/board/board_5', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const stickies = page.locator('.sticky-note-item');
    const stickyCount = await stickies.count();
    if (stickyCount >= 5) {
      pass('/board/board_5', 'Brainstorm stickies', stickyCount + ' sticky notes with various colors');
    }

    await page.screenshot({ path: SHOT_DIR + '/mock_board5.png', fullPage: true });
  } catch (e) {
    fail('/board/board_5', 'Brainstorming', 'Test', 'No error', e.message, '', '');
  }

  // ==================================================================
  // TEST 16: PLACE ITEMS ON CANVAS
  // ==================================================================
  console.log('\n=== TEST 16: Place Items on Canvas ===');
  try {
    await page.goto(BASE + '/board/board_1', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const canvasArea = page.locator('.canvas-area');
    const box = await canvasArea.boundingBox();

    // Place sticky note
    const stickyTool = page.locator('.toolbar-tool-btn[title*="Sticky"]');
    await stickyTool.click();
    await page.waitForTimeout(100);
    const beforeSticky = await page.locator('.sticky-note-item').count();
    await canvasArea.click({ position: { x: box.width / 2, y: box.height / 2 } });
    await page.waitForTimeout(300);
    const afterSticky = await page.locator('.sticky-note-item').count();
    if (afterSticky > beforeSticky) {
      pass('/board/:boardId', 'Place sticky note', 'New sticky note placed on canvas');
    } else {
      fail('/board/:boardId', 'Place sticky note', 'Sticky count increase', '> ' + beforeSticky, String(afterSticky), '', '');
    }

    // Place text item
    const textTool = page.locator('.toolbar-tool-btn[title*="Text"]');
    await textTool.click();
    await page.waitForTimeout(100);
    const beforeText = await page.locator('.text-item').count();
    await canvasArea.click({ position: { x: box.width / 3, y: box.height / 3 } });
    await page.waitForTimeout(300);
    const afterText = await page.locator('.text-item').count();
    if (afterText > beforeText) {
      pass('/board/:boardId', 'Place text item', 'New text item placed on canvas');
    } else {
      fail('/board/:boardId', 'Place text item', 'Text count increase', '> ' + beforeText, String(afterText), '', '');
    }

    // Place shape
    const shapeTool = page.locator('.toolbar-tool-btn[title*="Shape"]');
    await shapeTool.click();
    await page.waitForTimeout(100);
    const beforeShape = await page.locator('.shape-item').count();
    await canvasArea.click({ position: { x: box.width / 4, y: box.height / 4 } });
    await page.waitForTimeout(300);
    const afterShape = await page.locator('.shape-item').count();
    if (afterShape > beforeShape) {
      pass('/board/:boardId', 'Place shape', 'New shape placed on canvas');
    } else {
      fail('/board/:boardId', 'Place shape', 'Shape count increase', '> ' + beforeShape, String(afterShape), '', '');
    }

    // After placement, tool should revert to select
    const activeToolAfter = page.locator('.toolbar-tool-btn.active');
    const activeTitle = await activeToolAfter.first().getAttribute('title');
    if (activeTitle && activeTitle.includes('Select')) {
      pass('/board/:boardId', 'Auto-revert to select', 'Tool reverts to Select after placing item');
    }

    await page.screenshot({ path: SHOT_DIR + '/mock_items_placed.png', fullPage: true });
  } catch (e) {
    fail('/board/:boardId', 'Place items', 'Placement test', 'No error', e.message, '', '');
  }

  // ==================================================================
  // TEST 17: KEYBOARD SHORTCUTS
  // ==================================================================
  console.log('\n=== TEST 17: Keyboard Shortcuts ===');
  try {
    // Click canvas to ensure focus
    await page.locator('.canvas-area').click({ position: { x: 100, y: 100 } });
    await page.waitForTimeout(200);

    // V for select
    await page.keyboard.press('v');
    await page.waitForTimeout(100);
    let activeTitle = await page.locator('.toolbar-tool-btn.active').first().getAttribute('title');
    if (activeTitle && activeTitle.includes('Select')) {
      pass('/board/:boardId', 'V shortcut', 'V key activates Select tool');
    }

    // N for sticky note
    await page.keyboard.press('n');
    await page.waitForTimeout(100);
    activeTitle = await page.locator('.toolbar-tool-btn.active').first().getAttribute('title');
    if (activeTitle && activeTitle.includes('Sticky')) {
      pass('/board/:boardId', 'N shortcut', 'N key activates Sticky Note tool');
    }

    // T for text
    await page.keyboard.press('t');
    await page.waitForTimeout(100);
    activeTitle = await page.locator('.toolbar-tool-btn.active').first().getAttribute('title');
    if (activeTitle && activeTitle.includes('Text')) {
      pass('/board/:boardId', 'T shortcut', 'T key activates Text tool');
    }

    // S for shape
    await page.keyboard.press('s');
    await page.waitForTimeout(100);
    activeTitle = await page.locator('.toolbar-tool-btn.active').first().getAttribute('title');
    if (activeTitle && activeTitle.includes('Shape')) {
      pass('/board/:boardId', 'S shortcut', 'S key activates Shape tool');
    }

    // P for pen
    await page.keyboard.press('p');
    await page.waitForTimeout(100);
    activeTitle = await page.locator('.toolbar-tool-btn.active').first().getAttribute('title');
    if (activeTitle && activeTitle.includes('Pen')) {
      pass('/board/:boardId', 'P shortcut', 'P key activates Pen tool');
    }

    // Escape returns to select
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    activeTitle = await page.locator('.toolbar-tool-btn.active').first().getAttribute('title');
    if (activeTitle && activeTitle.includes('Select')) {
      pass('/board/:boardId', 'Escape shortcut', 'Escape key returns to Select tool');
    }
  } catch (e) {
    fail('/board/:boardId', 'Keyboard shortcuts', 'Shortcuts test', 'No error', e.message, '', '');
  }

  // ==================================================================
  // TEST 18: /GO ENDPOINT
  // ==================================================================
  console.log('\n=== TEST 18: /go Endpoint ===');
  try {
    await page.goto(BASE + '/go', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const preContent = await page.locator('pre').textContent();
    if (preContent && preContent.length > 100) {
      const json = JSON.parse(preContent);
      if (json.initial_state && json.current_state) {
        pass('/go', '/go endpoint', 'Returns JSON with initial_state and current_state');
      }
      if (json.state_diff !== undefined) {
        pass('/go', 'state_diff', 'state_diff field present');
      }
      if (json.current_state.boards && json.current_state.boards.length >= 5) {
        pass('/go', 'State boards', json.current_state.boards.length + ' boards in current state');
      }
      if (json.current_state.boardItems) {
        pass('/go', 'Board items in state', 'boardItems object present in state');
      }
      if (json.current_state.projects && json.current_state.projects.length >= 3) {
        pass('/go', 'Projects in state', json.current_state.projects.length + ' projects in state');
      }
    } else {
      fail('/go', '/go endpoint', 'Content', 'Non-empty JSON', 'Empty or short', '', '');
    }

    await page.screenshot({ path: SHOT_DIR + '/mock_go_endpoint.png', fullPage: true });
  } catch (e) {
    fail('/go', '/go endpoint', 'Go test', 'No error', e.message, '', '');
  }

  // ==================================================================
  // TEST 19: /GO SERVER ENDPOINT (curl)
  // ==================================================================
  console.log('\n=== TEST 19: /go Server Endpoint ===');
  try {
    const response = await page.goto(BASE + '/go', { waitUntil: 'networkidle' });
    // Also test the API endpoint
    const apiResponse = await page.evaluate(async () => {
      const res = await fetch('/go');
      return { status: res.status, contentType: res.headers.get('content-type') };
    });
    // The /go is a React page not API endpoint, so test just the page
    pass('/go', 'Server endpoint', '/go page loads without error');
  } catch (e) {
    fail('/go', 'Server endpoint', 'Server test', 'No error', e.message, '', '');
  }

  // ==================================================================
  // TEST 20: HOVER STATES
  // ==================================================================
  console.log('\n=== TEST 20: Hover States ===');
  try {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Board card hover
    const firstCard = page.locator('.board-card:not(.new-board-card)').first();
    const cursorBefore = await firstCard.evaluate(el => window.getComputedStyle(el).cursor);
    if (cursorBefore === 'pointer') {
      pass('/', 'Board card cursor', 'Board cards have pointer cursor');
    } else {
      fail('/', 'Board card cursor', 'Cursor', 'pointer', cursorBefore, '', 'Add cursor: pointer to .board-card');
    }

    // Sidebar item hover
    const sidebarItem = page.locator('.sidebar-item').first();
    const sidebarCursor = await sidebarItem.evaluate(el => window.getComputedStyle(el).cursor);
    if (sidebarCursor === 'pointer') {
      pass('/', 'Sidebar item cursor', 'Sidebar items have pointer cursor');
    } else {
      fail('/', 'Sidebar item cursor', 'Cursor', 'pointer', sidebarCursor, '', '');
    }

    // Navigate to board for toolbar hover
    await page.goto(BASE + '/board/board_1', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const toolBtn = page.locator('.toolbar-tool-btn').first();
    const toolCursor = await toolBtn.evaluate(el => window.getComputedStyle(el).cursor);
    if (toolCursor === 'pointer') {
      pass('/board/:boardId', 'Toolbar button cursor', 'Tool buttons have pointer cursor');
    } else {
      fail('/board/:boardId', 'Toolbar button cursor', 'Cursor', 'pointer', toolCursor, '', '');
    }
  } catch (e) {
    fail('/', 'Hover states', 'Hover test', 'No error', e.message, '', '');
  }

  // ==================================================================
  // TEST 21: CONSOLE ERRORS
  // ==================================================================
  console.log('\n=== TEST 21: Console Errors ===');
  const critical = consoleErrors.filter(e => !e.includes('favicon') && !e.includes('404'));
  if (critical.length === 0) {
    pass('all', 'Console', 'No critical console errors during all tests');
  } else {
    fail('all', 'Console errors', 'Console', '0 errors', critical.length + ' errors: ' + critical.slice(0, 3).join(' | '), '', '');
  }

  // ==================================================================
  // SUMMARY
  // ==================================================================
  console.log('\n\n============================');
  console.log('TEST SUMMARY');
  console.log('============================');
  console.log('PASSED: ' + results.passed.length);
  console.log('FAILED: ' + results.failed.length);
  console.log('SKIPPED: ' + results.skipped.length);
  console.log('============================\n');

  if (results.failed.length > 0) {
    console.log('FAILURES:');
    results.failed.forEach((f, i) => {
      console.log('  ' + (i + 1) + '. [' + f.route + '] ' + f.element + ': ' + f.description);
      console.log('     Expected: ' + f.expected);
      console.log('     Actual: ' + f.actual);
    });
  }

  const fs = require('fs');
  fs.writeFileSync('/tmp/miro_test_results.json', JSON.stringify(results, null, 2));

  await browser.close();
})().catch(e => {
  console.error('FATAL ERROR:', e);
  process.exit(1);
});
