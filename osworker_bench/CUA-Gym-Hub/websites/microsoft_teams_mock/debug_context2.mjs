import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }});
  await page.goto('http://localhost:7789/chat', { waitUntil: 'networkidle', timeout: 15000 });
  await new Promise(r => setTimeout(r, 500));
  const chats = await page.$$('.chat-item');
  if (chats.length > 0) await chats[0].click();
  await new Promise(r => setTimeout(r, 500));

  // Try on a message in the middle (not first)
  const rows = await page.$$('.message-row:not(.system-message)');
  console.log('Total rows:', rows.length);

  // Use index 5 (Adele's message, not at very top)
  const targetIdx = 5;
  await rows[targetIdx].hover();
  await new Promise(r => setTimeout(r, 500));

  // Use force:true to bypass interception
  const moreBtn = await page.$('.message-hover-actions button[title="More"]');
  if (moreBtn) {
    console.log('Clicking More button with force...');
    await moreBtn.click({ force: true, timeout: 5000 });
    await new Promise(r => setTimeout(r, 300));
    const ctxMenu = await page.$('.context-menu');
    console.log('Context menu found:', !!ctxMenu);
    if (ctxMenu) {
      const items = await page.$$eval('.context-menu-item', els => els.map(e => e.textContent));
      console.log('Menu items:', items);

      // Click Edit
      const editItem = await page.evaluate(() => {
        const items = document.querySelectorAll('.context-menu-item');
        for (const item of items) {
          if (item.textContent.includes('Edit')) { item.click(); return 'clicked'; }
        }
        return 'not found';
      });
      console.log('Edit click result:', editItem);
      await new Promise(r => setTimeout(r, 300));

      const textarea = await page.$('.message-body textarea');
      console.log('Edit textarea found:', !!textarea);
      if (textarea) {
        await textarea.fill('EDITED TEXT');
        // Save
        const saveBtn = await page.evaluate(() => {
          const btns = document.querySelectorAll('.btn-primary');
          for (const b of btns) {
            if (b.textContent.includes('Save')) { b.click(); return 'clicked'; }
          }
          return 'not found';
        });
        console.log('Save result:', saveBtn);
        await new Promise(r => setTimeout(r, 300));
        const editedMarkers = await page.$$('.message-edited');
        console.log('Edited markers:', editedMarkers.length);
      }
    }
  }

  // Test Delete
  await rows[7].hover();
  await new Promise(r => setTimeout(r, 500));
  const moreBtn2 = await page.$('.message-hover-actions button[title="More"]');
  if (moreBtn2) {
    await moreBtn2.click({ force: true, timeout: 5000 });
    await new Promise(r => setTimeout(r, 300));
    const delResult = await page.evaluate(() => {
      const items = document.querySelectorAll('.context-menu-item');
      for (const item of items) {
        if (item.textContent.includes('Delete')) { item.click(); return 'clicked'; }
      }
      return 'not found';
    });
    console.log('Delete click result:', delResult);
    await new Promise(r => setTimeout(r, 300));
    const deleted = await page.$$('.message-content.deleted');
    console.log('Deleted messages:', deleted.length);
  }

  // Test Pin
  await rows[0].hover();
  await new Promise(r => setTimeout(r, 500));
  const moreBtn3 = await page.$('.message-hover-actions button[title="More"]');
  if (moreBtn3) {
    await moreBtn3.click({ force: true, timeout: 5000 });
    await new Promise(r => setTimeout(r, 300));
    const pinResult = await page.evaluate(() => {
      const items = document.querySelectorAll('.context-menu-item');
      for (const item of items) {
        if (item.textContent.includes('Pin')) { item.click(); return 'clicked'; }
      }
      return 'not found';
    });
    console.log('Pin result:', pinResult);
    await new Promise(r => setTimeout(r, 300));
    const pinBadge = await page.$('.message-pinned-badge');
    console.log('Pinned badge found:', !!pinBadge);
  }

  await page.screenshot({ path: '/cpfs02/data/shared/Group-m6/bowen.wbw/openrlvr-mock/microsoft_teams_mock/assets/screenshots/debug_edit_delete.png', fullPage: true });
  await browser.close();
})();
