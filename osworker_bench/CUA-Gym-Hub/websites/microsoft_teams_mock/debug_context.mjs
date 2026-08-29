import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }});
  await page.goto('http://localhost:7789/chat', { waitUntil: 'networkidle', timeout: 15000 });
  await new Promise(r => setTimeout(r, 500));

  // Click first chat
  const chats = await page.$$('.chat-item');
  if (chats.length > 0) await chats[0].click();
  await new Promise(r => setTimeout(r, 500));

  // Find Adele's message
  const senders = await page.$$eval('.message-row', rows => rows.map((r, i) => ({ i, s: r.querySelector('.message-sender')?.textContent || '' })));
  console.log('Senders:', senders.map(s => `[${s.i}]${s.s}`).join(', '));

  const adele = senders.find(s => s.s.includes('Adele'));
  if (!adele) { console.log('No Adele message found'); await browser.close(); return; }

  const rows = await page.$$('.message-row:not(.system-message)');
  await rows[adele.i].hover();
  await new Promise(r => setTimeout(r, 500));

  // Check hover actions are visible
  const hoverActionsVisible = await page.evaluate(() => {
    const all = document.querySelectorAll('.message-hover-actions');
    for (const el of all) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) return true;
    }
    return false;
  });
  console.log('Hover actions visible:', hoverActionsVisible);

  // Click More button
  const moreBtn = await page.$('.message-hover-actions button[title="More"]');
  if (moreBtn) {
    console.log('Found More button, clicking...');
    await moreBtn.click({ timeout: 5000 });
    await new Promise(r => setTimeout(r, 300));
    const ctxMenu = await page.$('.context-menu');
    console.log('Context menu found:', !!ctxMenu);
    if (ctxMenu) {
      const items = await page.$$eval('.context-menu-item', els => els.map(e => e.textContent));
      console.log('Menu items:', items);

      // Click Edit
      const editItem = await page.$('.context-menu-item');
      if (editItem) {
        const editText = await editItem.textContent();
        if (editText.includes('Edit')) {
          await editItem.click({ timeout: 5000 });
          await new Promise(r => setTimeout(r, 300));
          const textarea = await page.$('.message-body textarea');
          console.log('Edit textarea found:', !!textarea);
          if (textarea) {
            // Type something
            await textarea.fill('Edited message text!');
            const saveBtn = await page.$('.btn-primary');
            if (saveBtn) {
              await saveBtn.click({ timeout: 5000 });
              await new Promise(r => setTimeout(r, 300));
              console.log('Edit saved');
              // Check for (Edited) marker
              const edited = await page.$$('.message-edited');
              console.log('Edited markers:', edited.length);
            }
          }
        }
      }
    }
  } else {
    console.log('More button NOT found');
  }

  await page.screenshot({ path: '/cpfs02/data/shared/Group-m6/bowen.wbw/openrlvr-mock/microsoft_teams_mock/assets/screenshots/debug_context_menu.png', fullPage: true });
  await browser.close();
})();
