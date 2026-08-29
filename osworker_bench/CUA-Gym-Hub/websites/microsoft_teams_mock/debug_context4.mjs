import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }});
  await page.goto('http://localhost:7789/chat', { waitUntil: 'networkidle', timeout: 15000 });
  await new Promise(r => setTimeout(r, 500));
  const chats = await page.$$('.chat-item');
  if (chats.length > 0) await chats[0].click();
  await new Promise(r => setTimeout(r, 500));

  // Send a message first
  const comp = await page.$('.composer-input');
  if (comp) {
    await comp.fill('Edit me please');
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 500));
  }

  // Get all message info via evaluate
  const msgInfo = await page.evaluate(() => {
    // Check if context is accessible
    const root = document.getElementById('root');
    const fiberKey = Object.keys(root).find(key => key.startsWith('__reactFiber'));
    if (!fiberKey) return { error: 'no fiber' };

    // Walk fiber tree to find AppContext consumer
    let fiber = root[fiberKey];
    let found = null;
    function walk(node, depth) {
      if (!node || depth > 50) return;
      // Check memoizedProps for state
      if (node.memoizedProps?.value?.state?.currentUser) {
        found = node.memoizedProps.value.state;
        return;
      }
      walk(node.child, depth + 1);
      walk(node.sibling, depth + 1);
    }
    walk(fiber, 0);

    if (found) {
      const cu = found.currentUser;
      const chat1Msgs = found.messages['chat_1'];
      const lastMsg = chat1Msgs?.[chat1Msgs.length - 1];
      return {
        currentUserId: cu?.userId,
        currentUserName: cu?.displayName,
        lastMsgSenderId: lastMsg?.senderId,
        lastMsgContent: lastMsg?.content?.slice(0, 50),
        lastMsgId: lastMsg?.messageId,
        match: lastMsg?.senderId === cu?.userId,
        totalMsgs: chat1Msgs?.length
      };
    }
    return { error: 'state not found' };
  });
  console.log('Message debug info:', JSON.stringify(msgInfo, null, 2));

  // Now try the context menu on the last message
  const rows = await page.$$('.message-row:not(.system-message)');
  if (rows.length > 0) {
    const lastRow = rows[rows.length - 1];
    await lastRow.hover();
    await new Promise(r => setTimeout(r, 500));

    // Check what msgId the More button will use
    const moreBtn = await page.$('.message-hover-actions button[title="More"]');
    if (moreBtn) {
      // Dispatch click event directly to avoid Playwright's pointer-event check
      await page.evaluate(() => {
        const btn = document.querySelector('.message-hover-actions button[title="More"]');
        if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 300));

      // Check context menu
      const ctxMenu = await page.$('.context-menu');
      console.log('Context menu exists:', !!ctxMenu);
      if (ctxMenu) {
        const items = await page.$$eval('.context-menu-item', els => els.map(e => e.textContent));
        console.log('Menu items:', items);
      } else {
        // Maybe the document click handler killed it
        console.log('Context menu was removed - maybe document click handler');

        // Try again with stopPropagation
        await lastRow.hover();
        await new Promise(r => setTimeout(r, 500));
        await page.evaluate(() => {
          const btn = document.querySelector('.message-hover-actions button[title="More"]');
          if (btn) {
            const event = new MouseEvent('click', { bubbles: true, cancelable: true, clientX: 400, clientY: 400 });
            event.stopPropagation = () => {};
            btn.dispatchEvent(event);
          }
        });
        await new Promise(r => setTimeout(r, 300));
        const ctxMenu2 = await page.$('.context-menu');
        console.log('Context menu 2nd try:', !!ctxMenu2);
        if (ctxMenu2) {
          const items2 = await page.$$eval('.context-menu-item', els => els.map(e => e.textContent));
          console.log('Menu items 2:', items2);
        }
      }
    }
  }

  await browser.close();
})();
