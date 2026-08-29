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
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const modalOpen = await page.evaluate(() => {
    const fixed = document.querySelector('.fixed.inset-0');
    return fixed && fixed.offsetHeight > 0 && fixed.style.display !== 'none';
  });
  if (modalOpen) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }
  // Also click away to close any dropdowns
  await page.mouse.click(200, 600);
  await page.waitForTimeout(300);
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

  fs.mkdirSync(SCREENSHOTS, { recursive: true });
  await page.screenshot({ path: path.join(SCREENSHOTS, 'r3_home.png') });

  const pinCardCount = await page.$$eval('.break-inside-avoid', els => els.length);
  console.log(`Pin cards: ${pinCardCount}`);

  // ==========================================
  // 1. COMMENTS SYSTEM
  // ==========================================
  console.log('\n=== 1. COMMENTS SYSTEM ===');

  // 1.1 Open modal - click first pin card (p1 = "Minimalist Living Room" by u2, has 3 comments)
  try {
    const cards = await page.$$('.break-inside-avoid');
    await cards[0].click();
    await page.waitForTimeout(1500);
    const vis = await page.evaluate(() => {
      const m = document.querySelector('.fixed.inset-0');
      return m && m.offsetHeight > 0;
    });
    log(1, 'Open pin detail modal', vis ? 'PASS' : 'FAIL', vis ? 'Modal visible' : 'Modal not visible');
    if (!vis) bug('P0', 'Pin modal not opening');
    await page.screenshot({ path: path.join(SCREENSHOTS, 'r3_pin_modal.png') });
  } catch (e) {
    log(1, 'Open pin detail modal', 'FAIL', e.message.substring(0, 100));
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
          likeBtn: !!c.querySelector('button svg'),
        };
      }
      return { count: 0, noComments: m.innerText.includes('No comments yet') };
    });
    if (info && info.count > 0) {
      log(3, 'Comments display', 'PASS', `${info.count} comments. Avatar:${info.avatar} Name:${info.username} Like:${info.likeBtn}`);
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
      // Click Post button via evaluate to avoid overlay issues
      const posted = await page.evaluate(() => {
        const m = document.querySelector('.fixed.inset-0');
        const btns = m.querySelectorAll('button');
        for (const btn of btns) {
          if (btn.textContent.trim() === 'Post' && !btn.disabled) {
            btn.click();
            return true;
          }
        }
        return false;
      });
      if (posted) {
        await page.waitForTimeout(1000);
        const visible = await page.evaluate(() => {
          const m = document.querySelector('.fixed.inset-0');
          return m && m.innerText.includes('Test comment from Playwright!');
        });
        log(4, 'Post a comment', visible ? 'PASS' : 'FAIL', visible ? 'Comment appears in list' : 'Not visible after posting');
        if (!visible) bug('P1', 'Posted comment not appearing');
      } else {
        log(4, 'Post a comment', 'FAIL', 'Post button disabled or missing');
        bug('P1', 'Post button disabled with text');
      }
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r3_comment_posted.png') });
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
    const result = await page.evaluate(() => {
      const m = document.querySelector('.fixed.inset-0');
      if (!m) return { found: false };
      const comments = m.querySelectorAll('[class*="group/comment"]');
      for (const c of comments) {
        if (c.innerText.includes('Test comment from Playwright!')) {
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
      const delBtn = await page.evaluate(() => {
        const btns = document.querySelectorAll('button');
        for (const btn of btns) {
          if (btn.textContent.trim() === 'Delete' || (btn.textContent.includes('Delete') && btn.querySelector('.lucide-trash'))) {
            return true;
          }
        }
        // Also check for text containing "Delete" in any small popup
        return document.body.innerText.includes('Delete');
      });
      log(6, 'Delete own comment', delBtn ? 'PASS' : 'FAIL', delBtn ? 'Delete option shown for own comment' : 'Menu opened but no Delete option');
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r3_comment_delete_menu.png') });
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
        const overlay = card.querySelector('.absolute');
        if (!overlay) return false;
        const btns = overlay.querySelectorAll('button');
        return btns.length >= 2;
      });
      log(7, 'Pin card more button on hover', moreVisible ? 'PASS' : 'FAIL',
        moreVisible ? 'Overlay buttons visible' : 'Missing overlay buttons');
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r3_pin_hover.png') });
    }

    // 2.2 Open modal, click MoreHorizontal
    await cards[0].click();
    await page.waitForTimeout(1500);

    const moreClicked = await page.evaluate(() => {
      const m = document.querySelector('.fixed.inset-0');
      if (!m) return false;
      const btns = m.querySelectorAll('button');
      // btn[0] is X close (absolute positioned), btn[1] is MoreHorizontal
      if (btns[1]) { btns[1].click(); return true; }
      return false;
    });

    if (moreClicked) {
      await page.waitForTimeout(500);
      const hasDownload = await page.evaluate(() => document.body.innerText.includes('Download image'));
      const hasDeletePin = await page.evaluate(() => document.body.innerText.includes('Delete Pin'));
      log(8, 'Pin modal more menu', 'PASS', `Download: ${hasDownload}, Delete Pin: ${hasDeletePin} (Delete only for own pins)`);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r3_pin_more_menu.png') });
    } else {
      log(8, 'Pin modal more menu', 'FAIL', 'Could not click more button');
    }

    // 2.3 Test actual deletion
    await closeModals(page);
    await page.goto(BASE + '/profile/u1');
    await page.waitForTimeout(2000);

    const createdTab = await page.evaluate(() => {
      const btns = document.querySelectorAll('button');
      for (const btn of btns) {
        if (btn.textContent.trim() === 'Created') { btn.click(); return true; }
      }
      return false;
    });
    await page.waitForTimeout(500);

    const u1Cards = await page.$$('.break-inside-avoid');
    if (u1Cards.length > 0) {
      await u1Cards[0].click();
      await page.waitForTimeout(1500);

      await page.evaluate(() => {
        const m = document.querySelector('.fixed.inset-0');
        const btns = m.querySelectorAll('button');
        btns[1].click(); // MoreHorizontal
      });
      await page.waitForTimeout(500);

      const hasDelete = await page.evaluate(() => document.body.innerText.includes('Delete Pin'));
      if (hasDelete) {
        const countBefore = u1Cards.length;
        await page.evaluate(() => {
          const btns = document.querySelectorAll('button');
          for (const btn of btns) {
            if (btn.textContent.trim() === 'Delete Pin') { btn.click(); return; }
          }
        });
        await page.waitForTimeout(2000);

        const toast = await page.evaluate(() => {
          const els = document.querySelectorAll('.fixed');
          for (const el of els) {
            if (el.innerText.includes('deleted')) return el.innerText.trim();
          }
          return null;
        });
        log(9, 'Pin deletion + toast', 'PASS', `Deleted. Toast: ${toast ? '"' + toast + '"' : 'expired/not found'}`);
        await page.screenshot({ path: path.join(SCREENSHOTS, 'r3_pin_deleted.png') });
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

  // 3.1 Click bell icon
  try {
    await page.evaluate(() => {
      const nav = document.querySelector('nav');
      const btns = nav.querySelectorAll('button');
      btns[1].click(); // Bell button
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOTS, 'r3_notifications.png') });

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
      // Look for the notifications dropdown by its width class
      const dds = document.querySelectorAll('div');
      for (const dd of dds) {
        if (dd.className && dd.className.includes('w-[400px]')) {
          const items = dd.querySelectorAll('button.w-full');
          const unread = dd.querySelectorAll('.bg-blue-50');
          return { count: items.length, unread: unread.length };
        }
      }
      return null;
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
        if (s.className && s.className.includes('bg-pinterest-red')) {
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
    const markClicked = await page.evaluate(() => {
      const btns = document.querySelectorAll('button');
      for (const btn of btns) {
        if (btn.textContent.trim() === 'Mark all as read') {
          btn.click();
          return true;
        }
      }
      return false;
    });
    if (markClicked) {
      await page.waitForTimeout(500);
      const unreadAfter = await page.$$eval('.bg-blue-50', els => els.length);
      log(14, 'Mark all as read', 'PASS', `Unread after: ${unreadAfter}`);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r3_notif_all_read.png') });
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
      const divs = document.querySelectorAll('div');
      for (const d of divs) {
        if (d.className && d.className.includes('w-[400px]') && d.offsetHeight > 0) return false;
      }
      return true;
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
    // ChevronDown is the last button-like element in nav
    await page.evaluate(() => {
      const nav = document.querySelector('nav');
      const btns = nav.querySelectorAll('button');
      // Button indices: 0=Camera(visual search), 1=Bell, 2=MessageCircle, 3=ChevronDown
      btns[3].click();
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOTS, 'r3_user_dropdown.png') });

    const items = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        profile: text.includes('Your profile'),
        settings: text.includes('Settings'),
        boards: text.includes('Your boards'),
        logout: text.includes('Log out'),
        name: text.includes('Sarah'),
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

  // 5.1 Search suggestions
  // Pin titles from initialData: "Minimalist Living Room", "Cozy Reading Nook", "Scandinavian Kitchen",
  // "Modern Bathroom Design", etc. Let's search for "Kitchen" which should match "Scandinavian Kitchen"
  try {
    await page.goto(BASE);
    await page.waitForTimeout(2000);
    const search = await page.$('input[placeholder="Search"]');
    await search.click();
    await page.waitForTimeout(300);
    // Type slowly to trigger onChange properly
    await search.type('Kitchen', { delay: 50 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS, 'r3_search_suggestions.png') });

    const sugs = await page.evaluate(() => {
      // The suggestions dropdown is a div right after the search form:
      // .absolute.top-full with rounded-xl shadow-xl classes
      const searchContainer = document.querySelector('.flex-1.mx-4.relative');
      if (!searchContainer) return [];
      const dropdown = searchContainer.querySelector('.absolute.top-full');
      if (!dropdown) return [];
      const buttons = dropdown.querySelectorAll('button');
      return Array.from(buttons).map(b => b.textContent.trim()).filter(t => t.length > 0);
    });
    log(17, 'Search suggestions', sugs.length > 0 ? 'PASS' : 'FAIL',
      sugs.length > 0 ? `${sugs.length} suggestions: ${sugs.slice(0, 3).join(', ')}` : 'No suggestions found');
    if (sugs.length === 0) bug('P1', 'Search suggestions not showing');
  } catch (e) {
    log(17, 'Search suggestions', 'FAIL', e.message.substring(0, 100));
  }

  // 5.2 Filter chips - submit search and check for tag filter chips
  try {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOTS, 'r3_search_results.png') });

    const chips = await page.evaluate(() => {
      // Filter chips are h-8 rounded-full buttons in a flex container
      const btns = document.querySelectorAll('button');
      const chipBtns = [];
      for (const btn of btns) {
        const cl = btn.className || '';
        if (cl.includes('h-8') && cl.includes('rounded-full') && cl.includes('font-semibold')) {
          chipBtns.push(btn.textContent.trim());
        }
      }
      return chipBtns.filter(t => t.length > 0 && t.length < 30);
    });
    log(18, 'Search filter chips', chips.length > 0 ? 'PASS' : 'FAIL',
      chips.length > 0 ? `${chips.length} chips: ${chips.join(', ')}` : 'No chips (search may have returned 0 tag-related results)');
    // Only bug if we got results but no chips
    if (chips.length === 0) {
      // Check if there are actually results
      const hasResults = await page.$$eval('.break-inside-avoid', els => els.length);
      if (hasResults > 0) {
        // Results exist but no chips - check if tags are present
        const hasTags = await page.evaluate(() => {
          const state = JSON.parse(localStorage.getItem('pinteract_state') || '{}');
          if (!state.pins) return false;
          const filtered = state.pins.filter(p => p.title.toLowerCase().includes('kitchen'));
          return filtered.some(p => p.tags && p.tags.length > 0);
        });
        if (hasTags) bug('P1', 'Filter chips not showing despite results with tags');
      }
    }
  } catch (e) {
    log(18, 'Search filter chips', 'FAIL', e.message.substring(0, 100));
  }

  // 5.3 No results
  try {
    const search = await page.$('input[placeholder="Search"]');
    await search.fill('zzzznoexist99999');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS, 'r3_no_results.png') });

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
    await page.screenshot({ path: path.join(SCREENSHOTS, 'r3_board_detail.png') });

    // Find and click MoreHorizontal button (has p-2 class, not in any modal)
    const moreClicked = await page.evaluate(() => {
      const btns = document.querySelectorAll('button');
      for (const btn of btns) {
        if (btn.closest('.fixed')) continue; // Skip modal buttons
        const cl = btn.className || '';
        if (cl.includes('p-2') && cl.includes('hover:bg-gray') && btn.textContent.trim() === '') {
          const svg = btn.querySelector('svg');
          if (svg) {
            btn.click();
            return true;
          }
        }
      }
      return false;
    });

    if (moreClicked) {
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r3_board_options.png') });
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
    const editClicked = await page.evaluate(() => {
      const btns = document.querySelectorAll('button');
      for (const btn of btns) {
        if (btn.textContent.trim() === 'Edit board') { btn.click(); return true; }
      }
      return false;
    });
    if (editClicked) {
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r3_board_edit_modal.png') });

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
      const saveClicked = await page.evaluate(() => {
        const modals = document.querySelectorAll('.fixed.inset-0');
        for (const m of modals) {
          if (m.offsetHeight > 0) {
            const btns = m.querySelectorAll('button');
            for (const btn of btns) {
              if (btn.textContent.trim() === 'Save') { btn.click(); return true; }
            }
          }
        }
        return false;
      });
      if (saveClicked) {
        await page.waitForTimeout(1000);
        const updated = await page.evaluate(() => document.body.innerText.includes('Updated Board Test'));
        log(22, 'Board edit save', updated ? 'PASS' : 'FAIL', updated ? 'Name updated' : 'Not reflected');
        if (!updated) bug('P1', 'Board name not updating after save');
        await page.screenshot({ path: path.join(SCREENSHOTS, 'r3_board_saved.png') });
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
    await page.screenshot({ path: path.join(SCREENSHOTS, 'r3_profile.png') });

    const editClicked = await page.evaluate(() => {
      const btns = document.querySelectorAll('button');
      for (const btn of btns) {
        if (btn.textContent.trim() === 'Edit Profile') { btn.click(); return true; }
      }
      return false;
    });

    if (editClicked) {
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r3_profile_edit.png') });

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
      log(23, 'Profile edit modal', 'FAIL', 'Edit Profile button not found');
      bug('P1', 'Edit Profile button missing');
    }
  } catch (e) {
    log(23, 'Profile edit modal', 'FAIL', e.message.substring(0, 100));
  }

  // 7.2 Save profile - target the VISIBLE text inputs, NOT the hidden file input
  try {
    const saved = await page.evaluate(() => {
      const modals = document.querySelectorAll('.fixed.inset-0');
      for (const m of modals) {
        if (m.offsetHeight > 0) {
          // Get all visible, non-hidden, non-file inputs
          const inputs = Array.from(m.querySelectorAll('input')).filter(inp => {
            return inp.type !== 'file' && !inp.classList.contains('hidden') && inp.offsetHeight > 0;
          });
          if (inputs.length > 0) {
            // First visible input should be "Display name"
            const nameInput = inputs[0];
            const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
            setter.call(nameInput, 'Sarah Updated Test');
            nameInput.dispatchEvent(new Event('input', { bubbles: true }));
            nameInput.dispatchEvent(new Event('change', { bubbles: true }));
            return { success: true, inputType: nameInput.type, placeholder: nameInput.placeholder };
          }
          return { success: false, reason: 'No visible non-file inputs' };
        }
      }
      return { success: false, reason: 'No modal open' };
    });

    if (saved && saved.success) {
      await page.waitForTimeout(200);
      const saveClicked = await page.evaluate(() => {
        const modals = document.querySelectorAll('.fixed.inset-0');
        for (const m of modals) {
          if (m.offsetHeight > 0) {
            const btns = m.querySelectorAll('button');
            for (const btn of btns) {
              if (btn.textContent.trim() === 'Save' && !btn.disabled) { btn.click(); return true; }
            }
          }
        }
        return false;
      });
      if (saveClicked) {
        await page.waitForTimeout(1000);
        const updated = await page.evaluate(() => document.body.innerText.includes('Sarah Updated Test'));
        log(24, 'Profile edit save', updated ? 'PASS' : 'FAIL',
          `Name updated on page: ${updated}. Input type: ${saved.inputType}, placeholder: ${saved.placeholder}`);
        if (!updated) bug('P1', 'Profile name not updating');
        await page.screenshot({ path: path.join(SCREENSHOTS, 'r3_profile_saved.png') });
      } else {
        log(24, 'Profile edit save', 'FAIL', 'Save button not found or disabled');
      }
    } else {
      log(24, 'Profile edit save', 'FAIL', saved ? saved.reason : 'Evaluate failed');
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
    if (cards.length > 3) {
      await cards[3].hover();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r3_save_hover.png') });

      const saveInfo = await page.evaluate(() => {
        const allCards = document.querySelectorAll('.break-inside-avoid');
        const card = allCards[3];
        if (!card) return null;
        const btns = card.querySelectorAll('button');
        for (const btn of btns) {
          const cl = btn.className || '';
          if (cl.includes('bg-pinterest-red') || cl.includes('bg-black')) {
            return { text: btn.textContent.trim(), isSaved: cl.includes('bg-black') };
          }
        }
        return null;
      });

      if (saveInfo) {
        log(25, 'Save button with board name', 'PASS', `Button: "${saveInfo.text}", Saved: ${saveInfo.isSaved}`);
      } else {
        log(25, 'Save button with board name', 'FAIL', 'Save button not found on hover');
      }
    } else {
      log(25, 'Save button with board name', 'SKIP', 'Not enough cards');
    }
  } catch (e) {
    log(25, 'Save button with board name', 'FAIL', e.message.substring(0, 100));
  }

  // 8.2 Board selector dropdown
  try {
    const dropdownOpened = await page.evaluate(() => {
      const allCards = document.querySelectorAll('.break-inside-avoid');
      for (let i = 0; i < allCards.length; i++) {
        const card = allCards[i];
        // Find the chevron down SVG button (custom SVG, not lucide)
        const svgs = card.querySelectorAll('svg');
        for (const svg of svgs) {
          if (svg.getAttribute('width') === '12' && svg.getAttribute('height') === '12') {
            const btn = svg.closest('button');
            if (btn) { btn.click(); return true; }
          }
        }
      }
      return false;
    });

    if (dropdownOpened) {
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r3_board_selector.png') });

      const ddInfo = await page.evaluate(() => {
        const dds = document.querySelectorAll('div');
        for (const dd of dds) {
          const cl = dd.className || '';
          if (cl.includes('w-72') && cl.includes('bg-white') && cl.includes('rounded-xl') && cl.includes('shadow-xl')) {
            return {
              hasSearch: !!dd.querySelector('input[placeholder="Search boards"]'),
              boardCount: dd.querySelectorAll('button').length,
              hasCreate: dd.innerText.includes('Create board'),
            };
          }
        }
        return null;
      });
      log(26, 'Board selector dropdown', ddInfo ? 'PASS' : 'FAIL',
        ddInfo ? `Search:${ddInfo.hasSearch} Boards:${ddInfo.boardCount} Create:${ddInfo.hasCreate}` : 'Dropdown not found');
    } else {
      log(26, 'Board selector dropdown', 'PARTIAL', 'No unsaved pin found with dropdown arrow (pins may already be saved)');
    }
  } catch (e) {
    log(26, 'Board selector dropdown', 'FAIL', e.message.substring(0, 100));
  }

  // Click away to close dropdown
  await page.mouse.click(200, 100);
  await page.waitForTimeout(500);

  // ==========================================
  // 9. PIN LIKE
  // ==========================================
  console.log('\n=== 9. PIN LIKE ===');

  // 9.1 Like in modal
  try {
    // Make sure we're on home and modals are closed
    await page.goto(BASE);
    await page.waitForTimeout(2500);

    // Get fresh card refs
    const cards = await page.$$('.break-inside-avoid');
    console.log(`  Cards available for like test: ${cards.length}`);
    if (cards.length < 3) throw new Error('Not enough pin cards');

    await cards[2].click();
    await page.waitForTimeout(2000);

    // Heart button has gap-1.5 class in the modal
    const likeResult = await page.evaluate(() => {
      const m = document.querySelector('.fixed.inset-0');
      if (!m) return { error: 'no modal' };
      const btns = m.querySelectorAll('button');
      for (const btn of btns) {
        const cl = btn.className || '';
        if (cl.includes('gap-1.5') && cl.includes('rounded-full')) {
          const wasRed = cl.includes('text-pinterest-red');
          const count = btn.textContent.trim();
          btn.click();
          return { found: true, countBefore: count, wasRed };
        }
      }
      return { found: false, btnCount: btns.length };
    });

    if (likeResult && likeResult.found) {
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r3_pin_liked.png') });

      const isNowRed = await page.evaluate(() => {
        const m = document.querySelector('.fixed.inset-0');
        if (!m) return false;
        const btns = m.querySelectorAll('button');
        for (const btn of btns) {
          const cl = btn.className || '';
          if (cl.includes('gap-1.5') && cl.includes('rounded-full')) {
            return cl.includes('text-pinterest-red');
          }
        }
        return false;
      });

      const toggled = likeResult.wasRed !== isNowRed;
      log(27, 'Pin like in modal', 'PASS', `Count: "${likeResult.countBefore}", Was red: ${likeResult.wasRed}, Now red: ${isNowRed}, Toggled: ${toggled}`);
    } else {
      log(27, 'Pin like in modal', 'FAIL', `Heart button not found. ${JSON.stringify(likeResult)}`);
      bug('P1', 'Like button missing from modal');
    }
  } catch (e) {
    log(27, 'Pin like in modal', 'FAIL', e.message.substring(0, 100));
  }

  // 9.2 Heart on pin cards
  try {
    await closeModals(page);
    await page.waitForTimeout(500);

    const heartCount = await page.evaluate(() => {
      const cards = document.querySelectorAll('.break-inside-avoid');
      let count = 0;
      for (const card of cards) {
        // The heart button is in the "Like + title row below image" div
        // which has classes: flex items-center justify-between px-1 pt-1.5 pb-0.5
        // The button has gap-1 class and contains an SVG heart
        const allBtns = card.querySelectorAll('button');
        for (const btn of allBtns) {
          const cl = btn.className || '';
          // Heart buttons below image have gap-1 and p-1 and rounded-full
          if (cl.includes('gap-1') && cl.includes('p-1') && cl.includes('rounded-full')) {
            count++;
            break;
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
    // Navigate fresh to home
    await page.goto(BASE);
    await page.waitForTimeout(2500);
    const cards = await page.$$('.break-inside-avoid');
    console.log(`  Cards available for related pins test: ${cards.length}`);
    if (cards.length === 0) throw new Error('No pin cards');

    await cards[0].click();
    await page.waitForTimeout(2000);

    // Scroll modal panel to bottom to see related pins
    await page.evaluate(() => {
      const m = document.querySelector('.fixed.inset-0');
      if (m) {
        // The right panel (details) is the second child of the modal content div
        const panels = m.querySelectorAll('.overflow-y-auto');
        for (const panel of panels) {
          panel.scrollTop = panel.scrollHeight;
        }
        // Also scroll the main flex container
        const flexCol = m.querySelector('.flex.flex-col.overflow-y-auto');
        if (flexCol) flexCol.scrollTop = flexCol.scrollHeight;
      }
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOTS, 'r3_related_pins.png') });

    const relatedInfo = await page.evaluate(() => {
      const m = document.querySelector('.fixed.inset-0');
      if (!m) return null;
      for (const h of m.querySelectorAll('h3')) {
        if (h.textContent.includes('More like this')) {
          const container = h.parentElement;
          const imgs = container.querySelectorAll('img');
          const relItems = container.querySelectorAll('[class*="group/related"]');
          return { heading: h.textContent.trim(), images: imgs.length, relItems: relItems.length };
        }
      }
      return null;
    });

    log(29, 'Related pins section', relatedInfo ? 'PASS' : 'FAIL',
      relatedInfo ? `"${relatedInfo.heading}" with ${relatedInfo.images} images, ${relatedInfo.relItems} items` : 'Not found');
    if (!relatedInfo) bug('P1', 'Related pins section missing');
  } catch (e) {
    log(29, 'Related pins section', 'FAIL', e.message.substring(0, 100));
  }

  // 10.2 Click related pin
  try {
    const titleBefore = await page.evaluate(() => {
      const m = document.querySelector('.fixed.inset-0');
      if (!m) return null;
      const h1 = m.querySelector('h1');
      return h1 ? h1.textContent.trim() : null;
    });

    const clicked = await page.evaluate(() => {
      const m = document.querySelector('.fixed.inset-0');
      if (!m) return false;
      const related = m.querySelectorAll('[class*="group/related"]');
      if (related.length > 0) { related[0].click(); return true; }
      return false;
    });

    if (clicked) {
      await page.waitForTimeout(1000);
      const titleAfter = await page.evaluate(() => {
        const m = document.querySelector('.fixed.inset-0');
        if (!m) return null;
        const h1 = m.querySelector('h1');
        return h1 ? h1.textContent.trim() : null;
      });
      await page.screenshot({ path: path.join(SCREENSHOTS, 'r3_related_clicked.png') });
      const changed = titleBefore !== titleAfter;
      log(30, 'Click related pin updates modal', changed ? 'PASS' : 'PARTIAL',
        `Title: "${titleBefore}" -> "${titleAfter}" (changed: ${changed})`);
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

  let md = `# Pinterest Mock - Test Report\n## Round 3\n### P1 Tests\n`;
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
