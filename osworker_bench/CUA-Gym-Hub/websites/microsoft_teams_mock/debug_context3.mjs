import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }});
  await page.goto('http://localhost:7789/chat', { waitUntil: 'networkidle', timeout: 15000 });
  await new Promise(r => setTimeout(r, 500));
  const chats = await page.$$('.chat-item');
  if (chats.length > 0) await chats[0].click();
  await new Promise(r => setTimeout(r, 500));

  // Send a message from Adele (current user) first
  const comp = await page.$('.composer-input');
  if (comp) {
    await comp.fill('Test message for edit');
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 500));
  }

  // Now hover on last message row (should be Adele's)
  const rows = await page.$$('.message-row:not(.system-message)');
  const lastRow = rows[rows.length - 1];
  const senderName = await lastRow.$eval('.message-sender', el => el.textContent).catch(() => 'unknown');
  console.log('Last message sender:', senderName);

  await lastRow.hover();
  await new Promise(r => setTimeout(r, 500));

  // Try clicking More with force
  const moreBtn = await page.$('.message-hover-actions button[title="More"]');
  if (moreBtn) {
    await moreBtn.click({ force: true });
    await new Promise(r => setTimeout(r, 300));
    const items = await page.$$eval('.context-menu-item', els => els.map(e => e.textContent));
    console.log('Context menu items:', items);

    const hasEdit = items.some(t => t.includes('Edit'));
    const hasDelete = items.some(t => t.includes('Delete'));
    const hasPin = items.some(t => t.includes('Pin'));
    console.log('Has Edit:', hasEdit, 'Has Delete:', hasDelete, 'Has Pin:', hasPin);

    // Test Edit
    if (hasEdit) {
      await page.evaluate(() => {
        const items = document.querySelectorAll('.context-menu-item');
        for (const i of items) { if (i.textContent.includes('Edit')) { i.click(); break; } }
      });
      await new Promise(r => setTimeout(r, 300));
      const textarea = await page.$('.message-body textarea');
      console.log('Edit textarea:', !!textarea);
      if (textarea) {
        await textarea.fill('EDITED: Hello from Playwright!');
        // Click Save
        await page.evaluate(() => {
          const btns = document.querySelectorAll('.btn-primary');
          for (const b of btns) { if (b.textContent.includes('Save')) { b.click(); break; } }
        });
        await new Promise(r => setTimeout(r, 300));
        const editedMarkers = await page.$$('.message-edited');
        console.log('Edited markers after save:', editedMarkers.length);
        const lastMsgContent = await page.$$eval('.message-content', els => els.map(e => e.textContent));
        console.log('Last messages:', lastMsgContent.slice(-3));
      }
    }

    // Send another message to test delete
    if (comp) {
      await comp.click();
      await comp.fill('Message to delete');
      await page.keyboard.press('Enter');
      await new Promise(r => setTimeout(r, 500));
    }

    // Delete the last message
    const rows2 = await page.$$('.message-row:not(.system-message)');
    const lastRow2 = rows2[rows2.length - 1];
    await lastRow2.hover();
    await new Promise(r => setTimeout(r, 300));
    const moreBtn2 = await page.$('.message-hover-actions button[title="More"]');
    if (moreBtn2) {
      await moreBtn2.click({ force: true });
      await new Promise(r => setTimeout(r, 300));
      const items2 = await page.$$eval('.context-menu-item', els => els.map(e => e.textContent));
      console.log('Delete menu items:', items2);
      await page.evaluate(() => {
        const items = document.querySelectorAll('.context-menu-item');
        for (const i of items) { if (i.textContent.includes('Delete')) { i.click(); break; } }
      });
      await new Promise(r => setTimeout(r, 300));
      const deleted = await page.$$('.message-content.deleted');
      console.log('Deleted messages:', deleted.length);
    }

    // Test Pin on any message
    await rows2[0].hover();
    await new Promise(r => setTimeout(r, 300));
    const moreBtn3 = await page.$('.message-hover-actions button[title="More"]');
    if (moreBtn3) {
      await moreBtn3.click({ force: true });
      await new Promise(r => setTimeout(r, 300));
      const items3 = await page.$$eval('.context-menu-item', els => els.map(e => e.textContent));
      console.log('Pin menu items:', items3);
      await page.evaluate(() => {
        const items = document.querySelectorAll('.context-menu-item');
        for (const i of items) { if (i.textContent.includes('Pin')) { i.click(); break; } }
      });
      await new Promise(r => setTimeout(r, 300));
      const pinBadges = await page.$$('.message-pinned-badge');
      console.log('Pin badges:', pinBadges.length);
    }
  }

  await page.screenshot({ path: '/cpfs02/data/shared/Group-m6/bowen.wbw/openrlvr-mock/microsoft_teams_mock/assets/screenshots/debug_edit_final.png', fullPage: true });
  await browser.close();
})();
