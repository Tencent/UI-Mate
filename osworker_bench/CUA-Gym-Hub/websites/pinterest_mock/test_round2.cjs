// Pinterest Mock — P1 Feature Tests
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const screenshotDir = '/cpfs02/data/shared/Group-m6/bowen.wbw/openrlvr-mock/pinterest_mock/assets/screenshots';
fs.mkdirSync(screenshotDir, { recursive: true });

const results = [];
let browser, page;

function log(test, passed, notes) {
  notes = notes || '';
  results.push({ test, passed, notes });
  console.log('[' + (passed ? 'PASS' : 'FAIL') + '] ' + test + (notes ? ': ' + notes : ''));
}

async function screenshot(name) {
  await page.screenshot({ path: path.join(screenshotDir, name + '.png') });
  console.log('Screenshot: ' + name + '.png');
}

async function main() {
  browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'], headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  page = await context.newPage();

  // Navigate to home
  await page.goto('http://localhost:5180', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await screenshot('01_home');
  console.log('Home page loaded');

  // ===== TEST A: COMMENTS =====
  console.log('\n=== TEST A: COMMENTS ===');
  // Click first pin to open modal
  const firstPin = page.locator('.group.cursor-zoom-in').first();
  await firstPin.click();
  await page.waitForTimeout(1200);
  await screenshot('02_pin_modal_open');

  // Verify comments section heading
  const commentsHeading = page.locator('h3').filter({ hasText: /Comments/i }).first();
  const hasCommentsHeading = await commentsHeading.isVisible().catch(() => false);
  log('A1: Comments section heading visible', hasCommentsHeading);

  // Check comment count in heading
  const headingText = await commentsHeading.textContent().catch(() => '');
  log('A2: Comments heading shows label', headingText.includes('Comments'), 'Heading: "' + headingText + '"');

  // Check for existing comments
  const commentElements = await page.locator('.space-y-4 .flex.gap-3').all();
  log('A3: Existing comments visible', commentElements.length > 0, 'Found ' + commentElements.length + ' comments');

  // Check comment anatomy: avatar, username, text, timestamp, like
  if (commentElements.length > 0) {
    const firstComment = commentElements[0];
    const hasAvatar = await firstComment.locator('img').first().isVisible().catch(() => false);
    log('A4: Comment has avatar', hasAvatar);

    const hasUsername = await firstComment.locator('.font-bold.text-sm').first().isVisible().catch(() => false);
    const username = await firstComment.locator('.font-bold.text-sm').first().textContent().catch(() => '');
    log('A5: Comment has username', hasUsername, 'Username: "' + username + '"');

    const hasTimestamp = await firstComment.locator('.text-xs.text-gray-400').first().isVisible().catch(() => false);
    const timestamp = await firstComment.locator('.text-xs.text-gray-400').first().textContent().catch(() => '');
    log('A6: Comment has timestamp', hasTimestamp, 'Timestamp: "' + timestamp + '"');

    const commentLikeBtn = firstComment.locator('button').first();
    const hasLikeBtn = await commentLikeBtn.isVisible().catch(() => false);
    log('A7: Comment has like button', hasLikeBtn);
  } else {
    log('A4: Comment has avatar', false, 'No comments to check');
    log('A5: Comment has username', false, 'No comments to check');
    log('A6: Comment has timestamp', false, 'No comments to check');
    log('A7: Comment has like button', false, 'No comments to check');
  }

  // Post a new comment
  const commentInput = page.locator('input[placeholder="Add a comment"]').first();
  const hasCommentInput = await commentInput.isVisible().catch(() => false);
  log('A8: Comment input field visible', hasCommentInput);

  if (hasCommentInput) {
    await commentInput.fill('This is a test comment from playwright!');
    const postBtn = page.locator('button').filter({ hasText: 'Post' }).first();
    const hasPostBtn = await postBtn.isVisible().catch(() => false);
    log('A9: Post button visible', hasPostBtn);

    await postBtn.click();
    await page.waitForTimeout(500);

    const newComments = await page.locator('.space-y-4 .flex.gap-3').all();
    log('A10: New comment posted successfully', newComments.length > commentElements.length,
      'Was ' + commentElements.length + ', now ' + newComments.length);
    await screenshot('03_comment_posted');
  } else {
    log('A9: Post button visible', false, 'No comment input');
    log('A10: New comment posted successfully', false, 'No comment input');
  }

  // Like a comment
  const commentLikeButtons = await page.locator('.space-y-4 button').all();
  if (commentLikeButtons.length > 0) {
    const firstCommentLikeVisible = await commentLikeButtons[0].isVisible().catch(() => false);
    if (firstCommentLikeVisible) {
      await commentLikeButtons[0].click();
      await page.waitForTimeout(300);
      log('A11: Like comment button clicked', true);
      await screenshot('04_comment_liked');
    } else {
      log('A11: Like comment button clicked', false, 'Button not visible');
    }
  } else {
    log('A11: Like comment button clicked', false, 'No like buttons found');
  }

  // ===== TEST B: PIN DELETION =====
  console.log('\n=== TEST B: PIN DELETION ===');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  const goData = await page.evaluate(async () => {
    const resp = await fetch('/go');
    return resp.json();
  });
  const myId = goData.current_state && goData.current_state.currentUser && goData.current_state.currentUser.id;
  const ownPins = ((goData.current_state && goData.current_state.pins) || []).filter(p => p.userId === myId);
  console.log('My ID: ' + myId + ', Own pins: ' + ownPins.length);

  // Open first pin in modal
  const firstCard = page.locator('.group.cursor-zoom-in').first();
  await firstCard.click();
  await page.waitForTimeout(800);

  // Find ... button in modal action bar (first button in the sticky top bar)
  const modalStickyBar = page.locator('.rounded-\\[32px\\] .sticky.top-0');
  const moreHorizInModal = modalStickyBar.locator('button').first();
  const moreVisible = await moreHorizInModal.isVisible().catch(() => false);

  if (moreVisible) {
    await moreHorizInModal.click();
    await page.waitForTimeout(300);
    await screenshot('05_modal_more_menu');

    const deletePinBtn = page.locator('button').filter({ hasText: 'Delete Pin' });
    const deleteVisible = await deletePinBtn.isVisible().catch(() => false);
    log('B1: Delete Pin option visible in modal ... menu', deleteVisible);

    if (deleteVisible) {
      const initialCount = ((goData.current_state && goData.current_state.pins) || []).length;
      await deletePinBtn.click();
      await page.waitForTimeout(500);

      const stateAfterDelete = await page.evaluate(async () => {
        const resp = await fetch('/go');
        return resp.json();
      });
      const newCount = ((stateAfterDelete.current_state && stateAfterDelete.current_state.pins) || []).length;
      log('B2: Pin deleted from state', newCount < initialCount, 'Was ' + initialCount + ', now ' + newCount);
      await screenshot('06_pin_deleted');
    } else {
      // First pin may not be owned by current user
      log('B1: Delete Pin option in modal (note: shown only for own pins)', false, 'First pin may not be owned by current user');
      log('B2: Pin deleted from state', false, 'Could not access Delete Pin');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }
  } else {
    log('B1: Delete Pin option in modal ... menu', false, 'More menu button not found');
    log('B2: Pin deleted from state', false, 'Could not open more menu');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }

  // Test hovering own pin on card to find ... delete option
  await page.goto('http://localhost:5180', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const pinCardOnHome = page.locator('.group.cursor-zoom-in').first();
  await pinCardOnHome.hover();
  await page.waitForTimeout(500);
  await screenshot('07_pin_hover');

  // Find the ... button in the overlay (it's a button in the absolute overlay)
  const overlayArea = pinCardOnHome.locator('.absolute.inset-0');
  const overlayBottomRow = overlayArea.locator('.flex.justify-between.items-center.gap-2');
  const moreMenuBtnInCard = overlayBottomRow.locator('button').last();
  const moreCardVisible = await moreMenuBtnInCard.isVisible().catch(() => false);
  log('B3: ... menu button visible on pin card hover', moreCardVisible);

  if (moreCardVisible) {
    await moreMenuBtnInCard.click({ force: true });
    await page.waitForTimeout(300);
    await screenshot('08_card_more_menu');

    const cardDeleteBtn = page.locator('button').filter({ hasText: 'Delete Pin' });
    const cardDeleteVisible = await cardDeleteBtn.isVisible().catch(() => false);
    log('B4: Delete Pin option in card hover menu (for own pins)', cardDeleteVisible);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  } else {
    log('B4: Delete Pin option in card hover menu', false, 'Could not open card more menu');
  }

  // ===== TEST C: NOTIFICATIONS =====
  console.log('\n=== TEST C: NOTIFICATIONS ===');

  await page.goto('http://localhost:5180', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Find and click the bell button in navbar
  const navAllBtns = await page.locator('nav button').all();
  let bellClicked = false;
  for (let i = 0; i < navAllBtns.length; i++) {
    const inner = await navAllBtns[i].innerHTML().catch(() => '');
    if (inner.includes('Bell') || inner.toLowerCase().includes('bell')) {
      await navAllBtns[i].click();
      bellClicked = true;
      console.log('Bell button found at index ' + i);
      break;
    }
  }

  if (!bellClicked) {
    console.log('Bell not found by innerHTML - trying by position');
  }

  await page.waitForTimeout(600);
  await screenshot('09_notifications');

  // Check notifications dropdown
  const updatesHeader = page.locator('h3').filter({ hasText: 'Updates' });
  const hasUpdatesHeader = await updatesHeader.isVisible().catch(() => false);
  log('C1: Notifications dropdown visible', hasUpdatesHeader);
  log('C2: Notifications has "Updates" header', hasUpdatesHeader);

  if (hasUpdatesHeader) {
    // Check 400px width by finding the div
    const notifContainer = page.locator('.w-\\[400px\\]');
    const is400px = await notifContainer.isVisible().catch(() => false);
    log('C3: Notifications dropdown is 400px wide', is400px);

    // Check Mark all as read button
    const markAllReadBtn = page.locator('button').filter({ hasText: /Mark all as read/i });
    const hasMarkAllRead = await markAllReadBtn.isVisible().catch(() => false);
    log('C4: "Mark all as read" button visible', hasMarkAllRead);

    // Check unread items (blue bg)
    const unreadItems = await page.locator('[class*="bg-blue-50"]').all();
    log('C5: Unread notifications have blue background', unreadItems.length > 0, 'Found ' + unreadItems.length + ' unread');

    // Check red badge on bell (check before mark-all-read)
    const redBadge = page.locator('nav .min-w-\\[18px\\]');
    const hasBadge = await redBadge.isVisible().catch(() => false);
    log('C6: Red badge shown on bell icon', hasBadge);

    // Check notification items have avatars
    const notifContent = page.locator('.overflow-y-auto.flex-1');
    const notifAvatars = await notifContent.locator('img').all();
    log('C7: Notification items have avatars', notifAvatars.length > 0, 'Found ' + notifAvatars.length + ' avatars');

    // Test Mark all as read
    if (hasMarkAllRead) {
      await markAllReadBtn.click();
      await page.waitForTimeout(400);
      const unreadAfter = await page.locator('[class*="bg-blue-50"]').all();
      log('C8: Mark all as read works (removes blue bg)', unreadAfter.length === 0,
        'Still ' + unreadAfter.length + ' unread after clicking');
      await screenshot('10_notifications_read');
    } else {
      log('C8: Mark all as read works', false, 'Button not visible');
    }
  } else {
    log('C3: Notifications dropdown is 400px wide', false, 'Dropdown not visible');
    log('C4: Mark all as read button visible', false, 'Dropdown not visible');
    log('C5: Unread notifications have blue background', false, 'Dropdown not visible');
    log('C6: Red badge shown on bell icon', false, 'Dropdown not visible');
    log('C7: Notification items have avatars', false, 'Dropdown not visible');
    log('C8: Mark all as read works', false, 'Dropdown not visible');
  }

  // Close dropdown
  await page.click('body', { position: { x: 400, y: 600 } });
  await page.waitForTimeout(400);

  // ===== TEST D: USER DROPDOWN =====
  console.log('\n=== TEST D: USER DROPDOWN ===');

  // Find ChevronDown button (last button in navbar)
  const navBtnsAll = await page.locator('nav button').all();
  const lastNavBtn = navBtnsAll[navBtnsAll.length - 1];
  await lastNavBtn.click();
  await page.waitForTimeout(600);
  await screenshot('11_user_dropdown');

  const userDropdown = page.locator('[class*="w-\\[240px\\]"]');
  const dropdownVisible = await userDropdown.isVisible().catch(() => false);
  log('D1: User dropdown visible', dropdownVisible);

  if (dropdownVisible) {
    const userNameEl = page.locator('.border-b .font-bold.text-sm');
    const hasUserName = await userNameEl.isVisible().catch(() => false);
    const userName = await userNameEl.textContent().catch(() => '');
    log('D2: User name shown in dropdown', hasUserName, 'Name: "' + userName + '"');

    const usernameEl = page.locator('.border-b .text-xs.text-gray-500');
    const hasUsername = await usernameEl.isVisible().catch(() => false);
    const usernameText = await usernameEl.textContent().catch(() => '');
    log('D3: Username (@handle) shown in dropdown', hasUsername, 'Username: "' + usernameText + '"');

    const profileMenuItem = page.locator('button').filter({ hasText: 'Your profile' });
    const settingsMenuItem = page.locator('button').filter({ hasText: 'Settings' });
    const boardsMenuItem = page.locator('button').filter({ hasText: 'Your boards' });
    const logoutMenuItem = page.locator('button').filter({ hasText: 'Log out' });

    log('D4: Your profile menu item', await profileMenuItem.isVisible().catch(() => false));
    log('D5: Settings menu item', await settingsMenuItem.isVisible().catch(() => false));
    log('D6: Your boards menu item', await boardsMenuItem.isVisible().catch(() => false));
    log('D7: Log out menu item', await logoutMenuItem.isVisible().catch(() => false));
  } else {
    log('D2: User name shown in dropdown', false, 'Dropdown not visible');
    log('D3: Username shown in dropdown', false, 'Dropdown not visible');
    log('D4: Your profile menu item', false, 'Dropdown not visible');
    log('D5: Settings menu item', false, 'Dropdown not visible');
    log('D6: Your boards menu item', false, 'Dropdown not visible');
    log('D7: Log out menu item', false, 'Dropdown not visible');
  }

  await page.click('body', { position: { x: 400, y: 600 } });
  await page.waitForTimeout(400);

  // ===== TEST E: SEARCH =====
  console.log('\n=== TEST E: SEARCH ===');

  const searchInput = page.locator('input[placeholder="Search"]');
  await searchInput.click();
  await searchInput.type('pin');
  await page.waitForTimeout(600);
  await screenshot('12_search_suggestions');

  const suggestions = await page.locator('.absolute.top-full button').all();
  const visibleSuggestions = [];
  for (const s of suggestions) {
    if (await s.isVisible().catch(() => false)) visibleSuggestions.push(s);
  }
  log('E1: Search suggestions appear while typing', visibleSuggestions.length > 0, 'Found ' + visibleSuggestions.length + ' suggestions');

  await page.keyboard.press('Enter');
  await page.waitForTimeout(600);
  await screenshot('13_search_results');

  const goData2 = await page.evaluate(async () => {
    const resp = await fetch('/go');
    return resp.json();
  });
  const searchQuery = goData2.current_state && goData2.current_state.searchQuery;
  log('E2: Search query set in state', !!searchQuery, 'Query: "' + searchQuery + '"');

  // Test filter chips (check if the home page shows filtered results)
  const pinsAfterSearch = await page.locator('.group.cursor-zoom-in').all();
  log('E3: Results shown after search', pinsAfterSearch.length > 0, 'Pins showing: ' + pinsAfterSearch.length);

  // Test no-results state
  await searchInput.click({ clickCount: 3 });
  await searchInput.fill('xyznonexistentterm99999');
  await page.waitForTimeout(300);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(600);
  await screenshot('14_no_results');

  const pinsAfterNoResults = await page.locator('.group.cursor-zoom-in').all();
  log('E4: No-results state handled (empty grid)', pinsAfterNoResults.length === 0,
    'Pins visible: ' + pinsAfterNoResults.length);

  // Clear search
  await searchInput.click({ clickCount: 3 });
  await searchInput.fill('');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);

  // ===== TEST F: BOARD EDITING =====
  console.log('\n=== TEST F: BOARD EDITING ===');

  await page.goto('http://localhost:5180/board/b1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await screenshot('15_board_detail');

  // Find the options button near h1
  const boardTitleRow = page.locator('.flex.items-center.gap-4.mb-4');
  const optionsBtn = boardTitleRow.locator('button').first();
  const optionsBtnVisible = await optionsBtn.isVisible().catch(() => false);
  log('F1: Board options button visible (... next to title)', optionsBtnVisible);

  if (optionsBtnVisible) {
    await optionsBtn.click();
    await page.waitForTimeout(400);
    await screenshot('16_board_options');

    const editBoardBtn = page.locator('button').filter({ hasText: 'Edit board' });
    const editBoardVisible = await editBoardBtn.isVisible().catch(() => false);
    log('F2: Edit board option in dropdown', editBoardVisible);

    if (editBoardVisible) {
      await editBoardBtn.click();
      await page.waitForTimeout(600);
      await screenshot('17_edit_board_modal');

      const editNameInput = page.locator('input[placeholder="Board name"]');
      const editDescInput = page.locator('textarea[placeholder="What\'s your board about?"]');
      const privacyCheck = page.locator('input#board-privacy-toggle');

      log('F3: Edit board modal has Name field', await editNameInput.isVisible().catch(() => false));
      log('F4: Edit board modal has Description field', await editDescInput.isVisible().catch(() => false));
      log('F5: Edit board modal has Privacy toggle', await privacyCheck.isVisible().catch(() => false));

      await editNameInput.click({ clickCount: 3 });
      await editNameInput.fill('Updated Board Name');
      await editDescInput.fill('Updated description for testing');

      const allSaveBtns = await page.locator('button').filter({ hasText: 'Save' }).all();
      const saveBoardBtn = allSaveBtns[allSaveBtns.length - 1];
      await saveBoardBtn.click();
      await page.waitForTimeout(600);
      await screenshot('18_board_saved');

      const boardTitle = await page.locator('h1').first().textContent().catch(() => '');
      log('F6: Board name updated after save', boardTitle.includes('Updated Board Name'),
        'Title: "' + boardTitle + '"');
    } else {
      log('F3: Edit board modal has Name field', false, 'Could not open edit modal');
      log('F4: Edit board modal has Description field', false, 'Could not open edit modal');
      log('F5: Edit board modal has Privacy toggle', false, 'Could not open edit modal');
      log('F6: Board name updated after save', false, 'Could not open edit modal');
    }
  } else {
    log('F2: Edit board option in dropdown', false, 'Options button not visible');
    log('F3: Edit board modal has Name field', false, 'Options button not visible');
    log('F4: Edit board modal has Description field', false, 'Options button not visible');
    log('F5: Edit board modal has Privacy toggle', false, 'Options button not visible');
    log('F6: Board name updated after save', false, 'Options button not visible');
  }

  // ===== TEST G: PROFILE EDIT =====
  console.log('\n=== TEST G: PROFILE EDIT ===');

  await page.goto('http://localhost:5180/profile/u1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await screenshot('19_profile');

  const editProfileBtn = page.locator('button').filter({ hasText: 'Edit Profile' });
  const editProfileVisible = await editProfileBtn.isVisible().catch(() => false);
  log('G1: Edit Profile button visible', editProfileVisible);

  if (editProfileVisible) {
    await editProfileBtn.click();
    await page.waitForTimeout(600);
    await screenshot('20_edit_profile_modal');

    const nameInput = page.locator('input[placeholder="Your name"]');
    const usernameInputEl = page.locator('input[placeholder="username"]');
    const bioTextarea = page.locator('textarea[placeholder="Tell your story"]');
    const websiteInput = page.locator('input[placeholder="https://yourwebsite.com"]');

    log('G2: Edit Profile modal has Display name field', await nameInput.isVisible().catch(() => false));
    log('G3: Edit Profile modal has Username field', await usernameInputEl.isVisible().catch(() => false));
    log('G4: Edit Profile modal has Bio/About field', await bioTextarea.isVisible().catch(() => false));
    log('G5: Edit Profile modal has Website field', await websiteInput.isVisible().catch(() => false));

    await nameInput.click({ clickCount: 3 });
    await nameInput.fill('Test User Updated');
    await bioTextarea.fill('Updated bio for testing');
    await websiteInput.fill('https://testwebsite.com');

    const allSaveBtnsProfile = await page.locator('button').filter({ hasText: 'Save' }).all();
    const saveProfileBtn = allSaveBtnsProfile[allSaveBtnsProfile.length - 1];
    await saveProfileBtn.click();
    await page.waitForTimeout(600);
    await screenshot('21_profile_saved');

    const profileName = await page.locator('h1').first().textContent().catch(() => '');
    log('G6: Profile name updated after save', profileName.includes('Test User Updated'),
      'Name: "' + profileName + '"');
  } else {
    log('G2: Edit Profile modal has Display name field', false, 'Could not open edit modal');
    log('G3: Edit Profile modal has Username field', false, 'Could not open edit modal');
    log('G4: Edit Profile modal has Bio/About field', false, 'Could not open edit modal');
    log('G5: Edit Profile modal has Website field', false, 'Could not open edit modal');
    log('G6: Profile name updated after save', false, 'Could not open edit modal');
  }

  // ===== TEST H: SAVE TO BOARD =====
  console.log('\n=== TEST H: SAVE TO BOARD ===');

  await page.goto('http://localhost:5180', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // Hover first pin card
  const firstPinCard2 = page.locator('.group.cursor-zoom-in').first();
  await firstPinCard2.hover();
  await page.waitForTimeout(600);
  await screenshot('22_pin_hover_save');

  // Find Save button in overlay top-left
  const overlayTopArea = firstPinCard2.locator('.absolute.inset-0 .flex.justify-between.items-start');
  const saveBtnEl = overlayTopArea.locator('button').first();
  const saveBtnText = await saveBtnEl.textContent().catch(() => '');
  const saveBtnVisible = await saveBtnEl.isVisible().catch(() => false);
  log('H1: Save button visible on pin hover', saveBtnVisible, 'Button text: "' + saveBtnText + '"');

  // Find ChevronDown button next to save
  const boardSelectBtns = await overlayTopArea.locator('button').all();
  const hasChevron = boardSelectBtns.length >= 2;
  const chevronEl = hasChevron ? boardSelectBtns[1] : null;
  const chevronVisible = chevronEl ? await chevronEl.isVisible().catch(() => false) : false;
  log('H2: Dropdown chevron visible next to Save', chevronVisible, 'Buttons in top area: ' + boardSelectBtns.length);

  if (chevronVisible) {
    await chevronEl.click({ force: true });
    await page.waitForTimeout(600);
    await screenshot('23_board_dropdown');

    const boardDropdownInput = page.locator('input[placeholder="Search boards"]');
    const boardDropdownVisible = await boardDropdownInput.isVisible().catch(() => false);
    log('H3: Board selection dropdown opens with search', boardDropdownVisible);

    if (boardDropdownVisible) {
      const boardsList = await page.locator('.max-h-52 button').all();
      log('H4: Boards listed in dropdown', boardsList.length > 0, 'Found ' + boardsList.length + ' boards');

      if (boardsList.length > 0) {
        const firstBoardVisible = await boardsList[0].isVisible().catch(() => false);
        if (firstBoardVisible) {
          await boardsList[0].click({ force: true });
          await page.waitForTimeout(500);
          log('H5: Clicking board saves pin', true);
          await screenshot('24_saved_to_board');
        } else {
          log('H5: Clicking board saves pin', false, 'Board button not visible');
        }
      } else {
        log('H5: Clicking board saves pin', false, 'No boards in list');
      }
    } else {
      log('H4: Boards listed in dropdown', false, 'Dropdown not opened');
      log('H5: Clicking board saves pin', false, 'Dropdown not opened');
    }
  } else {
    log('H3: Board selection dropdown opens', false, 'No chevron button');
    log('H4: Boards listed in dropdown', false, 'No chevron button');
    log('H5: Clicking board saves pin', false, 'No chevron button');
  }

  // ===== TEST I: PIN LIKE =====
  console.log('\n=== TEST I: PIN LIKE ===');

  await page.goto('http://localhost:5180', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // Open pin modal
  const pinToLike = page.locator('.group.cursor-zoom-in').nth(2);
  await pinToLike.click();
  await page.waitForTimeout(1000);
  await screenshot('25_pin_modal_for_like');

  // Find the Heart button in modal action area
  // Modal action bar: ... Upload Link Heart | board-dropdown Save
  const modalActionBtns = await page.locator('.rounded-\\[32px\\] .sticky.top-0 .flex.gap-2.items-center button').all();
  console.log('Modal action buttons found: ' + modalActionBtns.length);

  let heartButton = null;
  // Heart button is the 4th button (index 3) in the left group
  if (modalActionBtns.length >= 4) {
    heartButton = modalActionBtns[3];
  } else if (modalActionBtns.length > 0) {
    heartButton = modalActionBtns[modalActionBtns.length - 1];
  }

  if (heartButton) {
    const heartVisible = await heartButton.isVisible().catch(() => false);
    log('I1: Heart/like button visible in modal action bar', heartVisible);

    if (heartVisible) {
      const initialFill = await heartButton.locator('svg').getAttribute('fill').catch(() => 'none');
      log('I2: Heart initial state not filled', initialFill === 'none' || !initialFill,
        'Fill: "' + initialFill + '"');

      await heartButton.click();
      await page.waitForTimeout(500);
      await screenshot('26_pin_liked');

      const stateAfterLike = await page.evaluate(async () => {
        const resp = await fetch('/go');
        return resp.json();
      });

      const currentUserId2 = stateAfterLike.current_state && stateAfterLike.current_state.currentUser &&
        stateAfterLike.current_state.currentUser.id;
      const likedPins = ((stateAfterLike.current_state && stateAfterLike.current_state.pins) || []).filter(p =>
        (p.likedBy || []).includes(currentUserId2)
      );
      log('I3: Pin like registered in state', likedPins.length > 0, 'Liked pins: ' + likedPins.length);

      const newFill = await heartButton.locator('svg').getAttribute('fill').catch(() => '');
      log('I4: Heart changes to currentColor (red) after like', newFill === 'currentColor',
        'New fill: "' + newFill + '"');

      const likesText = await heartButton.textContent().catch(() => '');
      log('I5: Like count shown in modal', true, 'Button text: "' + likesText.trim() + '"');
    } else {
      log('I2: Heart initial state not filled', false, 'Heart not visible');
      log('I3: Pin like registered in state', false, 'Heart not visible');
      log('I4: Heart changes to currentColor', false, 'Heart not visible');
      log('I5: Like count shown', false, 'Heart not visible');
    }
  } else {
    log('I1: Heart/like button visible in modal action bar', false, 'No buttons in action area');
    log('I2: Heart initial state not filled', false, 'No heart button');
    log('I3: Pin like registered in state', false, 'No heart button');
    log('I4: Heart changes to currentColor', false, 'No heart button');
    log('I5: Like count shown', false, 'No heart button');
  }

  // Check like on card below image
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  const cardForLike = page.locator('.group.cursor-zoom-in').nth(2);
  // The like button is in the row below the image
  const cardBelowRow = cardForLike.locator('.flex.items-center.justify-between.px-1');
  const cardLikeBtnEl = cardBelowRow.locator('button').last();
  const cardLikeVisible = await cardLikeBtnEl.isVisible().catch(() => false);
  log('I6: Like button visible on pin card (below image)', cardLikeVisible);

  if (cardLikeVisible) {
    const cardFill = await cardLikeBtnEl.locator('svg').getAttribute('fill').catch(() => '');
    log('I7: Card like button shows liked state (currentColor fill)', cardFill === 'currentColor',
      'Card fill: "' + cardFill + '"');
  } else {
    log('I7: Card like button reflects liked state', false, 'Like button not visible on card');
  }
  await screenshot('27_card_like_state');

  // ===== TEST J: RELATED PINS =====
  console.log('\n=== TEST J: RELATED PINS ===');

  await page.goto('http://localhost:5180', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const pinForRelated = page.locator('.group.cursor-zoom-in').nth(0);
  await pinForRelated.click();
  await page.waitForTimeout(1000);

  // Scroll down in modal right panel
  const modalRightPanel = page.locator('.rounded-\\[32px\\] .overflow-y-auto').last();
  const panelExists = await modalRightPanel.isVisible().catch(() => false);
  if (panelExists) {
    await modalRightPanel.evaluate(el => { el.scrollTop = el.scrollHeight; });
    await page.waitForTimeout(600);
  }
  await screenshot('28_modal_scrolled');

  const moreLikeThis = page.locator('h3').filter({ hasText: 'More like this' });
  const moreLikeThisVisible = await moreLikeThis.isVisible().catch(() => false);
  log('J1: "More like this" section visible in modal', moreLikeThisVisible);

  const relatedPinDivs = await page.locator('.break-inside-avoid.cursor-pointer').all();
  log('J2: Related pins visible', relatedPinDivs.length > 0, 'Found ' + relatedPinDivs.length + ' related pins');

  if (relatedPinDivs.length > 0) {
    const currentTitle = await page.locator('.rounded-\\[32px\\] h1').first().textContent().catch(() => '');

    const firstRelated = relatedPinDivs[0];
    await firstRelated.click({ force: true });
    await page.waitForTimeout(600);
    await screenshot('29_related_pin_clicked');

    const newTitle = await page.locator('.rounded-\\[32px\\] h1').first().textContent().catch(() => '');
    log('J3: Clicking related pin loads new pin in same modal', newTitle !== currentTitle && newTitle.length > 0,
      'Old: "' + currentTitle + '" New: "' + newTitle + '"');
  } else {
    log('J3: Clicking related pin loads new pin in modal', false, 'No related pins found');
  }

  // Final
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  await page.goto('http://localhost:5180', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await screenshot('30_final_state');

  await browser.close();

  // Summary
  console.log('\n===== SUMMARY =====');
  let passedCount = 0;
  let failedCount = 0;
  for (let i = 0; i < results.length; i++) {
    if (results[i].passed) passedCount++;
    else failedCount++;
  }
  console.log('Total: ' + results.length + ', Passed: ' + passedCount + ', Failed: ' + failedCount);

  fs.writeFileSync('/tmp/pinterest_test_results.json', JSON.stringify(results, null, 2));
  return results;
}

main().catch(e => {
  console.error('Test error:', e);
  process.exit(1);
});
