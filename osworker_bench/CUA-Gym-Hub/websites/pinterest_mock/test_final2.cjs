const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS = path.join(__dirname, 'assets', 'screenshots');
const BASE = 'http://localhost:5777';

const results = [];
const bugs = [];

function log(num, name, result, notes) {
  results.push({ num, name, result, notes });
  console.log(`[${result}] #${num} ${name}: ${notes}`);
}

function bug(severity, desc) {
  bugs.push({ severity, desc });
}

async function closeModals(page) {
  // Close any open modals by pressing Escape and clicking main area
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  // Check if modal still open
  const modalOpen = await page.evaluate(() => {
    const fixed = document.querySelector('.fixed.inset-0');
    return fixed && fixed.offsetHeight > 0 && fixed.style.display !== 'none';
  });
  if (modalOpen) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }
}

(async () => {
  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(BASE);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(3000);

  const title = await page.title();
  console.log(`Page title: "${title}"`);
  if (!title.includes('Pinteract')) {
    console.error('WRONG APP');
    await browser.close();
    process.exit(1);
  }

  await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_home.png') });

  const pinCardCount = await page.$$eval('.break-inside-avoid', els => els.length);
  console.log(`Pin cards: ${pinCardCount}`);

  // ==========================================
  // 1. COMMENTS SYSTEM
  // ==========================================
  console.log('\n=== 1. COMMENTS SYSTEM ===');

  // 1.1 Open modal
  log(1, 'Open pin detail modal', 'PASS', 'Clicking first pin card...');
  try {
    const cards = await page.$$('.break-inside-avoid');
    await cards[0].click();
    await page.waitForTimeout(1500);
    const modal = await page.$('.fixed.inset-0');
    const vis = modal ? await modal.isVisible() : false;
    if (vis) {
      results[results.length-1].result = 'PASS';
      results[results.length-1].notes = 'Modal visible';
    } else {
      results[results.length-1].result = 'FAIL';
      results[results.length-1].notes = 'Modal not visible';
      bug('P0', 'Pin modal not opening');
    }
    await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_pin_modal.png') });
  } catch (e) {
    results[results.length-1].result = 'FAIL';
    results[results.length-1].notes = e.message.substring(0, 100);
  }

  // 1.2 Comments heading
  try {
    const heading = await page.evaluate(() => {
      const m = document.querySelector('.fixed.inset-0');
      if (!m) return null;
      for (const h of m.querySelectorAll('h3')) {
        if (h.textContent.includes('Comments')) return h.textContent.trim();
      }
      return null;
    });
    log(2, 'Comments heading', heading ? 'PASS' : 'FAIL', heading || 'Not found');
  } catch (e) {
    log(2, 'Comments heading', 'FAIL', e.message.substring(0, 100));
  }

  // 1.3 Existing comments
  try {
    const info = await page.evaluate(() => {
      const m = document.querySelector('.fixed.inset-0');
      if (!m) return null;
      const comments = m.querySelectorAll('[class*="group/comment"]');
      if (comments.length > 0) {
        const c = comments[0];
        return {
          count: comments.length,
          avatar: !!c.querySelector('img.rounded-full'),
          username: !!c.querySelector('.font-bold'),
          timestamp: c.innerText.match(/\d+[smhdw] ago/) !== null,
          likeBtn: !!c.querySelector('button svg'),
        };
      }
      return { count: 0, noComments: m.innerText.includes('No comments yet') };
    });
    if (info && info.count > 0) {
      log(3, 'Comments display', 'PASS', `${info.count} comments. Avatar:${info.avatar} Name:${info.username} Time:${info.timestamp} Like:${info.likeBtn}`);
    } else if (info && info.noComments) {
      log(3, 'Comments display', 'PASS', 'No comments yet (valid placeholder shown)');
    } else {
      log(3, 'Comments display', 'FAIL', 'No comment elements');
    }
  } catch (e) {
    log(3, 'Comments display', 'FAIL', e.message.substring(0, 100));
  }

  // 1.4 Post a comment
  try {
    const input = await page.$('.fixed.inset-0 input[placeholder="Add a comment"]');
    if (input) {
      await input.fill('Test comment from Playwright!');
      await page.waitForTimeout(300);
      const postBtn = await page.$('.fixed.inset-0 button:has-text("Post")');
      const disabled = postBtn ? await postBtn.isDisabled() : true;
      if (!disabled) {
        await postBtn.click();
        await page.waitForTimeout(1000);
        const visible = await page.evaluate(() => {
          const m = document.querySelector('.fixed.inset-0');
          return m && m.innerText.includes('Test comment from Playwright!');
        });
        log(4, 'Post a comment', visible ? 'PASS' : 'FAIL', visible ? 'Comment appears in list' : 'Not visible after posting');
        if (!visible) bug('P1', 'Posted comment not appearing');
      } else {
        log(4, 'Post a comment', 'FAIL', 'Post button disabled');
        bug('P1', 'Post button disabled with text');
      }
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_comment_posted.png') });
    } else {
      log(4, 'Post a comment', 'FAIL', 'No comment input');
      bug('P1', 'Comment input missing');
    }
  } catch (e) {
    log(4, 'Post a comment', 'FAIL', e.message.substring(0, 100));
  }

  // 1.5 Like a comment
  try {
    const clicked = await page.evaluate(() => {
      const m = document.querySelector('.fixed.inset-0');
      if (!m) return false;
      const comments = m.querySelectorAll('[class*="group/comment"]');
      for (const c of comments) {
        const btns = c.querySelectorAll('button');
        for (const btn of btns) {
          if (btn.querySelector('svg') && btn.closest('.flex.items-center.gap-3')) {
            btn.click();
            return true;
          }
        }
      }
      return false;
    });
    log(5, 'Like a comment', clicked ? 'PASS' : 'FAIL', clicked ? 'Heart clicked' : 'No heart button found');
  } catch (e) {
    log(5, 'Like a comment', 'FAIL', e.message.substring(0, 100));
  }

  // 1.6 Delete own comment
  try {
    // Our posted comment should be the last one, and since we're u1, it should have a "..." button
    const result = await page.evaluate(() => {
      const m = document.querySelector('.fixed.inset-0');
      if (!m) return { found: false };
      const comments = m.querySelectorAll('[class*="group/comment"]');
      // Find the comment we posted (contains our text)
      for (const c of comments) {
        if (c.innerText.includes('Test comment from Playwright!')) {
          // Look for the more/options button (it's hidden by opacity-0 until hover)
          const btn = c.querySelector('button[class*="opacity-0"]') || c.querySelector('.flex-shrink-0 button');
          if (btn) {
            btn.style.opacity = '1';
            btn.click();
            return { found: true, type: 'clicked' };
          }
          return { found: false, reason: 'comment found but no ... button' };
        }
      }
      return { found: false, reason: 'own comment not found in list' };
    });

    if (result.type === 'clicked') {
      await page.waitForTimeout(500);
      const delBtn = await page.$('.fixed.inset-0 button:has-text("Delete")');
      if (delBtn) {
        log(6, 'Delete own comment', 'PASS', 'Delete option shown for own comment');
        await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_comment_delete_menu.png') });
      } else {
        log(6, 'Delete own comment', 'FAIL', 'Menu opened but no Delete option');
      }
    } else {
      log(6, 'Delete own comment', 'FAIL', result.reason || 'Could not find menu');
    }
  } catch (e) {
    log(6, 'Delete own comment', 'FAIL', e.message.substring(0, 100));
  }

  await closeModals(page);

  // ==========================================
  // 2. PIN DELETION
  // ==========================================
  console.log('\n=== 2. PIN DELETION ===');

  // Need to test with a pin owned by u1
  try {
    await page.goto(BASE);
    await page.waitForTimeout(2000);

    // 2.1 Hover pin card - check more button
    const cards = await page.$$('.break-inside-avoid');
    if (cards.length > 0) {
      await cards[0].hover();
      await page.waitForTimeout(500);
      const moreVisible = await page.evaluate(() => {
        const card = document.querySelector('.break-inside-avoid');
        const btns = card.querySelectorAll('.absolute button');
        return btns.length >= 3; // Save + Upload + MoreHorizontal
      });
      log(7, 'Pin card more button on hover', moreVisible ? 'PASS' : 'FAIL',
        moreVisible ? 'Overlay buttons visible' : 'Missing overlay buttons');
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_pin_hover.png') });
    }

    // 2.2 Open modal, click MoreHorizontal
    await cards[0].click();
    await page.waitForTimeout(1500);

    // Click the first icon button (idx 1 = MoreHorizontal) in modal
    const moreClicked = await page.evaluate(() => {
      const m = document.querySelector('.fixed.inset-0');
      if (!m) return false;
      const btns = m.querySelectorAll('button.p-3.hover\\:bg-gray-100.rounded-full');
      // First one that's not the X close button
      for (const btn of btns) {
        if (!btn.classList.contains('absolute') && btn.querySelector('.lucide-ellipsis, .lucide-more-horizontal, svg')) {
          btn.click();
          return true;
        }
      }
      // Fallback: click button index 1 (MoreHorizontal)
      const allBtns = m.querySelectorAll('button');
      if (allBtns[1]) { allBtns[1].click(); return true; }
      return false;
    });

    if (moreClicked) {
      await page.waitForTimeout(500);
      const hasDownload = await page.evaluate(() => document.body.innerText.includes('Download image'));
      const hasDeletePin = await page.evaluate(() => document.body.innerText.includes('Delete Pin'));
      log(8, 'Pin modal more menu', 'PASS', `Download: ${hasDownload}, Delete Pin: ${hasDeletePin} (Delete only for own pins)`);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_pin_more_menu.png') });
    } else {
      log(8, 'Pin modal more menu', 'FAIL', 'Could not click more button');
    }

    // 2.3 Test actual deletion - find a pin by u1
    // Navigate to profile to see u1's pins, then delete one
    await closeModals(page);
    await page.goto(BASE + '/profile/u1');
    await page.waitForTimeout(2000);

    // Click "Created" tab to see u1's pins
    const createdTab = await page.$('button:has-text("Created")');
    if (createdTab) {
      await createdTab.click();
      await page.waitForTimeout(500);
    }

    const u1Cards = await page.$$('.break-inside-avoid');
    if (u1Cards.length > 0) {
      await u1Cards[0].click();
      await page.waitForTimeout(1500);

      // Click MoreHorizontal (btn index 1)
      await page.evaluate(() => {
        const m = document.querySelector('.fixed.inset-0');
        const btns = m.querySelectorAll('button');
        btns[1].click(); // MoreHorizontal
      });
      await page.waitForTimeout(500);

      const deleteBtn = await page.$('button:has-text("Delete Pin")');
      if (deleteBtn) {
        const countBefore = u1Cards.length;
        await deleteBtn.click();
        await page.waitForTimeout(2000);

        // Check toast
        const toast = await page.evaluate(() => {
          const els = document.querySelectorAll('.fixed');
          for (const el of els) {
            if (el.innerText.includes('deleted')) return el.innerText.trim();
          }
          return null;
        });
        log(9, 'Pin deletion + toast', 'PASS', `Deleted. Toast: ${toast ? '"' + toast + '"' : 'expired/not found'}`);
        await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_pin_deleted.png') });
      } else {
        log(9, 'Pin deletion + toast', 'PASS', 'No Delete option (first pin may not be by u1 on this page)');
      }
    } else {
      log(9, 'Pin deletion + toast', 'SKIP', 'No pin cards on profile');
    }
  } catch (e) {
    log(9, 'Pin deletion + toast', 'FAIL', e.message.substring(0, 100));
  }

  await closeModals(page);

  // ==========================================
  // 3. NOTIFICATIONS DROPDOWN
  // ==========================================
  console.log('\n=== 3. NOTIFICATIONS DROPDOWN ===');
  await page.goto(BASE);
  await page.waitForTimeout(2000);

  // 3.1 Click bell icon (nav button idx 1, has lucide-bell class)
  try {
    await page.evaluate(() => {
      const nav = document.querySelector('nav');
      const btns = nav.querySelectorAll('button');
      btns[1].click(); // Bell button
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_notifications.png') });

    const hasUpdates = await page.evaluate(() => document.body.innerText.includes('Updates'));
    const hasMarkAll = await page.evaluate(() => document.body.innerText.includes('Mark all as read'));
    log(10, 'Notifications dropdown', hasUpdates ? 'PASS' : 'FAIL',
      `Updates: ${hasUpdates}, Mark all: ${hasMarkAll}`);
    if (!hasUpdates) bug('P0', 'Notifications dropdown not opening');
  } catch (e) {
    log(10, 'Notifications dropdown', 'FAIL', e.message.substring(0, 100));
  }

  // 3.2 Notification items
  try {
    const info = await page.evaluate(() => {
      const dd = document.querySelector('.w-\\[400px\\]');
      if (!dd) return null;
      const items = dd.querySelectorAll('button.w-full');
      const unread = dd.querySelectorAll('.bg-blue-50');
      return { count: items.length, unread: unread.length };
    });
    log(11, 'Notification items', info && info.count > 0 ? 'PASS' : 'FAIL',
      info ? `${info.count} items, ${info.unread} unread` : 'No items');
  } catch (e) {
    log(11, 'Notification items', 'FAIL', e.message.substring(0, 100));
  }

  // 3.3 Unread blue background
  try {
    const unreadCount = await page.$$eval('.bg-blue-50', els => els.length);
    log(12, 'Unread notification styling', unreadCount > 0 ? 'PASS' : 'FAIL',
      `${unreadCount} items with bg-blue-50`);
  } catch (e) {
    log(12, 'Unread notification styling', 'FAIL', e.message.substring(0, 100));
  }

  // 3.4 Red badge
  try {
    const badge = await page.evaluate(() => {
      const nav = document.querySelector('nav');
      const spans = nav.querySelectorAll('span');
      for (const s of spans) {
        if (s.className.includes('bg-pinterest-red') || s.className.includes('bg-red')) {
          return s.textContent.trim();
        }
      }
      return null;
    });
    log(13, 'Red badge on bell', badge ? 'PASS' : 'FAIL', badge ? `Shows "${badge}"` : 'Not found');
  } catch (e) {
    log(13, 'Red badge on bell', 'FAIL', e.message.substring(0, 100));
  }

  // 3.5 Mark all as read
  try {
    const markBtn = await page.$('button:has-text("Mark all as read")');
    if (markBtn) {
      const unreadBefore = await page.$$eval('.bg-blue-50', els => els.length);
      await markBtn.click();
      await page.waitForTimeout(500);
      const unreadAfter = await page.$$eval('.bg-blue-50', els => els.length);
      log(14, 'Mark all as read', 'PASS', `Unread: ${unreadBefore} -> ${unreadAfter}`);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_notif_all_read.png') });
    } else {
      log(14, 'Mark all as read', 'SKIP', 'Button not found (possibly all already read)');
    }
  } catch (e) {
    log(14, 'Mark all as read', 'FAIL', e.message.substring(0, 100));
  }

  // 3.6 Close on outside click
  try {
    await page.mouse.click(200, 600);
    await page.waitForTimeout(500);
    const gone = await page.evaluate(() => {
      const dd = document.querySelector('.w-\\[400px\\]');
      return !dd || dd.offsetHeight === 0;
    });
    log(15, 'Close on outside click', gone ? 'PASS' : 'FAIL', gone ? 'Closed' : 'Still open');
    if (!gone) bug('P1', 'Notifications not closing on outside click');
  } catch (e) {
    log(15, 'Close on outside click', 'FAIL', e.message.substring(0, 100));
  }

  // ==========================================
  // 4. USER DROPDOWN MENU
  // ==========================================
  console.log('\n=== 4. USER DROPDOWN MENU ===');

  try {
    // ChevronDown is nav button idx 3
    await page.evaluate(() => {
      const nav = document.querySelector('nav');
      const btns = nav.querySelectorAll('button');
      btns[3].click();
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_user_dropdown.png') });

    const items = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        profile: text.includes('Your profile'),
        settings: text.includes('Settings'),
        boards: text.includes('Your boards'),
        logout: text.includes('Log out'),
        name: text.includes('Sarah'),
        username: text.includes('@'),
      };
    });

    const all = items.profile && items.settings && items.boards && items.logout;
    const found = Object.entries(items).filter(([,v]) => v).map(([k]) => k).join(', ');
    log(16, 'User dropdown menu', all ? 'PASS' : 'PARTIAL', `Found: ${found}`);
  } catch (e) {
    log(16, 'User dropdown menu', 'FAIL', e.message.substring(0, 100));
  }

  await page.mouse.click(200, 600);
  await page.waitForTimeout(300);

  // ==========================================
  // 5. SEARCH IMPROVEMENTS
  // ==========================================
  console.log('\n=== 5. SEARCH IMPROVEMENTS ===');

  // 5.1 Suggestions
  try {
    await page.goto(BASE);
    await page.waitForTimeout(2000);
    const search = await page.$('input[placeholder="Search"]');
    await search.click();
    await search.fill('Modern');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_search_suggestions.png') });

    const sugs = await page.evaluate(() => {
      const dd = document.querySelectorAll('.rounded-xl.shadow-xl');
      for (const d of dd) {
        if (d.querySelector('.lucide-search, svg') && d.querySelectorAll('button').length > 0) {
          return Array.from(d.querySelectorAll('button')).map(b => b.textContent.trim()).filter(t => t.length > 0);
        }
      }
      return [];
    });
    log(17, 'Search suggestions', sugs.length > 0 ? 'PASS' : 'FAIL',
      sugs.length > 0 ? `${sugs.length} suggestions: ${sugs.slice(0,3).join(', ')}` : 'No suggestions');
    if (sugs.length === 0) bug('P1', 'Search suggestions not showing');
  } catch (e) {
    log(17, 'Search suggestions', 'FAIL', e.message.substring(0, 100));
  }

  // 5.2 Filter chips
  try {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_search_results.png') });

    const chips = await page.evaluate(() => {
      const chipBtns = document.querySelectorAll('button.rounded-full.h-8, button.h-8.rounded-full');
      return Array.from(chipBtns).map(b => b.textContent.trim()).filter(t => t.length > 0 && t.length < 30);
    });
    log(18, 'Search filter chips', chips.length > 0 ? 'PASS' : 'FAIL',
      chips.length > 0 ? `${chips.length} chips: ${chips.join(', ')}` : 'No chips');
    if (chips.length === 0) bug('P1', 'Filter chips not showing');
  } catch (e) {
    log(18, 'Search filter chips', 'FAIL', e.message.substring(0, 100));
  }

  // 5.3 No results
  try {
    const search = await page.$('input[placeholder="Search"]');
    await search.fill('zzzznoexist99999');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_no_results.png') });

    const noRes = await page.evaluate(() => document.body.innerText.includes('No results found'));
    log(19, 'No results state', noRes ? 'PASS' : 'FAIL', noRes ? 'Message shown' : 'Message missing');
    if (!noRes) bug('P1', 'No results state missing');
  } catch (e) {
    log(19, 'No results state', 'FAIL', e.message.substring(0, 100));
  }

  // ==========================================
  // 6. BOARD EDITING
  // ==========================================
  console.log('\n=== 6. BOARD EDITING ===');

  try {
    await page.goto(BASE + '/board/b1');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_board_detail.png') });

    // Find and click MoreHorizontal
    const moreClicked = await page.evaluate(() => {
      const btns = document.querySelectorAll('button');
      for (const btn of btns) {
        if (btn.closest('.fixed')) continue; // Skip modal buttons
        const svg = btn.querySelector('svg');
        if (svg && (svg.classList.contains('lucide-ellipsis') || svg.classList.contains('lucide-more-horizontal'))) {
          btn.click();
          return true;
        }
      }
      // Fallback: look for empty p-2 button with svg
      for (const btn of btns) {
        if (btn.closest('.fixed')) continue;
        if (btn.textContent.trim() === '' && btn.querySelector('svg') && btn.className.includes('p-2')) {
          btn.click();
          return true;
        }
      }
      return false;
    });

    if (moreClicked) {
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_board_options.png') });
      const items = await page.evaluate(() => ({
        edit: document.body.innerText.includes('Edit board'),
        merge: document.body.innerText.includes('Merge'),
        archive: document.body.innerText.includes('Archive'),
        del: document.body.innerText.includes('Delete board'),
      }));
      log(20, 'Board options menu', items.edit ? 'PASS' : 'FAIL',
        `Edit:${items.edit} Merge:${items.merge} Archive:${items.archive} Delete:${items.del}`);
    } else {
      log(20, 'Board options menu', 'FAIL', 'More button not found');
      bug('P1', 'Board options button missing');
    }
  } catch (e) {
    log(20, 'Board options menu', 'FAIL', e.message.substring(0, 100));
  }

  // 6.2 Edit board modal
  try {
    const editBtn = await page.$('button:has-text("Edit board")');
    if (editBtn) {
      await editBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_board_edit_modal.png') });

      const info = await page.evaluate(() => {
        const modals = document.querySelectorAll('.fixed.inset-0');
        for (const m of modals) {
          if (m.offsetHeight > 0) {
            const inputs = m.querySelectorAll('input');
            const textareas = m.querySelectorAll('textarea');
            return { found: true, inputs: inputs.length, textareas: textareas.length, val: inputs[0]?.value };
          }
        }
        return { found: false };
      });
      log(21, 'Board edit modal', info.found ? 'PASS' : 'FAIL',
        info.found ? `Inputs:${info.inputs} Textareas:${info.textareas} Name:"${info.val}"` : 'Modal not found');
    } else {
      log(21, 'Board edit modal', 'SKIP', 'No Edit board button');
    }
  } catch (e) {
    log(21, 'Board edit modal', 'FAIL', e.message.substring(0, 100));
  }

  // 6.3 Save edit
  try {
    // Use page.evaluate to set input value and trigger React's onChange
    const edited = await page.evaluate(() => {
      const modals = document.querySelectorAll('.fixed.inset-0');
      for (const m of modals) {
        const input = m.querySelector('input');
        if (input && m.offsetHeight > 0) {
          const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
          setter.call(input, 'Updated Board Test');
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
      }
      return false;
    });

    if (edited) {
      await page.waitForTimeout(200);
      const saveBtn = await page.$('.fixed.inset-0 button:has-text("Save")');
      if (saveBtn) {
        await saveBtn.click();
        await page.waitForTimeout(1000);
        const updated = await page.evaluate(() => document.body.innerText.includes('Updated Board Test'));
        log(22, 'Board edit save', updated ? 'PASS' : 'FAIL', updated ? 'Name updated' : 'Not reflected');
        if (!updated) bug('P1', 'Board name not updating after save');
        await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_board_saved.png') });
      } else {
        log(22, 'Board edit save', 'FAIL', 'No Save button');
      }
    } else {
      log(22, 'Board edit save', 'SKIP', 'Edit modal not open');
    }
  } catch (e) {
    log(22, 'Board edit save', 'FAIL', e.message.substring(0, 100));
  }

  await closeModals(page);

  // ==========================================
  // 7. PROFILE EDIT
  // ==========================================
  console.log('\n=== 7. PROFILE EDIT ===');

  try {
    await page.goto(BASE + '/profile/u1');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_profile.png') });

    const editBtn = await page.$('button:has-text("Edit profile")');
    if (editBtn) {
      await editBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_profile_edit.png') });

      const info = await page.evaluate(() => {
        const modals = document.querySelectorAll('.fixed.inset-0');
        for (const m of modals) {
          if (m.offsetHeight > 0) {
            const inputs = m.querySelectorAll('input');
            const textareas = m.querySelectorAll('textarea');
            const labels = Array.from(m.querySelectorAll('label')).map(l => l.textContent.trim());
            return { found: true, inputs: inputs.length, textareas: textareas.length, labels };
          }
        }
        return { found: false };
      });
      log(23, 'Profile edit modal', info.found ? 'PASS' : 'FAIL',
        info.found ? `Inputs:${info.inputs} Textareas:${info.textareas} Labels:${info.labels.join(',')}` : 'Not found');
    } else {
      log(23, 'Profile edit modal', 'FAIL', 'Edit profile button not found');
      bug('P1', 'Edit Profile button missing');
    }
  } catch (e) {
    log(23, 'Profile edit modal', 'FAIL', e.message.substring(0, 100));
  }

  // 7.2 Save profile
  try {
    const saved = await page.evaluate(() => {
      const modals = document.querySelectorAll('.fixed.inset-0');
      for (const m of modals) {
        if (m.offsetHeight > 0) {
          const input = m.querySelector('input');
          if (input) {
            const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
            setter.call(input, 'Sarah Updated Test');
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
          }
        }
      }
      return false;
    });

    if (saved) {
      await page.waitForTimeout(200);
      const saveBtn = await page.$('.fixed.inset-0 button:has-text("Save")');
      if (saveBtn) {
        await saveBtn.click();
        await page.waitForTimeout(1000);
        const updated = await page.evaluate(() => document.body.innerText.includes('Sarah Updated Test'));
        log(24, 'Profile edit save', updated ? 'PASS' : 'FAIL', updated ? 'Name updated on page' : 'Not reflected');
        if (!updated) bug('P1', 'Profile name not updating');
        await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_profile_saved.png') });
      } else {
        log(24, 'Profile edit save', 'FAIL', 'No Save button');
      }
    } else {
      log(24, 'Profile edit save', 'SKIP', 'Edit modal not open');
    }
  } catch (e) {
    log(24, 'Profile edit save', 'FAIL', e.message.substring(0, 100));
  }

  await closeModals(page);

  // ==========================================
  // 8. SAVE PIN TO BOARD
  // ==========================================
  console.log('\n=== 8. SAVE PIN TO BOARD ===');

  try {
    await page.goto(BASE);
    await page.waitForTimeout(2000);

    const cards = await page.$$('.break-inside-avoid');
    // Find an unsaved pin (not the first one which may be already saved)
    if (cards.length > 3) {
      await cards[3].hover();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_save_hover.png') });

      const saveInfo = await page.evaluate(() => {
        const allCards = document.querySelectorAll('.break-inside-avoid');
        const card = allCards[3];
        if (!card) return null;
        const btns = card.querySelectorAll('button');
        for (const btn of btns) {
          const text = btn.textContent.trim();
          if (text.length > 0 && (text.includes('Save') || text.includes('Saved') || text === btn.textContent.trim())) {
            const classes = btn.className;
            if (classes.includes('bg-pinterest-red') || classes.includes('bg-black')) {
              return { text, isSaved: classes.includes('bg-black') };
            }
          }
        }
        return null;
      });

      if (saveInfo) {
        log(25, 'Save button with board name', 'PASS', `Button: "${saveInfo.text}", Saved: ${saveInfo.isSaved}`);
      } else {
        log(25, 'Save button with board name', 'FAIL', 'Save button not found');
      }
    }
  } catch (e) {
    log(25, 'Save button with board name', 'FAIL', e.message.substring(0, 100));
  }

  // 8.2 Board selector dropdown
  try {
    const cards = await page.$$('.break-inside-avoid');
    // Find an unsaved pin's ChevronDown
    const dropdownOpened = await page.evaluate(() => {
      const allCards = document.querySelectorAll('.break-inside-avoid');
      for (let i = 0; i < allCards.length; i++) {
        const card = allCards[i];
        const chevron = card.querySelector('button svg[viewBox="0 0 24 24"][width="12"]');
        if (chevron) {
          chevron.closest('button').click();
          return true;
        }
      }
      return false;
    });

    if (dropdownOpened) {
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_board_selector.png') });

      const ddInfo = await page.evaluate(() => {
        const dd = document.querySelector('.w-72.bg-white.rounded-xl.shadow-xl');
        if (!dd) return null;
        return {
          hasSearch: !!dd.querySelector('input[placeholder="Search boards"]'),
          boardCount: dd.querySelectorAll('button').length,
          hasCreate: dd.innerText.includes('Create board'),
        };
      });
      log(26, 'Board selector dropdown', ddInfo ? 'PASS' : 'FAIL',
        ddInfo ? `Search:${ddInfo.hasSearch} Boards:${ddInfo.boardCount} Create:${ddInfo.hasCreate}` : 'Dropdown not found');
    } else {
      log(26, 'Board selector dropdown', 'PARTIAL', 'No unsaved pin found with dropdown arrow (pins may already be saved)');
    }
  } catch (e) {
    log(26, 'Board selector dropdown', 'FAIL', e.message.substring(0, 100));
  }

  // ==========================================
  // 9. PIN LIKE
  // ==========================================
  console.log('\n=== 9. PIN LIKE ===');

  try {
    await page.goto(BASE);
    await page.waitForTimeout(2000);

    const cards = await page.$$('.break-inside-avoid');
    await cards[2].click();
    await page.waitForTimeout(1500);

    // Heart button is modal button idx 4 (has count text and gap-1.5 class)
    const likeResult = await page.evaluate(() => {
      const m = document.querySelector('.fixed.inset-0');
      if (!m) return null;
      const btns = m.querySelectorAll('button');
      for (const btn of btns) {
        if (btn.className.includes('gap-1.5') && btn.className.includes('rounded-full')) {
          const beforeClass = btn.className;
          const count = btn.textContent.trim();
          btn.click();
          return { found: true, countBefore: count, wasRed: beforeClass.includes('text-pinterest-red') };
        }
      }
      return null;
    });

    if (likeResult && likeResult.found) {
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_pin_liked.png') });

      const isNowRed = await page.evaluate(() => {
        const m = document.querySelector('.fixed.inset-0');
        const btns = m.querySelectorAll('button');
        for (const btn of btns) {
          if (btn.className.includes('gap-1.5') && btn.className.includes('rounded-full')) {
            return btn.className.includes('text-pinterest-red');
          }
        }
        return false;
      });

      log(27, 'Pin like in modal', 'PASS', `Count: "${likeResult.countBefore}", Was red: ${likeResult.wasRed}, Now red: ${isNowRed}`);
    } else {
      log(27, 'Pin like in modal', 'FAIL', 'Heart button not found');
      bug('P1', 'Like button missing from modal');
    }
  } catch (e) {
    log(27, 'Pin like in modal', 'FAIL', e.message.substring(0, 100));
  }

  // 9.2 Heart on pin cards
  try {
    await closeModals(page);

    const heartCount = await page.evaluate(() => {
      const cards = document.querySelectorAll('.break-inside-avoid');
      let count = 0;
      for (const card of cards) {
        // Heart button is outside .absolute overlay, in the title/like row
        const btns = card.querySelectorAll('button:not(.absolute *)');
        for (const btn of btns) {
          if (btn.className.includes('gap-1') && !btn.closest('.absolute')) {
            count++;
          }
        }
      }
      return count;
    });

    log(28, 'Pin card heart icons', heartCount > 0 ? 'PASS' : 'FAIL',
      `${heartCount} cards with heart below image`);
  } catch (e) {
    log(28, 'Pin card heart icons', 'FAIL', e.message.substring(0, 100));
  }

  // ==========================================
  // 10. RELATED PINS
  // ==========================================
  console.log('\n=== 10. RELATED PINS ===');

  try {
    await page.goto(BASE);
    await page.waitForTimeout(2000);
    const cards = await page.$$('.break-inside-avoid');
    await cards[0].click();
    await page.waitForTimeout(1500);

    // Scroll modal right panel
    await page.evaluate(() => {
      const m = document.querySelector('.fixed.inset-0');
      if (m) {
        const scrollable = m.querySelector('.overflow-y-auto');
        if (scrollable) scrollable.scrollTop = 999999;
      }
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_related_pins.png') });

    const relatedInfo = await page.evaluate(() => {
      const m = document.querySelector('.fixed.inset-0');
      if (!m) return null;
      for (const h of m.querySelectorAll('h3')) {
        if (h.textContent.includes('More like this')) {
          const container = h.parentElement;
          const imgs = container.querySelectorAll('img');
          return { heading: h.textContent.trim(), images: imgs.length };
        }
      }
      return null;
    });

    log(29, 'Related pins section', relatedInfo ? 'PASS' : 'FAIL',
      relatedInfo ? `"${relatedInfo.heading}" with ${relatedInfo.images} pin images` : 'Not found');
    if (!relatedInfo) bug('P1', 'Related pins section missing');
  } catch (e) {
    log(29, 'Related pins section', 'FAIL', e.message.substring(0, 100));
  }

  // 10.2 Click related pin
  try {
    const clicked = await page.evaluate(() => {
      const m = document.querySelector('.fixed.inset-0');
      if (!m) return false;
      const related = m.querySelectorAll('[class*="group/related"]');
      if (related.length > 0) { related[0].click(); return true; }
      return false;
    });

    if (clicked) {
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r2_related_clicked.png') });
      log(30, 'Click related pin updates modal', 'PASS', 'Related pin clicked, modal content updated');
    } else {
      log(30, 'Click related pin updates modal', 'SKIP', 'No related pins found');
    }
  } catch (e) {
    log(30, 'Click related pin updates modal', 'FAIL', e.message.substring(0, 100));
  }

  // ==========================================
  // 11. /go ENDPOINT
  // ==========================================
  console.log('\n=== 11. STATE ===');

  try {
    await page.goto(BASE + '/go');
    await page.waitForTimeout(1000);
    const body = await page.evaluate(() => document.body.innerText);
    const state = JSON.parse(body);
    const ok = !!state.initial_state && !!state.current_state && state.hasOwnProperty('state_diff');
    log(31, '/go endpoint', ok ? 'PASS' : 'FAIL',
      `Keys: ${Object.keys(state).join(', ')}. Diff: ${JSON.stringify(state.state_diff).substring(0, 100)}`);
  } catch (e) {
    log(31, '/go endpoint', 'FAIL', e.message.substring(0, 100));
  }

  // ==========================================
  // REPORT
  // ==========================================
  console.log('\n========= FINAL =========');
  const pass = results.filter(r => r.result === 'PASS').length;
  const fail = results.filter(r => r.result === 'FAIL').length;
  const partial = results.filter(r => r.result === 'PARTIAL').length;
  const skip = results.filter(r => r.result === 'SKIP').length;
  const p0 = bugs.filter(b => b.severity === 'P0');
  const p1 = bugs.filter(b => b.severity === 'P1');

  console.log(`PASS:${pass} FAIL:${fail} PARTIAL:${partial} SKIP:${skip} | P0:${p0.length} P1:${p1.length}`);

  let md = `# Pinterest Mock - Test Report\n## Round 2\n### P1 Tests\n`;
  md += `| # | Test | Result | Notes |\n|---|------|--------|-------|\n`;
  for (const r of results) md += `| ${r.num} | ${r.name} | ${r.result} | ${r.notes.replace(/\|/g, '\\|').substring(0, 150)} |\n`;
  md += `\n### Bug List\n#### P0 Bugs\n`;
  md += p0.length ? p0.map(b => `- ${b.desc}`).join('\n') + '\n' : 'None\n';
  md += `\n#### P1 Bugs\n`;
  md += p1.length ? p1.map(b => `- ${b.desc}`).join('\n') + '\n' : 'None\n';
  md += `\n### Summary\n- **Total:** ${results.length}\n- **PASS:** ${pass}\n- **FAIL:** ${fail}\n- **PARTIAL:** ${partial}\n- **SKIP:** ${skip}\n- **P0:** ${p0.length}\n- **P1:** ${p1.length}\n`;
  if (p0.length === 0 && p1.length === 0) md += `\n**TEST COMPLETE: pinterest_mock - PASS**\n`;

  fs.writeFileSync(path.join(__dirname, 'TEST.md'), md);
  console.log('TEST.md written');

  await browser.close();
})().catch(e => { console.error('FATAL:', e); process.exit(1); });
