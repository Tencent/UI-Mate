import { chromium } from 'playwright';

const b = await chromium.launch({ headless: true });
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto('http://localhost:5188/care-team');
await p.waitForLoadState('networkidle');

// Scroll down to see provider cards
await p.evaluate(() => window.scrollTo(0, 500));
await p.waitForTimeout(300);

// Check all buttons with their classnames
const allBtns = await p.evaluate(() => {
  const buttons = Array.from(document.querySelectorAll('button'));
  return buttons.map(btn => {
    const rect = btn.getBoundingClientRect();
    return { 
      text: btn.textContent.trim().replace(/\s+/g,' ').substring(0,40), 
      class: btn.className,
      top: Math.round(rect.top)
    };
  });
});

// Find buttons related to Message/Schedule
const relevant = allBtns.filter(b => b.text.includes('Message') || b.text.includes('Schedule'));
console.log('Relevant buttons:', JSON.stringify(relevant, null, 2));

// Try clicking the btn--outline button with Message text (provider card)
const outlineBtn = await p.$('button.btn--outline:has-text("Message")');
if (outlineBtn) {
  await outlineBtn.scrollIntoViewIfNeeded();
  await outlineBtn.click();
  await p.waitForTimeout(600);
  console.log('URL after btn--outline Message click:', p.url());
} else {
  console.log('No btn--outline Message button found');
  
  // Try nth button
  const allMsgBtns = await p.$$('button:has-text("Message")');
  console.log('Total Message buttons found:', allMsgBtns.length);
  for (let i = 0; i < allMsgBtns.length; i++) {
    const txt = await allMsgBtns[i].textContent();
    const cls = await allMsgBtns[i].getAttribute('class');
    console.log(`  btn[${i}]: text="${txt.trim()}" class="${cls}"`);
  }
}
await b.close();
