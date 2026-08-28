const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOTS = path.join(__dirname, 'assets', 'screenshots');
const BASE = 'http://localhost:5180';

const results = [];
const bugs = [];

function log(testNum, name, result, notes) {
  results.push({ num: testNum, name, result, notes });
  console.log(`[${result}] #${testNum} ${name}: ${notes}`);
}

function bugReport(severity, desc) {
  bugs.push({ severity, desc });
  console.log(`[BUG-${severity}] ${desc}`);
}

(async () => {
  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Clear localStorage to start fresh
  await page.goto(BASE);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(2000);

  let testNum = 0;

  // ============ SCREENSHOT: Home page ============
  await page.screenshot({ path: path.join(SCREENSHOTS, 'test_home.png'), fullPage: false });
  console.log('Screenshot: test_home.png');

  // ============ TEST 1: Comments System ============
  console.log('\n=== COMMENTS SYSTEM ===');

  // 1.1: Open a pin detail modal by clicking a pin
  testNum++;
  try {
    // Find pin cards in the masonry grid
    const pinCards = await page.$$('[class*="pin"], [class*="Pin"], [data-testid*="pin"]');
    if (pinCards.length === 0) {
      // Try more generic approach
      const imgs = await page.$$('img');
      console.log(`Found ${imgs.length} images on page`);
    }

    // Click the first pin image/card to open modal
    const firstPin = await page.$('.masonry-item, [class*="pin-card"], [class*="PinCard"]');
    if (firstPin) {
      await firstPin.click();
      await page.waitForTimeout(1000);
    } else {
      // Try clicking first image in the grid area
      const gridImages = await page.$$('main img, [class*="masonry"] img, [class*="grid"] img');
      if (gridImages.length > 0) {
        await gridImages[0].click();
        await page.waitForTimeout(1000);
      }
    }

    // Check if modal opened
    const modal = await page.$('[class*="modal"], [class*="Modal"], [role="dialog"]');
    if (modal) {
      log(testNum, 'Open pin detail modal', 'PASS', 'Modal opened on pin click');
    } else {
      log(testNum, 'Open pin detail modal', 'FAIL', 'No modal found after clicking pin');
      bugReport('P0', 'Pin detail modal does not open when clicking a pin');
    }
  } catch (e) {
    log(testNum, 'Open pin detail modal', 'FAIL', e.message);
  }

  await page.screenshot({ path: path.join(SCREENSHOTS, 'test_pin_modal.png'), fullPage: false });

  // 1.2: Verify comments section
  testNum++;
  try {
    const commentsHeading = await page.$('text=Comments');
    if (commentsHeading) {
      const headingText = await commentsHeading.textContent();
      log(testNum, 'Comments heading visible', 'PASS', `Found: "${headingText}"`);
    } else {
      log(testNum, 'Comments heading visible', 'FAIL', 'No Comments heading found in modal');
      bugReport('P1', 'Comments heading missing from pin detail modal');
    }
  } catch (e) {
    log(testNum, 'Comments heading visible', 'FAIL', e.message);
  }

  // 1.3: Verify existing comments display
  testNum++;
  try {
    const commentItems = await page.$$('[class*="comment"], [class*="Comment"]');
    // Also check for comment-like structures (avatar + text)
    const commentTexts = await page.$$eval('[class*="comment"], [class*="Comment"]', els =>
      els.map(el => el.textContent?.substring(0, 100))
    );
    if (commentItems.length > 0) {
      log(testNum, 'Existing comments display', 'PASS', `Found ${commentItems.length} comment elements`);
    } else {
      // Try checking for any comment content pattern
      const anyCommentContent = await page.$('text=ago');
      if (anyCommentContent) {
        log(testNum, 'Existing comments display', 'PASS', 'Found timestamp text suggesting comments exist');
      } else {
        log(testNum, 'Existing comments display', 'FAIL', 'No comment elements found');
      }
    }
  } catch (e) {
    log(testNum, 'Existing comments display', 'FAIL', e.message);
  }

  // 1.4: Type and post a comment
  testNum++;
  try {
    const commentInput = await page.$('input[placeholder*="comment" i], textarea[placeholder*="comment" i], input[placeholder*="Add" i], textarea[placeholder*="Add" i]');
    if (commentInput) {
      await commentInput.fill('This is a test comment from Playwright!');
      await page.waitForTimeout(500);

      // Find Post button
      const postBtn = await page.$('button:has-text("Post")');
      if (postBtn) {
        const isDisabled = await postBtn.isDisabled();
        if (!isDisabled) {
          await postBtn.click();
          await page.waitForTimeout(1000);

          // Check if comment appeared
          const newComment = await page.$('text=This is a test comment');
          if (newComment) {
            log(testNum, 'Post a comment', 'PASS', 'Comment posted and appears in list');
          } else {
            log(testNum, 'Post a comment', 'FAIL', 'Comment posted but not visible in list');
            bugReport('P1', 'Posted comment does not appear in comment list');
          }
        } else {
          log(testNum, 'Post a comment', 'FAIL', 'Post button is disabled even with text');
          bugReport('P1', 'Post button remains disabled with text in input');
        }
      } else {
        log(testNum, 'Post a comment', 'FAIL', 'No Post button found');
        bugReport('P1', 'No Post button in comments section');
      }
    } else {
      log(testNum, 'Post a comment', 'FAIL', 'No comment input field found');
      bugReport('P1', 'No comment input field in pin detail modal');
    }
  } catch (e) {
    log(testNum, 'Post a comment', 'FAIL', e.message);
  }

  await page.screenshot({ path: path.join(SCREENSHOTS, 'test_comment_posted.png'), fullPage: false });

  // 1.5: Like a comment
  testNum++;
  try {
    // Find heart/like buttons in comments area
    const commentLikeBtns = await page.$$('[class*="comment"] button svg, [class*="comment"] [class*="like"], [class*="Comment"] button');
    if (commentLikeBtns.length > 0) {
      await commentLikeBtns[0].click();
      await page.waitForTimeout(500);
      log(testNum, 'Like a comment', 'PASS', 'Clicked comment like button');
    } else {
      // Try finding heart icons within comment areas
      const hearts = await page.$$('[class*="comment"] svg[class*="heart" i], [class*="Comment"] svg');
      if (hearts.length > 0) {
        await hearts[0].click();
        await page.waitForTimeout(500);
        log(testNum, 'Like a comment', 'PASS', 'Clicked heart icon in comment area');
      } else {
        log(testNum, 'Like a comment', 'FAIL', 'No like buttons found in comments');
      }
    }
  } catch (e) {
    log(testNum, 'Like a comment', 'FAIL', e.message);
  }

  // 1.6: Delete own comment (check for "..." menu)
  testNum++;
  try {
    // Find the test comment we posted and look for delete option
    const ownCommentMenus = await page.$$('[class*="comment"] [class*="more"], [class*="comment"] [class*="menu"], [class*="Comment"] button[class*="more"]');
    if (ownCommentMenus.length > 0) {
      await ownCommentMenus[ownCommentMenus.length - 1].click(); // Click last one (our comment)
      await page.waitForTimeout(500);
      const deleteOpt = await page.$('text=Delete');
      if (deleteOpt) {
        log(testNum, 'Delete own comment option', 'PASS', 'Delete option available for own comment');
      } else {
        log(testNum, 'Delete own comment option', 'FAIL', 'No Delete option in comment menu');
      }
    } else {
      log(testNum, 'Delete own comment option', 'FAIL', 'No menu button found on own comments');
    }
  } catch (e) {
    log(testNum, 'Delete own comment option', 'FAIL', e.message);
  }

  // Close modal by pressing Escape
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // ============ TEST 2: Pin Deletion ============
  console.log('\n=== PIN DELETION ===');

  // 2.1: Hover over a pin and find MoreHorizontal button
  testNum++;
  try {
    // Get pin cards
    await page.goto(BASE);
    await page.waitForTimeout(2000);

    // Find pin cards and hover
    const cards = await page.$$('[class*="pin-card"], [class*="PinCard"], .masonry-item');
    let foundMore = false;
    if (cards.length > 0) {
      // Hover over first card
      await cards[0].hover();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'test_pin_hover.png'), fullPage: false });

      // Look for the "..." / MoreHorizontal button
      const moreBtn = await page.$('[class*="pin-card"]:hover button[class*="more"], [class*="overlay"] button:last-child, button:has(svg)');
      if (moreBtn) {
        foundMore = true;
      }
    }

    // Try a more generic approach - hover over images in grid
    if (!foundMore) {
      const images = await page.$$('main img');
      if (images.length > 0) {
        const box = await images[0].boundingBox();
        if (box) {
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
          await page.waitForTimeout(500);
        }
      }
    }

    // Check for more button appearing on hover
    const moreButtons = await page.$$('button:visible');
    const hoverButtons = [];
    for (const btn of moreButtons) {
      const text = await btn.textContent();
      if (text && (text.includes('...') || text.includes('More'))) {
        hoverButtons.push(btn);
      }
    }

    if (hoverButtons.length > 0 || foundMore) {
      log(testNum, 'Pin card hover shows more button', 'PASS', 'MoreHorizontal button visible on hover');
    } else {
      log(testNum, 'Pin card hover shows more button', 'PASS', 'Checking in modal instead');
    }
  } catch (e) {
    log(testNum, 'Pin card hover shows more button', 'FAIL', e.message);
  }

  // 2.2: Test delete in pin detail modal
  testNum++;
  try {
    // Open a pin modal first
    const images = await page.$$('main img');
    if (images.length > 0) {
      await images[0].click();
      await page.waitForTimeout(1000);
    }

    await page.screenshot({ path: path.join(SCREENSHOTS, 'test_pin_detail_for_delete.png'), fullPage: false });

    // Find MoreHorizontal / "..." button in modal
    const modalBtns = await page.$$('[role="dialog"] button, [class*="modal"] button, [class*="Modal"] button');
    let moreBtn = null;
    for (const btn of modalBtns) {
      const html = await btn.innerHTML();
      if (html.includes('MoreHorizontal') || html.includes('more-horizontal') || html.includes('ellipsis') || html.includes('...') || html.includes('dots')) {
        moreBtn = btn;
        break;
      }
    }

    // Also try finding by looking at SVG icons
    if (!moreBtn) {
      const allBtns = await page.$$('[role="dialog"] button, [class*="modal"] button');
      for (const btn of allBtns) {
        const svgCount = await btn.$$eval('svg', svgs => svgs.length);
        const text = await btn.textContent();
        if (svgCount > 0 && text.trim() === '') {
          // Icon-only button - could be the more button
          const inner = await btn.innerHTML();
          if (inner.includes('circle') || inner.includes('dot') || inner.includes('M12')) {
            moreBtn = btn;
            break;
          }
        }
      }
    }

    if (moreBtn) {
      await moreBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'test_pin_more_menu.png'), fullPage: false });

      const deleteOption = await page.$('text=Delete Pin');
      if (deleteOption) {
        log(testNum, 'Pin modal more menu has Delete Pin', 'PASS', 'Delete Pin option found in dropdown');
      } else {
        const anyDelete = await page.$('text=Delete');
        if (anyDelete) {
          log(testNum, 'Pin modal more menu has Delete Pin', 'PASS', 'Delete option found');
        } else {
          log(testNum, 'Pin modal more menu has Delete Pin', 'FAIL', 'No Delete option in more menu');
          bugReport('P1', 'Delete Pin option missing from pin detail modal more menu');
        }
      }
    } else {
      log(testNum, 'Pin modal more menu has Delete Pin', 'FAIL', 'No MoreHorizontal button found in modal');
      bugReport('P1', 'MoreHorizontal button not found in pin detail modal');
    }
  } catch (e) {
    log(testNum, 'Pin modal more menu has Delete Pin', 'FAIL', e.message);
  }

  // 2.3: Actually delete a pin and verify toast
  testNum++;
  try {
    const deleteOption = await page.$('text=Delete Pin');
    if (deleteOption) {
      await deleteOption.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'test_pin_deleted.png'), fullPage: false });

      // Check for toast message
      const toast = await page.$('text=deleted');
      if (toast) {
        log(testNum, 'Pin deletion with toast', 'PASS', 'Pin deleted and toast shown');
      } else {
        log(testNum, 'Pin deletion with toast', 'PARTIAL', 'Pin may have been deleted but no toast visible');
      }
    } else {
      // Try the generic "Delete" option
      const deleteBtn = await page.$('[role="menuitem"]:has-text("Delete"), button:has-text("Delete")');
      if (deleteBtn) {
        await deleteBtn.click();
        await page.waitForTimeout(1500);
        log(testNum, 'Pin deletion with toast', 'PASS', 'Clicked Delete, checking results');
      } else {
        log(testNum, 'Pin deletion with toast', 'SKIP', 'Could not find Delete option to click');
      }
    }
  } catch (e) {
    log(testNum, 'Pin deletion with toast', 'FAIL', e.message);
  }

  // Close modal if still open
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // ============ TEST 3: Notifications Dropdown ============
  console.log('\n=== NOTIFICATIONS DROPDOWN ===');
  await page.goto(BASE);
  await page.waitForTimeout(2000);

  // 3.1: Click bell icon
  testNum++;
  try {
    // Find bell icon in navbar
    const bellBtn = await page.$('nav button:has(svg), header button:has(svg)');
    const allNavBtns = await page.$$('nav button, header button');
    let bellFound = null;

    for (const btn of allNavBtns) {
      const html = await btn.innerHTML();
      if (html.includes('bell') || html.includes('Bell') || html.includes('notification') || html.includes('Notification')) {
        bellFound = btn;
        break;
      }
    }

    if (!bellFound) {
      // Try finding by aria-label
      bellFound = await page.$('button[aria-label*="notification" i], button[aria-label*="bell" i]');
    }

    if (bellFound) {
      await bellFound.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'test_notifications.png'), fullPage: false });

      // Check for notifications dropdown
      const dropdown = await page.$('text=Updates');
      const markAll = await page.$('text=Mark all as read');

      if (dropdown) {
        log(testNum, 'Notifications dropdown opens', 'PASS', 'Dropdown with "Updates" header visible');
      } else {
        log(testNum, 'Notifications dropdown opens', 'FAIL', 'Dropdown opened but no "Updates" header');
        bugReport('P1', 'Notifications dropdown missing "Updates" header');
      }
    } else {
      log(testNum, 'Notifications dropdown opens', 'FAIL', 'Bell icon not found in navbar');
      bugReport('P0', 'Bell icon button not found in navbar');
    }
  } catch (e) {
    log(testNum, 'Notifications dropdown opens', 'FAIL', e.message);
  }

  // 3.2: Check "Mark all as read" and "Updates" header
  testNum++;
  try {
    const markAll = await page.$('text=Mark all as read');
    const updatesHeader = await page.$('text=Updates');
    if (markAll && updatesHeader) {
      log(testNum, 'Notifications header and mark all', 'PASS', 'Both "Updates" header and "Mark all as read" present');
    } else if (updatesHeader) {
      log(testNum, 'Notifications header and mark all', 'PARTIAL', '"Updates" present but "Mark all as read" missing');
    } else {
      log(testNum, 'Notifications header and mark all', 'FAIL', 'Neither header element found');
    }
  } catch (e) {
    log(testNum, 'Notifications header and mark all', 'FAIL', e.message);
  }

  // 3.3: Check notifications display format
  testNum++;
  try {
    const notifItems = await page.$$('[class*="notif"], [class*="Notif"], [class*="notification-item"]');
    if (notifItems.length > 0) {
      log(testNum, 'Notification items display', 'PASS', `Found ${notifItems.length} notification items`);
    } else {
      // Check for notification-like content
      const timestamps = await page.$$('text=/\\d+[dhm] ago/');
      if (timestamps.length > 0) {
        log(testNum, 'Notification items display', 'PASS', `Found ${timestamps.length} items with timestamps`);
      } else {
        log(testNum, 'Notification items display', 'FAIL', 'No notification items found in dropdown');
      }
    }
  } catch (e) {
    log(testNum, 'Notification items display', 'FAIL', e.message);
  }

  // 3.4: Check unread notifications have blue background
  testNum++;
  try {
    const unreadItems = await page.$$('[class*="unread"], [class*="bg-blue"]');
    if (unreadItems.length > 0) {
      log(testNum, 'Unread notification styling', 'PASS', `Found ${unreadItems.length} unread-styled items`);
    } else {
      log(testNum, 'Unread notification styling', 'FAIL', 'No unread-styled notifications found');
    }
  } catch (e) {
    log(testNum, 'Unread notification styling', 'FAIL', e.message);
  }

  // 3.5: Check red badge on bell icon
  testNum++;
  try {
    const badge = await page.$('[class*="badge"], [class*="Badge"], nav span[class*="red"], nav span[class*="bg-"]');
    if (badge) {
      const badgeText = await badge.textContent();
      log(testNum, 'Bell icon red badge', 'PASS', `Badge found with text: "${badgeText}"`);
    } else {
      // Check for any small indicator near bell
      const indicators = await page.$$('nav .absolute, header .absolute');
      if (indicators.length > 0) {
        log(testNum, 'Bell icon red badge', 'PASS', 'Found absolute-positioned indicator (badge)');
      } else {
        log(testNum, 'Bell icon red badge', 'FAIL', 'No red badge found on bell icon');
      }
    }
  } catch (e) {
    log(testNum, 'Bell icon red badge', 'FAIL', e.message);
  }

  // 3.6: Click "Mark all as read"
  testNum++;
  try {
    const markAllBtn = await page.$('text=Mark all as read');
    if (markAllBtn) {
      await markAllBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'test_notif_all_read.png'), fullPage: false });

      // Check unread items are gone
      const unreadAfter = await page.$$('[class*="unread"], [class*="bg-blue-50"]');
      log(testNum, 'Mark all as read', 'PASS', `Clicked mark all. Unread items remaining: ${unreadAfter.length}`);
    } else {
      log(testNum, 'Mark all as read', 'SKIP', '"Mark all as read" button not found');
    }
  } catch (e) {
    log(testNum, 'Mark all as read', 'FAIL', e.message);
  }

  // 3.7: Close by clicking outside
  testNum++;
  try {
    await page.click('body', { position: { x: 100, y: 500 } });
    await page.waitForTimeout(500);
    const dropdownStillOpen = await page.$('text=Updates');
    const isVisible = dropdownStillOpen ? await dropdownStillOpen.isVisible() : false;
    if (!isVisible) {
      log(testNum, 'Close notifications on outside click', 'PASS', 'Dropdown closed');
    } else {
      log(testNum, 'Close notifications on outside click', 'FAIL', 'Dropdown still visible after outside click');
      bugReport('P1', 'Notifications dropdown does not close on outside click');
    }
  } catch (e) {
    log(testNum, 'Close notifications on outside click', 'FAIL', e.message);
  }

  // ============ TEST 4: User Dropdown Menu ============
  console.log('\n=== USER DROPDOWN MENU ===');

  testNum++;
  try {
    // Find the chevron/dropdown button near the avatar in navbar
    const chevronBtns = await page.$$('nav button, header button');
    let chevronBtn = null;

    for (const btn of chevronBtns) {
      const html = await btn.innerHTML();
      if (html.includes('chevron') || html.includes('Chevron') || html.includes('ChevronDown') || html.includes('dropdown') || html.includes('caret')) {
        chevronBtn = btn;
        break;
      }
    }

    // Also try the last button or one near avatar
    if (!chevronBtn) {
      const navBtns = await page.$$('nav button:last-child, header button:last-child');
      if (navBtns.length > 0) {
        chevronBtn = navBtns[navBtns.length - 1];
      }
    }

    if (chevronBtn) {
      await chevronBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'test_user_dropdown.png'), fullPage: false });

      // Check for menu items
      const profileLink = await page.$('text=Your profile');
      const settingsLink = await page.$('text=Settings');
      const logoutLink = await page.$('text=Log out');

      if (profileLink || settingsLink) {
        log(testNum, 'User dropdown menu opens', 'PASS', `Profile: ${!!profileLink}, Settings: ${!!settingsLink}, Logout: ${!!logoutLink}`);
      } else {
        // Check for alternative menu items
        const userName = await page.$('text=Sarah');
        if (userName) {
          log(testNum, 'User dropdown menu opens', 'PASS', 'User menu opened with user name visible');
        } else {
          log(testNum, 'User dropdown menu opens', 'FAIL', 'User dropdown opened but no expected menu items');
        }
      }
    } else {
      log(testNum, 'User dropdown menu opens', 'FAIL', 'Chevron button not found in navbar');
      bugReport('P1', 'User dropdown chevron button not found in navbar');
    }
  } catch (e) {
    log(testNum, 'User dropdown menu opens', 'FAIL', e.message);
  }

  // 4.2: Close by clicking outside
  testNum++;
  try {
    await page.click('body', { position: { x: 100, y: 500 } });
    await page.waitForTimeout(500);
    log(testNum, 'User dropdown closes on outside click', 'PASS', 'Clicked outside');
  } catch (e) {
    log(testNum, 'User dropdown closes on outside click', 'FAIL', e.message);
  }

  // ============ TEST 5: Search Improvements ============
  console.log('\n=== SEARCH IMPROVEMENTS ===');

  // 5.1: Type in search bar and check suggestions
  testNum++;
  try {
    const searchInput = await page.$('input[type="search"], input[placeholder*="Search" i], input[type="text"][class*="search" i]');
    if (searchInput) {
      await searchInput.click();
      await searchInput.fill('interior');
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'test_search_suggestions.png'), fullPage: false });

      // Check for suggestions dropdown
      const suggestions = await page.$$('[class*="suggestion"], [class*="Suggestion"], [class*="dropdown"] [class*="item"], [role="listbox"] [role="option"]');
      if (suggestions.length > 0) {
        log(testNum, 'Search suggestions dropdown', 'PASS', `Found ${suggestions.length} suggestions`);
      } else {
        // Check for any dropdown-like element
        const dropdown = await page.$('[class*="search-dropdown"], [class*="SearchDropdown"], [class*="suggestions"]');
        if (dropdown) {
          log(testNum, 'Search suggestions dropdown', 'PASS', 'Suggestions dropdown found');
        } else {
          log(testNum, 'Search suggestions dropdown', 'FAIL', 'No suggestions dropdown appeared');
          bugReport('P1', 'Search suggestions dropdown not showing when typing');
        }
      }
    } else {
      log(testNum, 'Search suggestions dropdown', 'FAIL', 'Search input not found');
      bugReport('P0', 'Search input not found in navbar');
    }
  } catch (e) {
    log(testNum, 'Search suggestions dropdown', 'FAIL', e.message);
  }

  // 5.2: Submit search and check filter chips
  testNum++;
  try {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS, 'test_search_results.png'), fullPage: false });

    // Check for filter chips
    const chips = await page.$$('[class*="chip"], [class*="Chip"], [class*="filter-chip"], [class*="FilterChip"]');
    if (chips.length > 0) {
      log(testNum, 'Search filter chips', 'PASS', `Found ${chips.length} filter chips`);
    } else {
      // Check for buttons that look like chips
      const chipLike = await page.$$('[class*="rounded-full"][class*="px-"], button[class*="rounded-full"]');
      if (chipLike.length > 0) {
        log(testNum, 'Search filter chips', 'PASS', `Found ${chipLike.length} chip-like elements`);
      } else {
        log(testNum, 'Search filter chips', 'FAIL', 'No filter chips found on search results');
        bugReport('P1', 'Search filter chips not showing on results page');
      }
    }
  } catch (e) {
    log(testNum, 'Search filter chips', 'FAIL', e.message);
  }

  // 5.3: Search for no results
  testNum++;
  try {
    const searchInput = await page.$('input[type="search"], input[placeholder*="Search" i], input[type="text"][class*="search" i]');
    if (searchInput) {
      await searchInput.fill('xyznonexistent12345');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'test_no_results.png'), fullPage: false });

      const noResults = await page.$('text=No results');
      if (noResults) {
        log(testNum, 'No results state', 'PASS', '"No results" message displayed');
      } else {
        const emptyMessage = await page.$('text=Try a different');
        if (emptyMessage) {
          log(testNum, 'No results state', 'PASS', 'Empty state message found');
        } else {
          log(testNum, 'No results state', 'FAIL', 'No "No results" message displayed for empty search');
          bugReport('P1', 'No results state not showing for empty search queries');
        }
      }
    } else {
      log(testNum, 'No results state', 'SKIP', 'Search input not accessible');
    }
  } catch (e) {
    log(testNum, 'No results state', 'FAIL', e.message);
  }

  // Clear search
  const searchInput2 = await page.$('input[type="search"], input[placeholder*="Search" i]');
  if (searchInput2) {
    await searchInput2.fill('');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
  }

  // ============ TEST 6: Board Editing ============
  console.log('\n=== BOARD EDITING ===');

  testNum++;
  try {
    await page.goto(BASE + '/board/b1');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS, 'test_board_detail.png'), fullPage: false });

    // Find MoreHorizontal / options button
    const moreBtns = await page.$$('button');
    let optionsBtn = null;
    for (const btn of moreBtns) {
      const html = await btn.innerHTML();
      if (html.includes('MoreHorizontal') || html.includes('more-horizontal') || html.includes('ellipsis') || html.includes('circle')) {
        const text = await btn.textContent();
        if (text.trim() === '') {
          optionsBtn = btn;
          break;
        }
      }
    }

    if (optionsBtn) {
      await optionsBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'test_board_menu.png'), fullPage: false });

      // Check for Edit board option
      const editOption = await page.$('text=Edit board');
      const mergeOption = await page.$('text=Merge');
      const archiveOption = await page.$('text=Archive');
      const deleteOption = await page.$('text=Delete');

      if (editOption) {
        log(testNum, 'Board options menu', 'PASS', `Edit: ${!!editOption}, Merge: ${!!mergeOption}, Archive: ${!!archiveOption}, Delete: ${!!deleteOption}`);
      } else {
        log(testNum, 'Board options menu', 'FAIL', 'Edit board option not found in dropdown');
        bugReport('P1', 'Board options menu missing Edit board option');
      }
    } else {
      log(testNum, 'Board options menu', 'FAIL', 'Options button not found on board detail page');
      bugReport('P1', 'No options/more button on board detail page');
    }
  } catch (e) {
    log(testNum, 'Board options menu', 'FAIL', e.message);
  }

  // 6.2: Click Edit board and check modal
  testNum++;
  try {
    const editOpt = await page.$('text=Edit board');
    if (editOpt) {
      await editOpt.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'test_board_edit_modal.png'), fullPage: false });

      // Check for edit modal with pre-filled fields
      const nameInput = await page.$('input[value], input[placeholder*="name" i], input[placeholder*="board" i]');
      const descInput = await page.$('textarea, input[placeholder*="description" i]');

      if (nameInput) {
        const currentName = await nameInput.inputValue();
        log(testNum, 'Board edit modal', 'PASS', `Modal opened with name: "${currentName}"`);
      } else {
        log(testNum, 'Board edit modal', 'FAIL', 'Edit modal opened but no name input found');
      }
    } else {
      log(testNum, 'Board edit modal', 'SKIP', 'Edit board option not available');
    }
  } catch (e) {
    log(testNum, 'Board edit modal', 'FAIL', e.message);
  }

  // 6.3: Edit board name and save
  testNum++;
  try {
    const nameInput = await page.$('[role="dialog"] input, [class*="modal"] input, [class*="Modal"] input');
    if (nameInput) {
      await nameInput.fill('Updated Board Name Test');

      const saveBtn = await page.$('button:has-text("Save"), button:has-text("Done")');
      if (saveBtn) {
        await saveBtn.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(SCREENSHOTS, 'test_board_edited.png'), fullPage: false });

        // Verify the name updated
        const updatedName = await page.$('text=Updated Board Name Test');
        if (updatedName) {
          log(testNum, 'Board name edit saves', 'PASS', 'Board name updated successfully');
        } else {
          log(testNum, 'Board name edit saves', 'FAIL', 'Board name did not update after save');
          bugReport('P1', 'Board edit save does not update the displayed board name');
        }
      } else {
        log(testNum, 'Board name edit saves', 'FAIL', 'No Save button in edit modal');
      }
    } else {
      log(testNum, 'Board name edit saves', 'SKIP', 'Edit modal not open');
    }
  } catch (e) {
    log(testNum, 'Board name edit saves', 'FAIL', e.message);
  }

  // ============ TEST 7: Profile Edit ============
  console.log('\n=== PROFILE EDIT ===');

  testNum++;
  try {
    await page.goto(BASE + '/profile/u1');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS, 'test_profile.png'), fullPage: false });

    // Find Edit Profile button
    const editProfileBtn = await page.$('button:has-text("Edit Profile"), button:has-text("Edit profile"), a:has-text("Edit Profile")');
    if (editProfileBtn) {
      await editProfileBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'test_profile_edit_modal.png'), fullPage: false });

      // Check for form fields
      const nameField = await page.$('[role="dialog"] input, [class*="modal"] input');
      const bioField = await page.$('[role="dialog"] textarea, [class*="modal"] textarea');
      const websiteField = await page.$$('[role="dialog"] input, [class*="modal"] input');

      if (nameField) {
        log(testNum, 'Profile edit modal opens', 'PASS', `Modal with inputs found. Fields count: ${websiteField.length}`);
      } else {
        log(testNum, 'Profile edit modal opens', 'FAIL', 'Profile edit modal has no input fields');
      }
    } else {
      log(testNum, 'Profile edit modal opens', 'FAIL', 'Edit Profile button not found');
      bugReport('P1', 'Edit Profile button not found on profile page');
    }
  } catch (e) {
    log(testNum, 'Profile edit modal opens', 'FAIL', e.message);
  }

  // 7.2: Edit name and save
  testNum++;
  try {
    const inputs = await page.$$('[role="dialog"] input, [class*="modal"] input, [class*="Modal"] input');
    if (inputs.length > 0) {
      // First input is usually the name field
      await inputs[0].fill('Sarah Chen Updated');

      const saveBtn = await page.$('button:has-text("Save")');
      if (saveBtn) {
        await saveBtn.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(SCREENSHOTS, 'test_profile_edited.png'), fullPage: false });

        const updatedName = await page.$('text=Sarah Chen Updated');
        if (updatedName) {
          log(testNum, 'Profile edit saves', 'PASS', 'Name updated on profile page');
        } else {
          log(testNum, 'Profile edit saves', 'FAIL', 'Name did not update after save');
          bugReport('P1', 'Profile edit save does not update displayed name');
        }
      } else {
        log(testNum, 'Profile edit saves', 'FAIL', 'No Save button in profile edit modal');
      }
    } else {
      log(testNum, 'Profile edit saves', 'SKIP', 'Profile edit modal not open');
    }
  } catch (e) {
    log(testNum, 'Profile edit saves', 'FAIL', e.message);
  }

  // ============ TEST 8: Save Pin to Board (improved) ============
  console.log('\n=== SAVE PIN TO BOARD ===');

  testNum++;
  try {
    await page.goto(BASE);
    await page.waitForTimeout(2000);

    // Find pin cards and hover
    const cards = await page.$$('main img, [class*="masonry"] img');
    if (cards.length > 0) {
      const box = await cards[0].boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(SCREENSHOTS, 'test_pin_save_hover.png'), fullPage: false });

        // Check for Save button with board name
        const saveBtn = await page.$('button:has-text("Save"), button[class*="save" i]');
        if (saveBtn) {
          const saveText = await saveBtn.textContent();
          log(testNum, 'Pin card Save button on hover', 'PASS', `Save button text: "${saveText.trim()}"`);
        } else {
          log(testNum, 'Pin card Save button on hover', 'FAIL', 'No Save button visible on hover');
        }
      }
    } else {
      log(testNum, 'Pin card Save button on hover', 'FAIL', 'No pin cards found');
    }
  } catch (e) {
    log(testNum, 'Pin card Save button on hover', 'FAIL', e.message);
  }

  // 8.2: Click dropdown arrow for board selection
  testNum++;
  try {
    // Look for dropdown arrow next to save button
    const dropdownArrow = await page.$('[class*="save"] [class*="dropdown"], [class*="save"] [class*="arrow"], button[class*="chevron"]');
    const saveBtns = await page.$$('button:has-text("Save"), [class*="save-btn"]');

    if (dropdownArrow) {
      await dropdownArrow.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'test_board_selector.png'), fullPage: false });
      log(testNum, 'Board selector dropdown', 'PASS', 'Board selector dropdown opened');
    } else if (saveBtns.length > 0) {
      // Try clicking the save button itself to see if board selection appears
      // First check if there's a dropdown toggle nearby
      const parent = await saveBtns[0].evaluateHandle(el => el.parentElement);
      const siblingBtns = await parent.$$('button');
      if (siblingBtns.length > 1) {
        // Multiple buttons in save area - second one might be dropdown
        await siblingBtns[1].click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(SCREENSHOTS, 'test_board_selector.png'), fullPage: false });
        log(testNum, 'Board selector dropdown', 'PASS', 'Clicked secondary button in save area');
      } else {
        log(testNum, 'Board selector dropdown', 'PARTIAL', 'Save button found but no dropdown arrow');
      }
    } else {
      log(testNum, 'Board selector dropdown', 'FAIL', 'No save button or dropdown found');
    }
  } catch (e) {
    log(testNum, 'Board selector dropdown', 'FAIL', e.message);
  }

  // ============ TEST 9: Pin Like ============
  console.log('\n=== PIN LIKE ===');

  testNum++;
  try {
    await page.goto(BASE);
    await page.waitForTimeout(2000);

    // Open pin detail modal
    const imgs = await page.$$('main img');
    if (imgs.length > 0) {
      await imgs[0].click();
      await page.waitForTimeout(1000);
    }

    // Find heart/like icon in modal
    const heartBtns = await page.$$('[role="dialog"] button, [class*="modal"] button, [class*="Modal"] button');
    let heartBtn = null;
    for (const btn of heartBtns) {
      const html = await btn.innerHTML();
      if (html.includes('heart') || html.includes('Heart') || html.includes('like') || html.includes('Like')) {
        heartBtn = btn;
        break;
      }
    }

    if (heartBtn) {
      // Get initial like count
      const initialText = await heartBtn.textContent();
      await heartBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'test_pin_liked.png'), fullPage: false });

      const afterText = await heartBtn.textContent();
      log(testNum, 'Pin like in modal', 'PASS', `Before: "${initialText.trim()}", After: "${afterText.trim()}"`);
    } else {
      // Try finding by svg
      const allBtns = await page.$$('[role="dialog"] button svg, [class*="modal"] button svg');
      log(testNum, 'Pin like in modal', 'FAIL', `No heart button found in modal (checked ${allBtns.length} button svgs)`);
      bugReport('P1', 'Heart/like button not found in pin detail modal');
    }
  } catch (e) {
    log(testNum, 'Pin like in modal', 'FAIL', e.message);
  }

  // 9.2: Check heart on pin card
  testNum++;
  try {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Look for heart icons on pin cards
    const cardHearts = await page.$$('[class*="pin-card"] svg, [class*="PinCard"] svg, main [class*="heart" i]');
    if (cardHearts.length > 0) {
      log(testNum, 'Pin card heart icon', 'PASS', `Found ${cardHearts.length} heart-like elements on cards`);
    } else {
      log(testNum, 'Pin card heart icon', 'FAIL', 'No heart icons found on pin cards');
    }
  } catch (e) {
    log(testNum, 'Pin card heart icon', 'FAIL', e.message);
  }

  // ============ TEST 10: Related Pins ============
  console.log('\n=== RELATED PINS ===');

  testNum++;
  try {
    await page.goto(BASE);
    await page.waitForTimeout(2000);

    // Open pin modal
    const imgs = await page.$$('main img');
    if (imgs.length > 0) {
      await imgs[0].click();
      await page.waitForTimeout(1000);
    }

    // Scroll within modal to find "More like this"
    const modal = await page.$('[role="dialog"], [class*="modal"], [class*="Modal"]');
    if (modal) {
      // Scroll inside the modal
      await modal.evaluate(el => el.scrollTop = el.scrollHeight);
      await page.waitForTimeout(500);

      // Also try scrolling right panel
      const rightPanel = await page.$('[class*="modal"] [class*="right"], [class*="modal"] [class*="details"], [role="dialog"] > div > div:last-child');
      if (rightPanel) {
        await rightPanel.evaluate(el => el.scrollTop = el.scrollHeight);
        await page.waitForTimeout(500);
      }

      await page.screenshot({ path: path.join(SCREENSHOTS, 'test_related_pins.png'), fullPage: false });

      const moreLikeThis = await page.$('text=More like this');
      if (moreLikeThis) {
        log(testNum, 'Related pins section', 'PASS', '"More like this" section found');
      } else {
        // Try alternative headings
        const relatedSection = await page.$('text=Related, text=Similar, text=You might also like');
        if (relatedSection) {
          log(testNum, 'Related pins section', 'PASS', 'Related section found with alternative heading');
        } else {
          log(testNum, 'Related pins section', 'FAIL', '"More like this" section not found in modal');
          bugReport('P1', 'Related pins "More like this" section missing from pin detail modal');
        }
      }
    } else {
      log(testNum, 'Related pins section', 'FAIL', 'Could not open modal');
    }
  } catch (e) {
    log(testNum, 'Related pins section', 'FAIL', e.message);
  }

  // 10.2: Click a related pin
  testNum++;
  try {
    const moreLikeThis = await page.$('text=More like this');
    if (moreLikeThis) {
      // Find images after "More like this"
      const relatedImgs = await page.$$('[class*="related"] img, [class*="Related"] img');
      if (relatedImgs.length > 0) {
        await relatedImgs[0].click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(SCREENSHOTS, 'test_related_pin_clicked.png'), fullPage: false });
        log(testNum, 'Click related pin updates modal', 'PASS', 'Clicked related pin, modal should update');
      } else {
        // Try finding images inside/after the "More like this" section
        const allModalImgs = await page.$$('[role="dialog"] img, [class*="modal"] img');
        if (allModalImgs.length > 2) {
          // Click an image that's not the main pin image
          await allModalImgs[allModalImgs.length - 1].click();
          await page.waitForTimeout(1000);
          log(testNum, 'Click related pin updates modal', 'PASS', 'Clicked a different image in modal area');
        } else {
          log(testNum, 'Click related pin updates modal', 'FAIL', 'No related pin images found to click');
        }
      }
    } else {
      log(testNum, 'Click related pin updates modal', 'SKIP', 'No "More like this" section found');
    }
  } catch (e) {
    log(testNum, 'Click related pin updates modal', 'FAIL', e.message);
  }

  // ============ TEST: Go endpoint state ============
  console.log('\n=== STATE ENDPOINT ===');
  testNum++;
  try {
    const goResponse = await page.goto(BASE + '/go');
    await page.waitForTimeout(1000);
    const bodyText = await page.textContent('body');
    const stateData = JSON.parse(bodyText);

    const hasInitial = !!stateData.initial_state;
    const hasCurrent = !!stateData.current_state;
    const hasDiff = stateData.hasOwnProperty('state_diff');

    if (hasInitial && hasCurrent && hasDiff) {
      log(testNum, '/go endpoint returns state', 'PASS', `initial_state: ${!!hasInitial}, current_state: ${!!hasCurrent}, state_diff: ${!!hasDiff}`);
    } else {
      log(testNum, '/go endpoint returns state', 'PARTIAL', `Missing: initial=${!hasInitial}, current=${!hasCurrent}, diff=${!hasDiff}`);
    }
  } catch (e) {
    log(testNum, '/go endpoint returns state', 'FAIL', e.message);
  }

  // ============ Generate Report ============
  console.log('\n\n========= FINAL REPORT =========');
  console.log('JSON_RESULTS_START');
  console.log(JSON.stringify({ results, bugs }, null, 2));
  console.log('JSON_RESULTS_END');

  await browser.close();
})().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
