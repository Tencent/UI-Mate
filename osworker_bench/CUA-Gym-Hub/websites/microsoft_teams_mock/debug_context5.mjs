import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }});
  await page.goto('http://localhost:7789/chat', { waitUntil: 'networkidle', timeout: 15000 });
  await new Promise(r => setTimeout(r, 500));
  const chats = await page.$$('.chat-item');
  if (chats.length > 0) await chats[0].click();
  await new Promise(r => setTimeout(r, 500));

  // Send a msg
  const comp = await page.$('.composer-input');
  await comp.fill('Edit me'); await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 500));

  // Inject logging into the context menu rendering
  const debug = await page.evaluate(() => {
    // Patch the context menu temporarily to log values
    // Find context menu and read state
    const rows = document.querySelectorAll('.message-row:not(.system-message)');
    const lastRow = rows[rows.length - 1];
    const sender = lastRow?.querySelector('.message-sender')?.textContent;
    const content = lastRow?.querySelector('.message-content')?.textContent;

    // Check all message-rows to find the one we just sent
    const allContents = [];
    for (const row of rows) {
      const s = row.querySelector('.message-sender')?.textContent || 'unknown';
      const c = row.querySelector('.message-content')?.textContent?.slice(0, 30) || '';
      allContents.push(`${s}: ${c}`);
    }

    return {
      lastSender: sender,
      lastContent: content,
      allMessages: allContents
    };
  });
  console.log('Debug:', JSON.stringify(debug, null, 2));

  // The context menu compares: messages.find(m => m.messageId === contextMenu.msgId)?.senderId === currentUserId
  // The `messages` prop is `state.messages[activeChatId]`. When a new message is sent, the senderId
  // should be `user_1` (currentUser.userId).

  // The problem might be: `messages` is the prop passed to MessageList, which is `activeMessages`
  // from Chat.jsx line 41: `const activeMessages = activeChatId ? (state.messages[activeChatId] || []) : [];`
  // Since the MessageList renders with the new message (we can see it), the `messages` prop includes it.

  // But the context menu check at line 240 does: messages.find(m => m.messageId === contextMenu.msgId)?.senderId === currentUserId
  // The `messages` variable in the component closure might be stale if:
  // 1. The context menu is rendered after the message list
  // 2. The messages prop changed but the context menu uses stale closure

  // Actually, the context menu rendering is inside the same component, so it uses the latest `messages` prop.
  // Let me check if the issue is that the More button hover actions are showing on the WRONG message row.

  // Let me hover on the last row and check which message's hover actions become visible
  const rows = await page.$$('.message-row:not(.system-message)');
  const lastIdx = rows.length - 1;
  console.log('Hovering on row index:', lastIdx);
  await rows[lastIdx].hover();
  await new Promise(r => setTimeout(r, 500));

  // Get the message-row that has visible hover actions
  const visibleInfo = await page.evaluate(() => {
    const actions = document.querySelectorAll('.message-hover-actions');
    for (const a of actions) {
      const style = window.getComputedStyle(a);
      if (style.opacity !== '0' && style.pointerEvents !== 'none') {
        const row = a.closest('.message-row');
        return {
          sender: row?.querySelector('.message-sender')?.textContent,
          content: row?.querySelector('.message-content')?.textContent?.slice(0, 50),
          opacity: style.opacity,
          pointerEvents: style.pointerEvents
        };
      }
    }
    return { error: 'no visible actions' };
  });
  console.log('Visible hover actions on:', JSON.stringify(visibleInfo));

  // Now click More and examine the context menu state
  await page.evaluate(() => {
    const btns = document.querySelectorAll('.message-hover-actions button[title="More"]');
    for (const btn of btns) {
      const style = window.getComputedStyle(btn.closest('.message-hover-actions'));
      if (style.opacity !== '0') {
        btn.click();
        break;
      }
    }
  });
  await new Promise(r => setTimeout(r, 300));

  const ctxMenuItems = await page.$$eval('.context-menu-item', els => els.map(e => e.textContent));
  console.log('Context menu items:', ctxMenuItems);

  // Check if the context menu's msgId matches the last message
  const ctxDebug = await page.evaluate(() => {
    const ctx = document.querySelector('.context-menu');
    if (!ctx) return { error: 'no context menu' };
    const hasEdit = ctx.querySelector('.context-menu-item')?.textContent?.includes('Edit');

    // Check all the context-menu-items
    const items = [];
    ctx.querySelectorAll('.context-menu-item').forEach(el => items.push(el.textContent));
    return { items, hasEdit };
  });
  console.log('Context debug:', JSON.stringify(ctxDebug));

  await browser.close();
})();
