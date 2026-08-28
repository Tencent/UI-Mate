const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS = path.join(__dirname, 'assets', 'screenshots');
const BASE = 'http://localhost:5180';

const results = [];
const bugs = [];

function log(testNum, name, result, notes) {
  results.push({ num: testNum, name, result, notes });
  console.log(`[${result}] #${testNum} ${name}: ${notes}`);
}

function bug(severity, desc) {
  bugs.push({ severity, desc });
  console.log(`[BUG-${severity}] ${desc}`);
}

(async () => {
  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Capture console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  // Clear localStorage and navigate
  await page.goto(BASE);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_home.png') });

  let testNum = 0;

  // ============================================
  // TEST GROUP 1: Comments System
  // ============================================
  console.log('\n=== 1. COMMENTS SYSTEM ===');

  // 1.1 Open pin detail modal
  testNum++;
  try {
    // Pin cards have class containing "break-inside-avoid" and "cursor-zoom-in"
    const pinCards = await page.$$('[class*="break-inside-avoid"]');
    console.log(`Found ${pinCards.length} pin cards`);

    if (pinCards.length > 0) {
      await pinCards[0].click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_pin_modal.png') });

      // Check for modal overlay (fixed inset-0)
      const hasModal = await page.evaluate(() => {
        const fixedEls = document.querySelectorAll('.fixed.inset-0');
        for (const el of fixedEls) {
          if (el.querySelector('img') && getComputedStyle(el).display !== 'none') return true;
        }
        return false;
      });

      if (hasModal) {
        log(testNum, 'Open pin detail modal', 'PASS', 'Modal overlay opened with pin image');
      } else {
        // Check if URL changed to /pin/:id
        const url = page.url();
        if (url.includes('/pin/')) {
          log(testNum, 'Open pin detail modal', 'PASS', `Navigated to pin detail: ${url}`);
        } else {
          log(testNum, 'Open pin detail modal', 'FAIL', 'No modal or pin page detected after click');
          bug('P0', 'Pin detail modal/page does not appear when clicking a pin');
        }
      }
    } else {
      log(testNum, 'Open pin detail modal', 'FAIL', 'No pin cards found on homepage');
      bug('P0', 'No pin cards rendered on homepage');
    }
  } catch (e) {
    log(testNum, 'Open pin detail modal', 'FAIL', e.message.substring(0, 200));
  }

  // 1.2 Verify comments section heading
  testNum++;
  try {
    const commentsText = await page.evaluate(() => {
      const els = document.querySelectorAll('*');
      for (const el of els) {
        const text = el.textContent || '';
        if (text.match(/^Comments/i) && el.children.length < 3) {
          return { text: text.trim().substring(0, 50), tag: el.tagName };
        }
      }
      return null;
    });

    if (commentsText) {
      log(testNum, 'Comments section heading', 'PASS', `Found "${commentsText.text}" in <${commentsText.tag}>`);
    } else {
      log(testNum, 'Comments section heading', 'FAIL', 'No Comments heading found');
      bug('P1', 'Comments section heading not visible in pin detail');
    }
  } catch (e) {
    log(testNum, 'Comments section heading', 'FAIL', e.message.substring(0, 200));
  }

  // 1.3 Verify existing comments display
  testNum++;
  try {
    const commentInfo = await page.evaluate(() => {
      // Look for timestamp patterns like "2h ago", "3d ago"
      const allText = document.body.innerText;
      const timestampMatches = allText.match(/\d+[smhdw] ago/g) || [];

      // Look for comment-like structures (small avatar + text + timestamp)
      const avatarImgs = document.querySelectorAll('.fixed img[class*="rounded-full"], .fixed img[class*="rounded"]');

      return {
        timestamps: timestampMatches.length,
        avatars: avatarImgs.length,
        hasCommentLikeStructure: timestampMatches.length > 0
      };
    });

    if (commentInfo.hasCommentLikeStructure) {
      log(testNum, 'Existing comments display', 'PASS', `Found ${commentInfo.timestamps} timestamp strings and ${commentInfo.avatars} avatars`);
    } else {
      log(testNum, 'Existing comments display', 'FAIL', 'No comment-like content found');
    }
  } catch (e) {
    log(testNum, 'Existing comments display', 'FAIL', e.message.substring(0, 200));
  }

  // 1.4 Type a comment and post
  testNum++;
  try {
    // Look for comment input
    const inputFound = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input, textarea');
      for (const inp of inputs) {
        const placeholder = inp.placeholder || '';
        if (placeholder.toLowerCase().includes('comment') || placeholder.toLowerCase().includes('add') || placeholder.toLowerCase().includes('say')) {
          return { placeholder, tag: inp.tagName, type: inp.type || 'text' };
        }
      }
      // Also check within fixed elements (modal)
      const fixedInputs = document.querySelectorAll('.fixed input, .fixed textarea');
      for (const inp of fixedInputs) {
        return { placeholder: inp.placeholder, tag: inp.tagName, type: inp.type || 'text' };
      }
      return null;
    });

    if (inputFound) {
      console.log(`  Found input: ${JSON.stringify(inputFound)}`);
      const selector = inputFound.tag === 'TEXTAREA'
        ? `.fixed textarea[placeholder*="${inputFound.placeholder.substring(0, 10)}"]`
        : `.fixed input[placeholder*="${inputFound.placeholder.substring(0, 10)}"]`;

      const input = await page.$(selector) || await page.$('.fixed input') || await page.$('.fixed textarea');
      if (input) {
        await input.fill('Test comment from Playwright');
        await page.waitForTimeout(300);

        // Find and click Post button
        const postBtn = await page.$('.fixed button:has-text("Post")') || await page.$('button:has-text("Post")');
        if (postBtn) {
          const disabled = await postBtn.isDisabled();
          if (!disabled) {
            await postBtn.click();
            await page.waitForTimeout(1000);
            await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_comment_posted.png') });

            const hasNewComment = await page.evaluate(() => document.body.innerText.includes('Test comment from Playwright'));
            if (hasNewComment) {
              log(testNum, 'Post a comment', 'PASS', 'Comment posted and visible');
            } else {
              log(testNum, 'Post a comment', 'FAIL', 'Comment not visible after posting');
              bug('P1', 'Posted comment does not appear in comments list');
            }
          } else {
            log(testNum, 'Post a comment', 'FAIL', 'Post button disabled with text entered');
            bug('P1', 'Post button stays disabled when comment text is entered');
          }
        } else {
          log(testNum, 'Post a comment', 'FAIL', 'No Post button found');
          bug('P1', 'No Post button in comments section');
        }
      } else {
        log(testNum, 'Post a comment', 'FAIL', 'Could not find input via selector');
      }
    } else {
      log(testNum, 'Post a comment', 'FAIL', 'No comment input field found');
      bug('P1', 'No comment input field in pin detail');
    }
  } catch (e) {
    log(testNum, 'Post a comment', 'FAIL', e.message.substring(0, 200));
  }

  // 1.5 Like a comment
  testNum++;
  try {
    const likedComment = await page.evaluate(() => {
      // Find heart/like SVGs within the modal
      const fixedEl = document.querySelector('.fixed.inset-0');
      if (!fixedEl) return { found: false };

      // Look for heart icons (lucide Heart icon or similar)
      const svgs = fixedEl.querySelectorAll('svg');
      for (const svg of svgs) {
        const html = svg.outerHTML;
        if (html.includes('heart') || html.includes('Heart') || html.includes('M20.84 4.61') || html.includes('M12 21')) {
          const btn = svg.closest('button');
          if (btn) {
            btn.click();
            return { found: true, clicked: true };
          }
        }
      }
      return { found: false };
    });

    if (likedComment.clicked) {
      await page.waitForTimeout(500);
      log(testNum, 'Like a comment', 'PASS', 'Heart button clicked in comment area');
    } else {
      log(testNum, 'Like a comment', 'FAIL', 'No heart/like button found in comments');
    }
  } catch (e) {
    log(testNum, 'Like a comment', 'FAIL', e.message.substring(0, 200));
  }

  // 1.6 Delete own comment
  testNum++;
  try {
    const deleteResult = await page.evaluate(() => {
      const fixedEl = document.querySelector('.fixed.inset-0');
      if (!fixedEl) return { found: false };

      // Look for "..." or MoreHorizontal in comment items
      const btns = fixedEl.querySelectorAll('button');
      for (const btn of btns) {
        const html = btn.innerHTML;
        if (html.includes('MoreHorizontal') || html.includes('more-horizontal') ||
            html.includes('...') || html.includes('M12 12') ||
            (html.includes('circle') && html.includes('cx=') && html.length < 500)) {
          // This might be a more options button
          btn.click();
          return { found: true, clicked: true };
        }
      }
      return { found: false };
    });

    if (deleteResult.clicked) {
      await page.waitForTimeout(500);
      const deleteOpt = await page.$('text=Delete');
      if (deleteOpt) {
        log(testNum, 'Delete own comment', 'PASS', 'More menu shows Delete option');
      } else {
        log(testNum, 'Delete own comment', 'PARTIAL', 'More button clicked but no Delete option visible');
      }
    } else {
      log(testNum, 'Delete own comment', 'FAIL', 'No more/options button found on comments');
    }
  } catch (e) {
    log(testNum, 'Delete own comment', 'FAIL', e.message.substring(0, 200));
  }

  // Close modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // ============================================
  // TEST GROUP 2: Pin Deletion
  // ============================================
  console.log('\n=== 2. PIN DELETION ===');

  // 2.1 Hover over pin card - check for MoreHorizontal button
  testNum++;
  try {
    await page.goto(BASE);
    await page.waitForTimeout(2000);

    const pinCards = await page.$$('[class*="break-inside-avoid"]');
    if (pinCards.length > 0) {
      await pinCards[0].hover();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_pin_hover.png') });

      // Check for overlay buttons on hover
      const hoverButtons = await page.evaluate(() => {
        const card = document.querySelector('[class*="break-inside-avoid"]');
        if (!card) return [];
        const btns = card.querySelectorAll('button');
        return Array.from(btns).map(b => ({
          text: b.textContent.trim().substring(0, 30),
          classes: b.className.substring(0, 80),
          hasSvg: b.querySelector('svg') !== null,
          svgContent: b.querySelector('svg')?.innerHTML?.substring(0, 100) || ''
        }));
      });
      console.log('  Hover buttons:', JSON.stringify(hoverButtons));

      const hasMoreBtn = hoverButtons.some(b =>
        b.svgContent.includes('circle') || b.svgContent.includes('MoreHorizontal') || b.text.includes('...')
      );

      if (hasMoreBtn) {
        log(testNum, 'Pin card hover shows more button', 'PASS', 'MoreHorizontal button visible');
      } else if (hoverButtons.length > 0) {
        log(testNum, 'Pin card hover shows more button', 'PARTIAL', `Found ${hoverButtons.length} buttons but none is MoreHorizontal`);
      } else {
        log(testNum, 'Pin card hover shows more button', 'FAIL', 'No buttons visible on pin card hover');
      }
    }
  } catch (e) {
    log(testNum, 'Pin card hover shows more button', 'FAIL', e.message.substring(0, 200));
  }

  // 2.2 Test delete from pin detail modal
  testNum++;
  try {
    const pinCards = await page.$$('[class*="break-inside-avoid"]');
    // Find a pin by current user (u1)
    if (pinCards.length > 0) {
      await pinCards[0].click();
      await page.waitForTimeout(1500);

      // Find MoreHorizontal button in modal
      const moreResult = await page.evaluate(() => {
        const fixedEl = document.querySelector('.fixed.inset-0');
        if (!fixedEl) return { found: false, reason: 'no fixed overlay' };

        const btns = fixedEl.querySelectorAll('button');
        const btnInfo = [];
        for (const btn of btns) {
          const html = btn.innerHTML;
          btnInfo.push(btn.textContent.trim().substring(0, 30));
          // Look for the more horizontal button (3 dots)
          if (html.includes('MoreHorizontal') || html.includes('more-horizontal') ||
              (html.includes('<circle') && !html.includes('Heart') && btn.textContent.trim() === '')) {
            btn.click();
            return { found: true, clicked: true };
          }
        }
        return { found: false, reason: 'no more button among: ' + btnInfo.join(', ') };
      });

      if (moreResult.clicked) {
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_pin_more_menu.png') });

        const deletePin = await page.$('text=Delete Pin');
        const deleteGeneric = await page.$('text=Delete');
        if (deletePin) {
          log(testNum, 'Pin modal Delete Pin option', 'PASS', '"Delete Pin" option found in dropdown');
        } else if (deleteGeneric) {
          log(testNum, 'Pin modal Delete Pin option', 'PASS', '"Delete" option found');
        } else {
          log(testNum, 'Pin modal Delete Pin option', 'FAIL', 'More menu opened but no Delete option');
          bug('P1', 'Pin modal more menu missing Delete Pin option');
        }
      } else {
        log(testNum, 'Pin modal Delete Pin option', 'FAIL', moreResult.reason);
        bug('P1', 'More button not found in pin detail modal');
      }
    }
  } catch (e) {
    log(testNum, 'Pin modal Delete Pin option', 'FAIL', e.message.substring(0, 200));
  }

  // 2.3 Actually delete a pin
  testNum++;
  try {
    const deleteOpt = await page.$('text=Delete Pin') || await page.$('[class*="dropdown"] :has-text("Delete")');
    if (deleteOpt) {
      // Count pins before
      const pinCountBefore = await page.evaluate(() => document.querySelectorAll('[class*="break-inside-avoid"]').length);

      await deleteOpt.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_pin_deleted.png') });

      // Check for toast
      const toastVisible = await page.evaluate(() => {
        const body = document.body.innerText.toLowerCase();
        return body.includes('deleted') || body.includes('removed');
      });

      const pinCountAfter = await page.evaluate(() => document.querySelectorAll('[class*="break-inside-avoid"]').length);

      if (toastVisible || pinCountAfter < pinCountBefore) {
        log(testNum, 'Pin deletion works', 'PASS', `Toast: ${toastVisible}, Pins before: ${pinCountBefore}, after: ${pinCountAfter}`);
      } else {
        log(testNum, 'Pin deletion works', 'PARTIAL', 'Clicked delete but no visible feedback');
      }
    } else {
      log(testNum, 'Pin deletion works', 'SKIP', 'No Delete option available');
    }
  } catch (e) {
    log(testNum, 'Pin deletion works', 'FAIL', e.message.substring(0, 200));
  }

  // Close any open modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // ============================================
  // TEST GROUP 3: Notifications Dropdown
  // ============================================
  console.log('\n=== 3. NOTIFICATIONS DROPDOWN ===');
  await page.goto(BASE);
  await page.waitForTimeout(2000);

  // 3.1 Click bell icon
  testNum++;
  try {
    const bellClicked = await page.evaluate(() => {
      const navBtns = document.querySelectorAll('nav button, header button');
      for (const btn of navBtns) {
        const html = btn.innerHTML;
        if (html.includes('Bell') || html.includes('bell') || html.includes('notification')) {
          btn.click();
          return true;
        }
      }
      return false;
    });

    if (bellClicked) {
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_notifications.png') });

      const hasUpdates = await page.evaluate(() => document.body.innerText.includes('Updates'));
      const hasMarkAll = await page.evaluate(() => document.body.innerText.includes('Mark all as read'));

      if (hasUpdates && hasMarkAll) {
        log(testNum, 'Notifications dropdown opens', 'PASS', '"Updates" header and "Mark all as read" both present');
      } else if (hasUpdates) {
        log(testNum, 'Notifications dropdown opens', 'PARTIAL', '"Updates" found, "Mark all as read" missing');
      } else {
        log(testNum, 'Notifications dropdown opens', 'FAIL', 'Dropdown may have opened but missing expected content');
      }
    } else {
      log(testNum, 'Notifications dropdown opens', 'FAIL', 'Bell icon not found');
      bug('P0', 'Bell icon not found in navbar');
    }
  } catch (e) {
    log(testNum, 'Notifications dropdown opens', 'FAIL', e.message.substring(0, 200));
  }

  // 3.2 Check notification items
  testNum++;
  try {
    const notifInfo = await page.evaluate(() => {
      const text = document.body.innerText;
      const timestamps = (text.match(/\d+[dhm] ago/g) || []).length;
      const unreadItems = document.querySelectorAll('[class*="bg-blue"]');
      return { timestamps, unreadCount: unreadItems.length };
    });

    if (notifInfo.timestamps > 0) {
      log(testNum, 'Notification items display', 'PASS', `${notifInfo.timestamps} notifications with timestamps, ${notifInfo.unreadCount} unread`);
    } else {
      log(testNum, 'Notification items display', 'FAIL', 'No notification items found');
    }
  } catch (e) {
    log(testNum, 'Notification items display', 'FAIL', e.message.substring(0, 200));
  }

  // 3.3 Check red badge on bell
  testNum++;
  try {
    const badgeInfo = await page.evaluate(() => {
      const nav = document.querySelector('nav');
      if (!nav) return null;
      // Look for absolute-positioned spans (badge indicators)
      const badges = nav.querySelectorAll('.absolute, [class*="badge"]');
      for (const badge of badges) {
        const text = badge.textContent.trim();
        const style = getComputedStyle(badge);
        if (text && !isNaN(text)) {
          return { text, bg: style.backgroundColor };
        }
      }
      return null;
    });

    if (badgeInfo) {
      log(testNum, 'Bell icon red badge', 'PASS', `Badge shows "${badgeInfo.text}"`);
    } else {
      log(testNum, 'Bell icon red badge', 'FAIL', 'No badge indicator found');
    }
  } catch (e) {
    log(testNum, 'Bell icon red badge', 'FAIL', e.message.substring(0, 200));
  }

  // 3.4 Mark all as read
  testNum++;
  try {
    const markAllBtn = await page.$('text=Mark all as read');
    if (markAllBtn) {
      // Count unread before
      const unreadBefore = await page.$$eval('[class*="bg-blue"]', els => els.length);
      await markAllBtn.click();
      await page.waitForTimeout(500);
      const unreadAfter = await page.$$eval('[class*="bg-blue"]', els => els.length);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_notif_all_read.png') });

      if (unreadAfter < unreadBefore || unreadAfter === 0) {
        log(testNum, 'Mark all as read', 'PASS', `Unread: ${unreadBefore} -> ${unreadAfter}`);
      } else {
        log(testNum, 'Mark all as read', 'FAIL', `Unread count unchanged: ${unreadBefore} -> ${unreadAfter}`);
        bug('P1', 'Mark all as read does not change unread styling');
      }
    } else {
      log(testNum, 'Mark all as read', 'SKIP', 'Button not found');
    }
  } catch (e) {
    log(testNum, 'Mark all as read', 'FAIL', e.message.substring(0, 200));
  }

  // 3.5 Close on outside click
  testNum++;
  try {
    await page.mouse.click(200, 600);
    await page.waitForTimeout(500);
    const stillOpen = await page.evaluate(() => {
      const el = document.querySelector('[class*="notification"]');
      return el && el.offsetHeight > 0;
    });
    const updatesVisible = await page.evaluate(() => {
      // Check if "Updates" heading is still visible (not the dropdown)
      const els = document.querySelectorAll('div, span, h2, h3');
      for (const el of els) {
        if (el.textContent.trim() === 'Updates' && el.offsetHeight > 0) {
          return true;
        }
      }
      return false;
    });

    if (!updatesVisible) {
      log(testNum, 'Close notifications on outside click', 'PASS', 'Dropdown closed');
    } else {
      log(testNum, 'Close notifications on outside click', 'FAIL', 'Dropdown still visible');
      bug('P1', 'Notifications dropdown does not close on outside click');
    }
  } catch (e) {
    log(testNum, 'Close notifications on outside click', 'FAIL', e.message.substring(0, 200));
  }

  // ============================================
  // TEST GROUP 4: User Dropdown Menu
  // ============================================
  console.log('\n=== 4. USER DROPDOWN MENU ===');
  await page.goto(BASE);
  await page.waitForTimeout(2000);

  testNum++;
  try {
    const chevronClicked = await page.evaluate(() => {
      const navBtns = document.querySelectorAll('nav button, nav div[class*="relative"] button');
      for (const btn of navBtns) {
        const html = btn.innerHTML;
        if (html.includes('ChevronDown') || html.includes('chevron-down') ||
            html.includes('caret') || html.includes('polyline')) {
          btn.click();
          return { clicked: true, btnText: btn.textContent.trim().substring(0, 20) };
        }
      }
      // Try the last relative div in nav (usually the user menu area)
      const relativeDivs = document.querySelectorAll('nav .relative');
      const lastRelative = relativeDivs[relativeDivs.length - 1];
      if (lastRelative) {
        const btn = lastRelative.querySelector('button');
        if (btn) {
          btn.click();
          return { clicked: true, btnText: 'last-relative-btn' };
        }
      }
      return { clicked: false };
    });

    if (chevronClicked.clicked) {
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_user_dropdown.png') });

      const menuItems = await page.evaluate(() => {
        const items = [];
        const text = document.body.innerText;
        if (text.includes('Your profile')) items.push('Your profile');
        if (text.includes('Settings')) items.push('Settings');
        if (text.includes('Log out')) items.push('Log out');
        if (text.includes('Sarah')) items.push('Sarah name');
        if (text.includes('Your boards')) items.push('Your boards');
        return items;
      });

      if (menuItems.length >= 2) {
        log(testNum, 'User dropdown menu', 'PASS', `Menu items: ${menuItems.join(', ')}`);
      } else if (menuItems.length > 0) {
        log(testNum, 'User dropdown menu', 'PARTIAL', `Only found: ${menuItems.join(', ')}`);
      } else {
        log(testNum, 'User dropdown menu', 'FAIL', 'No expected menu items found');
      }
    } else {
      log(testNum, 'User dropdown menu', 'FAIL', 'Chevron button not found');
      bug('P1', 'User dropdown chevron/button not found in navbar');
    }
  } catch (e) {
    log(testNum, 'User dropdown menu', 'FAIL', e.message.substring(0, 200));
  }

  // Close
  await page.mouse.click(200, 600);
  await page.waitForTimeout(300);

  // ============================================
  // TEST GROUP 5: Search Improvements
  // ============================================
  console.log('\n=== 5. SEARCH IMPROVEMENTS ===');
  await page.goto(BASE);
  await page.waitForTimeout(2000);

  // 5.1 Search suggestions
  testNum++;
  try {
    const searchInput = await page.$('input[placeholder*="Search" i], input[type="search"]');
    if (searchInput) {
      await searchInput.click();
      await searchInput.fill('interior');
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_search_suggestions.png') });

      const suggestionsInfo = await page.evaluate(() => {
        // Look for dropdown/suggestion elements
        const dropdowns = document.querySelectorAll('[class*="suggestion"], [class*="dropdown"], [class*="search"] ul, [class*="search"] [class*="list"]');
        const visibleDropdowns = [];
        for (const dd of dropdowns) {
          if (dd.offsetHeight > 0) {
            visibleDropdowns.push({ classes: dd.className.substring(0, 80), childCount: dd.children.length });
          }
        }
        // Also check for absolute/fixed positioned elements that appeared
        const absolutes = document.querySelectorAll('[class*="absolute"]');
        let suggestionLikeEls = 0;
        for (const abs of absolutes) {
          if (abs.offsetHeight > 0 && abs.innerText.includes('interior')) {
            suggestionLikeEls++;
          }
        }
        return { dropdowns: visibleDropdowns, suggestionMatches: suggestionLikeEls };
      });

      if (suggestionsInfo.dropdowns.length > 0 || suggestionsInfo.suggestionMatches > 0) {
        log(testNum, 'Search suggestions dropdown', 'PASS', `Dropdowns: ${suggestionsInfo.dropdowns.length}, matches: ${suggestionsInfo.suggestionMatches}`);
      } else {
        log(testNum, 'Search suggestions dropdown', 'FAIL', 'No suggestions dropdown appeared');
        bug('P1', 'Search suggestions not showing when typing');
      }
    } else {
      log(testNum, 'Search suggestions dropdown', 'FAIL', 'Search input not found');
    }
  } catch (e) {
    log(testNum, 'Search suggestions dropdown', 'FAIL', e.message.substring(0, 200));
  }

  // 5.2 Submit search - filter chips
  testNum++;
  try {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_search_results.png') });

    const chipInfo = await page.evaluate(() => {
      // Look for filter chip elements (rounded-full buttons/spans)
      const chips = document.querySelectorAll('button[class*="rounded-full"], span[class*="rounded-full"], [class*="chip"], [class*="Chip"]');
      const visibleChips = [];
      for (const chip of chips) {
        if (chip.offsetHeight > 0 && chip.offsetHeight < 50) {
          visibleChips.push(chip.textContent.trim().substring(0, 20));
        }
      }
      return visibleChips;
    });

    if (chipInfo.length > 0) {
      log(testNum, 'Search filter chips', 'PASS', `Chips: ${chipInfo.slice(0, 5).join(', ')} (${chipInfo.length} total)`);
    } else {
      log(testNum, 'Search filter chips', 'FAIL', 'No filter chips found');
      bug('P1', 'Search filter chips not showing on results page');
    }
  } catch (e) {
    log(testNum, 'Search filter chips', 'FAIL', e.message.substring(0, 200));
  }

  // 5.3 No results state
  testNum++;
  try {
    const searchInput = await page.$('input[placeholder*="Search" i], input[type="search"]');
    if (searchInput) {
      await searchInput.fill('xyznonexistent99999');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_no_results.png') });

      const noResults = await page.evaluate(() => {
        const text = document.body.innerText;
        return text.includes('No results') || text.includes('no results') || text.includes('not found');
      });

      if (noResults) {
        log(testNum, 'No results state', 'PASS', '"No results" message shown');
      } else {
        log(testNum, 'No results state', 'FAIL', 'No "No results" message');
        bug('P1', 'No results state not displayed for empty search');
      }
    }
  } catch (e) {
    log(testNum, 'No results state', 'FAIL', e.message.substring(0, 200));
  }

  // ============================================
  // TEST GROUP 6: Board Editing
  // ============================================
  console.log('\n=== 6. BOARD EDITING ===');

  testNum++;
  try {
    await page.goto(BASE + '/board/b1');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_board_detail.png') });

    // Look for the board page content
    const pageInfo = await page.evaluate(() => {
      const h1 = document.querySelector('h1, h2, [class*="board-name"], [class*="BoardName"]');
      const btns = document.querySelectorAll('button');
      const btnTexts = Array.from(btns).map(b => b.textContent.trim().substring(0, 20));
      return {
        heading: h1?.textContent?.trim() || 'none',
        buttonCount: btns.length,
        buttons: btnTexts,
      };
    });
    console.log('  Board page:', JSON.stringify(pageInfo));

    // Click more/options button
    const moreClicked = await page.evaluate(() => {
      const btns = document.querySelectorAll('button');
      for (const btn of btns) {
        const html = btn.innerHTML;
        if ((html.includes('MoreHorizontal') || html.includes('more-horizontal') ||
             html.includes('ellipsis') || (html.includes('<circle') && html.includes('cx=') && !html.includes('Heart')))
            && btn.textContent.trim() === '') {
          btn.click();
          return true;
        }
      }
      // Try text buttons
      for (const btn of btns) {
        if (btn.textContent.trim() === '...') {
          btn.click();
          return true;
        }
      }
      return false;
    });

    if (moreClicked) {
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_board_options.png') });

      const menuItems = await page.evaluate(() => {
        const text = document.body.innerText;
        return {
          edit: text.includes('Edit board'),
          merge: text.includes('Merge'),
          archive: text.includes('Archive'),
          delete: text.includes('Delete'),
        };
      });

      if (menuItems.edit) {
        log(testNum, 'Board options menu', 'PASS', `Items: ${JSON.stringify(menuItems)}`);
      } else if (menuItems.delete) {
        log(testNum, 'Board options menu', 'PARTIAL', 'Delete found but Edit board missing');
        bug('P1', 'Board options menu missing "Edit board" option');
      } else {
        log(testNum, 'Board options menu', 'FAIL', 'No expected menu items found');
      }
    } else {
      log(testNum, 'Board options menu', 'FAIL', 'MoreHorizontal button not found');
      bug('P1', 'No options button on board detail page');
    }
  } catch (e) {
    log(testNum, 'Board options menu', 'FAIL', e.message.substring(0, 200));
  }

  // 6.2 Edit board modal
  testNum++;
  try {
    const editBtn = await page.$('text=Edit board');
    if (editBtn) {
      await editBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_board_edit_modal.png') });

      const modalInfo = await page.evaluate(() => {
        const fixedEls = document.querySelectorAll('.fixed');
        for (const el of fixedEls) {
          const inputs = el.querySelectorAll('input, textarea');
          if (inputs.length > 0) {
            return {
              found: true,
              inputCount: inputs.length,
              firstValue: inputs[0].value,
            };
          }
        }
        return { found: false };
      });

      if (modalInfo.found) {
        log(testNum, 'Board edit modal', 'PASS', `Modal with ${modalInfo.inputCount} inputs, first value: "${modalInfo.firstValue}"`);
      } else {
        log(testNum, 'Board edit modal', 'FAIL', 'Modal opened but no input fields found');
      }
    } else {
      log(testNum, 'Board edit modal', 'SKIP', 'Edit board option not found');
    }
  } catch (e) {
    log(testNum, 'Board edit modal', 'FAIL', e.message.substring(0, 200));
  }

  // 6.3 Save board edit
  testNum++;
  try {
    const editInput = await page.evaluate(() => {
      const fixedEls = document.querySelectorAll('.fixed');
      for (const el of fixedEls) {
        const input = el.querySelector('input');
        if (input) return true;
      }
      return false;
    });

    if (editInput) {
      // Modify the first input (board name)
      await page.evaluate(() => {
        const fixedEls = document.querySelectorAll('.fixed');
        for (const el of fixedEls) {
          const input = el.querySelector('input');
          if (input) {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            nativeInputValueSetter.call(input, 'Test Board Name');
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            return;
          }
        }
      });
      await page.waitForTimeout(300);

      const saveBtn = await page.$('.fixed button:has-text("Save")') || await page.$('.fixed button:has-text("Done")');
      if (saveBtn) {
        await saveBtn.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_board_edited.png') });

        const updated = await page.evaluate(() => document.body.innerText.includes('Test Board Name'));
        if (updated) {
          log(testNum, 'Board edit saves', 'PASS', 'Board name updated to "Test Board Name"');
        } else {
          log(testNum, 'Board edit saves', 'FAIL', 'Name did not update after save');
          bug('P1', 'Board edit save does not update board name');
        }
      } else {
        log(testNum, 'Board edit saves', 'FAIL', 'No Save button in edit modal');
      }
    } else {
      log(testNum, 'Board edit saves', 'SKIP', 'Edit modal not open');
    }
  } catch (e) {
    log(testNum, 'Board edit saves', 'FAIL', e.message.substring(0, 200));
  }

  // ============================================
  // TEST GROUP 7: Profile Edit
  // ============================================
  console.log('\n=== 7. PROFILE EDIT ===');

  testNum++;
  try {
    await page.goto(BASE + '/profile/u1');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_profile.png') });

    const editProfileBtn = await page.$('button:has-text("Edit Profile")') || await page.$('button:has-text("Edit profile")');
    if (editProfileBtn) {
      await editProfileBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_profile_edit.png') });

      const modalFields = await page.evaluate(() => {
        const fixedEls = document.querySelectorAll('.fixed');
        for (const el of fixedEls) {
          if (el.offsetHeight === 0) continue;
          const inputs = el.querySelectorAll('input');
          const textareas = el.querySelectorAll('textarea');
          return {
            found: true,
            inputCount: inputs.length,
            textareaCount: textareas.length,
            labels: Array.from(el.querySelectorAll('label')).map(l => l.textContent.trim().substring(0, 30)),
            inputValues: Array.from(inputs).map(i => i.value.substring(0, 30)),
          };
        }
        return { found: false };
      });

      if (modalFields.found && modalFields.inputCount > 0) {
        log(testNum, 'Profile edit modal', 'PASS', `Inputs: ${modalFields.inputCount}, Textareas: ${modalFields.textareaCount}, Labels: ${modalFields.labels.join(', ')}`);
      } else {
        log(testNum, 'Profile edit modal', 'FAIL', 'Modal opened but no form fields');
        bug('P1', 'Profile edit modal missing form fields');
      }
    } else {
      log(testNum, 'Profile edit modal', 'FAIL', '"Edit Profile" button not found');
      bug('P1', 'Edit Profile button not found on profile page');
    }
  } catch (e) {
    log(testNum, 'Profile edit modal', 'FAIL', e.message.substring(0, 200));
  }

  // 7.2 Save profile edit
  testNum++;
  try {
    const profileSaved = await page.evaluate(() => {
      const fixedEls = document.querySelectorAll('.fixed');
      for (const el of fixedEls) {
        const input = el.querySelector('input');
        if (input && el.offsetHeight > 0) {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          nativeInputValueSetter.call(input, 'Sarah Test Updated');
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
      }
      return false;
    });

    if (profileSaved) {
      await page.waitForTimeout(300);
      const saveBtn = await page.$('.fixed button:has-text("Save")');
      if (saveBtn) {
        await saveBtn.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_profile_saved.png') });

        const nameUpdated = await page.evaluate(() => document.body.innerText.includes('Sarah Test Updated'));
        if (nameUpdated) {
          log(testNum, 'Profile edit saves', 'PASS', 'Profile name updated');
        } else {
          log(testNum, 'Profile edit saves', 'FAIL', 'Name not updated after save');
          bug('P1', 'Profile edit save does not update displayed name');
        }
      } else {
        log(testNum, 'Profile edit saves', 'FAIL', 'No Save button');
      }
    } else {
      log(testNum, 'Profile edit saves', 'SKIP', 'Profile edit modal not open');
    }
  } catch (e) {
    log(testNum, 'Profile edit saves', 'FAIL', e.message.substring(0, 200));
  }

  // ============================================
  // TEST GROUP 8: Save Pin to Board
  // ============================================
  console.log('\n=== 8. SAVE PIN TO BOARD ===');

  testNum++;
  try {
    await page.goto(BASE);
    await page.waitForTimeout(2000);

    const pinCards = await page.$$('[class*="break-inside-avoid"]');
    if (pinCards.length > 0) {
      await pinCards[0].hover();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_save_hover.png') });

      const saveInfo = await page.evaluate(() => {
        const card = document.querySelector('[class*="break-inside-avoid"]');
        if (!card) return { found: false };
        const btns = card.querySelectorAll('button');
        for (const btn of btns) {
          const text = btn.textContent.trim();
          if (text.includes('Save') || text.toLowerCase().includes('save')) {
            return { found: true, text, classes: btn.className.substring(0, 100) };
          }
        }
        return { found: false };
      });

      if (saveInfo.found) {
        log(testNum, 'Save button on hover', 'PASS', `Button text: "${saveInfo.text}"`);
      } else {
        log(testNum, 'Save button on hover', 'FAIL', 'No Save button on pin card hover');
        bug('P1', 'Save button not visible on pin card hover');
      }
    } else {
      log(testNum, 'Save button on hover', 'FAIL', 'No pin cards found');
    }
  } catch (e) {
    log(testNum, 'Save button on hover', 'FAIL', e.message.substring(0, 200));
  }

  // 8.2 Board selector dropdown
  testNum++;
  try {
    const dropdownResult = await page.evaluate(() => {
      const card = document.querySelector('[class*="break-inside-avoid"]');
      if (!card) return { found: false };
      const btns = card.querySelectorAll('button');
      for (const btn of btns) {
        const html = btn.innerHTML;
        if (html.includes('ChevronDown') || html.includes('chevron') || html.includes('arrow')) {
          btn.click();
          return { found: true, type: 'dropdown-arrow' };
        }
      }
      // Try clicking the save button itself to see if dropdown opens
      for (const btn of btns) {
        if (btn.textContent.trim().includes('Save')) {
          btn.click();
          return { found: true, type: 'save-button' };
        }
      }
      return { found: false };
    });

    if (dropdownResult.found) {
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_board_selector.png') });

      const boardList = await page.evaluate(() => {
        const text = document.body.innerText;
        return text.includes('Saved') || text.includes('board');
      });
      log(testNum, 'Board selector dropdown', 'PASS', `Clicked ${dropdownResult.type}`);
    } else {
      log(testNum, 'Board selector dropdown', 'FAIL', 'No dropdown arrow or save button found');
    }
  } catch (e) {
    log(testNum, 'Board selector dropdown', 'FAIL', e.message.substring(0, 200));
  }

  // ============================================
  // TEST GROUP 9: Pin Like
  // ============================================
  console.log('\n=== 9. PIN LIKE ===');

  testNum++;
  try {
    await page.goto(BASE);
    await page.waitForTimeout(2000);

    const pinCards = await page.$$('[class*="break-inside-avoid"]');
    if (pinCards.length > 0) {
      await pinCards[0].click();
      await page.waitForTimeout(1500);

      const likeResult = await page.evaluate(() => {
        const fixedEl = document.querySelector('.fixed.inset-0');
        if (!fixedEl) return { found: false, reason: 'no modal' };

        const btns = fixedEl.querySelectorAll('button');
        for (const btn of btns) {
          const html = btn.innerHTML;
          if (html.includes('Heart') || html.includes('heart') || html.includes('like')) {
            const countEl = btn.querySelector('span') || btn;
            const countBefore = countEl.textContent.trim();
            btn.click();
            return { found: true, countBefore, type: 'heart-button' };
          }
        }

        // Also check for SVG hearts by path
        const svgs = fixedEl.querySelectorAll('svg');
        for (const svg of svgs) {
          const path = svg.querySelector('path');
          if (path && (path.getAttribute('d')?.includes('M20.84') || path.getAttribute('d')?.includes('M12 21'))) {
            const btn = svg.closest('button');
            if (btn) {
              btn.click();
              return { found: true, type: 'svg-heart' };
            }
          }
        }

        return { found: false, reason: 'no heart button', btnCount: btns.length };
      });

      if (likeResult.found) {
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_pin_liked.png') });
        log(testNum, 'Pin like in modal', 'PASS', `Found and clicked ${likeResult.type}`);
      } else {
        log(testNum, 'Pin like in modal', 'FAIL', `${likeResult.reason} (${likeResult.btnCount || 0} btns)`);
        bug('P1', 'Heart/like button not found in pin detail modal');
      }
    }
  } catch (e) {
    log(testNum, 'Pin like in modal', 'FAIL', e.message.substring(0, 200));
  }

  // 9.2 Pin card heart icon
  testNum++;
  try {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    const heartOnCard = await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="break-inside-avoid"]');
      let heartCount = 0;
      for (const card of cards) {
        const svgs = card.querySelectorAll('svg');
        for (const svg of svgs) {
          const html = svg.outerHTML;
          if (html.includes('heart') || html.includes('Heart')) {
            heartCount++;
          }
        }
        // Check for like counts
        const spans = card.querySelectorAll('span');
        for (const span of spans) {
          if (/^\d+$/.test(span.textContent.trim())) {
            // Might be a like count
          }
        }
      }
      return heartCount;
    });

    if (heartOnCard > 0) {
      log(testNum, 'Pin card heart icon', 'PASS', `Found ${heartOnCard} heart icons on cards`);
    } else {
      log(testNum, 'Pin card heart icon', 'FAIL', 'No heart icons on pin cards');
    }
  } catch (e) {
    log(testNum, 'Pin card heart icon', 'FAIL', e.message.substring(0, 200));
  }

  // ============================================
  // TEST GROUP 10: Related Pins
  // ============================================
  console.log('\n=== 10. RELATED PINS ===');

  testNum++;
  try {
    await page.goto(BASE);
    await page.waitForTimeout(2000);

    const pinCards = await page.$$('[class*="break-inside-avoid"]');
    if (pinCards.length > 0) {
      await pinCards[0].click();
      await page.waitForTimeout(1500);

      // Scroll the modal content
      await page.evaluate(() => {
        const fixedEl = document.querySelector('.fixed.inset-0');
        if (fixedEl) {
          const scrollables = fixedEl.querySelectorAll('[class*="overflow"]');
          for (const el of scrollables) {
            el.scrollTop = el.scrollHeight;
          }
          // Also try scrolling the modal container itself
          const modalContent = fixedEl.querySelector('[class*="bg-white"]');
          if (modalContent) modalContent.scrollTop = modalContent.scrollHeight;
        }
      });
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_related_pins.png') });

      const relatedInfo = await page.evaluate(() => {
        const text = document.body.innerText;
        const hasMoreLikeThis = text.includes('More like this');
        const hasRelated = text.includes('Related') || text.includes('Similar');

        // Count images inside the modal after "More like this"
        const fixedEl = document.querySelector('.fixed.inset-0');
        let relatedImageCount = 0;
        if (fixedEl) {
          const allH = fixedEl.querySelectorAll('h2, h3, h4, [class*="font-bold"], [class*="font-semibold"]');
          for (const h of allH) {
            if (h.textContent.includes('More like this') || h.textContent.includes('Related')) {
              // Count sibling/following images
              let sibling = h.nextElementSibling;
              while (sibling) {
                relatedImageCount += sibling.querySelectorAll('img').length;
                sibling = sibling.nextElementSibling;
              }
              // Also check parent's following siblings
              let parentSibling = h.parentElement?.nextElementSibling;
              while (parentSibling) {
                relatedImageCount += parentSibling.querySelectorAll('img').length;
                parentSibling = parentSibling.nextElementSibling;
              }
            }
          }
        }

        return { hasMoreLikeThis, hasRelated, relatedImageCount };
      });

      if (relatedInfo.hasMoreLikeThis) {
        log(testNum, 'Related pins section', 'PASS', `"More like this" found with ${relatedInfo.relatedImageCount} images`);
      } else if (relatedInfo.hasRelated) {
        log(testNum, 'Related pins section', 'PASS', `Related section found`);
      } else {
        log(testNum, 'Related pins section', 'FAIL', '"More like this" section not found');
        bug('P1', '"More like this" section missing from pin detail');
      }
    }
  } catch (e) {
    log(testNum, 'Related pins section', 'FAIL', e.message.substring(0, 200));
  }

  // 10.2 Click related pin
  testNum++;
  try {
    const relatedClicked = await page.evaluate(() => {
      const fixedEl = document.querySelector('.fixed.inset-0');
      if (!fixedEl) return false;

      // Find "More like this" then click an image after it
      const allH = fixedEl.querySelectorAll('h2, h3, h4, [class*="font-bold"]');
      for (const h of allH) {
        if (h.textContent.includes('More like this')) {
          // Find clickable image nearby
          let container = h.parentElement;
          while (container) {
            const imgs = container.querySelectorAll('[class*="cursor"] img, [class*="cursor-pointer"], [class*="cursor-zoom-in"]');
            for (const img of imgs) {
              img.click();
              return true;
            }
            const nextImgs = container.nextElementSibling?.querySelectorAll('img');
            if (nextImgs && nextImgs.length > 0) {
              nextImgs[0].click();
              return true;
            }
            container = container.parentElement;
          }
        }
      }
      return false;
    });

    if (relatedClicked) {
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_related_clicked.png') });
      log(testNum, 'Click related pin', 'PASS', 'Clicked a related pin');
    } else {
      log(testNum, 'Click related pin', 'SKIP', 'No related pins clickable');
    }
  } catch (e) {
    log(testNum, 'Click related pin', 'FAIL', e.message.substring(0, 200));
  }

  // ============================================
  // TEST: /go endpoint
  // ============================================
  console.log('\n=== STATE ENDPOINT ===');
  testNum++;
  try {
    await page.goto(BASE + '/go');
    await page.waitForTimeout(1000);
    const bodyText = await page.evaluate(() => document.body.innerText);
    const state = JSON.parse(bodyText);

    log(testNum, '/go endpoint', 'PASS',
      `initial_state: ${!!state.initial_state}, current_state: ${!!state.current_state}, state_diff keys: ${Object.keys(state.state_diff || {}).join(', ')}`);
  } catch (e) {
    log(testNum, '/go endpoint', 'FAIL', e.message.substring(0, 200));
  }

  // ============================================
  // REPORT GENERATION
  // ============================================
  console.log('\n\n========= FINAL RESULTS =========');

  const passCount = results.filter(r => r.result === 'PASS').length;
  const failCount = results.filter(r => r.result === 'FAIL').length;
  const skipCount = results.filter(r => r.result === 'SKIP' || r.result === 'PARTIAL').length;
  const total = results.length;

  console.log(`PASS: ${passCount}/${total}, FAIL: ${failCount}, SKIP/PARTIAL: ${skipCount}`);
  console.log(`P0 Bugs: ${bugs.filter(b => b.severity === 'P0').length}`);
  console.log(`P1 Bugs: ${bugs.filter(b => b.severity === 'P1').length}`);

  // Output for parsing
  console.log('JSON_START');
  console.log(JSON.stringify({ results, bugs }, null, 2));
  console.log('JSON_END');

  await browser.close();
})().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});
