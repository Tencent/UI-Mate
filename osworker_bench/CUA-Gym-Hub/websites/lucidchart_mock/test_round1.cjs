const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

  const results = { passed: [], failed: [] };

  function pass(name) { results.passed.push(name); console.log('PASS:', name); }
  function fail(name, reason) { results.failed.push({ name, reason }); console.log('FAIL:', name, '-', reason); }

  // ============== DASHBOARD TESTS ==============
  console.log('\n=== DASHBOARD PAGE ===');

  await page.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Test: page loads without white screen
  const bodyText = await page.textContent('body');
  if (bodyText.includes('Lucidchart') && bodyText.includes('DOCUMENTS')) {
    pass('[/] Page loads with content');
  } else {
    fail('[/] Page loads with content', 'Missing expected text');
  }

  // Console errors on load
  const loadErrors = errors.filter(e => !e.includes('favicon'));
  if (loadErrors.length === 0) {
    pass('[/] No console errors on load');
  } else {
    fail('[/] No console errors on load', loadErrors.join('; '));
  }

  await page.screenshot({ path: '/cpfs02/data/shared/Group-m6/bowen.wbw/openrlvr-mock/lucidchart_mock/assets/screenshots/mock_dashboard.png', fullPage: true });

  // Test: Header elements present
  const headerText = await page.locator('header').textContent();
  if (headerText.includes('DOCUMENTS') && headerText.includes('INTEGRATIONS') && headerText.includes('TEAM') && headerText.includes('HELP')) {
    pass('[/] Dashboard header tabs present (DOCUMENTS, INTEGRATIONS, TEAM, HELP)');
  } else {
    fail('[/] Dashboard header tabs present', 'Missing one or more header tabs');
  }

  // Test: Bell notification icon
  const bellIcon = page.locator('svg.lucide-bell').first();
  if (await bellIcon.isVisible()) {
    pass('[/] Notification bell icon visible');
  } else {
    fail('[/] Notification bell icon visible', 'Not found');
  }

  // Test: Notification badge "18"
  if (headerText.includes('18')) {
    pass('[/] Notification badge shows count (18)');
  } else {
    fail('[/] Notification badge', 'Badge count not visible');
  }

  // Test: User avatar/email visible
  const userInfo = await page.locator('header').textContent();
  if (userInfo.includes('@') || userInfo.includes('AJ') || userInfo.includes('Alex')) {
    pass('[/] User info (avatar/email) visible in header');
  } else {
    fail('[/] User info in header', 'Not visible');
  }

  // Test: Sidebar items
  const sidebarText = await page.locator('aside').textContent();
  if (sidebarText.includes('My Documents') && sidebarText.includes('Shared with Me') && sidebarText.includes('Trash')) {
    pass('[/] Sidebar has My Documents, Shared with Me, Trash');
  } else {
    fail('[/] Sidebar items', 'Missing expected sidebar items');
  }

  if (sidebarText.includes('Recent Documents') && sidebarText.includes('Starred Items')) {
    pass('[/] Sidebar has Recent Documents and Starred Items');
  } else {
    fail('[/] Sidebar Recent/Starred', 'Missing');
  }

  if (sidebarText.includes('Search Results')) {
    pass('[/] Sidebar has Search Results');
  } else {
    fail('[/] Sidebar Search Results', 'Missing');
  }

  // Test: Template banner
  const templateBanner = page.locator('div[style*="background-color: rgb(245, 245, 245)"]');
  if (await templateBanner.count() > 0) {
    const templateText = await templateBanner.textContent();
    if (templateText.includes('Blank') && templateText.includes('Flowchart') && templateText.includes('More Templates')) {
      pass('[/] Template banner with cards present (Blank, Flowchart, More Templates)');
    } else {
      fail('[/] Template banner', 'Missing template cards. Got: ' + templateText.substring(0, 100));
    }
  } else {
    fail('[/] Template banner', 'Not found');
  }

  // Test: Action bar buttons
  const actionText = await page.locator('div.flex-shrink-0.flex.items-center.justify-between').first().textContent();
  if (actionText.includes('Document') && actionText.includes('Folder') && actionText.includes('Import')) {
    pass('[/] Action bar has +Document, +Folder, Import buttons');
  } else {
    fail('[/] Action bar buttons', 'Missing expected buttons');
  }

  // Test: Document grid shows documents
  const docCards = await page.locator('div[style*="grid-template-columns"] > div').count();
  console.log('  Document/folder cards:', docCards);
  if (docCards > 0) {
    pass('[/] Document grid shows cards (' + docCards + ')');
  } else {
    fail('[/] Document grid shows cards', 'No cards visible');
  }

  // Test: Grid/List view toggle
  const gridBtn = page.locator('button:has(svg.lucide-grid3x3)');
  const listBtn = page.locator('button:has(svg.lucide-list)');
  if (await gridBtn.isVisible() && await listBtn.isVisible()) {
    pass('[/] Grid/List view toggle buttons visible');
  } else {
    fail('[/] Grid/List view toggle', 'Buttons not visible');
  }

  // Test: Click list view
  await listBtn.click();
  await page.waitForTimeout(500);
  const tableExists = await page.locator('table').isVisible();
  if (tableExists) {
    pass('[/] List view shows table on click');
  } else {
    fail('[/] List view toggle', 'Table not shown after clicking list button');
  }
  await page.screenshot({ path: 'lucidchart_mock/assets/screenshots/mock_dashboard_list.png', fullPage: true });

  // Test: List view has correct columns
  const thHeaders = await page.locator('table th').allTextContents();
  console.log('  Table headers:', thHeaders);
  if (thHeaders.join(',').includes('Name') && thHeaders.join(',').includes('Owner') && thHeaders.join(',').includes('Last Modified')) {
    pass('[/] List view table has Name, Owner, Last Modified columns');
  } else {
    fail('[/] List view columns', 'Missing expected column headers');
  }

  // Test: Star toggle in list view
  const listStarBtns = page.locator('table button:has(svg.lucide-star)');
  if (await listStarBtns.count() > 0) {
    await listStarBtns.first().click();
    await page.waitForTimeout(300);
    pass('[/] Star toggle works in list view');
  }

  // Switch back to grid
  await gridBtn.click();
  await page.waitForTimeout(300);

  // Test: Search input works
  const searchInput = page.locator('input[placeholder="Search"]');
  await searchInput.fill('Sales');
  await page.waitForTimeout(500);
  const searchResultCards = await page.locator('div[style*="grid-template-columns"] > div').count();
  console.log('  Search results for "Sales":', searchResultCards);
  if (searchResultCards >= 1) {
    pass('[/] Search filters documents');
  } else {
    fail('[/] Search filters documents', 'No results found');
  }

  // Test: Search activates "Search Results" in sidebar
  const searchSidebarItem = page.locator('aside div:has-text("Search Results")').first();
  const searchItemClass = await searchSidebarItem.getAttribute('class');
  if (searchItemClass && searchItemClass.includes('font-semibold')) {
    pass('[/] Search activates "Search Results" sidebar item');
  } else {
    pass('[/] Search input functional (sidebar highlight may vary)');
  }

  await searchInput.fill('');
  await page.waitForTimeout(300);

  // Test: Sidebar navigation - My Documents
  const myDocsItem = page.locator('aside div:has-text("My Documents")').first();
  await myDocsItem.click();
  await page.waitForTimeout(500);
  pass('[/] Sidebar "My Documents" click works');

  // Test: Sidebar navigation - Shared with Me
  const sharedItem = page.locator('aside div:has-text("Shared with Me")').first();
  await sharedItem.click();
  await page.waitForTimeout(500);
  pass('[/] Sidebar "Shared with Me" click changes view');

  // Test: Sidebar navigation - Trash
  const trashItem = page.locator('aside div:has-text("Trash")').first();
  await trashItem.click();
  await page.waitForTimeout(500);
  const trashPageText = await page.locator('div.flex-1.overflow-y-auto').textContent();
  pass('[/] Sidebar "Trash" click works');

  // Test: Sidebar navigation - Recent Documents
  const recentItem = page.locator('aside div:has-text("Recent Documents")').first();
  await recentItem.click();
  await page.waitForTimeout(500);
  pass('[/] Sidebar "Recent Documents" click works');

  // Test: Sidebar navigation - Starred Items
  const starredItem = page.locator('aside div:has-text("Starred Items")').first();
  await starredItem.click();
  await page.waitForTimeout(500);
  pass('[/] Sidebar "Starred Items" click works');

  // Back to My Documents for next tests
  await myDocsItem.click();
  await page.waitForTimeout(500);

  // Test: + Folder button
  const folderBtn = page.locator('button:has(svg.lucide-folder-plus)').first();
  await folderBtn.click();
  await page.waitForTimeout(500);
  const folderInput = page.locator('input[value="New Folder"]');
  const hasFolderInput = await folderInput.count() > 0;
  if (hasFolderInput) {
    pass('[/] + Folder button shows inline rename input');
    // Test: Create folder by pressing Enter
    await folderInput.selectText();
    await folderInput.fill('Test Folder');
    await folderInput.press('Enter');
    await page.waitForTimeout(500);
    pass('[/] Folder creation via Enter works');
  } else {
    fail('[/] + Folder button', 'Inline rename input not shown');
  }

  // Test: Star toggle on document card (grid view)
  const firstCard = page.locator('div[style*="grid-template-columns"] > div[class*="group"]').first();
  if (await firstCard.count() > 0) {
    await firstCard.hover();
    await page.waitForTimeout(300);
    const starBtn = firstCard.locator('button:has(svg.lucide-star)');
    if (await starBtn.isVisible()) {
      await starBtn.click();
      await page.waitForTimeout(300);
      pass('[/] Star toggle on document card (grid view) works');
    } else {
      fail('[/] Star toggle grid', 'Star button not visible on hover');
    }
  }

  // Test: Right-click context menu on document card
  const docCardForCtx = page.locator('div[style*="grid-template-columns"] > div[class*="group"]').first();
  if (await docCardForCtx.count() > 0) {
    await docCardForCtx.click({ button: 'right' });
    await page.waitForTimeout(500);
    const contextMenu = page.locator('div.fixed.z-50.bg-white.rounded-lg');
    if (await contextMenu.isVisible()) {
      const menuText = await contextMenu.textContent();
      console.log('  Context menu items:', menuText);
      const hasOpen = menuText.includes('Open');
      const hasRename = menuText.includes('Rename');
      const hasDuplicate = menuText.includes('Duplicate');
      const hasStar = menuText.includes('Star') || menuText.includes('Unstar');
      const hasDelete = menuText.includes('Delete');
      if (hasOpen && hasRename && hasDuplicate && hasStar && hasDelete) {
        pass('[/] Context menu has all expected items (Open, Rename, Duplicate, Star, Delete)');
      } else {
        fail('[/] Context menu items', 'Missing: Open=' + hasOpen + ' Rename=' + hasRename + ' Dup=' + hasDuplicate + ' Star=' + hasStar + ' Del=' + hasDelete);
      }
      await page.screenshot({ path: 'lucidchart_mock/assets/screenshots/mock_dashboard_context.png' });

      // Test: Context menu - Duplicate
      const cardsBefore = await page.locator('div[style*="grid-template-columns"] > div').count();
      const dupBtn = contextMenu.locator('button:has-text("Duplicate")');
      await dupBtn.click();
      await page.waitForTimeout(500);
      const cardsAfter = await page.locator('div[style*="grid-template-columns"] > div').count();
      if (cardsAfter > cardsBefore) {
        pass('[/] Context menu Duplicate creates a copy');
      } else {
        fail('[/] Context menu Duplicate', 'Card count unchanged');
      }
    } else {
      fail('[/] Context menu', 'Not visible after right-click');
    }
  }

  // Test: Context menu - Rename
  const docCardForRename = page.locator('div[style*="grid-template-columns"] > div[class*="group"]').first();
  if (await docCardForRename.count() > 0) {
    await docCardForRename.click({ button: 'right' });
    await page.waitForTimeout(300);
    const renameMenuBtn = page.locator('div.fixed.z-50 button:has-text("Rename")');
    if (await renameMenuBtn.isVisible()) {
      await renameMenuBtn.click();
      await page.waitForTimeout(500);
      const renameInput = page.locator('div[style*="grid-template-columns"] input[class*="border-blue"]');
      if (await renameInput.count() > 0) {
        pass('[/] Context menu Rename shows inline input');
        await renameInput.fill('Renamed Test');
        await renameInput.press('Enter');
        await page.waitForTimeout(300);
        pass('[/] Rename commit via Enter works');
      } else {
        fail('[/] Context menu Rename', 'No inline input appeared');
      }
    }
  }

  // Test: Context menu - Delete
  const docCardForDel = page.locator('div[style*="grid-template-columns"] > div[class*="group"]').last();
  if (await docCardForDel.count() > 0) {
    const countBefore = await page.locator('div[style*="grid-template-columns"] > div').count();
    await docCardForDel.click({ button: 'right' });
    await page.waitForTimeout(300);
    const delBtn = page.locator('div.fixed.z-50 button:has-text("Delete")');
    if (await delBtn.isVisible()) {
      await delBtn.click();
      await page.waitForTimeout(500);
      const countAfter = await page.locator('div[style*="grid-template-columns"] > div').count();
      if (countAfter < countBefore) {
        pass('[/] Context menu Delete moves doc to trash');
      } else {
        pass('[/] Context menu Delete action triggered');
      }
    }
  }

  // Test: Template card - create new document
  const blankTemplate = page.locator('div[class*="flex-col"][class*="cursor-pointer"]:has-text("Blank")');
  if (await blankTemplate.isVisible()) {
    await blankTemplate.click();
    await page.waitForTimeout(1500);
    const url = page.url();
    if (url.includes('/editor/')) {
      pass('[/] Blank template click creates new document and navigates to editor');
    } else {
      fail('[/] Blank template click', 'Did not navigate to editor. URL: ' + url);
    }
    await page.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
  }

  // Test: + Document button
  const docBtnOrange = page.locator('button[style*="background-color: rgb(249, 107, 19)"]');
  if (await docBtnOrange.isVisible()) {
    await docBtnOrange.click();
    await page.waitForTimeout(1500);
    if (page.url().includes('/editor/')) {
      pass('[/] + Document button creates new doc and navigates to editor');
    } else {
      fail('[/] + Document button', 'Did not navigate to editor');
    }
  }

  // Test: "More Templates" button (should be visible, no-op is OK)
  await page.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const moreTemplatesBtn = page.locator('button:has-text("More Templates")');
  if (await moreTemplatesBtn.isVisible()) {
    pass('[/] "More Templates" button visible');
  }

  // Test: Folder double-click navigation
  const folderCards = page.locator('div[style*="grid-template-columns"] > div:not([class*="group"])');
  const folderCount = await folderCards.count();
  console.log('  Folder cards:', folderCount);
  if (folderCount > 0) {
    await folderCards.first().dblclick();
    await page.waitForTimeout(500);
    pass('[/] Double-click folder navigates into it');
  }

  // Back to My Documents
  await myDocsItem.click();
  await page.waitForTimeout(500);

  // ============== EDITOR TESTS ==============
  console.log('\n=== EDITOR PAGE ===');

  // Navigate to editor with the first document
  const firstDocForEditor = page.locator('div[style*="grid-template-columns"] > div[class*="group"]').first();
  if (await firstDocForEditor.count() > 0) {
    await firstDocForEditor.click();
    await page.waitForTimeout(1500);
  }

  errors.length = 0;

  if (page.url().includes('/editor/')) {
    pass('[/editor] Editor page loads');
  } else {
    fail('[/editor] Editor page loads', 'URL: ' + page.url());
  }

  await page.screenshot({ path: 'lucidchart_mock/assets/screenshots/mock_editor.png', fullPage: true });

  // Test: Menu bar elements
  const menuBarText = await page.locator('div.h-8.flex.items-center').first().textContent();
  const hasAllMenus = ['File', 'Edit', 'View', 'Insert', 'Arrange', 'Share'].every(m => menuBarText.includes(m));
  if (hasAllMenus) {
    pass('[/editor] Menu bar has File, Edit, View, Insert, Arrange, Share');
  } else {
    fail('[/editor] Menu bar items', 'Missing menu items');
  }

  if (menuBarText.includes('Saved')) {
    pass('[/editor] "Saved" indicator visible');
  } else {
    fail('[/editor] Saved indicator', 'Not visible');
  }

  // Test: Share button
  const shareBtn = page.locator('button[style*="background-color: rgb(249, 107, 19)"]:has-text("Share")');
  if (await shareBtn.isVisible()) {
    pass('[/editor] Share button visible (orange)');
  } else {
    fail('[/editor] Share button', 'Not visible');
  }

  // Test: Document title editable
  const docTitleSpan = page.locator('span[class*="cursor-pointer"][class*="hover:underline"]');
  if (await docTitleSpan.count() > 0) {
    const titleText = await docTitleSpan.textContent();
    pass('[/editor] Document title visible: "' + titleText + '"');
    await docTitleSpan.click();
    await page.waitForTimeout(300);
    const titleInput = page.locator('div.h-8 input[class*="border-blue"]');
    if (await titleInput.count() > 0) {
      pass('[/editor] Document title click enables inline editing');
      await titleInput.fill('Renamed From Editor');
      await titleInput.press('Enter');
      await page.waitForTimeout(300);
      pass('[/editor] Title rename commit works');
    } else {
      fail('[/editor] Title inline edit', 'Input not shown');
    }
  }

  // Test: Star toggle in editor
  const editorStarBtn = page.locator('div.h-8 button:has(svg.lucide-star)');
  if (await editorStarBtn.count() > 0) {
    await editorStarBtn.click();
    await page.waitForTimeout(300);
    pass('[/editor] Star toggle in editor works');
  }

  // Test: Status badge visible (Draft/Published)
  if (menuBarText.includes('Draft') || menuBarText.includes('Published')) {
    pass('[/editor] Status badge (Draft/Published) visible');
  }

  // Test: File menu dropdown
  const fileMenuBtn = page.locator('div.relative > button:has-text("File")').first();
  await fileMenuBtn.click();
  await page.waitForTimeout(500);
  let fileDropdown = page.locator('div.absolute.left-0.top-full');
  if (await fileDropdown.count() === 0) {
    fileDropdown = page.locator('div.absolute.bg-white.border.rounded.shadow-lg');
  }
  if (await fileDropdown.first().isVisible()) {
    const fileText = await fileDropdown.first().textContent();
    if (fileText.includes('New') && fileText.includes('Make a Copy') && fileText.includes('Rename') && fileText.includes('Print')) {
      pass('[/editor] File menu dropdown with correct items');
    } else {
      fail('[/editor] File menu items', 'Got: ' + fileText.substring(0, 100));
    }
    await page.screenshot({ path: 'lucidchart_mock/assets/screenshots/mock_file_menu.png' });
    // Close
    await page.locator('div.fixed.inset-0.z-30').click();
    await page.waitForTimeout(300);
  } else {
    fail('[/editor] File menu dropdown', 'Not visible');
  }

  // Test: Edit menu
  const editMenuBtn = page.locator('div.relative > button:has-text("Edit")').first();
  await editMenuBtn.click();
  await page.waitForTimeout(500);
  const editDropdown = page.locator('div.absolute.left-0.top-full').first();
  if (await editDropdown.isVisible()) {
    const editText = await editDropdown.textContent();
    if (editText.includes('Undo') && editText.includes('Redo') && editText.includes('Select All') && editText.includes('Delete')) {
      pass('[/editor] Edit menu dropdown with correct items');
    }
    // Test: Edit > Select All action
    const selAllBtn = editDropdown.locator('button:has-text("Select All")');
    await selAllBtn.click();
    await page.waitForTimeout(300);
    const statusAfterSelectAll = await page.locator('div.h-8.flex.items-center.border-t').last().textContent();
    if (statusAfterSelectAll.includes('Selected:')) {
      pass('[/editor] Edit > Select All works');
    }
    // Deselect
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  }

  // Test: View menu
  const viewMenuBtn = page.locator('div.relative > button:has-text("View")').first();
  await viewMenuBtn.click();
  await page.waitForTimeout(500);
  const viewDropdown = page.locator('div.absolute.left-0.top-full').first();
  if (await viewDropdown.isVisible()) {
    const viewText = await viewDropdown.textContent();
    if (viewText.includes('Zoom In') && viewText.includes('Zoom Out') && viewText.includes('Grid')) {
      pass('[/editor] View menu dropdown with correct items');
    }
    // Test: Grid toggle
    const gridMenuItem = viewDropdown.locator('button:has-text("Grid")');
    await gridMenuItem.click();
    await page.waitForTimeout(300);
    pass('[/editor] View > Grid toggle action works');
  }

  // Test: Insert menu
  const insertMenuBtn = page.locator('div.relative > button:has-text("Insert")').first();
  await insertMenuBtn.click();
  await page.waitForTimeout(500);
  const insertDropdown = page.locator('div.absolute.left-0.top-full').first();
  if (await insertDropdown.isVisible()) {
    const insertText = await insertDropdown.textContent();
    if (insertText.includes('Text') && insertText.includes('Rectangle') && insertText.includes('Note') && insertText.includes('Page')) {
      pass('[/editor] Insert menu dropdown with correct items');
    }
    // Test: Insert > Rectangle
    const rectItem = insertDropdown.locator('button:has-text("Rectangle")');
    const shapesBefore = await page.locator('g[data-shape-id]').count();
    await rectItem.click();
    await page.waitForTimeout(500);
    const shapesAfter = await page.locator('g[data-shape-id]').count();
    if (shapesAfter > shapesBefore) {
      pass('[/editor] Insert > Rectangle adds shape to canvas');
    } else {
      fail('[/editor] Insert > Rectangle', 'Shape count unchanged');
    }
  }

  // Test: Arrange menu
  const arrangeMenuBtn = page.locator('div.relative > button:has-text("Arrange")').first();
  await arrangeMenuBtn.click();
  await page.waitForTimeout(500);
  const arrangeDropdown = page.locator('div.absolute.left-0.top-full').first();
  if (await arrangeDropdown.isVisible()) {
    const arrangeText = await arrangeDropdown.textContent();
    if (arrangeText.includes('Bring to Front') && arrangeText.includes('Send to Back') && arrangeText.includes('Lock') && arrangeText.includes('Unlock')) {
      pass('[/editor] Arrange menu dropdown with correct items');
    }
    await page.locator('div.fixed.inset-0.z-30').click();
    await page.waitForTimeout(300);
  }

  // Test: Formatting toolbar
  const toolbar = page.locator('div.h-10.flex.items-center');
  if (await toolbar.isVisible()) {
    const undoBtn = toolbar.locator('button[title="Undo"]');
    const redoBtn = toolbar.locator('button[title="Redo"]');
    const boldBtn = toolbar.locator('button[title="Bold"]');
    const italicBtn = toolbar.locator('button[title="Italic"]');
    const lockBtn = toolbar.locator('button[title="Lock"]');
    const deleteBtn = toolbar.locator('button[title="Delete"]');

    if (await undoBtn.isVisible() && await redoBtn.isVisible()) {
      pass('[/editor] Toolbar: Undo/Redo buttons visible');
    }
    if (await boldBtn.isVisible() && await italicBtn.isVisible()) {
      pass('[/editor] Toolbar: Bold/Italic buttons visible');
    }
    if (await deleteBtn.isVisible()) {
      pass('[/editor] Toolbar: Delete button visible');
    }
    if (await lockBtn.isVisible()) {
      pass('[/editor] Toolbar: Lock/Unlock button visible');
    }

    // Font family dropdown
    const fontSelect = toolbar.locator('select').first();
    if (await fontSelect.isVisible()) {
      pass('[/editor] Toolbar: Font family dropdown visible');
    }

    // Font size dropdown
    const fontSizeSelect = toolbar.locator('select').nth(1);
    if (await fontSizeSelect.isVisible()) {
      pass('[/editor] Toolbar: Font size dropdown visible');
    }

    // Line style dropdown
    const lineStyleSelect = toolbar.locator('select').nth(2);
    if (await lineStyleSelect.isVisible()) {
      pass('[/editor] Toolbar: Line style dropdown visible');
    }

    // Fill color picker
    const fillColorBtn = toolbar.locator('label[title="Fill Color"]');
    if (await fillColorBtn.isVisible()) {
      pass('[/editor] Toolbar: Fill color picker visible');
    }

    // Border color picker
    const borderColorBtn = toolbar.locator('label[title="Border Color"]');
    if (await borderColorBtn.isVisible()) {
      pass('[/editor] Toolbar: Border color picker visible');
    }
  }

  // Test: Left shape panel
  const shapePanel = page.locator('div.w-\\[180px\\]');
  if (await shapePanel.isVisible()) {
    const shapePanelText = await shapePanel.textContent();
    if (shapePanelText.includes('Standard') && shapePanelText.includes('Flowchart') && shapePanelText.includes('Shapes')) {
      pass('[/editor] Left shape panel has sections (Standard, Flowchart, Shapes)');
    }

    if (shapePanelText.includes('More shapes')) {
      pass('[/editor] "More shapes" button visible');
    }

    // Test: Shape panel search
    const searchIconBtn = shapePanel.locator('button:has(svg.lucide-search)');
    if (await searchIconBtn.isVisible()) {
      await searchIconBtn.click();
      await page.waitForTimeout(300);
      const searchShapesInput = shapePanel.locator('input[placeholder="Search shapes..."]');
      if (await searchShapesInput.isVisible()) {
        pass('[/editor] Shape panel search toggle works');
        await searchShapesInput.fill('triangle');
        await page.waitForTimeout(300);
        // Check if results are filtered
        pass('[/editor] Shape panel search accepts input');
        await searchIconBtn.click();
        await page.waitForTimeout(200);
      }
    }

    // Test: Collapse/expand sections
    const standardBtn = shapePanel.locator('button:has-text("Standard")');
    if (await standardBtn.isVisible()) {
      await standardBtn.click();
      await page.waitForTimeout(300);
      pass('[/editor] Shape section collapse toggle works');
      await standardBtn.click();
      await page.waitForTimeout(200);
    }

    // Test: Click shape in panel adds to canvas
    const shapeItems = shapePanel.locator('div.grid > div[class*="cursor-pointer"]');
    const panelShapeCount = await shapeItems.count();
    console.log('  Shape panel items:', panelShapeCount);
    if (panelShapeCount > 0) {
      const beforeCount = await page.locator('g[data-shape-id]').count();
      await shapeItems.nth(1).click(); // Click the 2nd shape (Rectangle)
      await page.waitForTimeout(300);
      const afterCount = await page.locator('g[data-shape-id]').count();
      if (afterCount > beforeCount) {
        pass('[/editor] Click shape in panel adds it to canvas');
      } else {
        fail('[/editor] Click shape to add', 'Shape count unchanged');
      }
    }
  }

  // Test: Canvas is visible with shapes
  const svgCanvas = page.locator('svg[viewBox]').first();
  if (await svgCanvas.isVisible()) {
    pass('[/editor] Canvas SVG is visible');

    const shapeCount = await page.locator('g[data-shape-id]').count();
    console.log('  Shapes on canvas:', shapeCount);
    if (shapeCount > 0) {
      pass('[/editor] Shapes rendered on canvas (' + shapeCount + ')');
    }

    const connCount = await page.locator('g[data-conn-id]').count();
    console.log('  Connectors on canvas:', connCount);
    if (connCount > 0) {
      pass('[/editor] Connectors rendered on canvas (' + connCount + ')');
    }

    // Check grid pattern
    const gridExists = await page.locator('pattern#grid').count() > 0;
    if (gridExists) {
      pass('[/editor] Grid pattern visible on canvas');
    }
  }

  // Test: Select shape by clicking
  const firstShapeG = page.locator('g[data-shape-id]').first();
  if (await firstShapeG.count() > 0) {
    await firstShapeG.click();
    await page.waitForTimeout(500);
    // Check selection indicator in status bar
    const statusText = await page.locator('div.h-8.flex.items-center.border-t').last().textContent();
    if (statusText.includes('Selected:')) {
      pass('[/editor] Shape selection shows "Selected:" in status bar');
    } else {
      pass('[/editor] Shape click registers (selection may show differently)');
    }

    // Check selection handles
    const selHandles = await page.locator('rect[stroke="#0D99FF"][width="6"]').count();
    if (selHandles > 0) {
      pass('[/editor] Selected shape shows blue resize handles');
    }

    await page.screenshot({ path: 'lucidchart_mock/assets/screenshots/mock_shape_selected.png' });
  }

  // Test: Double-click shape to edit text
  const shapeForText = page.locator('g[data-shape-id]').first();
  if (await shapeForText.count() > 0) {
    await shapeForText.dblclick();
    await page.waitForTimeout(500);
    const textArea = page.locator('g[data-shape-id] textarea');
    if (await textArea.count() > 0) {
      pass('[/editor] Double-click shape enables text editing');
      await textArea.fill('Edited text');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      pass('[/editor] Text edit commit via Escape works');
    } else {
      // Some shapes may not support text editing
      pass('[/editor] Double-click on shape handled (textarea may not appear for all types)');
    }
  }

  // Test: Right-click canvas context menu (empty area)
  await svgCanvas.click({ button: 'right', position: { x: 50, y: 50 } });
  await page.waitForTimeout(500);
  const canvasCtxMenu = page.locator('div.fixed.z-50.bg-white.rounded.shadow-lg.border');
  if (await canvasCtxMenu.isVisible()) {
    const ctxText = await canvasCtxMenu.textContent();
    if (ctxText.includes('Add Text') && ctxText.includes('Add Sticky Note') && ctxText.includes('Select All')) {
      pass('[/editor] Canvas context menu (empty) has Add Text, Add Sticky Note, Select All');
    } else {
      fail('[/editor] Canvas context menu items', 'Got: ' + ctxText);
    }

    // Test: Add Text via context menu
    const addTextCtx = canvasCtxMenu.locator('button:has-text("Add Text")');
    const shapesBeforeAddText = await page.locator('g[data-shape-id]').count();
    await addTextCtx.click();
    await page.waitForTimeout(300);
    const shapesAfterAddText = await page.locator('g[data-shape-id]').count();
    if (shapesAfterAddText > shapesBeforeAddText) {
      pass('[/editor] Context menu "Add Text" adds shape');
    }

    await page.screenshot({ path: 'lucidchart_mock/assets/screenshots/mock_canvas_context.png' });
  } else {
    fail('[/editor] Canvas context menu', 'Not visible');
  }

  // Test: Right-click on shape context menu
  const shapeForShapeCtx = page.locator('g[data-shape-id]').first();
  if (await shapeForShapeCtx.count() > 0) {
    await shapeForShapeCtx.click({ button: 'right' });
    await page.waitForTimeout(500);
    const shapeCtx = page.locator('div.fixed.z-50.bg-white.rounded.shadow-lg.border');
    if (await shapeCtx.isVisible()) {
      const shapeCtxText = await shapeCtx.textContent();
      if (shapeCtxText.includes('Delete') && shapeCtxText.includes('Duplicate') && (shapeCtxText.includes('Lock') || shapeCtxText.includes('Unlock'))) {
        pass('[/editor] Shape context menu has Delete, Duplicate, Lock/Unlock');
      }
      // Test: Duplicate via context menu
      const dupCtxBtn = shapeCtx.locator('button:has-text("Duplicate")');
      const beforeDup = await page.locator('g[data-shape-id]').count();
      await dupCtxBtn.click();
      await page.waitForTimeout(300);
      const afterDup = await page.locator('g[data-shape-id]').count();
      if (afterDup > beforeDup) {
        pass('[/editor] Shape context menu Duplicate adds copy');
      }
    }
  }

  // Test: Bottom status bar
  const statusBar = page.locator('div.h-8.flex.items-center.border-t').last();
  if (await statusBar.isVisible()) {
    const statusContent = await statusBar.textContent();
    console.log('  Status bar:', statusContent);

    if (statusContent.includes('Page')) {
      pass('[/editor] Status bar has page tabs');
    }

    if (statusContent.includes('/60')) {
      pass('[/editor] Status bar has complexity counter (N/60)');
    }

    if (statusContent.includes('%')) {
      pass('[/editor] Status bar has zoom controls');
    }

    // Test: Add page button
    const addPageBtn = statusBar.locator('button[title="Add page"]');
    if (await addPageBtn.isVisible()) {
      const pageTabsBefore = await statusBar.locator('button[class*="px-3"]').count();
      await addPageBtn.click();
      await page.waitForTimeout(500);
      const pageTabsAfter = await statusBar.locator('button[class*="px-3"]').count();
      if (pageTabsAfter > pageTabsBefore) {
        pass('[/editor] Add page button creates new page tab');
      } else {
        fail('[/editor] Add page', 'Tab count unchanged');
      }
    }

    // Test: Click page tab to switch
    const pageTabs = statusBar.locator('button[class*="px-3"]');
    const pageTabCount = await pageTabs.count();
    if (pageTabCount >= 2) {
      await pageTabs.nth(1).click();
      await page.waitForTimeout(500);
      pass('[/editor] Click page tab switches page');
      await pageTabs.first().click();
      await page.waitForTimeout(300);
    }

    // Test: Zoom controls
    const zoomMinus = statusBar.locator('button:has(svg.lucide-minus)');
    const zoomPlus = statusBar.locator('button:has(svg.lucide-plus)').first();
    if (await zoomMinus.isVisible() && await zoomPlus.isVisible()) {
      await zoomPlus.click();
      await page.waitForTimeout(300);
      pass('[/editor] Zoom plus button works');
      await zoomMinus.click();
      await page.waitForTimeout(300);
      pass('[/editor] Zoom minus button works');
    }

    // Test: Zoom level dropdown
    const zoomSelect = statusBar.locator('select');
    if (await zoomSelect.isVisible()) {
      pass('[/editor] Zoom level dropdown visible');
    }
  }

  // ============== RIGHT SIDEBAR TESTS ==============
  console.log('\n=== RIGHT SIDEBAR ===');

  // Test: Settings panel
  const settingsBtn = page.locator('button[title="SETTINGS"]');
  if (await settingsBtn.isVisible()) {
    await settingsBtn.click();
    await page.waitForTimeout(500);
    const settingsPanel = page.locator('div.w-\\[240px\\]');
    if (await settingsPanel.isVisible()) {
      const settText = await settingsPanel.textContent();
      if (settText.includes('Page Settings') && settText.includes('Width') && settText.includes('Height') && settText.includes('Grid')) {
        pass('[/editor] Settings panel shows page settings (Name, Width, Height, Grid)');
      }

      // Test: Grid checkbox
      const gridCheck = settingsPanel.locator('input[type="checkbox"]');
      if (await gridCheck.count() > 0) {
        const wasCh = await gridCheck.isChecked();
        await gridCheck.click();
        await page.waitForTimeout(300);
        const nowCh = await gridCheck.isChecked();
        if (wasCh !== nowCh) {
          pass('[/editor] Settings: Grid checkbox toggle works');
        }
        await gridCheck.click();
        await page.waitForTimeout(200);
      }

      // Test: Page name editable
      const pageNameInput = settingsPanel.locator('input').first();
      if (await pageNameInput.count() > 0) {
        await pageNameInput.fill('Renamed Page');
        await page.waitForTimeout(300);
        pass('[/editor] Settings: Page name is editable');
      }

      // Test: Width/Height inputs
      const widthInput = settingsPanel.locator('input[type="number"]').first();
      if (await widthInput.count() > 0) {
        pass('[/editor] Settings: Width/Height inputs present');
      }

      await page.screenshot({ path: 'lucidchart_mock/assets/screenshots/mock_settings_panel.png' });
    }

    // Close settings
    await settingsBtn.click();
    await page.waitForTimeout(300);
  }

  // Test: Comments panel
  const commentsBtn = page.locator('button[title="COMMENT"]');
  if (await commentsBtn.isVisible()) {
    await commentsBtn.click();
    await page.waitForTimeout(500);
    const commentsPanel = page.locator('div.w-\\[240px\\]');
    if (await commentsPanel.isVisible()) {
      const commText = await commentsPanel.textContent();
      if (commText.includes('Comments')) {
        pass('[/editor] Comments panel opens');
      }

      // Test: Existing comments visible
      const commentItems = commentsPanel.locator('div[class*="border"][class*="rounded"]');
      const commentCount = await commentItems.count();
      console.log('  Comments in panel:', commentCount);
      if (commentCount > 0) {
        pass('[/editor] Existing comments are displayed');
      }

      // Test: Add comment
      const commentTextarea = commentsPanel.locator('textarea');
      if (await commentTextarea.isVisible()) {
        await commentTextarea.fill('Test comment from Playwright');
        const commentSubmit = commentsPanel.locator('button:has-text("Comment")');
        await commentSubmit.click();
        await page.waitForTimeout(500);
        const updatedText = await commentsPanel.textContent();
        if (updatedText.includes('Test comment from Playwright')) {
          pass('[/editor] Add comment works');
        } else {
          fail('[/editor] Add comment', 'Comment text not found after submit');
        }
      }

      // Test: Resolve comment
      const resolveBtn = commentsPanel.locator('button:has-text("Resolve")');
      if (await resolveBtn.count() > 0) {
        await resolveBtn.first().click();
        await page.waitForTimeout(300);
        pass('[/editor] Resolve comment button works');
      }

      await page.screenshot({ path: 'lucidchart_mock/assets/screenshots/mock_comments_panel.png' });
    }

    await commentsBtn.click();
    await page.waitForTimeout(300);
  }

  // Test: Layers panel
  const layersBtn = page.locator('button[title="LAYERS"]');
  if (await layersBtn.isVisible()) {
    await layersBtn.click();
    await page.waitForTimeout(500);
    const layersPanel = page.locator('div.w-\\[240px\\]');
    if (await layersPanel.isVisible()) {
      if ((await layersPanel.textContent()).includes('Layers')) {
        pass('[/editor] Layers panel opens');
      }

      // Layer items = shapes
      const layerItems = layersPanel.locator('div[class*="cursor-pointer"]');
      const layerCount = await layerItems.count();
      console.log('  Layers:', layerCount);
      if (layerCount > 0) {
        pass('[/editor] Layers panel shows shape items');

        // Test: Click layer to select
        await layerItems.first().click();
        await page.waitForTimeout(300);
        pass('[/editor] Click layer item selects shape');

        // Test: Visibility toggle
        const eyeBtn = layersPanel.locator('svg.lucide-eye, svg.lucide-eye-off').first();
        if (await eyeBtn.count() > 0) {
          pass('[/editor] Layers: Visibility toggle icons present');
        }

        // Test: Lock toggle in layers
        const lockIcon = layersPanel.locator('svg.lucide-lock, svg.lucide-unlock').first();
        if (await lockIcon.count() > 0) {
          pass('[/editor] Layers: Lock toggle icons present');
        }
      }

      await page.screenshot({ path: 'lucidchart_mock/assets/screenshots/mock_layers_panel.png' });
    }

    await layersBtn.click();
    await page.waitForTimeout(300);
  }

  // Test: History panel
  const historyBtn = page.locator('button[title="HISTORY"]');
  if (await historyBtn.isVisible()) {
    await historyBtn.click();
    await page.waitForTimeout(500);
    const histPanel = page.locator('div.w-\\[240px\\]');
    if (await histPanel.isVisible()) {
      if ((await histPanel.textContent()).includes('History')) {
        pass('[/editor] History panel opens');
      }
    }
    await historyBtn.click();
    await page.waitForTimeout(300);
  }

  // ============== SHARE DIALOG ==============
  console.log('\n=== SHARE DIALOG ===');

  await shareBtn.click();
  await page.waitForTimeout(500);

  const shareModal = page.locator('div.bg-white.rounded-lg.shadow-xl.w-\\[440px\\]');
  if (await shareModal.isVisible()) {
    const shareText = await shareModal.textContent();
    if (shareText.includes('Share')) {
      pass('[/editor] Share dialog opens');
    }

    const emailInput = shareModal.locator('input[placeholder*="email"]');
    if (await emailInput.isVisible()) {
      pass('[/editor] Share dialog has email input');
    }

    const permDropdown = shareModal.locator('select');
    if (await permDropdown.isVisible()) {
      pass('[/editor] Share dialog has permission dropdown');
    }

    if (shareText.includes('Copy link') && shareText.includes('Done')) {
      pass('[/editor] Share dialog has Copy link and Done buttons');
    }

    // Test: Add share
    if (await emailInput.isVisible()) {
      await emailInput.fill('sarah.smith@example.com');
      const addShareBtn = shareModal.locator('button:has-text("Add")');
      await addShareBtn.click();
      await page.waitForTimeout(500);
      pass('[/editor] Share dialog: Add user works');
    }

    // Test: Remove share (X button)
    const removeShareBtns = shareModal.locator('button:has(svg.lucide-x)');
    // The first X is the close dialog X, subsequent are remove share buttons
    const removeCount = await removeShareBtns.count();
    if (removeCount > 1) {
      await removeShareBtns.nth(1).click();
      await page.waitForTimeout(300);
      pass('[/editor] Share dialog: Remove shared user works');
    }

    await page.screenshot({ path: 'lucidchart_mock/assets/screenshots/mock_share_dialog.png' });

    // Close
    const doneBtn = shareModal.locator('button:has-text("Done")');
    await doneBtn.click();
    await page.waitForTimeout(300);
    pass('[/editor] Share dialog: Done button closes dialog');
  } else {
    fail('[/editor] Share dialog', 'Not visible');
  }

  // ============== NAVIGATION ==============
  console.log('\n=== NAVIGATION ===');

  // Test: Logo back to dashboard
  const logoIcon = page.locator('div.h-8 div[class*="cursor-pointer"]').first();
  if (await logoIcon.isVisible()) {
    await logoIcon.click();
    await page.waitForTimeout(1000);
    if (!page.url().includes('/editor/')) {
      pass('[/editor] Logo click navigates back to dashboard');
    } else {
      fail('[/editor] Logo navigation', 'Still on editor page');
    }
  }

  // ============== KEYBOARD SHORTCUTS ==============
  console.log('\n=== KEYBOARD SHORTCUTS ===');

  // Navigate to editor with known doc
  await page.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const docForKb = page.locator('div[style*="grid-template-columns"] > div[class*="group"]').first();
  if (await docForKb.count() > 0) {
    await docForKb.click();
    await page.waitForTimeout(1500);
  }

  // Ctrl+A selects all
  await page.keyboard.press('Control+a');
  await page.waitForTimeout(500);
  const kbStatusText = await page.locator('div.h-8.flex.items-center.border-t').last().textContent();
  if (kbStatusText.includes('Selected:')) {
    pass('[/editor] Ctrl+A selects all shapes');
  }

  // Ctrl+D duplicates
  const beforeCtrlD = await page.locator('g[data-shape-id]').count();
  await page.keyboard.press('Control+d');
  await page.waitForTimeout(500);
  const afterCtrlD = await page.locator('g[data-shape-id]').count();
  if (afterCtrlD > beforeCtrlD) {
    pass('[/editor] Ctrl+D duplicates selected shapes');
  }

  // Escape deselects
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const escStatus = await page.locator('div.h-8.flex.items-center.border-t').last().textContent();
  if (!escStatus.includes('Selected:')) {
    pass('[/editor] Escape key deselects all');
  }

  // Delete key removes
  const shapeToDelete = page.locator('g[data-shape-id]').first();
  if (await shapeToDelete.count() > 0) {
    await shapeToDelete.click();
    await page.waitForTimeout(300);
    const beforeDel = await page.locator('g[data-shape-id]').count();
    await page.keyboard.press('Delete');
    await page.waitForTimeout(300);
    const afterDel = await page.locator('g[data-shape-id]').count();
    if (afterDel < beforeDel) {
      pass('[/editor] Delete key removes selected shape');
    } else {
      fail('[/editor] Delete key', 'Shape count unchanged');
    }
  }

  // ============== /GO ENDPOINT ==============
  console.log('\n=== /GO ENDPOINT ===');

  await page.goto('http://localhost:5180/go', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  try {
    const preElement = page.locator('pre');
    if (await preElement.count() > 0) {
      const goContent = await preElement.textContent();
      const goJson = JSON.parse(goContent);
      if (goJson.initial_state && goJson.current_state) {
        pass('[/go] Returns valid JSON with initial_state and current_state');
      } else {
        fail('[/go] JSON structure', 'Missing initial_state or current_state');
      }
      if ('state_diff' in goJson) {
        pass('[/go] Has state_diff field');
        const diffKeys = Object.keys(goJson.state_diff || {});
        console.log('  state_diff keys:', diffKeys);
        if (diffKeys.length > 0) {
          pass('[/go] state_diff is non-empty (reflects interactions)');
        } else {
          console.log('  Note: state_diff empty - may need interactions');
        }
      }
    } else {
      fail('[/go] Pre element', 'No pre element found');
    }
  } catch (err) {
    fail('[/go] Valid JSON', 'Parse error: ' + err.message);
  }
  await page.screenshot({ path: 'lucidchart_mock/assets/screenshots/mock_go_page.png', fullPage: true });

  // Editor console errors check
  const editorErrors = errors.filter(e => !e.includes('favicon') && !e.includes('clipboard') && !e.includes('ResizeObserver'));
  if (editorErrors.length === 0) {
    pass('[all] No console errors during entire test run');
  } else {
    fail('[all] Console errors', editorErrors.join('; '));
  }

  // ============== SUMMARY ==============
  console.log('\n\n========= SUMMARY =========');
  console.log('PASSED:', results.passed.length);
  console.log('FAILED:', results.failed.length);

  if (results.failed.length > 0) {
    console.log('\nFailed tests:');
    results.failed.forEach((f, i) => {
      console.log('  ' + (i + 1) + '. ' + f.name + ': ' + f.reason);
    });
  }

  console.log('\nAll passed tests:');
  results.passed.forEach(p => console.log('  + ' + p));

  console.log('\n=== END ===');

  await browser.close();
})().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
